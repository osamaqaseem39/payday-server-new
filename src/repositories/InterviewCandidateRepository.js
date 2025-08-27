const BaseRepository = require('./BaseRepository');
const InterviewCandidate = require('../models/InterviewCandidate');

/**
 * Interview Candidate Repository
 * Single Responsibility: Handle all interview candidate-related database operations
 */
class InterviewCandidateRepository extends BaseRepository {
  constructor() {
    super(InterviewCandidate);
  }

  /**
   * Find candidates by stage
   */
  async findByStage(stage) {
    return await this.model.findByStage(stage)
      .populate({
        path: 'careerApplication',
        populate: {
          path: 'resume',
          select: 'filename path'
        }
      })
      .populate('decision.madeBy', 'name email')
      .sort({ updatedAt: -1 });
  }

  /**
   * Find candidates needing follow-up
   */
  async findNeedingFollowUp() {
    return await this.model.findNeedingFollowUp()
      .populate({
        path: 'careerApplication',
        populate: {
          path: 'resume',
          select: 'filename path'
        }
      })
      .populate('decision.madeBy', 'name email')
      .sort({ updatedAt: -1 });
  }

  /**
   * Find candidates with upcoming interviews
   */
  async findWithUpcomingInterviews() {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    return await this.model.find({
      'interviews.scheduledAt': {
        $gte: now,
        $lte: nextWeek
      },
      'interviews.status': 'scheduled'
    })
    .populate({
      path: 'careerApplication',
      populate: {
        path: 'resume',
        select: 'filename path'
      }
    })
    .populate('interviews.interviewers', 'name email')
    .sort({ 'interviews.scheduledAt': 1 });
  }

  /**
   * Find candidates by decision status
   */
  async findByDecisionStatus(status) {
    return await this.model.find({ 'decision.status': status })
      .populate({
        path: 'careerApplication',
        populate: {
          path: 'resume',
          select: 'filename path'
        }
      })
      .populate('decision.madeBy', 'name email')
      .sort({ 'decision.madeAt': -1 });
  }

  /**
   * Find candidates by offer status
   */
  async findByOfferStatus(status) {
    return await this.model.find({ 'offer.status': status })
      .populate({
        path: 'careerApplication',
        populate: {
          path: 'resume',
          select: 'filename path'
        }
      })
      .populate('decision.madeBy', 'name email')
      .sort({ updatedAt: -1 });
  }

  /**
   * Find candidates by rating range
   */
  async findByRatingRange(minRating, maxRating) {
    return await this.model.find({
      overallRating: {
        $gte: minRating,
        $lte: maxRating
      }
    })
    .populate({
      path: 'careerApplication',
      populate: {
        path: 'resume',
        select: 'filename path'
      }
    })
    .populate('decision.madeBy', 'name email')
    .sort({ overallRating: -1 });
  }

  /**
   * Find candidates by career application
   */
  async findByCareerApplication(careerApplicationId) {
    return await this.model.findOne({ careerApplication: careerApplicationId })
      .populate({
        path: 'careerApplication',
        populate: {
          path: 'resume',
          select: 'filename path'
        }
      })
      .populate('interviews.interviewers', 'name email')
      .populate('decision.madeBy', 'name email')
      .populate('communications.initiatedBy', 'name email');
  }

  /**
   * Get candidate statistics
   */
  async getCandidateStatistics() {
    const stageStats = await this.model.aggregate([
      {
        $group: {
          _id: '$currentStage',
          count: { $sum: 1 }
        }
      }
    ]);

    const decisionStats = await this.model.aggregate([
      {
        $group: {
          _id: '$decision.status',
          count: { $sum: 1 }
        }
      }
    ]);

    const offerStats = await this.model.aggregate([
      {
        $group: {
          _id: '$offer.status',
          count: { $sum: 1 }
        }
      }
    ]);

    const ratingStats = await this.model.aggregate([
      {
        $match: { overallRating: { $exists: true } }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$overallRating' },
          minRating: { $min: '$overallRating' },
          maxRating: { $max: '$overallRating' }
        }
      }
    ]);

    return {
      byStage: stageStats,
      byDecision: decisionStats,
      byOffer: offerStats,
      ratingStats: ratingStats[0] || null
    };
  }

  /**
   * Schedule interview for candidate
   */
  async scheduleInterview(candidateId, interviewData) {
    const candidate = await this.model.findById(candidateId);
    if (!candidate) {
      throw new Error('Candidate not found');
    }
    
    return await candidate.scheduleInterview(interviewData);
  }

  /**
   * Update candidate stage
   */
  async updateStage(candidateId, newStage, performedBy) {
    const candidate = await this.model.findById(candidateId);
    if (!candidate) {
      throw new Error('Candidate not found');
    }
    
    return await candidate.updateStage(newStage, performedBy);
  }

  /**
   * Make decision for candidate
   */
  async makeDecision(candidateId, decision, performedBy, notes = '') {
    const candidate = await this.model.findById(candidateId);
    if (!candidate) {
      throw new Error('Candidate not found');
    }
    
    return await candidate.makeDecision(decision, performedBy, notes);
  }

  /**
   * Add communication record
   */
  async addCommunication(candidateId, communicationData) {
    return await this.model.findByIdAndUpdate(
      candidateId,
      { $push: { communications: communicationData } },
      { new: true }
    ).populate({
      path: 'careerApplication',
      populate: {
        path: 'resume',
        select: 'filename path'
      }
    });
  }

  /**
   * Update interview feedback
   */
  async updateInterviewFeedback(candidateId, interviewIndex, feedback, rating) {
    const updateData = {};
    if (feedback) updateData[`interviews.${interviewIndex}.feedback`] = feedback;
    if (rating) updateData[`interviews.${interviewIndex}.rating`] = rating;

    return await this.model.findByIdAndUpdate(
      candidateId,
      { $set: updateData },
      { new: true }
    ).populate({
      path: 'careerApplication',
      populate: {
        path: 'resume',
        select: 'filename path'
      }
    });
  }

  /**
   * Find candidates by interviewer
   */
  async findByInterviewer(interviewerId) {
    return await this.model.find({
      'interviews.interviewers': interviewerId
    })
    .populate({
      path: 'careerApplication',
      populate: {
        path: 'resume',
        select: 'filename path'
      }
    })
    .populate('interviews.interviewers', 'name email')
    .sort({ 'interviews.scheduledAt': 1 });
  }
}

module.exports = InterviewCandidateRepository; 