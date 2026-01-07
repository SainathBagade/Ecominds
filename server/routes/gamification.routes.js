// server/routes/gamification.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const gamificationController = require('../controllers/gamificationController');

// ============ EcoPoints Routes ============
// Get user's total points
router.get('/points/total', protect, gamificationController.getTotalPoints);

// Get user's points history
router.get('/points/history', protect, gamificationController.getPointsHistory);

// Get leaderboard
router.get('/leaderboard', protect, gamificationController.getLeaderboard);

// Award points (admin only)
router.post('/points/award', protect, adminOnly, gamificationController.awardPoints);

// ============ Badge Routes ============
// Get all badges
router.get('/badges', protect, gamificationController.getAllBadges);

// Get user's badges
router.get('/badges/user', protect, gamificationController.getUserBadges);

// Get specific badge details
router.get('/badges/:badgeId', protect, gamificationController.getBadgeDetails);

// Create badge (admin only)
router.post('/badges', protect, adminOnly, gamificationController.createBadge);

// Update badge (admin only)
router.put('/badges/:badgeId', protect, adminOnly, gamificationController.updateBadge);

// Delete badge (admin only)
router.delete('/badges/:badgeId', protect, adminOnly, gamificationController.deleteBadge);

// Check and award eligible badges to user
router.post('/badges/check', protect, gamificationController.checkAndAwardBadges);

// Toggle badge showcase
router.patch('/badges/user/:userBadgeId/showcase', protect, gamificationController.toggleBadgeShowcase);

// ============ Achievement Routes ============
// Get all achievements
router.get('/achievements', protect, gamificationController.getAllAchievements);

// Get user's achievements
router.get('/achievements/user', protect, gamificationController.getUserAchievements);

// Get achievement progress
router.get('/achievements/:achievementId/progress', protect, gamificationController.getAchievementProgress);

// Get specific achievement details
router.get('/achievements/:achievementId', protect, gamificationController.getAchievementDetails);

// Create achievement (admin only)
router.post('/achievements', protect, adminOnly, gamificationController.createAchievement);

// Update achievement (admin only)
router.put('/achievements/:achievementId', protect, adminOnly, gamificationController.updateAchievement);

// Delete achievement (admin only)
router.delete('/achievements/:achievementId', protect, adminOnly, gamificationController.deleteAchievement);

// Check and unlock eligible achievements
router.post('/achievements/check', protect, gamificationController.checkAndUnlockAchievements);

// Get user achievement statistics
router.get('/achievements/user/stats', protect, gamificationController.getUserAchievementStats);

// ============ Dashboard Routes ============
// Get gamification overview
router.get('/dashboard', protect, gamificationController.getGamificationDashboard);

module.exports = router;