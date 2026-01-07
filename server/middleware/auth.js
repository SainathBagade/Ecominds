/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UnauthorizedError, TokenError } = require('../utils/helpers/errorHandler');
const { asyncHandler } = require('../utils/helpers/errorHandler');

/**
 * Authenticate user - verify JWT token
 * Use this as the main authentication middleware
 */
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    throw new UnauthorizedError('Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      throw new UnauthorizedError('User not found');
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new TokenError('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new TokenError('Token expired');
    }
    throw new UnauthorizedError('Not authorized to access this route');
  }
});

/**
 * Authorize specific roles
 * Use after authenticate middleware
 * @param {Array} roles - Array of allowed roles (e.g., ['admin', 'moderator'])
 */
const authorize = (roles) => {
  if (!Array.isArray(roles)) roles = [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Please login to access this resource' });
    }
    if (!req.user.role) {
      return res.status(401).json({ message: 'User role not defined' });
    }

    const roleMatch = roles.some(r => r.toLowerCase() === req.user.role.toLowerCase());
    if (!roleMatch) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};


/**
 * Optional authentication - doesn't fail if no token
 * Useful for routes that work with or without authentication
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Silently fail - optional auth
      req.user = null;
    }
  }

  next();
});

/**
 * Check if user is authenticated
 * Simple check without token verification
 */
const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError('Please login to access this resource');
  }
  next();
};

/**
 * Admin only access
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Please login to access this resource' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required' });
  }
  next();
};

/**
 * Teacher or Admin access
 */
const teacherOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Please login to access this resource' });
  }
  if (!['teacher', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Teacher or Admin privileges required' });
  }
  next();
};

/**
 * Student only access
 */
const studentOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Please login to access this resource' });
  }
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'This route is for students only' });
  }
  next();
};

/**
 * Legacy alias for authenticate (for backward compatibility)
 */
const protect = authenticate;

module.exports = {
  authenticate,
  authorize,
  protect,
  optionalAuth,
  isAuthenticated,
  adminOnly,
  teacherOrAdmin,
  studentOnly
};