// server/models/Streak.js
const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date,
    default: null
  },
  freezes: {
    available: { type: Number, default: 0 },
    used: { type: Number, default: 0 }
  },
  streakMilestones: [{
    days: Number,
    achievedAt: Date,
    reward: {
      xp: Number,
      coins: Number
    }
  }]
}, {
  timestamps: true
});

// Method to update streak
streakSchema.methods.updateStreak = async function () {
  const now = new Date();
  const todayAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let status = 'no_change';

  if (!this.lastActivityDate) {
    this.currentStreak = 1;
    this.lastActivityDate = todayAtMidnight;
    status = 'initialized';
  } else {
    const lastActivity = new Date(this.lastActivityDate);
    const lastActivityMidnight = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());

    const diffDays = Math.floor((todayAtMidnight.getTime() - lastActivityMidnight.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      status = 'already_updated_today';
    } else if (diffDays === 1) {
      this.currentStreak += 1;
      this.lastActivityDate = todayAtMidnight;
      status = 'incremented';
    } else if (diffDays === 2 && this.freezes.available > 0) {
      this.currentStreak += 1;
      this.freezes.available -= 1;
      this.freezes.used += 1;
      this.lastActivityDate = todayAtMidnight;
      status = 'saved_by_freeze';
    } else {
      this.currentStreak = 1;
      this.lastActivityDate = todayAtMidnight;
      status = 'reset';
    }
  }

  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }

  await this.checkMilestones();
  const savedStreak = await this.save();

  // Sync with User model for profile display
  try {
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(this.user, { streak: this.currentStreak });
  } catch (err) {
    console.error('Error syncing streak to User model:', err);
  }

  return { streak: savedStreak, status };
};

// Method to check and award milestone rewards
streakSchema.methods.checkMilestones = function () {
  const milestones = [7, 14, 30, 60, 100, 365];
  const rewards = {
    7: { xp: 100, coins: 20 },
    14: { xp: 250, coins: 50 },
    30: { xp: 500, coins: 100 },
    60: { xp: 1000, coins: 200 },
    100: { xp: 2000, coins: 400 },
    365: { xp: 5000, coins: 1000 }
  };

  milestones.forEach(days => {
    if (this.currentStreak >= days &&
      !this.streakMilestones.some(m => m.days === days)) {
      this.streakMilestones.push({
        days,
        achievedAt: new Date(),
        reward: rewards[days]
      });
    }
  });
};

// Method to use a freeze
streakSchema.methods.useFreeze = async function () {
  if (this.freezes.available <= 0) {
    throw new Error('No freezes available');
  }
  this.freezes.available -= 1;
  this.freezes.used += 1;
  return await this.save();
};

module.exports = mongoose.model('Streak', streakSchema);