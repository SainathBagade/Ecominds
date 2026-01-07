// server/models/Game.js
const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
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
    enum: ['quiz', 'puzzle', 'memory', 'typing', 'match', 'flashcard', 'word_game'],
    required: true
  },
  category: {
    type: String,
    enum: ['vocabulary', 'grammar', 'pronunciation', 'listening', 'reading', 'writing'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  gameData: {
    questions: [{
      question: { type: String, required: true },
      options: [{ type: String }],
      correctAnswer: { type: String, required: true },
      explanation: { type: String },
      points: { type: Number, default: 10 },
      timeLimit: { type: Number } // in seconds
    }],
    items: [{ type: mongoose.Schema.Types.Mixed }], // For puzzle/memory items
    words: [{ type: String }], // For word games
    pairs: [{ type: mongoose.Schema.Types.Mixed }] // For matching games
  },
  settings: {
    timeLimit: { type: Number }, // Total time in seconds
    lives: { type: Number, default: 3 },
    hintsAvailable: { type: Number, default: 3 },
    pointsPerCorrect: { type: Number, default: 10 },
    pointsDeductPerWrong: { type: Number, default: 5 },
    bonusMultiplier: { type: Number, default: 1.5 }
  },
  rewards: {
    baseXP: { type: Number, default: 20 },
    baseCoins: { type: Number, default: 5 },
    perfectBonus: { type: Number, default: 50 },
    speedBonus: { type: Number, default: 30 }
  },
  leaderboard: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number },
    time: { type: Number },
    rank: { type: Number },
    playedAt: { type: Date, default: Date.now }
  }],
  statistics: {
    totalPlays: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  thumbnailUrl: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
gameSchema.index({ type: 1, category: 1 });
gameSchema.index({ difficulty: 1, isActive: 1 });
gameSchema.index({ featured: 1 });

// Virtual for total questions
gameSchema.virtual('totalQuestions').get(function() {
  return this.gameData.questions ? this.gameData.questions.length : 0;
});

// Method to record game session
gameSchema.methods.recordSession = async function(userId, sessionData) {
  const { score, time, accuracy, completed } = sessionData;

  // Update statistics
  this.statistics.totalPlays += 1;
  this.statistics.averageScore = 
    ((this.statistics.averageScore * (this.statistics.totalPlays - 1)) + score) / this.statistics.totalPlays;
  
  if (score > this.statistics.highestScore) {
    this.statistics.highestScore = score;
  }

  this.statistics.averageTime = 
    ((this.statistics.averageTime * (this.statistics.totalPlays - 1)) + time) / this.statistics.totalPlays;

  if (completed) {
    const totalCompleted = this.statistics.completionRate * (this.statistics.totalPlays - 1) + 1;
    this.statistics.completionRate = totalCompleted / this.statistics.totalPlays;
  }

  // Update leaderboard
  const existingEntry = this.leaderboard.find(entry => entry.user.toString() === userId.toString());
  
  if (existingEntry) {
    if (score > existingEntry.score) {
      existingEntry.score = score;
      existingEntry.time = time;
      existingEntry.playedAt = new Date();
    }
  } else {
    this.leaderboard.push({
      user: userId,
      score,
      time,
      playedAt: new Date()
    });
  }

  // Sort and rank leaderboard
  this.leaderboard.sort((a, b) => {
    if (b.score === a.score) return a.time - b.time;
    return b.score - a.score;
  });

  this.leaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  // Keep top 100
  if (this.leaderboard.length > 100) {
    this.leaderboard = this.leaderboard.slice(0, 100);
  }

  return await this.save();
};

// Method to calculate rewards
gameSchema.methods.calculateRewards = function(score, time, perfect) {
  let xp = this.rewards.baseXP;
  let coins = this.rewards.baseCoins;

  // Score bonus
  xp += Math.floor(score / 10);
  coins += Math.floor(score / 20);

  // Perfect bonus
  if (perfect) {
    xp += this.rewards.perfectBonus;
    coins += Math.floor(this.rewards.perfectBonus / 2);
  }

  // Speed bonus
  if (this.settings.timeLimit && time < this.settings.timeLimit * 0.5) {
    xp += this.rewards.speedBonus;
    coins += Math.floor(this.rewards.speedBonus / 3);
  }

  return { xp, coins };
};

// Static method to get featured games
gameSchema.statics.getFeaturedGames = async function() {
  return await this.find({ isActive: true, featured: true })
    .populate('module lesson', 'title')
    .sort({ 'statistics.totalPlays': -1 });
};

// Static method to get games by category
gameSchema.statics.getByCategory = async function(category, difficulty = null) {
  const query = { isActive: true, category };
  if (difficulty) {
    query.difficulty = difficulty;
  }
  
  return await this.find(query)
    .populate('module lesson', 'title')
    .sort({ 'statistics.totalPlays': -1 });
};

// Static method to get user's game history
gameSchema.statics.getUserHistory = async function(userId) {
  return await this.find({
    'leaderboard.user': userId
  }).select('title type category leaderboard statistics');
};

module.exports = mongoose.model('Game', gameSchema);