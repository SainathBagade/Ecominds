// server/config/scheduler.js
import cron from 'node-cron';
import dailyMissionResetJob from '../jobs/dailyMissionReset.job.js';
import streakCheckJob from '../jobs/streakCheck.job.js';
import leaderboardUpdateJob from '../jobs/leaderboardUpdate.job.js';
import achievementCheckJob from '../jobs/achievementCheck.job.js';

//step 1 -initialize an empty list to store all cron jobs
class Scheduler {
  constructor() {
    this.jobs = [];
  }

  //step 2
  start() {
    console.log('🕐 Starting cron scheduler...');


    //step 3
    // Daily Mission Reset - Runs at midnight (00:00)
    const missionResetTask = cron.schedule('0 0 * * *', async () => {
      console.log('⏰ [CRON] Running Daily Mission Reset...');
      try {
        await dailyMissionResetJob();
        console.log('✅ [CRON] Daily Mission Reset completed');
      } catch (error) {
        console.error('❌ [CRON] Daily Mission Reset failed:', error);
      }
    }, {
      timezone: "UTC"
    });

    // Streak Check - Runs at 2:00 AM daily
    const streakCheckTask = cron.schedule('0 2 * * *', async () => {
      console.log('⏰ [CRON] Running Streak Check...');
      try {
        await streakCheckJob();
        console.log('✅ [CRON] Streak Check completed');
      } catch (error) {
        console.error('❌ [CRON] Streak Check failed:', error);
      }
    }, {
      timezone: "UTC"
    });

    // Leaderboard Update - Runs every hour
    const leaderboardTask = cron.schedule('0 * * * *', async () => {
      console.log('⏰ [CRON] Running Leaderboard Update...');
      try {
        await leaderboardUpdateJob();
        console.log('✅ [CRON] Leaderboard Update completed');
      } catch (error) {
        console.error('❌ [CRON] Leaderboard Update failed:', error);
      }
    }, {
      timezone: "UTC"
    });

    // Achievement Check - Runs every hour
    const achievementTask = cron.schedule('0 * * * *', async () => {
      console.log('⏰ [CRON] Running Achievement Check...');
      try {
        await achievementCheckJob();
        console.log('✅ [CRON] Achievement Check completed');
      } catch (error) {
        console.error('❌ [CRON] Achievement Check failed:', error);
      }
    }, {
      timezone: "UTC"
    });

    //step 4
    this.jobs = [
      { name: 'Daily Mission Reset', task: missionResetTask, schedule: '0 0 * * *' },
      { name: 'Streak Check', task: streakCheckTask, schedule: '0 2 * * *' },
      { name: 'Leaderboard Update', task: leaderboardTask, schedule: '0 * * * *' },
      { name: 'Achievement Check', task: achievementTask, schedule: '0 * * * *' }
    ];

    console.log('✅ Scheduler started with jobs:');
    this.jobs.forEach(job => {
      console.log(`   - ${job.name} (${job.schedule})`);
    });
  }

  //step 5

  stop() {
    console.log('🛑 Stopping all cron jobs...');
    this.jobs.forEach(job => {
      job.task.stop();
      console.log(`   - Stopped: ${job.name}`);
    });
  }

  //step 6
  // Manual trigger for testing
  async runJob(jobName) {
    const jobMap = {
      'mission-reset': dailyMissionResetJob,
      'streak-check': streakCheckJob,
      'leaderboard': leaderboardUpdateJob,
      'achievement': achievementCheckJob
    };

    const job = jobMap[jobName];
    if (!job) {
      throw new Error(`Job not found: ${jobName}`);
    }

    console.log(`🔧 Manually running: ${jobName}`);
    await job();
    console.log(`✅ Manual job completed: ${jobName}`);
  }
}

//step 7
export default new Scheduler();