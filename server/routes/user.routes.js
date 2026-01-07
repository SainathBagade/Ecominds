const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
} = require('../controllers/userController');

// IMPORTANT: Static routes MUST come before dynamic routes (:id)

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post('/login', loginUser);

// @route   POST /api/users/forgotpassword
// @desc    Forgot password
// @access  Public
router.post('/forgotpassword', forgotPassword);

// @route   PUT /api/users/resetpassword/:resetToken
// @desc    Reset password
// @access  Public
router.put('/resetpassword/:resetToken', resetPassword);

// @route   GET /api/users
// @desc    Get all users
// @access  Public (you may want to protect this)
router.get('/', getUsers);

// Dynamic routes with :id MUST come AFTER static routes
// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public (you may want to protect this)
router.get('/:id', getUserById);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (you may want to add auth middleware)
router.post('/:id', updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (you may want to add auth middleware)
router.delete('/:id', deleteUser);

module.exports = router;