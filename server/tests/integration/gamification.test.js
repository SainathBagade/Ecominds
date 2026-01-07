// tests/integration/gamification.test.js
const request = require('supertest');
const app = require('../../server/server');

describe('Integration: Gamification System', () => {
  let userId;
  let badgeId;
  let achievementId;

  beforeAll(async () => {
    // Create a test user
    const userResponse = await request(app)
      .post('/api/users/register')
      .send({
        username: 'gamification_test_' + Date.now(),
        email: `gamification${Date.now()}@test.com`,
        password: 'Test@123',
        grade: '10th'
      });
    userId = userResponse.body.user.user_id;
  });

  // EcoPoints Tests
  describe('EcoPoints System', () => {
    it('should award points to user', async () => {
      const response = await request(app)
        .post('/api/ecopoints/award')
        .send({
          user_id: userId,
          points: 500,
          activity_type: 'quiz_completed',
          description: 'Completed Science Quiz'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.points_awarded).toBe(500);
      expect(response.body.data.total_xp).toBeGreaterThanOrEqual(500);
    });

    it('should get user points history', async () => {
      const response = await request(app)
        .get(`/api/ecopoints/user/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.history)).toBe(true);
      expect(response.body.total_points).toBeGreaterThan(0);
    });

    it('should get user points summary', async () => {
      const response = await request(app)
        .get(`/api/ecopoints/user/${userId}/summary`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('total_xp');
      expect(response.body).toHaveProperty('current_level');
    });

    it('should get leaderboard', async () => {
      const response = await request(app)
        .get('/api/ecopoints/leaderboard');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.leaderboard)).toBe(true);
    });
  });

  // Badges Tests
  describe('Badges System', () => {
    it('should create a badge', async () => {
      const response = await request(app)
        .post('/api/badges')
        .send({
          name: 'Test Badge',
          description: 'Badge for testing',
          icon: '🎯',
          rarity: 'common',
          required_xp: 100
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      badgeId = response.body.badge.badge_id;
    });

    it('should get all badges', async () => {
      const response = await request(app).get('/api/badges');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.badges)).toBe(true);
    });

    it('should get badge by ID', async () => {
      const response = await request(app)
        .get(`/api/badges/${badgeId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.badge.badge_id).toBe(badgeId);
    });

    it('should award badge to user', async () => {
      const response = await request(app)
        .post('/api/badges/award')
        .send({
          user_id: userId,
          badge_id: badgeId
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.badge_id).toBe(badgeId);
    });

    it('should get user badges', async () => {
      const response = await request(app)
        .get(`/api/badges/user/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.badges)).toBe(true);
      expect(response.body.total_badges).toBeGreaterThan(0);
    });

    it('should check badge eligibility', async () => {
      const response = await request(app)
        .get(`/api/badges/user/${userId}/eligible`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.eligible_badges)).toBe(true);
    });

    it('should update badge', async () => {
      const response = await request(app)
        .put(`/api/badges/${badgeId}`)
        .send({
          name: 'Updated Test Badge',
          description: 'Updated description'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.badge.name).toBe('Updated Test Badge');
    });
  });

  // Achievements Tests
  describe('Achievements System', () => {
    it('should create an achievement', async () => {
      const response = await request(app)
        .post('/api/achievements')
        .send({
          name: 'Test Achievement',
          description: 'Achievement for testing',
          criteria_type: 'xp_milestone',
          criteria_value: 1000,
          xp_reward: 100,
          badge_icon: '⭐'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      achievementId = response.body.achievement.achievement_id;
    });

    it('should get all achievements', async () => {
      const response = await request(app)
        .get('/api/achievements');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.achievements)).toBe(true);
    });

    it('should get achievement by ID', async () => {
      const response = await request(app)
        .get(`/api/achievements/${achievementId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.achievement.achievement_id).toBe(achievementId);
    });

    it('should get achievement statistics', async () => {
      const response = await request(app)
        .get('/api/achievements/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.statistics).toHaveProperty('total_achievements');
    });

    it('should unlock achievement for user', async () => {
      const response = await request(app)
        .post('/api/achievements/unlock')
        .send({
          user_id: userId,
          achievement_id: achievementId
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.achievement_id).toBe(achievementId);
    });

    it('should get user achievements', async () => {
      const response = await request(app)
        .get(`/api/achievements/user/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.achievements)).toBe(true);
      expect(response.body.total_achievements).toBeGreaterThan(0);
    });

    it('should update achievement progress', async () => {
      const response = await request(app)
        .post('/api/achievements/progress')
        .send({
          user_id: userId,
          achievement_id: achievementId,
          progress_value: 500
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should update achievement', async () => {
      const response = await request(app)
        .put(`/api/achievements/${achievementId}`)
        .send({
          name: 'Updated Achievement',
          criteria_value: 1500
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  // Level System Tests
  describe('Level System Integration', () => {
    it('should level up user when enough XP is awarded', async () => {
      // Award enough points to level up
      const response = await request(app)
        .post('/api/ecopoints/award')
        .send({
          user_id: userId,
          points: 10000,
          activity_type: 'test',
          description: 'Level up test'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.level_up).toBe(true);
      expect(response.body.data.new_level).toBeGreaterThan(response.body.data.old_level);
    });
  });
});