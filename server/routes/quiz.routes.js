const express = require('express');
const router = express.Router();
const {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  getQuizStats,
  getQuizzesByLesson,
  updateQuiz,
  deleteQuiz,
  getQuizHierarchy,
} = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

// Static routes first
router.get('/hierarchy', getQuizHierarchy);
router.get('/stats', protect, getQuizStats);
router.post('/', protect, createQuiz);
router.get('/', getAllQuizzes);
router.get('/lesson/:lessonId', getQuizzesByLesson);

// Dynamic routes last
router.get('/:id', getQuizById);
router.put('/:id', protect, updateQuiz);
router.delete('/:id', protect, deleteQuiz);

module.exports = router;
