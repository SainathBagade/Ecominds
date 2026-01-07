const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();
console.log("✅ Environment variables loaded");

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
console.log("✅ Middleware configured");

// Welcome Route - Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎉 Welcome to EcoMinds API!',
    status: 'Server is running successfully',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      register: '/api/users/register',
      login: '/api/users/login',
      ecopoints: '/api/ecopoints',
      badges: '/api/badges',
      achievements: '/api/achievements'
    },
    documentation: 'Visit /api/docs for API documentation'
  });
});

// API Info Route
app.get('/api', (req, res) => {
  res.json({
    message: 'EcoMinds API',
    version: '1.0.0',
    availableRoutes: [
      // User Routes
      { method: 'POST', path: '/api/users/register', description: 'Register new user' },
      { method: 'POST', path: '/api/users/login', description: 'Login user' },
      { method: 'GET', path: '/api/users', description: 'Get all users' },
      { method: 'GET', path: '/api/users/:id', description: 'Get user by ID' },
      { method: 'PUT', path: '/api/users/:id', description: 'Update user' },
      { method: 'DELETE', path: '/api/users/:id', description: 'Delete user' },

      // Gamification Routes - EcoPoints
      { method: 'GET', path: '/api/ecopoints/leaderboard', description: 'Get leaderboard' },
      { method: 'GET', path: '/api/ecopoints/user/:userId', description: 'Get user points history' },
      { method: 'GET', path: '/api/ecopoints/user/:userId/summary', description: 'Get points summary' },
      { method: 'POST', path: '/api/ecopoints/award', description: 'Award points (Admin)' },

      // Gamification Routes - Badges
      { method: 'GET', path: '/api/badges', description: 'Get all badges' },
      { method: 'GET', path: '/api/badges/:badgeId', description: 'Get badge by ID' },
      { method: 'GET', path: '/api/badges/user/:userId', description: 'Get user badges' },
      { method: 'GET', path: '/api/badges/user/:userId/eligible', description: 'Check badge eligibility' },
      { method: 'POST', path: '/api/badges', description: 'Create badge (Admin)' },
      { method: 'POST', path: '/api/badges/award', description: 'Award badge (Admin)' },
      { method: 'PUT', path: '/api/badges/:badgeId', description: 'Update badge (Admin)' },
      { method: 'DELETE', path: '/api/badges/:badgeId', description: 'Delete badge (Admin)' },

      // Gamification Routes - Achievements
      { method: 'GET', path: '/api/achievements', description: 'Get all achievements' },
      { method: 'GET', path: '/api/achievements/stats', description: 'Get achievement statistics' },
      { method: 'GET', path: '/api/achievements/:achievementId', description: 'Get achievement by ID' },
      { method: 'GET', path: '/api/achievements/user/:userId', description: 'Get user achievements' },
      { method: 'POST', path: '/api/achievements', description: 'Create achievement (Admin)' },
      { method: 'POST', path: '/api/achievements/progress', description: 'Update achievement progress' },
      { method: 'POST', path: '/api/achievements/unlock', description: 'Unlock achievement (Admin)' },
      { method: 'PUT', path: '/api/achievements/:achievementId', description: 'Update achievement (Admin)' },
      { method: 'DELETE', path: '/api/achievements/:achievementId', description: 'Delete achievement (Admin)' }
    ]
  });
});

// Health Check Route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
// Routes with debugging
const routeFiles = [
  { path: '/api/users', file: './routes/user.routes' },
  { path: '/api/grades', file: './routes/grade.routes' },
  { path: '/api/subjects', file: './routes/subject.routes' },
  { path: '/api/modules', file: './routes/module.routes' },
  { path: '/api/lessons', file: './routes/lesson.routes' },
  { path: '/api/quizzes', file: './routes/quiz.routes' },
  { path: '/api/questions', file: './routes/question.routes' },
  { path: '/api/submissions', file: './routes/submission.routes' },

  // 🎮 Gamification & Features Routes
  { path: '/api/games', file: './routes/game.routes' },
  { path: '/api/gamification', file: './routes/gamification.routes' },
  { path: '/api/challenges', file: './routes/challenge.routes' },
  { path: '/api/competitions', file: './routes/competition.routes' },
  { path: '/api/missions', file: './routes/mission.routes' },
  { path: '/api/notifications', file: './routes/notification.routes' },
  { path: '/api/leaderboard', file: './routes/leaderboard.routes' },
  { path: '/api/progress', file: './routes/progress.routes' },
  { path: '/api/streaks', file: './routes/streak.routes' },

  { path: '/api/ecopoints', file: './routes/ecopoints.routes' },
  { path: '/api/badges', file: './routes/badge.routes' },
  { path: '/api/achievements', file: './routes/achievement.routes' },
  { path: '/api/userbadge', file: './routes/userBadge.routes' },
  { path: '/api/admin', file: './routes/admin.routes' },
  { path: '/api/superadmin', file: './routes/superadmin.routes' }
];

routeFiles.forEach(({ path, file }) => {
  try {
    const route = require(file);
    console.log(`✅ Loading route: ${file}`, typeof route);
    if (typeof route === 'function' || (route && typeof route === 'object')) {
      app.use(path, route);
    } else {
      console.error(`❌ Invalid route export in ${file}:`, route);
    }
  } catch (error) {
    console.error(`❌ Error loading ${file}:`, error.message);
  }
});
console.log("✅ Routes registered");

// 404 Handler - For undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.url}`,
    availableRoutes: [
      'GET /',
      'GET /api',
      'GET /health',
      'POST /api/users/register',
      'POST /api/users/login',
      'GET /api/users',
      'GET /api/ecopoints/leaderboard',
      'GET /api/badges',
      'GET /api/achievements'
    ]
  });
});

// Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  console.log(`📋 API Info at http://localhost:${PORT}/api`);
  console.log(`💚 Health Check at http://localhost:${PORT}/health`);
  console.log(`🎮 Gamification API ready!`);
  console.log(`   - EcoPoints: http://localhost:${PORT}/api/ecopoints`);
  console.log(`   - Badges: http://localhost:${PORT}/api/badges`);
  console.log(`   - Achievements: http://localhost:${PORT}/api/achievements`);
  console.log("💻 Start Building your project!");
});

module.exports = app;
