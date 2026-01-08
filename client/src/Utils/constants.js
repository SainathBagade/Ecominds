/**
 * Application Constants
 * Centralized constants for the EcoMinds application
 */

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const SITE_URL = 'http://localhost:5000';

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
};

// Grade Levels (Platform supports grades 4-12 only)
export const GRADE_LEVELS = ['4', '5', '6', '7', '8', '9', '10', '11', '12'];

// Proof Review Status
export const PROOF_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  NEEDS_REVISION: 'needs_revision',
};

// Challenge Types
export const CHALLENGE_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  SPECIAL: 'special',
  COMMUNITY: 'community',
};

// Challenge Difficulties
export const CHALLENGE_DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert',
};

// Difficulty Levels (alias for CHALLENGE_DIFFICULTIES)
export const DIFFICULTY_LEVELS = CHALLENGE_DIFFICULTIES;

// Game Types
export const GAME_TYPES = {
  QUIZ: 'quiz',
  PUZZLE: 'puzzle',
  MEMORY: 'memory',
  TYPING: 'typing',
  MATCH: 'match',
  FLASHCARD: 'flashcard',
  WORD_GAME: 'word_game',
};

// Points Sources
export const POINTS_SOURCES = {
  SIGNUP: 'signup',
  DAILY_LOGIN: 'daily_login',
  LESSON_COMPLETE: 'lesson_completion',
  QUIZ_COMPLETE: 'quiz_completion',
  CHALLENGE_COMPLETE: 'challenge_complete',
  GOAL_ACHIEVED: 'goal_achieved',
  STREAK_BONUS: 'streak_bonus',
  MILESTONE: 'milestone',
  BONUS: 'bonus',
  ADMIN_ADJUSTMENT: 'admin_adjustment',
};

// Badge Rarities
export const BADGE_RARITIES = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
};

// Achievement Tiers
export const ACHIEVEMENT_TIERS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
  DIAMOND: 'diamond',
};

// Streak Milestones (days)
export const STREAK_MILESTONES = [7, 14, 30, 60, 100, 365];

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  FULL: 'MMMM DD, YYYY',
  TIME: 'HH:mm',
  DATETIME: 'MMM DD, YYYY HH:mm',
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 255,
  SCHOOL_ID_MAX_LENGTH: 50,
};

// Quiz Settings
export const QUIZ_SETTINGS = {
  DEFAULT_TIME_LIMIT: 30, // minutes
  MIN_TIME_LIMIT: 5,
  MAX_TIME_LIMIT: 120,
  PASSING_SCORE: 60, // percentage
  MAX_ATTEMPTS: 3,
};

// Mission Types
export const MISSION_TYPES = {
  COMPLETE_LESSON: 'complete_lesson',
  TAKE_QUIZ: 'take_quiz',
  EARN_POINTS: 'earn_points',
  MAINTAIN_STREAK: 'maintain_streak',
  COMPLETE_CHALLENGE: 'complete_challenge',
};

// Mission Difficulties
export const MISSION_DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

// Leaderboard Timeframes
export const LEADERBOARD_TIMEFRAMES = {
  ALL_TIME: 'all',
  WEEKLY: 'week',
  MONTHLY: 'month',
  YEARLY: 'year',
};

// Leaderboard Types
export const LEADERBOARD_TYPES = {
  CLASS: 'class',
  COMPETITION: 'competition',
  GLOBAL: 'global',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
};



// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Welcome back!',
  REGISTER: 'Account created successfully!',
  UPDATE: 'Updated successfully!',
  DELETE: 'Deleted successfully!',
  SUBMIT: 'Submitted successfully!',
};

// Animation Durations (ms)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// Colors (Primary theme)
export const COLORS = {
  PRIMARY: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
};

