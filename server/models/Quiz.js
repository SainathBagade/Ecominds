const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a quiz title'],
      trim: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'Please add a lesson'],
    },
    description: {
      type: String,
      trim: true,
    },
    timeLimit: {
      type: Number,
      required: [true, 'Please add a time limit'],
      default: 600,
      comment: 'Time limit in seconds',
    },
    passingScore: {
      type: Number,
      default: 60,
      min: 0,
      max: 100,
      comment: 'Passing score percentage',
    },
    totalPoints: {
      type: Number,
      default: 0,
      comment: 'Total points for all questions',
    },
    attemptsAllowed: {
      type: Number,
      default: 3,
      min: 1,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true,
      comment: 'Show correct answers after submission',
    },
    randomizeQuestions: {
      type: Boolean,
      default: false,
    },
    completionPoints: {
      type: Number,
      default: 10,
      min: 0,
      comment: 'Bonus points for completing quiz',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for questions
quizSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'quiz',
});

// Index for faster queries
quizSchema.index({ lesson: 1 });
quizSchema.index({ difficulty: 1 });

// Set toJSON to include virtuals
quizSchema.set('toJSON', { virtuals: true });
quizSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Quiz', quizSchema);