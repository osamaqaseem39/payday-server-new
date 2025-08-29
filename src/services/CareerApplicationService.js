const CareerApplicationRepository = require('../repositories/CareerApplicationRepository');
const EmailService = require('./EmailService');
const InterviewCandidateService = require('./InterviewCandidateService');

/**
 * Career Application Service Class
 * Single Responsibility: Handle career application business logic
 * Dependency Inversion: Depends on abstractions (CareerApplicationRepository)
 */
class CareerApplicationService {
  constructor() {
    this.applicationRepository = new CareerApplicationRepository();
    this.emailService = new EmailService();
    this.interviewCandidateService = new InterviewCandidateService();
  }

  /**
   * Create a new career application
   */
  async createApplication(applicationData) {
    try {
      const application = await this.applicationRepository.create(applicationData);
      
      // Automatically create interview candidate (non-blocking)
      this.interviewCandidateService.createFromApplication(application._id, 'system')
        .then(candidate => {
          console.log('✅ Interview candidate created automatically for application:', application._id);
        })
        .catch(error => {
          console.error('⚠️ Failed to create interview candidate automatically:', error.message);
        });
      
      // Send confirmation email to applicant (non-blocking)
      this.emailService.sendApplicationConfirmation(application)
        .catch(error => console.error('Failed to send confirmation email:', error));
      
      // Send notification email to HR team (non-blocking)
      this.emailService.sendHRNotification(application)
        .catch(error => console.error('Failed to send HR notification:', error));
      
      return application;
    } catch (error) {
      throw new Error(`Failed to create application: ${error.message}`);
    }
  }

  /**
   * Get application by ID
   */
  async getApplicationById(id) {
    try {
      const application = await this.applicationRepository.findById(id);
      if (!application) {
        throw new Error('Application not found');
      }
      return application;
    } catch (error) {
      throw new Error(`Failed to get application: ${error.message}`);
    }
  }

  /**
   * Get all applications with optional filters
   */
  async getAllApplications(filters = {}, options = {}) {
    try {
      console.log('🔍 CareerApplicationService: Getting applications with filters:', filters);
      
      const result = await this.applicationRepository.findAll(filters, options);
      
      console.log('🔍 CareerApplicationService: Found', result ? result.length : 0, 'applications');
      
      return result;
    } catch (error) {
      console.error('❌ Error in CareerApplicationService.getAllApplications:', error);
      throw new Error(`Failed to get applications: ${error.message}`);
    }
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(id, status, notes = '') {
    try {
      const application = await this.applicationRepository.updateStatus(id, status, notes);
      if (!application) {
        throw new Error('Application not found');
      }
      return application;
    } catch (error) {
      throw new Error(`Failed to update application status: ${error.message}`);
    }
  }

  /**
   * Get applications by status
   */
  async getApplicationsByStatus(status) {
    try {
      return await this.applicationRepository.findByStatus(status);
    } catch (error) {
      throw new Error(`Failed to get applications by status: ${error.message}`);
    }
  }

  /**
   * Get recent applications
   */
  async getRecentApplications(days = 7) {
    try {
      return await this.applicationRepository.findRecent(days);
    } catch (error) {
      throw new Error(`Failed to get recent applications: ${error.message}`);
    }
  }

  /**
   * Get applications by position
   */
  async getApplicationsByPosition(position) {
    try {
      return await this.applicationRepository.findByPosition(position);
    } catch (error) {
      throw new Error(`Failed to get applications by position: ${error.message}`);
    }
  }

  /**
   * Get application statistics
   */
  async getApplicationStatistics() {
    try {
      return await this.applicationRepository.getStatistics();
    } catch (error) {
      throw new Error(`Failed to get application statistics: ${error.message}`);
    }
  }

  /**
   * Delete application
   */
  async deleteApplication(id) {
    try {
      const application = await this.applicationRepository.deleteById(id);
      if (!application) {
        throw new Error('Application not found');
      }
      return { message: 'Application deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete application: ${error.message}`);
    }
  }

  /**
   * Search applications
   */
  async searchApplications(searchTerm) {
    try {
      const applications = await this.applicationRepository.findAll({
        $or: [
          { firstName: { $regex: searchTerm, $options: 'i' } },
          { lastName: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { position: { $regex: searchTerm, $options: 'i' } }
        ]
      });
      return applications;
    } catch (error) {
      throw new Error(`Failed to search applications: ${error.message}`);
    }
  }

  /**
   * Test email service
   */
  async testEmailService(email) {
    try {
      return await this.emailService.sendTestEmail(email);
    } catch (error) {
      throw new Error(`Failed to test email service: ${error.message}`);
    }
  }
}

module.exports = CareerApplicationService; 