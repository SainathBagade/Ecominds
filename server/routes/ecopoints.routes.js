const express = require('express');
const router = express.Router();
const ecoPointsController = require('../controllers/ecoPointsController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/leaderboard', ecoPointsController.getLeaderboard);

// Protected routes (require authentication)
router.get('/user/:userId', protect, ecoPointsController.getUserPoints);
router.get('/user/:userId/summary', protect, ecoPointsController.getPointsSummary);

// Admin routes - you need to add role-based authorization
router.post('/award', protect, ecoPointsController.awardPoints);

module.exports = router;