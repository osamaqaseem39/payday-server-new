const UserRepository = require('../repositories/UserRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * User Service Class
 * Single Responsibility: Handle user business logic
 * Dependency Inversion: Depends on abstractions (UserRepository)
 */
class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Create a new user
   */
  async createUser(userData) {
    try {
      // Check if email already exists
      const emailExists = await this.userRepository.emailExists(userData.email);
      if (emailExists) {
        throw new Error('Email already exists');
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create user with hashed password
      const user = await this.userRepository.create({
        ...userData,
        password: hashedPassword
      });

      // Return user without password
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Authenticate user login
   */
  async authenticateUser(email, password) {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await this.userRepository.updateLastLogin(user._id);

      // Generate JWT token
      const token = this.generateToken(user);

      // Return user data and token
      const { password: _, ...userWithoutPassword } = user.toObject();
      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id) {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  /**
   * Update user
   */
  async updateUser(id, updateData) {
    try {
      // If updating email, check if it already exists
      if (updateData.email) {
        const emailExists = await this.userRepository.emailExists(updateData.email);
        if (emailExists) {
          const existingUser = await this.userRepository.findByEmail(updateData.email);
          if (existingUser._id.toString() !== id) {
            throw new Error('Email already exists');
          }
        }
      }

      // If updating password, hash it
      if (updateData.password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(updateData.password, saltRounds);
      }

      const user = await this.userRepository.updateById(id, updateData);
      if (!user) {
        throw new Error('User not found');
      }

      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  /**
   * Get all active users
   */
  async getActiveUsers() {
    try {
      const users = await this.userRepository.findActiveUsers();
      return users.map(user => {
        const { password, ...userWithoutPassword } = user.toObject();
        return userWithoutPassword;
      });
    } catch (error) {
      throw new Error(`Failed to get active users: ${error.message}`);
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id) {
    try {
      const user = await this.userRepository.deleteById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Generate JWT token
   */
  generateToken(user) {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '24h'
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      console.log('🔍 UserService - verifyToken called');
      console.log('Token to verify:', token ? token.substring(0, 20) + '...' : 'null');
      
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      console.log('JWT Secret:', secret ? 'Set' : 'Using fallback');
      
      const decoded = jwt.verify(token, secret);
      console.log('✅ Token verified in UserService');
      console.log('Decoded payload:', decoded);
      
      return decoded;
    } catch (error) {
      console.error('❌ Token verification failed in UserService:', error.message);
      throw new Error('Invalid token');
    }
  }
}

module.exports = UserService; 