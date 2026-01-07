// server/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'achievement',
      'mission_complete',
      'level_up',
      'streak_milestone',
      'challenge_invite',
      'competition_start',
      'competition_result',
      'leaderboard_rank',
      'friend_request',
      'friend_activity',
      'system',
      'reminder',
      'reward'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  action: {
    type: {
      type: String,
      enum: ['navigate', 'claim', 'view', 'none'],
      default: 'none'
    },
    url: { type: String },
    buttonText: { type: String }
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  isSent: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  category: {
    type: String,
    enum: ['progress', 'social', 'game', 'system', 'marketing'],
    default: 'progress'
  },
  icon: {
    type: String
  },
  imageUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ type: 1, priority: 1 });

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  return await this.save();
};

// Method to mark as sent
notificationSchema.methods.markAsSent = async function() {
  this.isSent = true;
  this.sentAt = new Date();
  return await this.save();
};

// Static method to create achievement notification
notificationSchema.statics.createAchievement = async function(userId, achievementData) {
  return await this.create({
    user: userId,
    type: 'achievement',
    title: '🏆 Achievement Unlocked!',
    message: `Congratulations! You've earned the "${achievementData.name}" achievement!`,
    data: achievementData,
    action: {
      type: 'view',
      url: '/achievements',
      buttonText: 'View Achievement'
    },
    priority: 'high',
    category: 'progress',
    icon: '🏆'
  });
};

// Static method to create mission complete notification
notificationSchema.statics.createMissionComplete = async function(userId, missionData) {
  return await this.create({
    user: userId,
    type: 'mission_complete',
    title: '✅ Mission Complete!',
    message: `You've completed the mission: ${missionData.title}. Claim your reward!`,
    data: missionData,
    action: {
      type: 'claim',
      url: '/missions',
      buttonText: 'Claim Reward'
    },
    priority: 'normal',
    category: 'progress',
    icon: '✅'
  });
};

// Static method to create level up notification
notificationSchema.statics.createLevelUp = async function(userId, levelData) {
  return await this.create({
    user: userId,
    type: 'level_up',
    title: '⬆️ Level Up!',
    message: `Congratulations! You've reached Level ${levelData.newLevel}!`,
    data: levelData,
    action: {
      type: 'view',
      url: '/profile',
      buttonText: 'View Profile'
    },
    priority: 'high',
    category: 'progress',
    icon: '⬆️'
  });
};

// Static method to create streak milestone notification
notificationSchema.statics.createStreakMilestone = async function(userId, streakData) {
  return await this.create({
    user: userId,
    type: 'streak_milestone',
    title: '🔥 Streak Milestone!',
    message: `Amazing! You've maintained a ${streakData.days}-day streak!`,
    data: streakData,
    action: {
      type: 'view',
      url: '/streaks',
      buttonText: 'View Streak'
    },
    priority: 'high',
    category: 'progress',
    icon: '🔥'
  });
};

// Static method to create challenge invite notification
notificationSchema.statics.createChallengeInvite = async function(userId, challengeData) {
  return await this.create({
    user: userId,
    type: 'challenge_invite',
    title: '⚔️ Challenge Invitation',
    message: `You've been invited to join: ${challengeData.title}`,
    data: challengeData,
    action: {
      type: 'navigate',
      url: `/challenges/${challengeData.id}`,
      buttonText: 'View Challenge'
    },
    priority: 'normal',
    category: 'social',
    icon: '⚔️'
  });
};

// Static method to create competition notification
notificationSchema.statics.createCompetitionStart = async function(userId, competitionData) {
  return await this.create({
    user: userId,
    type: 'competition_start',
    title: '🏁 Competition Starting!',
    message: `The competition "${competitionData.title}" is about to start!`,
    data: competitionData,
    action: {
      type: 'navigate',
      url: `/competitions/${competitionData.id}`,
      buttonText: 'Join Now'
    },
    priority: 'high',
    category: 'game',
    icon: '🏁'
  });
};

// Static method to create reminder notification
notificationSchema.statics.createReminder = async function(userId, reminderData) {
  return await this.create({
    user: userId,
    type: 'reminder',
    title: '⏰ Reminder',
    message: reminderData.message,
    data: reminderData,
    action: {
      type: 'navigate',
      url: reminderData.url || '/dashboard',
      buttonText: 'Start Learning'
    },
    priority: 'normal',
    category: 'system',
    icon: '⏰'
  });
};

// Static method to get user's notifications
notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const { limit = 20, unreadOnly = false, category = null } = options;
  
  const query = { user: userId };
  if (unreadOnly) query.isRead = false;
  if (category) query.category = category;
  
  // Remove expired notifications
  const now = new Date();
  query.$or = [
    { expiresAt: { $exists: false } },
    { expiresAt: null },
    { expiresAt: { $gt: now } }
  ];
  
  return await this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { user: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
};

// Static method to delete old notifications
notificationSchema.statics.deleteOldNotifications = async function(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  });
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    user: userId,
    isRead: false
  });
};

module.exports = mongoose.model('Notification', notificationSchema);