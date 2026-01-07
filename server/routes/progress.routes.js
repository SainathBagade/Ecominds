// server/routes/progressRoutes.js
const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route   GET /api/progress
// @desc    Get user's overall progress
// @access  Private
router.get('/', progressController.getUserProgress);

// @route   POST /api/progress/lesson
// @desc    Update lesson progress
// @access  Private
router.post('/lesson', progressController.updateLessonProgress);

// @route   GET /api/progress/lesson/:lessonId
// @desc    Get specific lesson progress
// @access  Private
router.get('/lesson/:lessonId', progressController.getLessonProgress);

// @route   GET /api/progress/module/:moduleId
// @desc    Get module progress with all lessons
// @access  Private
router.get('/module/:moduleId', progressController.getModuleProgress);

// @route   GET /api/progress/modules
// @desc    Get all modules progress
// @access  Private
router.get('/modules', progressController.getAllModulesProgress);

// @route   POST /api/progress/module/:moduleId/unlock
// @desc    Unlock a module
// @access  Private
router.post('/module/:moduleId/unlock', progressController.unlockModule);

// @route   GET /api/progress/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', progressController.getUserStats);

// @route   POST /api/progress/module/:moduleId/certificate
// @desc    Issue certificate for completed module
// @access  Private
router.post('/module/:moduleId/certificate', progressController.issueCertificate);

// @route   POST /api/progress/reset
// @desc    Reset all user progress
// @access  Private
router.post('/reset', progressController.resetUserProgress);

module.exports = router;