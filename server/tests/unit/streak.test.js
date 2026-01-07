// tests/unit/streak.test.js
const { 
  calculateStreak,
  shouldBreakStreak,
  shouldConsumeFreeze,
  updateStreak,
  getStreakMultiplier
} = require('../../server/services/streak.service');

describe('Unit: Streak System', () => {
  
  describe('Streak Calculation', () => {
    it('should increment streak for consecutive days', () => {
      const lastLogin = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      const currentStreak = 5;

      const result = calculateStreak(lastLogin, currentStreak);

      expect(result.new_streak).toBe(6);
      expect(result.streak_maintained).toBe(true);
    });

    it('should maintain streak for same day login', () => {
      const lastLogin = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      const currentStreak = 5;

      const result = calculateStreak(lastLogin, currentStreak);

      expect(result.new_streak).toBe(5);
      expect(result.streak_maintained).toBe(true);
    });

    it('should reset streak after 48 hours without freeze', () => {
      const lastLogin = new Date(Date.now() - 50 * 60 * 60 * 1000); // 50 hours ago
      const currentStreak = 5;
      const freezeAvailable = 0;

      const result = calculateStreak(lastLogin, currentStreak, freezeAvailable);

      expect(result.new_streak).toBe(0);
      expect(result.streak_maintained).toBe(false);
      expect(result.streak_broken).toBe(true);
    });

    it('should start new streak for first login', () => {
      const lastLogin = null;
      const currentStreak = 0;

      const result = calculateStreak(lastLogin, currentStreak);

      expect(result.new_streak).toBe(1);
      expect(result.streak_maintained).toBe(true);
    });
  });

  describe('Streak Break Detection', () => {
    it('should detect streak break after 48 hours', () => {
      const lastLogin = new Date(Date.now() - 49 * 60 * 60 * 1000); // 49 hours

      const shouldBreak = shouldBreakStreak(lastLogin);

      expect(shouldBreak).toBe(true);
    });

    it('should not break streak within 48 hours', () => {
      const lastLogin = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours

      const shouldBreak = shouldBreakStreak(lastLogin);

      expect(shouldBreak).toBe(false);
    });

    it('should not break streak for same day', () => {
      const lastLogin = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hour

      const shouldBreak = shouldBreakStreak(lastLogin);

      expect(shouldBreak).toBe(false);
    });
  });

  describe('Freeze Consumption Logic', () => {
    it('should consume freeze when streak would break', () => {
      const lastLogin = new Date(Date.now() - 50 * 60 * 60 * 1000);
      const freezeAvailable = 2;
      const currentStreak = 10;

      const result = shouldConsumeFreeze(lastLogin, freezeAvailable, currentStreak);

      expect(result.should_consume).toBe(true);
      expect(result.freeze_worth_using).toBe(true); // Streak > 0
    });

    it('should not consume freeze if none available', () => {
      const lastLogin = new Date(Date.now() - 50 * 60 * 60 * 1000);
      const freezeAvailable = 0;
      const currentStreak = 10;

      const result = shouldConsumeFreeze(lastLogin, freezeAvailable, currentStreak);

      expect(result.should_consume).toBe(false);
      expect(result.reason).toContain('no freeze');
    });

    it('should not consume freeze if streak not breaking', () => {
      const lastLogin = new Date(Date.now() - 20 * 60 * 60 * 1000);
      const freezeAvailable = 2;
      const currentStreak = 10;

      const result = shouldConsumeFreeze(lastLogin, freezeAvailable, currentStreak);

      expect(result.should_consume).toBe(false);
      expect(result.reason).toContain('not breaking');
    });

    it('should not waste freeze on 0 streak', () => {
      const lastLogin = new Date(Date.now() - 50 * 60 * 60 * 1000);
      const freezeAvailable = 2;
      const currentStreak = 0;

      const result = shouldConsumeFreeze(lastLogin, freezeAvailable, currentStreak);

      expect(result.should_consume).toBe(false);
      expect(result.freeze_worth_using).toBe(false);
    });
  });

  describe('Streak Update Logic', () => {
    it('should update streak with freeze consumption', async () => {
      const userData = {
        user_id: 1,
        current_streak: 10,
        streak_freeze_available: 2,
        last_login: new Date(Date.now() - 50 * 60 * 60 * 1000)
      };

      const result = await updateStreak(userData);

      expect(result.streak_preserved).toBe(true);
      expect(result.freeze_consumed).toBe(true);
      expect(result.new_freeze_count).toBe(1);
      expect(result.current_streak).toBe(10);
    });

    it('should reset streak without freeze', async () => {
      const userData = {
        user_id: 1,
        current_streak: 10,
        streak_freeze_available: 0,
        last_login: new Date(Date.now() - 50 * 60 * 60 * 1000)
      };

      const result = await updateStreak(userData);

      expect(result.streak_preserved).toBe(false);
      expect(result.freeze_consumed).toBe(false);
      expect(result.current_streak).toBe(0);
      expect(result.streak_broken).toBe(true);
    });

    it('should increment streak for daily login', async () => {
      const userData = {
        user_id: 1,
        current_streak: 5,
        streak_freeze_available: 2,
        last_login: new Date(Date.now() - 25 * 60 * 60 * 1000)
      };

      const result = await updateStreak(userData);

      expect(result.current_streak).toBe(6);
      expect(result.streak_incremented).toBe(true);
    });
  });

  describe('Streak Multiplier', () => {
    it('should return 1x for streaks 0-6', () => {
      expect(getStreakMultiplier(0)).toBe(1);
      expect(getStreakMultiplier(3)).toBe(1);
      expect(getStreakMultiplier(6)).toBe(1);
    });

    it('should return 1.5x for 7+ day streak', () => {
      expect(getStreakMultiplier(7)).toBe(1.5);
      expect(getStreakMultiplier(10)).toBe(1.5);
      expect(getStreakMultiplier(13)).toBe(1.5);
    });

    it('should return 2x for 14+ day streak', () => {
      expect(getStreakMultiplier(14)).toBe(2);
      expect(getStreakMultiplier(20)).toBe(2);
      expect(getStreakMultiplier(29)).toBe(2);
    });

    it('should return 3x for 30+ day streak', () => {
      expect(getStreakMultiplier(30)).toBe(3);
      expect(getStreakMultiplier(50)).toBe(3);
      expect(getStreakMultiplier(100)).toBe(3);
    });
  });

  describe('Streak Rewards', () => {
    const { calculateStreakRewards } = require('../../server/services/streak.service');

    it('should calculate rewards with streak multiplier', () => {
      const baseXP = 100;
      const streak = 7;

      const rewards = calculateStreakRewards(baseXP, streak);

      expect(rewards.base_xp).toBe(100);
      expect(rewards.multiplier).toBe(1.5);
      expect(rewards.total_xp).toBe(150);
      expect(rewards.bonus_xp).toBe(50);
    });

    it('should apply no bonus for low streaks', () => {
      const baseXP = 100;
      const streak = 3;

      const rewards = calculateStreakRewards(baseXP, streak);

      expect(rewards.multiplier).toBe(1);
      expect(rewards.total_xp).toBe(100);
      expect(rewards.bonus_xp).toBe(0);
    });

    it('should apply max bonus for 30+ streaks', () => {
      const baseXP = 100;
      const streak = 30;

      const rewards = calculateStreakRewards(baseXP, streak);

      expect(rewards.multiplier).toBe(3);
      expect(rewards.total_xp).toBe(300);
      expect(rewards.bonus_xp).toBe(200);
    });
  });

  describe('Longest Streak Tracking', () => {
    const { updateLongestStreak } = require('../../server/services/streak.service');

    it('should update longest streak when current exceeds it', () => {
      const currentStreak = 15;
      const longestStreak = 10;

      const result = updateLongestStreak(currentStreak, longestStreak);

      expect(result.longest_streak).toBe(15);
      expect(result.new_record).toBe(true);
    });

    it('should not update when current is lower', () => {
      const currentStreak = 8;
      const longestStreak = 15;

      const result = updateLongestStreak(currentStreak, longestStreak);

      expect(result.longest_streak).toBe(15);
      expect(result.new_record).toBe(false);
    });

    it('should handle first streak', () => {
      const currentStreak = 5;
      const longestStreak = 0;

      const result = updateLongestStreak(currentStreak, longestStreak);

      expect(result.longest_streak).toBe(5);
      expect(result.new_record).toBe(true);
    });
  });

  describe('Streak Statistics', () => {
    const { calculateStreakStats } = require('../../server/services/streak.service');

    it('should calculate comprehensive streak stats', () => {
      const streakHistory = [
        { date: '2024-01-01', streak: 1 },
        { date: '2024-01-02', streak: 2 },
        { date: '2024-01-03', streak: 3 },
        { date: '2024-01-04', streak: 0 }, // break
        { date: '2024-01-05', streak: 1 },
        { date: '2024-01-06', streak: 2 }
      ];

      const stats = calculateStreakStats(streakHistory);

      expect(stats).toHaveProperty('total_days');
      expect(stats).toHaveProperty('breaks_count');
      expect(stats).toHaveProperty('average_streak');
      expect(stats).toHaveProperty('longest_streak');
      expect(stats.breaks_count).toBe(1);
    });

    it('should handle perfect streak', () => {
      const streakHistory = [
        { date: '2024-01-01', streak: 1 },
        { date: '2024-01-02', streak: 2 },
        { date: '2024-01-03', streak: 3 }
      ];

      const stats = calculateStreakStats(streakHistory);

      expect(stats.breaks_count).toBe(0);
      expect(stats.perfect_streak).toBe(true);
    });
  });

  describe('Freeze Purchase Logic', () => {
    const { canPurchaseFreeze, calculateFreezeCost } = require('../../server/services/streak.service');

    it('should allow freeze purchase with enough points', () => {
      const userPoints = 1000;
      const freezeCost = 500;

      const canPurchase = canPurchaseFreeze(userPoints, freezeCost);

      expect(canPurchase).toBe(true);
    });

    it('should not allow purchase with insufficient points', () => {
      const userPoints = 300;
      const freezeCost = 500;

      const canPurchase = canPurchaseFreeze(userPoints, freezeCost);

      expect(canPurchase).toBe(false);
    });

    it('should calculate increasing freeze cost', () => {
      const currentFreezeCount = 2;

      const cost = calculateFreezeCost(currentFreezeCount);

      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe('number');
    });

    it('should charge more for additional freezes', () => {
      const cost1 = calculateFreezeCost(2);
      const cost2 = calculateFreezeCost(5);
      const cost3 = calculateFreezeCost(10);

      expect(cost2).toBeGreaterThan(cost1);
      expect(cost3).toBeGreaterThan(cost2);
    });
  });

  describe('Streak Notifications', () => {
    const { getStreakNotification } = require('../../server/services/streak.service');

    it('should generate milestone notification', () => {
      const streak = 7;

      const notification = getStreakNotification(streak);

      expect(notification).toHaveProperty('title');
      expect(notification).toHaveProperty('message');
      expect(notification.type).toBe('milestone');
    });

    it('should generate warning notification before break', () => {
      const hoursSinceLogin = 40;

      const notification = getStreakNotification(null, hoursSinceLogin);

      expect(notification.type).toBe('warning');
      expect(notification.message).toContain('lose streak');
    });

    it('should generate break notification', () => {
      const streakLost = 15;

      const notification = getStreakNotification(null, null, streakLost);

      expect(notification.type).toBe('break');
      expect(notification.message).toContain('broken');
    });

    it('should generate freeze notification', () => {
      const freezeUsed = true;
      const streakPreserved = 10;

      const notification = getStreakNotification(null, null, null, freezeUsed, streakPreserved);

      expect(notification.type).toBe('freeze');
      expect(notification.message).toContain('preserved');
    });
  });
});