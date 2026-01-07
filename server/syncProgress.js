const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const UserProgress = require('./models/UserProgress');
const ModuleProgress = require('./models/ModuleProgress');
const LessonProgress = require('./models/LessonProgress');
const Lesson = require('./models/Lesson');

dotenv.config();

const syncProgress = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Connected to DB...');

        const user = await User.findOne({ email: 'darshan@gmail.com' });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        console.log(`Syncing progress for: ${user.name}`);

        const lessonProgresses = await LessonProgress.find({ user: user._id });
        console.log(`Found ${lessonProgresses.length} lesson progress entries.`);

        const moduleIds = [...new Set(lessonProgresses.map(lp => lp.module.toString()))];
        console.log(`Lessons span across ${moduleIds.length} modules.`);

        let newlyCompletedModules = 0;

        for (const moduleId of moduleIds) {
            let mp = await ModuleProgress.findOne({ user: user._id, module: moduleId });
            if (!mp) {
                console.log(`Creating missing ModuleProgress for module ID: ${moduleId}`);
                mp = await ModuleProgress.create({
                    user: user._id,
                    module: moduleId,
                    totalLessons: 0
                });
            }

            const wasCompleted = mp.status === 'completed';
            await mp.updateModuleProgress();

            if (!wasCompleted && mp.status === 'completed') {
                newlyCompletedModules++;
                console.log(`✅ Module marked as completed: ${moduleId}`);
            }
        }

        // Update UserProgress
        const up = await UserProgress.findOne({ user: user._id });
        if (up) {
            up.stats.topicsCompleted = await ModuleProgress.countDocuments({ user: user._id, status: 'completed' });
            await up.save();
            console.log(`UserProgress updated. Topics completed: ${up.stats.topicsCompleted}`);
        }

        console.log('✨ Sync completed!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

syncProgress();
