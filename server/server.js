const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();
console.log("✅ Environment variables loaded");

// Database middleware (lazy connection)
const ensureDbConnected = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    next();
  } catch (error) {
    next(error);
  }
};

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(ensureDbConnected);

// URL Normalization Middleware (Crucial for Netlify)
app.use((req, res, next) => {
  const originalUrl = req.url;
  // If request comes through Netlify function, it might have a long prefix
  if (req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '');
    if (!req.url.startsWith('/')) req.url = '/' + req.url;
  }

  // Ensure we consistently handle the /api prefix
  // If the request doesn't start with /api (local dev or direct function hit), we don't change it.
  // But if it was redirected by netlify.toml, it will match our routes below.

  console.log(`🛣️ Route Match: ${req.method} ${originalUrl} -> ${req.url}`);
  next();
});

console.log("✅ Middleware and DB connection configured");


// Development Welcome Route
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    res.json({
      message: '🎉 Welcome to EcoMinds API!',
      status: 'Server is running in Development mode',
      instructions: 'Frontend is running separately'
    });
  });
}

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

// --- 🛠️ UNIVERSAL API ROUTING ---
const mainRouter = express.Router();

// Register all modules into the mainRouter
routeFiles.forEach(({ path: routePath, file }) => {
  try {
    const route = require(file);
    // Strip the '/api' prefix for the internal router match
    const internalPath = routePath.replace('/api', '');
    if (internalPath === '' || internalPath === '/') {
      mainRouter.use('/', route);
    } else {
      mainRouter.use(internalPath, route);
    }
  } catch (error) {
    console.error(`❌ Error loading ${file}:`, error.message);
  }
});

// Mount the Main Router to handle all possible entry points
app.use('/api', mainRouter); // Matches /api/users/register
app.use('/.netlify/functions/api', mainRouter); // Matches internal Netlify path
app.use('/', (req, res, next) => {
  // If request doesn't match a static file, try the mainRouter
  if (req.url !== '/' && !req.url.includes('.')) {
    return mainRouter(req, res, next);
  }
  next();
});

console.log("✅ Universal API Router successfully mounted");

// Serve static files in production (Catch-all MUST be last)
if (process.env.NODE_ENV === 'production') {
  console.log("✅ Production mode: Configuring static assets and catch-all");
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    // If we're here, it means no API route matched
    if (req.path.startsWith('/api')) {
      return res.status(404).json({
        error: 'Not Found',
        message: `API route not found: ${req.method} ${req.url}`
      });
    }
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

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

// Connect to database and start server
if (require.main === module) {
  connectDB().then(() => {
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
  }).catch(err => {
    console.error("❌ Failed to connect to database. Server not started.", err);
    process.exit(1);
  });
}

module.exports = app;
