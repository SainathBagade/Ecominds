const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin', 'superadmin'],
      default: 'student',
      required: [true, 'Please add a role'],
    },
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role === 'student' || this.role === 'superadmin';
      },
    },
    schoolID: {
      type: String,
      required: [
        function () { return this.role !== 'superadmin'; },
        'Please add a school ID'
      ],
      trim: true,
    },
    grade: {
      type: String,
      required: [
        function () { return this.role === 'student'; },
        'Please add a grade'
      ],
      enum: {
        values: ['4', '5', '6', '7', '8', '9', '10', '11', '12'],
        message: 'Grade must be between 4 and 12'
      },
      trim: true,
    },
    subject: {
      type: String,
      required: [
        function () { return this.role === 'teacher'; },
        'Please add a subject'
      ],
      enum: {
        values: ['Environmental Science', 'Climate Physics', 'Sustainable Chemistry'],
        message: 'Please select one of the three EcoMinds subjects'
      },
      trim: true,
    },
    college: {
      type: String,
      trim: true,
      default: 'Default College'
    },
    phone: {
      type: String,
      trim: true,
      match: [
        /^[\d\s\-\+\(\)]+$/,
        'Please add a valid phone number',
      ],
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    streak: {
      type: Number,
      default: 0,
      min: 0,
    },
    badges: {
      type: [String],
      default: [],
    },
    achievements: {
      type: [String],
      default: [],
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Generate Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);