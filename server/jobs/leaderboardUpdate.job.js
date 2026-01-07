// server/jobs/leaderboardUpdate.job.js
import pool from '../config/database.js';
import { createClient } from 'redis';

// Initialize Redis client (adjust config as needed)
let redisClient;

const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    redisClient.on('error', (err) => {
      console.error('Redis Client Error', err);
    });
    
    await redisClient.connect();
  }
  return redisClient;
};

const leaderboardUpdateJob = async () => {
  const client = await pool.connect();
  
  try {
    // Get top 100 users by XP
    const leaderboardResult = await client.query(`
      SELECT 
        u.user_id,
        u.username,
        u.xp,
        u.level,
        u.current_streak,
        u.avatar_url,
        RANK() OVER (ORDER BY u.xp DESC) as rank
      FROM users u
      WHERE u.is_active = true
      ORDER BY u.xp DESC
      LIMIT 100
    `);

    const leaderboard = leaderboardResult.rows;

    if (leaderboard.length === 0) {
      console.log('No users found for leaderboard');
      return;
    }

    // Try to update Redis cache (optional - graceful fallback if Redis unavailable)
    try {
      const redis = await getRedisClient();
      
      // Store complete leaderboard
      await redis.set(
        'leaderboard:global:top100',
        JSON.stringify(leaderboard),
        { EX: 3600 } // Expire in 1 hour
      );

      // Store individual rank lookups for quick access
      for (const user of leaderboard) {
        await redis.set(
          `leaderboard:rank:${user.user_id}`,
          user.rank.toString(),
          { EX: 3600 }
        );
      }

      console.log('✅ Redis cache updated successfully');
    } catch (redisError) {
      console.warn('⚠️  Redis unavailable, skipping cache update:', redisError.message);
      // Continue without Redis - app can fall back to DB queries
    }

    // Update leaderboard_cache table as fallback
    await client.query('BEGIN');

    // Clear old cache
    await client.query('TRUNCATE TABLE leaderboard_cache');

    // Insert new leaderboard data
    for (const user of leaderboard) {
      await client.query(`
        INSERT INTO leaderboard_cache 
          (user_id, rank, xp, level, current_streak, cached_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      `, [user.user_id, user.rank, user.xp, user.level, user.current_streak]);
    }

    await client.query('COMMIT');

    // Calculate stats
    const totalXP = leaderboard.reduce((sum, user) => sum + parseInt(user.xp), 0);
    const avgXP = Math.round(totalXP / leaderboard.length);
    const topXP = leaderboard[0]?.xp || 0;

    console.log(`\n✅ Leaderboard Update Summary:`);
    console.log(`   - Total users: ${leaderboard.length}`);
    console.log(`   - Top player: ${leaderboard[0]?.username} (${topXP} XP)`);
    console.log(`   - Average XP: ${avgXP}`);
    console.log(`   - Cache updated at: ${new Date().toISOString()}`);

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('❌ Error in leaderboardUpdateJob:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
};

export default leaderboardUpdateJob;