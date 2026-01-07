const DailyMission = require('../models/DailyMission');
const Challenge = require('../models/Challenge');
const UserProgress = require('../models/UserProgress');

/**
 * Updates daily missions and challenges for a user based on their activities
 * @param {string} userId - ID of the user
 * @param {string} type - Activity type (complete_lessons, earn_xp, perfect_score)
 * @param {number} amount - Amount to increment progress by
 */
const updateDailyMissionProgress = async (userId, type, amount = 1) => {
    try {
        const now = new Date();

        // 1. Update Daily Missions
        const missions = await DailyMission.find({
            user: userId,
            type: type,
            isCompleted: false,
            expiresAt: { $gt: now }
        });

        for (const mission of missions) {
            await mission.updateProgress(amount);
        }

        // 2. Update Challenges
        // Challenge model requirements sometimes use plural (perfect_scores)
        const challengeTypes = [type];
        if (type === 'perfect_score') challengeTypes.push('perfect_scores');

        const challenges = await Challenge.find({
            participants: {
                $elemMatch: {
                    user: userId,
                    isCompleted: false
                }
            },
            'requirements.type': { $in: challengeTypes },
            status: 'active'
        });

        for (const challenge of challenges) {
            const participant = challenge.participants.find(p => p.user.toString() === userId.toString());
            if (participant && !participant.isCompleted) {
                const newProgress = (participant.progress || 0) + amount;
                await challenge.updateProgress(userId, newProgress);
            }
        }
    } catch (error) {
        console.error('Error tracking activity progress:', error);
    }
};

module.exports = {
    updateDailyMissionProgress
};
