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
      const token = req.headers.authorization?.split(' ')[1] || 
                   req.headers['x-auth-token'] ||
                   req.cookies?.token;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No token provided.'
        });
      }

      const decoded = this.userService.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
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
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Manager or admin privileges required.'
      });
    }

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