const Lesson = require('../models/Lesson');
const { HTTP_STATUS } = require('../config/constants');

// @desc    Create new lesson
// @route   POST /api/lessons
// @access  Private (Admin/Teacher)
const createLesson = async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);
    res.status(HTTP_STATUS.CREATED).json(lesson);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get all lessons
// @route   GET /api/lessons
// @access  Public
const getAllLessons = async (req, res) => {
  try {
    const { search, grade, subject } = req.query;
    let query = { isActive: true };

    if (subject) {
      // Find modules belonging to this subject
      const Module = require('../models/Module');
      const modules = await Module.find({ subject: subject });
      query.module = { $in: modules.map(m => m._id) };
    } else if (grade) {
      // Find subjects belonging to this grade, then their modules
      const Grade = require('../models/Grade');
      const Subject = require('../models/Subject');
      const Module = require('../models/Module');

      const gradeObj = await Grade.findOne({ level: grade });
      if (gradeObj) {
        const subjects = await Subject.find({ grade: gradeObj._id });
        const modules = await Module.find({ subject: { $in: subjects.map(s => s._id) } });
        query.module = { $in: modules.map(m => m._id) };
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    let lessons = await Lesson.find(query)
      .populate({
        path: 'module',
        populate: {
          path: 'subject',
          populate: { path: 'grade' }
        }
      })
      .sort({ order: 1 });

    // If user is authenticated, add completion status
    if (req.user) {
      const LessonProgress = require('../models/LessonProgress');
      const progresses = await LessonProgress.find({
        user: req.user._id,
        lesson: { $in: lessons.map(l => l._id) }
      });

      const progressMap = {};
      progresses.forEach(p => {
        progressMap[p.lesson.toString()] = p.status;
      });

      lessons = lessons.map(lesson => {
        const lessonObj = lesson.toObject();
        lessonObj.status = progressMap[lesson._id.toString()] || 'not_started';
        return lessonObj;
      });
    }

    res.json(lessons);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get lesson by ID
// @route   GET /api/lessons/:id
// @access  Public
const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate({
        path: 'module',
        populate: {
          path: 'subject',
          populate: { path: 'grade' }
        }
      });

    if (!lesson) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Lesson not found' });
    }

    const lessonObj = lesson.toObject();

    // If user is authenticated, check for completion
    if (req.user) {
      const LessonProgress = require('../models/LessonProgress');
      const progress = await LessonProgress.findOne({
        user: req.user._id,
        lesson: lesson._id
      });
      lessonObj.status = progress ? progress.status : 'not_started';
      lessonObj.completed = progress ? progress.status === 'completed' : false;
    }

    res.json(lessonObj);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get lessons by module
// @route   GET /api/lessons/module/:moduleId
// @access  Public
const getLessonsByModule = async (req, res) => {
  try {
    const lessons = await Lesson.find({
      module: req.params.moduleId,
      isActive: true
    }).sort({ order: 1 });

    res.json(lessons);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private (Admin/Teacher)
const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('module');

    if (!lesson) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Lesson not found' });
    }

    res.json(lesson);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private (Admin)
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Lesson not found' });
    }

    await lesson.deleteOne();
    res.json({ message: 'Lesson removed' });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Mark lesson as completed
// @route   POST /api/lessons/:id/complete
// @access  Private
const completeLesson = async (req, res) => {
  try {
    const userId = req.user._id;
    const lessonId = req.params.id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Lesson not found' });
    }

    const LessonProgress = require('../models/LessonProgress');
    const UserProgress = require('../models/UserProgress');

    // 1. Update/Create Lesson Progress
    let progress = await LessonProgress.findOne({ user: userId, lesson: lessonId });

    if (progress && progress.status === 'completed') {
      return res.json({ message: 'Lesson already completed', points: 0 });
    }

    if (!progress) {
      progress = await LessonProgress.create({
        user: userId,
        lesson: lessonId,
        module: lesson.module,
        status: 'completed',
        completedAt: new Date()
      });
    } else {
      progress.status = 'completed';
      progress.completedAt = new Date();
      await progress.save();
    }

    // 2. Award XP/Points
    let userProgress = await UserProgress.findOne({ user: userId });
    if (!userProgress) {
      userProgress = await UserProgress.create({ user: userId });
    }
    const points = lesson.completionPoints || 5;
    userProgress.lessonsCompleted += 1;
    await userProgress.addXP(points);

    // 3. Update Module Progress and Topics Completed
    const ModuleProgress = require('../models/ModuleProgress');
    let moduleProgress = await ModuleProgress.findOne({
      user: userId,
      module: lesson.module
    });

    if (!moduleProgress) {
      moduleProgress = await ModuleProgress.create({
        user: userId,
        module: lesson.module,
        totalLessons: 0
      });
    }

    const wasModuleCompleted = moduleProgress.status === 'completed';
    await moduleProgress.updateModuleProgress();

    // If module just became completed, increment topicsCompleted
    if (!wasModuleCompleted && moduleProgress.status === 'completed') {
      userProgress.stats.topicsCompleted += 1;
      await userProgress.save();
    }

    res.json({
      success: true,
      message: `Lesson completed! +${points} XP`,
      points,
      topicsCompleted: userProgress.stats.topicsCompleted
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

module.exports = {
  createLesson,
  getAllLessons,
  getLessonById,
  getLessonsByModule,
  updateLesson,
  deleteLesson,
  completeLesson,
};