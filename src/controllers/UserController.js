const UserService = require('../services/UserService');

/**
 * User Controller Class
 * Single Responsibility: Handle HTTP requests for user operations
 */
class UserController {
  constructor() {
    this.userService = new UserService();
  }

  /**
   * Register a new user
   */
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        });
      }

      const userData = { name, email, password, role };
      const user = await this.userService.createUser(userData);

      // Authenticate the user after registration
      const result = await this.userService.authenticateUser(email, password);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Login user
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const result = await this.userService.authenticateUser(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get user profile
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.userId; // From JWT middleware
      const user = await this.userService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.userId; // From JWT middleware
      const updateData = req.body;

      const user = await this.userService.updateUser(userId, updateData);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all active users (admin only)
   */
  async getAllUsers(req, res) {
    try {
      const users = await this.userService.getActiveUsers();

      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = UserController; 