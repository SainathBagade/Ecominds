/**
 * Points Calculator Utility
 * Handles all point calculations with bonuses and multipliers
 */

// Base points for different activities
const BASE_POINTS = {
  QUIZ_COMPLETION: 10,
  LESSON_COMPLETION: 5,
  MODULE_COMPLETION: 20,
  DAILY_LOGIN: 2,
  PERFECT_SCORE: 15,
  FIRST_ATTEMPT_PASS: 5,
  SPEED_BONUS: 10,
};

// Multipliers
const MULTIPLIERS = {
  STREAK_7_DAYS: 1.5,    // 50% bonus
  STREAK_30_DAYS: 2.0,   // 100% bonus
  PERFECT_SCORE: 1.25,   // 25% bonus
  SPEED_BONUS: 1.2,      // 20% bonus
  FIRST_ATTEMPT: 1.3,    // 30% bonus
};

/**
 * Calculate total points with base + bonuses + multipliers
 * @param {number} basePoints - Base points for activity
 * @param {Object} options - Bonus options
 * @returns {number} - Total calculated points
 */
const calculatePoints = (basePoints, options = {}) => {
  const {
    hasStreak = false,
    streakDays = 0,
    isPerfectScore = false,
    isSpeedBonus = false,
    isFirstAttempt = false,
    customMultiplier = 1,
  } = options;

  let total = basePoints;
  let appliedMultiplier = customMultiplier;

  // Apply streak multiplier
  if (hasStreak || streakDays > 0) {
    if (streakDays >= 30) {
      appliedMultiplier *= MULTIPLIERS.STREAK_30_DAYS;
    } else if (streakDays >= 7) {
      appliedMultiplier *= MULTIPLIERS.STREAK_7_DAYS;
    }
  }

  // Apply perfect score multiplier
  if (isPerfectScore) {
    appliedMultiplier *= MULTIPLIERS.PERFECT_SCORE;
  }

  // Apply speed bonus multiplier
  if (isSpeedBonus) {
    appliedMultiplier *= MULTIPLIERS.SPEED_BONUS;
  }

  // Apply first attempt multiplier
  if (isFirstAttempt) {
    appliedMultiplier *= MULTIPLIERS.FIRST_ATTEMPT;
  }

  total = total * appliedMultiplier;

  return Math.floor(total);
};

/**
 * Calculate quiz completion points
 * @param {number} score - Quiz score
 * @param {Object} options - Calculation options
 * @returns {Object} - Points breakdown
 */
const calculateQuizPoints = (score, options = {}) => {
  const {
    isPerfectScore = false,
    isFirstAttempt = false,
    timeTaken = 0,
    timeLimit = 0,
    streakDays = 0,
  } = options;

  let basePoints = score;
  let bonusPoints = 0;
  const breakdown = [];

  // Perfect score bonus
  if (isPerfectScore) {
    const perfectBonus = BASE_POINTS.PERFECT_SCORE;
    bonusPoints += perfectBonus;
    breakdown.push({ type: 'Perfect Score', points: perfectBonus });
  }

  // First attempt bonus
  if (isFirstAttempt && isPerfectScore) {
    const firstAttemptBonus = BASE_POINTS.FIRST_ATTEMPT_PASS;
    bonusPoints += firstAttemptBonus;
    breakdown.push({ type: 'First Attempt', points: firstAttemptBonus });
  }

  // Speed bonus (completed in less than 50% of time limit)
  if (timeLimit > 0 && timeTaken > 0 && timeTaken < (timeLimit * 0.5)) {
    const speedBonus = BASE_POINTS.SPEED_BONUS;
    bonusPoints += speedBonus;
    breakdown.push({ type: 'Speed Bonus', points: speedBonus });
  }

  // Calculate with streak multiplier
  const total = calculatePoints(basePoints + bonusPoints, { streakDays });

  return {
    basePoints,
    bonusPoints,
    streakMultiplier: streakDays >= 7 ? (streakDays >= 30 ? 2.0 : 1.5) : 1.0,
    totalPoints: total,
    breakdown,
  };
};

/**
 * Calculate lesson completion points
 * @param {number} streakDays - Current streak
 * @returns {Object} - Points breakdown
 */
const calculateLessonPoints = (streakDays = 0) => {
  const basePoints = BASE_POINTS.LESSON_COMPLETION;
  const total = calculatePoints(basePoints, { streakDays });

  return {
    basePoints,
    streakMultiplier: streakDays >= 7 ? (streakDays >= 30 ? 2.0 : 1.5) : 1.0,
    totalPoints: total,
  };
};

/**
 * Calculate module completion points
 * @param {number} streakDays - Current streak
 * @returns {Object} - Points breakdown
 */
const calculateModulePoints = (streakDays = 0) => {
  const basePoints = BASE_POINTS.MODULE_COMPLETION;
  const total = calculatePoints(basePoints, { streakDays });

  return {
    basePoints,
    streakMultiplier: streakDays >= 7 ? (streakDays >= 30 ? 2.0 : 1.5) : 1.0,
    totalPoints: total,
  };
};

/**
 * Calculate daily login points with streak
 * @param {number} streakDays - Current streak
 * @returns {Object} - Points breakdown
 */
const calculateDailyLoginPoints = (streakDays = 0) => {
  const basePoints = BASE_POINTS.DAILY_LOGIN;
  let bonusPoints = 0;
  const breakdown = [];

  // Streak milestone bonuses
  if (streakDays === 7) {
    bonusPoints = 10;
    breakdown.push({ type: '7-Day Streak Milestone', points: 10 });
  } else if (streakDays === 30) {
    bonusPoints = 50;
    breakdown.push({ type: '30-Day Streak Milestone', points: 50 });
  } else if (streakDays === 100) {
    bonusPoints = 200;
    breakdown.push({ type: '100-Day Streak Milestone', points: 200 });
  }

  const total = calculatePoints(basePoints, { streakDays }) + bonusPoints;

  return {
    basePoints,
    bonusPoints,
    streakMultiplier: streakDays >= 7 ? (streakDays >= 30 ? 2.0 : 1.5) : 1.0,
    totalPoints: total,
    breakdown,
  };
};

/**
 * Get points required for next level
 * @param {number} currentLevel - User's current level
 * @returns {number} - Points needed for next level
 */
const getPointsForNextLevel = (currentLevel) => {
  // Progressive requirement: level * 100
  return (currentLevel + 1) * 100;
};

/**
 * Calculate points needed to reach target level
 * @param {number} currentPoints - User's current points
 * @param {number} targetLevel - Target level
 * @returns {number} - Points needed
 */
const getPointsNeededForLevel = (currentPoints, targetLevel) => {
  const requiredPoints = targetLevel * 100;
  return Math.max(0, requiredPoints - currentPoints);
};

module.exports = {
  BASE_POINTS,
  MULTIPLIERS,
  calculatePoints,
  calculateQuizPoints,
  calculateLessonPoints,
  calculateModulePoints,
  calculateDailyLoginPoints,
  getPointsForNextLevel,
  getPointsNeededForLevel,
};