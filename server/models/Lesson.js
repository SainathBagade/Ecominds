const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a lesson title'],
      trim: true,
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'Please add a module'],
    },
    content: {
      type: String,
      required: [true, 'Please add lesson content'],
    },
    video: {
      url: {
        type: String,
        trim: true,
      },
      duration: {
        type: Number,
        default: 0,
        comment: 'Video duration in seconds',
      },
      thumbnail: {
        type: String,
        trim: true,
      },
    },
    attachments: [
      {
        name: {
          type: String,
          trim: true,
        },
        url: {
          type: String,
          trim: true,
        },
        type: {
          type: String,
          enum: ['pdf', 'image', 'document', 'other'],
          default: 'other',
        },
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 10,
      comment: 'Estimated completion time in minutes',
    },
    type: {
      type: String,
      enum: ['video', 'text', 'interactive', 'quiz'],
      default: 'text',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    completionPoints: {
      type: Number,
      default: 5,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
lessonSchema.index({ module: 1, order: 1 });
lessonSchema.index({ type: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);