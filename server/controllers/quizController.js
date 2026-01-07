const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Subject = require('../models/Subject');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Grade = require('../models/Grade');
const Submission = require('../models/Submission');
const { HTTP_STATUS } = require('../config/constants');

// @desc    Create new quiz
// @route   POST /api/quizzes
// @access  Private (Teacher/Admin)
const createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(HTTP_STATUS.CREATED).json(quiz);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Public
const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isActive: true })
      .populate('lesson', 'title module')
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get quiz by ID with questions (POPULATE EXAMPLE)
// @route   GET /api/quizzes/:id
// @access  Public
const getQuizById = async (req, res) => {
  try {
    // Populate lesson AND get all questions for this quiz
    const quiz = await Quiz.findById(req.params.id)
      .populate({
        path: 'lesson',
        populate: {
          path: 'module',
          populate: {
            path: 'subject',
            populate: { path: 'grade' }
          }
        }
      });

    if (!quiz) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Quiz not found' });
    }

    // Get questions separately (sorted by order)
    const questions = await Question.find({ quiz: quiz._id, isActive: true })
      .sort({ order: 1 })
      .select('-correctAnswer -explanation'); // Hide correct answers initially

    res.json({
      quiz,
      questions,
      totalQuestions: questions.length
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get quizzes by lesson
// @route   GET /api/quizzes/lesson/:lessonId
// @access  Public
const getQuizzesByLesson = async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      lesson: req.params.lessonId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get quiz hierarchy for a specific grade
// @route   GET /api/quizzes/hierarchy
// @access  Public (or Private)
const getQuizHierarchy = async (req, res) => {
  try {
    const { gradeId } = req.query;

    if (!gradeId) {
      return res.status(400).json({ message: 'Grade ID is required' });
    }

    let targetGradeId = gradeId;

    // Handle legacy numeric grade strings (e.g., "10")
    if (!mongoose.Types.ObjectId.isValid(gradeId)) {
      const numericLevel = parseInt(gradeId, 10);
      if (!isNaN(numericLevel)) {
        const gradeDoc = await Grade.findOne({ level: numericLevel });
        if (gradeDoc) {
          targetGradeId = gradeDoc._id;
        } else {
          // If grade "10" not found, maybe fallback or return empty
          return res.json([]);
        }
      }
    }

    // 1. Get Subjects
    const subjects = await Subject.find({ grade: targetGradeId, isActive: true })
      .sort({ order: 1 })
      .lean();

    // 2. Get Modules for each Subject
    await Promise.all(subjects.map(async (subject) => {
      subject.modules = await Module.find({ subject: subject._id, isActive: true })
        .sort({ order: 1 })
        .lean();

      // 3. Get Lessons for each Module
      await Promise.all(subject.modules.map(async (module) => {
        module.lessons = await Lesson.find({ module: module._id, isActive: true })
          .sort({ order: 1 })
          .lean();

        // 4. Get Quizzes for each Lesson
        await Promise.all(module.lessons.map(async (lesson) => {
          lesson.quizzes = await Quiz.find({ lesson: lesson._id, isActive: true })
            .select('title description timeLimit points type questions') // Include minimal fields
            .lean();
        }));
      }));
    }));

    res.json(subjects);
  } catch (error) {
    console.error('Error fetching hierarchy:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Teacher/Admin)
const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('lesson');

    if (!quiz) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Teacher/Admin)
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Quiz not found' });
    }

    // Also delete all questions for this quiz
    await Question.deleteMany({ quiz: quiz._id });
    await quiz.deleteOne();

    res.json({ message: 'Quiz and related questions deleted' });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get user quiz statistics
// @route   GET /api/quizzes/stats
// @access  Private
const getQuizStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Count distinct quizzes passed by user
    const passedQuizzes = await Submission.distinct('quiz', {
      user: userId,
      isPassed: true,
      status: 'completed'
    });

    // Count distinct quizzes attempted by user
    const attemptedQuizzes = await Submission.distinct('quiz', {
      user: userId
    });

    res.json({
      totalPassed: passedQuizzes.length,
      totalAttempted: attemptedQuizzes.length
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  getQuizzesByLesson,
  getQuizHierarchy,
  updateQuiz,
  deleteQuiz,
  getQuizStats,
};