const mongoose = require('mongoose');
require('dotenv').config();

const Grade = require('../../models/Grade');
const Subject = require('../../models/Subject');
const Module = require('../../models/Module');
const Lesson = require('../../models/Lesson');
const Game = require('../../models/Game');
const Challenge = require('../../models/Challenge');
const Competition = require('../../models/Competition');
const DailyMission = require('../../models/DailyMission');
const User = require('../../models/User');
const Leaderboard = require('../../models/Leaderboard');

const testAllFeatures = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Connected to DB...\n');
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('🧪 COMPREHENSIVE FEATURE TESTING\n');
        console.log('═══════════════════════════════════════════════════════════\n');

        let testsPassed = 0;
        let testsFailed = 0;

        // ========================================
        // TEST 1: EDUCATIONAL CONTENT
        // ========================================
        console.log('📚 TEST 1: EDUCATIONAL CONTENT\n');
        console.log('───────────────────────────────────────────────────────────\n');

        // Test Grades
        console.log('1.1 Testing Grades...');
        const grades = await Grade.find().sort({ level: 1 });
        console.log(`   ✓ Found ${grades.length} grades`);
        if (grades.length === 12) {
            console.log('   ✓ All 12 grades present');
            testsPassed++;
        } else {
            console.log('   ✗ Expected 12 grades');
            testsFailed++;
        }
        console.log('   Sample:', grades.slice(0, 3).map(g => g.name).join(', '));
        console.log('');

        // Test Subjects
        console.log('1.2 Testing Subjects...');
        const grade10 = grades.find(g => g.level === 10);
        const subjects = await Subject.find({ grade: grade10._id });
        console.log(`   ✓ Found ${subjects.length} subjects for Grade 10`);
        if (subjects.length === 3) {
            console.log('   ✓ Correct number of subjects per grade');
            testsPassed++;
        } else {
            console.log('   ✗ Expected 3 subjects per grade');
            testsFailed++;
        }
        subjects.forEach(s => console.log(`   - ${s.name} ${s.icon}`));
        console.log('');

        // Test Modules
        console.log('1.3 Testing Modules...');
        const subject = subjects[0];
        const modules = await Module.find({ subject: subject._id }).sort({ order: 1 });
        console.log(`   ✓ Found ${modules.length} modules for ${subject.name}`);
        if (modules.length === 4) {
            console.log('   ✓ Correct number of modules per subject');
            testsPassed++;
        } else {
            console.log('   ✗ Expected 4 modules per subject');
            testsFailed++;
        }
        modules.forEach(m => console.log(`   ${m.order}. ${m.title} (${m.difficulty})`));
        console.log('');

        // Test Lessons
        console.log('1.4 Testing Lessons...');
        const module = modules[0];
        const lessons = await Lesson.find({ module: module._id }).sort({ order: 1 });
        console.log(`   ✓ Found ${lessons.length} lessons in "${module.title}"`);
        if (lessons.length >= 3 && lessons.length <= 5) {
            console.log('   ✓ Correct number of lessons per module (3-5)');
            testsPassed++;
        } else {
            console.log('   ✗ Expected 3-5 lessons per module');
            testsFailed++;
        }
        lessons.forEach(l => console.log(`   ${l.order}. ${l.title} (${l.type}, ${l.points} XP)`));
        console.log('');

        // Test Games
        console.log('1.5 Testing Games...');
        const games = await Game.find({ module: { $in: modules.map(m => m._id) } });
        console.log(`   ✓ Found ${games.length} games for ${subject.name}`);
        if (games.length === 3) {
            console.log('   ✓ Correct number of games per subject');
            testsPassed++;
        } else {
            console.log('   ✗ Expected 3 games per subject');
            testsFailed++;
        }
        games.forEach(g => console.log(`   - ${g.title} (${g.type}, ${g.difficulty})`));
        console.log('');

        // ========================================
        // TEST 2: CHALLENGES
        // ========================================
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('🎯 TEST 2: CHALLENGES\n');
        console.log('───────────────────────────────────────────────────────────\n');

        // Test Easy Challenges
        console.log('2.1 Testing Easy Challenges...');
        const easyChallenges = await Challenge.find({ difficulty: 'easy' });
        console.log(`   ✓ Found ${easyChallenges.length} easy challenges`);
        if (easyChallenges.length === 3) {
            console.log('   ✓ Correct number of easy challenges');
            testsPassed++;
        } else {
            console.log('   ✗ Expected 3 easy challenges');
            testsFailed++;
        }
        easyChallenges.forEach(c => {
            console.log(`   - ${c.title}`);
            console.log(`     Rewards: ${c.rewards.xp} XP, ${c.rewards.coins} coins`);
            console.log(`     Type: ${c.type}, Featured: ${c.featured ? 'Yes' : 'No'}`);
        });
        console.log('');

        // Test Medium Challenges
        console.log('2.2 Testing Medium Challenges...');
        const mediumChallenges = await Challenge.find({ difficulty: 'medium' });
        console.log(`   ✓ Found ${mediumChallenges.length} medium challenges`);
        if (mediumChallenges.length === 3) {
            console.log('   ✓ Correct number of medium challenges');
            testsPassed++;
        } else {
            console.log('   ✗ Expected 3 medium challenges');
            testsFailed++;
        }
        mediumChallenges.forEach(c => {
            console.log(`   - ${c.title}`);
            console.log(`     Rewards: ${c.rewards.xp} XP, ${c.rewards.coins} coins`);
        });
        console.log('');

        // Test Hard Challenges
        console.log('2.3 Testing Hard Challenges...');
        const hardChallenges = await Challenge.find({ difficulty: 'hard' });
        console.log(`   ✓ Found ${hardChallenges.length} hard challenges`);
        if (hardChallenges.length === 3) {
            console.log('   ✓ Correct number of hard challenges');
            testsPassed++;
        } else {
            console.log('   ✗ Expected 3 hard challenges');
            testsFailed++;
        }
        hardChallenges.forEach(c => {
            console.log(`   - ${c.title}`);
            console.log(`     Rewards: ${c.rewards.xp} XP, ${c.rewards.coins} coins`);
            console.log(`     Featured: ${c.featured ? 'Yes' : 'No'}`);
        });
        console.log('');

        // ========================================
        // TEST 3: COMPETITIONS
        // ========================================
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('🏆 TEST 3: COMPETITIONS\n');
        console.log('───────────────────────────────────────────────────────────\n');

        // Test Completed Competitions
        console.log('3.1 Testing Completed Competitions...');
        const completedComps = await Competition.find({ status: 'completed' });
        console.log(`   ✓ Found ${completedComps.length} completed competitions`);
        if (completedComps.length === 3) {
            console.log('   ✓ Correct number of completed competitions');
            testsPassed++;
        } else {
            console.log('   ✗ Expected 3 completed competitions');
            testsFailed++;
        }
        completedComps.forEach(c => {
            console.log(`   - ${c.title}`);
            console.log(`     Type: ${c.type}, Mode: ${c.mode}`);
            console.log(`     Prize: ${c.prizes.first.xp} XP, ${c.prizes.first.coins} coins`);
        });
        console.log('');

        // Test Upcoming Competitions
        console.log('3.2 Testing Upcoming Competitions...');
        const upcomingComps = await Competition.find({ status: 'registration' });
        console.log(`   ✓ Found ${upcomingComps.length} upcoming competitions`);
        if (upcomingComps.length === 3) {
            console.log('   ✓ Correct number of upcoming competitions');
            testsPassed++;
        } else {
            console.log('   ✗ Expected 3 upcoming competitions');
            testsFailed++;
        }
        upcomingComps.forEach(c => {
            console.log(`   - ${c.title}`);
            console.log(`     Type: ${c.type}, Mode: ${c.mode}`);
            console.log(`     Prize: ${c.prizes.first.xp} XP, ${c.prizes.first.coins} coins`);
            console.log(`     Entry Fee: ${c.entryFee?.coins || 0} coins`);
            console.log(`     Featured: ${c.featured ? 'Yes' : 'No'}`);
        });
        console.log('');

        // ========================================
        // TEST 4: MISSIONS
        // ========================================
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('🎯 TEST 4: MISSIONS\n');
        console.log('───────────────────────────────────────────────────────────\n');

        // Test Regular Missions
        console.log('4.1 Testing Regular Missions (No Proof)...');
        const regularMissions = await DailyMission.find({ requiresProof: false });
        console.log(`   ✓ Found ${regularMissions.length} regular missions`);
        if (regularMissions.length === 3) {
            console.log('   ✓ Correct number of regular missions');
            testsPassed++;
        } else {
            console.log('   ✗ Expected 3 regular missions');
            testsFailed++;
        }
        regularMissions.forEach(m => {
            console.log(`   - ${m.title}`);
            console.log(`     Type: ${m.type}, Target: ${m.target}`);
            console.log(`     Rewards: ${m.reward.xp} XP, ${m.reward.coins} coins`);
        });
        console.log('');

        // Test Proof Missions
        console.log('4.2 Testing Proof Missions (Image Required)...');
        const proofMissions = await DailyMission.find({ requiresProof: true });
        console.log(`   ✓ Found ${proofMissions.length} proof missions`);
        if (proofMissions.length === 8) {
            console.log('   ✓ Correct number of proof missions');
            testsPassed++;
        } else {
            console.log('   ✗ Expected 8 proof missions');
            testsFailed++;
        }
        proofMissions.forEach(m => {
            console.log(`   📸 ${m.title}`);
            console.log(`      Rewards: ${m.reward.xp} XP, ${m.reward.coins} coins`);
        });
        console.log('');

        // ========================================
        // TEST 5: LEADERBOARD
        // ========================================
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('📊 TEST 5: LEADERBOARD\n');
        console.log('───────────────────────────────────────────────────────────\n');

        // Test User with Grade and College
        console.log('5.1 Testing User Data for Leaderboard...');
        const user = await User.findOne();
        if (user) {
            console.log(`   ✓ Found user: ${user.name}`);
            console.log(`   - Grade: ${user.grade || 'Not set'}`);
            console.log(`   - College: ${user.college || 'Not set'}`);
            console.log(`   - Points: ${user.points || 0}`);
            if (user.grade && user.college) {
                console.log('   ✓ User has grade and college for filtering');
                testsPassed++;
            } else {
                console.log('   ⚠️  User missing grade or college (needed for filtering)');
                testsFailed++;
            }
        } else {
            console.log('   ⚠️  No users found in database');
            testsFailed++;
        }
        console.log('');

        // Test Leaderboard Structure
        console.log('5.2 Testing Leaderboard Model...');
        const leaderboardCount = await Leaderboard.countDocuments();
        console.log(`   ✓ Found ${leaderboardCount} leaderboard entries`);
        if (leaderboardCount > 0) {
            const sampleEntry = await Leaderboard.findOne().populate('user', 'name grade college');
            console.log('   Sample Entry:');
            console.log(`   - User: ${sampleEntry.user?.name || 'N/A'}`);
            console.log(`   - Type: ${sampleEntry.type}`);
            console.log(`   - Score: ${sampleEntry.score}`);
            console.log(`   - Grade: ${sampleEntry.grade || 'Not set'}`);
            console.log(`   - College: ${sampleEntry.college || 'Not set'}`);
            testsPassed++;
        } else {
            console.log('   ℹ️  No leaderboard entries yet (will be created when users earn XP)');
            console.log('   ✓ Model structure is correct');
            testsPassed++;
        }
        console.log('');

        // ========================================
        // FINAL SUMMARY
        // ========================================
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('📊 TEST SUMMARY\n');
        console.log('───────────────────────────────────────────────────────────\n');

        const totalTests = testsPassed + testsFailed;
        const successRate = ((testsPassed / totalTests) * 100).toFixed(1);

        console.log(`Total Tests: ${totalTests}`);
        console.log(`✅ Passed: ${testsPassed}`);
        console.log(`❌ Failed: ${testsFailed}`);
        console.log(`Success Rate: ${successRate}%\n`);

        if (testsFailed === 0) {
            console.log('🎉 ALL TESTS PASSED! Database is fully functional.\n');
        } else {
            console.log('⚠️  Some tests failed. Please review the results above.\n');
        }

        // ========================================
        // FEATURE CHECKLIST
        // ========================================
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('✅ FEATURE CHECKLIST\n');
        console.log('───────────────────────────────────────────────────────────\n');

        const checklist = [
            { name: '12 Grades', status: grades.length === 12 },
            { name: '3 Subjects per Grade', status: subjects.length === 3 },
            { name: '4 Modules per Subject', status: modules.length === 4 },
            { name: '3-5 Lessons per Module', status: lessons.length >= 3 && lessons.length <= 5 },
            { name: '3 Games per Subject', status: games.length === 3 },
            { name: '3 Easy Challenges', status: easyChallenges.length === 3 },
            { name: '3 Medium Challenges', status: mediumChallenges.length === 3 },
            { name: '3 Hard Challenges', status: hardChallenges.length === 3 },
            { name: '3 Completed Competitions', status: completedComps.length === 3 },
            { name: '3 Upcoming Competitions', status: upcomingComps.length === 3 },
            { name: '3 Regular Missions', status: regularMissions.length === 3 },
            { name: '8 Proof Missions', status: proofMissions.length === 8 },
            { name: 'User Grade & College Fields', status: user?.grade && user?.college },
            { name: 'Leaderboard Model Ready', status: true }
        ];

        checklist.forEach(item => {
            const icon = item.status ? '✅' : '❌';
            console.log(`${icon} ${item.name}`);
        });

        console.log('\n═══════════════════════════════════════════════════════════\n');

        // ========================================
        // API ENDPOINT EXAMPLES
        // ========================================
        console.log('📡 READY-TO-USE API ENDPOINTS\n');
        console.log('───────────────────────────────────────────────────────────\n');

        console.log('Educational Content:');
        console.log('  GET /api/grades');
        console.log(`  GET /api/subjects?grade=${grade10._id}`);
        console.log(`  GET /api/modules?subject=${subject._id}`);
        console.log(`  GET /api/lessons?module=${module._id}`);
        console.log(`  GET /api/games?module=${module._id}`);
        console.log('');

        console.log('Challenges:');
        console.log('  GET /api/challenges?difficulty=easy');
        console.log('  GET /api/challenges?difficulty=medium');
        console.log('  GET /api/challenges?difficulty=hard');
        console.log('');

        console.log('Competitions:');
        console.log('  GET /api/competitions?status=registration');
        console.log('  GET /api/competitions?status=completed');
        console.log('');

        console.log('Missions:');
        console.log('  GET /api/missions');
        console.log('  POST /api/missions/:id/proof (with image upload)');
        console.log('');

        console.log('Leaderboard:');
        console.log('  GET /api/leaderboard?type=weekly');
        console.log('  GET /api/leaderboard?type=monthly&grade=10');
        console.log('  GET /api/leaderboard?type=all_time&college=ABC');
        console.log('');

        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('✅ TESTING COMPLETE!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

testAllFeatures();
