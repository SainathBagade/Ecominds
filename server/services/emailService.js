/**
 * Email Service
 * Send emails using nodemailer
 * Note: Requires nodemailer package - run: npm install nodemailer
 */

// const nodemailer = require('nodemailer');

// Create transporter (uncomment when using)
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

/**
 * Send email
 */
const sendEmail = async (to, subject, html, text = null) => {
  try {
    // const mailOptions = {
    //   from: `"EcoMinds" <${process.env.EMAIL_FROM}>`,
    //   to,
    //   subject,
    //   html,
    //   text: text || html.replace(/<[^>]*>/g, ''),
    // };
    
    // const info = await transporter.sendMail(mailOptions);
    // console.log('Email sent:', info.messageId);
    // return info;
    
    console.log(`📧 Email would be sent to: ${to}`);
    console.log(`Subject: ${subject}`);
    return { success: true, messageId: 'placeholder' };
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to EcoMinds!';
  const html = `
    <h1>Welcome to EcoMinds, ${user.name}!</h1>
    <p>We're excited to have you join our environmental learning community.</p>
    <p>Your account has been created successfully. You can now:</p>
    <ul>
      <li>Take quizzes and earn points</li>
      <li>Learn about environmental topics</li>
      <li>Compete on leaderboards</li>
      <li>Earn badges and achievements</li>
    </ul>
    <p>Start your eco-journey today!</p>
    <a href="${process.env.APP_URL}/dashboard" style="background:#4CAF50;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Go to Dashboard</a>
  `;
  
  return sendEmail(user.email, subject, html);
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request';
  const html = `
    <h2>Password Reset Request</h2>
    <p>You requested to reset your password. Click the link below to reset it:</p>
    <a href="${resetUrl}" style="background:#2196F3;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  
  return sendEmail(email, subject, html);
};

/**
 * Send achievement unlocked email
 */
const sendAchievementEmail = async (user, achievement) => {
  const subject = `🏆 Achievement Unlocked: ${achievement.title}`;
  const html = `
    <h1>Congratulations, ${user.name}!</h1>
    <h2>You've unlocked: ${achievement.title}</h2>
    <p>${achievement.description}</p>
    <p><strong>Points Earned:</strong> ${achievement.points}</p>
    <p>Keep up the great work!</p>
    <a href="${process.env.APP_URL}/achievements" style="background:#FFD700;color:#333;padding:10px 20px;text-decoration:none;border-radius:5px;">View All Achievements</a>
  `;
  
  return sendEmail(user.email, subject, html);
};

/**
 * Send badge earned email
 */
const sendBadgeEmail = async (user, badge) => {
  const subject = `🎖️ New Badge Earned: ${badge.name}`;
  const html = `
    <h1>Congratulations, ${user.name}!</h1>
    <h2>You've earned a new badge: ${badge.name}</h2>
    <p>${badge.description}</p>
    <p><strong>Bonus Points:</strong> ${badge.pointsReward}</p>
    <a href="${process.env.APP_URL}/badges" style="background:#9C27B0;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">View All Badges</a>
  `;
  
  return sendEmail(user.email, subject, html);
};

/**
 * Send level up email
 */
const sendLevelUpEmail = async (user, newLevel, title) => {
  const subject = `🎉 Level Up! You're now Level ${newLevel}`;
  const html = `
    <h1>Congratulations, ${user.name}!</h1>
    <h2>You've reached Level ${newLevel}!</h2>
    <p>Your new title: <strong>${title}</strong></p>
    <p>Keep learning and earning to unlock even more!</p>
    <a href="${process.env.APP_URL}/profile" style="background:#FF9800;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">View Profile</a>
  `;
  
  return sendEmail(user.email, subject, html);
};

/**
 * Send streak reminder
 */
const sendStreakReminderEmail = async (user) => {
  const subject = '🔥 Don\'t break your streak!';
  const html = `
    <h2>Hi ${user.name},</h2>
    <p>You're on a <strong>${user.streak}-day streak</strong>! 🔥</p>
    <p>Don't forget to log in today to keep it going.</p>
    <p>Your streak rewards are waiting!</p>
    <a href="${process.env.APP_URL}/login" style="background:#F44336;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Login Now</a>
  `;
  
  return sendEmail(user.email, subject, html);
};

/**
 * Send quiz completed email
 */
const sendQuizCompletedEmail = async (user, quiz, submission) => {
  const passed = submission.isPassed ? 'Passed' : 'Keep Trying';
  const subject = `Quiz ${passed}: ${quiz.title}`;
  const html = `
    <h2>Quiz Completed!</h2>
    <p>Hi ${user.name},</p>
    <p>You completed: <strong>${quiz.title}</strong></p>
    <p><strong>Score:</strong> ${submission.percentage}%</p>
    <p><strong>Points Earned:</strong> ${submission.pointsEarned}</p>
    ${submission.isPassed 
      ? '<p style="color:green;">✅ Congratulations! You passed!</p>' 
      : '<p style="color:orange;">Keep practicing, you can do it!</p>'}
    <a href="${process.env.APP_URL}/quizzes" style="background:#4CAF50;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Take Another Quiz</a>
  `;
  
  return sendEmail(user.email, subject, html);
};

/**
 * Send leaderboard position email
 */
const sendLeaderboardEmail = async (user, position, type = 'global') => {
  const subject = `🏅 You're #${position} on the ${type} leaderboard!`;
  const html = `
    <h1>Great job, ${user.name}!</h1>
    <h2>You're ranked #${position} on the ${type} leaderboard!</h2>
    <p><strong>Your Points:</strong> ${user.points}</p>
    <p><strong>Your Level:</strong> ${Math.floor(user.points / 100) + 1}</p>
    <p>Keep learning to climb even higher!</p>
    <a href="${process.env.APP_URL}/leaderboard" style="background:#FFD700;color:#333;padding:10px 20px;text-decoration:none;border-radius:5px;">View Leaderboard</a>
  `;
  
  return sendEmail(user.email, subject, html);
};

/**
 * Send weekly summary email
 */
const sendWeeklySummaryEmail = async (user, stats) => {
  const subject = '📊 Your Weekly Summary';
  const html = `
    <h2>Hi ${user.name}, here's your week in review!</h2>
    <h3>This Week's Stats:</h3>
    <ul>
      <li><strong>Quizzes Completed:</strong> ${stats.quizzesCompleted}</li>
      <li><strong>Points Earned:</strong> ${stats.pointsEarned}</li>
      <li><strong>Badges Earned:</strong> ${stats.badgesEarned}</li>
      <li><strong>Current Streak:</strong> ${user.streak} days</li>
    </ul>
    <p>Keep up the amazing work!</p>
    <a href="${process.env.APP_URL}/dashboard" style="background:#2196F3;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Go to Dashboard</a>
  `;
  
  return sendEmail(user.email, subject, html);
};

/**
 * Send mission verification email
 */
const sendMissionVerificationEmail = async (user, mission, status) => {
  const subject = status === 'approved' 
    ? `✅ Mission Approved: ${mission.title}`
    : `❌ Mission Rejected: ${mission.title}`;
  
  const html = status === 'approved'
    ? `
      <h2>Mission Approved!</h2>
      <p>Hi ${user.name},</p>
      <p>Your mission "${mission.title}" has been verified and approved!</p>
      <p><strong>Points Earned:</strong> ${mission.points}</p>
      <p>Great work making a difference!</p>
    `
    : `
      <h2>Mission Needs Revision</h2>
      <p>Hi ${user.name},</p>
      <p>Your mission "${mission.title}" needs some improvements.</p>
      <p>Please review the feedback and resubmit.</p>
    `;
  
  return sendEmail(user.email, subject, html);
};

/**
 * Send bulk email (for announcements)
 */
const sendBulkEmail = async (recipients, subject, html) => {
  const promises = recipients.map(email => sendEmail(email, subject, html));
  return Promise.allSettled(promises);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAchievementEmail,
  sendBadgeEmail,
  sendLevelUpEmail,
  sendStreakReminderEmail,
  sendQuizCompletedEmail,
  sendLeaderboardEmail,
  sendWeeklySummaryEmail,
  sendMissionVerificationEmail,
  sendBulkEmail,
};