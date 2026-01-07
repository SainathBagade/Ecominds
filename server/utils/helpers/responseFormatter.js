/**
 * Response Formatter Utility
 * Standardizes API response format across all endpoints
 */

const { formatDate } = require('./dateHelper');

/**
 * Success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} - Formatted response
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {*} errors - Validation errors or details
 * @returns {Object} - Formatted error response
 */
const errorResponse = (res, message = 'Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items count
 * @param {string} message - Success message
 * @returns {Object} - Formatted paginated response
 */
const paginatedResponse = (res, data, page, limit, total, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: total,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Created response (201)
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 * @returns {Object} - Formatted response
 */
const createdResponse = (res, data, message = 'Resource created successfully') => {
  return successResponse(res, data, message, 201);
};

/**
 * No content response (204)
 * @param {Object} res - Express response object
 * @returns {Object} - Empty response
 */
const noContentResponse = (res) => {
  return res.status(204).send();
};

/**
 * Not found response (404)
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name
 * @returns {Object} - Formatted error response
 */
const notFoundResponse = (res, resource = 'Resource') => {
  return errorResponse(res, `${resource} not found`, 404);
};

/**
 * Bad request response (400)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {*} errors - Validation errors
 * @returns {Object} - Formatted error response
 */
const badRequestResponse = (res, message = 'Bad request', errors = null) => {
  return errorResponse(res, message, 400, errors);
};

/**
 * Unauthorized response (401)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} - Formatted error response
 */
const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return errorResponse(res, message, 401);
};

/**
 * Forbidden response (403)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} - Formatted error response
 */
const forbiddenResponse = (res, message = 'Forbidden') => {
  return errorResponse(res, message, 403);
};

/**
 * Conflict response (409)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} - Formatted error response
 */
const conflictResponse = (res, message = 'Resource already exists') => {
  return errorResponse(res, message, 409);
};

/**
 * Validation error response (422)
 * @param {Object} res - Express response object
 * @param {*} errors - Validation errors
 * @returns {Object} - Formatted error response
 */
const validationErrorResponse = (res, errors) => {
  return errorResponse(res, 'Validation failed', 422, errors);
};

/**
 * Internal server error response (500)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} - Formatted error response
 */
const internalErrorResponse = (res, message = 'Internal server error') => {
  return errorResponse(res, message, 500);
};

/**
 * Custom status response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Success flag
 * @param {string} message - Message
 * @param {*} data - Response data
 * @returns {Object} - Formatted response
 */
const customResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Format user data (remove sensitive fields)
 * @param {Object} user - User object
 * @returns {Object} - Sanitized user data
 */
const formatUserData = (user) => {
  if (!user) return null;
  
  const userObj = user.toObject ? user.toObject() : user;
  const { password, __v, ...safeUser } = userObj;
  
  return safeUser;
};

/**
 * Format array of users
 * @param {Array} users - Array of user objects
 * @returns {Array} - Sanitized users
 */
const formatUsersData = (users) => {
  return users.map(formatUserData);
};

/**
 * Format quiz response with questions
 * @param {Object} quiz - Quiz object
 * @param {Array} questions - Questions array
 * @param {boolean} hideAnswers - Hide correct answers
 * @returns {Object} - Formatted quiz data
 */
const formatQuizData = (quiz, questions = [], hideAnswers = true) => {
  const formattedQuestions = questions.map(q => {
    const question = q.toObject ? q.toObject() : q;
    
    if (hideAnswers) {
      const { correctAnswer, explanation, ...safeQuestion } = question;
      return {
        ...safeQuestion,
        options: question.options?.map(opt => ({
          text: opt.text,
          // Don't include isCorrect
        }))
      };
    }
    
    return question;
  });

  return {
    quiz,
    questions: formattedQuestions,
    totalQuestions: formattedQuestions.length,
  };
};

/**
 * Format submission with detailed breakdown
 * @param {Object} submission - Submission object
 * @returns {Object} - Formatted submission
 */
const formatSubmissionData = (submission) => {
  const sub = submission.toObject ? submission.toObject() : submission;
  
  return {
    ...sub,
    performanceRating: sub.percentage >= 90 ? 'Excellent' : 
                       sub.percentage >= 75 ? 'Good' : 
                       sub.percentage >= 60 ? 'Average' : 'Needs Improvement',
    formattedTimeTaken: formatTime(sub.timeTaken),
    formattedDate: formatDate(sub.createdAt, 'full'),
  };
};

/**
 * Format time in seconds to readable format
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time
 */
const formatTime = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

/**
 * Format leaderboard data
 * @param {Array} users - Array of users with scores
 * @returns {Array} - Formatted leaderboard
 */
const formatLeaderboard = (users) => {
  return users.map((user, index) => ({
    rank: index + 1,
    userId: user._id,
    name: user.name,
    schoolID: user.schoolID,
    grade: user.grade,
    points: user.points,
    streak: user.streak,
    badges: user.badges?.length || 0,
    level: Math.floor(user.points / 100) + 1,
  }));
};

/**
 * Format achievement progress
 * @param {Object} achievement - Achievement with progress
 * @returns {Object} - Formatted achievement
 */
const formatAchievementProgress = (achievement) => {
  return {
    id: achievement._id,
    title: achievement.title,
    description: achievement.description,
    progress: achievement.progress || 0,
    currentValue: achievement.currentValue || 0,
    target: achievement.target,
    isCompleted: achievement.isCompleted || false,
    points: achievement.points,
    tier: achievement.tier,
    progressBar: `${achievement.progress || 0}%`,
  };
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse,
  notFoundResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  conflictResponse,
  validationErrorResponse,
  internalErrorResponse,
  customResponse,
  formatUserData,
  formatUsersData,
  formatQuizData,
  formatSubmissionData,
  formatLeaderboard,
  formatAchievementProgress,
};