/**
 * UserMission Model
 * Represents missions assigned to users
 */

const mongoose = require('mongoose');

const userMissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'complete_lesson',
        'take_quiz',
        'earn_points',
        'log_activity',
        'share_achievement',
        'login_streak',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: '🎯',
    },
    target: {
      type: Number,
      required: true,
      min: 1,
    },
    current: {
      type: Number,
      default: 0,
      min: 0,
    },
    reward: {
      type: Number,
      required: true,
      min: 0,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'expired'],
      default: 'active',
      index: true,
    },
    completedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for progress percentage
userMissionSchema.virtual('progress').get(function () {
  return Math.min(Math.floor((this.current / this.target) * 100), 100);
});

// Virtual for checking if completed
userMissionSchema.virtual('isCompleted').get(function () {
  return this.current >= this.target;
});

// Virtual for checking if expired
userMissionSchema.virtual('isExpired').get(function () {
  return this.expiresAt < new Date() && this.status !== 'completed';
});

// Index for efficient queries
userMissionSchema.index({ user: 1, status: 1, expiresAt: 1 });
userMissionSchema.index({ user: 1, type: 1, status: 1 });

// Ensure virtuals are included in JSON
userMissionSchema.set('toJSON', { virtuals: true });
userMissionSchema.set('toObject', { virtuals: true });

// Pre-save middleware to auto-complete missions
userMissionSchema.pre('save', function (next) {
  if (this.current >= this.target && this.status === 'active') {
    this.status = 'completed';
    if (!this.completedAt) {
      this.completedAt = new Date();
    }
  }
  next();
});

module.exports = mongoose.model('UserMission', userMissionSchema);