const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('../../models/User');
const UserProgress = require('../../models/UserProgress');
const Leaderboard = require('../../models/Leaderboard');
const Streak = require('../../models/Streak');
const Competition = require('../../models/Competition');
const Subject = require('../../models/Subject');

dotenv.config();

const names = [
    'Arjun Mehta', 'Sana Khan', 'Vivaan Sharma', 'Aditi Rao',
    'Ishan Patel', 'Ananya Gupta', 'Kabir Singh', 'Zoya Sheikh',
    'Reyansh Joshi', 'Kiara Malhotra', 'Aariv Verma', 'Myra Kapoor',
    'Advait Kulkarni', 'Diya Nair', 'Atharv Reddy', 'Sara Fernandez'
];

const fullPopulation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Connected to DB...'.cyan);

        const users = await User.find();

        // Update user names first for realism
        for (let i = 0; i < users.length; i++) {
            if (names[i]) {
                users[i].name = names[i];
                await users[i].save();
            }
        }

        console.log(`Populating for ${users.length} users with real names...`.yellow);

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        for (const user of users) {
            // Ensure UserProgress with high points to see them in leaderboard
            await UserProgress.findOneAndUpdate(
                { user: user._id },
                {
                    totalXP: Math.floor(Math.random() * 8000) + 1000,
                    level: Math.floor(Math.random() * 30) + 5,
                    coins: Math.floor(Math.random() * 2000),
                    lessonsCompleted: Math.floor(Math.random() * 100),
                    stats: {
                        totalStudyTime: Math.floor(Math.random() * 1000),
                        averageScore: Math.floor(Math.random() * 30) + 70
                    }
                },
                { upsert: true }
            );

            // Ensure Streak
            await Streak.findOneAndUpdate(
                { user: user._id },
                {
                    currentStreak: Math.floor(Math.random() * 10) + 5,
                    longestStreak: 20
                },
                { upsert: true }
            );

            // Seed Leaderboard entries
            await Leaderboard.findOneAndUpdate(
                { user: user._id, type: 'weekly', 'period.startDate': startOfWeek },
                {
                    score: Math.floor(Math.random() * 1500),
                    period: { startDate: startOfWeek, endDate: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000) },
                    stats: { xpEarned: 500, lessonsCompleted: 5, streakDays: 7 }
                },
                { upsert: true }
            );

            await Leaderboard.findOneAndUpdate(
                { user: user._id, type: 'monthly', 'period.startDate': startOfMonth },
                {
                    score: Math.floor(Math.random() * 5000),
                    period: { startDate: startOfMonth, endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0) },
                    stats: { xpEarned: 2000, lessonsCompleted: 20, streakDays: 7 }
                },
                { upsert: true }
            );
        }

        // Force rankings update
        await Leaderboard.updateRanks('weekly');
        await Leaderboard.updateRanks('monthly');

        // Populate ALL competitions
        const competitions = await Competition.find();
        for (const comp of competitions) {
            console.log(`Populating leaderboard for: ${comp.title}`);
            const randomUsers = users.sort(() => 0.5 - Math.random()).slice(0, 8);
            comp.participants = randomUsers.map((u, i) => ({
                user: u._id,
                score: 1000 - (i * 100) + Math.floor(Math.random() * 50),
                completed: true,
                rank: i + 1
            }));
            comp.leaderboard = comp.participants.map(p => ({
                user: p.user,
                rank: p.rank,
                score: p.score,
                prize: p.rank === 1 ? 'First Place' : 'Participation'
            }));
            await comp.save();
        }

        console.log('✅ DATABASE FULLY POPULATED!'.green.bold);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fullPopulation();
