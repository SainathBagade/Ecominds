

// server/routes/badges.routes.js
const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const { authenticate, authorize } = require('../middleware/auth');

// ============ Public Routes ============
// GET /api/badges - Get all active badges (public can view)
router.get('/', badgeController.getAllBadges);

// GET /api/badges/:badgeId - Get specific badge details
router.get('/:badgeId', badgeController.getBadgeDetails);

// ============ Protected Routes (Authenticated Users) ============
// GET /api/badges/user/me - Get current user's badges
router.get('/user/me', authenticate, badgeController.getMyBadges);

// GET /api/badges/user/:userId - Get specific user's badges
router.get('/user/:userId', authenticate, badgeController.getUserBadges);

// POST /api/badges/check - Check and award eligible badges to current user
router.post('/check', authenticate, badgeController.checkAndAwardBadges);

// PATCH /api/badges/user/:userBadgeId/showcase - Toggle badge showcase
router.patch('/user/:userBadgeId/showcase', authenticate, badgeController.toggleBadgeShowcase);

// GET /api/badges/user/me/progress - Get progress towards unearned badges
router.get('/user/me/progress', authenticate, badgeController.getBadgeProgress);

// ============ Admin Routes ============
// POST /api/badges - Create new badge
router.post('/', authenticate, authorize('admin'), badgeController.createBadge);

// PUT /api/badges/:badgeId - Update badge
router.put('/:badgeId', authenticate, authorize(['admin']), badgeController.updateBadge);

// DELETE /api/badges/:badgeId - Delete badge
router.delete('/:badgeId', authenticate, authorize(['admin']), badgeController.deleteBadge);

// POST /api/badges/:badgeId/award/:userId - Manually award badge to user
router.post('/:badgeId/award/:userId', authenticate, authorize(['admin', 'moderator']), badgeController.manuallyAwardBadge);

// GET /api/badges/stats/overview - Get badge statistics
router.get('/stats/overview', authenticate, authorize(['admin']), badgeController.getBadgeStats);

module.exports = router;