// server/routes/competitionRoutes.js
const express = require('express');
const router = express.Router();
const competitionController = require('../controllers/competitionController');
const { protect } = require('../middleware/auth');
const { teacherOrAdmin } = require('../middleware/role.middleware');
const { uploadImage } = require('../middleware/upload.middleware');

// All routes require authentication
router.use(protect);

// @route   GET /api/competitions
// @desc    Get all active competitions
// @access  Private
router.get('/', competitionController.getActiveCompetitions);

// @route   GET /api/competitions/featured
// @desc    Get featured competitions
// @access  Private
router.get('/featured', competitionController.getFeaturedCompetitions);

// @route   GET /api/competitions/user
// @desc    Get user's competitions
// @access  Private
router.get('/user', competitionController.getUserCompetitions);

// @route   GET /api/competitions/my-stats
// @desc    Get user's competition statistics
// @access  Private
router.get('/my-stats', competitionController.getUserStats);

// @route   GET /api/competitions/:competitionId
// @desc    Get competition by ID
// @access  Private
router.get('/:competitionId', competitionController.getCompetitionById);

// @route   POST /api/competitions
// @desc    Create new competition
// @access  Private (Teacher/Admin)
router.post('/', teacherOrAdmin, uploadImage.single('image'), competitionController.createCompetition);

// @route   POST /api/competitions/:competitionId/register
// @desc    Register for competition
// @access  Private
router.post('/:competitionId/register', competitionController.registerForCompetition);

// @route   PUT /api/competitions/:competitionId/score
// @desc    Update competition score
// @access  Private
router.put('/:competitionId/score', competitionController.updateCompetitionScore);

// @route   POST /api/competitions/:competitionId/start
// @desc    Start competition
// @access  Private
router.post('/:competitionId/start', competitionController.startCompetition);

// @route   POST /api/competitions/:competitionId/end
// @desc    End competition and distribute prizes
// @access  Private
router.post('/:competitionId/end', competitionController.endCompetition);

// @route   GET /api/competitions/:competitionId/leaderboard
// @desc    Get competition leaderboard
// @access  Private
router.get('/:competitionId/leaderboard', competitionController.getCompetitionLeaderboard);

// @route   POST /api/competitions/:competitionId/cancel
// @desc    Cancel competition
// @access  Private
router.post('/:competitionId/cancel', competitionController.cancelCompetition);

module.exports = router;