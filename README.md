# Payday API - Complete SOLID Architecture

A complete, production-ready API built following SOLID principles and clean architecture patterns for Payday Express.

## 🏗️ Architecture Overview

This project follows **SOLID principles** and **clean architecture** patterns:

### 📁 Project Structure
```
payday/
├── src/
│   ├── config/           # Configuration classes
│   │   └── database.js   # Database connection management
│   ├── models/           # Data models (Single Responsibility)
│   │   ├── User.js
│   │   └── CareerApplication.js
│   ├── repositories/     # Data access layer (Repository Pattern)
│   │   ├── BaseRepository.js
│   │   ├── UserRepository.js
│   │   └── CareerApplicationRepository.js
│   ├── services/         # Business logic layer (Service Pattern)
│   │   ├── UserService.js
│   │   └── CareerApplicationService.js
│   ├── controllers/      # Request/Response handling
│   │   ├── UserController.js
│   │   └── CareerApplicationController.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   └── applications.js
│   ├── middleware/       # Express middleware
│   │   └── auth.js
│   ├── utils/           # Utility functions
│   └── server.js        # Main application entry point
├── vercel.json          # Vercel deployment configuration
├── env.example          # Environment variables example
└── package.json
```

## 🔧 SOLID Principles Implementation

### 1. **Single Responsibility Principle (SRP)**
- Each class has one reason to change
- `DatabaseConfig` - handles only database connections
- `UserService` - handles only user business logic
- `UserRepository` - handles only user data access

### 2. **Open/Closed Principle (OCP)**
- `BaseRepository` is open for extension, closed for modification
- New repositories can extend `BaseRepository` without changing it
- Services can be extended without modifying existing code

### 3. **Liskov Substitution Principle (LSP)**
- `UserRepository` can be used anywhere `BaseRepository` is expected
- All repository implementations follow the same interface

### 4. **Interface Segregation Principle (ISP)**
- Clients depend only on the methods they use
- `BaseRepository` provides only essential CRUD operations
- Specific repositories add domain-specific methods

### 5. **Dependency Inversion Principle (DIP)**
- High-level modules (services) depend on abstractions (repositories)
- Low-level modules (repositories) implement abstractions
- Dependencies are injected, not hardcoded

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
PORT=3000
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Test Health Check
```bash
curl http://localhost:3000/
```

## 🏛️ Design Patterns Used

### Repository Pattern
- Abstracts data access logic
- Makes testing easier with mock repositories
- Provides consistent interface for data operations

### Service Pattern
- Contains business logic
- Orchestrates multiple repositories
- Handles complex operations

### Factory Pattern (in BaseRepository)
- Creates model instances
- Handles common CRUD operations

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Stateless token-based authentication
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Mongoose schema validation
- **Error Handling**: Centralized error management

## 📊 Database Optimization

- **Connection Pooling**: Optimized for serverless environments
- **Indexes**: Strategic database indexing for performance
- **Query Optimization**: Efficient MongoDB queries
- **Connection Management**: Smart connection handling

## 🚀 Vercel Deployment

### 1. Deploy to Vercel
```bash
vercel
```

### 2. Set Environment Variables
In Vercel Dashboard:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret key
- `NODE_ENV`: production

### 3. Configure CORS
The API is pre-configured for:
- `https://paydayexpress.ca`
- `https://www.paydayexpress.ca`
- Vercel preview domains

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3002/
```

Expected Response:
```json
{
  "success": true,
  "status": "healthy",
  "message": "Payday API is running",
  "database": {
    "isConnected": true,
    "state": "connected",
    "database": "payday"
  },
  "server": {
    "uptime": 123.45,
    "environment": "production"
  }
}
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (authenticated)
- `PUT /api/auth/profile` - Update user profile (authenticated)

### Career Applications
- `POST /api/applications` - Submit application (public)
- `GET /api/applications` - List applications (manager/admin)
- `GET /api/applications/:id` - Get application details (manager/admin)
- `PUT /api/applications/:id/status` - Update application status (manager/admin)
- `GET /api/applications/status/:status` - Get applications by status (manager/admin)
- `GET /api/applications/recent` - Get recent applications (manager/admin)
- `GET /api/applications/statistics` - Get application statistics (manager/admin)
- `GET /api/applications/search` - Search applications (manager/admin)
- `DELETE /api/applications/:id` - Delete application (admin only)

### Documentation
- `GET /api-docs` - Swagger API documentation

## 🛠️ Development

### Adding New Models
1. Create model in `src/models/`
2. Create repository in `src/repositories/`
3. Create service in `src/services/`
4. Create controller in `src/controllers/`
5. Create routes in `src/routes/`
6. Add routes in `src/server.js`

### Example: Adding Product Model
```javascript
// src/models/Product.js
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }
});

// src/repositories/ProductRepository.js
class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }
  
  async findByCategory(category) {
    return await this.model.find({ category });
  }
}

// src/services/ProductService.js
class ProductService {
  constructor() {
    this.productRepository = new ProductRepository();
  }
  
  async createProduct(productData) {
    return await this.productRepository.create(productData);
  }
}
```

## 📈 Performance Features

- **Connection Pooling**: Optimized for serverless
- **Query Caching**: Strategic use of MongoDB indexes
- **Error Recovery**: Automatic connection retry
- **Graceful Shutdown**: Proper resource cleanup

## 🔍 Monitoring

- **Health Checks**: Built-in endpoint for monitoring
- **Error Logging**: Comprehensive error tracking
- **Performance Metrics**: Memory and uptime monitoring
- **Database Status**: Real-time connection monitoring

## 🤝 Contributing

1. Follow SOLID principles
2. Add tests for new features
3. Update documentation
4. Use conventional commit messages

## 📄 License

ISC License 