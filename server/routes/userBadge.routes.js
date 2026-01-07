// server/routes/userBadge.routes.js
const express = require('express');
const router = express.Router();
const userBadgeController = require('../controllers/userBadgeController');
const { authenticate, authorize } = require('../middleware/auth');

// Get badges of a user
router.get('/user/:userId', authenticate, userBadgeController.getUserBadges);

// Award badge to user (Admin/Moderator)
router.post('/award', authenticate, authorize('admin'), userBadgeController.awardBadge);

// Remove badge from user (Admin/Moderator)
router.delete('/user/:userId/:badgeId', authenticate, authorize('admin'), userBadgeController.removeBadge);

// Toggle badge showcase (user can toggle their own badge)
router.patch('/:userBadgeId/showcase', authenticate, userBadgeController.toggleBadgeShowcase);

module.exports = router;
