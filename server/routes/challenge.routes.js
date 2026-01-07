// server/routes/challengeRoutes.js
const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload.middleware');

// All routes require authentication
router.use(protect);

// @route   GET /api/challenges
// @desc    Get all active challenges
// @access  Private
router.get('/', challengeController.getActiveChallenges);

// @route   GET /api/challenges/featured
// @desc    Get featured challenges
// @access  Private
router.get('/featured', challengeController.getFeaturedChallenges);

// @route   GET /api/challenges/user
// @desc    Get user's challenges
// @access  Private
router.get('/user', challengeController.getUserChallenges);

// @route   GET /api/challenges/my-stats
// @desc    Get user's challenge stats
// @access  Private
router.get('/my-stats', challengeController.getMyStats);

// @route   GET /api/challenges/category/:category
// @desc    Get challenges by category
// @access  Private
router.get('/category/:category', challengeController.getChallengesByCategory);

// @route   GET /api/challenges/:challengeId
// @desc    Get challenge by ID
// @access  Private
router.get('/:challengeId', challengeController.getChallengeById);

// @route   POST /api/challenges
// @desc    Create new challenge
// @access  Private
router.post('/', challengeController.createChallenge);

// @route   POST /api/challenges/:challengeId/join
// @desc    Join a challenge
// @access  Private
router.post('/:challengeId/join', challengeController.joinChallenge);

// @route   PUT /api/challenges/:challengeId/progress
// @desc    Update challenge progress
// @access  Private
router.put('/:challengeId/progress', challengeController.updateChallengeProgress);

// @route   POST /api/challenges/:challengeId/submit-proof
// @desc    Submit challenge proof
// @access  Private
router.post('/:challengeId/submit-proof', uploadImage.single('proof'), challengeController.submitChallengeProof);

// @route   POST /api/challenges/:challengeId/leave
// @desc    Leave a challenge
// @access  Private
router.post('/:challengeId/leave', challengeController.leaveChallenge);

// @route   DELETE /api/challenges/:challengeId
// @desc    Delete challenge
// @access  Private
router.delete('/:challengeId', challengeController.deleteChallenge);

module.exports = router;