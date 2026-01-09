// server/models/LessonProgress.js
const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
    index: true
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  attempts: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number,
    default: 0 // in seconds
  },
  lastAttemptDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  isPerfect: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
lessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });
lessonProgressSchema.index({ user: 1, module: 1 });
lessonProgressSchema.index({ user: 1, status: 1 });

// Method to update progress
lessonProgressSchema.methods.updateProgress = async function (scoreData) {
  this.attempts += 1;
  this.lastAttemptDate = new Date();

  if (scoreData.score > this.score) {
    this.score = scoreData.score;
  }

  if (scoreData.timeSpent) {
    this.timeSpent += scoreData.timeSpent;
  }

  if (scoreData.score >= 80) {
    this.status = 'completed';
    this.completedAt = new Date();

    if (scoreData.score === 100) {
      this.isPerfect = true;
    }
  } else if (this.status === 'not_started') {
    this.status = 'in_progress';
  }

  return await this.save();
};

// Static method to get user's lesson progress for a module
lessonProgressSchema.statics.getModuleProgress = async function (userId, moduleId) {
  return await this.find({ user: userId, module: moduleId })
    .populate('lesson', 'title order')
    .sort({ 'lesson.order': 1 });
};

// Static method to get completion statistics
lessonProgressSchema.statics.getUserStats = async function (userId) {
  return await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgScore: { $avg: '$score' },
        totalTime: { $sum: '$timeSpent' }
      }
    }
  ]);
};

module.exports = mongoose.model('LessonProgress', lessonProgressSchema);