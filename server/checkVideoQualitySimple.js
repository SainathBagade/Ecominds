const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Lesson = require('./models/Lesson');
const Grade = require('./models/Grade');
const Subject = require('./models/Subject');
const Module = require('./models/Module');

dotenv.config();

const checkVideos = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const grades = await Grade.find().sort({ level: 1 });

        for (const grade of grades) {
            const subjects = await Subject.find({ grade: grade._id });
            const subjectIds = subjects.map(s => s._id);
            const modules = await Module.find({ subject: { $in: subjectIds } });
            const moduleIds = modules.map(m => m._id);
            const lessons = await Lesson.find({ module: { $in: moduleIds } });

            const videoLessons = lessons.filter(l => l.type === 'video');
            const workingVideos = videoLessons.filter(l =>
                l.video &&
                l.video.url &&
                !l.video.url.includes('example.com')
            );

            console.log(`Grade ${grade.level}: Total=${lessons.length}, Videos=${videoLessons.length}, Working=${workingVideos.length}`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkVideos();
