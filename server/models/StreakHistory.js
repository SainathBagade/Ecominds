// server/models/StreakHistory.js
const mongoose = require('mongoose');

const streakHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  streakCount: {
    type: Number,
    required: true
  },
  wasFreezed: {
    type: Boolean,
    default: false
  },
  activitiesCompleted: {
    lessons: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    missionsCompleted: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
streakHistorySchema.index({ user: 1, date: -1 });

// Ensure one record per user per day
streakHistorySchema.index({ user: 1, date: 1 }, { unique: true });

// Static method to get user's streak history
streakHistorySchema.statics.getUserHistory = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.find({
    user: userId,
    date: { $gte: startDate }
  }).sort({ date: -1 });
};

// Static method to create or update today's history
streakHistorySchema.statics.updateToday = async function(userId, streakCount, activities) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await this.findOneAndUpdate(
    { user: userId, date: today },
    {
      $set: { streakCount },
      $inc: {
        'activitiesCompleted.lessons': activities.lessons || 0,
        'activitiesCompleted.xpEarned': activities.xpEarned || 0,
        'activitiesCompleted.missionsCompleted': activities.missionsCompleted || 0
      }
    },
    { upsert: true, new: true }
  );
};

module.exports = mongoose.model('StreakHistory', streakHistorySchema);