// server/jobs/streakCheck.job.js
import pool from '../config/database.js';

const streakCheckJob = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Find users whose last login was more than 48 hours ago
    // This means they've broken their streak
    const brokenStreaksResult = await client.query(`
      SELECT 
        user_id, 
        current_streak, 
        streak_freeze_available,
        last_login
      FROM users
      WHERE last_login < NOW() - INTERVAL '48 hours'
        AND current_streak > 0
    `);

    const brokenStreaks = brokenStreaksResult.rows;
    
    if (brokenStreaks.length === 0) {
      console.log('No broken streaks found');
      await client.query('COMMIT');
      return;
    }

    console.log(`Found ${brokenStreaks.length} users with broken streaks`);

    let freezeUsed = 0;
    let streaksReset = 0;

    for (const user of brokenStreaks) {
      if (user.streak_freeze_available > 0) {
        // User has freeze available - consume it and maintain streak
        await client.query(`
          UPDATE users
          SET 
            streak_freeze_available = streak_freeze_available - 1,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1
        `, [user.user_id]);

        // Log the freeze usage
        await client.query(`
          INSERT INTO streak_freeze_logs (user_id, used_at, streak_preserved)
          VALUES ($1, CURRENT_TIMESTAMP, $2)
        `, [user.user_id, user.current_streak]);

        freezeUsed++;
        console.log(`❄️  User ${user.user_id}: Used freeze (${user.streak_freeze_available} -> ${user.streak_freeze_available - 1}), preserved ${user.current_streak} day streak`);

      } else {
        // No freeze available - reset streak
        await client.query(`
          UPDATE users
          SET 
            current_streak = 0,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1
        `, [user.user_id]);

        // Log the streak break
        await client.query(`
          INSERT INTO streak_break_logs (user_id, broken_at, streak_lost)
          VALUES ($1, CURRENT_TIMESTAMP, $2)
        `, [user.user_id, user.current_streak]);

        streaksReset++;
        console.log(`💔 User ${user.user_id}: Streak reset (lost ${user.current_streak} days)`);
      }
    }

    await client.query('COMMIT');
    
    console.log(`\n✅ Streak Check Summary:`);
    console.log(`   - Freezes used: ${freezeUsed}`);
    console.log(`   - Streaks reset: ${streaksReset}`);
    console.log(`   - Total processed: ${brokenStreaks.length}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error in streakCheckJob:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default streakCheckJob;