// server/controllers/leaderboardController.js
const Leaderboard = require('../models/Leaderboard');
const UserProgress = require('../models/UserProgress');
const Streak = require('../models/Streak');
const Competition = require('../models/Competition');

// Get leaderboard rankings
exports.getLeaderboard = async (req, res) => {
  try {
    // Map frontend timeframe names to backend enum
    const timeframeMap = {
      'week': 'weekly',
      'month': 'monthly',
      'all': 'all_time',
      'weekly': 'weekly',
      'monthly': 'monthly',
      'all_time': 'all_time'
    };

    const limit = parseInt(req.query.limit) || 10;
    const type = timeframeMap[req.query.type] || 'weekly';
    const grade = req.query.grade;
    const college = req.query.college;

    if (!['weekly', 'monthly', 'all_time'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid leaderboard type'
      });
    }

    const filters = {};
    if (grade) filters.grade = grade;
    if (college) filters.college = college;

    const rankings = await Leaderboard.getRankings(type, parseInt(limit), filters);

    // Get current user's rank
    const userId = req.user.id;
    let userEntry = await Leaderboard.findOne({
      user: userId,
      type
    }).populate('user', 'name email avatar grade college');

    // If user doesn't have a leaderboard entry, create one
    if (!userEntry && req.user.role === 'student') {
      const User = require('../models/User');
      const user = await User.findById(userId);

      if (user) {
        const stats = {
          xpEarned: user.points || 0,
          lessonsCompleted: 0,
          perfectScores: 0,
          streakDays: user.streak || 0
        };

        userEntry = await Leaderboard.upsertEntry(
          userId,
          type,
          stats,
          user.grade,
          user.college || 'Default College'
        );

        await Leaderboard.updateRanks(type, user.grade);

        userEntry = await Leaderboard.findOne({
          user: userId,
          type
        }).populate('user', 'name email avatar grade college');
      }
    }

    res.json({
      success: true,
      data: {
        type,
        filters,
        rankings,
        userRank: userEntry
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
};

// Update leaderboard entry
exports.updateLeaderboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { xpEarned, lessonsCompleted, perfectScores } = req.body;

    const User = require('../models/User');
    const user = await User.findById(userId);
    const userProgress = await UserProgress.findOne({ user: userId });
    const streak = await Streak.findOne({ user: userId });

    const stats = {
      xpEarned: xpEarned || 0,
      lessonsCompleted: lessonsCompleted || 0,
      perfectScores: perfectScores || 0,
      streakDays: streak?.currentStreak || 0
    };

    // Update all leaderboard types
    const types = ['weekly', 'monthly', 'all_time'];
    const updates = await Promise.all(
      types.map(type => Leaderboard.upsertEntry(userId, type, stats, user.grade, user.college))
    );

    // Update ranks
    await Promise.all(
      types.map(type => Leaderboard.updateRanks(type))
    );

    res.json({
      success: true,
      data: updates,
      message: 'Leaderboard updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating leaderboard',
      error: error.message
    });
  }
};

// Get user's position in all leaderboards
exports.getUserPosition = async (req, res) => {
  try {
    const userId = req.user.id;
    const User = require('../models/User');
    const user = await User.findById(userId);

    const positions = await Promise.all(
      ['weekly', 'monthly', 'all_time'].map(async type => {
        let entry = await Leaderboard.findOne({ user: userId, type })
          .populate('user', 'name email avatar');

        // If entry doesn't exist and user is a student, create one
        if (!entry && user && user.role === 'student') {
          const stats = {
            xpEarned: user.points || 0,
            lessonsCompleted: 0,
            perfectScores: 0,
            streakDays: user.streak || 0
          };

          await Leaderboard.upsertEntry(
            userId,
            type,
            stats,
            user.grade,
            user.college || 'Default College'
          );

          // Update ranks
          await Leaderboard.updateRanks(type, user.grade);

          // Fetch the created entry
          entry = await Leaderboard.findOne({ user: userId, type })
            .populate('user', 'name email avatar');
        }

        return {
          type,
          entry
        };
      })
    );

    res.json({
      success: true,
      data: positions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user position',
      error: error.message
    });
  }
};

// Get top performers
exports.getTopPerformers = async (req, res) => {
  try {
    const { metric = 'xp', limit = 5 } = req.query;

    let sortField;
    switch (metric) {
      case 'xp':
        sortField = 'totalXP';
        break;
      case 'lessons':
        sortField = 'lessonsCompleted';
        break;
      case 'perfect':
        sortField = 'perfectScores';
        break;
      case 'streak':
        const streaks = await Streak.find()
          .sort({ currentStreak: -1 })
          .limit(parseInt(limit))
          .populate('user', 'name email avatar');

        return res.json({
          success: true,
          data: streaks
        });
      default:
        sortField = 'totalXP';
    }

    const topPerformers = await UserProgress.find()
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit))
      .populate('user', 'name email avatar');

    res.json({
      success: true,
      data: topPerformers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top performers',
      error: error.message
    });
  }
};

// Reset weekly leaderboard (cron job)
exports.resetWeeklyLeaderboard = async (req, res) => {
  try {
    const now = new Date();
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
    lastWeekStart.setHours(0, 0, 0, 0);

    // Archive old weekly entries
    await Leaderboard.updateMany(
      {
        type: 'weekly',
        'period.startDate': lastWeekStart
      },
      {
        $set: { archived: true }
      }
    );

    res.json({
      success: true,
      message: 'Weekly leaderboard reset'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting leaderboard',
      error: error.message
    });
  }
};

// Reset monthly leaderboard (cron job)
exports.resetMonthlyLeaderboard = async (req, res) => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Archive old monthly entries
    await Leaderboard.updateMany(
      {
        type: 'monthly',
        'period.startDate': lastMonth
      },
      {
        $set: { archived: true }
      }
    );

    res.json({
      success: true,
      message: 'Monthly leaderboard reset'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting leaderboard',
      error: error.message
    });
  }
};

// Get leaderboard statistics
exports.getLeaderboardStats = async (req, res) => {
  try {
    const { type = 'weekly' } = req.query;

    const stats = await Leaderboard.aggregate([
      { $match: { type } },
      {
        $group: {
          _id: null,
          totalParticipants: { $sum: 1 },
          avgScore: { $avg: '$score' },
          maxScore: { $max: '$score' },
          totalXP: { $sum: '$stats.xpEarned' },
          totalLessons: { $sum: '$stats.lessonsCompleted' }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalParticipants: 0,
        avgScore: 0,
        maxScore: 0,
        totalXP: 0,
        totalLessons: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard stats',
      error: error.message
    });
  }
};

// Get general competition rankings
exports.getCompetitionRankings = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const competitions = await Competition.find({ status: 'completed' })
      .populate('leaderboard.user', 'name email avatar')
      .sort({ endDate: -1 })
      .limit(parseInt(limit));

    // Consolidate leaderboard data from multiple competitions
    const consolidatedList = [];
    competitions.forEach(comp => {
      comp.leaderboard.forEach(entry => {
        consolidatedList.push({
          ...entry.toObject(),
          competitionTitle: comp.title
        });
      });
    });

    res.json({
      success: true,
      data: {
        rankings: consolidatedList.sort((a, b) => b.score - a.score).slice(0, parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching competition rankings',
      error: error.message
    });
  }
};