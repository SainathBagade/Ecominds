// tests/integration/missions.test.js
const request = require('supertest');
const app = require('../../server/server');

describe('Integration: Missions System', () => {
  let userId;
  let missionId;

  beforeAll(async () => {
    // Create a test user
    const userResponse = await request(app)
      .post('/api/users/register')
      .send({
        username: 'missions_test_' + Date.now(),
        email: `missions${Date.now()}@test.com`,
        password: 'Test@123',
        grade: '10th'
      });
    userId = userResponse.body.user.user_id;
  });

  describe('Mission CRUD Operations', () => {
    it('should create a mission', async () => {
      const response = await request(app)
        .post('/api/missions')
        .send({
          title: 'Complete 5 Quizzes',
          description: 'Complete 5 quizzes to earn points',
          type: 'daily',
          target_count: 5,
          xp_reward: 200,
          points_reward: 100
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.mission).toHaveProperty('mission_id');
      missionId = response.body.mission.mission_id;
    });

    it('should get all missions', async () => {
      const response = await request(app).get('/api/missions');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.missions)).toBe(true);
    });

    it('should get mission by ID', async () => {
      const response = await request(app)
        .get(`/api/missions/${missionId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.mission.mission_id).toBe(missionId);
    });

    it('should get daily missions', async () => {
      const response = await request(app)
        .get('/api/missions/daily');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.missions)).toBe(true);
    });
  });

  describe('User Mission Progress', () => {
    it('should get user missions', async () => {
      const response = await request(app)
        .get(`/api/missions/user/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.missions)).toBe(true);
    });

    it('should update mission progress', async () => {
      const response = await request(app)
        .post('/api/missions/progress')
        .send({
          user_id: userId,
          mission_id: missionId,
          progress: 3
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.progress).toHaveProperty('current_progress');
    });

    it('should complete a mission', async () => {
      const response = await request(app)
        .post(`/api/missions/${missionId}/complete`)
        .send({
          user_id: userId
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.mission_completed).toBe(true);
      expect(response.body).toHaveProperty('xp_earned');
      expect(response.body).toHaveProperty('points_earned');
    });

    it('should not allow completing same mission twice', async () => {
      const response = await request(app)
        .post(`/api/missions/${missionId}/complete`)
        .send({
          user_id: userId
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already completed');
    });
  });

  describe('Mission Types', () => {
    it('should create weekly mission', async () => {
      const response = await request(app)
        .post('/api/missions')
        .send({
          title: 'Weekly Challenge',
          description: 'Complete 20 lessons this week',
          type: 'weekly',
          target_count: 20,
          xp_reward: 500,
          points_reward: 300
        });

      expect(response.status).toBe(201);
      expect(response.body.mission.type).toBe('weekly');
    });

    it('should create special mission', async () => {
      const response = await request(app)
        .post('/api/missions')
        .send({
          title: 'Special Event',
          description: 'Complete special event challenge',
          type: 'special',
          target_count: 1,
          xp_reward: 1000,
          points_reward: 500
        });

      expect(response.status).toBe(201);
      expect(response.body.mission.type).toBe('special');
    });
  });

  describe('Mission Statistics', () => {
    it('should get mission completion statistics', async () => {
      const response = await request(app)
        .get('/api/missions/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.statistics).toHaveProperty('total_missions');
      expect(response.body.statistics).toHaveProperty('active_missions');
      expect(response.body.statistics).toHaveProperty('completed_count');
    });

    it('should get user mission statistics', async () => {
      const response = await request(app)
        .get(`/api/missions/user/${userId}/stats`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('total_completed');
      expect(response.body).toHaveProperty('total_xp_earned');
    });
  });

  describe('Mission Management (Admin)', () => {
    it('should update mission', async () => {
      const response = await request(app)
        .put(`/api/missions/${missionId}`)
        .send({
          title: 'Updated Mission Title',
          xp_reward: 300
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.mission.title).toBe('Updated Mission Title');
    });

    it('should deactivate mission', async () => {
      const response = await request(app)
        .put(`/api/missions/${missionId}`)
        .send({
          is_active: false
        });

      expect(response.status).toBe(200);
      expect(response.body.mission.is_active).toBe(false);
    });

    it('should delete mission', async () => {
      const response = await request(app)
        .delete(`/api/missions/${missionId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});