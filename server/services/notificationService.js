/**
 * Notification Service
 * In-app notifications and alerts
 */

// Note: Create Notification model as needed
// const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Notification types
 */
const NOTIFICATION_TYPES = {
  ACHIEVEMENT: 'achievement',
  BADGE: 'badge',
  LEVEL_UP: 'level_up',
  QUIZ_RESULT: 'quiz_result',
  STREAK: 'streak',
  LEADERBOARD: 'leaderboard',
  MISSION: 'mission',
  SYSTEM: 'system',
};

/**
 * Create notification
 */
const createNotification = async (userId, type, title, message, data = {}) => {
  // const notification = await Notification.create({
  //   user: userId,
  //   type,
  //   title,
  //   message,
  //   data,
  //   read: false,
  //   createdAt: new Date(),
  // });
  
  // // Could emit socket event here for real-time notifications
  // // io.to(userId).emit('notification', notification);
  
  // return notification;
  
  console.log(`📢 Notification for user ${userId}: ${title}`);
  
  return {
    userId,
    type,
    title,
    message,
    data,
    createdAt: new Date(),
  };
};

/**
 * Send achievement unlocked notification
 */
const sendAchievementUnlocked = async (userId, achievement) => {
  return createNotification(
    userId,
    NOTIFICATION_TYPES.ACHIEVEMENT,
    '🏆 Achievement Unlocked!',
    `You've unlocked: ${achievement.title}`,
    {
      achievementId: achievement._id,
      points: achievement.points,
    }
  );
};

/**
 * Send badge earned notification
 */
const sendBadgeEarned = async (userId, badge) => {
  return createNotification(
    userId,
    NOTIFICATION_TYPES.BADGE,
    '🎖️ New Badge Earned!',
    `You've earned: ${badge.name}`,
    {
      badgeId: badge._id,
      points: badge.pointsReward,
    }
  );
};

/**
 * Send level up notification
 */
const sendLevelUp = async (userId, newLevel, title) => {
  return createNotification(
    userId,
    NOTIFICATION_TYPES.LEVEL_UP,
    '🎉 Level Up!',
    `Congratulations! You're now Level ${newLevel} - ${title}`,
    {
      level: newLevel,
      title,
    }
  );
};

/**
 * Send quiz completed notification
 */
const sendQuizCompleted = async (userId, quizTitle, score, passed) => {
  return createNotification(
    userId,
    NOTIFICATION_TYPES.QUIZ_RESULT,
    passed ? '✅ Quiz Passed!' : '📝 Quiz Completed',
    `${quizTitle}: ${score}%`,
    {
      quizTitle,
      score,
      passed,
    }
  );
};

/**
 * Send streak milestone notification
 */
const sendStreakMilestone = async (userId, streakDays, points) => {
  return createNotification(
    userId,
    NOTIFICATION_TYPES.STREAK,
    '🔥 Streak Milestone!',
    `${streakDays} day streak! Earned ${points} bonus points`,
    {
      streakDays,
      points,
    }
  );
};

/**
 * Send streak reminder notification
 */
const sendStreakReminder = async (userId, streakDays) => {
  return createNotification(
    userId,
    NOTIFICATION_TYPES.STREAK,
    '⚠️ Don\'t Break Your Streak!',
    `You're on a ${streakDays} day streak. Login today to keep it going!`,
    {
      streakDays,
    }
  );
};

/**
 * Send leaderboard position notification
 */
const sendLeaderboardPosition = async (userId, position, type = 'global') => {
  return createNotification(
    userId,
    NOTIFICATION_TYPES.LEADERBOARD,
    '🏅 Leaderboard Update',
    `You're now #${position} on the ${type} leaderboard!`,
    {
      position,
      type,
    }
  );
};

/**
 * Send mission verification notification
 */
const sendMissionVerification = async (userId, missionTitle, status) => {
  const isApproved = status === 'approved';
  
  return createNotification(
    userId,
    NOTIFICATION_TYPES.MISSION,
    isApproved ? '✅ Mission Approved!' : '⏳ Mission Under Review',
    isApproved
      ? `Your mission "${missionTitle}" has been approved!`
      : `Your mission "${missionTitle}" is being reviewed`,
    {
      missionTitle,
      status,
    }
  );
};

/**
 * Send system notification
 */
const sendSystemNotification = async (userId, title, message) => {
  return createNotification(userId, NOTIFICATION_TYPES.SYSTEM, title, message);
};

/**
 * Get user notifications
 */
const getUserNotifications = async (userId, limit = 50, unreadOnly = false) => {
  // const query = { user: userId };
  // if (unreadOnly) {
  //   query.read = false;
  // }
  
  // const notifications = await Notification.find(query)
  //   .sort({ createdAt: -1 })
  //   .limit(limit);
  
  // return notifications;
  
  return []; // Placeholder
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId) => {
  // const notification = await Notification.findByIdAndUpdate(
  //   notificationId,
  //   { read: true, readAt: new Date() },
  //   { new: true }
  // );
  
  // return notification;
  
  return { id: notificationId, read: true };
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (userId) => {
  // const result = await Notification.updateMany(
  //   { user: userId, read: false },
  //   { read: true, readAt: new Date() }
  // );
  
  // return result.modifiedCount;
  
  return 0; // Placeholder
};

/**
 * Delete notification
 */
const deleteNotification = async (notificationId) => {
  // await Notification.findByIdAndDelete(notificationId);
  return true;
};

/**
 * Delete all notifications
 */
const deleteAllNotifications = async (userId) => {
  // const result = await Notification.deleteMany({ user: userId });
  // return result.deletedCount;
  
  return 0; // Placeholder
};

/**
 * Get unread count
 */
const getUnreadCount = async (userId) => {
  // const count = await Notification.countDocuments({
  //   user: userId,
  //   read: false,
  // });
  
  // return count;
  
  return 0; // Placeholder
};

/**
 * Send bulk notification (to multiple users)
 */
const sendBulkNotification = async (userIds, type, title, message, data = {}) => {
  // const notifications = await Notification.insertMany(
  //   userIds.map(userId => ({
  //     user: userId,
  //     type,
  //     title,
  //     message,
  //     data,
  //     read: false,
  //     createdAt: new Date(),
  //   }))
  // );
  
  // return notifications;
  
  console.log(`📢 Bulk notification sent to ${userIds.length} users: ${title}`);
  return userIds.length;
};

/**
 * Send notification to all users
 */
const sendToAllUsers = async (type, title, message, data = {}) => {
  // const users = await User.find({}).select('_id');
  // const userIds = users.map(u => u._id);
  
  // return sendBulkNotification(userIds, type, title, message, data);
  
  console.log(`📢 System-wide notification: ${title}`);
  return 0; // Placeholder
};

/**
 * Schedule notification (for future implementation)
 */
const scheduleNotification = async (userId, type, title, message, scheduledFor, data = {}) => {
  // Could use a job queue like Bull or Agenda
  // await notificationQueue.add({
  //   userId,
  //   type,
  //   title,
  //   message,
  //   data,
  // }, {
  //   delay: scheduledFor.getTime() - Date.now(),
  // });
  
  console.log(`⏰ Notification scheduled for ${scheduledFor}: ${title}`);
  
  return {
    userId,
    title,
    scheduledFor,
  };
};

module.exports = {
  NOTIFICATION_TYPES,
  createNotification,
  sendAchievementUnlocked,
  sendBadgeEarned,
  sendLevelUp,
  sendQuizCompleted,
  sendStreakMilestone,
  sendStreakReminder,
  sendLeaderboardPosition,
  sendMissionVerification,
  sendSystemNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  sendBulkNotification,
  sendToAllUsers,
  scheduleNotification,
};