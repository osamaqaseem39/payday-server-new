const InterviewCandidateRepository = require('../repositories/InterviewCandidateRepository');
const CareerApplicationRepository = require('../repositories/CareerApplicationRepository');

/**
 * Interview Candidate Service
 * Single Responsibility: Handle interview candidate-related business logic
 */
class InterviewCandidateService {
  constructor() {
    this.interviewCandidateRepository = new InterviewCandidateRepository();
    this.careerApplicationRepository = new CareerApplicationRepository();
  }

  /**
   * Create interview candidate from career application
   */
  async createFromApplication(careerApplicationId, userId) {
    // Check if career application exists
    const application = await this.careerApplicationRepository.findById(careerApplicationId);
    if (!application) {
      throw new Error('Career application not found');
    }

    // Check if candidate already exists
    const existingCandidate = await this.interviewCandidateRepository.findByCareerApplication(careerApplicationId);
    if (existingCandidate) {
      // If candidate already exists, return it instead of throwing error
      console.log('ℹ️ Interview candidate already exists for application:', careerApplicationId);
      return existingCandidate;
    }

    // Create interview candidate
    const candidateData = {
      careerApplication: careerApplicationId,
      currentStage: 'screening',
      timeline: [{
        action: 'Candidate created from application',
        performedBy: userId || 'system',
        details: 'Automatically moved to interview process'
      }]
    };

    const candidate = await this.interviewCandidateRepository.create(candidateData);
    
    // Note: We don't automatically change application status to 'shortlisted' anymore
    // since candidates are created for all applications now
    
    console.log('✅ Interview candidate created for application:', careerApplicationId);
    return candidate;
  }

  /**
   * Get all candidates
   */
  async getAllCandidates() {
    return await this.interviewCandidateRepository.findAll();
  }

  /**
   * Get candidate by ID
   */
  async getCandidateById(candidateId) {
    const candidate = await this.interviewCandidateRepository.findById(candidateId);
    if (!candidate) {
      throw new Error('Interview candidate not found');
    }
    return candidate;
  }

  /**
   * Get candidates by stage
   */
  async getCandidatesByStage(stage) {
    const validStages = ['screening', 'phone-interview', 'technical-interview', 'final-interview', 'offer', 'rejected', 'hired'];
    if (!validStages.includes(stage)) {
      throw new Error('Invalid stage');
    }
    
    return await this.interviewCandidateRepository.findByStage(stage);
  }

  /**
   * Get candidates needing follow-up
   */
  async getCandidatesNeedingFollowUp() {
    return await this.interviewCandidateRepository.findNeedingFollowUp();
  }

  /**
   * Get candidates with upcoming interviews
   */
  async getCandidatesWithUpcomingInterviews() {
    return await this.interviewCandidateRepository.findWithUpcomingInterviews();
  }

  /**
   * Schedule interview
   */
  async scheduleInterview(candidateId, interviewData, userId) {
    // Validate interview data
    this.validateInterviewData(interviewData);
    
    // Check if candidate exists
    const candidate = await this.interviewCandidateRepository.findById(candidateId);
    if (!candidate) {
      throw new Error('Interview candidate not found');
    }

    // Schedule the interview
    const updatedCandidate = await this.interviewCandidateRepository.scheduleInterview(candidateId, {
      ...interviewData,
      status: 'scheduled'
    });

    return updatedCandidate;
  }

  /**
   * Update interview feedback
   */
  async updateInterviewFeedback(candidateId, interviewIndex, feedback, rating, userId) {
    // Validate feedback data
    if (rating && (rating < 1 || rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if candidate exists
    const candidate = await this.interviewCandidateRepository.findById(candidateId);
    if (!candidate) {
      throw new Error('Interview candidate not found');
    }

    // Check if interview exists
    if (!candidate.interviews[interviewIndex]) {
      throw new Error('Interview not found');
    }

    // Update feedback
    const updatedCandidate = await this.interviewCandidateRepository.updateInterviewFeedback(
      candidateId, 
      interviewIndex, 
      feedback, 
      rating
    );

    // Update interview status to completed
    await this.interviewCandidateRepository.update(candidateId, {
      [`interviews.${interviewIndex}.status`]: 'completed'
    });

    return updatedCandidate;
  }

  /**
   * Update candidate stage
   */
  async updateStage(candidateId, newStage, userId) {
    const validStages = ['screening', 'phone-interview', 'technical-interview', 'final-interview', 'offer', 'rejected', 'hired'];
    if (!validStages.includes(newStage)) {
      throw new Error('Invalid stage');
    }

    const updatedCandidate = await this.interviewCandidateRepository.updateStage(candidateId, newStage, userId);
    return updatedCandidate;
  }

  /**
   * Make decision for candidate
   */
  async makeDecision(candidateId, decision, notes, userId) {
    const validDecisions = ['pending', 'approved', 'rejected', 'on-hold'];
    if (!validDecisions.includes(decision)) {
      throw new Error('Invalid decision');
    }

    const updatedCandidate = await this.interviewCandidateRepository.makeDecision(candidateId, decision, userId, notes);
    return updatedCandidate;
  }

  /**
   * Add communication record
   */
  async addCommunication(candidateId, communicationData, userId) {
    // Validate communication data
    this.validateCommunicationData(communicationData);

    const communication = {
      ...communicationData,
      initiatedBy: userId,
      date: new Date()
    };

    const updatedCandidate = await this.interviewCandidateRepository.addCommunication(candidateId, communication);
    return updatedCandidate;
  }

  /**
   * Update overall rating
   */
  async updateOverallRating(candidateId, rating, userId) {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const updateData = {
      overallRating: rating,
      timeline: {
        action: `Overall rating updated to ${rating}`,
        performedBy: userId
      }
    };

    const updatedCandidate = await this.interviewCandidateRepository.update(candidateId, updateData);
    return updatedCandidate;
  }

  /**
   * Update skills assessment
   */
  async updateSkillsAssessment(candidateId, skillsData, userId) {
    // Validate skills data
    this.validateSkillsData(skillsData);

    const updateData = {
      skillsAssessment: skillsData,
      timeline: {
        action: 'Skills assessment updated',
        performedBy: userId
      }
    };

    const updatedCandidate = await this.interviewCandidateRepository.update(candidateId, updateData);
    return updatedCandidate;
  }

  /**
   * Create offer for candidate
   */
  async createOffer(candidateId, offerData, userId) {
    // Validate offer data
    this.validateOfferData(offerData);

    // Check if candidate is in offer stage
    const candidate = await this.interviewCandidateRepository.findById(candidateId);
    if (!candidate) {
      throw new Error('Interview candidate not found');
    }

    if (candidate.currentStage !== 'final-interview') {
      throw new Error('Candidate must be in final interview stage to receive offer');
    }

    const updateData = {
      offer: {
        ...offerData,
        status: 'pending',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      currentStage: 'offer',
      timeline: {
        action: 'Offer created',
        performedBy: userId,
        details: `Offer amount: ${offerData.salary} ${offerData.currency}`
      }
    };

    const updatedCandidate = await this.interviewCandidateRepository.update(candidateId, updateData);
    return updatedCandidate;
  }

  /**
   * Update offer status
   */
  async updateOfferStatus(candidateId, status, userId) {
    const validStatuses = ['pending', 'accepted', 'declined', 'expired'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid offer status');
    }

    const updateData = {
      'offer.status': status,
      timeline: {
        action: `Offer ${status}`,
        performedBy: userId
      }
    };

    if (status === 'accepted') {
      updateData.currentStage = 'hired';
      updateData['decision.status'] = 'approved';
      updateData['decision.madeBy'] = userId;
      updateData['decision.madeAt'] = new Date();
    } else if (status === 'declined') {
      updateData.currentStage = 'rejected';
      updateData['decision.status'] = 'rejected';
      updateData['decision.madeBy'] = userId;
      updateData['decision.madeAt'] = new Date();
    }

    const updatedCandidate = await this.interviewCandidateRepository.update(candidateId, updateData);
    return updatedCandidate;
  }

  /**
   * Get candidate statistics
   */
  async getCandidateStatistics() {
    return await this.interviewCandidateRepository.getCandidateStatistics();
  }

  /**
   * Get candidates by interviewer
   */
  async getCandidatesByInterviewer(interviewerId) {
    return await this.interviewCandidateRepository.findByInterviewer(interviewerId);
  }

  /**
   * Validate interview data
   */
  validateInterviewData(interviewData) {
    const requiredFields = ['stage', 'scheduledAt', 'interviewers'];
    
    for (const field of requiredFields) {
      if (!interviewData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    if (new Date(interviewData.scheduledAt) <= new Date()) {
      throw new Error('Interview must be scheduled in the future');
    }

    if (!Array.isArray(interviewData.interviewers) || interviewData.interviewers.length === 0) {
      throw new Error('At least one interviewer is required');
    }
  }

  /**
   * Validate communication data
   */
  validateCommunicationData(communicationData) {
    const requiredFields = ['type', 'subject', 'content'];
    
    for (const field of requiredFields) {
      if (!communicationData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    const validTypes = ['email', 'phone', 'in-person', 'video'];
    if (!validTypes.includes(communicationData.type)) {
      throw new Error('Invalid communication type');
    }
  }

  /**
   * Validate skills data
   */
  validateSkillsData(skillsData) {
    const skills = ['technical', 'communication', 'problemSolving', 'culturalFit'];
    
    for (const skill of skills) {
      if (skillsData[skill] && (skillsData[skill] < 1 || skillsData[skill] > 5)) {
        throw new Error(`${skill} rating must be between 1 and 5`);
      }
    }
  }

  /**
   * Validate offer data
   */
  validateOfferData(offerData) {
    const requiredFields = ['salary', 'startDate'];
    
    for (const field of requiredFields) {
      if (!offerData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    if (offerData.salary <= 0) {
      throw new Error('Salary must be greater than 0');
    }

    if (new Date(offerData.startDate) <= new Date()) {
      throw new Error('Start date must be in the future');
    }
  }
}

module.exports = InterviewCandidateService; 