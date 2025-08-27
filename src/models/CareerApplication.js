const mongoose = require('mongoose');

/**
 * Career Application Schema
 * Single Responsibility: Define career application data structure and validation
 */
const careerApplicationSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true
  },
  experience: {
    type: String,
    required: [true, 'Experience level is required'],
    enum: ['entry', 'mid', 'senior', 'expert']
  },
  resume: {
    filename: String,
    path: String,
    mimetype: String,
    size: Number
  },
  coverLetter: {
    type: String,
    trim: true,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
careerApplicationSchema.index({ email: 1 });
careerApplicationSchema.index({ position: 1 });
careerApplicationSchema.index({ status: 1 });
careerApplicationSchema.index({ appliedAt: -1 });

// Virtual for full name
careerApplicationSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for application age
careerApplicationSchema.virtual('daysSinceApplied').get(function() {
  return Math.floor((Date.now() - this.appliedAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
careerApplicationSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

// Static method to find applications by status
careerApplicationSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Static method to find recent applications
careerApplicationSchema.statics.findRecent = function(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return this.find({ appliedAt: { $gte: date } });
};

// Instance method to update status
careerApplicationSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.status = newStatus;
  if (notes) {
    this.notes = notes;
  }
  return this.save();
};

module.exports = mongoose.model('CareerApplication', careerApplicationSchema); 