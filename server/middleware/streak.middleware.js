/**
 * Streak Middleware
 * Handles user streak calculations and updates
 */

const User = require('../models/User');
const EcoPoints = require('../models/EcoPoints');
const UserBadge = require('../models/UserBadge');
const { calculateStreak, checkStreakMilestone } = require('../utils/helpers/streakCalculator');
const { isToday } = require('../utils/helpers/dateHelper');
const { asyncHandler } = require('../utils/helpers/errorHandler');

/**
 * Update user streak on login/activity
 * Should be called after authentication
 */
const updateStreak = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next();
  }

  // Skip if already updated today
  if (req.user.lastLogin && isToday(req.user.lastLogin)) {
    return next();
  }

  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    return next();
  }

  // Calculate new streak
  const streakResult = calculateStreak(user.lastLogin, user.streak);

  // Update user
  user.streak = streakResult.streak;
  user.lastLogin = new Date();

  // Save user
  await user.save();

  // Update req.user with new streak
  req.user.streak = streakResult.streak;

  // Award streak milestone points if reached
  if (streakResult.milestone) {
    await EcoPoints.awardPoints(
      userId,
      streakResult.milestone.points,
      'streak_bonus',
      `${streakResult.milestone.badge} - ${streakResult.milestone.days} day streak!`,
      { type: 'Other', id: userId, isBonus: true }
    );

    // Try to award badge (will check if badge exists)
    // Note: This requires badges to be created with matching names
    req.streakMilestone = streakResult.milestone;
  }

  // Attach streak info to request for use in response
  req.streakInfo = {
    streak: streakResult.streak,
    isNewStreak: streakResult.isNewStreak,
    isContinued: streakResult.isContinued,
    streakBroken: streakResult.streakBroken,
    message: streakResult.message,
    milestone: streakResult.milestone,
  };

  next();
});

/**
 * Check streak status without updating
 * Useful for getting current streak info
 */
const checkStreak = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next();
  }

  const user = await User.findById(req.user._id);
  
  if (!user) {
    return next();
  }

  // Calculate current streak status
  const streakResult = calculateStreak(user.lastLogin, user.streak);

  req.currentStreak = {
    streak: user.streak,
    lastLogin: user.lastLogin,
    status: streakResult,
  };

  next();
});

/**
 * Attach streak multiplier to request
 * Use for points calculations
 */
const attachStreakMultiplier = (req, res, next) => {
  if (req.user) {
    const { getStreakMultiplier } = require('../utils/helpers/streakCalculator');
    req.streakMultiplier = getStreakMultiplier(req.user.streak);
  }
  next();
};

/**
 * Award daily login points
 * Should be called once per day
 */
const awardDailyLogin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next();
  }

  // Check if already awarded today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const alreadyAwarded = await EcoPoints.findOne({
    user: req.user._id,
    source: 'daily_login',
    createdAt: { $gte: today },
  });

  if (alreadyAwarded) {
    return next();
  }

  // Award daily login points
  const { calculateDailyLoginPoints } = require('../utils/helpers/pointsCalculator');
  const pointsData = calculateDailyLoginPoints(req.user.streak);

  await EcoPoints.awardPoints(
    req.user._id,
    pointsData.totalPoints,
    'daily_login',
    `Daily login bonus (${req.user.streak} day streak)`,
    { type: 'Other', id: req.user._id, isBonus: true }
  );

  req.dailyLoginPoints = pointsData.totalPoints;

  next();
});

/**
 * Streak protection (freeze)
 * Placeholder for premium feature
 */
const streakFreeze = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next();
  }

  // Check if user has active streak freeze
  const user = await User.findById(req.user._id);
  
  if (user.streakFreeze && user.streakFreeze > 0) {
    req.hasStreakFreeze = true;
    req.streakFreezes = user.streakFreeze;
  }

  next();
});

module.exports = {
  updateStreak,
  checkStreak,
  attachStreakMultiplier,
  awardDailyLogin,
  streakFreeze,
};