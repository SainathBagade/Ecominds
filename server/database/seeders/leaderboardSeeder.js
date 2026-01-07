const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load env vars
dotenv.config();

// Load Models
const User = require('../../models/User');
const Leaderboard = require('../../models/Leaderboard');

// Function to get date ranges for different leaderboard types
const getDateRanges = () => {
    const now = new Date();

    // Weekly - current week (Sunday to Saturday)
    const weeklyStart = new Date(now);
    weeklyStart.setDate(now.getDate() - now.getDay());
    weeklyStart.setHours(0, 0, 0, 0);
    const weeklyEnd = new Date(weeklyStart);
    weeklyEnd.setDate(weeklyStart.getDate() + 7);

    // Monthly - current month
    const monthlyStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // All time
    const allTimeStart = new Date(0);
    const allTimeEnd = new Date();

    return {
        weekly: { startDate: weeklyStart, endDate: weeklyEnd },
        monthly: { startDate: monthlyStart, endDate: monthlyEnd },
        all_time: { startDate: allTimeStart, endDate: allTimeEnd }
    };
};

// Function to generate random points
const generateRandomPoints = (type) => {
    let min, max;

    switch (type) {
        case 'weekly':
            min = 10;
            max = 200;
            break;
        case 'monthly':
            min = 50;
            max = 800;
            break;
        case 'all_time':
            min = 100;
            max = 5000;
            break;
        default:
            min = 10;
            max = 200;
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function to generate random stats based on points
const generateStats = (points, type) => {
    const multiplier = type === 'weekly' ? 1 : type === 'monthly' ? 3 : 10;

    return {
        xpEarned: points,
        lessonsCompleted: Math.floor(Math.random() * (5 * multiplier)) + 1,
        perfectScores: Math.floor(Math.random() * (3 * multiplier)),
        streakDays: Math.floor(Math.random() * (type === 'weekly' ? 7 : type === 'monthly' ? 30 : 100))
    };
};

// Main seeder function
const seedLeaderboards = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...'.cyan);
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ Connected to ${mongoose.connection.host}`.green.bold);

        // Get all students
        console.log('\n📊 Fetching all students...'.yellow);
        const students = await User.find({ role: 'student' }).sort({ grade: 1, name: 1 });
        console.log(`   Found ${students.length} students`.gray);

        if (students.length === 0) {
            console.log('❌ No students found. Please run userSeeder.js first.'.red);
            process.exit(1);
        }

        // Clear existing leaderboard data
        console.log('\n🗑️  Clearing existing leaderboard data...'.yellow);
        const deleteResult = await Leaderboard.deleteMany({});
        console.log(`   Deleted ${deleteResult.deletedCount} existing entries`.gray);

        // Get date ranges
        const dateRanges = getDateRanges();
        const types = ['weekly', 'monthly', 'all_time'];

        console.log('\n📈 Generating leaderboard entries...'.yellow);
        console.log(`   Types: Weekly, Monthly, All-Time`.gray);
        console.log(`   Students per grade: 40`.gray);
        console.log(`   Grades: 4-12`.gray);

        const leaderboardEntries = [];
        let totalEntries = 0;

        // Group students by grade for progress tracking
        const studentsByGrade = {};
        students.forEach(student => {
            if (!studentsByGrade[student.grade]) {
                studentsByGrade[student.grade] = [];
            }
            studentsByGrade[student.grade].push(student);
        });

        // Generate entries for each type
        for (const type of types) {
            console.log(`\n  ${type.toUpperCase()}:`.cyan);
            const period = dateRanges[type];

            for (const grade in studentsByGrade) {
                const gradeStudents = studentsByGrade[grade];

                for (const student of gradeStudents) {
                    const points = generateRandomPoints(type);
                    const stats = generateStats(points, type);

                    leaderboardEntries.push({
                        user: student._id,
                        type,
                        grade: student.grade,
                        college: student.college || 'Default College',
                        score: points,
                        period: {
                            startDate: period.startDate,
                            endDate: period.endDate
                        },
                        stats
                    });

                    totalEntries++;
                }

                console.log(`    ✓ Grade ${grade}: ${gradeStudents.length} entries`.gray);
            }
        }

        // Insert all entries
        console.log(`\n💾 Inserting ${totalEntries} leaderboard entries...`.yellow);
        await Leaderboard.insertMany(leaderboardEntries);
        console.log(`   ✅ Inserted successfully`.green);

        // Update ranks for each type and grade
        console.log(`\n🏆 Calculating ranks...`.yellow);

        for (const type of types) {
            const period = dateRanges[type];

            // Get all entries for this type, grouped by grade
            for (let gradeNum = 4; gradeNum <= 12; gradeNum++) {
                const grade = gradeNum.toString();

                const entries = await Leaderboard.find({
                    type,
                    grade,
                    'period.startDate': period.startDate
                }).sort({ score: -1 });

                // Update ranks
                const bulkOps = entries.map((entry, index) => ({
                    updateOne: {
                        filter: { _id: entry._id },
                        update: { $set: { rank: index + 1 } }
                    }
                }));

                if (bulkOps.length > 0) {
                    await Leaderboard.bulkWrite(bulkOps);
                }

                process.stdout.write(`    ✓ ${type} - Grade ${grade}: Ranked ${entries.length} students\r`);
            }
            console.log(`    ✅ ${type.toUpperCase()}: All grades ranked`.green);
        }

        // Display summary statistics
        console.log(`\n📊 Summary Statistics:`.cyan.bold);
        console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`.gray);

        for (const type of types) {
            const count = await Leaderboard.countDocuments({ type });
            const avgScore = await Leaderboard.aggregate([
                { $match: { type } },
                { $group: { _id: null, avg: { $avg: '$score' } } }
            ]);

            console.log(`   ${type.toUpperCase()}:`.yellow);
            console.log(`     Total Entries: ${count}`.gray);
            console.log(`     Avg Score: ${Math.round(avgScore[0]?.avg || 0)}`.gray);
        }

        // Show sample rankings for each grade
        console.log(`\n🎯 Sample Rankings (Top 3 per grade - All Time):`.cyan.bold);
        console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`.gray);

        for (let gradeNum = 4; gradeNum <= 12; gradeNum++) {
            const grade = gradeNum.toString();
            const topStudents = await Leaderboard.find({
                type: 'all_time',
                grade
            })
                .sort({ rank: 1 })
                .limit(3)
                .populate('user', 'name');

            console.log(`\n   Grade ${grade}:`.yellow);
            topStudents.forEach((entry, idx) => {
                console.log(`     ${idx + 1}. ${entry.user.name} - ${entry.score} pts (Rank: ${entry.rank})`.gray);
            });
        }

        console.log(`\n✅ Leaderboard seeding completed successfully!`.green.bold);
        console.log(`   📊 Total entries created: ${totalEntries}`.cyan);
        console.log(`   🏆 All ranks calculated and assigned`.cyan);
        console.log(`   ✨ Ready to view leaderboards!`.cyan);

        process.exit(0);
    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`.red.bold);
        console.error(error);
        process.exit(1);
    }
};

// Run the seeder
seedLeaderboards();
