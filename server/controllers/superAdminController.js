const User = require('../models/User');
const School = require('../models/School');
const { HTTP_STATUS } = require('../config/constants');

// @desc    Get all schools
// @route   GET /api/superadmin/schools
// @access  Private (Super Admin)
const getSchools = async (req, res) => {
    try {
        const schools = await School.find().populate('adminId', 'name email');
        res.json(schools);
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

// @desc    Add a new school
// @route   POST /api/superadmin/schools
// @access  Private (Super Admin)
const addSchool = async (req, res) => {
    try {
        const { name, schoolID, address, contactEmail } = req.body;
        const school = await School.create({ name, schoolID, address, contactEmail });
        res.status(HTTP_STATUS.CREATED).json(school);
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

// @desc    Get all pending admin approvals
// @route   GET /api/superadmin/pending-admins
// @access  Private (Super Admin)
const getPendingAdmins = async (req, res) => {
    try {
        const pendingAdmins = await User.find({
            role: 'admin',
            isApproved: false
        }).select('-password');
        res.json(pendingAdmins);
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

// @desc    Approve an admin
// @route   PUT /api/superadmin/approve-admin/:id
// @access  Private (Super Admin)
const approveAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'admin') {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Admin not found' });
        }

        user.isApproved = true;
        await user.save();

        // Link school to admin if not already
        const school = await School.findOne({ schoolID: user.schoolID });
        if (school) {
            school.adminId = user._id;
            await school.save();
        }

        res.json({ message: 'Admin approved successfully', user });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

// @desc    Get platform-wide analytics
// @route   GET /api/superadmin/analytics
// @access  Private (Super Admin)
const getPlatformAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalSchools = await School.countDocuments();
        const roleStats = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        res.json({
            totalUsers,
            totalSchools,
            roleStats
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

// @desc    Create an admin account directly
// @route   POST /api/superadmin/create-admin
// @access  Private (Super Admin)
const createAdmin = async (req, res) => {
    try {
        const { name, email, password, schoolID } = req.body;

        // Check if school exists
        const school = await School.findOne({ schoolID });
        if (!school) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'School ID not found' });
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

        const admin = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            schoolID,
            isApproved: true
        });

        // Link school to this admin
        school.adminId = admin._id;
        await school.save();

        res.status(HTTP_STATUS.CREATED).json({
            message: 'Admin account created successfully',
            user: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                schoolID: admin.schoolID
            }
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

module.exports = {
    getSchools,
    addSchool,
    getPendingAdmins,
    approveAdmin,
    getPlatformAnalytics,
    createAdmin
};
