// server/models/Competition.js
const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  type: {
    type: String,
    enum: ['tournament', 'battle', 'race', 'league'],
    required: true
  },
  mode: {
    type: String,
    enum: ['solo', 'team', '1v1', 'multiplayer'],
    default: 'solo'
  },
  format: {
    type: String,
    enum: ['single_elimination', 'double_elimination', 'round_robin', 'points_based'],
    required: true
  },
  rules: {
    maxParticipants: { type: Number },
    minParticipants: { type: Number, default: 2 },
    teamSize: { type: Number, default: 1 },
    roundDuration: { type: Number }, // in minutes
    totalRounds: { type: Number, default: 1 }
  },
  criteria: {
    type: {
      type: String,
      enum: ['highest_score', 'fastest_time', 'most_xp', 'accuracy', 'completion_rate'],
      required: true
    },
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    minScore: { type: Number, default: 0 }
  },
  prizes: {
    first: {
      xp: { type: Number, default: 0 },
      coins: { type: Number, default: 0 },
      badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' },
      title: { type: String }
    },
    second: {
      xp: { type: Number, default: 0 },
      coins: { type: Number, default: 0 }
    },
    third: {
      xp: { type: Number, default: 0 },
      coins: { type: Number, default: 0 }
    },
    participation: {
      xp: { type: Number, default: 0 },
      coins: { type: Number, default: 0 }
    }
  },
  status: {
    type: String,
    enum: ['registration', 'in_progress', 'completed', 'cancelled'],
    default: 'registration'
  },
  registrationStart: {
    type: Date,
    required: true
  },
  registrationEnd: {
    type: Date,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    team: { type: String },
    registeredAt: { type: Date, default: Date.now },
    score: { type: Number, default: 0 },
    rank: { type: Number },
    timeCompleted: { type: Number }, // in seconds
    accuracy: { type: Number }, // percentage
    completed: { type: Boolean, default: false }
  }],
  rounds: [{
    roundNumber: { type: Number, required: true },
    startTime: { type: Date },
    endTime: { type: Date },
    matches: [{
      participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      scores: [{ type: Number }]
    }]
  }],
  leaderboard: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rank: { type: Number },
    score: { type: Number },
    prize: { type: String }
  }],
  featured: {
    type: Boolean,
    default: false
  },
  entryFee: {
    coins: { type: Number, default: 0 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
competitionSchema.index({ status: 1, startDate: 1 });
competitionSchema.index({ 'participants.user': 1 });
competitionSchema.index({ type: 1, featured: 1 });

// Method to register participant
competitionSchema.methods.registerParticipant = async function (userId, teamName = null) {
  const now = new Date();

  // Check registration period
  const regEnd = new Date(this.registrationEnd);
  regEnd.setHours(23, 59, 59, 999);

  if (now < this.registrationStart) {
    throw new Error(`Registration hasn't started yet. Starts on ${this.registrationStart.toLocaleDateString()}`);
  }

  if (now > regEnd) {
    throw new Error(`Registration ended on ${this.registrationEnd.toLocaleDateString()}`);
  }

  // Check if already registered
  const alreadyRegistered = this.participants.some(p => p.user.toString() === userId.toString());
  if (alreadyRegistered) {
    throw new Error('Already registered for this competition');
  }

  // Check max participants
  if (this.rules.maxParticipants && this.participants.length >= this.rules.maxParticipants) {
    throw new Error('Competition is full');
  }

  this.participants.push({
    user: userId,
    team: teamName,
    registeredAt: new Date()
  });

  return await this.save();
};

// Method to update participant score
competitionSchema.methods.updateScore = async function (userId, scoreData) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());

  if (!participant) {
    throw new Error('Participant not found');
  }

  participant.score = scoreData.score || 0;
  participant.timeCompleted = scoreData.time || 0;
  participant.accuracy = scoreData.accuracy || 0;
  participant.completed = true;

  // Recalculate ranks
  await this.calculateRanks();

  return await this.save();
};

// Method to calculate ranks
competitionSchema.methods.calculateRanks = function () {
  const sortedParticipants = this.participants
    .filter(p => p.completed)
    .sort((a, b) => {
      if (this.criteria.type === 'fastest_time') {
        return a.timeCompleted - b.timeCompleted;
      }
      return b.score - a.score;
    });

  sortedParticipants.forEach((participant, index) => {
    participant.rank = index + 1;
  });
};

// Method to generate leaderboard
competitionSchema.methods.generateLeaderboard = async function () {
  this.calculateRanks();

  this.leaderboard = this.participants
    .filter(p => p.completed && p.rank)
    .map(p => ({
      user: p.user,
      rank: p.rank,
      score: p.score,
      prize: p.rank === 1 ? 'First Place' : p.rank === 2 ? 'Second Place' : p.rank === 3 ? 'Third Place' : 'Participation'
    }));

  return await this.save();
};

// Method to start competition
competitionSchema.methods.startCompetition = async function () {
  if (this.participants.length < this.rules.minParticipants) {
    throw new Error(`Minimum ${this.rules.minParticipants} participants required`);
  }

  this.status = 'in_progress';
  return await this.save();
};

// Method to end competition
competitionSchema.methods.endCompetition = async function () {
  this.status = 'completed';
  await this.generateLeaderboard();
  return await this.save();
};

// Static method to get active competitions
competitionSchema.statics.getActiveCompetitions = async function () {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  return await this.find({
    status: { $in: ['registration', 'in_progress'] },
    endDate: { $gte: today }
  }).populate('createdBy', 'name avatar');
};

module.exports = mongoose.model('Competition', competitionSchema);