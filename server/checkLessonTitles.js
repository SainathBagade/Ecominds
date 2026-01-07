const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Lesson = require('./models/Lesson');
const Grade = require('./models/Grade');
const Subject = require('./models/Subject');
const Module = require('./models/Module');

dotenv.config();

const checkTitles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const g4 = await Grade.findOne({ level: 4 });
        const g12 = await Grade.findOne({ level: 12 });

        const getTitles = async (grade) => {
            const subjects = await Subject.find({ grade: grade._id });
            const modules = await Module.find({ subject: { $in: subjects.map(s => s._id) } });
            const lessons = await Lesson.find({ module: { $in: modules.map(m => m._id) } }).limit(5);
            return lessons.map(l => l.title);
        };

        console.log('Grade 4 Titles:', await getTitles(g4));
        console.log('Grade 12 Titles:', await getTitles(g12));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkTitles();
