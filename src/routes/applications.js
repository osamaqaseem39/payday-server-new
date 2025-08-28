const express = require('express');
const CareerApplicationController = require('../controllers/CareerApplicationController');
const auth = require('../middleware/auth');
const databaseConfig = require('../config/database');

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
 * /api/applications/test:
 *   get:
 *     summary: Test endpoint to debug database issues
 *     tags: [Career Applications]
 *     responses:
 *       200:
 *         description: Test results
 */
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Test endpoint called');
    
    // Check database connection
    const dbStatus = databaseConfig.getStatus();
    console.log('🧪 Database status:', dbStatus);
    
    // Check collections
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('🧪 Available collections:', collections.map(c => c.name));
    
    // Check careerapplications collection directly
    const careerApplicationsCollection = db.collection('careerapplications');
    const count = await careerApplicationsCollection.countDocuments();
    console.log('🧪 Direct collection count:', count);
    
    // Get all documents directly from collection
    const allDocs = await careerApplicationsCollection.find({}).toArray();
    console.log('🧪 Direct collection documents:', allDocs.length);
    
    // Test the model
    const CareerApplication = require('../models/CareerApplication');
    console.log('🧪 Model name:', CareerApplication.modelName);
    console.log('🧪 Model collection name:', CareerApplication.collection.name);
    
    // Test model query
    const modelQuery = await CareerApplication.find({});
    console.log('🧪 Model query result:', modelQuery.length);
    
    res.json({
      success: true,
      debug: {
        databaseStatus: dbStatus,
        collections: collections.map(c => c.name),
        directCollectionCount: count,
        directCollectionDocs: allDocs.length,
        modelName: CareerApplication.modelName,
        modelCollectionName: CareerApplication.collection.name,
        modelQueryResult: modelQuery.length
      }
    });
    
  } catch (error) {
    console.error('🧪 Test endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

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
router.get('/', auth.verifyToken, auth.requireManager, async (req, res, next) => {
  try {
    // Check database connection
    const dbStatus = databaseConfig.getStatus();
    console.log('🔍 Database status:', dbStatus);
    
    if (!dbStatus.isConnected) {
      console.log('❌ Database not connected, attempting connection...');
      const connected = await databaseConfig.connect();
      if (!connected) {
        return res.status(503).json({
          success: false,
          message: 'Database connection not available'
        });
      }
    }
    
    // Check if the collection exists and has data
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('🔍 Available collections:', collections.map(c => c.name));
    
    // Check the careerapplications collection specifically
    const careerApplicationsCollection = db.collection('careerapplications');
    const count = await careerApplicationsCollection.countDocuments();
    console.log('🔍 CareerApplications collection count:', count);
    
    // Get a sample document
    if (count > 0) {
      const sample = await careerApplicationsCollection.findOne();
      console.log('🔍 Sample document:', {
        id: sample._id,
        firstName: sample.firstName,
        lastName: sample.lastName,
        position: sample.position
      });
    }
    
    next();
  } catch (error) {
    console.error('❌ Database check error:', error);
    return res.status(503).json({
      success: false,
      message: 'Database check failed',
      error: error.message
    });
  }
}, (req, res) => applicationController.getAllApplications(req, res));

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
router.get('/status/:status', auth.verifyToken, auth.requireManager, (req, res) => applicationController.getApplicationsByStatus(req, res));

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
router.get('/recent', auth.verifyToken, auth.requireManager, (req, res) => applicationController.getRecentApplications(req, res));

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
router.get('/statistics', auth.verifyToken, auth.requireManager, (req, res) => applicationController.getApplicationStatistics(req, res));

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
router.get('/search', auth.verifyToken, auth.requireManager, (req, res) => applicationController.searchApplications(req, res));

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
router.get('/:id', auth.verifyToken, auth.requireManager, (req, res) => applicationController.getApplicationById(req, res));

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
router.put('/:id/status', auth.verifyToken, auth.requireManager, (req, res) => applicationController.updateApplicationStatus(req, res));

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
router.delete('/:id', auth.verifyToken, auth.requireAdmin, (req, res) => applicationController.deleteApplication(req, res));

/**
 * @swagger
 * /api/applications/test-email:
 *   post:
 *     summary: Test email service
 *     tags: [Career Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address to send test email to
 *     responses:
 *       200:
 *         description: Test email sent successfully
 *       400:
 *         description: Email address required
 */
router.post('/test-email', (req, res) => applicationController.testEmailService(req, res));

module.exports = router; 