// server/controllers/competitionController.js
const Competition = require('../models/Competition');
const UserProgress = require('../models/UserProgress');
const Notification = require('../models/Notification');

// Get all active competitions
// Get all active competitions
exports.getActiveCompetitions = async (req, res) => {
  try {
    const { status = 'upcoming' } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();

    // 1. Auto-expire past competitions (completed)
    await Competition.updateMany(
      { endDate: { $lt: now }, status: { $ne: 'completed' } },
      { $set: { status: 'completed' } }
    );

    // 2. Auto-start active events (registration -> in_progress)
    await Competition.updateMany(
      { startDate: { $lte: now }, endDate: { $gt: now }, status: 'registration' },
      { $set: { status: 'in_progress' } }
    );

    let query = {};

    switch (status) {
      case 'upcoming':
        // Show all competitions in registration phase (whether registration is open or not)
        query = {
          status: 'registration',
          endDate: { $gte: today }
        };
        break;
      case 'ongoing':
        query = {
          status: 'in_progress',
          endDate: { $gte: today }
        };
        break;
      case 'completed':
        query = { status: 'completed' };
        break;
      default:
        query = { status: 'registration', endDate: { $gte: today } };
    }

    const competitions = await Competition.find(query)
      .populate('createdBy', 'name avatar')
      .sort({ startDate: 1 });

    res.json({
      success: true,
      data: competitions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching competitions',
      error: error.message
    });
  }
};

// Get competition by ID
exports.getCompetitionById = async (req, res) => {
  try {
    const { competitionId } = req.params;

    const competition = await Competition.findById(competitionId)
      .populate('createdBy', 'name avatar')
      .populate('participants.user', 'name avatar')
      .populate('leaderboard.user', 'name avatar');

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }

    res.json({
      success: true,
      data: competition
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching competition',
      error: error.message
    });
  }
};

// Create new competition
exports.createCompetition = async (req, res) => {
  try {
    const userId = req.user.id;

    // Parse JSON fields if they come as strings (from FormData)
    let parsedBody = { ...req.body };
    if (typeof parsedBody.prizes === 'string') {
      try { parsedBody.prizes = JSON.parse(parsedBody.prizes); } catch (e) { }
    }
    if (typeof parsedBody.criteria === 'string') {
      try { parsedBody.criteria = JSON.parse(parsedBody.criteria); } catch (e) { }
    }
    if (typeof parsedBody.rules === 'string') {
      try { parsedBody.rules = JSON.parse(parsedBody.rules); } catch (e) { }
    }

    const competitionData = {
      ...parsedBody,
      createdBy: userId,
      image: req.file ? req.file.path.replace(/\\/g, "/") : undefined
    };

    const competition = await Competition.create(competitionData);

    res.status(201).json({
      success: true,
      data: competition,
      message: 'Competition created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating competition',
      error: error.message
    });
  }
};

// Register for competition
exports.registerForCompetition = async (req, res) => {
  try {
    const userId = req.user.id;
    const { competitionId } = req.params;
    const { teamName } = req.body || {};

    const competition = await Competition.findById(competitionId);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }

    // Check entry fee
    // Get or create user progress safely
    let userProgress = await UserProgress.findOneAndUpdate(
      { user: userId },
      { $setOnInsert: { user: userId, coins: 0, totalXP: 0 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (competition.entryFee.coins > 0) {
      if (userProgress.coins < competition.entryFee.coins) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient coins for entry fee'
        });
      }

      await userProgress.spendCoins(competition.entryFee.coins);
    }

    await competition.registerParticipant(userId, teamName);

    // Create notification
    await Notification.createCompetitionStart(userId, {
      id: competition._id,
      title: competition.title
    });

    res.json({
      success: true,
      data: competition,
      message: 'Successfully registered for competition'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update competition score
exports.updateCompetitionScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { competitionId } = req.params;
    const scoreData = req.body;

    const competition = await Competition.findById(competitionId);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }

    if (competition.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Competition is not in progress'
      });
    }

    await competition.updateScore(userId, scoreData);

    res.json({
      success: true,
      data: competition,
      message: 'Score updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Start competition (creator/admin only)
exports.startCompetition = async (req, res) => {
  try {
    const { competitionId } = req.params;

    const competition = await Competition.findById(competitionId);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }

    await competition.startCompetition();

    // Notify all participants
    for (const participant of competition.participants) {
      await Notification.create({
        user: participant.user,
        type: 'competition_start',
        title: '🏁 Competition Started!',
        message: `${competition.title} has begun! Good luck!`,
        category: 'game',
        priority: 'high'
      });
    }

    res.json({
      success: true,
      data: competition,
      message: 'Competition started successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// End competition and distribute prizes
exports.endCompetition = async (req, res) => {
  try {
    const { competitionId } = req.params;

    const competition = await Competition.findById(competitionId);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }

    await competition.endCompetition();

    // Distribute prizes
    for (const entry of competition.leaderboard) {
      let prize;

      if (entry.rank === 1) {
        prize = competition.prizes.first;
      } else if (entry.rank === 2) {
        prize = competition.prizes.second;
      } else if (entry.rank === 3) {
        prize = competition.prizes.third;
      } else {
        prize = competition.prizes.participation;
      }

      const userProgress = await UserProgress.findOne({ user: entry.user });
      if (prize.xp) await userProgress.addXP(prize.xp);
      if (prize.coins) await userProgress.addCoins(prize.coins);

      // Notify participant
      await Notification.create({
        user: entry.user,
        type: 'competition_result',
        title: '🏆 Competition Results',
        message: `You ranked #${entry.rank} in ${competition.title}!`,
        data: { rank: entry.rank, prize },
        category: 'game',
        priority: 'high'
      });
    }

    res.json({
      success: true,
      data: competition,
      message: 'Competition ended and prizes distributed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error ending competition',
      error: error.message
    });
  }
};

// Get competition leaderboard
exports.getCompetitionLeaderboard = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const { limit = 10 } = req.query;

    const competition = await Competition.findById(competitionId)
      .populate('leaderboard.user', 'name avatar');

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }

    const leaderboard = competition.leaderboard.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
};

// Get user's competitions
exports.getUserCompetitions = async (req, res) => {
  try {
    const userId = req.user.id;

    const competitions = await Competition.find({
      'participants.user': userId
    }).populate('createdBy', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: competitions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching competitions',
      error: error.message
    });
  }
};

// Get featured competitions
exports.getFeaturedCompetitions = async (req, res) => {
  try {
    const competitions = await Competition.find({
      featured: true,
      status: { $in: ['registration', 'in_progress'] }
    }).populate('createdBy', 'name avatar')
      .sort({ startDate: 1 })
      .limit(5);

    res.json({
      success: true,
      data: competitions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured competitions',
      error: error.message
    });
  }
};

// Cancel competition (creator only)
exports.cancelCompetition = async (req, res) => {
  try {
    const userId = req.user.id;
    const { competitionId } = req.params;

    const competition = await Competition.findById(competitionId);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      });
    }

    if (competition.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    competition.status = 'cancelled';
    await competition.save();

    // Refund entry fees if applicable
    if (competition.entryFee.coins > 0) {
      for (const participant of competition.participants) {
        const userProgress = await UserProgress.findOne({ user: participant.user });
        await userProgress.addCoins(competition.entryFee.coins);
      }
    }

    res.json({
      success: true,
      message: 'Competition cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling competition',
      error: error.message
    });
  }
};

// Get user's competition statistics
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const comps = await Competition.find({ 'participants.user': userId });

    const stats = {
      participated: comps.length,
      won: comps.filter(c => c.leaderboard.some(l => l.user.toString() === userId.toString() && l.rank === 1)).length,
      totalPoints: comps.reduce((acc, c) => {
        const p = c.participants.find(part => part.user.toString() === userId.toString());
        return acc + (p?.score || 0);
      }, 0)
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};