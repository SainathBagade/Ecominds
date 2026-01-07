const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a grade name'],
      trim: true,
      unique: true,
    },
    level: {
      type: Number,
      required: [true, 'Please add a grade level'],
      min: [1, 'Grade level must be at least 1'],
      max: [12, 'Grade level cannot exceed 12'],
    },
    description: {
      type: String,
      trim: true,
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

// Index for faster queries
gradeSchema.index({ level: 1 });

module.exports = mongoose.model('Grade', gradeSchema);