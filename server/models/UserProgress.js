// server/models/UserProgress.js
const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  totalXP: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  coins: {
    type: Number,
    default: 0
  },
  lessonsCompleted: {
    type: Number,
    default: 0
  },
  perfectScores: {
    type: Number,
    default: 0
  },
  achievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  stats: {
    totalStudyTime: { type: Number, default: 0 }, // in minutes
    averageScore: { type: Number, default: 0 },
    consecutivePerfectScores: { type: Number, default: 0 },
    topicsCompleted: { type: Number, default: 0 }
  },
  lastActivityDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to add XP and update level
userProgressSchema.methods.addXP = async function (xp) {
  this.totalXP += xp;

  // Calculate level (100 XP per level)
  const newLevel = Math.floor(this.totalXP / 100) + 1;

  if (newLevel > this.level) {
    this.level = newLevel;
    // Award bonus coins for leveling up
    this.coins += newLevel * 10;
  }

  this.lastActivityDate = new Date();

  // Sync with User points
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(this.user, {
    $set: { points: this.totalXP }
  });

  return await this.save();
};

// Method to add coins
userProgressSchema.methods.addCoins = async function (coins) {
  this.coins += coins;
  return await this.save();
};

// Method to spend coins
userProgressSchema.methods.spendCoins = async function (coins) {
  if (this.coins < coins) {
    throw new Error('Insufficient coins');
  }
  this.coins -= coins;
  return await this.save();
};

// Method to update stats
userProgressSchema.methods.updateStats = async function (stats) {
  if (stats.studyTime) {
    this.stats.totalStudyTime += stats.studyTime;
  }
  if (stats.score !== undefined) {
    const totalScores = this.lessonsCompleted || 1;
    this.stats.averageScore =
      ((this.stats.averageScore * (totalScores - 1)) + stats.score) / totalScores;
  }
  if (stats.isPerfect) {
    this.perfectScores += 1;
    this.stats.consecutivePerfectScores += 1;
  } else if (stats.score !== undefined) {
    this.stats.consecutivePerfectScores = 0;
  }

  return await this.save();
};

// Static method to get leaderboard
userProgressSchema.statics.getLeaderboard = async function (limit = 10) {
  return await this.find()
    .sort({ totalXP: -1 })
    .limit(limit)
    .populate('user', 'name email avatar');
};

module.exports = mongoose.model('UserProgress', userProgressSchema);