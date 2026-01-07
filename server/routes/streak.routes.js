// server/routes/streakRoutes.js
const express = require('express');
const router = express.Router();
const streakController = require('../controllers/streakController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route   GET /api/streaks
// @desc    Get user's streak information
// @access  Private
router.get('/', streakController.getStreak);

// @route   POST /api/streaks/update
// @desc    Update user's streak
// @access  Private
router.post('/update', streakController.updateStreak);

// @route   POST /api/streaks/freeze/use
// @desc    Use a streak freeze
// @access  Private
router.post('/freeze/use', streakController.useFreeze);

// @route   POST /api/streaks/freeze/purchase
// @desc    Purchase a streak freeze
// @access  Private
router.post('/freeze/purchase', streakController.purchaseFreeze);

// @route   GET /api/streaks/history
// @desc    Get streak history
// @access  Private
router.get('/history', streakController.getStreakHistory);

// @route   GET /api/streaks/stats
// @desc    Get streak statistics
// @access  Private
router.get('/stats', streakController.getStreakStats);

module.exports = router;