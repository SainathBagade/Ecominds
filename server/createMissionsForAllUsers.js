const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const DailyMission = require('./models/DailyMission');
const Challenge = require('./models/Challenge');

const createMissionsForAllUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Connected to DB...\n');

        // Get all users
        const users = await User.find();
        console.log(`Found ${users.length} users\n`);

        if (users.length === 0) {
            console.log('⚠️  No users found. Please create a user first.');
            process.exit(0);
        }

        // Delete existing missions for all users
        await DailyMission.deleteMany({});
        console.log('🗑️  Cleared existing missions\n');

        let totalMissionsCreated = 0;

        // Create missions for each user
        for (const user of users) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59, 59, 999);

            const missions = [
                // Regular missions (no proof required)
                {
                    user: user._id,
                    title: 'Daily Learner',
                    description: 'Complete 3 lessons today',
                    type: 'complete_lessons',
                    target: 3,
                    progress: 0,
                    requiresProof: false,
                    reward: { xp: 50, coins: 10 },
                    expiresAt: tomorrow,
                    status: 'active'
                },
                {
                    user: user._id,
                    title: 'XP Hunter',
                    description: 'Earn 100 XP through lessons and quizzes',
                    type: 'earn_xp',
                    target: 100,
                    progress: 0,
                    requiresProof: false,
                    reward: { xp: 30, coins: 5 },
                    expiresAt: tomorrow,
                    status: 'active'
                },
                {
                    user: user._id,
                    title: 'Perfect Performance',
                    description: 'Score 100% on any quiz today',
                    type: 'perfect_score',
                    target: 1,
                    progress: 0,
                    requiresProof: false,
                    reward: { xp: 75, coins: 15 },
                    expiresAt: tomorrow,
                    status: 'active'
                },

                // Proof missions (image required)
                {
                    user: user._id,
                    title: 'Eco Action: Reusable Bag',
                    description: 'Use a reusable bag for shopping and take a photo',
                    type: 'complete_lessons',
                    target: 1,
                    progress: 0,
                    requiresProof: true,
                    reward: { xp: 100, coins: 20 },
                    expiresAt: tomorrow,
                    status: 'active'
                },
                {
                    user: user._id,
                    title: 'Water Conservation Hero',
                    description: 'Turn off taps while brushing teeth - show us your commitment!',
                    type: 'complete_lessons',
                    target: 1,
                    progress: 0,
                    requiresProof: true,
                    reward: { xp: 80, coins: 15 },
                    expiresAt: tomorrow,
                    status: 'active'
                },
                {
                    user: user._id,
                    title: 'Waste Warrior',
                    description: 'Separate waste into recyclable and non-recyclable bins',
                    type: 'complete_lessons',
                    target: 1,
                    progress: 0,
                    requiresProof: true,
                    reward: { xp: 120, coins: 25 },
                    expiresAt: tomorrow,
                    status: 'active'
                },
                {
                    user: user._id,
                    title: 'Green Commuter',
                    description: 'Use public transport, bicycle, or walk instead of a car',
                    type: 'complete_lessons',
                    target: 1,
                    progress: 0,
                    requiresProof: true,
                    reward: { xp: 150, coins: 30 },
                    expiresAt: tomorrow,
                    status: 'active'
                },
                {
                    user: user._id,
                    title: 'Plant Life Supporter',
                    description: 'Water a plant or tend to your garden',
                    type: 'complete_lessons',
                    target: 1,
                    progress: 0,
                    requiresProof: true,
                    reward: { xp: 90, coins: 18 },
                    expiresAt: tomorrow,
                    status: 'active'
                }
            ];

            await DailyMission.insertMany(missions);
            totalMissionsCreated += missions.length;

            console.log(`✅ Created ${missions.length} missions for ${user.name} (${user.email})`);
        }

        console.log(`\n✅ Total missions created: ${totalMissionsCreated}`);
        console.log(`   - Regular missions: ${users.length * 3}`);
        console.log(`   - Proof missions: ${users.length * 5}\n`);

        // Show challenge count
        const challengeCount = await Challenge.countDocuments();
        console.log(`📊 Challenges in database: ${challengeCount}`);

        if (challengeCount > 0) {
            const challenges = await Challenge.find().limit(3);
            console.log('\nSample Challenges:');
            challenges.forEach(c => {
                console.log(`   - ${c.title} (${c.difficulty})`);
            });
        }

        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('✅ SETUP COMPLETE!');
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('You can now:');
        console.log('1. Login to the app');
        console.log('2. Navigate to /missions to see your daily missions');
        console.log('3. Navigate to /challenges to see available challenges\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

createMissionsForAllUsers();
