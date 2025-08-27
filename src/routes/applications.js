const express = require('express');
const CareerApplicationController = require('../controllers/CareerApplicationController');
const auth = require('../middleware/auth');

const router = express.Router();
const applicationController = new CareerApplicationController();

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Submit a new career application
 *     tags: [Career Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phone
 *               - position
 *               - experience
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               position:
 *                 type: string
 *               experience:
 *                 type: string
 *                 enum: [entry, mid, senior, expert]
 *               coverLetter:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/', (req, res) => applicationController.createApplication(req, res));

/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: Get all applications (admin/manager only)
 *     tags: [Career Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *         description: Filter by position
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', (req, res, next) => {
  console.log('🔍 Applications route accessed');
  console.log('Headers:', req.headers);
  console.log('Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
  console.log('User agent:', req.headers['user-agent']);
  console.log('Origin:', req.headers.origin);
  
  // Check if user is authenticated
  const token = req.headers.authorization?.split(' ')[1] || 
               req.headers['x-auth-token'] ||
               req.cookies?.token;
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }
  
  console.log('✅ Token found, proceeding to auth middleware');
  next();
}, auth.requireManager, (req, res) => applicationController.getAllApplications(req, res));

/**
 * @swagger
 * /api/applications/status/{status}:
 *   get:
 *     summary: Get applications by status (admin/manager only)
 *     tags: [Career Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *         description: Application status
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/status/:status', auth.requireManager, (req, res) => applicationController.getApplicationsByStatus(req, res));

/**
 * @swagger
 * /api/applications/recent:
 *   get:
 *     summary: Get recent applications (admin/manager only)
 *     tags: [Career Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *         description: Number of days to look back
 *     responses:
 *       200:
 *         description: Recent applications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/recent', auth.requireManager, (req, res) => applicationController.getRecentApplications(req, res));

/**
 * @swagger
 * /api/applications/statistics:
 *   get:
 *     summary: Get application statistics (admin/manager only)
 *     tags: [Career Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/statistics', auth.requireManager, (req, res) => applicationController.getApplicationStatistics(req, res));

/**
 * @swagger
 * /api/applications/search:
 *   get:
 *     summary: Search applications (admin/manager only)
 *     tags: [Career Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       400:
 *         description: Search term required
 *       401:
 *         description: Unauthorized
 */
router.get('/search', auth.requireManager, (req, res) => applicationController.searchApplications(req, res));

/**
 * @swagger
 * /api/applications/{id}:
 *   get:
 *     summary: Get application by ID (admin/manager only)
 *     tags: [Career Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application retrieved successfully
 *       404:
 *         description: Application not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', auth.requireManager, (req, res) => applicationController.getApplicationById(req, res));

/**
 * @swagger
 * /api/applications/{id}/status:
 *   put:
 *     summary: Update application status (admin/manager only)
 *     tags: [Career Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
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
 *                 enum: [pending, reviewed, shortlisted, rejected, hired]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.put('/:id/status', auth.requireManager, (req, res) => applicationController.updateApplicationStatus(req, res));

/**
 * @swagger
 * /api/applications/{id}:
 *   delete:
 *     summary: Delete application (admin only)
 *     tags: [Career Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application deleted successfully
 *       404:
 *         description: Application not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin privileges required
 */
router.delete('/:id', auth.requireAdmin, (req, res) => applicationController.deleteApplication(req, res));

module.exports = router; 