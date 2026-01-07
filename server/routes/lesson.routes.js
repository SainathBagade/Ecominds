const express = require('express');
const router = express.Router();
const {
  createLesson,
  getAllLessons,
  getLessonById,
  getLessonsByModule,
  updateLesson,
  deleteLesson,
  completeLesson,
} = require('../controllers/lessonController');
const { protect, optionalAuth } = require('../middleware/auth');

// Static routes first
router.post('/', protect, createLesson);
router.get('/', optionalAuth, getAllLessons);
router.get('/module/:moduleId', getLessonsByModule);

// Dynamic routes last
router.get('/:id', optionalAuth, getLessonById);
router.post('/:id/complete', protect, completeLesson);
router.put('/:id', protect, updateLesson);
router.delete('/:id', protect, deleteLesson);

module.exports = router;
