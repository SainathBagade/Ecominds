/**
 * Mission Service
 * Generates and manages daily/weekly missions for users
 */

const Mission = require('../models/Mission');
const UserMission = require('../models/UserMission');
const User = require('../models/User');

/**
 * Mission Templates
 * Define different types of missions with their requirements
 */
const MISSION_TEMPLATES = {
  // Lesson-based missions
  COMPLETE_LESSONS_EASY: {
    type: 'complete_lesson',
    title: 'Knowledge Seeker',
    description: 'Complete 2 eco-lessons',
    target: 2,
    reward: 20,
    difficulty: 'easy',
    icon: '📚',
  },
  COMPLETE_LESSONS_MEDIUM: {
    type: 'complete_lesson',
    title: 'Eco Student',
    description: 'Complete 5 eco-lessons',
    target: 5,
    reward: 50,
    difficulty: 'medium',
    icon: '📖',
  },
  COMPLETE_LESSONS_HARD: {
    type: 'complete_lesson',
    title: 'Master Learner',
    description: 'Complete 10 eco-lessons',
    target: 10,
    reward: 100,
    difficulty: 'hard',
    icon: '🎓',
  },

  // Quiz-based missions
  PASS_QUIZ_EASY: {
    type: 'take_quiz',
    title: 'Quiz Taker',
    description: 'Pass 1 quiz with 60% or higher',
    target: 1,
    reward: 15,
    difficulty: 'easy',
    icon: '✅',
  },
  PASS_QUIZ_MEDIUM: {
    type: 'take_quiz',
    title: 'Quiz Master',
    description: 'Pass 3 quizzes with 70% or higher',
    target: 3,
    reward: 45,
    difficulty: 'medium',
    icon: '🏆',
  },
  PASS_QUIZ_HARD: {
    type: 'take_quiz',
    title: 'Perfect Score',
    description: 'Get 100% on any quiz',
    target: 1,
    reward: 75,
    difficulty: 'hard',
    icon: '⭐',
  },

  // Points-based missions
  EARN_POINTS_EASY: {
    type: 'earn_points',
    title: 'Point Collector',
    description: 'Earn 50 eco-points',
    target: 50,
    reward: 25,
    difficulty: 'easy',
    icon: '💰',
  },
  EARN_POINTS_MEDIUM: {
    type: 'earn_points',
    title: 'Point Hunter',
    description: 'Earn 150 eco-points',
    target: 150,
    reward: 60,
    difficulty: 'medium',
    icon: '💎',
  },
  EARN_POINTS_HARD: {
    type: 'earn_points',
    title: 'Point Champion',
    description: 'Earn 300 eco-points',
    target: 300,
    reward: 120,
    difficulty: 'hard',
    icon: '👑',
  },

  // Activity-based missions
  LOG_ACTIVITIES_EASY: {
    type: 'log_activity',
    title: 'Activity Logger',
    description: 'Log 3 eco-activities',
    target: 3,
    reward: 30,
    difficulty: 'easy',
    icon: '📝',
  },
  LOG_ACTIVITIES_MEDIUM: {
    type: 'log_activity',
    title: 'Daily Tracker',
    description: 'Log activities for 5 consecutive days',
    target: 5,
    reward: 75,
    difficulty: 'medium',
    icon: '📅',
  },

  // Social missions
  SHARE_ACHIEVEMENT: {
    type: 'share_achievement',
    title: 'Eco Influencer',
    description: 'Share 1 achievement on social media',
    target: 1,
    reward: 20,
    difficulty: 'easy',
    icon: '🔗',
  },

  // Streak missions
  LOGIN_STREAK: {
    type: 'login_streak',
    title: 'Dedicated User',
    description: 'Login for 7 consecutive days',
    target: 7,
    reward: 100,
    difficulty: 'medium',
    icon: '🔥',
  },
};

/**
 * Generate random daily missions for a user
 * @param {string} userId - User ID
 * @param {number} count - Number of missions to generate (default: 3)
 * @returns {Promise<Array>} Array of generated missions
 */
const generateDailyMissions = async (userId, count = 3) => {
  try {
    // Check if user already has active daily missions
    const existingMissions = await UserMission.find({
      user: userId,
      status: 'active',
      expiresAt: { $gt: new Date() },
    });

    if (existingMissions.length >= count) {
      return existingMissions;
    }

    // Get user to determine appropriate difficulty
    const user = await User.findById(userId);
    const missions = [];

    // Select missions based on user level/experience
    const availableTemplates = getAvailableTemplates(user);
    const selectedTemplates = selectRandomMissions(availableTemplates, count);

    // Create expiration date (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create user missions
    for (const template of selectedTemplates) {
      const userMission = new UserMission({
        user: userId,
        type: template.type,
        title: template.title,
        description: template.description,
        target: template.target,
        current: 0,
        reward: template.reward,
        difficulty: template.difficulty,
        icon: template.icon,
        status: 'active',
        expiresAt,
      });

      await userMission.save();
      missions.push(userMission);
    }

    return missions;
  } catch (error) {
    console.error('Error generating daily missions:', error);
    throw new Error('Failed to generate daily missions');
  }
};

/**
 * Generate weekly missions (more challenging)
 * @param {string} userId - User ID
 * @param {number} count - Number of missions (default: 5)
 * @returns {Promise<Array>} Array of generated missions
 */
const generateWeeklyMissions = async (userId, count = 5) => {
  try {
    const user = await User.findById(userId);
    const missions = [];

    // Focus on medium/hard difficulty for weekly missions
    const availableTemplates = Object.values(MISSION_TEMPLATES).filter(
      (t) => t.difficulty === 'medium' || t.difficulty === 'hard'
    );

    const selectedTemplates = selectRandomMissions(availableTemplates, count);

    // Create expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    for (const template of selectedTemplates) {
      const userMission = new UserMission({
        user: userId,
        type: template.type,
        title: `Weekly: ${template.title}`,
        description: template.description,
        target: template.target,
        current: 0,
        reward: Math.floor(template.reward * 1.5), // 50% bonus for weekly
        difficulty: template.difficulty,
        icon: template.icon,
        status: 'active',
        expiresAt,
      });

      await userMission.save();
      missions.push(userMission);
    }

    return missions;
  } catch (error) {
    console.error('Error generating weekly missions:', error);
    throw new Error('Failed to generate weekly missions');
  }
};

/**
 * Update mission progress
 * @param {string} userId - User ID
 * @param {string} missionType - Type of mission to update
 * @param {number} incrementBy - Amount to increment (default: 1)
 * @returns {Promise<Array>} Updated missions
 */
const updateMissionProgress = async (userId, missionType, incrementBy = 1) => {
  try {
    // Find active missions of this type for the user
    const missions = await UserMission.find({
      user: userId,
      type: missionType,
      status: 'active',
      expiresAt: { $gt: new Date() },
    });

    const updatedMissions = [];

    for (const mission of missions) {
      mission.current = Math.min(mission.current + incrementBy, mission.target);

      // Check if mission is completed
      if (mission.current >= mission.target && mission.status === 'active') {
        mission.status = 'completed';
        mission.completedAt = new Date();

        // Award points to user
        await awardMissionReward(userId, mission.reward);
      }

      await mission.save();
      updatedMissions.push(mission);
    }

    return updatedMissions;
  } catch (error) {
    console.error('Error updating mission progress:', error);
    throw new Error('Failed to update mission progress');
  }
};

/**
 * Award mission reward to user
 * @param {string} userId - User ID
 * @param {number} points - Points to award
 */
const awardMissionReward = async (userId, points) => {
  try {
    const user = await User.findById(userId);
    if (user) {
      user.ecoPoints = (user.ecoPoints || 0) + points;
      await user.save();
    }
  } catch (error) {
    console.error('Error awarding mission reward:', error);
  }
};

/**
 * Get available mission templates based on user level
 * @param {object} user - User object
 * @returns {Array} Available templates
 */
const getAvailableTemplates = (user) => {
  const userLevel = user?.level || 1;
  const templates = Object.values(MISSION_TEMPLATES);

  // Filter by difficulty based on user level
  if (userLevel < 5) {
    return templates.filter((t) => t.difficulty === 'easy');
  } else if (userLevel < 10) {
    return templates.filter((t) => t.difficulty === 'easy' || t.difficulty === 'medium');
  }

  return templates; // All difficulties for high-level users
};

/**
 * Select random missions from available templates
 * @param {Array} templates - Available templates
 * @param {number} count - Number to select
 * @returns {Array} Selected templates
 */
const selectRandomMissions = (templates, count) => {
  const shuffled = [...templates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

/**
 * Get user's active missions
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Active missions
 */
const getActiveMissions = async (userId) => {
  try {
    return await UserMission.find({
      user: userId,
      status: 'active',
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error getting active missions:', error);
    throw new Error('Failed to get active missions');
  }
};

/**
 * Get user's completed missions
 * @param {string} userId - User ID
 * @param {number} limit - Limit results (default: 10)
 * @returns {Promise<Array>} Completed missions
 */
const getCompletedMissions = async (userId, limit = 10) => {
  try {
    return await UserMission.find({
      user: userId,
      status: 'completed',
    })
      .sort({ completedAt: -1 })
      .limit(limit);
  } catch (error) {
    console.error('Error getting completed missions:', error);
    throw new Error('Failed to get completed missions');
  }
};

/**
 * Expire old missions
 * @returns {Promise<number>} Number of expired missions
 */
const expireOldMissions = async () => {
  try {
    const result = await UserMission.updateMany(
      {
        status: 'active',
        expiresAt: { $lt: new Date() },
      },
      {
        $set: { status: 'expired' },
      }
    );

    return result.modifiedCount;
  } catch (error) {
    console.error('Error expiring missions:', error);
    throw new Error('Failed to expire missions');
  }
};

/**
 * Get mission statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<object>} Mission stats
 */
const getMissionStats = async (userId) => {
  try {
    const totalCompleted = await UserMission.countDocuments({
      user: userId,
      status: 'completed',
    });

    const totalActive = await UserMission.countDocuments({
      user: userId,
      status: 'active',
      expiresAt: { $gt: new Date() },
    });

    const totalExpired = await UserMission.countDocuments({
      user: userId,
      status: 'expired',
    });

    const totalRewards = await UserMission.aggregate([
      { $match: { user: userId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$reward' } } },
    ]);

    return {
      totalCompleted,
      totalActive,
      totalExpired,
      totalRewardsEarned: totalRewards[0]?.total || 0,
      completionRate:
        totalCompleted + totalExpired > 0
          ? ((totalCompleted / (totalCompleted + totalExpired)) * 100).toFixed(2)
          : 0,
    };
  } catch (error) {
    console.error('Error getting mission stats:', error);
    throw new Error('Failed to get mission stats');
  }
};

module.exports = {
  MISSION_TEMPLATES,
  generateDailyMissions,
  generateWeeklyMissions,
  updateMissionProgress,
  getActiveMissions,
  getCompletedMissions,
  expireOldMissions,
  getMissionStats,
};