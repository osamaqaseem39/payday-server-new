const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const databaseConfig = require('./config/database');

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
        'https://payday-website.vercel.app',
        'https://payday-website-git-main.vercel.app',
        'https://payday-website-git-develop.vercel.app',
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

    // Pre-flight middleware
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Credentials', true);
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token');
      next();
    });

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Serve static files from public directory
    this.app.use(express.static('public'));

    // Database connection middleware
    this.app.use(async (req, res, next) => {
      try {
        const status = databaseConfig.getStatus();
        
        if (!status.isConnected) {
          console.log('🔍 Database not connected, attempting connection...');
          const connected = await databaseConfig.connect();
          
          if (!connected) {
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
              ? 'https://your-vercel-domain.vercel.app' 
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
        status: dbStatus.isConnected ? 'healthy' : 'unhealthy',
        message: 'Payday API is running',
        database: dbStatus,
        server: serverStatus
      });
    });

    // Serve index.html for root route
    this.app.get('/', (req, res) => {
      res.sendFile('index.html', { root: 'public' });
    });

    // API routes
    this.app.use('/api/auth', require('./routes/auth'));
    this.app.use('/api/applications', require('./routes/applications'));
    this.app.use('/api/jobs', require('./routes/jobs'));
    this.app.use('/api/interview-candidates', require('./routes/interview-candidates'));

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
        process.exit(1);
      }

      // Start server only in development
      if (process.env.NODE_ENV !== 'production') {
        this.server = this.app.listen(this.port, () => {
          console.log(`🚀 Server running on port ${this.port}`);
          console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
          console.log(`🔗 Health check: http://localhost:${this.port}/`);
          console.log(`📚 API Documentation: http://localhost:${this.port}/api-docs`);
        });
      }

      console.log('✅ Application started successfully');
    } catch (error) {
      console.error('❌ Failed to start application:', error);
      process.exit(1);
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

// Create and start the application
const app = new App();

// Handle graceful shutdown
process.on('SIGTERM', () => app.shutdown());
process.on('SIGINT', () => app.shutdown());

// Start the application
app.start();

module.exports = app; 