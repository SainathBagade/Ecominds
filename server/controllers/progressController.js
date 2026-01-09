// server/controllers/progressController.js
const UserProgress = require('../models/UserProgress');
const LessonProgress = require('../models/LessonProgress');
const ModuleProgress = require('../models/ModuleProgress');
const Streak = require('../models/Streak');
const StreakHistory = require('../models/StreakHistory');
const { updateDailyMissionProgress } = require('../utils/missionUpdater');

// Get user's overall progress
exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    let userProgress = await UserProgress.findOne({ user: userId })
      .populate('achievements');

    if (!userProgress) {
      userProgress = await UserProgress.create({ user: userId });
    }

    res.json({
      success: true,
      data: userProgress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user progress',
      error: error.message
    });
  }
};

// Update lesson progress
exports.updateLessonProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lessonId, moduleId, score, timeSpent } = req.body;

    let lessonProgress = await LessonProgress.findOne({
      user: userId,
      lesson: lessonId
    });

    if (!lessonProgress) {
      lessonProgress = await LessonProgress.create({
        user: userId,
        lesson: lessonId,
        module: moduleId
      });
    }

    const wasCompleted = lessonProgress.status === 'completed';
    await lessonProgress.updateProgress({ score, timeSpent });

    // Update user progress
    const userProgress = await UserProgress.findOne({ user: userId });

    if (!wasCompleted && lessonProgress.status === 'completed') {
      userProgress.lessonsCompleted += 1;

      // Calculate XP based on score
      const xpEarned = Math.floor(score / 10) * 10; // 10 XP per 10% score
      await userProgress.addXP(xpEarned);

      // Update Daily Missions
      await updateDailyMissionProgress(userId, 'complete_lessons', 1);
      if (xpEarned > 0) {
        await updateDailyMissionProgress(userId, 'earn_xp', xpEarned);
      }

      if (lessonProgress.isPerfect) {
        userProgress.perfectScores += 1;
        await updateDailyMissionProgress(userId, 'perfect_score', 1);
      }
    }

    await userProgress.updateStats({
      studyTime: timeSpent,
      score: score,
      isPerfect: lessonProgress.isPerfect
    });

    // Update module progress
    let moduleProgress = await ModuleProgress.findOne({
      user: userId,
      module: moduleId
    });

    if (!moduleProgress) {
      // Create module progress if it doesn't exist
      moduleProgress = await ModuleProgress.create({
        user: userId,
        module: moduleId,
        totalLessons: 0 // Will be updated by updateModuleProgress
      });
    }

    if (moduleProgress) {
      const wasModuleCompleted = moduleProgress.status === 'completed';
      await moduleProgress.updateModuleProgress();

      // If module just became completed, increment topicsCompleted
      if (!wasModuleCompleted && moduleProgress.status === 'completed') {
        userProgress.stats.topicsCompleted += 1;
        await userProgress.save();
      }
    }

    // Update streak
    const streak = await Streak.findOne({ user: userId });
    if (streak) {
      await streak.updateStreak();
    }

    // Update streak history
    await StreakHistory.updateToday(userId, streak?.currentStreak || 0, {
      lessons: 1,
      xpEarned: Math.floor(score / 10) * 10
    });

    res.json({
      success: true,
      data: {
        lessonProgress,
        userProgress,
        moduleProgress
      },
      message: 'Progress updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating lesson progress',
      error: error.message
    });
  }
};

// Get lesson progress
exports.getLessonProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lessonId } = req.params;

    const lessonProgress = await LessonProgress.findOne({
      user: userId,
      lesson: lessonId
    }).populate('lesson module');

    res.json({
      success: true,
      data: lessonProgress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lesson progress',
      error: error.message
    });
  }
};

// Get module progress
exports.getModuleProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;

    const moduleProgress = await ModuleProgress.findOne({
      user: userId,
      module: moduleId
    }).populate('module');

    const lessonProgresses = await LessonProgress.getModuleProgress(userId, moduleId);

    res.json({
      success: true,
      data: {
        moduleProgress,
        lessonProgresses
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching module progress',
      error: error.message
    });
  }
};

// Get all modules progress
exports.getAllModulesProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const modulesProgress = await ModuleProgress.find({ user: userId })
      .populate('module')
      .sort({ 'module.order': 1 });

    const overallProgress = await ModuleProgress.getUserOverallProgress(userId);

    res.json({
      success: true,
      data: {
        modulesProgress,
        overallProgress: overallProgress[0] || {
          totalModules: 0,
          completedModules: 0,
          inProgressModules: 0,
          avgCompletion: 0,
          avgScore: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching modules progress',
      error: error.message
    });
  }
};

// Unlock module
exports.unlockModule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;

    let moduleProgress = await ModuleProgress.findOne({
      user: userId,
      module: moduleId
    });

    if (!moduleProgress) {
      // Get total lessons count from module
      const Module = require('../models/Module');
      const module = await Module.findById(moduleId);

      moduleProgress = await ModuleProgress.create({
        user: userId,
        module: moduleId,
        totalLessons: module.lessons.length
      });
    }

    await moduleProgress.unlock();

    res.json({
      success: true,
      data: moduleProgress,
      message: 'Module unlocked'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unlocking module',
      error: error.message
    });
  }
};

// Get user statistics
// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fix: Ensure UserProgress exists, create if missing (similar to getUserProgress)
    let userProgress = await UserProgress.findOne({ user: userId });

    if (!userProgress) {
      console.log(`⚠️ UserProgress not found for user ${userId} in stats call. Creating now...`);
      try {
        userProgress = await UserProgress.create({ user: userId });
      } catch (createError) {
        console.error('❌ Error auto-creating UserProgress:', createError);
        // Fallback to empty object if creation fails, don't crash the whole stats call
        userProgress = {};
      }
    }

    const lessonStats = await LessonProgress.getUserStats(userId);
    const moduleStats = await ModuleProgress.getUserOverallProgress(userId);
    const streak = await Streak.findOne({ user: userId });

    res.json({
      success: true,
      data: {
        userProgress,
        lessonStats: lessonStats || {}, // ensure not null
        moduleStats: moduleStats[0] || {},
        streak: {
          current: streak?.currentStreak || 0,
          longest: streak?.longestStreak || 0
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user stats',
      error: error.message
    });
  }
};

// Issue certificate
exports.issueCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;
    const { certificateUrl } = req.body;

    const moduleProgress = await ModuleProgress.findOne({
      user: userId,
      module: moduleId
    });

    if (!moduleProgress) {
      return res.status(404).json({
        success: false,
        message: 'Module progress not found'
      });
    }

    await moduleProgress.issueCertificate(certificateUrl);

    res.json({
      success: true,
      data: moduleProgress,
      message: 'Certificate issued successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Reset user progress
exports.resetUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const User = require('../models/User');

    // 1. Delete all progress records
    await LessonProgress.deleteMany({ user: userId });
    await ModuleProgress.deleteMany({ user: userId });

    // 2. Reset UserProgress model
    let userProgress = await UserProgress.findOne({ user: userId });
    if (userProgress) {
      userProgress.totalXP = 0;
      userProgress.level = 1;
      userProgress.coins = 0;
      userProgress.lessonsCompleted = 0;
      userProgress.perfectScores = 0;
      userProgress.achievements = [];
      userProgress.stats = {
        totalStudyTime: 0,
        averageScore: 0,
        consecutivePerfectScores: 0,
        topicsCompleted: 0
      };
      await userProgress.save();
    }

    // 3. Reset User model fields
    await User.findByIdAndUpdate(userId, {
      $set: {
        points: 0,
        streak: 0,
        badges: [],
        achievements: []
      }
    });

    res.json({
      success: true,
      message: 'Your learning progress has been reset. You can now start from the beginning!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting progress',
      error: error.message
    });
  }
};