// server/jobs/achievementCheck.job.js
import pool from '../config/database.js';

const achievementCheckJob = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Get all active achievements with their criteria
    const achievementsResult = await client.query(`
      SELECT achievement_id, name, criteria_type, criteria_value, xp_reward, badge_icon
      FROM achievements
      WHERE is_active = true
    `);

    const achievements = achievementsResult.rows;

    if (achievements.length === 0) {
      console.log('No active achievements found');
      await client.query('COMMIT');
      return;
    }

    let totalUnlocked = 0;

    // Check each achievement type
    for (const achievement of achievements) {
      let eligibleUsers = [];

      switch (achievement.criteria_type) {
        case 'xp_milestone':
          // Users who reached XP threshold
          eligibleUsers = await client.query(`
            SELECT u.user_id, u.username, u.xp
            FROM users u
            LEFT JOIN user_achievements ua 
              ON u.user_id = ua.user_id 
              AND ua.achievement_id = $1
            WHERE u.xp >= $2
              AND ua.user_achievement_id IS NULL
              AND u.is_active = true
          `, [achievement.achievement_id, achievement.criteria_value]);
          break;

        case 'level_reached':
          // Users who reached level threshold
          eligibleUsers = await client.query(`
            SELECT u.user_id, u.username, u.level
            FROM users u
            LEFT JOIN user_achievements ua 
              ON u.user_id = ua.user_id 
              AND ua.achievement_id = $1
            WHERE u.level >= $2
              AND ua.user_achievement_id IS NULL
              AND u.is_active = true
          `, [achievement.achievement_id, achievement.criteria_value]);
          break;

        case 'streak_milestone':
          // Users who reached streak threshold
          eligibleUsers = await client.query(`
            SELECT u.user_id, u.username, u.longest_streak
            FROM users u
            LEFT JOIN user_achievements ua 
              ON u.user_id = ua.user_id 
              AND ua.achievement_id = $1
            WHERE u.longest_streak >= $2
              AND ua.user_achievement_id IS NULL
              AND u.is_active = true
          `, [achievement.achievement_id, achievement.criteria_value]);
          break;

        case 'missions_completed':
          // Users who completed X missions
          eligibleUsers = await client.query(`
            SELECT u.user_id, u.username, COUNT(um.user_mission_id) as mission_count
            FROM users u
            INNER JOIN user_missions um 
              ON u.user_id = um.user_id 
              AND um.completed = true
            LEFT JOIN user_achievements ua 
              ON u.user_id = ua.user_id 
              AND ua.achievement_id = $1
            WHERE ua.user_achievement_id IS NULL
              AND u.is_active = true
            GROUP BY u.user_id, u.username
            HAVING COUNT(um.user_mission_id) >= $2
          `, [achievement.achievement_id, achievement.criteria_value]);
          break;

        case 'badges_collected':
          // Users who collected X badges
          eligibleUsers = await client.query(`
            SELECT u.user_id, u.username, COUNT(ub.user_badge_id) as badge_count
            FROM users u
            INNER JOIN user_badges ub ON u.user_id = ub.user_id
            LEFT JOIN user_achievements ua 
              ON u.user_id = ua.user_id 
              AND ua.achievement_id = $1
            WHERE ua.user_achievement_id IS NULL
              AND u.is_active = true
            GROUP BY u.user_id, u.username
            HAVING COUNT(ub.user_badge_id) >= $2
          `, [achievement.achievement_id, achievement.criteria_value]);
          break;

        case 'first_login':
          // Users who logged in (one-time achievement)
          eligibleUsers = await client.query(`
            SELECT u.user_id, u.username
            FROM users u
            LEFT JOIN user_achievements ua 
              ON u.user_id = ua.user_id 
              AND ua.achievement_id = $1
            WHERE u.last_login IS NOT NULL
              AND ua.user_achievement_id IS NULL
              AND u.is_active = true
          `, [achievement.achievement_id]);
          break;
      }

      // Award achievement to eligible users
      if (eligibleUsers.rows && eligibleUsers.rows.length > 0) {
        for (const user of eligibleUsers.rows) {
          // Insert achievement
          await client.query(`
            INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
          `, [user.user_id, achievement.achievement_id]);

          // Award XP bonus
          await client.query(`
            UPDATE users
            SET xp = xp + $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $2
          `, [achievement.xp_reward, user.user_id]);

          // Create notification (optional)
          await client.query(`
            INSERT INTO notifications (user_id, type, title, message, is_read)
            VALUES ($1, 'achievement', $2, $3, false)
          `, [
            user.user_id,
            'Achievement Unlocked! 🏆',
            `You've earned "${achievement.name}" and ${achievement.xp_reward} XP!`
          ]);

          totalUnlocked++;
          console.log(`🏆 User ${user.username}: Unlocked "${achievement.name}" (+${achievement.xp_reward} XP)`);
        }
      }
    }

    await client.query('COMMIT');

    console.log(`\n✅ Achievement Check Summary:`);
    console.log(`   - Achievements checked: ${achievements.length}`);
    console.log(`   - New unlocks: ${totalUnlocked}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error in achievementCheckJob:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default achievementCheckJob;