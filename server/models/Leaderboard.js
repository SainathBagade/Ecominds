// server/models/Leaderboard.js
const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['weekly', 'monthly', 'all_time'],
    required: true,
    index: true
  },
  grade: {
    type: String,
    index: true
  },
  college: {
    type: String,
    index: true
  },
  score: {
    type: Number,
    required: true,
    default: 0
  },
  rank: {
    type: Number
  },
  period: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  stats: {
    xpEarned: { type: Number, default: 0 },
    lessonsCompleted: { type: Number, default: 0 },
    perfectScores: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
leaderboardSchema.index({ type: 1, score: -1 });
leaderboardSchema.index({ type: 1, 'period.startDate': 1 });
leaderboardSchema.index({ user: 1, type: 1, 'period.startDate': 1 }, { unique: true });

// Method to update user's leaderboard entry
leaderboardSchema.methods.updateScore = async function (points) {
  this.score += points;
  return await this.save();
};

// Static method to get leaderboard rankings
leaderboardSchema.statics.getRankings = async function (type, limit = 10, filters = {}) {
  const now = new Date();
  let startDate, endDate;

  if (type === 'weekly') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - now.getDay());
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);
  } else if (type === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else {
    startDate = new Date(0);
    endDate = new Date();
  }

  const query = {
    type,
    'period.startDate': startDate
  };

  // Add optional filters
  if (filters.grade) {
    query.grade = filters.grade;
  }
  if (filters.college) {
    query.college = filters.college;
  }

  return await this.find(query)
    .sort({ score: -1 })
    .limit(limit)
    .populate('user', 'name email avatar grade college');
};

// Static method to update ranks
leaderboardSchema.statics.updateRanks = async function (type, grade = null) {
  const now = new Date();
  let startDate;

  if (type === 'weekly') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - now.getDay());
    startDate.setHours(0, 0, 0, 0);
  } else if (type === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    startDate = new Date(0);
  }

  const query = {
    type,
    'period.startDate': startDate
  };

  // If grade is specified, only update ranks for that grade
  if (grade) {
    query.grade = grade;
  }

  const entries = await this.find(query).sort({ score: -1 });

  const bulkOps = entries.map((entry, index) => ({
    updateOne: {
      filter: { _id: entry._id },
      update: { $set: { rank: index + 1 } }
    }
  }));

  if (bulkOps.length > 0) {
    await this.bulkWrite(bulkOps);
  }
};

// Static method to create or update leaderboard entry
leaderboardSchema.statics.upsertEntry = async function (userId, type, stats, userGrade, userCollege) {
  const now = new Date();
  let startDate, endDate;

  if (type === 'weekly') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - now.getDay());
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);
  } else if (type === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else {
    startDate = new Date(0);
    endDate = new Date();
  }

  return await this.findOneAndUpdate(
    {
      user: userId,
      type,
      'period.startDate': startDate
    },
    {
      $inc: {
        score: stats.xpEarned || 0,
        'stats.xpEarned': stats.xpEarned || 0,
        'stats.lessonsCompleted': stats.lessonsCompleted || 0,
        'stats.perfectScores': stats.perfectScores || 0
      },
      $set: {
        'period.endDate': endDate,
        'stats.streakDays': stats.streakDays || 0,
        grade: userGrade,
        college: userCollege
      },
      $setOnInsert: {
        user: userId,
        type,
        'period.startDate': startDate,
        rank: 999 // Temporary rank, will be updated by updateRanks
      }
    },
    { upsert: true, new: true }
  );
};

module.exports = mongoose.model('Leaderboard', leaderboardSchema);