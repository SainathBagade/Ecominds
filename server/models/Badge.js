// server/models/Badge.js
const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  icon: {
    type: String,
    required: true,
    default: '🏆'
  },
  category: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'special', 'seasonal'],
    default: 'beginner'
  },
  criteria: {
    type: {
      type: String,
      required: true,
      enum: [
        'points_threshold',
        'challenges_completed',
        'consecutive_days',
        'waste_tracked',
        'streak_days',
        'recycling_percentage',
        'points_milestone',
        'community_actions',
        'custom'
      ]
    },
    value: {
      type: Number,
      required: true
    },
    condition: {
      type: String,
      default: 'gte' // gte, lte, eq
    }
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  pointsReward: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
badgeSchema.index({ category: 1, rarity: 1 });
badgeSchema.index({ isActive: 1 });

// Method to check if user meets badge criteria
badgeSchema.methods.checkEligibility = async function(userId) {
  const EcoPoints = mongoose.model('EcoPoints');
  const UserBadge = mongoose.model('UserBadge');
  
  // Check if user already has this badge
  const alreadyEarned = await UserBadge.findOne({ 
    user: userId, 
    badge: this._id 
  });
  
  if (alreadyEarned) return false;

  const { type, value, condition } = this.criteria;
  
  switch(type) {
    case 'points_threshold':
      const totalPoints = await EcoPoints.getUserTotalPoints(userId);
      return this.compareValue(totalPoints, value, condition);
    
    case 'challenges_completed':
      const Challenge = mongoose.model('Challenge');
      const completedCount = await Challenge.countDocuments({
        participants: userId,
        status: 'completed'
      });
      return this.compareValue(completedCount, value, condition);
    
    case 'consecutive_days':
      // Implementation depends on your activity tracking
      return false;
    
    case 'waste_tracked':
      const WasteLog = mongoose.model('WasteLog');
      const wasteCount = await WasteLog.countDocuments({ user: userId });
      return this.compareValue(wasteCount, value, condition);
    
    default:
      return false;
  }
};

badgeSchema.methods.compareValue = function(actual, target, condition) {
  switch(condition) {
    case 'gte': return actual >= target;
    case 'lte': return actual <= target;
    case 'eq': return actual === target;
    default: return false;
  }
};

module.exports = mongoose.model('Badge', badgeSchema);