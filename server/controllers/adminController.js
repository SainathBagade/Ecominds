const User = require('../models/User');
const { HTTP_STATUS } = require('../config/constants');

// @desc    Get all pending teachers/admins for the admin's school
// @route   GET /api/admin/pending-approvals
// @access  Private (Admin)
const getPendingApprovals = async (req, res) => {
    try {
        const admin = await User.findById(req.user._id);
        const pendingUsers = await User.find({
            schoolID: admin.schoolID,
            role: { $in: ['teacher'] }, // Admin approves teachers
            isApproved: false
        }).select('-password');

        res.json(pendingUsers);
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

// @desc    Approve a user
// @route   PUT /api/admin/approve/:id
// @access  Private (Admin)
const approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found' });
        }

        user.isApproved = true;
        await user.save();

        res.json({ message: 'User approved successfully', user });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

// @desc    Get stats for admin dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
    try {
        const admin = await User.findById(req.user._id);
        const schoolID = admin.schoolID;

        const totalStudents = await User.countDocuments({ schoolID, role: 'student' });
        const totalTeachers = await User.countDocuments({ schoolID, role: 'teacher' });
        const pendingTeachers = await User.countDocuments({ schoolID, role: 'teacher', isApproved: false });

        // Mock analytics for now
        const analytics = {
            activeStudentsLast7Days: Math.floor(totalStudents * 0.8),
            courseCompletionRate: '75%',
            averageQuizScore: '82%',
        };

        res.json({
            totalStudents,
            totalTeachers,
            pendingTeachers,
            analytics
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

// @desc    Create a teacher account directly
// @route   POST /api/admin/create-teacher
// @access  Private (Admin)
const createTeacher = async (req, res) => {
    try {
        const { name, email, password, subject } = req.body;
        const admin = await User.findById(req.user._id);
        const schoolID = admin.schoolID;

        // Validation for subject
        if (!subject) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Please provide a subject for the teacher' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'User already exists with this email' });
        }

        // Hash password
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const teacher = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'teacher',
            subject,
            schoolID,
            isApproved: true // Auto-approved by admin
        });

        res.status(HTTP_STATUS.CREATED).json({
            message: 'Teacher account created successfully',
            user: {
                _id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                role: teacher.role
            }
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

module.exports = {
    getPendingApprovals,
    approveUser,
    getAdminStats,
    createTeacher
};
