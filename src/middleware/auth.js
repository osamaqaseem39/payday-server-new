const UserService = require('../services/UserService');

/**
 * Authentication Middleware
 * Single Responsibility: Verify JWT tokens and authenticate requests
 */
class AuthMiddleware {
  constructor() {
    this.userService = new UserService();
  }

  /**
   * Verify JWT token middleware
   */
  verifyToken(req, res, next) {
    try {
      console.log('🔍 Auth middleware - verifyToken called');
      console.log('Headers:', req.headers);
      
      const token = req.headers.authorization?.split(' ')[1] || 
                   req.headers['x-auth-token'] ||
                   req.cookies?.token;

      console.log('Token found:', token ? 'Yes' : 'No');
      if (token) {
        console.log('Token length:', token.length);
        console.log('Token preview:', token.substring(0, 20) + '...');
      }

      if (!token) {
        console.log('❌ No token provided in verifyToken');
        return res.status(401).json({
          success: false,
          message: 'Access denied. No token provided.'
        });
      }

      console.log('🔐 Attempting to verify token...');
      const decoded = this.userService.verifyToken(token);
      console.log('✅ Token verified successfully');
      console.log('Decoded user:', decoded);
      
      req.user = decoded;
      next();
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
  }

  /**
   * Check if user is admin middleware
   */
  requireAdmin(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();
  }

  /**
   * Check if user is manager or admin middleware
   */
  requireManager(req, res, next) {
    console.log('🔍 Auth middleware - requireManager called');
    console.log('User from request:', req.user);
    
    if (!req.user) {
      console.log('❌ No user found in requireManager');
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    console.log('User role:', req.user.role);
    if (!['admin', 'manager'].includes(req.user.role)) {
      console.log('❌ User role not authorized:', req.user.role);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Manager or admin privileges required.'
      });
    }

    console.log('✅ User authorized, proceeding');
    next();
  }

  /**
   * Optional authentication middleware
   */
  optionalAuth(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1] || 
                   req.headers['x-auth-token'] ||
                   req.cookies?.token;

      if (token) {
        const decoded = this.userService.verifyToken(token);
        req.user = decoded;
      }
      
      next();
    } catch (error) {
      // Continue without authentication
      next();
    }
  }
}

const authMiddleware = new AuthMiddleware();

module.exports = {
  verifyToken: authMiddleware.verifyToken.bind(authMiddleware),
  requireAdmin: authMiddleware.requireAdmin.bind(authMiddleware),
  requireManager: authMiddleware.requireManager.bind(authMiddleware),
  optionalAuth: authMiddleware.optionalAuth.bind(authMiddleware)
}; 