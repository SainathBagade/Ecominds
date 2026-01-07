/**
 * Authentication Service
 * Handles user authentication and authorization logic
 */

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken, verifyToken } = require('../config/jwt');
const { validateRegister, validateLogin } = require('../utils/validators/userValidator');

/**
 * Register new user
 */
const register = async (userData) => {
  // Validate input
  const validation = validateRegister(userData);
  if (!validation.isValid) {
    throw new Error(JSON.stringify(validation.errors));
  }
  
  // Check if user exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('Email already registered');
  }
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);
  
  // Create user
  const user = await User.create({
    ...userData,
    password: hashedPassword,
  });
  
  // Generate token
  const token = generateToken(user._id);
  
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolID: user.schoolID,
      grade: user.grade,
      points: user.points,
      streak: user.streak,
      badges: user.badges,
    },
    token,
  };
};

/**
 * Login user
 */
const login = async (email, password) => {
  // Validate input
  const validation = validateLogin({ email, password });
  if (!validation.isValid) {
    throw new Error('Invalid email or password');
  }
  
  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }
  
  // Update last login
  user.lastLogin = new Date();
  await user.save();
  
  // Generate token
  const token = generateToken(user._id);
  
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolID: user.schoolID,
      grade: user.grade,
      points: user.points,
      streak: user.streak,
      badges: user.badges,
    },
    token,
  };
};

/**
 * Verify token and get user
 */
const verifyAuth = async (token) => {
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Change password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }
  
  // Hash new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  
  await user.save();
  
  return { message: 'Password changed successfully' };
};

/**
 * Forgot password (generate reset token)
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  
  if (!user) {
    // Don't reveal if email exists
    return { message: 'If email exists, reset link will be sent' };
  }
  
  // Generate reset token (valid for 1 hour)
  const resetToken = generateToken(user._id, '1h');
  
  // In production, send email with reset link
  // await emailService.sendPasswordReset(user.email, resetToken);
  
  return {
    message: 'Password reset link sent to email',
    resetToken, // Only for testing, remove in production
  };
};

/**
 * Reset password with token
 */
const resetPassword = async (resetToken, newPassword) => {
  try {
    const decoded = verifyToken(resetToken);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new Error('Invalid reset token');
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    return { message: 'Password reset successful' };
  } catch (error) {
    throw new Error('Invalid or expired reset token');
  }
};

/**
 * Refresh token
 */
const refreshToken = async (oldToken) => {
  try {
    const decoded = verifyToken(oldToken);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate new token
    const newToken = generateToken(user._id);
    
    return { token: newToken };
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * Logout (optional - mainly client-side token removal)
 */
const logout = async (userId) => {
  // Could blacklist token or update last activity
  // For now, just acknowledge logout
  return { message: 'Logged out successfully' };
};

/**
 * Check if user has role
 */
const hasRole = (user, roles) => {
  if (!Array.isArray(roles)) {
    roles = [roles];
  }
  return roles.includes(user.role);
};

/**
 * Check if user owns resource
 */
const ownsResource = (user, resourceUserId) => {
  return user._id.toString() === resourceUserId.toString();
};

module.exports = {
  register,
  login,
  verifyAuth,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  hasRole,
  ownsResource,
};