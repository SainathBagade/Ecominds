const EcoPoints = require('../models/EcoPoints');
const User = require('../models/User');

// Get user's eco points history
exports.getUserPoints = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, source } = req.query;

    const query = { user: userId };
    if (source) query.source = source;

    const points = await EcoPoints.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'username email');

    const total = await EcoPoints.countDocuments(query);
    const totalPoints = await EcoPoints.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      points,
      totalPoints: totalPoints[0]?.total || 0,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Award eco points to user
exports.awardPoints = async (req, res) => {
  try {
    const { userId, amount, source, description } = req.body;

    if (!userId || !amount || !source) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const ecoPoints = new EcoPoints({
      user: userId,
      amount,
      source,
      description
    });

    await ecoPoints.save();

    // Update user's total points
    await User.findByIdAndUpdate(userId, {
      $inc: { totalEcoPoints: amount }
    });

    res.status(201).json({
      message: 'Points awarded successfully',
      ecoPoints
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 10, timeframe = 'all' } = req.query;
    
    let matchStage = {};
    if (timeframe !== 'all') {
      const date = new Date();
      if (timeframe === 'week') {
        date.setDate(date.getDate() - 7);
      } else if (timeframe === 'month') {
        date.setMonth(date.getMonth() - 1);
      }
      matchStage = { createdAt: { $gte: date } };
    }

    const leaderboard = await EcoPoints.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$user',
          totalPoints: { $sum: '$amount' },
          activityCount: { $sum: 1 }
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          userId: '$_id',
          totalPoints: 1,
          activityCount: 1,
          username: '$userInfo.username',
          email: '$userInfo.email'
        }
      }
    ]);

    res.json({ leaderboard });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get points summary by source
exports.getPointsSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    const summary = await EcoPoints.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$source',
          totalPoints: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalPoints: -1 } }
    ]);

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};