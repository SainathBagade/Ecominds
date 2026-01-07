/**
 * Error Handler Utility
 * Custom error classes and centralized error handling
 */

/**
 * Base API Error class
 */
class APIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad Request Error (400)
 */
class BadRequestError extends APIError {
  constructor(message = 'Bad Request') {
    super(message, 400);
    this.name = 'BadRequestError';
  }
}

/**
 * Unauthorized Error (401)
 */
class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized - Please login') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden Error (403)
 */
class ForbiddenError extends APIError {
  constructor(message = 'Forbidden - You do not have permission') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * Not Found Error (404)
 */
class NotFoundError extends APIError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error (409)
 */
class ConflictError extends APIError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Validation Error (422)
 */
class ValidationError extends APIError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, 422);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Internal Server Error (500)
 */
class InternalServerError extends APIError {
  constructor(message = 'Internal Server Error') {
    super(message, 500);
    this.name = 'InternalServerError';
  }
}

/**
 * Database Error
 */
class DatabaseError extends APIError {
  constructor(message = 'Database operation failed') {
    super(message, 500);
    this.name = 'DatabaseError';
  }
}

/**
 * Authentication Error
 */
class AuthenticationError extends APIError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Token Error
 */
class TokenError extends APIError {
  constructor(message = 'Invalid or expired token') {
    super(message, 401);
    this.name = 'TokenError';
  }
}

/**
 * Handle Mongoose Validation Error
 * @param {Error} err - Mongoose validation error
 * @returns {ValidationError} - Formatted validation error
 */
const handleMongooseValidationError = (err) => {
  const errors = Object.values(err.errors).map(error => ({
    field: error.path,
    message: error.message,
  }));
  
  return new ValidationError('Validation failed', errors);
};

/**
 * Handle Mongoose Duplicate Key Error
 * @param {Error} err - Mongoose duplicate key error
 * @returns {ConflictError} - Formatted conflict error
 */
const handleMongooseDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new ConflictError(`${field} '${value}' already exists`);
};

/**
 * Handle Mongoose Cast Error
 * @param {Error} err - Mongoose cast error
 * @returns {BadRequestError} - Formatted bad request error
 */
const handleMongooseCastError = (err) => {
  return new BadRequestError(`Invalid ${err.path}: ${err.value}`);
};

/**
 * Handle JWT Error
 * @param {Error} err - JWT error
 * @returns {TokenError} - Formatted token error
 */
const handleJWTError = (err) => {
  if (err.name === 'JsonWebTokenError') {
    return new TokenError('Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    return new TokenError('Token expired');
  }
  return new TokenError();
};

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log error for debugging
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = handleMongooseValidationError(err);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error = handleMongooseDuplicateKeyError(err);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    error = handleMongooseCastError(err);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  // Add validation errors if present
  if (error.errors) {
    response.errors = error.errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 * @param {Function} fn - Async function
 * @returns {Function} - Wrapped function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Handle not found routes (404)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
};

/**
 * Validate request body
 * @param {Object} schema - Validation schema
 * @returns {Function} - Middleware function
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      throw new ValidationError('Validation failed', errors);
    }
    
    next();
  };
};

/**
 * Check if error is operational (expected)
 * @param {Error} error - Error object
 * @returns {boolean} - True if operational
 */
const isOperationalError = (error) => {
  if (error instanceof APIError) {
    return error.isOperational;
  }
  return false;
};

module.exports = {
  // Error classes
  APIError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
  DatabaseError,
  AuthenticationError,
  TokenError,
  
  // Error handlers
  errorHandler,
  asyncHandler,
  notFoundHandler,
  validateRequest,
  isOperationalError,
  
  // Mongoose error handlers
  handleMongooseValidationError,
  handleMongooseDuplicateKeyError,
  handleMongooseCastError,
  handleJWTError,
};