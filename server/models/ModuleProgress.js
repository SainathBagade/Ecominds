// server/models/ModuleProgress.js
const mongoose = require('mongoose');

const moduleProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['locked', 'unlocked', 'in_progress', 'completed'],
    default: 'locked'
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lessonsCompleted: {
    type: Number,
    default: 0
  },
  totalLessons: {
    type: Number,
    required: true
  },
  averageScore: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
moduleProgressSchema.index({ user: 1, module: 1 }, { unique: true });
moduleProgressSchema.index({ user: 1, status: 1 });

// Method to update module progress
moduleProgressSchema.methods.updateModuleProgress = async function () {
  const LessonProgress = mongoose.model('LessonProgress');
  const Lesson = mongoose.model('Lesson');

  // Get all lessons belonging to this module
  const totalModuleLessons = await Lesson.countDocuments({ module: this.module });

  const lessonProgresses = await LessonProgress.find({
    user: this.user,
    module: this.module
  });

  this.totalLessons = totalModuleLessons;
  this.lessonsCompleted = lessonProgresses.filter(lp => lp.status === 'completed').length;

  if (this.totalLessons > 0) {
    this.completionPercentage = Math.round((this.lessonsCompleted / this.totalLessons) * 100);

    const completedLessons = lessonProgresses.filter(lp => lp.status === 'completed');
    if (completedLessons.length > 0) {
      this.averageScore = completedLessons.reduce((sum, lp) => sum + lp.score, 0) / completedLessons.length;
    }
  }

  // Update status
  if (this.completionPercentage === 100) {
    this.status = 'completed';
    this.completedAt = new Date();
  } else if (this.completionPercentage > 0) {
    this.status = 'in_progress';
    if (!this.startedAt) {
      this.startedAt = new Date();
    }
  }

  return await this.save();
};

// Method to unlock module
moduleProgressSchema.methods.unlock = async function () {
  if (this.status === 'locked') {
    this.status = 'unlocked';
    return await this.save();
  }
  return this;
};

// Method to issue certificate
moduleProgressSchema.methods.issueCertificate = async function (certificateUrl) {
  if (this.status === 'completed' && !this.certificateIssued) {
    this.certificateIssued = true;
    this.certificateUrl = certificateUrl;
    return await this.save();
  }
  throw new Error('Module not completed or certificate already issued');
};

// Static method to get user's overall progress
moduleProgressSchema.statics.getUserOverallProgress = async function (userId) {
  return await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalModules: { $sum: 1 },
        completedModules: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        inProgressModules: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
        },
        avgCompletion: { $avg: '$completionPercentage' },
        avgScore: { $avg: '$averageScore' }
      }
    }
  ]);
};

module.exports = mongoose.model('ModuleProgress', moduleProgressSchema);