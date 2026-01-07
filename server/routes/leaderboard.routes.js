// server/routes/leaderboardRoutes.js
const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route   GET /api/leaderboard
// @desc    Get leaderboard rankings
// @access  Private
router.get('/', leaderboardController.getLeaderboard);

// @route   POST /api/leaderboard/update
// @desc    Update leaderboard entry
// @access  Private
router.post('/update', leaderboardController.updateLeaderboard);

// @route   GET /api/leaderboard/competition
// @desc    Get general competition rankings
// @access  Private
router.get('/competition', leaderboardController.getCompetitionRankings);

// @route   GET /api/leaderboard/position
// @desc    Get user's position in all leaderboards
// @access  Private
router.get('/position', leaderboardController.getUserPosition);

// @route   GET /api/leaderboard/top
// @desc    Get top performers
// @access  Private
router.get('/top', leaderboardController.getTopPerformers);

// @route   POST /api/leaderboard/reset/weekly
// @desc    Reset weekly leaderboard (admin/cron)
// @access  Private
router.post('/reset/weekly', leaderboardController.resetWeeklyLeaderboard);

// @route   POST /api/leaderboard/reset/monthly
// @desc    Reset monthly leaderboard (admin/cron)
// @access  Private
router.post('/reset/monthly', leaderboardController.resetMonthlyLeaderboard);

// @route   GET /api/leaderboard/stats
// @desc    Get leaderboard statistics
// @access  Private
router.get('/stats', leaderboardController.getLeaderboardStats);

module.exports = router;