const express = require('express');
const router = express.Router();
const {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  getQuestionsByQuiz,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/questionController');

// Static routes first
router.post('/', createQuestion);
router.get('/', getAllQuestions);
router.get('/quiz/:quizId', getQuestionsByQuiz);

// Dynamic routes last
router.get('/:id', getQuestionById);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

module.exports = router;