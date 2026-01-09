const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');
const { HTTP_STATUS } = require('../config/constants');

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    console.log('📝 Register request received:', { ...req.body, password: '***' });
    const { name, email, password, role, schoolID, grade, phone } = req.body;

    // Check if all required fields exist
    if (!name || !email || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Name, email, and password are required' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    console.log('👤 Creating user...');
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      schoolID,
      grade,
      phone,
    });

    if (user) {
      console.log('✅ User created successfully:', user._id);

      let newStreak;
      try {
        // Initialize Streak for new user
        console.log('🔥 Initializing streak for user:', user._id);
        const Streak = require('../models/Streak');

        // Create initial streak document
        const streakDoc = await Streak.create({
          user: user._id,
          currentStreak: 1,
          lastActivityDate: new Date()
        });

        // Update it to ensure logic runs (though simply creating it might be enough)
        const updateResult = await streakDoc.updateStreak();
        newStreak = updateResult.streak;
        console.log('✅ Streak initialized successfully');
      } catch (streakError) {
        console.error('❌ Failed to create streak:', streakError);
        // If streak creation fails, we should probably rollback the user creation
        // so the user can try again without "User already exists" error
        await User.findByIdAndDelete(user._id);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          message: 'Failed to initialize user account (Streak Error). Please try again.'
        });
      }

      res.status(HTTP_STATUS.CREATED).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolID: user.schoolID,
        grade: user.grade,
        phone: user.phone,
        points: user.points,
        streak: newStreak ? newStreak.currentStreak : 0,
        badges: user.badges,
        achievements: user.achievements,
        token: generateToken(user._id),
      });
    } else {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('❌ Registration Error DETAILS:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await bcrypt.compare(password, user.password))) {
      // Check if user is approved
      if (!user.isApproved) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          message: 'Your account is pending approval. Please contact your administrator.'
        });
      }

      // Update Streak on Login
      const Streak = require('../models/Streak');
      let streakEntry = await Streak.findOne({ user: user._id });
      if (!streakEntry) {
        streakEntry = await Streak.create({ user: user._id });
      }
      const { streak: freshStreak } = await streakEntry.updateStreak();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        schoolID: user.schoolID,
        grade: user.grade,
        phone: user.phone,
        points: user.points,
        streak: freshStreak.currentStreak, // Use fresh streak count
        badges: user.badges,
        achievements: user.achievements,
        token: generateToken(user._id),
      });
    } else {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('❌ Login Error DETAILS:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.schoolID = req.body.schoolID || user.schoolID;
      user.grade = req.body.grade || user.grade;
      user.phone = req.body.phone || user.phone;
      user.points = req.body.points !== undefined ? req.body.points : user.points;
      user.streak = req.body.streak !== undefined ? req.body.streak : user.streak;
      user.badges = req.body.badges || user.badges;

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        schoolID: updatedUser.schoolID,
        grade: updatedUser.grade,
        phone: updatedUser.phone,
        points: updatedUser.points,
        streak: updatedUser.streak,
        badges: updatedUser.badges,
      });
    } else {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../services/emailService');

// @desc    Forgot Password
// @route   POST /api/users/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found' });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(user.email, resetToken);

      res.status(HTTP_STATUS.OK).json({ success: true, data: 'Email sent' });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   PUT /api/users/resetpassword/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid token' });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      token: generateToken(user._id),
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
};