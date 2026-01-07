/**
 * Streak Calculator Utility
 * Handles user streak calculations and maintenance
 */

const { isToday, wasYesterday, dateDifference } = require('./dateHelper');

// Streak milestones and rewards
const STREAK_MILESTONES = {
  3: { badge: 'Three Day Warrior', points: 10 },
  7: { badge: 'Week Streak', points: 25 },
  14: { badge: 'Two Week Champion', points: 50 },
  30: { badge: 'Monthly Master', points: 100 },
  60: { badge: 'Two Month Legend', points: 200 },
  90: { badge: 'Quarter Year Hero', points: 300 },
  100: { badge: 'Century Achiever', points: 500 },
  180: { badge: 'Half Year Elite', points: 1000 },
  365: { badge: 'Year Long Dedication', points: 2000 },
};

// Streak multipliers for points
const STREAK_MULTIPLIERS = {
  0: 1.0,    // No streak
  3: 1.1,    // 3 days: 10% bonus
  7: 1.5,    // 7 days: 50% bonus
  14: 1.75,  // 14 days: 75% bonus
  30: 2.0,   // 30 days: 100% bonus
  60: 2.5,   // 60 days: 150% bonus
  90: 3.0,   // 90+ days: 200% bonus
};

/**
 * Calculate current streak based on last login
 * @param {Date|string} lastLogin - User's last login date
 * @param {number} currentStreak - Current streak count
 * @returns {Object} - Updated streak info
 */
const calculateStreak = (lastLogin, currentStreak = 0) => {
  if (!lastLogin) {
    return {
      streak: 1,
      isNewStreak: true,
      isContinued: false,
      streakBroken: false,
      message: 'Streak started!',
    };
  }

  const lastLoginDate = new Date(lastLogin);
  
  // If logged in today already, return current streak
  if (isToday(lastLoginDate)) {
    return {
      streak: currentStreak,
      isNewStreak: false,
      isContinued: false,
      streakBroken: false,
      message: 'Already logged in today',
    };
  }

  // If last login was yesterday, continue streak
  if (wasYesterday(lastLoginDate)) {
    const newStreak = currentStreak + 1;
    return {
      streak: newStreak,
      isNewStreak: false,
      isContinued: true,
      streakBroken: false,
      message: `Streak continued! ${newStreak} days`,
      milestone: checkStreakMilestone(newStreak),
    };
  }

  // Streak broken - more than 1 day since last login
  return {
    streak: 1,
    isNewStreak: true,
    isContinued: false,
    streakBroken: true,
    previousStreak: currentStreak,
    message: 'Streak reset. Starting fresh!',
  };
};

/**
 * Check if streak reached a milestone
 * @param {number} streak - Current streak count
 * @returns {Object|null} - Milestone info or null
 */
const checkStreakMilestone = (streak) => {
  if (STREAK_MILESTONES[streak]) {
    return {
      reached: true,
      days: streak,
      badge: STREAK_MILESTONES[streak].badge,
      points: STREAK_MILESTONES[streak].points,
    };
  }
  return null;
};

/**
 * Get streak multiplier based on current streak
 * @param {number} streak - Current streak count
 * @returns {number} - Multiplier value
 */
const getStreakMultiplier = (streak) => {
  // Find the highest applicable multiplier
  const sortedThresholds = Object.keys(STREAK_MULTIPLIERS)
    .map(Number)
    .sort((a, b) => b - a);

  for (const threshold of sortedThresholds) {
    if (streak >= threshold) {
      return STREAK_MULTIPLIERS[threshold];
    }
  }

  return 1.0; // Default no bonus
};

/**
 * Calculate bonus points based on streak
 * @param {number} streak - Current streak count
 * @param {number} basePoints - Base points to calculate bonus from
 * @returns {Object} - Bonus calculation
 */
const calculateStreakBonus = (streak, basePoints) => {
  const multiplier = getStreakMultiplier(streak);
  const bonusPoints = Math.floor(basePoints * (multiplier - 1));
  
  return {
    multiplier,
    bonusPoints,
    totalPoints: basePoints + bonusPoints,
    streakDays: streak,
  };
};

/**
 * Get next streak milestone
 * @param {number} currentStreak - Current streak count
 * @returns {Object|null} - Next milestone info
 */
const getNextStreakMilestone = (currentStreak) => {
  const milestones = Object.keys(STREAK_MILESTONES).map(Number).sort((a, b) => a - b);
  
  for (const milestone of milestones) {
    if (milestone > currentStreak) {
      return {
        days: milestone,
        daysRemaining: milestone - currentStreak,
        badge: STREAK_MILESTONES[milestone].badge,
        points: STREAK_MILESTONES[milestone].points,
      };
    }
  }
  
  return null; // No more milestones
};

/**
 * Get all streak milestones with completion status
 * @param {number} currentStreak - Current streak count
 * @returns {Array} - Array of milestones with status
 */
const getAllStreakMilestones = (currentStreak) => {
  return Object.keys(STREAK_MILESTONES).map(Number).sort((a, b) => a - b).map(days => ({
    days,
    badge: STREAK_MILESTONES[days].badge,
    points: STREAK_MILESTONES[days].points,
    completed: currentStreak >= days,
    current: currentStreak === days,
  }));
};

/**
 * Calculate streak recovery window (grace period)
 * @param {Date|string} lastLogin - Last login date
 * @returns {Object} - Recovery window info
 */
const getStreakRecoveryWindow = (lastLogin) => {
  const lastLoginDate = new Date(lastLogin);
  const now = new Date();
  const hoursSinceLogin = dateDifference(lastLoginDate, now, 'hours');
  
  // 24 hour grace period
  const graceHours = 24;
  const hoursRemaining = Math.max(0, graceHours - hoursSinceLogin);
  
  return {
    inGracePeriod: hoursSinceLogin <= graceHours,
    hoursRemaining: Math.floor(hoursRemaining),
    minutesRemaining: Math.floor((hoursRemaining % 1) * 60),
    willBreak: hoursSinceLogin > graceHours,
  };
};

/**
 * Get streak status and motivation message
 * @param {number} streak - Current streak
 * @param {Date|string} lastLogin - Last login date
 * @returns {Object} - Streak status with message
 */
const getStreakStatus = (streak, lastLogin) => {
  const recovery = getStreakRecoveryWindow(lastLogin);
  const nextMilestone = getNextStreakMilestone(streak);
  const multiplier = getStreakMultiplier(streak);
  
  let status = 'active';
  let message = `${streak} day streak! Keep it up!`;
  let urgency = 'none';
  
  if (recovery.willBreak) {
    status = 'broken';
    message = 'Your streak has ended. Start a new one today!';
    urgency = 'critical';
  } else if (recovery.inGracePeriod && recovery.hoursRemaining < 6) {
    status = 'at_risk';
    message = `⚠️ Only ${recovery.hoursRemaining}h remaining to maintain your ${streak} day streak!`;
    urgency = 'high';
  } else if (isToday(lastLogin)) {
    status = 'completed';
    message = `✅ Today's login complete! ${streak} day streak maintained!`;
    urgency = 'none';
  }
  
  return {
    status,
    message,
    urgency,
    streak,
    multiplier,
    nextMilestone,
    recovery,
  };
};

/**
 * Calculate longest streak from login history
 * @param {Array} loginDates - Array of login dates
 * @returns {Object} - Longest streak info
 */
const calculateLongestStreak = (loginDates) => {
  if (!loginDates || loginDates.length === 0) {
    return { longest: 0, current: 0 };
  }
  
  // Sort dates
  const sortedDates = loginDates
    .map(d => new Date(d))
    .sort((a, b) => a - b);
  
  let longestStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const daysDiff = dateDifference(sortedDates[i - 1], sortedDates[i], 'days');
    
    if (daysDiff === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (daysDiff > 1) {
      currentStreak = 1;
    }
  }
  
  return {
    longest: longestStreak,
    current: currentStreak,
  };
};

/**
 * Format streak display
 * @param {number} streak - Streak count
 * @returns {string} - Formatted streak text
 */
const formatStreak = (streak) => {
  if (streak === 0) return 'No active streak';
  if (streak === 1) return '1 day streak 🔥';
  if (streak < 7) return `${streak} days streak 🔥`;
  if (streak < 30) return `${streak} days streak 🔥🔥`;
  if (streak < 100) return `${streak} days streak 🔥🔥🔥`;
  return `${streak} days streak 🔥🔥🔥🔥`;
};

/**
 * Get streak encouragement message
 * @param {number} streak - Current streak
 * @returns {string} - Encouragement message
 */
const getStreakEncouragement = (streak) => {
  if (streak === 0) return "Start your streak today!";
  if (streak === 1) return "Great start! Come back tomorrow!";
  if (streak < 7) return "You're building momentum!";
  if (streak === 7) return "One week strong! Amazing!";
  if (streak < 30) return "You're on fire! Keep going!";
  if (streak === 30) return "30 days! You're unstoppable!";
  if (streak < 100) return "Incredible dedication!";
  if (streak === 100) return "100 DAYS! You're a legend!";
  return "Your commitment is inspiring!";
};

/**
 * Check if user should get streak freeze (premium feature placeholder)
 * @param {number} streak - Current streak
 * @param {number} freezesUsed - Freezes used this month
 * @returns {Object} - Freeze eligibility
 */
const checkStreakFreezeEligibility = (streak, freezesUsed = 0) => {
  const maxFreezesPerMonth = 2;
  const minStreakForFreeze = 7;
  
  return {
    eligible: streak >= minStreakForFreeze && freezesUsed < maxFreezesPerMonth,
    freezesRemaining: Math.max(0, maxFreezesPerMonth - freezesUsed),
    minStreak: minStreakForFreeze,
    currentStreak: streak,
  };
};

module.exports = {
  STREAK_MILESTONES,
  STREAK_MULTIPLIERS,
  calculateStreak,
  checkStreakMilestone,
  getStreakMultiplier,
  calculateStreakBonus,
  getNextStreakMilestone,
  getAllStreakMilestones,
  getStreakRecoveryWindow,
  getStreakStatus,
  calculateLongestStreak,
  formatStreak,
  getStreakEncouragement,
  checkStreakFreezeEligibility,
};