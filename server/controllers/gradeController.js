const Grade = require('../models/Grade');
const { HTTP_STATUS } = require('../config/constants');

// @desc    Create new grade
// @route   POST /api/grades
// @access  Private (Admin)
const createGrade = async (req, res) => {
  try {
    const grade = await Grade.create(req.body);
    res.status(HTTP_STATUS.CREATED).json(grade);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get all grades
// @route   GET /api/grades
// @access  Public
const getAllGrades = async (req, res) => {
  try {
    const grades = await Grade.find({ isActive: true }).sort({ level: 1 });
    res.json(grades);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get grade by ID
// @route   GET /api/grades/:id
// @access  Public
const getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    
    if (!grade) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Grade not found' });
    }
    
    res.json(grade);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Update grade
// @route   PUT /api/grades/:id
// @access  Private (Admin)
const updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!grade) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Grade not found' });
    }

    res.json(grade);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Delete grade
// @route   DELETE /api/grades/:id
// @access  Private (Admin)
const deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Grade not found' });
    }

    await grade.deleteOne();
    res.json({ message: 'Grade removed' });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

module.exports = {
  createGrade,
  getAllGrades,
  getGradeById,
  updateGrade,
  deleteGrade,
};