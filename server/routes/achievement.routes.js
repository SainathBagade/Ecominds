const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
// GET /api/achievements - Get all achievements (with optional filters)
router.get('/', achievementController.getAllAchievements);

// GET /api/achievements/stats - Get achievement statistics
router.get('/stats', achievementController.getAchievementStats);

// GET /api/achievements/:achievementId - Get achievement by ID
router.get('/:achievementId', achievementController.getAchievementById);

// Protected routes (require authentication)
// GET /api/achievements/user/:userId - Get user's achievements
router.get('/user/:userId', authenticate, achievementController.getUserAchievements);

// POST /api/achievements/progress - Update achievement progress
router.post('/progress', authenticate, achievementController.updateProgress);

// Admin routes (require authentication and admin role)
// POST /api/achievements - Create new achievement
router.post('/', authenticate, authorize(['admin']), achievementController.createAchievement);

// PUT /api/achievements/:achievementId - Update achievement
router.put('/:achievementId', authenticate, authorize(['admin']), achievementController.updateAchievement);

// DELETE /api/achievements/:achievementId - Delete achievement
router.delete('/:achievementId', authenticate, authorize(['admin']), achievementController.deleteAchievement);

// POST /api/achievements/unlock - Unlock achievement for user
router.post('/unlock', authenticate, authorize(['admin', 'moderator']), achievementController.unlockAchievement);

module.exports = router;