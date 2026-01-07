/**
 * Achievement Service
 * Business logic for achievement management
 */

const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const User = require('../models/User');
const EcoPoints = require('../models/EcoPoints');
const UserBadge = require('../models/UserBadge');

/**
 * Create new achievement
 */
const createAchievement = async (achievementData) => {
  const achievement = await Achievement.create(achievementData);
  return achievement;
};

/**
 * Get all achievements
 */
const getAllAchievements = async (filters = {}) => {
  const query = { isActive: true, ...filters };
  
  if (!filters.includeSecret) {
    query.isSecret = false;
  }
  
  const achievements = await Achievement.find(query)
    .populate('badgeReward')
    .sort({ order: 1 });
  
  return achievements;
};

/**
 * Get achievement by ID
 */
const getAchievementById = async (achievementId) => {
  const achievement = await Achievement.findById(achievementId)
    .populate('badgeReward')
    .populate('prerequisiteAchievements');
  
  return achievement;
};

/**
 * Update achievement
 */
const updateAchievement = async (achievementId, updateData) => {
  const achievement = await Achievement.findByIdAndUpdate(
    achievementId,
    updateData,
    { new: true, runValidators: true }
  );
  
  return achievement;
};

/**
 * Delete achievement
 */
const deleteAchievement = async (achievementId) => {
  await Achievement.findByIdAndDelete(achievementId);
  return true;
};

/**
 * Check user's progress for an achievement
 */
const checkAchievementProgress = async (userId, achievementId) => {
  const achievement = await Achievement.findById(achievementId);
  
  if (!achievement) {
    throw new Error('Achievement not found');
  }
  
  const progress = await achievement.checkProgress(userId);
  
  return {
    achievement: {
      id: achievement._id,
      title: achievement.title,
      description: achievement.description,
      points: achievement.points,
      tier: achievement.tier,
    },
    ...progress,
  };
};

/**
 * Unlock achievement for user
 */
const unlockAchievement = async (userId, achievementId) => {
  const result = await UserAchievement.unlockAchievement(userId, achievementId);
  
  if (result.success) {
    // Trigger notification
    // await notificationService.sendAchievementUnlocked(userId, achievementId);
    
    return {
      success: true,
      message: 'Achievement unlocked!',
      achievement: result.userAchievement,
      pointsAwarded: result.pointsAwarded,
      badgeAwarded: result.badgeAwarded,
    };
  }
  
  return result;
};

/**
 * Check and unlock all eligible achievements for user
 */
const checkAndUnlockAchievements = async (userId) => {
  const unlockedAchievements = await UserAchievement.checkAndUnlockAchievements(userId);
  
  return {
    count: unlockedAchievements.length,
    achievements: unlockedAchievements,
  };
};

/**
 * Get user's achievements
 */
const getUserAchievements = async (userId, completedOnly = false) => {
  const achievements = await UserAchievement.getUserAchievements(userId, completedOnly);
  
  return achievements;
};

/**
 * Get user's achievement progress (all achievements)
 */
const getUserAchievementProgress = async (userId) => {
  const progressList = await UserAchievement.getAchievementProgress(userId);
  
  return progressList;
};

/**
 * Get achievement statistics
 */
const getAchievementStats = async (achievementId) => {
  const totalUnlocks = await UserAchievement.countDocuments({
    achievement: achievementId,
    isCompleted: true,
  });
  
  const inProgress = await UserAchievement.countDocuments({
    achievement: achievementId,
    isCompleted: false,
  });
  
  const achievement = await Achievement.findById(achievementId);
  
  return {
    achievementId,
    title: achievement.title,
    totalUnlocks,
    inProgress,
    completionRate: totalUnlocks > 0 ? (totalUnlocks / (totalUnlocks + inProgress)) * 100 : 0,
  };
};

/**
 * Get achievements by category
 */
const getAchievementsByCategory = async (category) => {
  const achievements = await Achievement.find({
    category,
    isActive: true,
    isSecret: false,
  }).sort({ order: 1 });
  
  return achievements;
};

/**
 * Get achievements by tier
 */
const getAchievementsByTier = async (tier) => {
  const achievements = await Achievement.find({
    tier,
    isActive: true,
  }).sort({ order: 1 });
  
  return achievements;
};

/**
 * Get recently unlocked achievements (global)
 */
const getRecentlyUnlocked = async (limit = 10) => {
  const recentUnlocks = await UserAchievement.find({
    isCompleted: true,
  })
    .populate('user', 'name')
    .populate('achievement', 'title tier')
    .sort({ completedAt: -1 })
    .limit(limit);
  
  return recentUnlocks;
};

/**
 * Get rarest achievements
 */
const getRarestAchievements = async (limit = 5) => {
  const allAchievements = await Achievement.find({ isActive: true });
  
  const achievementStats = await Promise.all(
    allAchievements.map(async (achievement) => {
      const unlocks = await UserAchievement.countDocuments({
        achievement: achievement._id,
        isCompleted: true,
      });
      
      return {
        achievement,
        unlocks,
      };
    })
  );
  
  // Sort by unlocks (ascending) and return rarest
  const rarest = achievementStats
    .sort((a, b) => a.unlocks - b.unlocks)
    .slice(0, limit)
    .map(item => ({
      ...item.achievement.toObject(),
      unlockCount: item.unlocks,
    }));
  
  return rarest;
};

module.exports = {
  createAchievement,
  getAllAchievements,
  getAchievementById,
  updateAchievement,
  deleteAchievement,
  checkAchievementProgress,
  unlockAchievement,
  checkAndUnlockAchievements,
  getUserAchievements,
  getUserAchievementProgress,
  getAchievementStats,
  getAchievementsByCategory,
  getAchievementsByTier,
  getRecentlyUnlocked,
  getRarestAchievements,
};