/**
 * Level Calculator Utility
 * Handles user level calculations based on points
 */

// Level titles/names
const LEVEL_TITLES = {
  1: 'Eco Beginner',
  5: 'Eco Explorer',
  10: 'Eco Enthusiast',
  15: 'Eco Champion',
  20: 'Eco Guardian',
  25: 'Eco Master',
  30: 'Eco Legend',
  40: 'Eco Hero',
  50: 'Eco Savior',
};

// Level colors for UI
const LEVEL_COLORS = {
  1: '#95C623',    // Green
  10: '#4CAF50',   // Dark Green
  20: '#2196F3',   // Blue
  30: '#9C27B0',   // Purple
  40: '#FF9800',   // Orange
  50: '#F44336',   // Red
};

/**
 * Calculate user level from points
 * Formula: level = floor(points / 100)
 * @param {number} points - User's total points
 * @returns {number} - Current level
 */
const calculateLevel = (points) => {
  if (!points || points < 0) return 1;
  return Math.floor(points / 100) + 1;
};

/**
 * Calculate points needed for next level
 * @param {number} currentPoints - User's current points
 * @returns {number} - Points needed for next level
 */
const getPointsToNextLevel = (currentPoints) => {
  const currentLevel = calculateLevel(currentPoints);
  const nextLevelPoints = currentLevel * 100;
  return nextLevelPoints - currentPoints;
};

/**
 * Calculate level progress percentage
 * @param {number} currentPoints - User's current points
 * @returns {number} - Progress percentage (0-100)
 */
const getLevelProgress = (currentPoints) => {
  const currentLevel = calculateLevel(currentPoints);
  const levelStartPoints = (currentLevel - 1) * 100;
  const levelEndPoints = currentLevel * 100;
  const pointsInLevel = currentPoints - levelStartPoints;
  const pointsNeeded = levelEndPoints - levelStartPoints;
  
  return Math.min(Math.round((pointsInLevel / pointsNeeded) * 100), 100);
};

/**
 * Get level title/name
 * @param {number} level - User's level
 * @returns {string} - Level title
 */
const getLevelTitle = (level) => {
  // Find the highest level title that applies
  const sortedLevels = Object.keys(LEVEL_TITLES)
    .map(Number)
    .sort((a, b) => b - a);
  
  for (const levelThreshold of sortedLevels) {
    if (level >= levelThreshold) {
      return LEVEL_TITLES[levelThreshold];
    }
  }
  
  return LEVEL_TITLES[1]; // Default to first title
};

/**
 * Get level color for UI
 * @param {number} level - User's level
 * @returns {string} - Hex color code
 */
const getLevelColor = (level) => {
  const sortedLevels = Object.keys(LEVEL_COLORS)
    .map(Number)
    .sort((a, b) => b - a);
  
  for (const levelThreshold of sortedLevels) {
    if (level >= levelThreshold) {
      return LEVEL_COLORS[levelThreshold];
    }
  }
  
  return LEVEL_COLORS[1]; // Default color
};

/**
 * Get complete level information
 * @param {number} points - User's total points
 * @returns {Object} - Complete level info
 */
const getLevelInfo = (points) => {
  const level = calculateLevel(points);
  const progress = getLevelProgress(points);
  const pointsToNext = getPointsToNextLevel(points);
  const title = getLevelTitle(level);
  const color = getLevelColor(level);
  
  return {
    level,
    title,
    color,
    currentPoints: points,
    pointsToNextLevel: pointsToNext,
    progress,
    nextLevel: level + 1,
    nextLevelTitle: getLevelTitle(level + 1),
  };
};

/**
 * Calculate level from specific point threshold
 * @param {number} points - Points
 * @returns {number} - Level at that point threshold
 */
const getLevelAtPoints = (points) => {
  return calculateLevel(points);
};

/**
 * Get all level milestones up to a certain level
 * @param {number} maxLevel - Maximum level to show
 * @returns {Array} - Array of level milestones
 */
const getLevelMilestones = (maxLevel = 50) => {
  const milestones = [];
  
  for (let level = 1; level <= maxLevel; level++) {
    const pointsRequired = (level - 1) * 100;
    const title = getLevelTitle(level);
    const color = getLevelColor(level);
    
    milestones.push({
      level,
      pointsRequired,
      title,
      color,
    });
  }
  
  return milestones;
};

/**
 * Check if user leveled up after earning points
 * @param {number} oldPoints - Points before
 * @param {number} newPoints - Points after
 * @returns {Object} - Level up info
 */
const checkLevelUp = (oldPoints, newPoints) => {
  const oldLevel = calculateLevel(oldPoints);
  const newLevel = calculateLevel(newPoints);
  const leveledUp = newLevel > oldLevel;
  
  return {
    leveledUp,
    oldLevel,
    newLevel,
    levelsGained: newLevel - oldLevel,
    newTitle: leveledUp ? getLevelTitle(newLevel) : null,
  };
};

/**
 * Get rank based on level (for leaderboards)
 * @param {number} level - User's level
 * @returns {string} - Rank name
 */
const getRankFromLevel = (level) => {
  if (level >= 50) return 'Legendary';
  if (level >= 40) return 'Heroic';
  if (level >= 30) return 'Epic';
  if (level >= 20) return 'Rare';
  if (level >= 10) return 'Uncommon';
  return 'Common';
};

module.exports = {
  LEVEL_TITLES,
  LEVEL_COLORS,
  calculateLevel,
  getPointsToNextLevel,
  getLevelProgress,
  getLevelTitle,
  getLevelColor,
  getLevelInfo,
  getLevelAtPoints,
  getLevelMilestones,
  checkLevelUp,
  getRankFromLevel,
};