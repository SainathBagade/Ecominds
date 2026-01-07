// server/models/UserAchievement.js
const mongoose = require('mongoose');

const userAchievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  achievement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true
  },
  unlockedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  notified: {
    type: Boolean,
    default: false
  },
  progress: {
    current: {
      type: Number,
      default: 0
    },
    target: {
      type: Number,
      required: true
    }
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate achievements
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });
userAchievementSchema.index({ unlockedAt: -1 });

// Static method to unlock achievement
userAchievementSchema.statics.unlockAchievement = async function(userId, achievementId) {
  const EcoPoints = mongoose.model('EcoPoints');
  const Achievement = mongoose.model('Achievement');
  
  try {
    // Check if already unlocked
    const existing = await this.findOne({ user: userId, achievement: achievementId });
    if (existing) {
      return { success: false, message: 'Achievement already unlocked' };
    }

    const achievement = await Achievement.findById(achievementId);
    if (!achievement) {
      return { success: false, message: 'Achievement not found' };
    }

    // Create user achievement
    const userAchievement = await this.create({
      user: userId,
      achievement: achievementId,
      progress: {
        current: achievement.unlockCondition.target,
        target: achievement.unlockCondition.target
      }
    });

    // Award points
    if (achievement.points > 0) {
      await EcoPoints.awardPoints(
        userId,
        achievement.points,
        'achievement_unlocked',
        `Unlocked achievement: ${achievement.title}`,
        { achievementId: achievement._id, achievementTitle: achievement.title }
      );
    }

    return { 
      success: true, 
      userAchievement: await userAchievement.populate('achievement'),
      pointsAwarded: achievement.points
    };
  } catch (error) {
    if (error.code === 11000) {
      return { success: false, message: 'Achievement already unlocked' };
    }
    throw error;
  }
};

// Static method to get user's achievements
userAchievementSchema.statics.getUserAchievements = async function(userId, options = {}) {
  const { limit = 100, category, tier } = options;
  
  let query = { user: userId };
  
  const achievements = await this.find(query)
    .populate('achievement')
    .sort({ unlockedAt: -1 })
    .limit(limit);

  // Filter by category or tier if specified
  if (category || tier) {
    return achievements.filter(ua => {
      if (category && ua.achievement.category !== category) return false;
      if (tier && ua.achievement.tier !== tier) return false;
      return true;
    });
  }

  return achievements;
};

// Static method to check and unlock eligible achievements
userAchievementSchema.statics.checkAndUnlockAchievements = async function(userId) {
  const Achievement = mongoose.model('Achievement');
  
  const activeAchievements = await Achievement.find({ 
    isActive: true 
  }).populate('prerequisiteAchievements');
  
  const unlockedAchievements = [];

  for (const achievement of activeAchievements) {
    const isEligible = await achievement.checkEligibility(userId);
    if (isEligible) {
      const result = await this.unlockAchievement(userId, achievement._id);
      if (result.success) {
        unlockedAchievements.push(result.userAchievement);
      }
    }
  }

  return unlockedAchievements;
};

// Static method to get achievement statistics
userAchievementSchema.statics.getUserStats = async function(userId) {
  const Achievement = mongoose.model('Achievement');
  
  const [unlocked, total] = await Promise.all([
    this.countDocuments({ user: userId }),
    Achievement.countDocuments({ isActive: true, isSecret: false })
  ]);

  const achievements = await this.find({ user: userId })
    .populate('achievement');

  const byTier = achievements.reduce((acc, ua) => {
    const tier = ua.achievement.tier;
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});

  const byCategory = achievements.reduce((acc, ua) => {
    const category = ua.achievement.category;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const totalPoints = achievements.reduce((sum, ua) => 
    sum + (ua.achievement.points || 0), 0
  );

  return {
    unlocked,
    total,
    percentage: total > 0 ? (unlocked / total * 100).toFixed(2) : 0,
    byTier,
    byCategory,
    totalPoints
  };
};

module.exports = mongoose.model('UserAchievement', userAchievementSchema);