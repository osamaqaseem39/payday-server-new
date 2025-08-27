const express = require('express');
const InterviewCandidateController = require('../controllers/InterviewCandidateController');
const auth = require('../middleware/auth');

const router = express.Router();
const interviewCandidateController = new InterviewCandidateController();

/**
 * @swagger
 * components:
 *   schemas:
 *     InterviewCandidate:
 *       type: object
 *       required:
 *         - careerApplication
 *       properties:
 *         careerApplication:
 *           type: string
 *           description: Career application ID
 *         currentStage:
 *           type: string
 *           enum: [screening, phone-interview, technical-interview, final-interview, offer, rejected, hired]
 *           default: screening
 *         overallRating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         skillsAssessment:
 *           type: object
 *           properties:
 *             technical:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             communication:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             problemSolving:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             culturalFit:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *         notes:
 *           type: string
 *     Interview:
 *       type: object
 *       required:
 *         - stage
 *         - scheduledAt
 *         - interviewers
 *       properties:
 *         stage:
 *           type: string
 *           enum: [screening, phone-interview, technical-interview, final-interview]
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *         duration:
 *           type: number
 *           default: 60
 *         interviewers:
 *           type: array
 *           items:
 *             type: string
 *         location:
 *           type: string
 *           default: TBD
 *         meetingLink:
 *           type: string
 *     Communication:
 *       type: object
 *       required:
 *         - type
 *         - subject
 *         - content
 *       properties:
 *         type:
 *           type: string
 *           enum: [email, phone, in-person, video]
 *         subject:
 *           type: string
 *         content:
 *           type: string
 *     Offer:
 *       type: object
 *       required:
 *         - salary
 *         - startDate
 *       properties:
 *         salary:
 *           type: number
 *         currency:
 *           type: string
 *           default: USD
 *         startDate:
 *           type: string
 *           format: date
 *         benefits:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/interview-candidates:
 *   post:
 *     summary: Create interview candidate from career application
 *     tags: [Interview Candidates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - careerApplicationId
 *             properties:
 *               careerApplicationId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Interview candidate created successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/', auth.verifyToken, (req, res) => interviewCandidateController.createFromApplication(req, res));

/**
 * @swagger
 * /api/interview-candidates:
 *   get:
 *     summary: Get all interview candidates
 *     tags: [Interview Candidates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of interview candidates
 */
router.get('/', auth.verifyToken, (req, res) => interviewCandidateController.getAllCandidates(req, res));

/**
 * @swagger
 * /api/interview-candidates/statistics:
 *   get:
 *     summary: Get interview candidate statistics
 *     tags: [Interview Candidates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Interview candidate statistics
 */
router.get('/statistics', auth.verifyToken, (req, res) => interviewCandidateController.getCandidateStatistics(req, res));

/**
 * @swagger
 * /api/interview-candidates/follow-up:
 *   get:
 *     summary: Get candidates needing follow-up
 *     tags: [Interview Candidates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of candidates needing follow-up
 */
router.get('/follow-up', auth.verifyToken, (req, res) => interviewCandidateController.getCandidatesNeedingFollowUp(req, res));

/**
 * @swagger
 * /api/interview-candidates/upcoming-interviews:
 *   get:
 *     summary: Get candidates with upcoming interviews
 *     tags: [Interview Candidates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of candidates with upcoming interviews
 */
router.get('/upcoming-interviews', auth.verifyToken, (req, res) => interviewCandidateController.getCandidatesWithUpcomingInterviews(req, res));

/**
 * @swagger
 * /api/interview-candidates/interviewer/{interviewerId}:
 *   get:
 *     summary: Get candidates by interviewer
 *     tags: [Interview Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interviewerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of candidates for interviewer
 */
router.get('/interviewer/:interviewerId', auth.verifyToken, (req, res) => interviewCandidateController.getCandidatesByInterviewer(req, res));

/**
 * @swagger
 * /api/interview-candidates/stage/{stage}:
 *   get:
 *     summary: Get candidates by stage
 *     tags: [Interview Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stage
 *         required: true
 *         schema:
 *           type: string
 *           enum: [screening, phone-interview, technical-interview, final-interview, offer, rejected, hired]
 *     responses:
 *       200:
 *         description: List of candidates in stage
 */
router.get('/stage/:stage', auth.verifyToken, (req, res) => interviewCandidateController.getCandidatesByStage(req, res));

// Move the /:id route to the end, after all specific routes
router.get('/:id', auth.verifyToken, (req, res) => interviewCandidateController.getCandidateById(req, res));

/**
 * @swagger
 * /api/interview-candidates/{id}/schedule-interview:
 *   post:
 *     summary: Schedule interview for candidate
 *     tags: [Interview Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Interview'
 *     responses:
 *       200:
 *         description: Interview scheduled successfully
 *       404:
 *         description: Interview candidate not found
 */
router.post('/:id/schedule-interview', auth.verifyToken, (req, res) => interviewCandidateController.scheduleInterview(req, res));

/**
 * @swagger
 * /api/interview-candidates/{id}/interviews/{interviewIndex}/feedback:
 *   patch:
 *     summary: Update interview feedback
 *     tags: [Interview Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: interviewIndex
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feedback:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Interview feedback updated successfully
 *       404:
 *         description: Interview candidate or interview not found
 */
router.patch('/:id/interviews/:interviewIndex/feedback', auth.verifyToken, (req, res) => interviewCandidateController.updateInterviewFeedback(req, res));

/**
 * @swagger
 * /api/interview-candidates/{id}/stage:
 *   patch:
 *     summary: Update candidate stage
 *     tags: [Interview Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stage
 *             properties:
 *               stage:
 *                 type: string
 *                 enum: [screening, phone-interview, technical-interview, final-interview, offer, rejected, hired]
 *     responses:
 *       200:
 *         description: Candidate stage updated successfully
 */
router.patch('/:id/stage', auth.verifyToken, (req, res) => interviewCandidateController.updateStage(req, res));

/**
 * @swagger
 * /api/interview-candidates/{id}/decision:
 *   post:
 *     summary: Make decision for candidate
 *     tags: [Interview Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - decision
 *             properties:
 *               decision:
 *                 type: string
 *                 enum: [pending, approved, rejected, on-hold]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Decision made successfully
 */
router.post('/:id/decision', auth.verifyToken, (req, res) => interviewCandidateController.makeDecision(req, res));

/**
 * @swagger
 * /api/interview-candidates/{id}/communication:
 *   post:
 *     summary: Add communication record
 *     tags: [Interview Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Communication'
 *     responses:
 *       200:
 *         description: Communication record added successfully
 */
router.post('/:id/communication', auth.verifyToken, (req, res) => interviewCandidateController.addCommunication(req, res));

/**
 * @swagger
 * /api/interview-candidates/{id}/rating:
 *   patch:
 *     summary: Update overall rating
 *     tags: [Interview Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Overall rating updated successfully
 */
router.patch('/:id/rating', auth.verifyToken, (req, res) => interviewCandidateController.updateOverallRating(req, res));

/**
 * @swagger
 * /api/interview-candidates/{id}/skills-assessment:
 *   patch:
 *     summary: Update skills assessment
 *     tags: [Interview Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               technical:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               communication:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               problemSolving:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               culturalFit:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Skills assessment updated successfully
 */
router.patch('/:id/skills-assessment', auth.verifyToken, (req, res) => interviewCandidateController.updateSkillsAssessment(req, res));

/**
 * @swagger
 * /api/interview-candidates/{id}/offer:
 *   post:
 *     summary: Create offer for candidate
 *     tags: [Interview Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Offer'
 *     responses:
 *       200:
 *         description: Offer created successfully
 *       404:
 *         description: Interview candidate not found
 */
router.post('/:id/offer', auth.verifyToken, (req, res) => interviewCandidateController.createOffer(req, res));

/**
 * @swagger
 * /api/interview-candidates/{id}/offer-status:
 *   patch:
 *     summary: Update offer status
 *     tags: [Interview Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, declined, expired]
 *     responses:
 *       200:
 *         description: Offer status updated successfully
 */
router.patch('/:id/offer-status', auth.verifyToken, (req, res) => interviewCandidateController.updateOfferStatus(req, res));

module.exports = router; 