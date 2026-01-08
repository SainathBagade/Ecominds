const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Grade = require('../../models/Grade');
const Subject = require('../../models/Subject');
const Lesson = require('../../models/Lesson');
const Module = require('../../models/Module');
const Quiz = require('../../models/Quiz');
const Question = require('../../models/Question');

dotenv.config();

const reseedGrades = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Connected to DB...');

        console.log('🗑️ Clearing existing educational data...');
        // Clear existing educational data
        await Grade.deleteMany({});
        await Subject.deleteMany({});
        await Lesson.deleteMany({});
        await Module.deleteMany({});
        await Quiz.deleteMany({});
        await Question.deleteMany({});

        const startGrade = 4;
        const endGrade = 12;

        const subjectsList = [
            { name: 'Eco-System Science', icon: '🌿', color: '#10B981' },
            { name: 'Climate Action', icon: '🌡️', color: '#EF4444' },
            { name: 'Waste Management', icon: '♻️', color: '#3B82F6' }
        ];

        // Content Templates based on Grade Level Group
        const getContentForGrade = (grade, subject, moduleIndex, lessonIndex) => {
            // Simple difficulty differentiation logic
            const difficulty = grade <= 6 ? 'Basic' : (grade <= 9 ? 'Intermediate' : 'Advanced');

            const titles = {
                'Eco-System Science': [
                    'Understanding Local Habitats',
                    'Biodiversity Fundamentals',
                    'Water Systems & Conservation',
                    'Forest & Flora Analysis'
                ],
                'Climate Action': [
                    'Introduction to Carbon Footprint',
                    'Greenhouse Effect Explained',
                    'Renewable Energy Sources',
                    'Global Warming Impacts'
                ],
                'Waste Management': [
                    'The 3 Rs: Reduce, Reuse, Recycle',
                    'Composting Basics',
                    'Plastic Pollution Control',
                    'Circular Economy Concepts'
                ]
            };

            const baseTitle = titles[subject][moduleIndex - 1] || `${subject} Concepts`;

            return {
                moduleTitle: `${baseTitle} (${difficulty})`,
                lessonTitle: `${difficulty} Investigation: ${baseTitle} - Part ${lessonIndex}`,
                quizTitle: `${baseTitle} Assessment`,
                quizQuestion: `What is a key component of ${baseTitle} in the context of ${difficulty} environmental studies?`
            };
        };

        // Helper to create quizzes
        const createQuizForLesson = async (lesson, module, contentInfo) => {
            const quiz = await Quiz.create({
                title: contentInfo.quizTitle,
                description: `Test your understanding of ${contentInfo.moduleTitle}`,
                lesson: lesson._id,
                timeLimit: 15,
                passingScore: 80,
                points: 100,
                isActive: true
            });

            // Create 5 questions tailored to the subject
            const questions = [];
            for (let i = 1; i <= 5; i++) {
                questions.push({
                    quiz: quiz._id,
                    text: `${contentInfo.quizQuestion} (Question ${i})`,
                    options: [
                        { text: 'The sustainable and eco-friendly option', isCorrect: true },
                        { text: 'The harmful industrial option', isCorrect: false },
                        { text: 'Ignoring the problem entirely', isCorrect: false },
                        { text: 'Short-term gain with long-term damage', isCorrect: false }
                    ],
                    correctAnswer: 'The sustainable and eco-friendly option',
                    points: 20,
                    type: 'multiple-choice',
                    order: i
                });
            }
            await Question.insertMany(questions);
        };

        for (let i = startGrade; i <= endGrade; i++) {
            const grade = await Grade.create({
                level: i,
                name: `Grade ${i}`,
                description: `Standard ${i} Environmental Curriculum`
            });
            console.log(`Created ${grade.name}`);

            for (const subjectData of subjectsList) {
                const subject = await Subject.create({
                    name: subjectData.name,
                    grade: grade._id,
                    description: `${subjectData.name} specific for ${grade.name}`,
                    icon: subjectData.icon,
                    color: subjectData.color
                });

                // Create 4 Modules
                for (let m = 1; m <= 4; m++) {
                    const contentInfo = getContentForGrade(i, subjectData.name, m, 1);

                    const module = await Module.create({
                        title: contentInfo.moduleTitle,
                        description: `Module ${m} of ${subjectData.name} curriculum`,
                        subject: subject._id,
                        order: m,
                        difficulty: m === 1 ? 'beginner' : (m === 4 ? 'advanced' : 'intermediate')
                    });

                    // Create 4 Lessons (Videos)
                    for (let l = 1; l <= 4; l++) {
                        const lessonContent = getContentForGrade(i, subjectData.name, m, l);
                        const lesson = await Lesson.create({
                            title: lessonContent.lessonTitle,
                            description: `In-depth video lesson on ${lessonContent.lessonTitle}`,
                            content: `Learning material for ${lessonContent.lessonTitle}...`,
                            module: module._id,
                            order: l,
                            type: 'video',
                            video: {
                                url: 'https://vimeo.com/channels/staffpicks/1036323145', // Placeholder
                                duration: 600
                            },
                            points: 50
                        });

                        // Create Quiz for this lesson
                        await createQuizForLesson(lesson, module, lessonContent);
                    }
                }
            }
        }

        console.log('✅ Environmental EcoMinds Data Seeded Successfully (Grades 4-12)!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

reseedGrades();
