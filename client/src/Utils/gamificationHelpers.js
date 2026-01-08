import { POINT_VALUES, STREAK_MILESTONES, BADGE_TYPES } from './constants';

// Calculate user level based on points
export const calculateLevel = (points) => {
  if (!points || points < 0) return 1;
  return Math.floor(points / 100) + 1;
};

// Calculate points needed for next level
export const getNextLevelPoints = (currentLevel) => {
  return currentLevel * 100;
};

// Calculate points to next level
export const getPointsToNextLevel = (currentPoints) => {
  const currentLevel = calculateLevel(currentPoints);
  const nextLevelPoints = getNextLevelPoints(currentLevel);
  return nextLevelPoints - currentPoints;
};

// Calculate level progress percentage
export const getLevelProgress = (currentPoints) => {
  const currentLevel = calculateLevel(currentPoints);
  const levelStartPoints = (currentLevel - 1) * 100;
  const levelEndPoints = currentLevel * 100;
  const pointsInLevel = currentPoints - levelStartPoints;
  const pointsNeeded = levelEndPoints - levelStartPoints;
  
  return Math.round((pointsInLevel / pointsNeeded) * 100);
};

// Calculate streak bonus multiplier
export const getStreakBonus = (streakDays) => {
  if (streakDays < 7) return 1;
  if (streakDays < 30) return 1.5;
  if (streakDays < 100) return 2;
  return 2.5;
};

// Calculate points with streak bonus
export const calculatePointsWithBonus = (basePoints, streakDays) => {
  const multiplier = getStreakBonus(streakDays);
  return Math.floor(basePoints * multiplier);
};

// Get streak milestone reward
export const getStreakMilestoneReward = (streakDays) => {
  return STREAK_MILESTONES[streakDays] || null;
};

// Check if user reached a milestone
export const isStreakMilestone = (streakDays) => {
  return !!STREAK_MILESTONES[streakDays];
};

// Get badge icon URL
export const getBadgeIcon = (badgeName) => {
  const badgeIcons = {
    [BADGE_TYPES.FIRST_LESSON]: '📚',
    [BADGE_TYPES.FIRST_QUIZ]: '📝',
    [BADGE_TYPES.WEEK_WARRIOR]: '🔥',
    [BADGE_TYPES.QUIZ_MASTER]: '🎯',
    [BADGE_TYPES.ECO_CHAMPION]: '🌱',
    [BADGE_TYPES.MODULE_MASTER]: '🏆',
  };
  
  return badgeIcons[badgeName] || '🏅';
};

// Get badge color
export const getBadgeColor = (badgeName) => {
  const badgeColors = {
    [BADGE_TYPES.FIRST_LESSON]: 'blue',
    [BADGE_TYPES.FIRST_QUIZ]: 'purple',
    [BADGE_TYPES.WEEK_WARRIOR]: 'orange',
    [BADGE_TYPES.QUIZ_MASTER]: 'green',
    [BADGE_TYPES.ECO_CHAMPION]: 'primary',
    [BADGE_TYPES.MODULE_MASTER]: 'yellow',
  };
  
  return badgeColors[badgeName] || 'gray';
};

// Get rank title based on points
export const getRankTitle = (points) => {
  if (points < 100) return 'Beginner';
  if (points < 500) return 'Explorer';
  if (points < 1000) return 'Adventurer';
  if (points < 2500) return 'Expert';
  if (points < 5000) return 'Master';
  if (points < 10000) return 'Champion';
  return 'Legend';
};

// Get rank color
export const getRankColor = (points) => {
  if (points < 100) return 'gray';
  if (points < 500) return 'blue';
  if (points < 1000) return 'green';
  if (points < 2500) return 'purple';
  if (points < 5000) return 'orange';
  if (points < 10000) return 'red';
  return 'gold';
};

// Calculate quiz score percentage
export const calculateQuizScore = (correctAnswers, totalQuestions) => {
  if (!totalQuestions || totalQuestions === 0) return 0;
  return Math.round((correctAnswers / totalQuestions) * 100);
};

// Check if quiz passed
export const isQuizPassed = (score, passingScore = 80) => {
  return score >= passingScore;
};

// Calculate points for quiz
export const calculateQuizPoints = (score) => {
  if (score >= 90) return POINT_VALUES.QUIZ_PASS + 10; // Bonus for excellence
  if (score >= 80) return POINT_VALUES.QUIZ_PASS;
  return POINT_VALUES.QUIZ_PARTIAL;
};

// Get completion rate
export const getCompletionRate = (completed, total) => {
  if (!total || total === 0) return 0;
  return Math.round((completed / total) * 100);
};

// Get difficulty color
export const getDifficultyColor = (difficulty) => {
  const colors = {
    easy: 'green',
    medium: 'yellow',
    hard: 'red',
  };
  return colors[difficulty?.toLowerCase()] || 'gray';
};

// Get difficulty icon
export const getDifficultyIcon = (difficulty) => {
  const icons = {
    easy: '⭐',
    medium: '⭐⭐',
    hard: '⭐⭐⭐',
  };
  return icons[difficulty?.toLowerCase()] || '⭐';
};

// Format large numbers (1000 -> 1K)
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Get leaderboard position suffix (1st, 2nd, 3rd)
export const getPositionSuffix = (position) => {
  if (position === 1) return '1st';
  if (position === 2) return '2nd';
  if (position === 3) return '3rd';
  return `${position}th`;
};

// Get medal emoji for top 3
export const getMedalEmoji = (position) => {
  if (position === 1) return '🥇';
  if (position === 2) return '🥈';
  if (position === 3) return '🥉';
  return '';
};

// Check if user is in top 3
export const isTopThree = (position) => {
  return position >= 1 && position <= 3;
};

// Calculate average score
export const calculateAverageScore = (scores) => {
  if (!scores || scores.length === 0) return 0;
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / scores.length);
};

// Get achievement progress
export const getAchievementProgress = (current, target) => {
  if (!target || target === 0) return 100;
  const progress = (current / target) * 100;
  return Math.min(progress, 100);
};

// Check if achievement unlocked
export const isAchievementUnlocked = (current, target) => {
  return current >= target;
};

// Get time-based greeting
export const getGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// Get motivational message based on progress
export const getMotivationalMessage = (progress) => {
  if (progress === 0) return "Let's get started! 🚀";
  if (progress < 25) return "You're doing great! Keep going! 💪";
  if (progress < 50) return "You're halfway there! 🎯";
  if (progress < 75) return "Amazing progress! Keep it up! ⭐";
  if (progress < 100) return "Almost there! You've got this! 🔥";
  return "Congratulations! You did it! 🎉";
};