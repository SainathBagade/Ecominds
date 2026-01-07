const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const { HTTP_STATUS } = require('../config/constants');

// @desc    Create new question
// @route   POST /api/questions
// @access  Private (Admin/Teacher)
const createQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    
    // Update quiz's total points
    const questions = await Question.find({ quiz: question.quiz });
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    await Quiz.findByIdAndUpdate(question.quiz, { totalPoints });
    
    res.status(HTTP_STATUS.CREATED).json(question);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get all questions
// @route   GET /api/questions
// @access  Public
const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ isActive: true })
      .populate('quiz', 'title')
      .sort({ order: 1 });
    res.json(questions);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get question by ID
// @route   GET /api/questions/:id
// @access  Public
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('quiz', 'title');
    
    if (!question) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Question not found' });
    }
    
    res.json(question);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get questions by quiz
// @route   GET /api/questions/quiz/:quizId
// @access  Public
const getQuestionsByQuiz = async (req, res) => {
  try {
    const questions = await Question.find({ 
      quiz: req.params.quizId, 
      isActive: true 
    }).sort({ order: 1 });
    
    res.json(questions);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private (Admin/Teacher)
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('quiz');

    if (!question) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Question not found' });
    }

    // Recalculate quiz's total points
    const questions = await Question.find({ quiz: question.quiz._id });
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    await Quiz.findByIdAndUpdate(question.quiz._id, { totalPoints });

    res.json(question);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private (Admin)
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Question not found' });
    }

    const quizId = question.quiz;
    await question.deleteOne();

    // Recalculate quiz's total points
    const questions = await Question.find({ quiz: quizId });
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    await Quiz.findByIdAndUpdate(quizId, { totalPoints });

    res.json({ message: 'Question removed' });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  getQuestionsByQuiz,
  updateQuestion,
  deleteQuestion,
};