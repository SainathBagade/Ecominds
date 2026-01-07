const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('./models/User');
const UserProgress = require('./models/UserProgress');
const Leaderboard = require('./models/Leaderboard');
const Streak = require('./models/Streak');
const Competition = require('./models/Competition');

dotenv.config();

const seedLeaderboard = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Connected to DB...'.cyan);

        const users = await User.find();
        console.log(`Found ${users.length} users. Populating stats...`.yellow);

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        for (const user of users) {
            // 1. Ensure UserProgress exists
            let progress = await UserProgress.findOne({ user: user._id });
            if (!progress) {
                progress = await UserProgress.create({
                    user: user._id,
                    totalXP: Math.floor(Math.random() * 5000),
                    level: Math.floor(Math.random() * 20) + 1,
                    coins: Math.floor(Math.random() * 1000),
                    lessonsCompleted: Math.floor(Math.random() * 50)
                });
            }

            // 2. Ensure Streak exists
            let streak = await Streak.findOne({ user: user._id });
            if (!streak) {
                streak = await Streak.create({
                    user: user._id,
                    currentStreak: Math.floor(Math.random() * 30),
                    longestStreak: Math.floor(Math.random() * 50),
                    lastActivityDate: new Date()
                });
            }

            // Common fields
            const genericData = {
                grade: user.grade || '10',
                college: user.school || 'EcoMinds High'
            };

            // 3. Create Leaderboard Entries for current period
            // Weekly
            await Leaderboard.findOneAndUpdate(
                { user: user._id, type: 'weekly', 'period.startDate': startOfWeek },
                {
                    ...genericData,
                    score: Math.floor(Math.random() * 1000),
                    period: { startDate: startOfWeek, endDate: endOfWeek },
                    stats: {
                        xpEarned: Math.floor(Math.random() * 500),
                        lessonsCompleted: Math.floor(Math.random() * 10),
                        streakDays: streak.currentStreak
                    }
                },
                { upsert: true }
            );

            // Monthly
            await Leaderboard.findOneAndUpdate(
                { user: user._id, type: 'monthly', 'period.startDate': startOfMonth },
                {
                    ...genericData,
                    score: Math.floor(Math.random() * 3000),
                    period: { startDate: startOfMonth, endDate: endOfMonth },
                    stats: {
                        xpEarned: Math.floor(Math.random() * 2000),
                        lessonsCompleted: Math.floor(Math.random() * 30),
                        streakDays: streak.currentStreak
                    }
                },
                { upsert: true }
            );

            // All Time
            await Leaderboard.findOneAndUpdate(
                { user: user._id, type: 'all_time', 'period.startDate': new Date(0) },
                {
                    ...genericData,
                    score: progress.totalXP,
                    period: { startDate: new Date(0), endDate: new Date() },
                    stats: {
                        xpEarned: progress.totalXP,
                        lessonsCompleted: progress.lessonsCompleted,
                        streakDays: streak.currentStreak
                    }
                },
                { upsert: true }
            );
        }

        // 4. Update Ranks
        await Leaderboard.updateRanks('weekly');
        await Leaderboard.updateRanks('monthly');
        await Leaderboard.updateRanks('all_time');

        console.log('✅ Leaderboard and Stats Populated!'.green.bold);

        // 5. Check Competitions
        const competitions = await Competition.find();
        if (competitions.length === 0) {
            console.log('Competitions missing? You should run seeder.js first!'.red);
        } else {
            console.log(`Found ${competitions.length} competitions. Ensuring they have participants...`.yellow);
            for (const comp of competitions) {
                if (comp.participants.length === 0) {
                    const randomUsers = users.sort(() => 0.5 - Math.random()).slice(0, 5);
                    comp.participants = randomUsers.map(u => ({
                        user: u._id,
                        score: Math.floor(Math.random() * 500),
                        completed: Math.random() > 0.3
                    }));
                    await comp.save();
                    await comp.generateLeaderboard();
                }
            }
        }

        console.log('✅ Data seeding finished.'.green.inverse);
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`.red);
        process.exit(1);
    }
};

seedLeaderboard();
