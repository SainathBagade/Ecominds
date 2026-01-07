const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');

// Get all achievements
exports.getAllAchievements = async (req, res) => {
  try {
    const { category, difficulty } = req.query;

    const query = {};
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const achievements = await Achievement.find(query).sort({ points: -1 });
    res.json({ achievements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get achievement by ID
exports.getAchievementById = async (req, res) => {
  try {
    const { achievementId } = req.params;
    const achievement = await Achievement.findById(achievementId);

    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    res.json({ achievement });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new achievement (Admin only)
exports.createAchievement = async (req, res) => {
  try {
    const {
      title,
      description,
      points,
      unlockCondition,
      category,
      difficulty,
      icon,
      isHidden
    } = req.body;

    if (!title || !points || !unlockCondition) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const achievement = new Achievement({
      title,
      description,
      points,
      unlockCondition,
      category,
      difficulty,
      icon,
      isHidden
    });

    await achievement.save();
    res.status(201).json({
      message: 'Achievement created successfully',
      achievement
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update achievement (Admin only)
exports.updateAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params;
    const updates = req.body;

    const achievement = await Achievement.findByIdAndUpdate(
      achievementId,
      updates,
      { new: true, runValidators: true }
    );

    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    res.json({ message: 'Achievement updated successfully', achievement });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete achievement (Admin only)
exports.deleteAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params;
    const achievement = await Achievement.findByIdAndDelete(achievementId);

    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    // Remove all user achievements with this achievement
    await UserAchievement.deleteMany({ achievement: achievementId });

    res.json({ message: 'Achievement deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user's achievements
exports.getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    const { completed } = req.query;

    const query = { user: userId };
    if (completed !== undefined) {
      query.isCompleted = completed === 'true';
    }

    const userAchievements = await UserAchievement.find(query)
      .populate('achievement')
      .sort({ unlockedAt: -1 });

    const stats = await UserAchievement.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalCompleted: {
            $sum: { $cond: ['$isCompleted', 1, 0] }
          },
          totalProgress: { $sum: '$progress' },
          totalPoints: {
            $sum: {
              $cond: ['$isCompleted', '$pointsEarned', 0]
            }
          }
        }
      }
    ]);

    res.json({
      achievements: userAchievements,
      stats: stats[0] || {
        totalCompleted: 0,
        totalProgress: 0,
        totalPoints: 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Unlock achievement for user
exports.unlockAchievement = async (req, res) => {
  try {
    const { userId, achievementId } = req.body;

    if (!userId || !achievementId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if achievement exists
    const achievement = await Achievement.findById(achievementId);
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    // Check if user already has this achievement
    let userAchievement = await UserAchievement.findOne({
      user: userId,
      achievement: achievementId
    });

    if (!userAchievement) {
      userAchievement = new UserAchievement({
        user: userId,
        achievement: achievementId,
        progress: 100,
        isCompleted: true,
        pointsEarned: achievement.points,
        unlockedAt: new Date()
      });
    } else if (!userAchievement.isCompleted) {
      userAchievement.progress = 100;
      userAchievement.isCompleted = true;
      userAchievement.pointsEarned = achievement.points;
      userAchievement.unlockedAt = new Date();
    } else {
      return res.status(400).json({ error: 'Achievement already unlocked' });
    }

    await userAchievement.save();
    await userAchievement.populate('achievement');

    res.status(201).json({
      message: 'Achievement unlocked successfully',
      userAchievement
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update achievement progress
exports.updateProgress = async (req, res) => {
  try {
    const { userId, achievementId, progress } = req.body;

    if (!userId || !achievementId || progress === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const achievement = await Achievement.findById(achievementId);
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    let userAchievement = await UserAchievement.findOne({
      user: userId,
      achievement: achievementId
    });

    if (!userAchievement) {
      userAchievement = new UserAchievement({
        user: userId,
        achievement: achievementId,
        progress: Math.min(progress, 100),
        isCompleted: progress >= 100,
        pointsEarned: progress >= 100 ? achievement.points : 0,
        unlockedAt: progress >= 100 ? new Date() : null
      });
    } else if (!userAchievement.isCompleted) {
      userAchievement.progress = Math.min(progress, 100);
      if (progress >= 100) {
        userAchievement.isCompleted = true;
        userAchievement.pointsEarned = achievement.points;
        userAchievement.unlockedAt = new Date();
      }
    } else {
      return res.status(400).json({ error: 'Achievement already completed' });
    }

    await userAchievement.save();
    await userAchievement.populate('achievement');

    res.json({
      message: 'Progress updated successfully',
      userAchievement
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get achievement statistics
exports.getAchievementStats = async (req, res) => {
  try {
    const totalAchievements = await Achievement.countDocuments();

    const categoryStats = await Achievement.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalPoints: { $sum: '$points' }
        }
      }
    ]);

    const difficultyStats = await Achievement.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          avgPoints: { $avg: '$points' }
        }
      }
    ]);

    res.json({
      totalAchievements,
      categoryStats,
      difficultyStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};