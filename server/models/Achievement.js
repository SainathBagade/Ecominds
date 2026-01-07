// server/models/Achievement.js
const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  icon: {
    type: String,
    default: '🎯'
  },
  points: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    default: 'bronze'
  },
  unlockCondition: {
    type: {
      type: String,
      required: true,
      enum: [
        'total_points',
        'badges_earned',
        'challenges_completed',
        'streak_days',
        'waste_reduced',
        'carbon_saved',
        'items_recycled',
        'community_rank',
        'custom'
      ]
    },
    target: {
      type: Number,
      required: true
    },
    operator: {
      type: String,
      enum: ['gte', 'lte', 'eq'],
      default: 'gte'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  category: {
    type: String,
    enum: ['points', 'social', 'environmental', 'consistency', 'milestone'],
    default: 'milestone'
  },
  isSecret: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  prerequisiteAchievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  nextTierAchievement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
achievementSchema.index({ category: 1, tier: 1 });
achievementSchema.index({ isActive: 1, isSecret: 1 });

// Method to check if user meets achievement criteria
achievementSchema.methods.checkEligibility = async function(userId) {
  const UserAchievement = mongoose.model('UserAchievement');
  const EcoPoints = mongoose.model('EcoPoints');
  const UserBadge = mongoose.model('UserBadge');
  
  // Check if already unlocked
  const alreadyUnlocked = await UserAchievement.findOne({
    user: userId,
    achievement: this._id
  });
  
  if (alreadyUnlocked) return false;

  // Check prerequisites
  if (this.prerequisiteAchievements.length > 0) {
    const unlockedPrereqs = await UserAchievement.countDocuments({
      user: userId,
      achievement: { $in: this.prerequisiteAchievements }
    });
    
    if (unlockedPrereqs < this.prerequisiteAchievements.length) {
      return false;
    }
  }

  const { type, target, operator } = this.unlockCondition;
  
  switch(type) {
    case 'total_points':
      const totalPoints = await EcoPoints.getUserTotalPoints(userId);
      return this.compareValue(totalPoints, target, operator);
    
    case 'badges_earned':
      const badgeCount = await UserBadge.countDocuments({ user: userId });
      return this.compareValue(badgeCount, target, operator);
    
    case 'challenges_completed':
      const Challenge = mongoose.model('Challenge');
      const challengeCount = await Challenge.countDocuments({
        participants: userId,
        status: 'completed'
      });
      return this.compareValue(challengeCount, target, operator);
    
    case 'items_recycled':
      const WasteLog = mongoose.model('WasteLog');
      const recycledCount = await WasteLog.countDocuments({
        user: userId,
        disposalMethod: 'recycling'
      });
      return this.compareValue(recycledCount, target, operator);
    
    default:
      return false;
  }
};

achievementSchema.methods.compareValue = function(actual, target, operator) {
  switch(operator) {
    case 'gte': return actual >= target;
    case 'lte': return actual <= target;
    case 'eq': return actual === target;
    default: return false;
  }
};

// Static method to get progress towards achievement
achievementSchema.statics.getProgress = async function(achievementId, userId) {
  const achievement = await this.findById(achievementId);
  if (!achievement) return null;

  const { type, target } = achievement.unlockCondition;
  const EcoPoints = mongoose.model('EcoPoints');
  const UserBadge = mongoose.model('UserBadge');
  
  let current = 0;
  
  switch(type) {
    case 'total_points':
      current = await EcoPoints.getUserTotalPoints(userId);
      break;
    case 'badges_earned':
      current = await UserBadge.countDocuments({ user: userId });
      break;
    case 'challenges_completed':
      const Challenge = mongoose.model('Challenge');
      current = await Challenge.countDocuments({
        participants: userId,
        status: 'completed'
      });
      break;
  }

  return {
    achievement: achievement.toObject(),
    progress: {
      current,
      target,
      percentage: Math.min((current / target) * 100, 100)
    }
  };
};

module.exports = mongoose.model('Achievement', achievementSchema);