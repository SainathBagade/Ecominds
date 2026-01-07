// server/controllers/userBadgeController.js
const UserBadge = require('../models/UserBadge');
const Badge = require('../models/Badge');
const User = require('../models/User');

// Get all badges of a user
exports.getUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;

    const badges = await UserBadge.find({ user: userId })
      .populate('badge')
      .sort({ earnedAt: -1 });

    res.json({ badges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Award a badge to a user
exports.awardBadge = async (req, res) => {
  try {
    const { userId, badgeId, source } = req.body; // include source

    if (!userId || !badgeId) {
      return res.status(400).json({ error: 'Missing userId or badgeId' });
    }

    // Check if badge exists
    const badge = await Badge.findById(badgeId);
    if (!badge) return res.status(404).json({ error: 'Badge not found' });

    // Check if user already has this badge
    const existing = await UserBadge.findOne({ user: userId, badge: badgeId });
    if (existing) return res.status(400).json({ error: 'User already has this badge' });

    // Create UserBadge
    const userBadge = new UserBadge({
      user: userId,
      badge: badgeId,
      source: source || 'manual' // store source if provided
    });

    await userBadge.save();
    await userBadge.populate('badge');

    res.status(201).json({ message: 'Badge awarded successfully', userBadge });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Remove a badge from a user
exports.removeBadge = async (req, res) => {
  try {
    const { userId, badgeId } = req.params;

    const deleted = await UserBadge.findOneAndDelete({ user: userId, badge: badgeId });

    if (!deleted) return res.status(404).json({ error: 'Badge not found for this user' });

    res.json({ message: 'Badge removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle showcase status
exports.toggleBadgeShowcase = async (req, res) => {
  try {
    const { userBadgeId } = req.params;

    const userBadge = await UserBadge.findById(userBadgeId);
    if (!userBadge) return res.status(404).json({ error: 'User badge not found' });

    userBadge.isShowcased = !userBadge.isShowcased;
    await userBadge.save();

    res.json({ message: 'Showcase status updated', userBadge });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
