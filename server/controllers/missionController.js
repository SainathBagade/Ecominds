// server/controllers/missionController.js
const DailyMission = require('../models/DailyMission');
const MissionCompletion = require('../models/MissionCompletion');
const UserProgress = require('../models/UserProgress');
const StreakHistory = require('../models/StreakHistory');

// Get user's daily missions
exports.getDailyMissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Find active missions
    let missions = await DailyMission.find({
      user: userId,
      expiresAt: { $gt: now }
    });

    // If no missions exist, generate new ones
    if (missions.length === 0) {
      missions = await DailyMission.generateDailyMissions(userId);
    }

    res.json({
      success: true,
      data: missions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching daily missions',
      error: error.message
    });
  }
};

// Update mission progress
exports.updateMissionProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { missionId, progress } = req.body;

    const mission = await DailyMission.findOne({
      _id: missionId,
      user: userId
    });

    if (!mission) {
      return res.status(404).json({
        success: false,
        message: 'Mission not found'
      });
    }

    if (mission.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Mission has expired'
      });
    }

    await mission.updateProgress(progress);

    // If mission completed, award rewards
    if (mission.isCompleted) {
      const userProgress = await UserProgress.findOne({ user: userId });
      await userProgress.addXP(mission.reward.xp);
      await userProgress.addCoins(mission.reward.coins);

      // Create completion record
      await MissionCompletion.create({
        user: userId,
        mission: missionId,
        missionType: mission.type,
        rewardClaimed: mission.reward
      });

      // Update streak history
      await StreakHistory.updateToday(userId, userProgress.currentStreak, {
        missionsCompleted: 1
      });
    }

    res.json({
      success: true,
      data: mission,
      message: mission.isCompleted ? 'Mission completed!' : 'Progress updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating mission progress',
      error: error.message
    });
  }
};

// Claim mission reward
exports.claimMissionReward = async (req, res) => {
  try {
    const userId = req.user.id;
    const { missionId } = req.params;

    const mission = await DailyMission.findOne({
      _id: missionId,
      user: userId
    });

    if (!mission) {
      return res.status(404).json({
        success: false,
        message: 'Mission not found'
      });
    }

    if (!mission.isCompleted) {
      mission.isCompleted = true;
      mission.status = 'completed';
      await mission.save();
    }

    const userProgress = await UserProgress.findOne({ user: userId });
    await userProgress.addXP(mission.reward.xp);
    await userProgress.addCoins(mission.reward.coins);

    // Create completion record
    const completion = await MissionCompletion.create({
      user: userId,
      mission: missionId,
      missionType: mission.type,
      rewardClaimed: mission.reward
    });

    res.json({
      success: true,
      data: {
        completion,
        userProgress
      },
      message: 'Reward claimed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error claiming reward',
      error: error.message
    });
  }
};

// Get mission completion history
exports.getMissionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 7 } = req.query;

    const stats = await MissionCompletion.getUserStats(userId, parseInt(days));

    const completions = await MissionCompletion.find({ user: userId })
      .sort({ completedAt: -1 })
      .limit(20)
      .populate('mission');

    res.json({
      success: true,
      data: {
        stats,
        completions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching mission history',
      error: error.message
    });
  }
};

// Generate new daily missions (manual trigger)
exports.generateMissions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete expired missions
    await DailyMission.deleteMany({
      user: userId,
      expiresAt: { $lt: new Date() }
    });

    // Generate new missions
    const missions = await DailyMission.generateDailyMissions(userId);

    res.json({
      success: true,
      data: missions,
      message: 'New missions generated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating missions',
      error: error.message
    });
  }
};

// Submit mission proof
exports.submitMissionProof = async (req, res) => {
  try {
    const { missionId } = req.params;
    const { description } = req.body;
    const userId = req.user.id;

    const mission = await DailyMission.findOne({
      _id: missionId,
      user: userId
    });

    if (!mission) {
      return res.status(404).json({
        success: false,
        message: 'Mission not found'
      });
    }

    if (!mission.requiresProof) {
      return res.status(400).json({
        success: false,
        message: 'This mission does not require proof'
      });
    }

    if (mission.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Mission has expired'
      });
    }

    // Get proof URL from uploaded file
    let proofUrl = '';
    if (req.file) {
      proofUrl = `/uploads/proofs/${req.file.filename}`;
    } else if (req.body.proofUrl) {
      proofUrl = req.body.proofUrl;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please upload a proof image'
      });
    }

    // Submit proof and auto-verify
    await mission.submitProof(proofUrl, description);

    // If auto-approved, award rewards
    if (mission.proof.verificationStatus === 'approved') {
      const userProgress = await UserProgress.findOne({ user: userId });
      if (userProgress) {
        await userProgress.addXP(mission.reward.xp);
        await userProgress.addCoins(mission.reward.coins);

        // Create completion record
        await MissionCompletion.create({
          user: userId,
          mission: missionId,
          missionType: mission.type,
          rewardClaimed: mission.reward
        });

        // Update streak history
        await StreakHistory.updateToday(userId, userProgress.currentStreak, {
          missionsCompleted: 1
        });
      }
    }

    res.json({
      success: true,
      data: {
        mission,
        verificationStatus: mission.proof.verificationStatus,
        verificationScore: mission.proof.verificationScore,
        message: mission.proof.verificationStatus === 'approved'
          ? 'Proof approved! Rewards awarded.'
          : mission.proof.verificationStatus === 'needs_review'
            ? 'Proof submitted for review. You will be notified once verified.'
            : 'Proof rejected. Please resubmit with better quality image and description.'
      },
      message: 'Proof submitted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get missions needing review (Admin only)
exports.getMissionsNeedingReview = async (req, res) => {
  try {
    const missions = await DailyMission.getMissionsNeedingReview();

    res.json({
      success: true,
      data: missions,
      count: missions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching missions for review',
      error: error.message
    });
  }
};

// Manual verification by admin
exports.verifyMissionProof = async (req, res) => {
  try {
    const { missionId } = req.params;
    const { approved, reason } = req.body;
    const adminId = req.user.id;

    const mission = await DailyMission.findById(missionId);
    if (!mission) {
      return res.status(404).json({
        success: false,
        message: 'Mission not found'
      });
    }

    await mission.manualVerify(approved, adminId, reason);

    // If approved, award rewards
    if (approved) {
      const userProgress = await UserProgress.findOne({ user: mission.user });
      if (userProgress) {
        await userProgress.addXP(mission.reward.xp);
        await userProgress.addCoins(mission.reward.coins);

        await MissionCompletion.create({
          user: mission.user,
          mission: missionId,
          missionType: mission.type,
          rewardClaimed: mission.reward
        });
      }
    }

    res.json({
      success: true,
      data: mission,
      message: approved ? 'Mission approved and rewards awarded' : 'Mission rejected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying mission',
      error: error.message
    });
  }
};
