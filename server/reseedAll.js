const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Challenge = require('./models/Challenge');
const DailyMission = require('./models/DailyMission');
const Question = require('./models/Question');
const Quiz = require('./models/Quiz');
const User = require('./models/User');

dotenv.config();

const reseedAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Connected to DB...');

        // 1. Update Quiz Passing Scores
        const updateResult = await Quiz.updateMany({}, { passingScore: 60 });
        console.log(`✅ Updated ${updateResult.modifiedCount} quizzes to 60% passing score.`);

        // 2. Seed Challenges
        const challenges = [
            {
                title: "Zero Waste Hero",
                description: "Avoid using single-use plastics for an entire day. Carry your own cloth bag and water bottle.",
                type: 'daily',
                difficulty: 'easy',
                category: 'consistency',
                requirements: { type: 'complete_lessons', target: 1 },
                rewards: { xp: 50, coins: 10 },
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                featured: true
            },
            {
                title: "Energy Saver",
                description: "Turn off lights and electronics when not in use for 24 hours.",
                type: 'daily',
                difficulty: 'easy',
                category: 'consistency',
                requirements: { type: 'complete_lessons', target: 1 },
                rewards: { xp: 40, coins: 5 },
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                featured: true
            },
            {
                title: "Water Warrior",
                description: "Reduce your shower time to under 5 minutes for a week.",
                type: 'weekly',
                difficulty: 'medium',
                category: 'mastery',
                requirements: { type: 'complete_lessons', target: 7 },
                rewards: { xp: 150, coins: 30 },
                startDate: new Date(),
                endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                featured: true
            },
            {
                title: "Recycling Expert",
                description: "Properly sort your household waste for recyclables for 3 days in a row.",
                type: 'weekly',
                difficulty: 'medium',
                category: 'mastery',
                requirements: { type: 'complete_lessons', target: 3 },
                rewards: { xp: 120, coins: 25 },
                startDate: new Date(),
                endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                featured: false
            },
            {
                title: "Community Cleanup",
                description: "Participate in or organize a local cleanup drive.",
                type: 'community',
                difficulty: 'hard',
                category: 'social',
                requirements: { type: 'help_others', target: 1 },
                rewards: { xp: 500, coins: 100 },
                startDate: new Date(),
                endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                featured: true
            }
        ];

        for (const c of challenges) {
            await Challenge.findOneAndUpdate(
                { title: c.title },
                c,
                { upsert: true, new: true }
            );
        }
        console.log('✅ Challenges Seeded/Updated.');

        // 3. Seed Missions for ALL Users
        const users = await User.find({});
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 999);

        const missionTemplates = [
            {
                type: 'complete_lessons',
                title: 'Daily Learner',
                description: 'Complete 1 lesson today.',
                target: 1,
                reward: { xp: 50, coins: 10 },
                requiresProof: false
            },
            {
                type: 'perfect_score',
                title: 'Ace the Quiz',
                description: 'Get 100% on a quiz.',
                target: 1,
                reward: { xp: 100, coins: 20 },
                requiresProof: false
            },
            {
                type: 'complete_lessons',
                title: 'Eco Friendly Snacking',
                description: 'Eat a fruit instead of packaged snack. Upload photo.',
                target: 1,
                reward: { xp: 30, coins: 5 },
                requiresProof: true
            }
        ];

        for (const user of users) {
            // Delete old daily missions
            await DailyMission.deleteMany({ user: user._id, type: { $in: missionTemplates.map(m => m.type) } });

            for (const tmpl of missionTemplates) {
                await DailyMission.create({
                    ...tmpl,
                    user: user._id,
                    expiresAt: midnight
                });
            }
        }
        console.log(`✅ Missions seeded for ${users.length} users.`);


        // 4. Seed Extra Questions for Randomization
        const quizzes = await Quiz.find({ isActive: true });

        for (const quiz of quizzes) {
            const existingCount = await Question.countDocuments({ quiz: quiz._id });
            if (existingCount < 10) {
                console.log(`Adding questions to quiz: ${quiz.title}`);
                const questionsToAdd = [];
                for (let i = 1; i <= 10; i++) {
                    questionsToAdd.push({
                        quiz: quiz._id,
                        text: `Randomized Question ${i} for ${quiz.title}: What acts as a carbon sink?`,
                        type: 'multiple-choice',
                        options: [
                            { text: 'Forests', isCorrect: true },
                            { text: 'Cars', isCorrect: false },
                            { text: 'Factories', isCorrect: false },
                            { text: 'Plastic', isCorrect: false }
                        ],
                        correctAnswer: 'Forests',
                        points: 10,
                        order: existingCount + i,
                        difficulty: 'medium'
                    });
                    questionsToAdd.push({
                        quiz: quiz._id,
                        text: `Randomized Question ${i + 10} for ${quiz.title}: Which is a renewable energy source?`,
                        type: 'multiple-choice',
                        options: [
                            { text: 'Solar', isCorrect: true },
                            { text: 'Coal', isCorrect: false },
                            { text: 'Gas', isCorrect: false },
                            { text: 'Oil', isCorrect: false }
                        ],
                        correctAnswer: 'Solar',
                        points: 10,
                        order: existingCount + i + 1,
                        difficulty: 'easy'
                    });
                }
                await Question.insertMany(questionsToAdd);
            }
        }

        console.log('✅ Extra Questions Seeded.');

        // 5. Seed Competitions
        const Competition = require('./models/Competition');
        const competitions = [
            {
                title: "Green Innovation Challenge",
                description: "Propose and implement a small-scale environmental solution in your school or home.",
                type: 'tournament',
                format: 'points_based',
                registrationStart: new Date(),
                registrationEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                status: 'registration',
                criteria: { type: 'highest_score' },
                prizes: {
                    first: { xp: 500, coins: 100, title: 'Grand Innovator' },
                    second: { xp: 300, coins: 50 },
                    third: { xp: 200, coins: 30 },
                    participation: { xp: 50, coins: 10 }
                },
                rules: { maxParticipants: 50, minParticipants: 2 },
                featured: true
            },
            {
                title: "Eco-Quiz Championship",
                description: "Test your knowledge of climate change and sustainability in this fast-paced quiz battle.",
                type: 'battle',
                format: 'points_based',
                registrationStart: new Date(),
                registrationEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                startDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                status: 'registration',
                criteria: { type: 'accuracy' },
                prizes: {
                    first: { xp: 300, coins: 60, title: 'Quiz Master' },
                    second: { xp: 150, coins: 30 },
                    third: { xp: 100, coins: 20 },
                    participation: { xp: 20, coins: 5 }
                },
                rules: { maxParticipants: 100, minParticipants: 5 },
                featured: true
            }
        ];

        for (const comp of competitions) {
            await Competition.findOneAndUpdate(
                { title: comp.title },
                comp,
                { upsert: true, new: true }
            );
        }
        console.log('✅ Competitions Seeded.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error in reseedAll:', error);
        process.exit(1);
    }
};

reseedAll();
