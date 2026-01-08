# 🛠️ EcoMinds Backend Debugging Guide

This document provides a structured approach to debugging the backend of the EcoMinds application.

## 📁 Backend Architecture Overview
- **Entry Point**: `server.js` (Initializes everything)
- **Database**: MongoDB (via `config/database.js`)
- **Routing**: `routes/*.js` (Maps URLs to logic)
- **Logic**: `controllers/*.js` (Handles data processing)
- **Schemata**: `models/*.js` (Defines data structures)
- **Security**: `middleware/auth.js` (JWT & Role checking)

---

## 🚀 Quick Start Debugging
If the server isn't working as expected, follow these steps:

### 1. Check Server Connection
- **Command**: `npm run dev` (from `project-root/server`)
- **Check**: Look for `🚀 Server running on port 5000` and `✅ Database connected` in the console.
- **Fail Case**: If it says `Address already in use`, kill the process on port 5000 or change the `PORT` in `.env`.

### 2. Verify Database Connection
- **Check**: Is the `MONGODB_URI` in `.env` correct?
- **Try**: Run `node verifyDatabase.js` to check if you can query models.
- **Common Issue**: IP Whitelisting on MongoDB Atlas. Ensure your current IP is allowed.

### 3. API Health Check
- Open your browser or use Postman to hit: `http://localhost:5000/health`
- Expected: `{ "status": "OK", "timestamp": "...", "uptime": "..." }`

---

## 🔍 Common Issues & Fixes

### ❌ Authentication Errors (401/403)
*   **Issue**: User cannot login or access protected routes.
*   **Check**: 
    1. Is the `JWT_SECRET` consistent between login and verification?
    2. Is the `Authorization` header sent as `Bearer <token>`?
    3. Is the token expired? (Check `jwt.js` config).

### ❌ 404 Route Not Found
*   **Check**: Go to `server.js`. Is the route file registered in the `routeFiles` array?
*   **Check**: Ensure the suffix in the route file (e.g., `/api/users`) matches your request URL.

### ❌ Data Missing in UI
*   **Check**: If quizzes or lessons aren't showing up, run the seeder: `node scripts/seeders/seeder.js`.
*   **Check**: Use MongoDB Compass to see if the `lessons` or `quizzes` collection has documents.

### ❌ "Failed to load challenges"
*   **Check**: Inspect `controllers/challengeController.js`.
*   **Debug**: Add `console.log(error)` in the `catch` block to see the exact Mongoose error.

---

## 🛠️ Useful Debugging Scripts
Run these from the `server` directory:
- `node scripts/tools/diagnose.js`: Performs a full system health check.
- `node scripts/tools/checkMyRank.js`: Debugs leaderboard ranking issues for a specific user.
- `node scripts/tools/testAPI.js`: Runs automated tests against major endpoints.
- `node scripts/tools/fixAllMissingLeaderboards.js`: Recomputes leaderboard data if it gets out of sync.

---

## 📝 Logging Best Practices
*   Use `console.log("DEBUG [Module]:", data)` only during active development.
*   Check `server.js` Error Handler (line 159) for global error logging.
---
*Last Updated: January 2026*
