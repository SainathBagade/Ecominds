// server/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', notificationController.getNotifications);

// @route   GET /api/notifications/unread-count
// @desc    Get unread notifications count
// @access  Private
router.get('/unread-count', notificationController.getUnreadCount);

// @route   GET /api/notifications/type/:type
// @desc    Get notifications by type
// @access  Private
router.get('/type/:type', notificationController.getNotificationsByType);

// @route   GET /api/notifications/preferences
// @desc    Get notification preferences
// @access  Private
router.get('/preferences', notificationController.getNotificationPreferences);

// @route   PUT /api/notifications/preferences
// @desc    Update notification preferences
// @access  Private
router.put('/preferences', notificationController.updateNotificationPreferences);

// @route   POST /api/notifications
// @desc    Create custom notification
// @access  Private (Admin)
router.post('/', notificationController.createNotification);

// @route   POST /api/notifications/bulk
// @desc    Send bulk notifications
// @access  Private (Admin)
router.post('/bulk', notificationController.sendBulkNotifications);

// @route   PUT /api/notifications/:notificationId/read
// @desc    Mark notification as read
// @access  Private
router.put('/:notificationId/read', notificationController.markAsRead);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', notificationController.markAllAsRead);

// @route   DELETE /api/notifications/:notificationId
// @desc    Delete notification
// @access  Private
router.delete('/:notificationId', notificationController.deleteNotification);

// @route   DELETE /api/notifications/read-all
// @desc    Delete all read notifications
// @access  Private
router.delete('/read-all', notificationController.deleteAllRead);

// @route   POST /api/notifications/cleanup
// @desc    Clean up old notifications
// @access  Private (Admin/Cron)
router.post('/cleanup', notificationController.cleanupOldNotifications);

module.exports = router;