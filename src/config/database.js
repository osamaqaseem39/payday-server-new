const mongoose = require('mongoose');

/**
 * Database Configuration Class
 * Single Responsibility: Handle database connection and configuration
 */
class DatabaseConfig {
  constructor() {
    this.isConnected = false;
    this.connectionPromise = null;
  }

  /**
   * Get MongoDB connection options optimized for serverless
   */
  getConnectionOptions() {
    return {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      maxPoolSize: 1,
      minPoolSize: 0,
      bufferCommands: false,
      retryWrites: true,
      w: 'majority',
      connectTimeoutMS: 5000,
      heartbeatFrequencyMS: 1000,
      retryReads: true
    };
  }

  /**
   * Connect to MongoDB with retry logic
   */
  async connect() {
    try {
      const mongoURI = process.env.MONGODB_URI;
      
      if (!mongoURI) {
        console.error('❌ MONGODB_URI environment variable is not set');
        throw new Error('MONGODB_URI environment variable is not set');
      }

      console.log('🔍 MONGODB_URI found:', mongoURI.substring(0, 20) + '...');

      // If already connected, return existing connection
      if (mongoose.connection.readyState === 1) {
        console.log('✅ Already connected to MongoDB');
        return true;
      }

      // If connection is in progress, wait for it
      if (mongoose.connection.readyState === 2) {
        console.log('⏳ Connection in progress, waiting...');
        return this.waitForConnection();
      }

      console.log('🔗 Connecting to MongoDB...');
      
      const options = this.getConnectionOptions();
      console.log('🔧 Connection options:', JSON.stringify(options, null, 2));
      
      await mongoose.connect(mongoURI, options);
      
      this.isConnected = true;
      console.log('✅ MongoDB connected successfully');
      console.log(`📦 Database: ${mongoose.connection.name}`);
      console.log(`🌐 Host: ${mongoose.connection.host}`);
      
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      console.error('❌ Full error:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Wait for existing connection to complete
   */
  async waitForConnection(timeout = 10000) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkConnection = () => {
        if (mongoose.connection.readyState === 1) {
          console.log('✅ Connection established after waiting');
          resolve(true);
        } else if (mongoose.connection.readyState === 0) {
          console.log('❌ Connection failed after waiting');
          resolve(false);
        } else if (Date.now() - startTime > timeout) {
          console.log('⏰ Connection timeout');
          resolve(false);
        } else {
          setTimeout(checkConnection, 100);
        }
      };
      
      checkConnection();
    });
  }

  /**
   * Get connection status
   */
  getStatus() {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    return {
      isConnected: mongoose.connection.readyState === 1,
      state: states[mongoose.connection.readyState] || 'unknown',
      readyState: mongoose.connection.readyState,
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port
    };
  }

  /**
   * Close database connection
   */
  async disconnect() {
    try {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('🔌 MongoDB connection closed');
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error.message);
    }
  }
}

// Create singleton instance
const databaseConfig = new DatabaseConfig();

module.exports = databaseConfig; 