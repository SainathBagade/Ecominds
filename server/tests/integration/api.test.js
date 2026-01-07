// tests/integration/api.test.js
const request = require('supertest');
const app = require('../../server/server');

describe('Integration: API Endpoints', () => {
  
  // Health Check
  describe('GET /health', () => {
    it('should return server health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
    });
  });

  // API Info
  describe('GET /api', () => {
    it('should return API information', async () => {
      const response = await request(app).get('/api');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('availableRoutes');
      expect(Array.isArray(response.body.availableRoutes)).toBe(true);
    });
  });

  // User Routes
  describe('User API', () => {
    let testUserId;
    const testUser = {
      username: 'integrationtest_' + Date.now(),
      email: `integration${Date.now()}@test.com`,
      password: 'Test@123',
      grade: '10th'
    };

    it('POST /api/users/register - should register a user', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toHaveProperty('user_id');
      testUserId = response.body.user.user_id;
    });

    it('POST /api/users/login - should login user', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('token');
    });

    it('GET /api/users - should get all users', async () => {
      const response = await request(app).get('/api/users');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    it('GET /api/users/:id - should get user by ID', async () => {
      const response = await request(app).get(`/api/users/${testUserId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('user_id', testUserId);
    });
  });

  // Grades Routes
  describe('Grades API', () => {
    let gradeId;

    it('POST /api/grades - should create a grade', async () => {
      const response = await request(app)
        .post('/api/grades')
        .send({
          grade_name: 'Grade 11',
          description: 'Test grade'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      gradeId = response.body.grade.grade_id;
    });

    it('GET /api/grades - should get all grades', async () => {
      const response = await request(app).get('/api/grades');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.grades)).toBe(true);
    });

    it('GET /api/grades/:id - should get grade by ID', async () => {
      const response = await request(app).get(`/api/grades/${gradeId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.grade).toHaveProperty('grade_id', gradeId);
    });
  });

  // Error Handling
  describe('Error Handling', () => {
    it('should return 404 for non-existent route', async () => {
      const response = await request(app).get('/api/nonexistent');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid user ID', async () => {
      const response = await request(app).get('/api/users/invalid');
      
      expect(response.status).toBe(400);
    });
  });
});