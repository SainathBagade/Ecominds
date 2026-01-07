// server/controllers/notificationController.js
const Notification = require('../models/Notification');

// Get user's notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, unreadOnly, category } = req.query;

    const options = {
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true',
      category
    };

    const notifications = await Notification.getUserNotifications(userId, options);
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Get unread notifications count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notifications as read',
      error: error.message
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

// Delete all read notifications
exports.deleteAllRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.deleteMany({
      user: userId,
      isRead: true
    });

    res.json({
      success: true,
      message: 'All read notifications deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting notifications',
      error: error.message
    });
  }
};

// Create custom notification (admin/system)
exports.createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, data, action, priority, category } = req.body;

    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
      action,
      priority,
      category
    });

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
};

// Send bulk notifications (admin only)
exports.sendBulkNotifications = async (req, res) => {
  try {
    const { userIds, type, title, message, data, priority, category } = req.body;

    const notifications = userIds.map(userId => ({
      user: userId,
      type,
      title,
      message,
      data,
      priority,
      category
    }));

    await Notification.insertMany(notifications);

    res.json({
      success: true,
      message: `${notifications.length} notifications sent successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending bulk notifications',
      error: error.message
    });
  }
};

// Get notifications by type
exports.getNotificationsByType = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.params;

    const notifications = await Notification.find({
      user: userId,
      type
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Get notification preferences (placeholder for future)
exports.getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // This would fetch from a NotificationPreferences model
    const preferences = {
      userId,
      email: true,
      push: true,
      inApp: true,
      types: {
        achievement: true,
        mission_complete: true,
        level_up: true,
        streak_milestone: true,
        challenge_invite: true,
        competition_start: true,
        leaderboard_rank: true,
        friend_activity: true,
        system: true,
        reminder: true
      }
    };

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching preferences',
      error: error.message
    });
  }
};

// Update notification preferences
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    // This would update NotificationPreferences model
    res.json({
      success: true,
      data: preferences,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: error.message
    });
  }
};

// Clean up old notifications (cron job)
exports.cleanupOldNotifications = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const result = await Notification.deleteOldNotifications(parseInt(days));

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} old notifications`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cleaning up notifications',
      error: error.message
    });
  }
};

module.exports = exports;