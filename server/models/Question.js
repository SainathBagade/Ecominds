const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Please add a quiz'],
    },
    text: {
      type: String,
      required: [true, 'Please add question text'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'short-answer'],
      default: 'multiple-choice',
    },
    options: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],
    correctAnswer: {
      type: String,
      required: [true, 'Please add correct answer'],
      trim: true,
    },
    explanation: {
      type: String,
      trim: true,
      comment: 'Explanation for the correct answer',
    },
    points: {
      type: Number,
      required: [true, 'Please add points'],
      default: 5,
      min: 1,
    },
    order: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    image: {
      type: String,
      trim: true,
      comment: 'Optional image URL for the question',
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Validation: Ensure options exist for multiple-choice questions
questionSchema.pre('save', function (next) {
  if (this.type === 'multiple-choice' && this.options.length < 2) {
    next(new Error('Multiple choice questions must have at least 2 options'));
  }
  next();
});

// Index for faster queries
questionSchema.index({ quiz: 1, order: 1 });
questionSchema.index({ difficulty: 1 });

module.exports = mongoose.model('Question', questionSchema);