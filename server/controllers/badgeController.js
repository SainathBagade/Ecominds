const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const User = require('../models/User');

// ============ Public Routes ============

// Get all badges
exports.getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find().sort({ createdAt: -1 });
    res.json({ badges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get badge details with statistics
exports.getBadgeDetails = async (req, res) => {
  try {
    const { badgeId } = req.params;
    const badge = await Badge.findById(badgeId);

    if (!badge) {
      return res.status(404).json({ error: 'Badge not found' });
    }

    // Get badge statistics
    const badgeCount = await UserBadge.countDocuments({ badge: badgeId });

    res.json({ 
      badge,
      statistics: {
        totalAwarded: badgeCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============ Protected Routes (Authenticated Users) ============

// Get current user's badges
exports.getMyBadges = async (req, res) => {
  try {
    const userId = req.user.id;

    const userBadges = await UserBadge.find({ user: userId })
      .populate('badge')
      .sort({ earnedAt: -1 });

    res.json({ badges: userBadges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get specific user's badges
exports.getUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;

    const userBadges = await UserBadge.find({ user: userId })
      .populate('badge')
      .sort({ earnedAt: -1 });

    res.json({ badges: userBadges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Check and award eligible badges
exports.checkAndAwardBadges = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all badges
    const allBadges = await Badge.find();
    
    // Get user's current badges
    const userBadges = await UserBadge.find({ user: userId }).select('badge');
    const earnedBadgeIds = userBadges.map(ub => ub.badge.toString());

    // Filter out already earned badges
    const availableBadges = allBadges.filter(
      badge => !earnedBadgeIds.includes(badge._id.toString())
    );

    // TODO: Implement actual eligibility logic based on criteria
    const eligibleBadges = []; // Check against user stats/activities

    // Award eligible badges
    const newlyAwarded = [];
    for (const badge of eligibleBadges) {
      const userBadge = new UserBadge({
        user: userId,
        badge: badge._id
      });
      await userBadge.save();
      await userBadge.populate('badge');
      newlyAwarded.push(userBadge);
    }

    res.json({ 
      message: 'Badge check complete',
      newlyAwarded,
      available: availableBadges.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle badge showcase
exports.toggleBadgeShowcase = async (req, res) => {
  try {
    const { userBadgeId } = req.params;
    const userId = req.user.id;

    const userBadge = await UserBadge.findOne({
      _id: userBadgeId,
      user: userId
    });

    if (!userBadge) {
      return res.status(404).json({ error: 'Badge not found' });
    }

    userBadge.showcased = !userBadge.showcased;
    await userBadge.save();
    await userBadge.populate('badge');

    res.json({ 
      message: 'Badge showcase updated',
      userBadge 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get badge progress
exports.getBadgeProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's earned badges
    const userBadges = await UserBadge.find({ user: userId }).select('badge');
    const earnedBadgeIds = userBadges.map(ub => ub.badge.toString());

    // Get all unearned badges
    const unearnedBadges = await Badge.find({
      _id: { $nin: earnedBadgeIds }
    });

    // TODO: Calculate actual progress based on user stats
    const progress = unearnedBadges.map(badge => ({
      badge,
      progress: 0, // Calculate based on criteria
      required: badge.criteria
    }));

    res.json({ progress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============ Admin Routes ============

// Create new badge
exports.createBadge = async (req, res) => {
  try {
    const { name, description, icon, criteria, rarity } = req.body;

    if (!name || !description || !criteria) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const badge = new Badge({
      name,
      description,
      icon,
      criteria,
      rarity
    });

    await badge.save();
    res.status(201).json({ message: 'Badge created successfully', badge });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update badge
exports.updateBadge = async (req, res) => {
  try {
    const { badgeId } = req.params;
    const updates = req.body;

    const badge = await Badge.findByIdAndUpdate(
      badgeId,
      updates,
      { new: true, runValidators: true }
    );

    if (!badge) {
      return res.status(404).json({ error: 'Badge not found' });
    }

    res.json({ message: 'Badge updated successfully', badge });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete badge
exports.deleteBadge = async (req, res) => {
  try {
    const { badgeId } = req.params;
    const badge = await Badge.findByIdAndDelete(badgeId);

    if (!badge) {
      return res.status(404).json({ error: 'Badge not found' });
    }

    // Remove all user badges with this badge
    await UserBadge.deleteMany({ badge: badgeId });

    res.json({ message: 'Badge deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Manually award badge to user
exports.manuallyAwardBadge = async (req, res) => {
  try {
    const { badgeId, userId } = req.params;

    // Check if badge exists
    const badge = await Badge.findById(badgeId);
    if (!badge) {
      return res.status(404).json({ error: 'Badge not found' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already has this badge
    const existingBadge = await UserBadge.findOne({ user: userId, badge: badgeId });
    if (existingBadge) {
      return res.status(400).json({ error: 'User already has this badge' });
    }

    const userBadge = new UserBadge({
      user: userId,
      badge: badgeId,
      awardedBy: req.user.id
    });

    await userBadge.save();
    await userBadge.populate('badge');

    res.status(201).json({
      message: 'Badge awarded successfully',
      userBadge
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get badge statistics
exports.getBadgeStats = async (req, res) => {
  try {
    const totalBadges = await Badge.countDocuments();
    const totalAwarded = await UserBadge.countDocuments();
    const totalUsers = await User.countDocuments();

    // Most popular badges
    const popularBadges = await UserBadge.aggregate([
      { $group: { _id: '$badge', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Populate badge details
    await Badge.populate(popularBadges, { path: '_id', select: 'name icon' });

    res.json({
      totalBadges,
      totalAwarded,
      totalUsers,
      averagePerUser: totalUsers > 0 ? (totalAwarded / totalUsers).toFixed(2) : 0,
      popularBadges: popularBadges.map(b => ({
        badge: b._id,
        count: b.count
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};