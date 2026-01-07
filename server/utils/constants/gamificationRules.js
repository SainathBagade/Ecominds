/**
 * Gamification Rules Constants
 * All rules and configurations for the gamification system
 */

// Points System
const POINTS = {
  // Base Points
  QUIZ_COMPLETION: 10,
  LESSON_COMPLETION: 5,
  MODULE_COMPLETION: 20,
  DAILY_LOGIN: 2,
  FIRST_QUIZ: 5,
  PERFECT_SCORE: 15,
  SPEED_BONUS: 10,
  
  // Milestone Bonuses
  FIRST_BADGE: 10,
  TENTH_QUIZ: 50,
  HUNDREDTH_LESSON: 100,
  FIRST_MODULE: 25,
  
  // Social Points
  HELP_CLASSMATE: 5,
  SHARE_ACHIEVEMENT: 3,
  REFER_FRIEND: 20,
  
  // Eco Actions
  ECO_ACTION_COMPLETE: 15,
  MISSION_COMPLETE: 30,
  CHALLENGE_WIN: 50,
};

// Multipliers
const MULTIPLIERS = {
  // Streak Multipliers
  STREAK_3_DAYS: 1.1,    // 10% bonus
  STREAK_7_DAYS: 1.5,    // 50% bonus
  STREAK_14_DAYS: 1.75,  // 75% bonus
  STREAK_30_DAYS: 2.0,   // 100% bonus (double points)
  STREAK_60_DAYS: 2.5,   // 150% bonus
  STREAK_90_DAYS: 3.0,   // 200% bonus (triple points)
  
  // Performance Multipliers
  PERFECT_SCORE: 1.25,   // 25% bonus
  SPEED_BONUS: 1.2,      // 20% bonus (finish in <50% time)
  FIRST_ATTEMPT: 1.3,    // 30% bonus
  
  // Level Multipliers
  LEVEL_10_PLUS: 1.1,    // 10% bonus for level 10+
  LEVEL_25_PLUS: 1.2,    // 20% bonus for level 25+
  LEVEL_50_PLUS: 1.5,    // 50% bonus for level 50+
};

// Level System
const LEVELS = {
  POINTS_PER_LEVEL: 100,  // Points needed per level
  MAX_LEVEL: 100,
  
  // Level Titles
  TITLES: {
    1: 'Eco Beginner',
    5: 'Eco Explorer',
    10: 'Eco Enthusiast',
    15: 'Eco Champion',
    20: 'Eco Guardian',
    25: 'Eco Master',
    30: 'Eco Legend',
    40: 'Eco Hero',
    50: 'Eco Savior',
    75: 'Eco Supreme',
    100: 'Eco Deity',
  },
  
  // Level Colors (for UI)
  COLORS: {
    1: '#95C623',    // Light Green
    10: '#4CAF50',   // Green
    20: '#2196F3',   // Blue
    30: '#9C27B0',   // Purple
    40: '#FF9800',   // Orange
    50: '#F44336',   // Red
    75: '#E91E63',   // Pink
    100: '#FFD700',  // Gold
  },
};

// Streak System
const STREAKS = {
  // Streak Milestones (days: reward points)
  MILESTONES: {
    3: 10,
    7: 25,
    14: 50,
    30: 100,
    60: 200,
    90: 300,
    100: 500,
    180: 1000,
    365: 2000,
  },
  
  // Grace Period
  GRACE_PERIOD_HOURS: 24,
  
  // Freeze Feature (premium)
  FREEZES_PER_MONTH: 2,
  MIN_STREAK_FOR_FREEZE: 7,
};

// Badge System
const BADGES = {
  // Badge Rarities
  RARITY: {
    COMMON: 'common',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary',
  },
  
  // Badge Categories
  CATEGORIES: {
    LEARNING: 'learning',
    QUIZ_MASTER: 'quiz_master',
    STREAK: 'streak',
    MILESTONE: 'milestone',
    SPECIAL: 'special',
    ECO_ACTION: 'eco_action',
    SOCIAL: 'social',
    ACHIEVEMENT: 'achievement',
  },
  
  // Points Rewards by Rarity
  RARITY_POINTS: {
    common: 10,
    rare: 25,
    epic: 50,
    legendary: 100,
  },
};

// Achievement System
const ACHIEVEMENTS = {
  // Achievement Tiers
  TIERS: {
    BRONZE: 'bronze',
    SILVER: 'silver',
    GOLD: 'gold',
    PLATINUM: 'platinum',
    DIAMOND: 'diamond',
  },
  
  // Points Rewards by Tier
  TIER_POINTS: {
    bronze: 20,
    silver: 50,
    gold: 100,
    platinum: 200,
    diamond: 500,
  },
  
  // Time Frames
  TIMEFRAMES: {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    ALL_TIME: 'all_time',
  },
};

// Leaderboard System
const LEADERBOARD = {
  // Leaderboard Types
  TYPES: {
    GLOBAL: 'global',
    SCHOOL: 'school',
    GRADE: 'grade',
    CLASS: 'class',
  },
  
  // Time Periods
  PERIODS: {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    ALL_TIME: 'all_time',
  },
  
  // Ranking Rewards (top positions)
  TOP_REWARDS: {
    1: 100,   // 1st place
    2: 75,    // 2nd place
    3: 50,    // 3rd place
    5: 25,    // Top 5
    10: 10,   // Top 10
  },
  
  // Display Limits
  MAX_DISPLAY: 100,
  DEFAULT_DISPLAY: 20,
};

// Mission System
const MISSIONS = {
  // Mission Types
  TYPES: {
    ECO_ACTION: 'eco_action',
    LEARNING: 'learning',
    COMMUNITY: 'community',
    RECYCLING: 'recycling',
    CONSERVATION: 'conservation',
    AWARENESS: 'awareness',
    RESEARCH: 'research',
    VOLUNTEER: 'volunteer',
  },
  
  // Mission Categories
  CATEGORIES: {
    WATER: 'water',
    ENERGY: 'energy',
    WASTE: 'waste',
    BIODIVERSITY: 'biodiversity',
    AIR: 'air',
    CLIMATE: 'climate',
    POLLUTION: 'pollution',
    SUSTAINABILITY: 'sustainability',
  },
  
  // Points by Difficulty
  DIFFICULTY_POINTS: {
    easy: 20,
    medium: 50,
    hard: 100,
    expert: 200,
  },
  
  // Verification Status
  VERIFICATION: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },
};

// Challenge System
const CHALLENGES = {
  // Challenge Types
  TYPES: {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    SPECIAL: 'special',
    EVENT: 'event',
  },
  
  // Challenge Difficulties
  DIFFICULTIES: {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
    EXPERT: 'expert',
  },
  
  // Duration Limits (in days)
  MAX_DURATION: {
    daily: 1,
    weekly: 7,
    monthly: 30,
    special: 14,
    event: 30,
  },
};

// Reward System
const REWARDS = {
  // Daily Rewards
  DAILY_LOGIN: {
    DAY_1: 2,
    DAY_7: 10,   // Week bonus
    DAY_30: 50,  // Month bonus
  },
  
  // Quest Completion
  QUEST_REWARDS: {
    DAILY_QUEST: 10,
    WEEKLY_QUEST: 50,
    MONTHLY_QUEST: 200,
  },
  
  // Special Events
  EVENT_MULTIPLIER: 2.0,  // Double points during events
  
  // Referral Rewards
  REFERRAL: {
    REFERRER: 20,
    REFERRED: 10,
  },
};

// Limits and Restrictions
const LIMITS = {
  // Daily Limits
  MAX_QUIZZES_PER_DAY: 20,
  MAX_LESSONS_PER_DAY: 50,
  MAX_POINTS_PER_DAY: 1000,
  
  // Quiz Limits
  MAX_QUIZ_ATTEMPTS: 3,
  MIN_TIME_BETWEEN_ATTEMPTS: 300,  // 5 minutes in seconds
  
  // Mission Limits
  MAX_ACTIVE_MISSIONS: 5,
  MAX_MISSIONS_PER_WEEK: 10,
};

// Penalties (negative points)
const PENALTIES = {
  QUIZ_CHEATING: -50,
  SPAM_REPORT: -20,
  INAPPROPRIATE_CONTENT: -100,
  MISSION_FAKE_PROOF: -75,
  MULTIPLE_ACCOUNTS: -200,
  STREAK_SKIP: 0,  // Just reset, no penalty
};

// Configuration
const CONFIG = {
  // Enable/Disable Features
  FEATURES: {
    STREAKS: true,
    BADGES: true,
    ACHIEVEMENTS: true,
    LEADERBOARDS: true,
    MISSIONS: true,
    CHALLENGES: true,
    DAILY_QUESTS: true,
  },
  
  // Notification Settings
  NOTIFICATIONS: {
    LEVEL_UP: true,
    BADGE_EARNED: true,
    ACHIEVEMENT_UNLOCKED: true,
    STREAK_MILESTONE: true,
    LEADERBOARD_POSITION: true,
  },
  
  // Anti-Cheat
  ANTI_CHEAT: {
    MIN_QUIZ_TIME: 30,  // Minimum seconds per quiz
    MAX_PERFECT_SCORES_PER_DAY: 10,
    SUSPICIOUS_ACTIVITY_THRESHOLD: 5,
  },
};

module.exports = {
  POINTS,
  MULTIPLIERS,
  LEVELS,
  STREAKS,
  BADGES,
  ACHIEVEMENTS,
  LEADERBOARD,
  MISSIONS,
  CHALLENGES,
  REWARDS,
  LIMITS,
  PENALTIES,
  CONFIG,
};