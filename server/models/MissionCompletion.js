// server/models/MissionCompletion.js
const mongoose = require('mongoose');

const missionCompletionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DailyMission',
    required: true
  },
  missionType: {
    type: String,
    enum: ['complete_lessons', 'earn_xp', 'perfect_score', 'streak_maintain'],
    required: true
  },
  rewardClaimed: {
    xp: { type: Number, default: 0 },
    coins: { type: Number, default: 0 }
  },
  completedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for user and completion date
missionCompletionSchema.index({ user: 1, completedAt: -1 });

// Static method to get user's completion stats
missionCompletionSchema.statics.getUserStats = async function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        completedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$missionType',
        count: { $sum: 1 },
        totalXP: { $sum: '$rewardClaimed.xp' },
        totalCoins: { $sum: '$rewardClaimed.coins' }
      }
    }
  ]);
};

module.exports = mongoose.model('MissionCompletion', missionCompletionSchema);