// User Roles
const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
};

// Gamification Constants
const GAMIFICATION = {
  INITIAL_POINTS: 0,
  INITIAL_STREAK: 0,
  INITIAL_BADGES: [],
  POINTS_PER_QUIZ: 10,
  POINTS_PER_LESSON: 5,
  STREAK_BONUS: 5,
};

// Badge Types
const BADGE_TYPES = {
  FIRST_QUIZ: 'First Quiz Completed',
  WEEK_STREAK: '7-Day Streak',
  MONTH_STREAK: '30-Day Streak',
  HUNDRED_POINTS: '100 Points Milestone',
  FIVE_HUNDRED_POINTS: '500 Points Milestone',
  THOUSAND_POINTS: '1000 Points Milestone',
};

// Validation Constants
const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

module.exports = {
  USER_ROLES,
  GAMIFICATION,
  BADGE_TYPES,
  VALIDATION,
  HTTP_STATUS,
};