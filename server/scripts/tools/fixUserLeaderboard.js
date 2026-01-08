const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load env vars
dotenv.config();

// Load Models
const User = require('../../models/User');
const Leaderboard = require('../../models/Leaderboard');

// Function to get date ranges
const getDateRanges = () => {
    const now = new Date();

    const weeklyStart = new Date(now);
    weeklyStart.setDate(now.getDate() - now.getDay());
    weeklyStart.setHours(0, 0, 0, 0);
    const weeklyEnd = new Date(weeklyStart);
    weeklyEnd.setDate(weeklyStart.getDate() + 7);

    const monthlyStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const allTimeStart = new Date(0);
    const allTimeEnd = new Date();

    return {
        weekly: { startDate: weeklyStart, endDate: weeklyEnd },
        monthly: { startDate: monthlyStart, endDate: monthlyEnd },
        all_time: { startDate: allTimeStart, endDate: allTimeEnd }
    };
};

// Fix leaderboard entries for a specific user
const fixUserLeaderboard = async (userId) => {
    try {
        console.log(`\n🔧 Fixing leaderboard for user: ${userId}`.cyan);

        const user = await User.findById(userId);
        if (!user) {
            console.log('❌ User not found'.red);
            return;
        }

        console.log(`✅ User: ${user.name}, Grade: ${user.grade}, Points: ${user.points}`.green);

        const dateRanges = getDateRanges();
        const types = ['weekly', 'monthly', 'all_time'];

        for (const type of types) {
            const period = dateRanges[type];

            // Delete existing entry
            await Leaderboard.deleteOne({
                user: userId,
                type,
                'period.startDate': period.startDate
            });

            // Create new entry
            const entry = await Leaderboard.create({
                user: userId,
                type,
                grade: user.grade,
                college: user.college || 'Default College',
                score: user.points || 0,
                period: {
                    startDate: period.startDate,
                    endDate: period.endDate
                },
                stats: {
                    xpEarned: user.points || 0,
                    lessonsCompleted: 0,
                    perfectScores: 0,
                    streakDays: user.streak || 0
                }
            });

            console.log(`  ✓ Created ${type} entry with score: ${entry.score}`.gray);

            // Update ranks for this grade
            await Leaderboard.updateRanks(type, user.grade);
        }

        // Fetch and display final entries
        console.log(`\n📊 Final Leaderboard Entries:`.yellow);
        for (const type of types) {
            const entry = await Leaderboard.findOne({
                user: userId,
                type
            }).populate('user', 'name');

            if (entry) {
                console.log(`  ${type}: Rank #${entry.rank}, Score: ${entry.score}`.green);
            }
        }

        console.log(`\n✅ Leaderboard fixed for ${user.name}!`.green.bold);

    } catch (error) {
        console.error(`❌ Error: ${error.message}`.red);
        console.error(error);
    }
};

// Main function
const main = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...'.cyan);
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ Connected to ${mongoose.connection.host}`.green.bold);

        // Get user ID from command line or use a default
        const userEmail = process.argv[2];

        if (!userEmail) {
            console.log('\n❌ Please provide a user email:'.red);
            console.log('   node fixUserLeaderboard.js user@example.com'.yellow);
            process.exit(1);
        }

        const user = await User.findOne({ email: userEmail });
        if (!user) {
            console.log(`\n❌ User not found with email: ${userEmail}`.red);
            process.exit(1);
        }

        await fixUserLeaderboard(user._id);

        process.exit(0);
    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`.red.bold);
        console.error(error);
        process.exit(1);
    }
};

// Run
main();
