// server/controllers/gamificationController.js
const mongoose = require('mongoose');
const EcoPoints = require('../models/EcoPoints');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');

// ============ EcoPoints Controllers ============

// @desc    Get user's total points
// @route   GET /api/gamification/points/total
// @access  Private
exports.getTotalPoints = async (req, res) => {
  try {
    const totalPoints = await EcoPoints.getUserTotalPoints(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        totalPoints,
        userId: req.user._id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching total points',
      error: error.message
    });
  }
};

// @desc    Get user's points history
// @route   GET /api/gamification/points/history
// @access  Private
exports.getPointsHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, source } = req.query;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };
    if (source) query.source = source;

    const [history, total] = await Promise.all([
      EcoPoints.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      EcoPoints.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching points history',
      error: error.message
    });
  }
};

// @desc    Get leaderboard
// @route   GET /api/gamification/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const leaderboard = await EcoPoints.getLeaderboard(parseInt(limit));

    // Get current user's rank
    const allUsers = await EcoPoints.aggregate([
      {
        $group: {
          _id: '$user',
          totalPoints: { $sum: '$amount' }
        }
      },
      { $sort: { totalPoints: -1 } }
    ]);

    const userRank = allUsers.findIndex(u =>
      u._id.toString() === req.user._id.toString()
    ) + 1;

    const userTotal = allUsers.find(u =>
      u._id.toString() === req.user._id.toString()
    )?.totalPoints || 0;

    res.status(200).json({
      success: true,
      data: {
        leaderboard,
        currentUser: {
          rank: userRank,
          totalPoints: userTotal,
          userId: req.user._id
        }
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

// @desc    Award points (Admin only)
// @route   POST /api/gamification/points/award
// @access  Private/Admin
exports.awardPoints = async (req, res) => {
  try {
    const { userId, amount, source, description, metadata } = req.body;

    if (!userId || !amount || !source || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId, amount, source, and description'
      });
    }

    const ecoPoints = await EcoPoints.awardPoints(
      userId,
      amount,
      source,
      description,
      metadata
    );

    res.status(201).json({
      success: true,
      data: ecoPoints,
      message: 'Points awarded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error awarding points',
      error: error.message
    });
  }
};

// ============ Badge Controllers ============

// @desc    Get all badges
// @route   GET /api/gamification/badges
// @access  Private
exports.getAllBadges = async (req, res) => {
  try {
    const { category, rarity, isActive = true } = req.query;

    const query = { isActive };
    if (category) query.category = category;
    if (rarity) query.rarity = rarity;

    const badges = await Badge.find(query).sort({ displayOrder: 1 });

    // Check which badges the user has earned
    const userBadges = await UserBadge.find({ user: req.user._id })
      .select('badge');
    const earnedBadgeIds = userBadges.map(ub => ub.badge.toString());

    const badgesWithStatus = badges.map(badge => ({
      ...badge.toObject(),
      earned: earnedBadgeIds.includes(badge._id.toString())
    }));

    res.status(200).json({
      success: true,
      data: badgesWithStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching badges',
      error: error.message
    });
  }
};

// @desc    Get user's badges
// @route   GET /api/gamification/badges/user
// @access  Private
exports.getUserBadges = async (req, res) => {
  try {
    const { showcasedOnly } = req.query;

    const badges = await UserBadge.getUserBadges(req.user._id, {
      showcasedOnly: showcasedOnly === 'true'
    });

    res.status(200).json({
      success: true,
      data: badges
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user badges',
      error: error.message
    });
  }
};

// @desc    Get badge details
// @route   GET /api/gamification/badges/:badgeId
// @access  Private
exports.getBadgeDetails = async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.badgeId);

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    // Check if user has earned this badge
    const userBadge = await UserBadge.findOne({
      user: req.user._id,
      badge: badge._id
    });

    res.status(200).json({
      success: true,
      data: {
        ...badge.toObject(),
        earned: !!userBadge,
        earnedAt: userBadge?.earnedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching badge details',
      error: error.message
    });
  }
};

// @desc    Create badge (Admin)
// @route   POST /api/gamification/badges
// @access  Private/Admin
exports.createBadge = async (req, res) => {
  try {
    const badge = await Badge.create(req.body);

    res.status(201).json({
      success: true,
      data: badge,
      message: 'Badge created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating badge',
      error: error.message
    });
  }
};

// @desc    Update badge (Admin)
// @route   PUT /api/gamification/badges/:badgeId
// @access  Private/Admin
exports.updateBadge = async (req, res) => {
  try {
    const badge = await Badge.findByIdAndUpdate(
      req.params.badgeId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    res.status(200).json({
      success: true,
      data: badge,
      message: 'Badge updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating badge',
      error: error.message
    });
  }
};

// @desc    Delete badge (Admin)
// @route   DELETE /api/gamification/badges/:badgeId
// @access  Private/Admin
exports.deleteBadge = async (req, res) => {
  try {
    const badge = await Badge.findByIdAndDelete(req.params.badgeId);

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    // Optionally delete all user badges
    await UserBadge.deleteMany({ badge: req.params.badgeId });

    res.status(200).json({
      success: true,
      message: 'Badge deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting badge',
      error: error.message
    });
  }
};

// @desc    Check and award eligible badges
// @route   POST /api/gamification/badges/check
// @access  Private
exports.checkAndAwardBadges = async (req, res) => {
  try {
    const awardedBadges = await UserBadge.checkAndAwardBadges(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        newBadges: awardedBadges,
        count: awardedBadges.length
      },
      message: awardedBadges.length > 0
        ? `Congratulations! You earned ${awardedBadges.length} new badge(s)!`
        : 'No new badges earned'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking badges',
      error: error.message
    });
  }
};

// @desc    Toggle badge showcase
// @route   PATCH /api/gamification/badges/user/:userBadgeId/showcase
// @access  Private
exports.toggleBadgeShowcase = async (req, res) => {
  try {
    const userBadge = await UserBadge.findOne({
      _id: req.params.userBadgeId,
      user: req.user._id
    });

    if (!userBadge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    userBadge.showcased = !userBadge.showcased;
    await userBadge.save();

    res.status(200).json({
      success: true,
      data: userBadge,
      message: `Badge ${userBadge.showcased ? 'showcased' : 'removed from showcase'}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling badge showcase',
      error: error.message
    });
  }
};

// ============ Achievement Controllers ============

// @desc    Get all achievements
// @route   GET /api/gamification/achievements
// @access  Private
exports.getAllAchievements = async (req, res) => {
  try {
    const { category, tier, includeSecret = false } = req.query;

    const query = { isActive: true };
    if (category) query.category = category;
    if (tier) query.tier = tier;
    if (includeSecret !== 'true') query.isSecret = false;

    const achievements = await Achievement.find(query)
      .sort({ displayOrder: 1 })
      .populate('prerequisiteAchievements', 'title icon')
      .populate('nextTierAchievement', 'title icon');

    // Check which achievements the user has unlocked
    const userAchievements = await UserAchievement.find({ user: req.user._id })
      .select('achievement');
    const unlockedIds = userAchievements.map(ua => ua.achievement.toString());

    const achievementsWithStatus = achievements.map(achievement => ({
      ...achievement.toObject(),
      unlocked: unlockedIds.includes(achievement._id.toString())
    }));

    res.status(200).json({
      success: true,
      data: achievementsWithStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching achievements',
      error: error.message
    });
  }
};

// @desc    Get user's achievements
// @route   GET /api/gamification/achievements/user
// @access  Private
exports.getUserAchievements = async (req, res) => {
  try {
    const { category, tier } = req.query;

    const achievements = await UserAchievement.getUserAchievements(
      req.user._id,
      { category, tier }
    );

    res.status(200).json({
      success: true,
      data: achievements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user achievements',
      error: error.message
    });
  }
};

// @desc    Get achievement progress
// @route   GET /api/gamification/achievements/:achievementId/progress
// @access  Private
exports.getAchievementProgress = async (req, res) => {
  try {
    const progress = await Achievement.getProgress(
      req.params.achievementId,
      req.user._id
    );

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching achievement progress',
      error: error.message
    });
  }
};

// @desc    Get achievement details
// @route   GET /api/gamification/achievements/:achievementId
// @access  Private
exports.getAchievementDetails = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.achievementId)
      .populate('prerequisiteAchievements')
      .populate('nextTierAchievement');

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    // Check if user has unlocked
    const userAchievement = await UserAchievement.findOne({
      user: req.user._id,
      achievement: achievement._id
    });

    res.status(200).json({
      success: true,
      data: {
        ...achievement.toObject(),
        unlocked: !!userAchievement,
        unlockedAt: userAchievement?.unlockedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching achievement details',
      error: error.message
    });
  }
};

// @desc    Create achievement (Admin)
// @route   POST /api/gamification/achievements
// @access  Private/Admin
exports.createAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.create(req.body);

    res.status(201).json({
      success: true,
      data: achievement,
      message: 'Achievement created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating achievement',
      error: error.message
    });
  }
};

// @desc    Update achievement (Admin)
// @route   PUT /api/gamification/achievements/:achievementId
// @access  Private/Admin
exports.updateAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndUpdate(
      req.params.achievementId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    res.status(200).json({
      success: true,
      data: achievement,
      message: 'Achievement updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating achievement',
      error: error.message
    });
  }
};

// @desc    Delete achievement (Admin)
// @route   DELETE /api/gamification/achievements/:achievementId
// @access  Private/Admin
exports.deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.achievementId);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    // Delete all user achievements
    await UserAchievement.deleteMany({ achievement: req.params.achievementId });

    res.status(200).json({
      success: true,
      message: 'Achievement deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting achievement',
      error: error.message
    });
  }
};

// @desc    Check and unlock eligible achievements
// @route   POST /api/gamification/achievements/check
// @access  Private
exports.checkAndUnlockAchievements = async (req, res) => {
  try {
    const unlockedAchievements = await UserAchievement.checkAndUnlockAchievements(
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: {
        newAchievements: unlockedAchievements,
        count: unlockedAchievements.length
      },
      message: unlockedAchievements.length > 0
        ? `Congratulations! You unlocked ${unlockedAchievements.length} new achievement(s)!`
        : 'No new achievements unlocked'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking achievements',
      error: error.message
    });
  }
};

// @desc    Get user achievement statistics
// @route   GET /api/gamification/achievements/user/stats
// @access  Private
exports.getUserAchievementStats = async (req, res) => {
  try {
    const stats = await UserAchievement.getUserStats(req.user._id);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching achievement stats',
      error: error.message
    });
  }
};

// ============ Dashboard Controller ============

// @desc    Get gamification dashboard
// @route   GET /api/gamification/dashboard
// @access  Private
exports.getGamificationDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all gamification data in parallel
    const [
      totalPoints,
      recentPoints,
      userBadges,
      userAchievements,
      achievementStats,
      leaderboard
    ] = await Promise.all([
      EcoPoints.getUserTotalPoints(userId),
      EcoPoints.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5),
      UserBadge.getUserBadges(userId, { limit: 10 }),
      UserAchievement.getUserAchievements(userId, { limit: 10 }),
      UserAchievement.getUserStats(userId),
      EcoPoints.getLeaderboard(5)
    ]);

    // Get user's rank
    const allUsers = await EcoPoints.aggregate([
      { $group: { _id: '$user', totalPoints: { $sum: '$amount' } } },
      { $sort: { totalPoints: -1 } }
    ]);
    const userRank = allUsers.findIndex(u => u._id.toString() === userId.toString()) + 1;

    res.status(200).json({
      success: true,
      data: {
        points: {
          total: totalPoints,
          recent: recentPoints,
          rank: userRank,
          totalUsers: allUsers.length
        },
        badges: {
          earned: userBadges,
          count: userBadges.length
        },
        achievements: {
          unlocked: userAchievements,
          stats: achievementStats
        },
        leaderboard
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching gamification dashboard',
      error: error.message
    });
  }
};