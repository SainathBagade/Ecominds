const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Lesson = require('../../models/Lesson');
const Module = require('../../models/Module');
const Subject = require('../../models/Subject');
const Grade = require('../../models/Grade');

dotenv.config();

const checkStats = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const grades = await Grade.find().sort({ level: 1 });
        console.log('Grade | Subjects | Modules | Lessons');
        console.log('--------------------------------------');
        for (const grade of grades) {
            const subjects = await Subject.find({ grade: grade._id });
            const subjectIds = subjects.map(s => s._id);
            const modules = await Module.find({ subject: { $in: subjectIds } });
            const moduleIds = modules.map(m => m._id);
            const lessons = await Lesson.find({ module: { $in: moduleIds } });
            console.log(`Grade ${grade.level.toString().padEnd(2)} | ${subjects.length.toString().padEnd(8)} | ${modules.length.toString().padEnd(7)} | ${lessons.length}`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkStats();
