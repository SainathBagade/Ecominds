/**
 * Leaderboard Service
 * Handles all leaderboard calculations and rankings
 */

const User = require('../models/User');
const Submission = require('../models/Submission');
const EcoPoints = require('../models/EcoPoints');
const { formatLeaderboard } = require('../utils/helpers/responseFormatter');
const { getDateRange } = require('../utils/helpers/dateHelper');
const cacheService = require('./cacheService');

/**
 * Get global leaderboard
 */
const getGlobalLeaderboard = async (limit = 20, period = 'all_time') => {
  // Check cache first
  const cached = cacheService.getCachedLeaderboard('global', period);
  if (cached) return cached;
  
  let dateFilter = {};
  
  if (period !== 'all_time') {
    const { startDate } = getDateRange(period);
    
    // Get points earned in period
    const users = await EcoPoints.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$user',
          points: { $sum: '$amount' },
        },
      },
      { $sort: { points: -1 } },
      { $limit: limit },
    ]);
    
    // Populate user details
    const leaderboard = await User.populate(users, {
      path: '_id',
      select: 'name email schoolID grade points streak badges',
    });
    
    const formatted = formatLeaderboard(
      leaderboard.map(item => ({
        ...item._id.toObject(),
        periodPoints: item.points,
      }))
    );
    
    // Cache result
    cacheService.cacheLeaderboard('global', period, formatted);
    
    return formatted;
  }
  
  // All-time leaderboard
  const users = await User.find({ points: { $gt: 0 } })
    .select('name email schoolID grade points streak badges')
    .sort({ points: -1 })
    .limit(limit);
  
  const formatted = formatLeaderboard(users);
  
  // Cache result
  cacheService.cacheLeaderboard('global', period, formatted);
  
  return formatted;
};

/**
 * Get school leaderboard
 */
const getSchoolLeaderboard = async (schoolID, limit = 20, period = 'all_time') => {
  const cached = cacheService.getCachedLeaderboard(`school-${schoolID}`, period);
  if (cached) return cached;
  
  let query = { schoolID };
  
  if (period !== 'all_time') {
    const { startDate } = getDateRange(period);
    
    const users = await EcoPoints.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDoc',
        },
      },
      { $unwind: '$userDoc' },
      {
        $match: {
          'userDoc.schoolID': schoolID,
        },
      },
      {
        $group: {
          _id: '$user',
          points: { $sum: '$amount' },
        },
      },
      { $sort: { points: -1 } },
      { $limit: limit },
    ]);
    
    const leaderboard = await User.populate(users, {
      path: '_id',
      select: 'name email schoolID grade points streak badges',
    });
    
    const formatted = formatLeaderboard(
      leaderboard.map(item => ({
        ...item._id.toObject(),
        periodPoints: item.points,
      }))
    );
    
    cacheService.cacheLeaderboard(`school-${schoolID}`, period, formatted);
    return formatted;
  }
  
  const users = await User.find({ ...query, points: { $gt: 0 } })
    .select('name email schoolID grade points streak badges')
    .sort({ points: -1 })
    .limit(limit);
  
  const formatted = formatLeaderboard(users);
  cacheService.cacheLeaderboard(`school-${schoolID}`, period, formatted);
  
  return formatted;
};

/**
 * Get grade leaderboard
 */
const getGradeLeaderboard = async (grade, limit = 20) => {
  const users = await User.find({ grade, points: { $gt: 0 } })
    .select('name email schoolID grade points streak badges')
    .sort({ points: -1 })
    .limit(limit);
  
  return formatLeaderboard(users);
};

/**
 * Get quiz leaderboard
 */
const getQuizLeaderboard = async (quizId, limit = 20) => {
  const submissions = await Submission.find({
    quiz: quizId,
    status: 'completed',
  })
    .populate('user', 'name schoolID grade')
    .sort({ score: -1, timeTaken: 1 })
    .limit(limit);
  
  return submissions.map((sub, index) => ({
    rank: index + 1,
    userId: sub.user._id,
    name: sub.user.name,
    schoolID: sub.user.schoolID,
    grade: sub.user.grade,
    score: sub.score,
    percentage: sub.percentage,
    timeTaken: sub.timeTaken,
    attemptNumber: sub.attemptNumber,
  }));
};

/**
 * Get user's rank
 */
const getUserRank = async (userId, type = 'global', identifier = null) => {
  let rank = 0;
  
  switch (type) {
    case 'global':
      rank = await User.countDocuments({
        points: { $gt: 0 },
        _id: { $ne: userId },
      });
      const user = await User.findById(userId);
      rank = await User.countDocuments({
        points: { $gt: user.points },
      });
      break;
    
    case 'school':
      const schoolUser = await User.findById(userId);
      rank = await User.countDocuments({
        schoolID: schoolUser.schoolID,
        points: { $gt: schoolUser.points },
      });
      break;
    
    case 'grade':
      const gradeUser = await User.findById(userId);
      rank = await User.countDocuments({
        grade: gradeUser.grade,
        points: { $gt: gradeUser.points },
      });
      break;
  }
  
  return rank + 1; // +1 because count returns 0-based
};

/**
 * Get streak leaderboard
 */
const getStreakLeaderboard = async (limit = 20) => {
  const users = await User.find({ streak: { $gt: 0 } })
    .select('name email schoolID grade points streak badges')
    .sort({ streak: -1, points: -1 })
    .limit(limit);
  
  return users.map((user, index) => ({
    rank: index + 1,
    userId: user._id,
    name: user.name,
    schoolID: user.schoolID,
    grade: user.grade,
    streak: user.streak,
    points: user.points,
    badges: user.badges?.length || 0,
  }));
};

/**
 * Get weekly top performers
 */
const getWeeklyTopPerformers = async (limit = 10) => {
  const { startDate } = getDateRange('week');
  
  const topUsers = await EcoPoints.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$user',
        weeklyPoints: { $sum: '$amount' },
      },
    },
    { $sort: { weeklyPoints: -1 } },
    { $limit: limit },
  ]);
  
  const leaderboard = await User.populate(topUsers, {
    path: '_id',
    select: 'name email schoolID grade points',
  });
  
  return leaderboard.map((item, index) => ({
    rank: index + 1,
    userId: item._id._id,
    name: item._id.name,
    schoolID: item._id.schoolID,
    grade: item._id.grade,
    totalPoints: item._id.points,
    weeklyPoints: item.weeklyPoints,
  }));
};

/**
 * Get most improved users
 */
const getMostImproved = async (limit = 10) => {
  const { startDate: weekStart } = getDateRange('week');
  const { startDate: monthStart } = getDateRange('month');
  
  const users = await EcoPoints.aggregate([
    {
      $match: {
        createdAt: { $gte: monthStart },
      },
    },
    {
      $group: {
        _id: '$user',
        monthPoints: { $sum: '$amount' },
        weekPoints: {
          $sum: {
            $cond: [
              { $gte: ['$createdAt', weekStart] },
              '$amount',
              0,
            ],
          },
        },
      },
    },
    {
      $addFields: {
        improvement: {
          $subtract: [
            { $multiply: ['$weekPoints', 4] },
            '$monthPoints',
          ],
        },
      },
    },
    { $sort: { improvement: -1 } },
    { $limit: limit },
  ]);
  
  const leaderboard = await User.populate(users, {
    path: '_id',
    select: 'name email schoolID grade',
  });
  
  return leaderboard.map((item, index) => ({
    rank: index + 1,
    userId: item._id._id,
    name: item._id.name,
    improvement: item.improvement,
    weeklyPoints: item.weekPoints,
  }));
};

/**
 * Get class leaderboard
 */
const getClassLeaderboard = async (schoolID, grade, limit = 20) => {
  const users = await User.find({
    schoolID,
    grade,
    points: { $gt: 0 },
  })
    .select('name email schoolID grade points streak badges')
    .sort({ points: -1 })
    .limit(limit);
  
  return formatLeaderboard(users);
};

/**
 * Compare with friends (given array of friend IDs)
 */
const compareWithFriends = async (userId, friendIds) => {
  const allIds = [userId, ...friendIds];
  
  const users = await User.find({ _id: { $in: allIds } })
    .select('name points streak badges')
    .sort({ points: -1 });
  
  return users.map((user, index) => ({
    rank: index + 1,
    userId: user._id,
    name: user.name,
    points: user.points,
    streak: user.streak,
    badges: user.badges?.length || 0,
    isCurrentUser: user._id.toString() === userId.toString(),
  }));
};

module.exports = {
  getGlobalLeaderboard,
  getSchoolLeaderboard,
  getGradeLeaderboard,
  getQuizLeaderboard,
  getUserRank,
  getStreakLeaderboard,
  getWeeklyTopPerformers,
  getMostImproved,
  getClassLeaderboard,
  compareWithFriends,
};