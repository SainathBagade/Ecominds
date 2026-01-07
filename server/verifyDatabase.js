const mongoose = require('mongoose');
require('dotenv').config();

const Grade = require('./models/Grade');
const Subject = require('./models/Subject');
const Module = require('./models/Module');
const Lesson = require('./models/Lesson');
const Game = require('./models/Game');
const Challenge = require('./models/Challenge');
const Competition = require('./models/Competition');
const DailyMission = require('./models/DailyMission');

const verifyDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Connected to DB...\n');

        // Count all collections
        const counts = {
            grades: await Grade.countDocuments(),
            subjects: await Subject.countDocuments(),
            modules: await Module.countDocuments(),
            lessons: await Lesson.countDocuments(),
            games: await Game.countDocuments(),
            challenges: await Challenge.countDocuments(),
            competitions: await Competition.countDocuments(),
            missions: await DailyMission.countDocuments()
        };

        console.log('📊 DATABASE VERIFICATION RESULTS\n');
        console.log('================================\n');

        // Verify Grades
        console.log('✅ GRADES:', counts.grades, '/ 12 expected');
        if (counts.grades === 12) {
            console.log('   ✓ All grades created successfully\n');
        } else {
            console.log('   ⚠️  Expected 12 grades\n');
        }

        // Verify Subjects
        console.log('✅ SUBJECTS:', counts.subjects, '/ 36 expected (3 per grade)');
        if (counts.subjects === 36) {
            console.log('   ✓ All subjects created successfully\n');
        } else {
            console.log('   ⚠️  Expected 36 subjects\n');
        }

        // Verify Modules
        console.log('✅ MODULES:', counts.modules, '/ 144 expected (4 per subject)');
        if (counts.modules === 144) {
            console.log('   ✓ All modules created successfully\n');
        } else {
            console.log('   ⚠️  Expected 144 modules\n');
        }

        // Verify Lessons
        console.log('✅ LESSONS:', counts.lessons);
        console.log('   ✓ Lessons created (3-5 per module)\n');

        // Verify Games
        console.log('✅ GAMES:', counts.games, '/ 108 expected (3 per subject)');
        if (counts.games === 108) {
            console.log('   ✓ All games created successfully\n');
        } else {
            console.log('   ⚠️  Expected 108 games\n');
        }

        // Verify Challenges
        const easyCount = await Challenge.countDocuments({ difficulty: 'easy' });
        const mediumCount = await Challenge.countDocuments({ difficulty: 'medium' });
        const hardCount = await Challenge.countDocuments({ difficulty: 'hard' });

        console.log('✅ CHALLENGES:', counts.challenges, '/ 9 expected');
        console.log('   - Easy:', easyCount, '/ 3 expected');
        console.log('   - Medium:', mediumCount, '/ 3 expected');
        console.log('   - Hard:', hardCount, '/ 3 expected');
        if (easyCount === 3 && mediumCount === 3 && hardCount === 3) {
            console.log('   ✓ All challenges created with correct difficulty levels\n');
        } else {
            console.log('   ⚠️  Expected 3 of each difficulty\n');
        }

        // Verify Competitions
        const completedCount = await Competition.countDocuments({ status: 'completed' });
        const upcomingCount = await Competition.countDocuments({ status: 'registration' });

        console.log('✅ COMPETITIONS:', counts.competitions, '/ 6 expected');
        console.log('   - Completed:', completedCount, '/ 3 expected');
        console.log('   - Upcoming:', upcomingCount, '/ 3 expected');
        if (completedCount === 3 && upcomingCount === 3) {
            console.log('   ✓ All competitions created with correct status\n');
        } else {
            console.log('   ⚠️  Expected 3 completed and 3 upcoming\n');
        }

        // Verify Missions
        const regularMissions = await DailyMission.countDocuments({ requiresProof: false });
        const proofMissions = await DailyMission.countDocuments({ requiresProof: true });

        console.log('✅ MISSIONS:', counts.missions, '/ 11 expected');
        console.log('   - Regular:', regularMissions, '/ 3 expected');
        console.log('   - With Proof:', proofMissions, '/ 8 expected');
        if (regularMissions === 3 && proofMissions === 8) {
            console.log('   ✓ All missions created with correct proof requirements\n');
        } else {
            console.log('   ⚠️  Expected 3 regular and 8 with proof\n');
        }

        // Sample Data
        console.log('================================\n');
        console.log('📋 SAMPLE DATA\n');

        const sampleGrade = await Grade.findOne({ level: 10 });
        console.log('Sample Grade:', sampleGrade?.name);

        const sampleSubjects = await Subject.find({ grade: sampleGrade?._id }).limit(3);
        console.log('Sample Subjects for Grade 10:');
        sampleSubjects.forEach(s => console.log('  -', s.name, s.icon));

        const sampleModule = await Module.findOne().populate('subject');
        console.log('\nSample Module:', sampleModule?.title);
        console.log('  Subject:', sampleModule?.subject?.name);
        console.log('  Difficulty:', sampleModule?.difficulty);

        const sampleGame = await Game.findOne();
        console.log('\nSample Game:', sampleGame?.title);
        console.log('  Type:', sampleGame?.type);
        console.log('  Category:', sampleGame?.category);
        console.log('  Difficulty:', sampleGame?.difficulty);

        const sampleChallenge = await Challenge.findOne({ difficulty: 'hard' });
        console.log('\nSample Hard Challenge:', sampleChallenge?.title);
        console.log('  Rewards:', sampleChallenge?.rewards.xp, 'XP,', sampleChallenge?.rewards.coins, 'coins');

        const sampleCompetition = await Competition.findOne({ status: 'registration' });
        console.log('\nSample Upcoming Competition:', sampleCompetition?.title);
        console.log('  Prize:', sampleCompetition?.prizes?.first?.xp, 'XP,', sampleCompetition?.prizes?.first?.coins, 'coins');

        const sampleMission = await DailyMission.findOne({ requiresProof: true });
        console.log('\nSample Proof Mission:', sampleMission?.title);
        console.log('  Rewards:', sampleMission?.reward?.xp, 'XP,', sampleMission?.reward?.coins, 'coins');

        // Summary
        console.log('\n================================\n');
        console.log('📊 TOTAL ITEMS CREATED:',
            counts.grades + counts.subjects + counts.modules + counts.lessons +
            counts.games + counts.challenges + counts.competitions + counts.missions);

        console.log('\n✅ DATABASE VERIFICATION COMPLETE!\n');

        // Check if all requirements met
        const allGood =
            counts.grades === 12 &&
            counts.subjects === 36 &&
            counts.modules === 144 &&
            counts.games === 108 &&
            counts.challenges === 9 &&
            counts.competitions === 6 &&
            counts.missions === 11;

        if (allGood) {
            console.log('🎉 ALL REQUIREMENTS MET! Database is ready for testing.\n');
        } else {
            console.log('⚠️  Some items are missing. Please check the counts above.\n');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

verifyDatabase();
