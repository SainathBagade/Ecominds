// server/controllers/challengeController.js
const Challenge = require('../models/Challenge');
const UserProgress = require('../models/UserProgress');
const Notification = require('../models/Notification');

// Get all active challenges
exports.getActiveChallenges = async (req, res) => {
  try {
    const userId = req.user.id;
    const { difficulty, status, completed } = req.query;

    // Build query
    const query = { isActive: true };

    // Add difficulty filter if provided
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Filter by completion status
    if (completed === 'true') {
      // User has completed these
      query.participants = {
        $elemMatch: {
          user: userId,
          isCompleted: true
        }
      };
    } else if (status === 'active') {
      // Challenges available to the user (not completed yet)
      // Either not joined OR joined but not completed
      // limiting to just "not completed" for simplicity if that's the intent, 
      // but usually "Active" tab implies things TO DO.
      query.participants = {
        $not: {
          $elemMatch: {
            user: userId,
            isCompleted: true
          }
        }
      };
    }

    // Get challenges
    const challenges = await Challenge.find(query)
      .populate('createdBy', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: challenges
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching challenges',
      error: error.message
    });
  }
};

// Get challenge by ID
exports.getChallengeById = async (req, res) => {
  try {
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId)
      .populate('createdBy', 'name avatar')
      .populate('participants.user', 'name avatar');

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    res.json({
      success: true,
      data: challenge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching challenge',
      error: error.message
    });
  }
};

// Get user's challenges
exports.getUserChallenges = async (req, res) => {
  try {
    const userId = req.user.id;
    const challenges = await Challenge.getUserChallenges(userId);

    res.json({
      success: true,
      data: challenges
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user challenges',
      error: error.message
    });
  }
};

// Get user challenge stats
exports.getMyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const allChallenges = await Challenge.find({ 'participants.user': userId });

    const stats = {
      total: allChallenges.length,
      completed: allChallenges.filter(c => {
        const p = c.participants.find(part => part.user.toString() === userId.toString());
        return p?.isCompleted;
      }).length,
      pending: allChallenges.filter(c => {
        const p = c.participants.find(part => part.user.toString() === userId.toString());
        return !p?.isCompleted;
      }).length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message
    });
  }
};

// Create new challenge
exports.createChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    const challengeData = {
      ...req.body,
      createdBy: userId
    };

    const challenge = await Challenge.create(challengeData);

    res.status(201).json({
      success: true,
      data: challenge,
      message: 'Challenge created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating challenge',
      error: error.message
    });
  }
};

// Join a challenge
exports.joinChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    await challenge.joinChallenge(userId);

    // Create notification
    await Notification.createChallengeInvite(userId, {
      id: challenge._id,
      title: challenge.title
    });

    res.json({
      success: true,
      data: challenge,
      message: 'Successfully joined the challenge'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update challenge progress
exports.updateChallengeProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { challengeId } = req.params;
    const { progress } = req.body;

    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    await challenge.updateProgress(userId, progress);

    // Check if completed (for notification only)
    const participant = challenge.participants.find(
      p => p.user.toString() === userId.toString()
    );

    if (participant && participant.isCompleted) {
      // Create notification - we only want to notify once, but model handles reward once.
      // Logic for "just completed" could be improved, but moving rewards to model already fixed double-coins.
      await Notification.createMissionComplete(userId, {
        title: challenge.title,
        rewards: challenge.rewards
      });
    }

    res.json({
      success: true,
      data: challenge,
      message: participant?.isCompleted ? 'Challenge completed!' : 'Progress updated'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Leave a challenge
exports.leaveChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    challenge.participants = challenge.participants.filter(
      p => p.user.toString() !== userId.toString()
    );

    await challenge.save();

    res.json({
      success: true,
      message: 'Successfully left the challenge'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error leaving challenge',
      error: error.message
    });
  }
};

// Get featured challenges
exports.getFeaturedChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({ featured: true, isActive: true })
      .populate('createdBy', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: challenges
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured challenges',
      error: error.message
    });
  }
};

// Get challenges by category
exports.getChallengesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const challenges = await Challenge.find({
      category,
      isActive: true
    }).populate('createdBy', 'name avatar');

    res.json({
      success: true,
      data: challenges
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching challenges',
      error: error.message
    });
  }
};

// Delete challenge (creator only)
exports.deleteChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    if (challenge.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this challenge'
      });
    }

    await Challenge.findByIdAndDelete(challengeId);

    res.json({
      success: true,
      message: 'Challenge deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting challenge',
      error: error.message
    });
  }
};

// Submit challenge proof
exports.submitChallengeProof = async (req, res) => {
  try {
    const userId = req.user.id;
    const { challengeId } = req.params;
    let { proofUrl } = req.body;

    // If file is uploaded, use the file path
    if (req.file) {
      proofUrl = `/uploads/proofs/${req.file.filename}`;
    }

    // Safety: Ensure proofUrl is a string to prevent "Cast to string failed"
    if (typeof proofUrl !== 'string') {
      proofUrl = proofUrl ? JSON.stringify(proofUrl) : '';
    }

    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    await challenge.submitProof(userId, proofUrl);

    res.json({
      success: true,
      message: 'Proof submitted successfully! You earned rewards.',
      data: challenge
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};