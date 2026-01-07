const Subject = require('../models/Subject');
const Module = require('../models/Module');
const { HTTP_STATUS } = require('../config/constants');

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private (Admin/Teacher)
const createSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(HTTP_STATUS.CREATED).json(subject);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
const getAllSubjects = async (req, res) => {
  try {
    const { grade } = req.query;
    let query = { isActive: true };

    if (grade) {
      query.grade = grade;
    } else if (req.query.gradeLevel) {
      const Grade = require('../models/Grade');
      const gradeObj = await Grade.findOne({ level: req.query.gradeLevel });
      if (gradeObj) {
        query.grade = gradeObj._id;
      } else {
        return res.json([]);
      }
    }

    const subjects = await Subject.find(query)
      .populate('grade', 'name level')
      .sort({ order: 1 });

    // Add module count for each subject
    const subjectsWithModuleCount = await Promise.all(subjects.map(async (subject) => {
      const moduleCount = await Module.countDocuments({ subject: subject._id, isActive: true });
      return {
        ...subject.toObject(),
        moduleCount
      };
    }));

    res.json(subjectsWithModuleCount);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get subject by ID
// @route   GET /api/subjects/:id
// @access  Public
const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('grade', 'name level');

    if (!subject) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get subjects by grade
// @route   GET /api/subjects/grade/:gradeId
// @access  Public
const getSubjectsByGrade = async (req, res) => {
  try {
    const subjects = await Subject.find({
      grade: req.params.gradeId,
      isActive: true
    }).sort({ order: 1 });

    res.json(subjects);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin/Teacher)
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('grade');

    if (!subject) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin)
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Subject not found' });
    }

    await subject.deleteOne();
    res.json({ message: 'Subject removed' });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

module.exports = {
  createSubject,
  getAllSubjects,
  getSubjectById,
  getSubjectsByGrade,
  updateSubject,
  deleteSubject,
};