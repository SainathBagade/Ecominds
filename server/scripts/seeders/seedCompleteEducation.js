const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Grade = require('../../models/Grade');
const Subject = require('../../models/Subject');
const Lesson = require('../../models/Lesson');
const Module = require('../../models/Module');
const Game = require('../../models/Game');
const Challenge = require('../../models/Challenge');
const Competition = require('../../models/Competition');
const DailyMission = require('../../models/DailyMission');

dotenv.config();

const seedCompleteEducation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Connected to DB...');

        // Clear existing educational data
        await Grade.deleteMany({});
        await Subject.deleteMany({});
        await Lesson.deleteMany({});
        await Module.deleteMany({});
        await Game.deleteMany({});
        await Challenge.deleteMany({});
        await Competition.deleteMany({});

        console.log('🗑️  Cleared existing data...');

        // Create all 12 grades
        const gradesData = [];
        for (let i = 1; i <= 12; i++) {
            gradesData.push({
                level: i,
                name: `Grade ${i}`,
                description: `Environmental Education for Grade ${i}`
            });
        }
        const grades = await Grade.insertMany(gradesData);
        console.log(`✅ Created ${grades.length} grades`);

        // Define 3 subjects for each grade
        const subjectsData = [
            { name: 'Environmental Science', icon: '🌱', color: '#4CAF50' },
            { name: 'Climate & Sustainability', icon: '♻️', color: '#2196F3' },
            { name: 'Ecosystems & Biodiversity', icon: '🦁', color: '#FF9800' }
        ];

        let totalModules = 0;
        let totalLessons = 0;
        let totalGames = 0;

        // For each grade
        for (const grade of grades) {
            console.log(`\n📚 Processing ${grade.name}...`);

            // Create 3 subjects per grade
            for (let subIdx = 0; subIdx < subjectsData.length; subIdx++) {
                const subData = subjectsData[subIdx];
                const subject = await Subject.create({
                    ...subData,
                    grade: grade._id,
                    description: `${subData.name} for ${grade.name}`,
                    order: subIdx + 1
                });

                console.log(`  📖 Created subject: ${subject.name}`);

                // Create 4 modules per subject (12 modules per grade total)
                const moduleTitles = [
                    'Introduction & Fundamentals',
                    'Practical Applications',
                    'Advanced Concepts',
                    'Real-World Projects'
                ];

                for (let modIdx = 0; modIdx < 4; modIdx++) {
                    const module = await Module.create({
                        title: `${moduleTitles[modIdx]} - ${subData.name}`,
                        description: `Module ${modIdx + 1} covering ${moduleTitles[modIdx].toLowerCase()} in ${subData.name}`,
                        subject: subject._id,
                        order: modIdx + 1,
                        difficulty: modIdx === 0 ? 'beginner' : modIdx < 3 ? 'intermediate' : 'advanced',
                        duration: 30 + (modIdx * 15),
                        completionPoints: 50 + (modIdx * 25)
                    });

                    totalModules++;

                    // Create 3-5 lessons per module
                    const numLessons = 3 + Math.floor(Math.random() * 3);
                    for (let lesIdx = 0; lesIdx < numLessons; lesIdx++) {
                        await Lesson.create({
                            title: `Lesson ${lesIdx + 1}: ${moduleTitles[modIdx]} Part ${lesIdx + 1}`,
                            description: `Detailed lesson on ${moduleTitles[modIdx].toLowerCase()}`,
                            content: `This lesson covers important concepts in ${subData.name}. Students will learn about...`,
                            module: module._id,
                            order: lesIdx + 1,
                            type: lesIdx % 3 === 0 ? 'video' : lesIdx % 3 === 1 ? 'interactive' : 'text',
                            videoUrl: lesIdx % 3 === 0 ? 'https://vimeo.com/channels/staffpicks/1036323145' : undefined,
                            duration: 10 + (lesIdx * 5),
                            points: 25 + (lesIdx * 10),
                            isActive: true
                        });
                        totalLessons++;
                    }

                    // Create 3 games per subject (one per module type)
                    if (modIdx < 3) {
                        const gameTypes = ['quiz', 'match', 'puzzle'];
                        const gameCategories = ['vocabulary', 'reading', 'writing'];

                        await Game.create({
                            title: `${subData.name} ${gameTypes[modIdx]} Challenge`,
                            description: `Test your knowledge of ${subData.name} through this ${gameTypes[modIdx]} game!`,
                            type: gameTypes[modIdx],
                            category: gameCategories[modIdx],
                            difficulty: modIdx === 0 ? 'beginner' : modIdx === 1 ? 'intermediate' : 'advanced',
                            module: module._id,
                            gameData: {
                                questions: [
                                    {
                                        question: `What is a key concept in ${subData.name}?`,
                                        options: ['Option A', 'Option B', 'Option C'],
                                        correctAnswer: 'Option A'
                                    }
                                ]
                            },
                            points: 100 + (modIdx * 50),
                            timeLimit: 300,
                            isActive: true
                        });
                        totalGames++;
                    }
                }
            }
        }

        console.log(`\n✅ Created ${totalModules} modules (12 per grade)`);
        console.log(`✅ Created ${totalLessons} lessons`);
        console.log(`✅ Created ${totalGames} games (3 per subject)`);

        // Create challenges with different difficulty levels
        console.log('\n🎯 Creating Challenges...');

        const challengesData = [
            // Easy Challenges
            {
                title: 'Eco Beginner - Reusable Bag Day',
                description: 'Use a reusable bag instead of plastic for one shopping trip. Upload a photo of you with your reusable bag.',
                type: 'daily',
                difficulty: 'easy',
                category: 'consistency',
                requirements: { type: 'complete_lessons', target: 1 },
                rewards: { xp: 50, coins: 10 },
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                isActive: true,
                featured: true
            },
            {
                title: 'Water Saver - Turn Off Tap',
                description: 'Turn off the tap while brushing teeth for a week. Submit a photo showing your commitment.',
                type: 'weekly',
                difficulty: 'easy',
                category: 'consistency',
                requirements: { type: 'streak', target: 7 },
                rewards: { xp: 75, coins: 15 },
                startDate: new Date(),
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                isActive: true,
                featured: true
            },
            {
                title: 'Light Switch Hero',
                description: 'Switch off lights when leaving a room for 3 days. Show us your energy-saving habit!',
                type: 'daily',
                difficulty: 'easy',
                category: 'consistency',
                requirements: { type: 'streak', target: 3 },
                rewards: { xp: 60, coins: 12 },
                startDate: new Date(),
                endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                isActive: true
            },

            // Medium Challenges
            {
                title: 'Zero Waste Warrior',
                description: 'Produce zero single-use plastic waste for 3 days. Document your plastic-free journey with photos.',
                type: 'weekly',
                difficulty: 'medium',
                category: 'mastery',
                requirements: { type: 'complete_lessons', target: 5 },
                rewards: { xp: 150, coins: 30 },
                startDate: new Date(),
                endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
                isActive: true,
                featured: true
            },
            {
                title: 'Community Cleanup Champion',
                description: 'Organize or participate in a local cleanup drive. Collect at least 20 pieces of litter and upload proof.',
                type: 'community',
                difficulty: 'medium',
                category: 'social',
                requirements: { type: 'help_others', target: 1 },
                rewards: { xp: 200, coins: 40 },
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true,
                featured: true
            },
            {
                title: 'Eco Transport Week',
                description: 'Use public transport, bicycle, or walk instead of private vehicles for 5 days. Share your green commute!',
                type: 'weekly',
                difficulty: 'medium',
                category: 'consistency',
                requirements: { type: 'streak', target: 5 },
                rewards: { xp: 180, coins: 35 },
                startDate: new Date(),
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                isActive: true
            },

            // Hard Challenges
            {
                title: 'Plant a Tree, Grow the Future',
                description: 'Plant a tree and nurture it for 2 weeks. Submit weekly photos showing its growth and your care.',
                type: 'special',
                difficulty: 'hard',
                category: 'mastery',
                requirements: { type: 'complete_lessons', target: 10 },
                rewards: { xp: 300, coins: 60 },
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true,
                featured: true
            },
            {
                title: 'Zero Waste Month Challenge',
                description: 'Live a completely zero-waste lifestyle for 30 days. Document your journey with daily photos and reflections.',
                type: 'special',
                difficulty: 'hard',
                category: 'consistency',
                requirements: { type: 'streak', target: 30 },
                rewards: { xp: 500, coins: 100 },
                startDate: new Date(),
                endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                isActive: true,
                featured: true
            },
            {
                title: 'Eco Ambassador Program',
                description: 'Teach 10 people about environmental conservation. Submit photos/videos of your awareness sessions.',
                type: 'community',
                difficulty: 'hard',
                category: 'social',
                requirements: { type: 'help_others', target: 10 },
                rewards: { xp: 400, coins: 80 },
                startDate: new Date(),
                endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                isActive: true,
                featured: true
            }
        ];

        const challenges = await Challenge.insertMany(challengesData);
        console.log(`✅ Created ${challenges.length} challenges (Easy: 3, Medium: 3, Hard: 3)`);

        // Create competitions (2-3 upcoming, 2-3 completed)
        console.log('\n🏆 Creating Competitions...');

        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;

        const competitionsData = [
            // Completed Competitions
            {
                title: 'Spring Green Challenge 2024',
                description: 'Completed competition where students competed to complete the most eco-friendly tasks.',
                type: 'tournament',
                mode: 'solo',
                format: 'points_based',
                criteria: { type: 'most_xp', minScore: 100 },
                rules: { minParticipants: 2, totalRounds: 1 },
                prizes: {
                    first: { xp: 1000, coins: 200, title: 'Spring Eco Champion' },
                    second: { xp: 500, coins: 100 },
                    third: { xp: 250, coins: 50 },
                    participation: { xp: 50, coins: 10 }
                },
                registrationStart: new Date(now - 60 * day),
                registrationEnd: new Date(now - 45 * day),
                startDate: new Date(now - 40 * day),
                endDate: new Date(now - 10 * day),
                status: 'completed',
                featured: false,
                participants: []
            },
            {
                title: 'Winter Waste Warriors',
                description: 'Past competition focused on waste reduction and recycling initiatives.',
                type: 'league',
                mode: 'team',
                format: 'points_based',
                criteria: { type: 'highest_score', minScore: 50 },
                rules: { minParticipants: 4, teamSize: 2, totalRounds: 3 },
                prizes: {
                    first: { xp: 800, coins: 150, title: 'Waste Reduction Master' },
                    second: { xp: 400, coins: 75 },
                    third: { xp: 200, coins: 40 }
                },
                registrationStart: new Date(now - 90 * day),
                registrationEnd: new Date(now - 75 * day),
                startDate: new Date(now - 70 * day),
                endDate: new Date(now - 30 * day),
                status: 'completed',
                featured: false,
                participants: []
            },
            {
                title: 'Autumn Sustainability Sprint',
                description: 'Completed race to complete sustainability lessons and challenges fastest.',
                type: 'race',
                mode: 'solo',
                format: 'single_elimination',
                criteria: { type: 'fastest_time' },
                rules: { minParticipants: 8, totalRounds: 3 },
                prizes: {
                    first: { xp: 600, coins: 120, title: 'Speed Eco Learner' },
                    second: { xp: 300, coins: 60 },
                    third: { xp: 150, coins: 30 }
                },
                registrationStart: new Date(now - 120 * day),
                registrationEnd: new Date(now - 105 * day),
                startDate: new Date(now - 100 * day),
                endDate: new Date(now - 60 * day),
                status: 'completed',
                featured: false,
                participants: []
            },

            // Upcoming Competitions
            {
                title: 'Summer Eco Olympics 2025',
                description: 'Upcoming mega competition! Compete in various environmental challenges to win amazing prizes.',
                type: 'tournament',
                mode: 'solo',
                format: 'points_based',
                criteria: { type: 'most_xp', minScore: 200 },
                rules: { maxParticipants: 100, minParticipants: 10, totalRounds: 5 },
                prizes: {
                    first: { xp: 2000, coins: 400, title: 'Eco Olympics Gold Medalist' },
                    second: { xp: 1000, coins: 200, title: 'Eco Olympics Silver Medalist' },
                    third: { xp: 500, coins: 100, title: 'Eco Olympics Bronze Medalist' },
                    participation: { xp: 100, coins: 20 }
                },
                registrationStart: new Date(now + 5 * day),
                registrationEnd: new Date(now + 20 * day),
                startDate: new Date(now + 25 * day),
                endDate: new Date(now + 55 * day),
                status: 'registration',
                featured: true,
                entryFee: { coins: 50 },
                participants: []
            },
            {
                title: 'Climate Action Battle Royale',
                description: 'Join this intense 1v1 battle competition. Face off against other eco-warriors!',
                type: 'battle',
                mode: '1v1',
                format: 'single_elimination',
                criteria: { type: 'highest_score', minScore: 75 },
                rules: { maxParticipants: 32, minParticipants: 8, totalRounds: 5 },
                prizes: {
                    first: { xp: 1500, coins: 300, title: 'Climate Battle Champion' },
                    second: { xp: 750, coins: 150 },
                    third: { xp: 375, coins: 75 }
                },
                registrationStart: new Date(now + 10 * day),
                registrationEnd: new Date(now + 25 * day),
                startDate: new Date(now + 30 * day),
                endDate: new Date(now + 45 * day),
                status: 'registration',
                featured: true,
                entryFee: { coins: 30 },
                participants: []
            },
            {
                title: 'Green Team League',
                description: 'Form teams and compete in this collaborative sustainability league!',
                type: 'league',
                mode: 'team',
                format: 'round_robin',
                criteria: { type: 'most_xp', minScore: 150 },
                rules: { maxParticipants: 40, minParticipants: 12, teamSize: 4, totalRounds: 6 },
                prizes: {
                    first: { xp: 1200, coins: 240, title: 'Green League Champions' },
                    second: { xp: 600, coins: 120 },
                    third: { xp: 300, coins: 60 },
                    participation: { xp: 75, coins: 15 }
                },
                registrationStart: new Date(now + 15 * day),
                registrationEnd: new Date(now + 30 * day),
                startDate: new Date(now + 35 * day),
                endDate: new Date(now + 70 * day),
                status: 'registration',
                featured: true,
                participants: []
            }
        ];

        const competitions = await Competition.insertMany(competitionsData);
        console.log(`✅ Created ${competitions.length} competitions (Completed: 3, Upcoming: 3)`);

        console.log('\n✅ Complete Educational Data Seeded Successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Grades: 12`);
        console.log(`   - Subjects: 36 (3 per grade)`);
        console.log(`   - Modules: ${totalModules} (4 per subject, 12 per grade)`);
        console.log(`   - Lessons: ${totalLessons}`);
        console.log(`   - Games: ${totalGames} (3 per subject)`);
        console.log(`   - Challenges: ${challenges.length} (Easy: 3, Medium: 3, Hard: 3)`);
        console.log(`   - Competitions: ${competitions.length} (Completed: 3, Upcoming: 3)`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

seedCompleteEducation();
