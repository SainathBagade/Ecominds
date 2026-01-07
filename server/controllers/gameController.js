const Game = require('../models/Game');
const { HTTP_STATUS } = require('../config/constants');

// @desc    Get all games
// @route   GET /api/games
// @access  Public
exports.getAllGames = async (req, res) => {
  try {
    const games = await Game.find({ isActive: true })
      .select('title description type category difficulty thumbnail settings rewards')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: games
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching games',
      error: error.message
    });
  }
};

// @desc    Get game by ID
// @route   GET /api/games/:id
// @access  Public
exports.getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }
    res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching game',
      error: error.message
    });
  }
};

// @desc    Get user scores
// @route   GET /api/games/my-scores
// @access  Private
exports.getUserScores = async (req, res) => {
  try {
    // Find games where user is in leaderboard
    const games = await Game.find({
      'leaderboard.user': req.user._id
    }).select('title leaderboard type difficulty');

    const scores = games.map(game => {
      const entry = game.leaderboard.find(e => e.user.toString() === req.user._id.toString());
      return {
        gameId: game._id,
        title: game.title,
        score: entry ? entry.score : 0,
        date: entry ? entry.playedAt : null,
        pointsEarned: 0 // Placeholder as logic is complex
      };
    });

    res.status(200).json({
      success: true,
      data: scores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user scores',
      error: error.message
    });
  }
};

// @desc    Record game session/score
// @route   POST /api/games/:id/record
// @access  Private
exports.recordGameScore = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    const sessionData = req.body; // { score, time, completed }
    await game.recordSession(req.user._id, sessionData);

    res.json({ success: true, message: 'Score recorded' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};