const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../../models/User');
const UserBadge = require('../../models/UserBadge');
const connectDB = require('../../config/database');

dotenv.config();

const clearAllBadges = async () => {
    try {
        await connectDB();

        // Clear badges from all users
        await User.updateMany({}, { badges: [] });

        // Delete all earned badge records
        await UserBadge.deleteMany({});

        console.log('✅ All badges cleared for all users');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

clearAllBadges();
