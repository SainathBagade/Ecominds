const Module = require('../models/Module');
const { HTTP_STATUS } = require('../config/constants');

// @desc    Create new module
// @route   POST /api/modules
// @access  Private (Admin/Teacher)
const createModule = async (req, res) => {
  try {
    const module = await Module.create(req.body);
    res.status(HTTP_STATUS.CREATED).json(module);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get all modules
// @route   GET /api/modules
// @access  Public
const getAllModules = async (req, res) => {
  try {
    const modules = await Module.find({ isActive: true })
      .populate({
        path: 'subject',
        populate: { path: 'grade' }
      })
      .sort({ order: 1 });
    res.json(modules);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get module by ID
// @route   GET /api/modules/:id
// @access  Public
const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate({
        path: 'subject',
        populate: { path: 'grade' }
      });
    
    if (!module) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Module not found' });
    }
    
    res.json(module);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get modules by subject
// @route   GET /api/modules/subject/:subjectId
// @access  Public
const getModulesBySubject = async (req, res) => {
  try {
    const modules = await Module.find({ 
      subject: req.params.subjectId, 
      isActive: true 
    }).sort({ order: 1 });
    
    res.json(modules);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Update module
// @route   PUT /api/modules/:id
// @access  Private (Admin/Teacher)
const updateModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('subject');

    if (!module) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Module not found' });
    }

    res.json(module);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Delete module
// @route   DELETE /api/modules/:id
// @access  Private (Admin)
const deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Module not found' });
    }

    await module.deleteOne();
    res.json({ message: 'Module removed' });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

module.exports = {
  createModule,
  getAllModules,
  getModuleById,
  getModulesBySubject,
  updateModule,
  deleteModule,
};