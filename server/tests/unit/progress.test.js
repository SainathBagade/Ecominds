// tests/unit/progress.test.js
const { 
  calculateXPProgress,
  calculateLevelProgress,
  getNextLevelRequirement,
  calculateOverallProgress
} = require('../../server/services/progress.service');

describe('Unit: Progress Tracking', () => {
  
  describe('XP Progress Calculation', () => {
    it('should calculate XP needed for next level', () => {
      const currentLevel = 5;
      const currentXP = 2400;

      const progress = calculateXPProgress(currentLevel, currentXP);

      expect(progress).toHaveProperty('current_xp');
      expect(progress).toHaveProperty('next_level_xp');
      expect(progress).toHaveProperty('xp_needed');
      expect(progress).toHaveProperty('progress_percentage');
    });

    it('should return 0% for newly created user', () => {
      const currentLevel = 1;
      const currentXP = 0;

      const progress = calculateXPProgress(currentLevel, currentXP);

      expect(progress.progress_percentage).toBe(0);
      expect(progress.current_level).toBe(1);
    });

    it('should return correct percentage for partial progress', () => {
      const currentLevel = 2;
      const currentXP = 250; // Level 2 requires 400 XP, user has 250

      const progress = calculateXPProgress(currentLevel, currentXP);

      expect(progress.progress_percentage).toBeGreaterThan(0);
      expect(progress.progress_percentage).toBeLessThan(100);
    });

    it('should handle max level correctly', () => {
      const currentLevel = 100;
      const currentXP = 1000000;

      const progress = calculateXPProgress(currentLevel, currentXP);

      expect(progress.is_max_level).toBe(true);
      expect(progress.xp_needed).toBe(0);
    });
  });

  describe('Level Progress Calculation', () => {
    it('should calculate correct level from XP', () => {
      const xp = 2500;

      const level = calculateLevelProgress(xp);

      expect(level).toBeGreaterThan(1);
      expect(typeof level).toBe('number');
    });

    it('should return level 1 for 0 XP', () => {
      const xp = 0;

      const level = calculateLevelProgress(xp);

      expect(level).toBe(1);
    });

    it('should increase level with more XP', () => {
      const xp1 = 100;
      const xp2 = 500;
      const xp3 = 2000;

      const level1 = calculateLevelProgress(xp1);
      const level2 = calculateLevelProgress(xp2);
      const level3 = calculateLevelProgress(xp3);

      expect(level2).toBeGreaterThan(level1);
      expect(level3).toBeGreaterThan(level2);
    });

    it('should use progressive scaling formula', () => {
      // Level formula: sqrt(xp / 100) + 1
      const xp = 900; // Should be level 4 (sqrt(900/100) + 1 = 4)

      const level = calculateLevelProgress(xp);

      expect(level).toBe(4);
    });
  });

  describe('Next Level Requirement', () => {
    it('should calculate XP needed for next level', () => {
      const currentLevel = 5;

      const nextLevelXP = getNextLevelRequirement(currentLevel);

      expect(nextLevelXP).toBeGreaterThan(0);
      expect(typeof nextLevelXP).toBe('number');
    });

    it('should require more XP for higher levels', () => {
      const level5XP = getNextLevelRequirement(5);
      const level10XP = getNextLevelRequirement(10);
      const level20XP = getNextLevelRequirement(20);

      expect(level10XP).toBeGreaterThan(level5XP);
      expect(level20XP).toBeGreaterThan(level10XP);
    });

    it('should return 0 for max level', () => {
      const currentLevel = 100;

      const nextLevelXP = getNextLevelRequirement(currentLevel);

      expect(nextLevelXP).toBe(0);
    });
  });

  describe('Overall Progress Calculation', () => {
    it('should calculate comprehensive progress stats', () => {
      const userData = {
        xp: 1500,
        level: 5,
        achievements_unlocked: 10,
        badges_earned: 5,
        missions_completed: 20,
        current_streak: 7
      };

      const progress = calculateOverallProgress(userData);

      expect(progress).toHaveProperty('level_progress');
      expect(progress).toHaveProperty('achievement_progress');
      expect(progress).toHaveProperty('mission_progress');
      expect(progress).toHaveProperty('streak_progress');
      expect(progress).toHaveProperty('overall_score');
    });

    it('should calculate overall score correctly', () => {
      const userData1 = {
        xp: 100,
        level: 1,
        achievements_unlocked: 0,
        badges_earned: 0,
        missions_completed: 0,
        current_streak: 0
      };

      const userData2 = {
        xp: 10000,
        level: 15,
        achievements_unlocked: 50,
        badges_earned: 30,
        missions_completed: 100,
        current_streak: 30
      };

      const progress1 = calculateOverallProgress(userData1);
      const progress2 = calculateOverallProgress(userData2);

      expect(progress2.overall_score).toBeGreaterThan(progress1.overall_score);
    });
  });

  describe('Progress Milestones', () => {
    const { checkProgressMilestones } = require('../../server/services/progress.service');

    it('should detect XP milestones', () => {
      const oldXP = 900;
      const newXP = 1100;

      const milestones = checkProgressMilestones({ xp: oldXP }, { xp: newXP });

      expect(milestones).toContain('xp_1000');
    });

    it('should detect level up milestone', () => {
      const oldData = { level: 4, xp: 1500 };
      const newData = { level: 5, xp: 2600 };

      const milestones = checkProgressMilestones(oldData, newData);

      expect(milestones).toContain('level_5');
    });

    it('should detect streak milestones', () => {
      const oldData = { current_streak: 6 };
      const newData = { current_streak: 7 };

      const milestones = checkProgressMilestones(oldData, newData);

      expect(milestones).toContain('streak_7');
    });

    it('should return empty array when no milestones reached', () => {
      const oldData = { xp: 100, level: 1, current_streak: 1 };
      const newData = { xp: 150, level: 1, current_streak: 1 };

      const milestones = checkProgressMilestones(oldData, newData);

      expect(milestones).toHaveLength(0);
    });
  });

  describe('Progress Comparison', () => {
    const { compareProgress } = require('../../server/services/progress.service');

    it('should compare two users progress', () => {
      const user1 = { xp: 1000, level: 4, achievements: 5 };
      const user2 = { xp: 2000, level: 6, achievements: 10 };

      const comparison = compareProgress(user1, user2);

      expect(comparison.xp_difference).toBe(1000);
      expect(comparison.level_difference).toBe(2);
      expect(comparison.ahead_user).toBe('user2');
    });

    it('should handle equal progress', () => {
      const user1 = { xp: 1000, level: 4, achievements: 5 };
      const user2 = { xp: 1000, level: 4, achievements: 5 };

      const comparison = compareProgress(user1, user2);

      expect(comparison.xp_difference).toBe(0);
      expect(comparison.ahead_user).toBe('equal');
    });
  });

  describe('Progress Velocity', () => {
    const { calculateProgressVelocity } = require('../../server/services/progress.service');

    it('should calculate XP per day', () => {
      const history = [
        { date: '2024-01-01', xp: 100 },
        { date: '2024-01-02', xp: 200 },
        { date: '2024-01-03', xp: 150 },
        { date: '2024-01-04', xp: 180 }
      ];

      const velocity = calculateProgressVelocity(history);

      expect(velocity).toHaveProperty('avg_xp_per_day');
      expect(velocity.avg_xp_per_day).toBeGreaterThan(0);
    });

    it('should calculate estimated days to next level', () => {
      const currentXP = 1000;
      const targetXP = 2000;
      const avgXPPerDay = 100;

      const velocity = calculateProgressVelocity([], currentXP, targetXP, avgXPPerDay);

      expect(velocity.estimated_days_to_next_level).toBe(10);
    });

    it('should handle zero velocity', () => {
      const history = [];

      const velocity = calculateProgressVelocity(history);

      expect(velocity.avg_xp_per_day).toBe(0);
    });
  });
});