// tests/e2e/userFlow.test.js
const request = require('supertest');
const app = require('../../server/server');

describe('E2E: Complete User Flow', () => {
  let authToken;
  let userId;
  let quizId;

  // Test 1: User Registration
  describe('User Registration & Authentication', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          username: 'testuser_' + Date.now(),
          email: `test${Date.now()}@example.com`,
          password: 'Test@123',
          grade: '10th'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toHaveProperty('user_id');
      expect(response.body.user.xp).toBe(0);
      expect(response.body.user.level).toBe(1);
      
      userId = response.body.user.user_id;
    });

    it('should login the user', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: `test${Date.now()}@example.com`,
          password: 'Test@123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('token');
      
      authToken = response.body.token;
    });
  });

  // Test 2: Complete a Quiz
  describe('Quiz Completion Flow', () => {
    it('should get available quizzes', async () => {
      const response = await request(app)
        .get('/api/quizzes')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.quizzes)).toBe(true);
      
      if (response.body.quizzes.length > 0) {
        quizId = response.body.quizzes[0].quiz_id;
      }
    });

    it('should submit quiz and earn XP', async () => {
      const response = await request(app)
        .post('/api/submissions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          user_id: userId,
          quiz_id: quizId,
          answers: [
            { question_id: 1, selected_option: 'A' },
            { question_id: 2, selected_option: 'B' }
          ]
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.submission).toHaveProperty('score');
      expect(response.body.xp_earned).toBeGreaterThan(0);
    });
  });

  // Test 3: Check Gamification Updates
  describe('Gamification System', () => {
    it('should show updated user profile with XP', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.xp).toBeGreaterThan(0);
      expect(response.body.user.level).toBeGreaterThanOrEqual(1);
    });

    it('should check for earned badges', async () => {
      const response = await request(app)
        .get(`/api/badges/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.badges)).toBe(true);
    });

    it('should check leaderboard position', async () => {
      const response = await request(app)
        .get('/api/ecopoints/leaderboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.leaderboard)).toBe(true);
    });
  });

  // Test 4: Daily Streak
  describe('Streak System', () => {
    it('should update user streak on login', async () => {
      const response = await request(app)
        .post('/api/users/checkin')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ user_id: userId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.current_streak).toBeGreaterThanOrEqual(1);
    });
  });
});