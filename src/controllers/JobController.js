const JobService = require('../services/JobService');

/**
 * Job Controller
 * Single Responsibility: Handle HTTP requests for job-related operations
 */
class JobController {
  constructor() {
    this.jobService = new JobService();
  }

  /**
   * Create a new job
   */
  async createJob(req, res) {
    try {
      const jobData = req.body;
      const userId = req.user.userId; // Get userId from JWT payload

      const job = await this.jobService.createJob(jobData, userId);

      res.status(201).json({
        success: true,
        message: 'Job created successfully',
        data: job
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all active jobs
   */
  async getActiveJobs(req, res) {
    try {
      const jobs = await this.jobService.getActiveJobs();

      res.status(200).json({
        success: true,
        data: jobs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get job by ID
   */
  async getJobById(req, res) {
    try {
      const { id } = req.params;
      const job = await this.jobService.getJobById(id);

      res.status(200).json({
        success: true,
        data: job
      });
    } catch (error) {
      const statusCode = error.message === 'Job not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update job
   */
  async updateJob(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.userId;

      const updatedJob = await this.jobService.updateJob(id, updateData, userId);

      res.status(200).json({
        success: true,
        message: 'Job updated successfully',
        data: updatedJob
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Unauthorized') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete job
   */
  async deleteJob(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const result = await this.jobService.deleteJob(id, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Unauthorized') ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Publish job
   */
  async publishJob(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const publishedJob = await this.jobService.publishJob(id, userId);

      res.status(200).json({
        success: true,
        message: 'Job published successfully',
        data: publishedJob
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Unauthorized') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Close job
   */
  async closeJob(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const closedJob = await this.jobService.closeJob(id, userId);

      res.status(200).json({
        success: true,
        message: 'Job closed successfully',
        data: closedJob
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Unauthorized') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Search jobs
   */
  async searchJobs(req, res) {
    try {
      const { q } = req.query;
      const jobs = await this.jobService.searchJobs(q);

      res.status(200).json({
        success: true,
        data: jobs
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get jobs by filters
   */
  async getJobsByFilters(req, res) {
    try {
      const filters = req.query;
      const jobs = await this.jobService.getJobsByFilters(filters);

      res.status(200).json({
        success: true,
        data: jobs
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get jobs by department
   */
  async getJobsByDepartment(req, res) {
    try {
      const { department } = req.params;
      const jobs = await this.jobService.getJobsByDepartment(department);

      res.status(200).json({
        success: true,
        data: jobs
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get remote jobs
   */
  async getRemoteJobs(req, res) {
    try {
      const jobs = await this.jobService.getRemoteJobs();

      res.status(200).json({
        success: true,
        data: jobs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get urgent jobs
   */
  async getUrgentJobs(req, res) {
    try {
      const jobs = await this.jobService.getUrgentJobs();

      res.status(200).json({
        success: true,
        data: jobs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get jobs expiring soon
   */
  async getJobsExpiringSoon(req, res) {
    try {
      const { days } = req.query;
      const jobs = await this.jobService.getJobsExpiringSoon(parseInt(days) || 7);

      res.status(200).json({
        success: true,
        data: jobs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get job statistics
   */
  async getJobStatistics(req, res) {
    try {
      const stats = await this.jobService.getJobStatistics();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get jobs by user
   */
  async getJobsByUser(req, res) {
    try {
      const userId = req.user.userId;
      const jobs = await this.jobService.getJobsByUser(userId);

      res.status(200).json({
        success: true,
        data: jobs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update job status
   */
  async updateJobStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.userId;

      const updatedJob = await this.jobService.updateJobStatus(id, status, userId);

      res.status(200).json({
        success: true,
        message: 'Job status updated successfully',
        data: updatedJob
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Unauthorized') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = JobController; 