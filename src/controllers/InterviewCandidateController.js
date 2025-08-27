const InterviewCandidateService = require('../services/InterviewCandidateService');

/**
 * Interview Candidate Controller
 * Single Responsibility: Handle HTTP requests for interview candidate-related operations
 */
class InterviewCandidateController {
  constructor() {
    this.interviewCandidateService = new InterviewCandidateService();
  }

  /**
   * Create interview candidate from career application
   */
  async createFromApplication(req, res) {
    try {
      const { careerApplicationId } = req.body;
      const userId = req.user.id;

      const candidate = await this.interviewCandidateService.createFromApplication(careerApplicationId, userId);

      res.status(201).json({
        success: true,
        message: 'Interview candidate created successfully',
        data: candidate
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all candidates
   */
  async getAllCandidates(req, res) {
    try {
      const candidates = await this.interviewCandidateService.getAllCandidates();

      res.status(200).json({
        success: true,
        data: candidates
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get candidate by ID
   */
  async getCandidateById(req, res) {
    try {
      const { id } = req.params;
      const candidate = await this.interviewCandidateService.getCandidateById(id);

      res.status(200).json({
        success: true,
        data: candidate
      });
    } catch (error) {
      const statusCode = error.message === 'Interview candidate not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get candidates by stage
   */
  async getCandidatesByStage(req, res) {
    try {
      const { stage } = req.params;
      const candidates = await this.interviewCandidateService.getCandidatesByStage(stage);

      res.status(200).json({
        success: true,
        data: candidates
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get candidates needing follow-up
   */
  async getCandidatesNeedingFollowUp(req, res) {
    try {
      const candidates = await this.interviewCandidateService.getCandidatesNeedingFollowUp();

      res.status(200).json({
        success: true,
        data: candidates
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get candidates with upcoming interviews
   */
  async getCandidatesWithUpcomingInterviews(req, res) {
    try {
      const candidates = await this.interviewCandidateService.getCandidatesWithUpcomingInterviews();

      res.status(200).json({
        success: true,
        data: candidates
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Schedule interview
   */
  async scheduleInterview(req, res) {
    try {
      const { id } = req.params;
      const interviewData = req.body;
      const userId = req.user.id;

      const updatedCandidate = await this.interviewCandidateService.scheduleInterview(id, interviewData, userId);

      res.status(200).json({
        success: true,
        message: 'Interview scheduled successfully',
        data: updatedCandidate
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update interview feedback
   */
  async updateInterviewFeedback(req, res) {
    try {
      const { id, interviewIndex } = req.params;
      const { feedback, rating } = req.body;
      const userId = req.user.id;

      const updatedCandidate = await this.interviewCandidateService.updateInterviewFeedback(
        id, 
        parseInt(interviewIndex), 
        feedback, 
        rating, 
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Interview feedback updated successfully',
        data: updatedCandidate
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update candidate stage
   */
  async updateStage(req, res) {
    try {
      const { id } = req.params;
      const { stage } = req.body;
      const userId = req.user.id;

      const updatedCandidate = await this.interviewCandidateService.updateStage(id, stage, userId);

      res.status(200).json({
        success: true,
        message: 'Candidate stage updated successfully',
        data: updatedCandidate
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Make decision for candidate
   */
  async makeDecision(req, res) {
    try {
      const { id } = req.params;
      const { decision, notes } = req.body;
      const userId = req.user.id;

      const updatedCandidate = await this.interviewCandidateService.makeDecision(id, decision, notes, userId);

      res.status(200).json({
        success: true,
        message: 'Decision made successfully',
        data: updatedCandidate
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Add communication record
   */
  async addCommunication(req, res) {
    try {
      const { id } = req.params;
      const communicationData = req.body;
      const userId = req.user.id;

      const updatedCandidate = await this.interviewCandidateService.addCommunication(id, communicationData, userId);

      res.status(200).json({
        success: true,
        message: 'Communication record added successfully',
        data: updatedCandidate
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update overall rating
   */
  async updateOverallRating(req, res) {
    try {
      const { id } = req.params;
      const { rating } = req.body;
      const userId = req.user.id;

      const updatedCandidate = await this.interviewCandidateService.updateOverallRating(id, rating, userId);

      res.status(200).json({
        success: true,
        message: 'Overall rating updated successfully',
        data: updatedCandidate
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update skills assessment
   */
  async updateSkillsAssessment(req, res) {
    try {
      const { id } = req.params;
      const skillsData = req.body;
      const userId = req.user.id;

      const updatedCandidate = await this.interviewCandidateService.updateSkillsAssessment(id, skillsData, userId);

      res.status(200).json({
        success: true,
        message: 'Skills assessment updated successfully',
        data: updatedCandidate
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Create offer for candidate
   */
  async createOffer(req, res) {
    try {
      const { id } = req.params;
      const offerData = req.body;
      const userId = req.user.id;

      const updatedCandidate = await this.interviewCandidateService.createOffer(id, offerData, userId);

      res.status(200).json({
        success: true,
        message: 'Offer created successfully',
        data: updatedCandidate
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update offer status
   */
  async updateOfferStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.id;

      const updatedCandidate = await this.interviewCandidateService.updateOfferStatus(id, status, userId);

      res.status(200).json({
        success: true,
        message: 'Offer status updated successfully',
        data: updatedCandidate
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get candidate statistics
   */
  async getCandidateStatistics(req, res) {
    try {
      const stats = await this.interviewCandidateService.getCandidateStatistics();

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
   * Get candidates by interviewer
   */
  async getCandidatesByInterviewer(req, res) {
    try {
      const { interviewerId } = req.params;
      const candidates = await this.interviewCandidateService.getCandidatesByInterviewer(interviewerId);

      res.status(200).json({
        success: true,
        data: candidates
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = InterviewCandidateController; 