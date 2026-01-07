const mongoose = require('mongoose');
require('dotenv').config();
const DailyMission = require('./models/DailyMission');
const User = require('./models/User');

const seedMissions = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Connected to DB...');

        // Get a sample user (or create one if needed)
        let user = await User.findOne();
        if (!user) {
            console.log('No users found. Please create a user first.');
            process.exit(1);
        }

        // Clear existing missions for this user
        await DailyMission.deleteMany({ user: user._id });

        const midnight = new Date();
        midnight.setHours(23, 59, 59, 999);

        const missionsData = [
            // Missions WITHOUT proof requirement
            {
                user: user._id,
                type: 'complete_lessons',
                title: 'Daily Learner',
                description: 'Complete 3 lessons today to expand your environmental knowledge.',
                target: 3,
                reward: { xp: 50, coins: 10 },
                expiresAt: midnight,
                requiresProof: false
            },
            {
                user: user._id,
                type: 'earn_xp',
                title: 'XP Hunter',
                description: 'Earn 100 XP through lessons and quizzes.',
                target: 100,
                reward: { xp: 30, coins: 5 },
                expiresAt: midnight,
                requiresProof: false
            },
            {
                user: user._id,
                type: 'perfect_score',
                title: 'Perfect Performance',
                description: 'Score 100% on any quiz today.',
                target: 1,
                reward: { xp: 75, coins: 15 },
                expiresAt: midnight,
                requiresProof: false
            },

            // Missions WITH proof requirement
            {
                user: user._id,
                type: 'complete_lessons',
                title: 'Eco Action: Reusable Bag',
                description: 'Use a reusable bag for shopping today. Upload a photo of you with your reusable bag.',
                target: 1,
                reward: { xp: 100, coins: 20 },
                expiresAt: midnight,
                requiresProof: true
            },
            {
                user: user._id,
                type: 'complete_lessons',
                title: 'Water Conservation Hero',
                description: 'Turn off taps while brushing teeth. Take a photo showing your water-saving habit.',
                target: 1,
                reward: { xp: 80, coins: 15 },
                expiresAt: midnight,
                requiresProof: true
            },
            {
                user: user._id,
                type: 'complete_lessons',
                title: 'Waste Warrior',
                description: 'Separate your waste into recyclable and non-recyclable. Upload proof of your sorted waste.',
                target: 1,
                reward: { xp: 120, coins: 25 },
                expiresAt: midnight,
                requiresProof: true
            },
            {
                user: user._id,
                type: 'complete_lessons',
                title: 'Green Commuter',
                description: 'Use public transport, bicycle, or walk instead of a car. Share a photo of your eco-friendly commute.',
                target: 1,
                reward: { xp: 150, coins: 30 },
                expiresAt: midnight,
                requiresProof: true
            },
            {
                user: user._id,
                type: 'complete_lessons',
                title: 'Plant Life Supporter',
                description: 'Water a plant or tend to your garden. Show us your green thumb with a photo!',
                target: 1,
                reward: { xp: 90, coins: 18 },
                expiresAt: midnight,
                requiresProof: true
            },
            {
                user: user._id,
                type: 'complete_lessons',
                title: 'Energy Saver',
                description: 'Switch off all unnecessary lights and electronics for 2 hours. Document your energy-saving effort.',
                target: 1,
                reward: { xp: 110, coins: 22 },
                expiresAt: midnight,
                requiresProof: true
            },
            {
                user: user._id,
                type: 'complete_lessons',
                title: 'Litter Picker',
                description: 'Pick up 5 pieces of litter from your neighborhood. Upload a photo of the collected waste.',
                target: 1,
                reward: { xp: 130, coins: 26 },
                expiresAt: midnight,
                requiresProof: true
            },
            {
                user: user._id,
                type: 'complete_lessons',
                title: 'Eco Educator',
                description: 'Teach someone about an environmental topic you learned. Share a photo or description of your teaching moment.',
                target: 1,
                reward: { xp: 160, coins: 32 },
                expiresAt: midnight,
                requiresProof: true
            }
        ];

        const missions = await DailyMission.insertMany(missionsData);

        console.log(`✅ Created ${missions.length} missions for user: ${user.name}`);
        console.log(`   - Without proof: 3 missions`);
        console.log(`   - With proof required: ${missions.filter(m => m.requiresProof).length} missions`);
        console.log('\n📋 Missions created:');
        missions.forEach(m => {
            console.log(`   ${m.requiresProof ? '📸' : '📝'} ${m.title} - ${m.reward.xp} XP, ${m.reward.coins} coins`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding missions:', error);
        process.exit(1);
    }
};

seedMissions();
