const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load Models
const User = require('../../models/User');
const Grade = require('../../models/Grade');
const Subject = require('../../models/Subject');
const Module = require('../../models/Module');
const Lesson = require('../../models/Lesson');
const Game = require('../../models/Game');
const Challenge = require('../../models/Challenge');
const Competition = require('../../models/Competition');
const DailyMission = require('../../models/DailyMission');
const Notification = require('../../models/Notification');

const importData = async () => {
    try {
        console.log('🔌 Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ Connected to ${mongoose.connection.host}`.cyan.underline);

        console.log('🗑️  Clearing Database...'.red);
        await Grade.deleteMany();
        await Subject.deleteMany();
        await Module.deleteMany();
        await Lesson.deleteMany();
        await Game.deleteMany();
        await Challenge.deleteMany();
        await Competition.deleteMany();
        await DailyMission.deleteMany();
        await Notification.deleteMany();
        // Keeping users to avoid deleting current session

        console.log('🌱 Seeding...'.green);

        // 1. Create Grades (4-12 only)
        console.log('Creating Grades...');
        const grades = [];
        for (let i = 4; i <= 12; i++) {
            grades.push({
                name: `Grade ${i}`,
                level: i,
                description: `Curriculum for Grade ${i}`
            });
        }
        const createdGrades = await Grade.insertMany(grades);
        const grade10 = createdGrades.find(g => g.level === 10);

        // 2. Create Subjects (for Grade 10)
        console.log('Creating Subjects...');
        const subjects = await Subject.insertMany([
            { name: 'Environmental Science', grade: grade10._id, icon: 'Leaf', color: '#4CAF50' },
            { name: 'Climate Physics', grade: grade10._id, icon: 'Sun', color: '#FF9800' },
            { name: 'Sustainable Chemistry', grade: grade10._id, icon: 'Flask', color: '#2196F3' }
        ]);
        const envScience = subjects[0];

        // 3. Create Modules
        console.log('Creating Modules...');
        const modules = await Module.insertMany([
            { title: 'Ecosystems 101', subject: envScience._id, description: 'Basics of ecosystems', difficulty: 'beginner' },
            { title: 'Waste Management', subject: envScience._id, description: 'Reduce, Reuse, Recycle', difficulty: 'intermediate' },
            { title: 'Renewable Energy', subject: envScience._id, description: 'Solar and Wind power', difficulty: 'advanced' }
        ]);
        const modEcosystem = modules[0];

        // 4. Create Lessons
        console.log('Creating Lessons...');
        const lessons = await Lesson.insertMany([
            {
                title: 'What is an Ecosystem?',
                module: modEcosystem._id,
                content: 'An ecosystem is a community of living organisms in conjunction with the nonliving components of their environment.',
                type: 'text',
                duration: 5,
                isActive: true,
                order: 1
            },
            {
                title: 'Food Chains',
                module: modEcosystem._id,
                content: '# Food Chains\n\nEnergy flows from...',
                type: 'video',
                video: { url: 'https://example.com/video.mp4', duration: 300 },
                duration: 10,
                isActive: true,
                order: 2
            },
            {
                title: 'Biodiversity',
                module: modEcosystem._id,
                content: 'Interactive content about biodiversity.',
                type: 'interactive',
                duration: 15,
                isActive: true,
                order: 3
            }
        ]);

        // 5. Create Dummy Users for Leaderboard (only if needed)
        console.log('Creating Dummy Users...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Only create if we have few users
        const userCount = await User.countDocuments();
        if (userCount < 5) {
            const dummyUsers = [];
            const availableGrades = ['4', '5', '6', '7', '8', '9', '10', '11', '12'];
            for (let i = 1; i <= 10; i++) {
                const email = `student${i}@test.com`;
                const exists = await User.findOne({ email });
                if (!exists) {
                    const randomGrade = availableGrades[Math.floor(Math.random() * availableGrades.length)];
                    dummyUsers.push({
                        name: `Student ${i}`,
                        email,
                        password: hashedPassword,
                        role: 'student',
                        schoolID: `SCH-TEST-${i}`,
                        grade: randomGrade,
                        points: Math.floor(Math.random() * 5000) + 100,
                        streak: Math.floor(Math.random() * 50)
                    });
                }
            }
            if (dummyUsers.length > 0) {
                await User.insertMany(dummyUsers);
            }
        }

        // Fetch a user to assign data to
        const targetUser = await User.findOne();
        const allUsers = await User.find().limit(5);

        // 6. Create Games
        console.log('Creating Games...');
        await Game.create([
            {
                title: 'Eco Quiz Challenge',
                description: 'Test your knowledge about recycling!',
                type: 'quiz',
                category: 'vocabulary', // as per schema
                difficulty: 'beginner',
                module: modEcosystem._id,
                gameData: {
                    questions: [
                        { question: 'What color bin is for paper?', options: ['Blue', 'Green', 'Red'], correctAnswer: 'Blue' },
                        { question: 'Plastic takes how many years to decompose?', options: ['10', '100', '450+'], correctAnswer: '450+' }
                    ]
                },
                isActive: true
            },
            {
                title: 'Carbon Footprint Puzzle',
                description: 'Match the activities to their carbon impact.',
                type: 'match',
                category: 'reading',
                difficulty: 'intermediate',
                module: modEcosystem._id,
                gameData: {
                    pairs: [{ item: 'Car', match: 'High Carbon' }, { item: 'Bike', match: 'Zero Carbon' }]
                },
                isActive: true
            }
        ]);

        // 7. Create Challenges (Fixed Schema)
        console.log('Creating Challenges...');
        await Challenge.create([
            {
                title: 'Zero Waste Week',
                description: 'Produce zero trash for a whole week.',
                type: 'weekly',
                difficulty: 'hard',
                category: 'consistency', // Added
                requirements: { type: 'streak', target: 7 }, // Added
                rewards: { xp: 500, coins: 100 }, // Fixed
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                isActive: true
            },
            {
                title: 'Plant a Tree',
                description: 'Plant a tree and upload a photo.',
                type: 'special',
                difficulty: 'medium',
                category: 'social', // Added
                requirements: { type: 'help_others', target: 1 }, // Added
                rewards: { xp: 200, coins: 50 }, // Fixed
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true
            }
        ]);

        // 8. Create Competitions (Fixed Schema)
        console.log('Creating Competitions...');
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;
        const participants = allUsers.map(u => ({ user: u._id }));

        // Helper for Competition Dates
        const comp1Start = new Date(now - 5 * day);
        const comp1End = new Date(now + 5 * day);

        await Competition.create([
            {
                title: 'Summer Eco-Marathon',
                description: 'Ongoing competition to verify green habits.',
                type: 'tournament',
                format: 'points_based', // Added
                criteria: { type: 'highest_score', minScore: 10 }, // Added
                registrationStart: new Date(now - 10 * day), // Added
                registrationEnd: new Date(now - 6 * day), // Added
                startDate: comp1Start,
                endDate: comp1End,
                status: 'in_progress', // Fixed enum match
                participants: participants,
                prizes: { first: { xp: 1000, title: 'Eco Champion' } } // Fixed structure
            },
            {
                title: 'Winter Clean-Up',
                description: 'Upcoming community event.',
                type: 'race',
                format: 'single_elimination', // Added
                criteria: { type: 'fastest_time' }, // Added
                registrationStart: new Date(now + 1 * day), // Added
                registrationEnd: new Date(now + 5 * day), // Added
                startDate: new Date(now + 10 * day),
                endDate: new Date(now + 20 * day),
                status: 'registration', // Fixed enum match (was 'upcoming' which is not in Schema default enums in some versions, checking schema: 'registration', 'in_progress', 'completed', 'cancelled')
                // Schema says: enum: ['registration', 'in_progress', 'completed', 'cancelled']
                // So 'upcoming' is NOT valid. 'registration' is the state before start.
                participants: []
            },
            {
                title: 'Spring Planting Drive',
                description: 'Past event.',
                type: 'league',
                format: 'points_based', // Added
                criteria: { type: 'most_xp' }, // Added
                registrationStart: new Date(now - 30 * day), // Added
                registrationEnd: new Date(now - 25 * day), // Added
                startDate: new Date(now - 20 * day),
                endDate: new Date(now - 10 * day),
                status: 'completed',
                participants: participants
            }
        ]);

        // 9. Create Daily Missions (Fixed Schema)
        console.log('Creating Missions...');
        if (targetUser) {
            // DailyMission is user-specific
            const midnight = new Date();
            midnight.setHours(23, 59, 59, 999);

            await DailyMission.create([
                {
                    user: targetUser._id,
                    type: 'complete_lessons',
                    target: 1,
                    reward: { xp: 50, coins: 10 },
                    expiresAt: midnight
                },
                {
                    user: targetUser._id,
                    type: 'earn_xp',
                    target: 100,
                    reward: { xp: 100, coins: 20 },
                    expiresAt: midnight
                }
            ]);
        }

        // 10. Create Notifications
        if (targetUser) {
            console.log('Creating Notifications...');
            await Notification.create([
                {
                    user: targetUser._id,
                    type: 'system',
                    title: 'Welcome to EcoMinds!',
                    message: 'Thanks for joining. Start your first lesson now!',
                    isRead: false,
                    category: 'system'
                },
                {
                    user: targetUser._id,
                    type: 'mission_complete',
                    title: 'Mission Update',
                    message: 'New daily missions are available.',
                    isRead: false,
                    category: 'progress'
                }
            ]);
        }

        console.log('✅ Data Imported Successfully!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`.red.inverse);
        console.error(error); // Print stack trace
        process.exit(1);
    }
};

importData();
