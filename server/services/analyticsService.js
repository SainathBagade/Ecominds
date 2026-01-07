/**
 * Analytics Service
 * Track and analyze user activity, performance, and engagement
 */

const User = require('../models/User');
const Submission = require('../models/Submission');
const EcoPoints = require('../models/EcoPoints');
const UserBadge = require('../models/UserBadge');
const { getDateRange } = require('../utils/helpers/dateHelper');

/**
 * Get user analytics
 */
const getUserAnalytics = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Quiz statistics
  const totalQuizzes = await Submission.countDocuments({
    user: userId,
    status: 'completed',
  });
  
  const passedQuizzes = await Submission.countDocuments({
    user: userId,
    status: 'completed',
    isPassed: true,
  });
  
  const perfectScores = await Submission.countDocuments({
    user: userId,
    percentage: 100,
  });
  
  const avgScore = await Submission.aggregate([
    { $match: { user: user._id, status: 'completed' } },
    { $group: { _id: null, avgPercentage: { $avg: '$percentage' } } },
  ]);
  
  // Points statistics
  const totalPoints = user.points;
  const pointsThisWeek = await EcoPoints.aggregate([
    {
      $match: {
        user: user._id,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  
  // Badge count
  const badgeCount = await UserBadge.countDocuments({ user: userId });
  
  // Activity streak
  const currentStreak = user.streak;
  
  return {
    userId,
    name: user.name,
    level: Math.floor(user.points / 100) + 1,
    totalPoints,
    pointsThisWeek: pointsThisWeek[0]?.total || 0,
    quizzes: {
      total: totalQuizzes,
      passed: passedQuizzes,
      failed: totalQuizzes - passedQuizzes,
      perfectScores,
      averageScore: avgScore[0]?.avgPercentage || 0,
      passRate: totalQuizzes > 0 ? (passedQuizzes / totalQuizzes) * 100 : 0,
    },
    badges: badgeCount,
    streak: currentStreak,
  };
};

/**
 * Get system-wide analytics
 */
const getSystemAnalytics = async () => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({
    lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  });
  
  const totalQuizzes = await Submission.countDocuments({ status: 'completed' });
  const totalPoints = await EcoPoints.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  
  const avgQuizScore = await Submission.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, avg: { $avg: '$percentage' } } },
  ]);
  
  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      activeRate: (activeUsers / totalUsers) * 100,
    },
    quizzes: {
      totalCompleted: totalQuizzes,
      averageScore: avgQuizScore[0]?.avg || 0,
    },
    points: {
      totalAwarded: totalPoints[0]?.total || 0,
    },
  };
};

/**
 * Get quiz performance analytics
 */
const getQuizAnalytics = async (quizId) => {
  const submissions = await Submission.find({ quiz: quizId, status: 'completed' });
  
  if (submissions.length === 0) {
    return {
      quizId,
      totalAttempts: 0,
      passRate: 0,
      averageScore: 0,
    };
  }
  
  const passed = submissions.filter(s => s.isPassed).length;
  const avgScore = submissions.reduce((sum, s) => sum + s.percentage, 0) / submissions.length;
  const avgTime = submissions.reduce((sum, s) => sum + s.timeTaken, 0) / submissions.length;
  
  return {
    quizId,
    totalAttempts: submissions.length,
    passed,
    failed: submissions.length - passed,
    passRate: (passed / submissions.length) * 100,
    averageScore: avgScore,
    averageTime: avgTime,
    perfectScores: submissions.filter(s => s.percentage === 100).length,
  };
};

/**
 * Get engagement metrics
 */
const getEngagementMetrics = async (period = 'week') => {
  const { startDate, endDate } = getDateRange(period);
  
  const activeUsers = await User.countDocuments({
    lastLogin: { $gte: startDate, $lte: endDate },
  });
  
  const quizzesCompleted = await Submission.countDocuments({
    status: 'completed',
    createdAt: { $gte: startDate, $lte: endDate },
  });
  
  const pointsEarned = await EcoPoints.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  
  const badgesEarned = await UserBadge.countDocuments({
    earnedAt: { $gte: startDate, $lte: endDate },
  });
  
  return {
    period,
    startDate,
    endDate,
    activeUsers,
    quizzesCompleted,
    pointsEarned: pointsEarned[0]?.total || 0,
    badgesEarned,
    avgQuizzesPerUser: activeUsers > 0 ? quizzesCompleted / activeUsers : 0,
  };
};

/**
 * Get learning progress analytics
 */
const getLearningProgress = async (userId) => {
  const submissions = await Submission.find({
    user: userId,
    status: 'completed',
  }).sort({ createdAt: 1 });
  
  // Calculate progress over time
  const progressData = submissions.map((sub, index) => ({
    date: sub.createdAt,
    quizNumber: index + 1,
    score: sub.percentage,
    isPassed: sub.isPassed,
  }));
  
  // Calculate improvement rate
  if (progressData.length > 1) {
    const firstHalf = progressData.slice(0, Math.floor(progressData.length / 2));
    const secondHalf = progressData.slice(Math.floor(progressData.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.score, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.score, 0) / secondHalf.length;
    
    const improvement = secondHalfAvg - firstHalfAvg;
    
    return {
      totalQuizzes: progressData.length,
      progressData,
      improvement,
      trend: improvement > 0 ? 'improving' : improvement < 0 ? 'declining' : 'stable',
    };
  }
  
  return {
    totalQuizzes: progressData.length,
    progressData,
    improvement: 0,
    trend: 'insufficient_data',
  };
};

/**
 * Get points breakdown
 */
const getPointsBreakdown = async (userId) => {
  const pointsData = await EcoPoints.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: '$source',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);
  
  const totalPoints = pointsData.reduce((sum, item) => sum + item.total, 0);
  
  const breakdown = pointsData.map(item => ({
    source: item._id,
    points: item.total,
    count: item.count,
    percentage: (item.total / totalPoints) * 100,
  }));
  
  return {
    totalPoints,
    breakdown,
  };
};

/**
 * Get activity heatmap data
 */
const getActivityHeatmap = async (userId, days = 30) => {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const activity = await Submission.aggregate([
    {
      $match: {
        user: userId,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  
  return activity.map(day => ({
    date: day._id,
    count: day.count,
  }));
};

module.exports = {
  getUserAnalytics,
  getSystemAnalytics,
  getQuizAnalytics,
  getEngagementMetrics,
  getLearningProgress,
  getPointsBreakdown,
  getActivityHeatmap,
};