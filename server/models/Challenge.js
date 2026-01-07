// server/models/Challenge.js
const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'special', 'community'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['speed', 'accuracy', 'consistency', 'mastery', 'social'],
    required: true
  },
  requirements: {
    type: {
      type: String,
      enum: ['complete_lessons', 'earn_xp', 'perfect_scores', 'time_limit', 'streak', 'help_others'],
      required: true
    },
    target: { type: Number, required: true },
    timeLimit: { type: Number }, // in minutes
    minScore: { type: Number },
    specificLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    specificModules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }]
  },
  rewards: {
    xp: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' },
    title: { type: String }
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    proof: {
      url: String,
      description: String,
      submittedAt: Date,
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      verificationScore: { type: Number, default: 0 },
      feedback: String
    }
  }],
  maxParticipants: {
    type: Number,
    default: null // null means unlimited
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
challengeSchema.index({ type: 1, isActive: 1 });
challengeSchema.index({ startDate: 1, endDate: 1 });
challengeSchema.index({ 'participants.user': 1 });

// Method to join challenge
challengeSchema.methods.joinChallenge = async function (userId) {
  // Check if already joined
  const alreadyJoined = this.participants.some(p => p.user.toString() === userId.toString());
  if (alreadyJoined) {
    throw new Error('Already joined this challenge');
  }

  // Check max participants
  if (this.maxParticipants && this.participants.length >= this.maxParticipants) {
    throw new Error('Challenge is full');
  }

  // Check if challenge is active
  if (!this.isActive || new Date() > this.endDate) {
    throw new Error('Challenge is not active');
  }

  this.participants.push({
    user: userId,
    joinedAt: new Date(),
    progress: 0,
    isCompleted: false
  });

  return await this.save();
};

// Method to update participant progress
challengeSchema.methods.updateProgress = async function (userId, progress) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());

  if (!participant) {
    throw new Error('User not participating in this challenge');
  }

  if (participant.isCompleted) {
    return this;
  }

  participant.progress = progress;

  if (progress >= this.requirements.target) {
    participant.isCompleted = true;
    participant.completedAt = new Date();

    // Award rewards
    const UserProgress = mongoose.model('UserProgress');
    const userProgress = await UserProgress.findOne({ user: userId });
    if (userProgress) {
      await userProgress.addXP(this.rewards.xp);
      await userProgress.addCoins(this.rewards.coins);
    }
  }

  return await this.save();
};

// Method to submit proof
challengeSchema.methods.submitProof = async function (userId, proofUrl) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());

  if (!participant) {
    throw new Error('User not participating in this challenge');
  }

  participant.proof = {
    url: proofUrl,
    submittedAt: new Date(),
    status: 'pending',
    verificationScore: 0
  };
  participant.isCompleted = true;
  participant.completedAt = new Date();
  participant.progress = this.requirements.target;

  // Award rewards here or wait for manual approval? User wants it to "work".
  const UserProgress = mongoose.model('UserProgress');
  const userProgress = await UserProgress.findOne({ user: userId });
  if (userProgress) {
    await userProgress.addXP(this.rewards.xp);
    await userProgress.addCoins(this.rewards.coins);
  }

  return await this.save();
};

// Static method to get active challenges
challengeSchema.statics.getActiveChallenges = async function (userId) {
  const now = new Date();

  return await this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).populate('createdBy', 'name avatar');
};

// Static method to get user's challenges
challengeSchema.statics.getUserChallenges = async function (userId) {
  return await this.find({
    'participants.user': userId
  }).sort({ createdAt: -1 });
};

// Method to check expiration
challengeSchema.methods.checkExpiration = function () {
  if (new Date() > this.endDate) {
    this.isActive = false;
  }
  return this;
};

module.exports = mongoose.model('Challenge', challengeSchema);