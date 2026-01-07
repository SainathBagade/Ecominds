// server/controllers/streakController.js
const Streak = require('../models/Streak');
const StreakHistory = require('../models/StreakHistory');
const UserProgress = require('../models/UserProgress');

// Get user's streak information
exports.getStreak = async (req, res) => {
  try {
    const userId = req.user.id;

    let streak = await Streak.findOne({ user: userId });

    if (!streak) {
      streak = await Streak.create({ user: userId });
    }

    res.json({
      success: true,
      data: streak
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching streak',
      error: error.message
    });
  }
};

// Update streak (called when user completes activity)
exports.updateStreak = async (req, res) => {
  try {
    const userId = req.user.id;

    let streak = await Streak.findOne({ user: userId });

    if (!streak) {
      streak = await Streak.create({ user: userId });
    }

    const oldStreak = streak.currentStreak;
    await streak.updateStreak();

    // Update streak history
    await StreakHistory.updateToday(userId, streak.currentStreak, {
      lessons: 1
    });

    // Check for milestone rewards
    const newMilestones = streak.streakMilestones.filter(m => {
      const achievedDate = new Date(m.achievedAt);
      const today = new Date();
      return achievedDate.toDateString() === today.toDateString();
    });

    if (newMilestones.length > 0) {
      const userProgress = await UserProgress.findOne({ user: userId });
      for (const milestone of newMilestones) {
        await userProgress.addXP(milestone.reward.xp);
        await userProgress.addCoins(milestone.reward.coins);
      }
    }

    res.json({
      success: true,
      data: streak,
      message: oldStreak < streak.currentStreak ? 'Streak increased!' : 'Streak maintained',
      newMilestones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating streak',
      error: error.message
    });
  }
};

// Use a streak freeze
exports.useFreeze = async (req, res) => {
  try {
    const userId = req.user.id;

    const streak = await Streak.findOne({ user: userId });

    if (!streak) {
      return res.status(404).json({
        success: false,
        message: 'Streak not found'
      });
    }

    await streak.useFreeze();

    res.json({
      success: true,
      data: streak,
      message: 'Streak freeze used'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Purchase streak freeze
exports.purchaseFreeze = async (req, res) => {
  try {
    const userId = req.user.id;
    const freezeCost = 50; // 50 coins per freeze

    const userProgress = await UserProgress.findOne({ user: userId });

    if (!userProgress || userProgress.coins < freezeCost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient coins'
      });
    }

    await userProgress.spendCoins(freezeCost);

    const streak = await Streak.findOne({ user: userId });
    streak.freezes.available += 1;
    await streak.save();

    res.json({
      success: true,
      data: {
        streak,
        userProgress
      },
      message: 'Streak freeze purchased'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error purchasing freeze',
      error: error.message
    });
  }
};

// Get streak history
exports.getStreakHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const history = await StreakHistory.getUserHistory(userId, parseInt(days));

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching streak history',
      error: error.message
    });
  }
};

// Get streak statistics
exports.getStreakStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const streak = await Streak.findOne({ user: userId });
    const history = await StreakHistory.getUserHistory(userId, 30);

    const stats = {
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      freezesAvailable: streak?.freezes.available || 0,
      freezesUsed: streak?.freezes.used || 0,
      milestones: streak?.streakMilestones || [],
      last30Days: history
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching streak stats',
      error: error.message
    });
  }
};