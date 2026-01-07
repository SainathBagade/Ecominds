/**
 * Validation Middleware
 * Validates request data before processing
 */

const { ValidationError } = require('../utils/helpers/errorHandler');

/**
 * Validate required fields
 * @param  {...string} fields - Required field names
 */
const validateRequired = (...fields) => {
  return (req, res, next) => {
    const errors = [];

    fields.forEach(field => {
      if (!req.body[field]) {
        errors.push({
          field,
          message: `${field} is required`,
        });
      }
    });

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    next();
  };
};

/**
 * Validate email format
 */
const validateEmail = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    throw new ValidationError('Email is required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }

  next();
};

/**
 * Validate password strength
 */
const validatePassword = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    throw new ValidationError('Password is required');
  }

  const errors = [];

  if (password.length < 6) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 6 characters',
    });
  }

  if (password.length > 128) {
    errors.push({
      field: 'password',
      message: 'Password must not exceed 128 characters',
    });
  }

  // Optional: Add more password rules
  // if (!/[A-Z]/.test(password)) {
  //   errors.push({ field: 'password', message: 'Password must contain uppercase letter' });
  // }
  // if (!/[0-9]/.test(password)) {
  //   errors.push({ field: 'password', message: 'Password must contain number' });
  // }

  if (errors.length > 0) {
    throw new ValidationError('Password validation failed', errors);
  }

  next();
};

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id) {
      throw new ValidationError(`${paramName} is required`);
    }

    // MongoDB ObjectId is 24 hex characters
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    if (!objectIdRegex.test(id)) {
      throw new ValidationError(`Invalid ${paramName} format`);
    }

    next();
  };
};

/**
 * Validate user role
 */
const validateRole = (req, res, next) => {
  const { role } = req.body;
  const { USER_ROLES } = require('../config/constants');

  if (role && !Object.values(USER_ROLES).includes(role)) {
    throw new ValidationError('Invalid role', [{
      field: 'role',
      message: `Role must be one of: ${Object.values(USER_ROLES).join(', ')}`,
    }]);
  }

  next();
};

/**
 * Validate phone number
 */
const validatePhone = (req, res, next) => {
  const { phone } = req.body;

  if (phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;

    if (!phoneRegex.test(phone)) {
      throw new ValidationError('Invalid phone number format');
    }
  }

  next();
};

/**
 * Validate quiz submission
 */
const validateQuizSubmission = (req, res, next) => {
  const { submissionId, answers } = req.body;
  const errors = [];

  if (!submissionId) {
    errors.push({ field: 'submissionId', message: 'Submission ID is required' });
  }

  if (!answers || !Array.isArray(answers)) {
    errors.push({ field: 'answers', message: 'Answers must be an array' });
  } else if (answers.length === 0) {
    errors.push({ field: 'answers', message: 'At least one answer is required' });
  } else {
    // Validate each answer
    answers.forEach((answer, index) => {
      if (!answer.questionId) {
        errors.push({ 
          field: `answers[${index}].questionId`, 
          message: 'Question ID is required' 
        });
      }
      if (!answer.selectedAnswer) {
        errors.push({ 
          field: `answers[${index}].selectedAnswer`, 
          message: 'Selected answer is required' 
        });
      }
    });
  }

  if (errors.length > 0) {
    throw new ValidationError('Quiz submission validation failed', errors);
  }

  next();
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  let { page = 1, limit = 10 } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  if (isNaN(page) || page < 1) {
    page = 1;
  }

  if (isNaN(limit) || limit < 1 || limit > 100) {
    limit = 10;
  }

  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit,
  };

  next();
};

/**
 * Validate date range
 */
const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (startDate && isNaN(Date.parse(startDate))) {
    throw new ValidationError('Invalid start date format');
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    throw new ValidationError('Invalid end date format');
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw new ValidationError('Start date must be before end date');
    }
  }

  next();
};

/**
 * Validate grade level
 */
const validateGradeLevel = (req, res, next) => {
  const { level } = req.body;

  if (level !== undefined) {
    const levelNum = parseInt(level);

    if (isNaN(levelNum) || levelNum < 1 || levelNum > 12) {
      throw new ValidationError('Grade level must be between 1 and 12');
    }
  }

  next();
};

/**
 * Validate points value
 */
const validatePoints = (req, res, next) => {
  const { points } = req.body;

  if (points !== undefined) {
    const pointsNum = parseInt(points);

    if (isNaN(pointsNum) || pointsNum < 0) {
      throw new ValidationError('Points must be a positive number');
    }
  }

  next();
};

/**
 * Sanitize input (prevent XSS)
 */
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/[<>]/g, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitize(req.body);
  next();
};

/**
 * Validate request body not empty
 */
const validateBodyNotEmpty = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ValidationError('Request body cannot be empty');
  }
  next();
};

/**
 * Custom validator wrapper
 * @param {Function} validatorFn - Custom validation function
 */
const customValidator = (validatorFn) => {
  return (req, res, next) => {
    const result = validatorFn(req.body, req.params, req.query);

    if (result !== true) {
      if (typeof result === 'string') {
        throw new ValidationError(result);
      }
      if (Array.isArray(result)) {
        throw new ValidationError('Validation failed', result);
      }
      throw new ValidationError('Validation failed');
    }

    next();
  };
};

module.exports = {
  validateRequired,
  validateEmail,
  validatePassword,
  validateObjectId,
  validateRole,
  validatePhone,
  validateQuizSubmission,
  validatePagination,
  validateDateRange,
  validateGradeLevel,
  validatePoints,
  sanitizeInput,
  validateBodyNotEmpty,
  customValidator,
};