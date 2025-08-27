const BaseRepository = require('./BaseRepository');
const CareerApplication = require('../models/CareerApplication');

/**
 * Career Application Repository Class
 * Single Responsibility: Handle career application-specific data operations
 * Liskov Substitution Principle: Can be used in place of BaseRepository
 */
class CareerApplicationRepository extends BaseRepository {
  constructor() {
    super(CareerApplication);
  }

  /**
   * Find applications by status
   */
  async findByStatus(status) {
    try {
      return await this.model.findByStatus(status);
    } catch (error) {
      throw new Error(`Failed to find applications by status: ${error.message}`);
    }
  }

  /**
   * Find recent applications
   */
  async findRecent(days = 7) {
    try {
      return await this.model.findRecent(days);
    } catch (error) {
      throw new Error(`Failed to find recent applications: ${error.message}`);
    }
  }

  /**
   * Find applications by position
   */
  async findByPosition(position) {
    try {
      return await this.model.find({ 
        position: { $regex: position, $options: 'i' } 
      });
    } catch (error) {
      throw new Error(`Failed to find applications by position: ${error.message}`);
    }
  }

  /**
   * Update application status
   */
  async updateStatus(id, status, notes = '') {
    try {
      const application = await this.findById(id);
      if (!application) {
        throw new Error('Application not found');
      }
      return await application.updateStatus(status, notes);
    } catch (error) {
      throw new Error(`Failed to update application status: ${error.message}`);
    }
  }

  /**
   * Get application statistics
   */
  async getStatistics() {
    try {
      const stats = await this.model.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const total = await this.count();
      const recent = await this.count({
        appliedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });

      return {
        total,
        recent,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      };
    } catch (error) {
      throw new Error(`Failed to get application statistics: ${error.message}`);
    }
  }

  /**
   * Find applications by email
   */
  async findByEmail(email) {
    try {
      return await this.model.find({ email: email.toLowerCase() });
    } catch (error) {
      throw new Error(`Failed to find applications by email: ${error.message}`);
    }
  }
}

module.exports = CareerApplicationRepository; 