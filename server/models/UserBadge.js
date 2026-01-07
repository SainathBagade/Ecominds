const mongoose = require('mongoose');

const userBadgeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
  earnedAt: { type: Date, default: Date.now },
  isShowcased: { type: Boolean, default: false },
  source: { type: String, default: 'manual' } // track how badge was earned
}, { timestamps: true });

module.exports = mongoose.model('UserBadge', userBadgeSchema);
