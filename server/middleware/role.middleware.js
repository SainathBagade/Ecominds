/**
 * Role-based Access Control Middleware
 * Restricts routes based on user roles
 */

const { ForbiddenError, UnauthorizedError } = require('../utils/helpers/errorHandler');
const { USER_ROLES } = require('../config/constants');

/**
 * Check if user has required role(s)
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Please login to access this resource');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(
        `User role '${req.user.role}' is not authorized to access this route`
      );
    }

    next();
  };
};

/**
 * Admin only access
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError('Please login to access this resource');
  }

  if (![USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN].includes(req.user.role)) {
    throw new ForbiddenError('Access denied. Admin privileges required');
  }

  next();
};

/**
 * Super Admin only access
 */
const superAdminOnly = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError('Please login to access this resource');
  }

  if (req.user.role !== USER_ROLES.SUPERADMIN) {
    throw new ForbiddenError('Access denied. Super Admin privileges required');
  }

  next();
};

/**
 * Teacher or Admin access
 */
const teacherOrAdmin = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError('Please login to access this resource');
  }

  if (![USER_ROLES.TEACHER, USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN].includes(req.user.role)) {
    throw new ForbiddenError('Access denied. Teacher or Admin privileges required');
  }

  next();
};

/**
 * Student only access
 */
const studentOnly = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError('Please login to access this resource');
  }

  if (req.user.role !== USER_ROLES.STUDENT) {
    throw new ForbiddenError('This route is for students only');
  }

  next();
};

/**
 * Check if user owns the resource
 * @param {string} resourceUserField - Field name containing user ID (default: 'user')
 */
const ownerOrAdmin = (resourceUserField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Please login to access this resource');
    }

    // Admin can access everything
    if (req.user.role === USER_ROLES.ADMIN) {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req[resourceUserField] || req.body[resourceUserField];

    if (!resourceUserId) {
      throw new ForbiddenError('Resource ownership could not be verified');
    }

    if (resourceUserId.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('You do not have permission to access this resource');
    }

    next();
  };
};

/**
 * Check if user can modify resource (owner, teacher, or admin)
 */
const canModify = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError('Please login to access this resource');
  }

  const isAdmin = req.user.role === USER_ROLES.ADMIN;
  const isTeacher = req.user.role === USER_ROLES.TEACHER;
  const isOwner = req.resource && req.resource.user?.toString() === req.user._id.toString();

  if (!isAdmin && !isTeacher && !isOwner) {
    throw new ForbiddenError('You do not have permission to modify this resource');
  }

  next();
};

/**
 * Check if user is in same school
 */
const sameSchool = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError('Please login to access this resource');
  }

  // Admin can access all schools
  if (req.user.role === USER_ROLES.ADMIN) {
    return next();
  }

  const resourceSchoolId = req.targetUser?.schoolID || req.body.schoolID;

  if (!resourceSchoolId) {
    throw new ForbiddenError('School information not found');
  }

  if (resourceSchoolId !== req.user.schoolID) {
    throw new ForbiddenError('You can only access resources from your school');
  }

  next();
};

/**
 * Role hierarchy check
 * Users can only manage users with lower role hierarchy
 */
const roleHierarchy = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError('Please login to access this resource');
  }

  const hierarchy = {
    [USER_ROLES.SUPERADMIN]: 4,
    [USER_ROLES.ADMIN]: 3,
    [USER_ROLES.TEACHER]: 2,
    [USER_ROLES.STUDENT]: 1,
  };

  const userLevel = hierarchy[req.user.role];
  const targetRole = req.body.role || req.targetUser?.role;
  const targetLevel = hierarchy[targetRole];

  if (targetLevel >= userLevel) {
    throw new ForbiddenError('You cannot manage users with equal or higher privileges');
  }

  next();
};

module.exports = {
  authorize,
  adminOnly,
  superAdminOnly,
  teacherOrAdmin,
  studentOnly,
  ownerOrAdmin,
  canModify,
  sameSchool,
  roleHierarchy,
};