const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/database');

dotenv.config();

const seedSuperAdmin = async () => {
    try {
        await connectDB();

        const email = 'superadmin@ecominds.com';
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('Super Admin already exists');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const superAdmin = await User.create({
            name: 'Global Commander',
            email: email,
            password: hashedPassword,
            role: 'superadmin',
            isApproved: true,
            schoolID: 'PLATFORM-ROOT',
        });

        console.log('✅ Super Admin created successfully');
        console.log('Email: superadmin@ecominds.com');
        console.log('Password: admin123');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedSuperAdmin();
