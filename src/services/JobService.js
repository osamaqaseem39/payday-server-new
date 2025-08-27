const JobRepository = require('../repositories/JobRepository');

/**
 * Job Service
 * Single Responsibility: Handle job-related business logic
 */
class JobService {
  constructor() {
    this.jobRepository = new JobRepository();
  }

  /**
   * Create a new job
   */
  async createJob(jobData, userId) {
    // Validate job data
    this.validateJobData(jobData);
    
    // Set the posted by user
    jobData.postedBy = userId;
    
    // Create the job
    const job = await this.jobRepository.create(jobData);
    
    return job;
  }

  /**
   * Get all active jobs
   */
  async getActiveJobs() {
    return await this.jobRepository.findActiveJobs();
  }

  /**
   * Get job by ID
   */
  async getJobById(jobId) {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    return job;
  }

  /**
   * Update job
   */
  async updateJob(jobId, updateData, userId) {
    // Validate update data
    this.validateJobUpdateData(updateData);
    
    // Check if user has permission to update this job
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    if (job.postedBy.toString() !== userId && !this.isAdmin(userId)) {
      throw new Error('Unauthorized to update this job');
    }
    
    // Update the job
    const updatedJob = await this.jobRepository.update(jobId, updateData);
    return updatedJob;
  }

  /**
   * Delete job
   */
  async deleteJob(jobId, userId) {
    // Check if user has permission to delete this job
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    if (job.postedBy.toString() !== userId && !this.isAdmin(userId)) {
      throw new Error('Unauthorized to delete this job');
    }
    
    // Delete the job
    await this.jobRepository.delete(jobId);
    return { message: 'Job deleted successfully' };
  }

  /**
   * Publish job
   */
  async publishJob(jobId, userId) {
    // Check if user has permission to publish this job
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    if (job.postedBy.toString() !== userId && !this.isAdmin(userId)) {
      throw new Error('Unauthorized to publish this job');
    }
    
    // Publish the job
    const publishedJob = await job.publish();
    return publishedJob;
  }

  /**
   * Close job
   */
  async closeJob(jobId, userId) {
    // Check if user has permission to close this job
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    if (job.postedBy.toString() !== userId && !this.isAdmin(userId)) {
      throw new Error('Unauthorized to close this job');
    }
    
    // Close the job
    const closedJob = await job.close();
    return closedJob;
  }

  /**
   * Search jobs
   */
  async searchJobs(searchTerm) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new Error('Search term is required');
    }
    
    return await this.jobRepository.searchJobs(searchTerm.trim());
  }

  /**
   * Get jobs by filters
   */
  async getJobsByFilters(filters) {
    return await this.jobRepository.findJobsByFilters(filters);
  }

  /**
   * Get jobs by department
   */
  async getJobsByDepartment(department) {
    if (!department) {
      throw new Error('Department is required');
    }
    
    return await this.jobRepository.findByDepartment(department);
  }

  /**
   * Get remote jobs
   */
  async getRemoteJobs() {
    return await this.jobRepository.findRemoteJobs();
  }

  /**
   * Get urgent jobs
   */
  async getUrgentJobs() {
    return await this.jobRepository.findUrgentJobs();
  }

  /**
   * Get jobs expiring soon
   */
  async getJobsExpiringSoon(days = 7) {
    return await this.jobRepository.findJobsExpiringSoon(days);
  }

  /**
   * Get job statistics
   */
  async getJobStatistics() {
    return await this.jobRepository.getJobStatistics();
  }

  /**
   * Get jobs by user
   */
  async getJobsByUser(userId) {
    return await this.jobRepository.findJobsByUser(userId);
  }

  /**
   * Update job status
   */
  async updateJobStatus(jobId, status, userId) {
    // Check if user has permission
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    if (job.postedBy.toString() !== userId && !this.isAdmin(userId)) {
      throw new Error('Unauthorized to update job status');
    }
    
    // Validate status
    const validStatuses = ['draft', 'published', 'closed', 'archived'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid job status');
    }
    
    return await this.jobRepository.updateJobStatus(jobId, status);
  }

  /**
   * Validate job data
   */
  validateJobData(jobData) {
    const requiredFields = [
      'title', 'description', 'requirements', 'responsibilities',
      'department', 'location', 'employmentType', 'experienceLevel',
      'salary', 'applicationDeadline'
    ];
    
    for (const field of requiredFields) {
      if (!jobData[field]) {
        throw new Error(`${field} is required`);
      }
    }
    
    // Validate salary
    if (jobData.salary.min > jobData.salary.max) {
      throw new Error('Minimum salary cannot be greater than maximum salary');
    }
    
    // Validate application deadline
    if (new Date(jobData.applicationDeadline) <= new Date()) {
      throw new Error('Application deadline must be in the future');
    }
    
    // Validate requirements and responsibilities arrays
    if (!Array.isArray(jobData.requirements) || jobData.requirements.length === 0) {
      throw new Error('At least one requirement is required');
    }
    
    if (!Array.isArray(jobData.responsibilities) || jobData.responsibilities.length === 0) {
      throw new Error('At least one responsibility is required');
    }
  }

  /**
   * Validate job update data
   */
  validateJobUpdateData(updateData) {
    // Validate salary if provided
    if (updateData.salary) {
      if (updateData.salary.min > updateData.salary.max) {
        throw new Error('Minimum salary cannot be greater than maximum salary');
      }
    }
    
    // Validate application deadline if provided
    if (updateData.applicationDeadline) {
      if (new Date(updateData.applicationDeadline) <= new Date()) {
        throw new Error('Application deadline must be in the future');
      }
    }
  }

  /**
   * Check if user is admin (placeholder - should be implemented based on your auth system)
   */
  isAdmin(userId) {
    // This should be implemented based on your user role system
    // For now, returning false as placeholder
    return false;
  }
}

module.exports = JobService; 