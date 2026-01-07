const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { protect } = require('../middleware/auth');

// @route   GET /api/games
// @desc    Get all games
// @access  Public
router.get('/', gameController.getAllGames);

// @route   GET /api/games/my-scores
// @desc    Get user scores
// @access  Private
router.get('/my-scores', protect, gameController.getUserScores);

// @route   GET /api/games/:id
// @desc    Get game by ID
// @access  Public
router.get('/:id', gameController.getGameById);

// @route   POST /api/games/:id/record
// @desc    Record game score
// @access  Private
router.post('/:id/record', protect, gameController.recordGameScore);

module.exports = router;