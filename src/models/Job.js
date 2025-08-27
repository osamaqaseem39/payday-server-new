const mongoose = require('mongoose');

/**
 * Job Schema
 * Single Responsibility: Define job posting data structure and validation
 */
const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    maxlength: [5000, 'Job description cannot exceed 5000 characters']
  },
  requirements: {
    type: [String],
    required: [true, 'Job requirements are required'],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one requirement is needed'
    }
  },
  responsibilities: {
    type: [String],
    required: [true, 'Job responsibilities are required'],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one responsibility is needed'
    }
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Job location is required'],
    trim: true
  },
  employmentType: {
    type: String,
    required: [true, 'Employment type is required'],
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance']
  },
  experienceLevel: {
    type: String,
    required: [true, 'Experience level is required'],
    enum: ['entry', 'mid', 'senior', 'expert']
  },
  salary: {
    min: {
      type: Number,
      required: [true, 'Minimum salary is required']
    },
    max: {
      type: Number,
      required: [true, 'Maximum salary is required']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  benefits: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed', 'archived'],
    default: 'draft'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Posted by user is required']
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  numberOfPositions: {
    type: Number,
    default: 1,
    min: [1, 'Number of positions must be at least 1']
  },
  tags: {
    type: [String],
    default: []
  },
  isRemote: {
    type: Boolean,
    default: false
  },
  isUrgent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ department: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ employmentType: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ applicationDeadline: 1 });
jobSchema.index({ isRemote: 1 });
jobSchema.index({ isUrgent: 1 });

// Virtual for job status
jobSchema.virtual('isActive').get(function() {
  return this.status === 'published' && new Date() <= this.applicationDeadline;
});

// Virtual for days until deadline
jobSchema.virtual('daysUntilDeadline').get(function() {
  const now = new Date();
  const deadline = new Date(this.applicationDeadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Pre-save middleware for data validation
jobSchema.pre('save', function(next) {
  if (this.salary.min > this.salary.max) {
    next(new Error('Minimum salary cannot be greater than maximum salary'));
  }
  next();
});

// Static method to find active jobs
jobSchema.statics.findActiveJobs = function() {
  return this.find({
    status: 'published',
    applicationDeadline: { $gte: new Date() }
  });
};

// Static method to find jobs by department
jobSchema.statics.findByDepartment = function(department) {
  return this.find({ department, status: 'published' });
};

// Static method to find remote jobs
jobSchema.statics.findRemoteJobs = function() {
  return this.find({ isRemote: true, status: 'published' });
};

// Instance method to publish job
jobSchema.methods.publish = function() {
  this.status = 'published';
  return this.save();
};

// Instance method to close job
jobSchema.methods.close = function() {
  this.status = 'closed';
  return this.save();
};

module.exports = mongoose.model('Job', jobSchema); 