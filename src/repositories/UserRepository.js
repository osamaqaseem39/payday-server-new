const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

/**
 * User Repository Class
 * Single Responsibility: Handle user-specific data operations
 * Liskov Substitution Principle: Can be used in place of BaseRepository
 */
class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    try {
      return await this.model.findOne({ email: email.toLowerCase() });
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  /**
   * Find active users
   */
  async findActiveUsers() {
    try {
      return await this.model.findActiveUsers();
    } catch (error) {
      throw new Error(`Failed to find active users: ${error.message}`);
    }
  }

  /**
   * Find users by role
   */
  async findByRole(role) {
    try {
      return await this.model.find({ role, isActive: true });
    } catch (error) {
      throw new Error(`Failed to find users by role: ${error.message}`);
    }
  }

  /**
   * Update user last login
   */
  async updateLastLogin(userId) {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return await user.updateLastLogin();
    } catch (error) {
      throw new Error(`Failed to update last login: ${error.message}`);
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email) {
    try {
      return await this.model.exists({ email: email.toLowerCase() });
    } catch (error) {
      throw new Error(`Failed to check email existence: ${error.message}`);
    }
  }
}

module.exports = UserRepository; 