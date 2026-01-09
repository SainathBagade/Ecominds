// server/models/DailyMission.js

const mongoose = require('mongoose');

const dailyMissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['complete_lessons', 'earn_xp', 'perfect_score', 'streak_maintain'],
    required: true
  },
  target: {
    type: Number,
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  reward: {
    xp: { type: Number, default: 0 },
    coins: { type: Number, default: 0 }
  },
  requiresProof: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'completed', 'rejected'],
    default: 'active'
  },
  proof: {
    url: String,
    description: String,
    submittedAt: Date,
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'needs_review'],
      default: 'pending'
    },
    verificationScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    verificationDetails: {
      hasImage: Boolean,
      imageQuality: Number,
      relevanceScore: Number,
      timestamp: Date,
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rejectionReason: String
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
dailyMissionSchema.index({ user: 1, expiresAt: 1 });
dailyMissionSchema.index({ user: 1, isCompleted: 1 });

// Method to update progress
dailyMissionSchema.methods.updateProgress = function (amount) {
  this.progress = Math.min(this.progress + amount, this.target);
  if (this.progress >= this.target) {
    this.isCompleted = true;
  }
  return this.save();
};

// Static method to generate daily missions
dailyMissionSchema.statics.generateDailyMissions = async function (userId) {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setHours(23, 59, 59, 999);

  const missions = [
    {
      user: userId,
      type: 'complete_lessons',
      title: 'Quick Learner',
      description: 'Complete 3 lessons to boost your knowledge.',
      target: 3,
      reward: { xp: 50, coins: 10 },
      expiresAt,
      requiresProof: false
    },
    {
      user: userId,
      type: 'earn_xp',
      title: 'XP Grind',
      description: 'Progress through your curriculum and earn 100 XP.',
      target: 100,
      reward: { xp: 30, coins: 5 },
      expiresAt,
      requiresProof: false
    },
    {
      user: userId,
      type: 'perfect_score',
      title: 'Mastermind',
      description: 'Get a perfect score (10/10) on any quiz today.',
      target: 1,
      reward: { xp: 75, coins: 15 },
      expiresAt,
      requiresProof: false
    }
  ];

  return await this.insertMany(missions);
};

// Method to submit proof
dailyMissionSchema.methods.submitProof = async function (proofUrl, description) {
  if (!this.requiresProof) {
    throw new Error('This mission does not require proof');
  }

  this.proof = {
    url: proofUrl,
    description: description || '',
    submittedAt: new Date(),
    verificationStatus: 'pending',
    verificationScore: 0
  };

  this.status = 'pending';

  // Auto-verify with algorithm
  await this.autoVerifyProof();

  return await this.save();
};

// Automated verification algorithm
dailyMissionSchema.methods.autoVerifyProof = async function () {
  if (!this.proof || !this.proof.url) {
    return;
  }

  let score = 0;
  const details = {
    hasImage: false,
    imageQuality: 0,
    relevanceScore: 0,
    timestamp: new Date()
  };

  // Check 1: Has image URL (30 points)
  if (this.proof.url && this.proof.url.length > 0) {
    details.hasImage = true;
    score += 30;
  }

  // Check 2: Image quality based on URL format (30 points)
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const hasValidExtension = imageExtensions.some(ext =>
    this.proof.url.toLowerCase().includes(ext)
  );

  if (hasValidExtension) {
    details.imageQuality = 30;
    score += 30;
  } else if (this.proof.url.includes('upload') || this.proof.url.includes('cloudinary')) {
    // Cloud storage URLs
    details.imageQuality = 25;
    score += 25;
  }

  // Check 3: Description relevance (40 points)
  if (this.proof.description) {
    const descLength = this.proof.description.length;
    const keywords = ['eco', 'green', 'sustain', 'recycle', 'environment', 'clean', 'plant', 'tree'];
    const descLower = this.proof.description.toLowerCase();

    // Length score (max 20 points)
    if (descLength >= 50) {
      details.relevanceScore = 20;
      score += 20;
    } else if (descLength >= 20) {
      details.relevanceScore = 15;
      score += 15;
    } else if (descLength >= 10) {
      details.relevanceScore = 10;
      score += 10;
    }

    // Keyword score (max 20 points)
    const keywordMatches = keywords.filter(kw => descLower.includes(kw)).length;
    const keywordScore = Math.min(keywordMatches * 5, 20);
    details.relevanceScore += keywordScore;
    score += keywordScore;
  }

  this.proof.verificationScore = score;
  this.proof.verificationDetails = details;

  // Auto-approve if score >= 60
  if (score >= 60) {
    this.proof.verificationStatus = 'approved';
    this.status = 'completed';
    this.isCompleted = true;
    this.progress = this.target;
  }
  // Needs review if score between 40-69
  else if (score >= 40) {
    this.proof.verificationStatus = 'needs_review';
    this.status = 'pending';
  }
  // Auto-reject if score < 40
  else {
    this.proof.verificationStatus = 'rejected';
    this.status = 'rejected';
    this.proof.verificationDetails.rejectionReason = 'Insufficient proof quality. Please provide a clear image with detailed description.';
  }
};

// Method for manual verification by admin
dailyMissionSchema.methods.manualVerify = async function (approved, verifiedBy, reason) {
  if (!this.proof) {
    throw new Error('No proof submitted for this mission');
  }

  this.proof.verificationStatus = approved ? 'approved' : 'rejected';
  this.proof.verificationDetails.verifiedBy = verifiedBy;

  if (approved) {
    this.status = 'completed';
    this.isCompleted = true;
    this.progress = this.target;
    this.proof.verificationScore = 100; // Manual approval = perfect score
  } else {
    this.status = 'rejected';
    this.proof.verificationDetails.rejectionReason = reason || 'Proof did not meet requirements';
  }

  return await this.save();
};

// Static method to get missions requiring review
dailyMissionSchema.statics.getMissionsNeedingReview = async function () {
  return await this.find({
    'proof.verificationStatus': 'needs_review',
    status: 'pending'
  }).populate('user', 'name email avatar');
};


module.exports = mongoose.model('DailyMission', dailyMissionSchema);