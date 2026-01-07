/**
 * Streak Service
 * Manage user login streaks and rewards
 */

const User = require('../models/User');
const EcoPoints = require('../models/EcoPoints');
const UserBadge = require('../models/UserBadge');
const Badge = require('../models/Badge');
const {
  calculateStreak,
  checkStreakMilestone,
  getStreakStatus,
  getNextStreakMilestone,
  getAllStreakMilestones,
  getStreakRecoveryWindow,
  calculateStreakBonus,
  formatStreak,
  getStreakEncouragement,
} = require('../utils/helpers/streakCalculator');
const { isToday } = require('../utils/helpers/dateHelper');

/**
 * Update user streak on login
 */
const updateLoginStreak = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Skip if already logged in today
  if (user.lastLogin && isToday(user.lastLogin)) {
    return {
      updated: false,
      streak: user.streak,
      message: 'Already logged in today',
    };
  }
  
  // Calculate new streak
  const streakResult = calculateStreak(user.lastLogin, user.streak);
  
  // Update user
  user.streak = streakResult.streak;
  user.lastLogin = new Date();
  await user.save();
  
  // Handle milestone rewards
  if (streakResult.milestone) {
    // Award milestone points
    await EcoPoints.awardPoints(
      userId,
      streakResult.milestone.points,
      'streak_bonus',
      `${streakResult.milestone.badge} - ${streakResult.milestone.days} day streak!`,
      { type: 'Other', id: userId, isBonus: true }
    );
    
    // Try to award streak badge if it exists
    const badge = await Badge.findOne({
      name: streakResult.milestone.badge,
    });
    
    if (badge) {
      await UserBadge.awardBadge(userId, badge._id, 'streak_achievement');
    }
  }
  
  return {
    updated: true,
    streak: streakResult.streak,
    isNewStreak: streakResult.isNewStreak,
    isContinued: streakResult.isContinued,
    streakBroken: streakResult.streakBroken,
    milestone: streakResult.milestone,
    message: streakResult.message,
  };
};

/**
 * Get streak status for user
 */
const getUserStreakStatus = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const status = getStreakStatus(user.streak, user.lastLogin);
  const nextMilestone = getNextStreakMilestone(user.streak);
  const recovery = getStreakRecoveryWindow(user.lastLogin);
  const encouragement = getStreakEncouragement(user.streak);
  
  return {
    currentStreak: user.streak,
    formatted: formatStreak(user.streak),
    status: status.status,
    message: status.message,
    urgency: status.urgency,
    nextMilestone,
    recovery,
    encouragement,
    lastLogin: user.lastLogin,
  };
};

/**
 * Get all streak milestones with user progress
 */
const getStreakMilestones = async (userId) => {
  const user = await User.findById(userId);
  
  const milestones = getAllStreakMilestones(user.streak);
  
  return {
    currentStreak: user.streak,
    milestones,
  };
};

/**
 * Calculate points with streak bonus
 */
const calculatePointsWithStreak = async (userId, basePoints) => {
  const user = await User.findById(userId);
  
  const bonus = calculateStreakBonus(user.streak, basePoints);
  
  return {
    basePoints,
    streakDays: user.streak,
    multiplier: bonus.multiplier,
    bonusPoints: bonus.bonusPoints,
    totalPoints: bonus.totalPoints,
  };
};

/**
 * Get streak leaderboard
 */
const getStreakLeaderboard = async (limit = 20) => {
  const users = await User.find({ streak: { $gt: 0 } })
    .select('name email schoolID grade streak points badges')
    .sort({ streak: -1, points: -1 })
    .limit(limit);
  
  return users.map((user, index) => ({
    rank: index + 1,
    userId: user._id,
    name: user.name,
    schoolID: user.schoolID,
    grade: user.grade,
    streak: user.streak,
    streakFormatted: formatStreak(user.streak),
    points: user.points,
    badges: user.badges?.length || 0,
  }));
};

/**
 * Send streak reminders to users at risk
 */
const sendStreakReminders = async () => {
  // Find users who haven't logged in today but have a streak
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  
  const usersAtRisk = await User.find({
    streak: { $gt: 0 },
    lastLogin: { $lt: todayStart },
  });
  
  const reminders = [];
  
  for (const user of usersAtRisk) {
    const recovery = getStreakRecoveryWindow(user.lastLogin);
    
    // Only send reminder if in grace period and < 6 hours remaining
    if (recovery.inGracePeriod && recovery.hoursRemaining < 6) {
      // Send notification
      // await notificationService.sendStreakReminder(user._id, user.streak);
      
      // Send email
      // await emailService.sendStreakReminderEmail(user);
      
      reminders.push({
        userId: user._id,
        name: user.name,
        email: user.email,
        streak: user.streak,
        hoursRemaining: recovery.hoursRemaining,
      });
    }
  }
  
  return {
    remindersSent: reminders.length,
    reminders,
  };
};

/**
 * Apply streak freeze (premium feature)
 */
const applyStreakFreeze = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Check if user has freezes available
  const freezesAvailable = user.streakFreezes || 0;
  
  if (freezesAvailable <= 0) {
    throw new Error('No streak freezes available');
  }
  
  // Check if eligible (streak >= 7)
  if (user.streak < 7) {
    throw new Error('Minimum 7-day streak required to use freeze');
  }
  
  // Apply freeze (set lastLogin to yesterday)
  user.lastLogin = new Date(Date.now() - 24 * 60 * 60 * 1000);
  user.streakFreezes = freezesAvailable - 1;
  await user.save();
  
  return {
    freezeApplied: true,
    remainingFreezes: user.streakFreezes,
    currentStreak: user.streak,
  };
};

/**
 * Get user's longest streak (historical)
 */
const getLongestStreak = async (userId) => {
  const user = await User.findById(userId);
  
  // If you track historical streaks, get from database
  // For now, return current streak as longest
  return {
    userId,
    longestStreak: user.longestStreak || user.streak,
    currentStreak: user.streak,
  };
};

/**
 * Reset streak (admin only)
 */
const resetStreak = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const oldStreak = user.streak;
  user.streak = 0;
  await user.save();
  
  return {
    userId,
    oldStreak,
    newStreak: 0,
    reset: true,
  };
};

/**
 * Award manual streak (admin only)
 */
const awardStreak = async (userId, days) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  user.streak = days;
  await user.save();
  
  return {
    userId,
    newStreak: days,
  };
};

/**
 * Get streak statistics (global)
 */
const getStreakStatistics = async () => {
  const totalUsers = await User.countDocuments();
  const usersWithStreak = await User.countDocuments({ streak: { $gt: 0 } });
  
  const avgStreak = await User.aggregate([
    { $match: { streak: { $gt: 0 } } },
    { $group: { _id: null, avg: { $avg: '$streak' } } },
  ]);
  
  const longestStreak = await User.find({ streak: { $gt: 0 } })
    .sort({ streak: -1 })
    .limit(1)
    .select('name streak');
  
  return {
    totalUsers,
    usersWithStreak,
    percentageWithStreak: (usersWithStreak / totalUsers) * 100,
    averageStreak: avgStreak[0]?.avg || 0,
    longestStreak: longestStreak[0]?.streak || 0,
    longestStreakUser: longestStreak[0]?.name || null,
  };
};

module.exports = {
  updateLoginStreak,
  getUserStreakStatus,
  getStreakMilestones,
  calculatePointsWithStreak,
  getStreakLeaderboard,
  sendStreakReminders,
  applyStreakFreeze,
  getLongestStreak,
  resetStreak,
  awardStreak,
  getStreakStatistics,
};