// server/jobs/dailyMissionReset.job.js
import pool from '../config/database.js';

const dailyMissionResetJob = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Get all users
    const usersResult = await client.query('SELECT user_id FROM users');
    const userIds = usersResult.rows.map(row => row.user_id);

    if (userIds.length === 0) {
      console.log('No users found to reset missions');
      await client.query('COMMIT');
      return;
    }

    // Reset all user mission progress
    await client.query(`
      UPDATE user_missions 
      SET 
        progress = 0,
        completed = false,
        completed_at = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ANY($1)
    `, [userIds]);

    // Get daily missions
    const missionsResult = await client.query(`
      SELECT mission_id 
      FROM missions 
      WHERE type = 'daily' AND is_active = true
    `);

    // Ensure all users have all daily missions
    for (const userId of userIds) {
      for (const mission of missionsResult.rows) {
        await client.query(`
          INSERT INTO user_missions (user_id, mission_id, progress, completed)
          VALUES ($1, $2, 0, false)
          ON CONFLICT (user_id, mission_id) 
          DO UPDATE SET 
            progress = 0, 
            completed = false, 
            completed_at = NULL,
            updated_at = CURRENT_TIMESTAMP
        `, [userId, mission.mission_id]);
      }
    }

    await client.query('COMMIT');
    
    console.log(`✅ Reset missions for ${userIds.length} users`);
    console.log(`✅ Assigned ${missionsResult.rows.length} daily missions`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error in dailyMissionResetJob:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default dailyMissionResetJob;