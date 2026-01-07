const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Leaderboard = require('./models/Leaderboard');

const fixAllUsers = async () => {
    try {
        console.log('🔌 Connecting...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        // Get ALL students
        const allStudents = await User.find({ role: 'student' });
        console.log(`\n📊 Found ${allStudents.length} students total`);

        // Get students with leaderboard entries
        const studentsWithEntries = await Leaderboard.distinct('user');
        console.log(`📈 ${studentsWithEntries.length} students have leaderboard entries`);

        // Find students WITHOUT leaderboard entries
        const studentsWithoutEntries = allStudents.filter(
            student => !studentsWithEntries.some(id => id.equals(student._id))
        );

        console.log(`\n❌ ${studentsWithoutEntries.length} students are MISSING leaderboard entries:`);

        if (studentsWithoutEntries.length > 0) {
            console.log('\n🔧 Creating entries for missing students...\n');

            for (const student of studentsWithoutEntries) {
                console.log(`  Creating for: ${student.name} (${student.email}) - Grade ${student.grade}`);

                const types = ['weekly', 'monthly', 'all_time'];

                for (const type of types) {
                    const now = new Date();
                    let startDate, endDate;

                    if (type === 'weekly') {
                        startDate = new Date(now);
                        startDate.setDate(now.getDate() - now.getDay());
                        startDate.setHours(0, 0, 0, 0);
                        endDate = new Date(startDate);
                        endDate.setDate(startDate.getDate() + 7);
                    } else if (type === 'monthly') {
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    } else {
                        startDate = new Date(0);
                        endDate = new Date();
                    }

                    await Leaderboard.create({
                        user: student._id,
                        type,
                        grade: student.grade,
                        college: student.college || 'Default College',
                        score: student.points || 0,
                        period: { startDate, endDate },
                        stats: {
                            xpEarned: student.points || 0,
                            lessonsCompleted: 0,
                            perfectScores: 0,
                            streakDays: student.streak || 0
                        }
                    });
                }

                // Update ranks for this student's grade
                for (const type of types) {
                    await Leaderboard.updateRanks(type, student.grade);
                }

                console.log(`    ✅ Created entries and updated ranks`);
            }

            console.log(`\n✅ All students now have leaderboard entries!`);
        } else {
            console.log('  ✅ All students already have entries!');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixAllUsers();
