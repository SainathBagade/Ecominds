const mongoose = require('mongoose');
require('dotenv').config();
const Challenge = require('../../models/Challenge');

const challenges = [
    {
        title: "Zero Waste Hero",
        description: "Avoid using single-use plastics for an entire day. Carry your own cloth bag and water bottle. Submit a photo of your plastic-free kit.",
        type: 'daily',
        difficulty: 'easy',
        category: 'consistency',
        requirements: {
            type: 'complete_lessons', // Placeholder
            target: 1
        },
        rewards: {
            xp: 50,
            coins: 10
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        featured: true
    },
    {
        title: "Water Conservation Warrior",
        description: "Save water by taking a bucket bath instead of a shower or fixing a leaking tap. Show us a photo of your water-saving action.",
        type: 'weekly',
        difficulty: 'medium',
        category: 'mastery',
        requirements: {
            type: 'complete_lessons',
            target: 1
        },
        rewards: {
            xp: 150,
            coins: 30
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        featured: true
    },
    {
        title: "Neighborhood Cleanup",
        description: "Pick up 10 pieces of litter in your local park or street. Keep our environment clean and safe for everyone. Upload a photo of the collected waste.",
        type: 'community',
        difficulty: 'medium',
        category: 'social',
        requirements: {
            type: 'complete_lessons',
            target: 1
        },
        rewards: {
            xp: 200,
            coins: 50
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        featured: false
    },
    {
        title: "Solar Awareness Month",
        description: "Watch a video about how solar energy works and write a 2-sentence summary. Or take a photo of any solar panel you see in your area.",
        type: 'special',
        difficulty: 'easy',
        category: 'mastery',
        requirements: {
            type: 'complete_lessons',
            target: 1
        },
        rewards: {
            xp: 100,
            coins: 20
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        featured: true
    },
    {
        title: "Eco-Friendly Commute",
        description: "Walk, cycle, or use public transport instead of a private car for a trip today. Reduce your carbon footprint! Upload a photo of your commute.",
        type: 'daily',
        difficulty: 'medium',
        category: 'consistency',
        requirements: {
            type: 'complete_lessons',
            target: 1
        },
        rewards: {
            xp: 80,
            coins: 15
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
];

const seedChallenges = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📦 Connected to MongoDB...');

        for (const data of challenges) {
            await Challenge.findOneAndUpdate(
                { title: data.title },
                data,
                { upsert: true, new: true }
            );
            console.log(`🚀 Seeded/Updated Challenge: ${data.title}`);
        }

        console.log('✅ Challenges seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding challenges:', error);
        process.exit(1);
    }
};

seedChallenges();
