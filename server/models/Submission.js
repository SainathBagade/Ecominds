const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a user'],
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Please add a quiz'],
    },
    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        selectedAnswer: {
          type: String,
          required: true,
          trim: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
        pointsEarned: {
          type: Number,
          default: 0,
        },
        timeSpent: {
          type: Number,
          default: 0,
          comment: 'Time spent on this question in seconds',
        },
      },
    ],
    score: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    wrongAnswers: {
      type: Number,
      default: 0,
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    attemptNumber: {
      type: Number,
      default: 1,
      min: 1,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    timeTaken: {
      type: Number,
      default: 0,
      comment: 'Total time taken in seconds',
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    bonusPoints: {
      type: Number,
      default: 0,
      comment: 'Bonus points for speed or perfect score',
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate percentage before saving
submissionSchema.pre('save', function (next) {
  if (this.totalQuestions > 0) {
    this.percentage = Math.round((this.correctAnswers / this.totalQuestions) * 100);
  }
  next();
});

// Compound index to prevent duplicate submissions
submissionSchema.index({ user: 1, quiz: 1, attemptNumber: 1 }, { unique: true });

// Index for faster queries
submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ quiz: 1, score: -1 });
submissionSchema.index({ status: 1 });

module.exports = mongoose.model('Submission', submissionSchema);