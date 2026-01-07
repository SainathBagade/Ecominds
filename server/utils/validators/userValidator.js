/**
 * User Validator
 * Validation rules for user-related operations
 */

const { ValidationError } = require('../helpers/errorHandler');

/**
 * Validate user registration data
 */
const validateRegister = (data) => {
  const errors = [];
  const { name, email, password, role, schoolID, grade, phone } = data;

  // Name validation
  if (!name || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  } else if (name.trim().length > 50) {
    errors.push({ field: 'name', message: 'Name must not exceed 50 characters' });
  }

  // Email validation
  if (!email || email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }
  }

  // Password validation
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else {
    const passwordErrors = validatePasswordStrength(password);
    errors.push(...passwordErrors);
  }

  // Role validation
  const validRoles = ['student', 'teacher', 'admin'];
  if (role && !validRoles.includes(role)) {
    errors.push({ field: 'role', message: 'Invalid role' });
  }

  // SchoolID validation
  if (!schoolID || schoolID.trim().length === 0) {
    errors.push({ field: 'schoolID', message: 'School ID is required' });
  }

  // Grade validation
  if (!grade || grade.trim().length === 0) {
    errors.push({ field: 'grade', message: 'Grade is required' });
  }

  // Phone validation (optional)
  if (phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      errors.push({ field: 'phone', message: 'Invalid phone number format' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate user login data
 */
const validateLogin = (data) => {
  const errors = [];
  const { email, password } = data;

  if (!email || email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email is required' });
  }

  if (!password || password.length === 0) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate password strength
 */
const validatePasswordStrength = (password) => {
  const errors = [];

  if (password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  if (password.length > 128) {
    errors.push({ field: 'password', message: 'Password must not exceed 128 characters' });
  }

  // Optional: Strong password rules (commented out)
  // if (!/[A-Z]/.test(password)) {
  //   errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter' });
  // }

  // if (!/[a-z]/.test(password)) {
  //   errors.push({ field: 'password', message: 'Password must contain at least one lowercase letter' });
  // }

  // if (!/[0-9]/.test(password)) {
  //   errors.push({ field: 'password', message: 'Password must contain at least one number' });
  // }

  // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
  //   errors.push({ field: 'password', message: 'Password must contain at least one special character' });
  // }

  return errors;
};

/**
 * Validate user update data
 */
const validateUpdate = (data) => {
  const errors = [];
  const { name, email, role, grade, phone } = data;

  // Name validation (optional)
  if (name !== undefined) {
    if (name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
    } else if (name.trim().length > 50) {
      errors.push({ field: 'name', message: 'Name must not exceed 50 characters' });
    }
  }

  // Email validation (optional)
  if (email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }
  }

  // Role validation (optional)
  if (role !== undefined) {
    const validRoles = ['student', 'teacher', 'admin'];
    if (!validRoles.includes(role)) {
      errors.push({ field: 'role', message: 'Invalid role' });
    }
  }

  // Phone validation (optional)
  if (phone !== undefined && phone !== null) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      errors.push({ field: 'phone', message: 'Invalid phone number format' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Invalid email format' };
  }

  return { isValid: true };
};

/**
 * Validate password change
 */
const validatePasswordChange = (data) => {
  const errors = [];
  const { currentPassword, newPassword, confirmPassword } = data;

  if (!currentPassword) {
    errors.push({ field: 'currentPassword', message: 'Current password is required' });
  }

  if (!newPassword) {
    errors.push({ field: 'newPassword', message: 'New password is required' });
  } else {
    const passwordErrors = validatePasswordStrength(newPassword);
    errors.push(...passwordErrors);
  }

  if (!confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Confirm password is required' });
  } else if (newPassword !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }

  if (currentPassword === newPassword) {
    errors.push({ field: 'newPassword', message: 'New password must be different from current password' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate user profile data
 */
const validateProfile = (data) => {
  const errors = [];
  const { name, phone, grade } = data;

  if (name !== undefined && name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }

  if (phone !== undefined && phone !== null && phone.length > 0) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      errors.push({ field: 'phone', message: 'Invalid phone number format' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateRegister,
  validateLogin,
  validatePasswordStrength,
  validateUpdate,
  validateEmail,
  validatePasswordChange,
  validateProfile,
};