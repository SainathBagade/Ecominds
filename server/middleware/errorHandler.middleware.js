/**
 * Error Handler Middleware
 * Centralized error handling for the application
 */

const { errorHandler, notFoundHandler } = require('../utils/helpers/errorHandler');

/**
 * Custom error response middleware
 * This wraps the error handler from helpers
 */
const errorMiddleware = (err, req, res, next) => {
  // Log error details
  console.error('Error Details:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Use the error handler from helpers
  errorHandler(err, req, res, next);
};

/**
 * 404 Not Found middleware
 */
const notFoundMiddleware = (req, res, next) => {
  notFoundHandler(req, res, next);
};

module.exports = {
  errorMiddleware,
  notFoundMiddleware,
};