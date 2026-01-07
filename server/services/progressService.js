/**
 * Progress Service
 * Track user learning progress and completion
 */

const User = require('../models/User');
const Submission = require('../models/Submission');
const UserAchievement = require('../models/UserAchievement');
// const LessonProgress = require('../models/LessonProgress'); // Create as needed
// const ModuleProgress = require('../models/ModuleProgress'); // Create as needed

/**
 * Track lesson progress
 */
const trackLessonProgress = async (userId, lessonId, progressData = {}) => {
  const {
    completed = false,
    timeSpent = 0,
    lastPosition = 0,
  } = progressData;
  
  // const progress = await LessonProgress.findOneAndUpdate(
  //   { user: userId, lesson: lessonId },
  //   {
  //     completed,
  //     timeSpent,
  //     lastPosition,
  //     lastAccessedAt: new Date(),
  //     completedAt: completed ? new Date() : null,
  //   },
  //   { upsert: true, new: true }
  // );
  
  // if (completed) {
  //   // Award points via gamification service
  //   await gamificationService.processLessonRewards(userId, lessonId);
  // }
  
  // return progress;
  
  return {
    userId,
    lessonId,
    completed,
    timeSpent,
    lastPosition,
  };
};

/**
 * Get lesson progress
 */
const getLessonProgress = async (userId, lessonId) => {
  // const progress = await LessonProgress.findOne({
  //   user: userId,
  //   lesson: lessonId,
  // }).populate('lesson');
  
  // return progress;
  
  return {
    userId,
    lessonId,
    completed: false,
    progress: 0,
  };
};

/**
 * Get module progress
 */
const getModuleProgress = async (userId, moduleId) => {
  // Get all lessons in module
  // const lessons = await Lesson.find({ module: moduleId });
  // const lessonIds = lessons.map(l => l._id);
  
  // // Get user's progress for these lessons
  // const completedLessons = await LessonProgress.countDocuments({
  //   user: userId,
  //   lesson: { $in: lessonIds },
  //   completed: true,
  // });
  
  // const totalLessons = lessons.length;
  // const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  
  // return {
  //   moduleId,
  //   totalLessons,
  //   completedLessons,
  //   remainingLessons: totalLessons - completedLessons,
  //   progressPercentage,
  //   isCompleted: completedLessons === totalLessons,
  // };
  
  return {
    moduleId,
    totalLessons: 0,
    completedLessons: 0,
    progressPercentage: 0,
  };
};

/**
 * Get subject progress
 */
const getSubjectProgress = async (userId, subjectId) => {
  // const modules = await Module.find({ subject: subjectId });
  
  // const moduleProgress = await Promise.all(
  //   modules.map(m => getModuleProgress(userId, m._id))
  // );
  
  // const totalModules = modules.length;
  // const completedModules = moduleProgress.filter(p => p.isCompleted).length;
  
  // return {
  //   subjectId,
  //   totalModules,
  //   completedModules,
  //   progressPercentage: totalModules > 0 ? (completedModules / totalModules) * 100 : 0,
  //   modules: moduleProgress,
  // };
  
  return {
    subjectId,
    totalModules: 0,
    completedModules: 0,
    progressPercentage: 0,
  };
};

/**
 * Get overall learning progress
 */
const getOverallProgress = async (userId) => {
  // Quiz progress
  const totalQuizzes = await Submission.countDocuments({
    user: userId,
    status: 'completed',
  });
  
  const passedQuizzes = await Submission.countDocuments({
    user: userId,
    status: 'completed',
    isPassed: true,
  });
  
  // Achievement progress
  const totalAchievements = await UserAchievement.countDocuments({
    user: userId,
  });
  
  const completedAchievements = await UserAchievement.countDocuments({
    user: userId,
    isCompleted: true,
  });
  
  // User stats
  const user = await User.findById(userId);
  
  return {
    user: {
      id: user._id,
      name: user.name,
      level: Math.floor(user.points / 100) + 1,
      points: user.points,
      streak: user.streak,
      badges: user.badges?.length || 0,
    },
    quizzes: {
      total: totalQuizzes,
      passed: passedQuizzes,
      passRate: totalQuizzes > 0 ? (passedQuizzes / totalQuizzes) * 100 : 0,
    },
    achievements: {
      total: totalAchievements,
      completed: completedAchievements,
      completionRate: totalAchievements > 0 ? (completedAchievements / totalAchievements) * 100 : 0,
    },
    // lessons: {
    //   total: totalLessons,
    //   completed: completedLessons,
    // },
  };
};

/**
 * Get learning path recommendations
 */
const getRecommendations = async (userId) => {
  // Based on user's progress, recommend next lessons/quizzes
  // This is a simplified version
  
  const user = await User.findById(userId);
  
  // Get recent activity
  const recentQuizzes = await Submission.find({
    user: userId,
    status: 'completed',
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('quiz');
  
  // Analyze performance
  const avgScore = recentQuizzes.reduce((sum, s) => sum + s.percentage, 0) / (recentQuizzes.length || 1);
  
  let recommendations = {
    difficulty: avgScore >= 80 ? 'medium' : avgScore >= 60 ? 'easy' : 'beginner',
    focus: avgScore < 70 ? 'Review basics' : 'Continue learning',
    suggestedTopics: [],
  };
  
  // Get weak areas (topics with low scores)
  const weakAreas = recentQuizzes
    .filter(q => q.percentage < 70)
    .map(q => q.quiz?.title);
  
  if (weakAreas.length > 0) {
    recommendations.suggestedTopics = [`Review: ${weakAreas[0]}`];
  }
  
  return recommendations;
};

/**
 * Calculate completion rate
 */
const calculateCompletionRate = async (userId, type = 'overall') => {
  let completed = 0;
  let total = 0;
  
  switch (type) {
    case 'quizzes':
      total = await Submission.countDocuments({
        user: userId,
        status: 'completed',
      });
      completed = await Submission.countDocuments({
        user: userId,
        status: 'completed',
        isPassed: true,
      });
      break;
    
    case 'achievements':
      total = await UserAchievement.countDocuments({ user: userId });
      completed = await UserAchievement.countDocuments({
        user: userId,
        isCompleted: true,
      });
      break;
    
    default:
      // Overall completion (simplified)
      const quizTotal = await Submission.countDocuments({
        user: userId,
        status: 'completed',
      });
      const quizCompleted = await Submission.countDocuments({
        user: userId,
        isPassed: true,
      });
      total = quizTotal;
      completed = quizCompleted;
  }
  
  return {
    completed,
    total,
    rate: total > 0 ? (completed / total) * 100 : 0,
  };
};

/**
 * Get learning streak data
 */
const getStreakData = async (userId) => {
  const user = await User.findById(userId);
  const { getStreakStatus, getNextStreakMilestone } = require('../utils/helpers/streakCalculator');
  
  const status = getStreakStatus(user.streak, user.lastLogin);
  const nextMilestone = getNextStreakMilestone(user.streak);
  
  return {
    currentStreak: user.streak,
    status: status.status,
    message: status.message,
    nextMilestone,
  };
};

/**
 * Get time spent learning
 */
const getTimeSpent = async (userId) => {
  // Calculate from quiz attempts and lesson progress
  const quizTime = await Submission.aggregate([
    { $match: { user: userId, status: 'completed' } },
    { $group: { _id: null, totalTime: { $sum: '$timeTaken' } } },
  ]);
  
  // const lessonTime = await LessonProgress.aggregate([
  //   { $match: { user: userId } },
  //   { $group: { _id: null, totalTime: { $sum: '$timeSpent' } } },
  // ]);
  
  const totalSeconds = (quizTime[0]?.totalTime || 0); // + (lessonTime[0]?.totalTime || 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  return {
    totalSeconds,
    hours,
    minutes,
    formatted: `${hours}h ${minutes}m`,
  };
};

/**
 * Mark lesson as completed
 */
const markLessonCompleted = async (userId, lessonId) => {
  return trackLessonProgress(userId, lessonId, {
    completed: true,
    timeSpent: 0,
    lastPosition: 100,
  });
};

/**
 * Reset progress (for testing or user request)
 */
const resetProgress = async (userId, type = 'all') => {
  // if (type === 'all' || type === 'lessons') {
  //   await LessonProgress.deleteMany({ user: userId });
  // }
  
  // if (type === 'all' || type === 'quizzes') {
  //   await Submission.deleteMany({ user: userId });
  // }
  
  return { message: `${type} progress reset` };
};

module.exports = {
  trackLessonProgress,
  getLessonProgress,
  getModuleProgress,
  getSubjectProgress,
  getOverallProgress,
  getRecommendations,
  calculateCompletionRate,
  getStreakData,
  getTimeSpent,
  markLessonCompleted,
  resetProgress,
};