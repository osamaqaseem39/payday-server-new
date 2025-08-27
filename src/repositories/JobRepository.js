const BaseRepository = require('./BaseRepository');
const Job = require('../models/Job');

/**
 * Job Repository
 * Single Responsibility: Handle all job-related database operations
 */
class JobRepository extends BaseRepository {
  constructor() {
    super(Job);
  }

  /**
   * Find all active jobs
   */
  async findActiveJobs() {
    return await this.model.findActiveJobs()
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });
  }

  /**
   * Find jobs by department
   */
  async findByDepartment(department) {
    return await this.model.findByDepartment(department)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });
  }

  /**
   * Find remote jobs
   */
  async findRemoteJobs() {
    return await this.model.findRemoteJobs()
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });
  }

  /**
   * Search jobs by text
   */
  async searchJobs(searchTerm) {
    return await this.model.find({
      $text: { $search: searchTerm },
      status: 'published',
      applicationDeadline: { $gte: new Date() }
    })
    .populate('postedBy', 'name email')
    .sort({ score: { $meta: 'textScore' } });
  }

  /**
   * Find jobs by filters
   */
  async findJobsByFilters(filters) {
    const query = { status: 'published' };
    
    if (filters.department) {
      query.department = filters.department;
    }
    
    if (filters.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }
    
    if (filters.employmentType) {
      query.employmentType = filters.employmentType;
    }
    
    if (filters.experienceLevel) {
      query.experienceLevel = filters.experienceLevel;
    }
    
    if (filters.isRemote !== undefined) {
      query.isRemote = filters.isRemote;
    }
    
    if (filters.minSalary) {
      query['salary.max'] = { $gte: filters.minSalary };
    }
    
    if (filters.maxSalary) {
      query['salary.min'] = { $lte: filters.maxSalary };
    }
    
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    return await this.model.find(query)
      .populate('postedBy', 'name email')
      .sort({ isUrgent: -1, createdAt: -1 });
  }

  /**
   * Find urgent jobs
   */
  async findUrgentJobs() {
    return await this.model.find({
      isUrgent: true,
      status: 'published',
      applicationDeadline: { $gte: new Date() }
    })
    .populate('postedBy', 'name email')
    .sort({ applicationDeadline: 1 });
  }

  /**
   * Find jobs expiring soon
   */
  async findJobsExpiringSoon(days = 7) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    
    return await this.model.find({
      status: 'published',
      applicationDeadline: { 
        $gte: new Date(),
        $lte: deadline 
      }
    })
    .populate('postedBy', 'name email')
    .sort({ applicationDeadline: 1 });
  }

  /**
   * Get job statistics
   */
  async getJobStatistics() {
    const stats = await this.model.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const departmentStats = await this.model.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const remoteStats = await this.model.aggregate([
      {
        $match: { status: 'published' }
      },
      {
        $group: {
          _id: '$isRemote',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      byStatus: stats,
      byDepartment: departmentStats,
      remoteStats: remoteStats
    };
  }

  /**
   * Update job status
   */
  async updateJobStatus(jobId, status) {
    return await this.model.findByIdAndUpdate(
      jobId,
      { status },
      { new: true }
    ).populate('postedBy', 'name email');
  }

  /**
   * Find jobs by user
   */
  async findJobsByUser(userId) {
    return await this.model.find({ postedBy: userId })
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });
  }
}

module.exports = JobRepository; 