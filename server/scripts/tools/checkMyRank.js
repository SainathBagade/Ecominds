const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../../models/User');
const Leaderboard = require('../../models/Leaderboard');

async function checkRank() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Search for common users or users with the points from screenshot
        const user = await User.findOne({
            $or: [
                { email: 'darshan@gmail.com' },
                { name: /Sainath/i },
                { points: 3968 }
            ]
        });

        if (!user) {
            console.log('User not found.');
            process.exit(0);
        }

        console.log(`\n👤 USER: ${user.name} (${user.email})`);
        console.log(`📍 GRADE: ${user.grade}`);
        console.log('------------------------------------');

        const rankings = await Leaderboard.find({ user: user._id });

        if (rankings.length === 0) {
            console.log('No leaderboard entries found.');
        } else {
            rankings.sort((a, b) => a.type.localeCompare(b.type)).forEach(entry => {
                let typeLabel = entry.type.toUpperCase();
                if (typeLabel === 'ALL_TIME') typeLabel = 'ALL TIME';
                console.log(`📅 ${typeLabel.padEnd(10)}: Rank #${entry.rank} (Score: ${entry.score} pts)`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkRank();
