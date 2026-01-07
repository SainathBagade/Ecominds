/**
 * Gamification Service
 * Centralized service for all gamification features
 */

const User = require('../models/User');
const EcoPoints = require('../models/EcoPoints');
const UserBadge = require('../models/UserBadge');
const Badge = require('../models/Badge');
const UserAchievement = require('../models/UserAchievement');
const { calculateQuizPoints, calculateLessonPoints } = require('../utils/helpers/pointsCalculator');
const { getLevelInfo, checkLevelUp } = require('../utils/helpers/levelCalculator');
const { calculateStreak } = require('../utils/helpers/streakCalculator');

/**
 * Award points to user
 */
const awardPoints = async (userId, amount, source, description, referenceData = {}) => {
  const oldUser = await User.findById(userId);
  
  // Award points
  const pointsRecord = await EcoPoints.awardPoints(userId, amount, source, description, referenceData);
  
  // Get updated user
  const user = await User.findById(userId);
  
  // Check for level up
  const levelUpInfo = checkLevelUp(oldUser.points, user.points);
  
  // Check for new badges/achievements
  await checkAndAwardRewards(userId);
  
  return {
    pointsRecord,
    totalPoints: user.points,
    levelUp: levelUpInfo.leveledUp ? {
      oldLevel: levelUpInfo.oldLevel,
      newLevel: levelUpInfo.newLevel,
      title: levelUpInfo.newTitle,
    } : null,
  };
};

/**
 * Process quiz completion rewards
 */
const processQuizRewards = async (userId, quizId, submission) => {
  const user = await User.findById(userId);
  
  // Calculate points with bonuses
  const pointsData = calculateQuizPoints(submission.score, {
    isPerfectScore: submission.percentage === 100,
    isFirstAttempt: submission.attemptNumber === 1,
    timeTaken: submission.timeTaken,
    timeLimit: submission.quiz?.timeLimit,
    streakDays: user.streak,
  });
  
  // Award points
  await awardPoints(
    userId,
    pointsData.totalPoints,
    'quiz_completion',
    `Completed quiz${submission.isPassed ? ' (Passed)' : ''}`,
    { type: 'Quiz', id: quizId }
  );
  
  return pointsData;
};

/**
 * Process lesson completion rewards
 */
const processLessonRewards = async (userId, lessonId) => {
  const user = await User.findById(userId);
  
  const pointsData = calculateLessonPoints(user.streak);
  
  await awardPoints(
    userId,
    pointsData.totalPoints,
    'lesson_completion',
    'Completed lesson',
    { type: 'Lesson', id: lessonId }
  );
  
  return pointsData;
};

/**
 * Check and award badges/achievements
 */
const checkAndAwardRewards = async (userId) => {
  // Check badges
  const newBadges = await UserBadge.checkAndAwardBadges(userId);
  
  // Check achievements
  const newAchievements = await UserAchievement.checkAndUnlockAchievements(userId);
  
  return {
    badges: newBadges,
    achievements: newAchievements,
  };
};

/**
 * Update user streak
 */
const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  
  const streakResult = calculateStreak(user.lastLogin, user.streak);
  
  // Update user
  user.streak = streakResult.streak;
  user.lastLogin = new Date();
  await user.save();
  
  // Award milestone points if reached
  if (streakResult.milestone) {
    await awardPoints(
      userId,
      streakResult.milestone.points,
      'streak_bonus',
      `${streakResult.milestone.badge} milestone`,
      { isBonus: true }
    );
  }
  
  return streakResult;
};

/**
 * Get user's gamification profile
 */
const getUserGamificationProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  const levelInfo = getLevelInfo(user.points);
  const badges = await UserBadge.getUserBadges(userId);
  const achievements = await UserAchievement.getUserAchievements(userId, true);
  
  return {
    user: {
      id: user._id,
      name: user.name,
      points: user.points,
      streak: user.streak,
    },
    level: levelInfo,
    badges: badges.length,
    badgeList: badges.map(b => ({
      name: b.badge.name,
      rarity: b.badge.rarity,
      earnedAt: b.earnedAt,
    })),
    achievements: achievements.length,
    achievementList: achievements.map(a => ({
      title: a.achievement.title,
      tier: a.achievement.tier,
      completedAt: a.completedAt,
    })),
  };
};

/**
 * Get points history
 */
const getPointsHistory = async (userId, limit = 50) => {
  return EcoPoints.getUserPointsHistory(userId, limit);
};

/**
 * Award daily login points
 */
const awardDailyLogin = async (userId) => {
  const { calculateDailyLoginPoints } = require('../utils/helpers/pointsCalculator');
  const user = await User.findById(userId);
  
  const pointsData = calculateDailyLoginPoints(user.streak);
  
  await awardPoints(
    userId,
    pointsData.totalPoints,
    'daily_login',
    `Daily login (${user.streak} day streak)`,
    { isBonus: true }
  );
  
  return pointsData;
};

module.exports = {
  awardPoints,
  processQuizRewards,
  processLessonRewards,
  checkAndAwardRewards,
  updateStreak,
  getUserGamificationProfile,
  getPointsHistory,
  awardDailyLogin,
};