const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

dotenv.config();

const createUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Database');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // 1. Create Teacher
        const teacherEmail = 'teacher@test.com';
        const existingTeacher = await User.findOne({ email: teacherEmail });
        if (!existingTeacher) {
            await User.create({
                name: 'Test Teacher',
                email: teacherEmail,
                password: hashedPassword,
                role: 'teacher',
                isApproved: true,
                schoolID: 'SCH-TEST-001'
            });
            console.log('✅ Teacher created: teacher@test.com / admin123');
        } else {
            existingTeacher.isApproved = true;
            await existingTeacher.save();
            console.log('✅ Teacher already exists and approved');
        }

        // 2. Create Admin
        const adminEmail = 'admin@test.com';
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            await User.create({
                name: 'School Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                isApproved: true,
                schoolID: 'SCH-TEST-001'
            });
            console.log('✅ Admin created: admin@test.com / admin123');
        } else {
            existingAdmin.isApproved = true;
            await existingAdmin.save();
            console.log('✅ Admin already exists and approved');
        }

        // 3. Ensure SuperAdmin exists
        const superEmail = 'superadmin@ecominds.com';
        const exists = await User.findOne({ email: superEmail });
        if (!exists) {
            await User.create({
                name: 'Global Commander',
                email: superEmail,
                password: hashedPassword,
                role: 'superadmin',
                isApproved: true,
                schoolID: 'PLATFORM-ROOT'
            });
            console.log('✅ Super Admin created: superadmin@ecominds.com / admin123');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createUsers();
