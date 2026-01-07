// server/models/EcoPoints.js
const mongoose = require('mongoose');

const ecoPointsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger,
      message: 'Points must be an integer'
    }
  },
  source: {
    type: String,
    required: true,
    enum: [
      'signup',
      'daily_login',
      'challenge_complete',
      'goal_achieved',
      'waste_tracked',
      'recycling_logged',
      'community_contribution',
      'referral',
      'milestone',
      'bonus',
      'admin_adjustment'
    ]
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Challenge', 'Goal', 'WasteLog', 'Achievement']
  }
}, {
  timestamps: true
});

// Index for efficient queries
ecoPointsSchema.index({ user: 1, createdAt: -1 });
ecoPointsSchema.index({ source: 1 });

// Static method to get user's total points
ecoPointsSchema.statics.getUserTotalPoints = async function(userId) {
  const result = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  return result.length > 0 ? result[0].total : 0;
};

// Static method to award points
ecoPointsSchema.statics.awardPoints = async function(userId, amount, source, description, metadata = {}) {
  return await this.create({
    user: userId,
    amount,
    source,
    description,
    metadata
  });
};

// Static method to get leaderboard
ecoPointsSchema.statics.getLeaderboard = async function(limit = 10) {
  return await this.aggregate([
    { $group: { 
      _id: '$user', 
      totalPoints: { $sum: '$amount' },
      lastActivity: { $max: '$createdAt' }
    }},
    { $sort: { totalPoints: -1 } },
    { $limit: limit },
    { $lookup: {
      from: 'users',
      localField: '_id',
      foreignField: '_id',
      as: 'userInfo'
    }},
    { $unwind: '$userInfo' },
    { $project: {
      userId: '$_id',
      totalPoints: 1,
      lastActivity: 1,
      username: '$userInfo.username',
      avatar: '$userInfo.avatar'
    }}
  ]);
};

module.exports = mongoose.model('EcoPoints', ecoPointsSchema);