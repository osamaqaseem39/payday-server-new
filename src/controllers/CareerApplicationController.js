const CareerApplicationService = require('../services/CareerApplicationService');

/**
 * Career Application Controller Class
 * Single Responsibility: Handle HTTP requests for career application operations
 */
class CareerApplicationController {
  constructor() {
    this.applicationService = new CareerApplicationService();
  }

  /**
   * Create a new career application
   */
  async createApplication(req, res) {
    try {
      const applicationData = req.body;

      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'position', 'experience'];
      for (const field of requiredFields) {
        if (!applicationData[field]) {
          return res.status(400).json({
            success: false,
            message: `${field} is required`
          });
        }
      }

      const application = await this.applicationService.createApplication(applicationData);

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: application
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  

  /**
   * Get all applications
   */
  async getAllApplications(req, res) {
    try {
      const { page = 1, limit = 10, status, position } = req.query;
      const filters = {};
      
      if (status) filters.status = status;
      if (position) filters.position = { $regex: position, $options: 'i' };

      const options = {
        skip: (page - 1) * limit,
        limit: parseInt(limit),
        sort: { createdAt: -1 }
      };

      const applications = await this.applicationService.getAllApplications(filters, options);

      res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error('❌ Error in getAllApplications:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get application by ID
   */
  async getApplicationById(req, res) {
    try {
      const { id } = req.params;
      const application = await this.applicationService.getApplicationById(id);

      res.status(200).json({
        success: true,
        data: application
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const application = await this.applicationService.updateApplicationStatus(id, status, notes);

      res.status(200).json({
        success: true,
        message: 'Application status updated successfully',
        data: application
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get applications by status
   */
  async getApplicationsByStatus(req, res) {
    try {
      const { status } = req.params;
      const applications = await this.applicationService.getApplicationsByStatus(status);

      res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get recent applications
   */
  async getRecentApplications(req, res) {
    try {
      const { days = 7 } = req.query;
      const applications = await this.applicationService.getRecentApplications(parseInt(days));

      res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get application statistics
   */
  async getApplicationStatistics(req, res) {
    try {
      const statistics = await this.applicationService.getApplicationStatistics();

      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Search applications
   */
  async searchApplications(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required'
        });
      }

      const applications = await this.applicationService.searchApplications(q);

      res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete application
   */
  async deleteApplication(req, res) {
    try {
      const { id } = req.params;
      const result = await this.applicationService.deleteApplication(id);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Test email service
   */
  async testEmailService(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email address is required'
        });
      }

      const result = await this.applicationService.testEmailService(email);
      
      res.status(200).json({
        success: true,
        message: 'Test email sent successfully',
        data: { email, sent: result }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = CareerApplicationController; 