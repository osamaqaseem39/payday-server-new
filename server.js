const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const databaseConfig = require('./src/config/database');

// Load environment variables
dotenv.config();

/**
 * Main Application Class
 * Single Responsibility: Configure and start the Express server
 */
class App {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.initializeMiddleware();
    this.initializeSwagger();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize middleware
   */
  initializeMiddleware() {
    // CORS configuration
    const corsOptions = {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'https://payday-website.vercel.app',
        'https://payday-website-git-main.vercel.app',
        'https://payday-website-git-develop.vercel.app',
        'https://payday-new.vercel.app',
        'https://paydayexpress.ca',
        'https://www.paydayexpress.ca'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'x-auth-token',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Credentials',
        'X-Requested-With'
      ],
      exposedHeaders: [
        'Content-Type',
        'Authorization',
        'x-auth-token'
      ],
      optionsSuccessStatus: 200
    };

    this.app.use(cors(corsOptions));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Serve static files from public directory
    this.app.use(express.static(path.join(__dirname, 'public')));

    // Database connection middleware
    this.app.use(async (req, res, next) => {
      try {
        const status = databaseConfig.getStatus();
        
        if (!status.isConnected) {
          console.log('🔍 Database not connected, attempting connection...');
          const connected = await databaseConfig.connect();
          
          if (!connected) {
            // In serverless or production, continue without database for static files
            if ((process.env.NODE_ENV === 'production' || process.env.VERCEL) && req.path.startsWith('/')) {
              return next();
            }
            
            return res.status(503).json({
              success: false,
              message: 'Database connection not ready',
              error: 'DATABASE_CONNECTION_ERROR',
              status: databaseConfig.getStatus(),
              timestamp: new Date().toISOString()
            });
          }
        }
        
        next();
      } catch (error) {
        console.error('❌ Database middleware error:', error);
        
        // In serverless or production, continue without database for static files
        if ((process.env.NODE_ENV === 'production' || process.env.VERCEL) && req.path.startsWith('/')) {
          return next();
        }
        
        return res.status(503).json({
          success: false,
          message: 'Database connection error',
          error: 'DATABASE_CONNECTION_ERROR',
          timestamp: new Date().toISOString()
        });
      }
    });

    console.log('✅ Middleware initialized');
  }

  /**
   * Initialize Swagger documentation
   */
  initializeSwagger() {
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Payday API',
          version: '1.0.0',
          description: 'Complete SOLID principles-based API for Payday Express',
        },
        servers: [
          {
            url: process.env.NODE_ENV === 'production' 
              ? 'http://localhost:3002' 
              : `http://localhost:${this.port}`,
            description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
      apis: ['./src/routes/*.js'],
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    
    console.log('✅ Swagger documentation initialized');
  }

  /**
   * Initialize routes
   */
  initializeRoutes() {
    // Health check route (JSON API)
    this.app.get('/api/health', (req, res) => {
      const dbStatus = databaseConfig.getStatus();
      const serverStatus = {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        status: dbStatus.isConnected ? 'healthy' : 'partial',
        message: 'Payday API is running',
        database: dbStatus,
        server: serverStatus
      });
    });

    // Test endpoint for authentication
    this.app.get('/api/test-auth', (req, res) => {
      const authHeader = req.headers.authorization;
      res.json({
        success: true,
        message: 'Auth test endpoint',
        hasAuthHeader: !!authHeader,
        authHeader: authHeader ? authHeader.substring(0, 20) + '...' : null,
        timestamp: new Date().toISOString()
      });
    });

    // Simple test endpoint (no auth required)
    this.app.get('/api/test', (req, res) => {
      res.json({
        success: true,
        message: 'Server is working!',
        timestamp: new Date().toISOString(),
        headers: req.headers
      });
    });

    // Serve index.html for root route
    this.app.get('/', (req, res) => {
      res.sendFile('index.html', { root: path.join(__dirname, 'public') });
    });

    // API routes
    this.app.use('/api/auth', require('./src/routes/auth'));
    this.app.use('/api/applications', require('./src/routes/applications'));
    this.app.use('/api/jobs', require('./src/routes/jobs'));
    this.app.use('/api/interview-candidates', require('./src/routes/interview-candidates'));
    this.app.use('/api/admin', require('./src/routes/admin'));

    console.log('✅ Routes initialized');
  }

  /**
   * Initialize error handling
   */
  initializeErrorHandling() {
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        error: 'NOT_FOUND',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    });

    // Global error handler
    this.app.use((error, req, res, next) => {
      console.error('❌ Global error:', error);
      
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.stack : 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      });
    });

    console.log('✅ Error handling initialized');
  }

  /**
   * Start the server
   */
  async start() {
    try {
      // Initialize database connection
      console.log('🔧 Initializing database connection...');
      const dbConnected = await databaseConfig.connect();
      
      if (!dbConnected) {
        console.error('❌ Failed to connect to database');
        // Don't exit in production or serverless, just log the error
        if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
          console.log('⚠️ Continuing without database connection in production/serverless');
        } else {
          process.exit(1);
        }
      }

      // Start server only if not in serverless environment
      if (!process.env.VERCEL) {
        this.server = this.app.listen(this.port, () => {
          console.log(`🚀 Server running on port ${this.port}`);
          console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
          console.log(`🔗 Health check: http://localhost:${this.port}/`);
          console.log(`📚 API Documentation: http://localhost:${this.port}/api-docs`);
        });
      } else {
        console.log('🚀 Serverless environment detected - Express app ready');
      }

      console.log('✅ Application started successfully');
    } catch (error) {
      console.error('❌ Failed to start application:', error);
      // Don't exit in production or serverless, just log the error
      if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
        process.exit(1);
      }
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('🔄 Shutting down gracefully...');
    
    try {
      await databaseConfig.disconnect();
      console.log('✅ Database connection closed');
      
      if (this.server) {
        this.server.close(() => {
          console.log('✅ HTTP server closed');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Create the application instance
const app = new App();

// Handle graceful shutdown 
process.on('SIGTERM', () => app.shutdown());
process.on('SIGINT', () => app.shutdown());

// Start the application if not in serverless environment
if (!process.env.VERCEL) {
  app.start();
}

// Export the Express app for Vercel
module.exports = app.app; 