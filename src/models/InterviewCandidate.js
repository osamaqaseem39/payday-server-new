const mongoose = require('mongoose');

/**
 * Interview Candidate Schema
 * Single Responsibility: Define interview candidate data structure and validation
 */
const interviewCandidateSchema = new mongoose.Schema({
  // Reference to the original career application
  careerApplication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CareerApplication',
    required: [true, 'Career application reference is required']
  },
  
  // Interview-specific information
  currentStage: {
    type: String,
    enum: ['screening', 'phone-interview', 'technical-interview', 'final-interview', 'offer', 'rejected', 'hired'],
    default: 'screening'
  },
  
  // Interview scheduling
  interviews: [{
    stage: {
      type: String,
      enum: ['screening', 'phone-interview', 'technical-interview', 'final-interview'],
      required: true
    },
    scheduledAt: {
      type: Date,
      required: true
    },
    duration: {
      type: Number, // in minutes
      default: 60
    },
    interviewers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    location: {
      type: String,
      default: 'TBD'
    },
    meetingLink: {
      type: String
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled'
    },
    notes: {
      type: String
    },
    feedback: {
      type: String
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  
  // Overall candidate assessment
  overallRating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  // Skills assessment
  skillsAssessment: {
    technical: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    problemSolving: {
      type: Number,
      min: 1,
      max: 5
    },
    culturalFit: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Decision tracking
  decision: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'on-hold'],
      default: 'pending'
    },
    madeBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    madeAt: {
      type: Date
    },
    notes: {
      type: String
    }
  },
  
  // Offer details (if applicable)
  offer: {
    salary: {
      type: Number
    },
    currency: {
      type: String,
      default: 'USD'
    },
    startDate: {
      type: Date
    },
    benefits: {
      type: [String]
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'expired'],
      default: 'pending'
    },
    validUntil: {
      type: Date
    }
  },
  
  // Communication history
  communications: [{
    type: {
      type: String,
      enum: ['email', 'phone', 'in-person', 'video'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    subject: {
      type: String
    },
    content: {
      type: String
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'replied'],
      default: 'sent'
    }
  }],
  
  // Additional notes and feedback
  notes: {
    type: String
  },
  
  // Timeline tracking
  timeline: [{
    action: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    details: {
      type: String
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
interviewCandidateSchema.index({ careerApplication: 1 });
interviewCandidateSchema.index({ currentStage: 1 });
interviewCandidateSchema.index({ 'decision.status': 1 });
interviewCandidateSchema.index({ 'offer.status': 1 });
interviewCandidateSchema.index({ overallRating: -1 });

// Virtual for candidate status
interviewCandidateSchema.virtual('status').get(function() {
  if (this.decision.status === 'approved' && this.offer.status === 'accepted') {
    return 'hired';
  } else if (this.decision.status === 'rejected') {
    return 'rejected';
  } else if (this.currentStage === 'offer') {
    return 'offer-pending';
  } else {
    return this.currentStage;
  }
});

// Virtual for next interview
interviewCandidateSchema.virtual('nextInterview').get(function() {
  const upcomingInterviews = this.interviews.filter(interview => 
    interview.status === 'scheduled' && interview.scheduledAt > new Date()
  );
  return upcomingInterviews.length > 0 ? upcomingInterviews[0] : null;
});

// Pre-save middleware
interviewCandidateSchema.pre('save', function(next) {
  // Update timeline when stage changes
  if (this.isModified('currentStage')) {
    this.timeline.push({
      action: `Stage changed to ${this.currentStage}`,
      performedBy: this.decision.madeBy || null
    });
  }
  next();
});

// Static method to find candidates by stage
interviewCandidateSchema.statics.findByStage = function(stage) {
  return this.find({ currentStage: stage }).populate({
    path: 'careerApplication',
    populate: {
      path: 'resume',
      select: 'filename path'
    }
  });
};

// Static method to find candidates needing follow-up
interviewCandidateSchema.statics.findNeedingFollowUp = function() {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  return this.find({
    currentStage: { $nin: ['rejected', 'hired'] },
    updatedAt: { $lt: threeDaysAgo }
  }).populate({
    path: 'careerApplication',
    populate: {
      path: 'resume',
      select: 'filename path'
    }
  });
};

// Instance method to schedule interview
interviewCandidateSchema.methods.scheduleInterview = function(interviewData) {
  this.interviews.push(interviewData);
  this.timeline.push({
    action: `Interview scheduled for ${interviewData.stage}`,
    details: `Scheduled for ${interviewData.scheduledAt}`
  });
  return this.save();
};

// Instance method to update stage
interviewCandidateSchema.methods.updateStage = function(newStage, performedBy) {
  this.currentStage = newStage;
  this.timeline.push({
    action: `Stage updated to ${newStage}`,
    performedBy: performedBy
  });
  return this.save();
};

// Instance method to make decision
interviewCandidateSchema.methods.makeDecision = function(decision, performedBy, notes = '') {
  this.decision = {
    status: decision,
    madeBy: performedBy,
    madeAt: new Date(),
    notes: notes
  };
  
  this.timeline.push({
    action: `Decision made: ${decision}`,
    performedBy: performedBy,
    details: notes
  });
  
  return this.save();
};

module.exports = mongoose.model('InterviewCandidate', interviewCandidateSchema); 