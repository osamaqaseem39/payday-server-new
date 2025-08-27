const express = require('express');
const JobController = require('../controllers/JobController');
const auth = require('../middleware/auth');

const router = express.Router();
const jobController = new JobController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - requirements
 *         - responsibilities
 *         - department
 *         - location
 *         - employmentType
 *         - experienceLevel
 *         - salary
 *         - applicationDeadline
 *       properties:
 *         title:
 *           type: string
 *           description: Job title
 *         description:
 *           type: string
 *           description: Job description
 *         requirements:
 *           type: array
 *           items:
 *             type: string
 *           description: Job requirements
 *         responsibilities:
 *           type: array
 *           items:
 *             type: string
 *           description: Job responsibilities
 *         department:
 *           type: string
 *           description: Department name
 *         location:
 *           type: string
 *           description: Job location
 *         employmentType:
 *           type: string
 *           enum: [full-time, part-time, contract, internship, freelance]
 *           description: Employment type
 *         experienceLevel:
 *           type: string
 *           enum: [entry, mid, senior, expert]
 *           description: Experience level required
 *         salary:
 *           type: object
 *           properties:
 *             min:
 *               type: number
 *               description: Minimum salary
 *             max:
 *               type: number
 *               description: Maximum salary
 *             currency:
 *               type: string
 *               default: USD
 *               description: Salary currency
 *         benefits:
 *           type: array
 *           items:
 *             type: string
 *           description: Job benefits
 *         applicationDeadline:
 *           type: string
 *           format: date
 *           description: Application deadline
 *         numberOfPositions:
 *           type: number
 *           default: 1
 *           description: Number of positions available
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Job tags
 *         isRemote:
 *           type: boolean
 *           default: false
 *           description: Whether job is remote
 *         isUrgent:
 *           type: boolean
 *           default: false
 *           description: Whether job is urgent
 */

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Job'
 *     responses:
 *       201:
 *         description: Job created successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/', auth.verifyToken, (req, res) => jobController.createJob(req, res));

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all active jobs
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of active jobs
 */
router.get('/', (req, res) => jobController.getActiveJobs(req, res));

/**
 * @swagger
 * /api/jobs/search:
 *   get:
 *     summary: Search jobs
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search term
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', (req, res) => jobController.searchJobs(req, res));

/**
 * @swagger
 * /api/jobs/filters:
 *   get:
 *     summary: Get jobs by filters
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: employmentType
 *         schema:
 *           type: string
 *       - in: query
 *         name: experienceLevel
 *         schema:
 *           type: string
 *       - in: query
 *         name: isRemote
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: minSalary
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxSalary
 *         schema:
 *           type: number
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: Filtered jobs
 */
router.get('/filters', (req, res) => jobController.getJobsByFilters(req, res));

/**
 * @swagger
 * /api/jobs/remote:
 *   get:
 *     summary: Get remote jobs
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of remote jobs
 */
router.get('/remote', (req, res) => jobController.getRemoteJobs(req, res));

/**
 * @swagger
 * /api/jobs/urgent:
 *   get:
 *     summary: Get urgent jobs
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of urgent jobs
 */
router.get('/urgent', (req, res) => jobController.getUrgentJobs(req, res));

/**
 * @swagger
 * /api/jobs/expiring:
 *   get:
 *     summary: Get jobs expiring soon
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: number
 *           default: 7
 *         description: Number of days to look ahead
 *     responses:
 *       200:
 *         description: List of jobs expiring soon
 */
router.get('/expiring', (req, res) => jobController.getJobsExpiringSoon(req, res));

/**
 * @swagger
 * /api/jobs/statistics:
 *   get:
 *     summary: Get job statistics
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Job statistics
 */
router.get('/statistics', auth.verifyToken, (req, res) => jobController.getJobStatistics(req, res));

/**
 * @swagger
 * /api/jobs/my-jobs:
 *   get:
 *     summary: Get jobs posted by current user
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's jobs
 */
router.get('/my-jobs', auth.verifyToken, (req, res) => jobController.getJobsByUser(req, res));

/**
 * @swagger
 * /api/jobs/department/{department}:
 *   get:
 *     summary: Get jobs by department
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: department
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of jobs in department
 */
router.get('/department/:department', (req, res) => jobController.getJobsByDepartment(req, res));

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 */
router.get('/:id', (req, res) => jobController.getJobById(req, res));

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Update job
 *     tags: [Jobs]
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
 *             $ref: '#/components/schemas/Job'
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.put('/:id', auth.verifyToken, (req, res) => jobController.updateJob(req, res));

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Delete job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.delete('/:id', auth.verifyToken, (req, res) => jobController.deleteJob(req, res));

/**
 * @swagger
 * /api/jobs/{id}/publish:
 *   post:
 *     summary: Publish job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job published successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.post('/:id/publish', auth.verifyToken, (req, res) => jobController.publishJob(req, res));

/**
 * @swagger
 * /api/jobs/{id}/close:
 *   post:
 *     summary: Close job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job closed successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.post('/:id/close', auth.verifyToken, (req, res) => jobController.closeJob(req, res));

/**
 * @swagger
 * /api/jobs/{id}/status:
 *   patch:
 *     summary: Update job status
 *     tags: [Jobs]
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
 *               status:
 *                 type: string
 *                 enum: [draft, published, closed, archived]
 *     responses:
 *       200:
 *         description: Job status updated successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.patch('/:id/status', auth.verifyToken, (req, res) => jobController.updateJobStatus(req, res));

module.exports = router; 