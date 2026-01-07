const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const UserProgress = require('./models/UserProgress');
const ModuleProgress = require('./models/ModuleProgress');
const LessonProgress = require('./models/LessonProgress');
const Lesson = require('./models/Lesson');

dotenv.config();

const debugProgress = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Use the user Darshan who we saw earlier
        const user = await User.findOne({ email: 'darshan@gmail.com' });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        console.log(`Checking progress for: ${user.name} (${user.email})`);

        const up = await UserProgress.findOne({ user: user._id });
        console.log('UserProgress stats:', JSON.stringify(up?.stats, null, 2));

        const lps = await LessonProgress.find({ user: user._id });
        console.log(`Lessons completed: ${lps.filter(lp => lp.status === 'completed').length}`);

        const mps = await ModuleProgress.find({ user: user._id }).populate('module');
        console.log(`ModuleProgress count: ${mps.length}`);
        mps.forEach(mp => {
            console.log(` - Module: ${mp.module.title}`);
            console.log(`   Status: ${mp.status}`);
            console.log(`   Completion: ${mp.completionPercentage}% (${mp.lessonsCompleted}/${mp.totalLessons})`);
        });

        const allLessons = await Lesson.find();
        console.log(`Total lessons in DB: ${allLessons.length}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugProgress();
