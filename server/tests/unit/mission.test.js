// tests/unit/mission.test.js
const { 
  calculateMissionProgress, 
  checkMissionCompletion,
  getMissionRewards 
} = require('../../server/services/mission.service');

describe('Unit: Mission Service', () => {
  
  describe('Mission Progress Calculation', () => {
    it('should calculate progress percentage correctly', () => {
      const mission = { target_count: 10 };
      const currentProgress = 5;

      const result = calculateMissionProgress(mission, currentProgress);

      expect(result.percentage).toBe(50);
      expect(result.remaining).toBe(5);
      expect(result.completed).toBe(false);
    });

    it('should mark mission as completed when target reached', () => {
      const mission = { target_count: 10 };
      const currentProgress = 10;

      const result = calculateMissionProgress(mission, currentProgress);

      expect(result.percentage).toBe(100);
      expect(result.remaining).toBe(0);
      expect(result.completed).toBe(true);
    });

    it('should handle over-completion', () => {
      const mission = { target_count: 10 };
      const currentProgress = 15;

      const result = calculateMissionProgress(mission, currentProgress);

      expect(result.percentage).toBe(100);
      expect(result.completed).toBe(true);
    });

    it('should handle zero progress', () => {
      const mission = { target_count: 10 };
      const currentProgress = 0;

      const result = calculateMissionProgress(mission, currentProgress);

      expect(result.percentage).toBe(0);
      expect(result.remaining).toBe(10);
      expect(result.completed).toBe(false);
    });
  });

  describe('Mission Completion Check', () => {
    it('should return true when mission is completed', () => {
      const mission = { target_count: 5 };
      const progress = 5;

      const isCompleted = checkMissionCompletion(mission, progress);

      expect(isCompleted).toBe(true);
    });

    it('should return false when mission is not completed', () => {
      const mission = { target_count: 5 };
      const progress = 3;

      const isCompleted = checkMissionCompletion(mission, progress);

      expect(isCompleted).toBe(false);
    });

    it('should handle daily mission type', () => {
      const mission = { 
        target_count: 3,
        type: 'daily'
      };
      const progress = 3;

      const isCompleted = checkMissionCompletion(mission, progress);

      expect(isCompleted).toBe(true);
    });

    it('should handle weekly mission type', () => {
      const mission = { 
        target_count: 20,
        type: 'weekly'
      };
      const progress = 20;

      const isCompleted = checkMissionCompletion(mission, progress);

      expect(isCompleted).toBe(true);
    });
  });

  describe('Mission Rewards Calculation', () => {
    it('should calculate basic rewards', () => {
      const mission = {
        xp_reward: 100,
        points_reward: 50
      };

      const rewards = getMissionRewards(mission);

      expect(rewards.xp).toBe(100);
      expect(rewards.points).toBe(50);
    });

    it('should apply bonus for streak completion', () => {
      const mission = {
        xp_reward: 100,
        points_reward: 50
      };
      const userStreak = 7; // 7 day streak

      const rewards = getMissionRewards(mission, userStreak);

      expect(rewards.xp).toBeGreaterThan(100);
      expect(rewards.bonus_applied).toBe(true);
      expect(rewards.streak_bonus).toBeDefined();
    });

    it('should apply multiplier for special missions', () => {
      const mission = {
        xp_reward: 100,
        points_reward: 50,
        type: 'special',
        multiplier: 2
      };

      const rewards = getMissionRewards(mission);

      expect(rewards.xp).toBe(200);
      expect(rewards.points).toBe(100);
    });

    it('should handle missions with no rewards', () => {
      const mission = {
        xp_reward: 0,
        points_reward: 0
      };

      const rewards = getMissionRewards(mission);

      expect(rewards.xp).toBe(0);
      expect(rewards.points).toBe(0);
    });
  });

  describe('Mission Type Validation', () => {
    const { validateMissionType } = require('../../server/utils/validators');

    it('should accept valid mission types', () => {
      expect(validateMissionType('daily')).toBe(true);
      expect(validateMissionType('weekly')).toBe(true);
      expect(validateMissionType('special')).toBe(true);
    });

    it('should reject invalid mission types', () => {
      expect(validateMissionType('invalid')).toBe(false);
      expect(validateMissionType('')).toBe(false);
      expect(validateMissionType(null)).toBe(false);
    });
  });

  describe('Mission Reset Logic', () => {
    const { shouldResetMission } = require('../../server/services/mission.service');

    it('should reset daily missions after 24 hours', () => {
      const mission = { type: 'daily' };
      const lastReset = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago

      const shouldReset = shouldResetMission(mission, lastReset);

      expect(shouldReset).toBe(true);
    });

    it('should not reset daily missions before 24 hours', () => {
      const mission = { type: 'daily' };
      const lastReset = new Date(Date.now() - 12 * 60 * 60 * 1000); // 12 hours ago

      const shouldReset = shouldResetMission(mission, lastReset);

      expect(shouldReset).toBe(false);
    });

    it('should reset weekly missions after 7 days', () => {
      const mission = { type: 'weekly' };
      const lastReset = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 days ago

      const shouldReset = shouldResetMission(mission, lastReset);

      expect(shouldReset).toBe(true);
    });

    it('should never reset special missions', () => {
      const mission = { type: 'special' };
      const lastReset = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago

      const shouldReset = shouldResetMission(mission, lastReset);

      expect(shouldReset).toBe(false);
    });
  });

  describe('Mission Priority Calculation', () => {
    const { calculateMissionPriority } = require('../../server/services/mission.service');

    it('should prioritize missions close to completion', () => {
      const mission1 = { target_count: 10, current_progress: 9 };
      const mission2 = { target_count: 10, current_progress: 5 };

      const priority1 = calculateMissionPriority(mission1);
      const priority2 = calculateMissionPriority(mission2);

      expect(priority1).toBeGreaterThan(priority2);
    });

    it('should prioritize higher XP rewards', () => {
      const mission1 = { xp_reward: 500, current_progress: 5, target_count: 10 };
      const mission2 = { xp_reward: 100, current_progress: 5, target_count: 10 };

      const priority1 = calculateMissionPriority(mission1);
      const priority2 = calculateMissionPriority(mission2);

      expect(priority1).toBeGreaterThan(priority2);
    });

    it('should prioritize special missions', () => {
      const mission1 = { type: 'special', xp_reward: 100 };
      const mission2 = { type: 'daily', xp_reward: 100 };

      const priority1 = calculateMissionPriority(mission1);
      const priority2 = calculateMissionPriority(mission2);

      expect(priority1).toBeGreaterThan(priority2);
    });
  });
});