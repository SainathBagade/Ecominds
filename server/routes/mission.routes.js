// const express = require('express');
// const router = express.Router();
// const {
//   createLesson,
//   getAllLessons,
//   getLessonById,
//   getLessonsByModule,
//   updateLesson,
//   deleteLesson,
// } = require('../controllers/lessonController');

// // Static routes first
// router.post('/', createLesson);
// router.get('/', getAllLessons);
// router.get('/module/:moduleId', getLessonsByModule);

// // Dynamic routes last
// router.get('/:id', getLessonById);
// router.put('/:id', updateLesson);
// router.delete('/:id', deleteLesson);

// module.exports = router;


// server/routes/missionRoutes.js
const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload.middleware');

// All routes require authentication
router.use(protect);

// @route   GET /api/missions
// @desc    Get user's daily missions
// @access  Private
router.get('/', missionController.getDailyMissions);

// @route   POST /api/missions/update
// @desc    Update mission progress
// @access  Private
router.post('/update', missionController.updateMissionProgress);

// @route   POST /api/missions/:missionId/complete
// @desc    Mark mission as complete
// @access  Private
router.post('/:missionId/complete', missionController.claimMissionReward);

// @route   POST /api/missions/:missionId/proof
// @desc    Submit mission proof
// @access  Private
router.post('/:missionId/proof', uploadImage.single('proof'), missionController.submitMissionProof);

// @route   POST /api/missions/:missionId/claim
// @desc    Claim mission reward
// @access  Private
router.post('/:missionId/claim', missionController.claimMissionReward);

// @route   GET /api/missions/history
// @desc    Get mission completion history
// @access  Private
router.get('/history', missionController.getMissionHistory);

// @route   POST /api/missions/generate
// @desc    Generate new daily missions
// @access  Private
router.post('/generate', missionController.generateMissions);

// @route   GET /api/missions/review
// @desc    Get missions needing review (Admin only)
// @access  Private/Admin
router.get('/review', missionController.getMissionsNeedingReview);

// @route   POST /api/missions/:missionId/verify
// @desc    Manually verify mission proof (Admin only)
// @access  Private/Admin
router.post('/:missionId/verify', missionController.verifyMissionProof);

module.exports = router;