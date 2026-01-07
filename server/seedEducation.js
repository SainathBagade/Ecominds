const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Grade = require('./models/Grade');
const Subject = require('./models/Subject');
const Lesson = require('./models/Lesson');
const Module = require('./models/Module');

dotenv.config();

const seedEducationalData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Connected to DB...');

        // Clear existing educational data
        await Grade.deleteMany({});
        await Subject.deleteMany({});
        await Lesson.deleteMany({});
        await Module.deleteMany({});

        const gradesData = [
            { level: 1, name: 'Grade 1', description: 'Elementary Level 1' },
            { level: 2, name: 'Grade 2', description: 'Elementary Level 2' },
            { level: 3, name: 'Grade 3', description: 'Elementary Level 3' },
            { level: 4, name: 'Grade 4', description: 'Elementary Level 4' },
            { level: 5, name: 'Grade 5', description: 'Elementary Level 5' }
        ];

        const subjectsData = [
            { name: 'Environment', icon: '🌱', color: '#4CAF50' },
            { name: 'Sustainability', icon: '♻️', color: '#2196F3' },
            { name: 'Ecosystems', icon: '🦁', color: '#FF9800' }
        ];

        for (const g of gradesData) {
            const grade = await Grade.create(g);
            console.log(`Created ${grade.name}`);

            for (const s of subjectsData) {
                const subject = await Subject.create({
                    ...s,
                    grade: grade._id,
                    description: `${s.name} for ${grade.name}`
                });

                // Create a default module for each subject
                const module = await Module.create({
                    title: `Introduction to ${s.name}`,
                    description: `Basics of ${s.name} for ${grade.name}`,
                    subject: subject._id,
                    order: 1
                });

                // Create some lessons for each subject/grade
                await Lesson.create([
                    {
                        title: `${s.name} Basics`,
                        description: `An introduction to ${s.name} concepts for ${grade.name}.`,
                        content: `Welcome to ${s.name}! Today we will learn about...`,
                        module: module._id,
                        order: 1,
                        type: 'video',
                        videoUrl: 'https://vimeo.com/channels/staffpicks/1036323145',
                        duration: 10,
                        points: 50
                    },
                    {
                        title: `${s.name} in Action`,
                        description: `See how ${s.name} works in the real world.`,
                        content: `Look at these examples of ${s.name}...`,
                        module: module._id,
                        order: 2,
                        type: 'interactive',
                        duration: 15,
                        points: 75
                    }
                ]);
            }
        }

        console.log('✅ Educational Data Seeded Successfully!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedEducationalData();
