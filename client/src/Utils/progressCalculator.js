// Calculate module progress percentage
export const calculateModuleProgress = (completedLessons, totalLessons) => {
  if (!totalLessons || totalLessons === 0) return 0;
  return Math.round((completedLessons / totalLessons) * 100);
};

// Calculate overall progress percentage
export const calculateOverallProgress = (userData) => {
  if (!userData) return 0;
  
  const {
    totalLessonsCompleted = 0,
    totalLessons = 0,
    totalQuizzesPassed = 0,
    totalQuizzes = 0,
    totalChallengesCompleted = 0,
    totalChallenges = 0
  } = userData;
  
  // Weight different activities
  const lessonWeight = 0.5;
  const quizWeight = 0.3;
  const challengeWeight = 0.2;
  
  const lessonProgress = totalLessons > 0 ? (totalLessonsCompleted / totalLessons) * 100 : 0;
  const quizProgress = totalQuizzes > 0 ? (totalQuizzesPassed / totalQuizzes) * 100 : 0;
  const challengeProgress = totalChallenges > 0 ? (totalChallengesCompleted / totalChallenges) * 100 : 0;
  
  const weightedProgress = 
    (lessonProgress * lessonWeight) +
    (quizProgress * quizWeight) +
    (challengeProgress * challengeWeight);
  
  return Math.round(weightedProgress);
};

// Calculate lesson completion rate
export const calculateLessonCompletionRate = (completedLessons, totalLessons) => {
  return calculateModuleProgress(completedLessons, totalLessons);
};

// Calculate quiz pass rate
export const calculateQuizPassRate = (passedQuizzes, totalAttempts) => {
  if (!totalAttempts || totalAttempts === 0) return 0;
  return Math.round((passedQuizzes / totalAttempts) * 100);
};

// Calculate average quiz score
export const calculateAverageQuizScore = (quizScores) => {
  if (!quizScores || quizScores.length === 0) return 0;
  
  const sum = quizScores.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / quizScores.length);
};

// Calculate time spent per lesson (average)
export const calculateAverageTimePerLesson = (totalTime, totalLessons) => {
  if (!totalLessons || totalLessons === 0) return 0;
  return Math.round(totalTime / totalLessons);
};

// Calculate learning velocity (lessons per day)
export const calculateLearningVelocity = (lessonsCompleted, daysSinceStart) => {
  if (!daysSinceStart || daysSinceStart === 0) return 0;
  return (lessonsCompleted / daysSinceStart).toFixed(2);
};

// Calculate estimated completion time (days remaining)
export const calculateEstimatedCompletion = (
  lessonsCompleted,
  totalLessons,
  averageVelocity
) => {
  if (!averageVelocity || averageVelocity === 0) return null;
  
  const lessonsRemaining = totalLessons - lessonsCompleted;
  const daysRemaining = Math.ceil(lessonsRemaining / averageVelocity);
  
  return daysRemaining;
};

// Calculate skill level based on quiz scores
export const calculateSkillLevel = (quizScores) => {
  if (!quizScores || quizScores.length === 0) return 'Beginner';
  
  const averageScore = calculateAverageQuizScore(quizScores);
  
  if (averageScore >= 90) return 'Expert';
  if (averageScore >= 80) return 'Advanced';
  if (averageScore >= 70) return 'Intermediate';
  if (averageScore >= 60) return 'Basic';
  return 'Beginner';
};

// Calculate consistency score (0-100)
export const calculateConsistencyScore = (loginDays, totalDays) => {
  if (!totalDays || totalDays === 0) return 0;
  return Math.round((loginDays / totalDays) * 100);
};

// Calculate engagement score (0-100)
export const calculateEngagementScore = (data) => {
  const {
    lessonsCompleted = 0,
    quizzesTaken = 0,
    challengesCompleted = 0,
    daysActive = 0,
    totalDays = 1
  } = data;
  
  // Different factors
  const lessonScore = Math.min(lessonsCompleted * 2, 40);
  const quizScore = Math.min(quizzesTaken * 3, 30);
  const challengeScore = Math.min(challengesCompleted * 5, 20);
  const consistencyScore = Math.min((daysActive / totalDays) * 10, 10);
  
  return Math.round(lessonScore + quizScore + challengeScore + consistencyScore);
};

// Get progress status
export const getProgressStatus = (progress) => {
  if (progress === 0) return { label: 'Not Started', color: 'gray' };
  if (progress < 25) return { label: 'Getting Started', color: 'blue' };
  if (progress < 50) return { label: 'In Progress', color: 'yellow' };
  if (progress < 75) return { label: 'Good Progress', color: 'orange' };
  if (progress < 100) return { label: 'Almost Complete', color: 'green' };
  return { label: 'Completed', color: 'primary' };
};

// Calculate module completion percentage for multiple modules
export const calculateMultiModuleProgress = (modules) => {
  if (!modules || modules.length === 0) return 0;
  
  const totalProgress = modules.reduce((sum, module) => {
    const moduleProgress = calculateModuleProgress(
      module.completedLessons,
      module.totalLessons
    );
    return sum + moduleProgress;
  }, 0);
  
  return Math.round(totalProgress / modules.length);
};

// Calculate grade-level progress
export const calculateGradeLevelProgress = (completedGrades, totalGrades) => {
  if (!totalGrades || totalGrades === 0) return 0;
  return Math.round((completedGrades / totalGrades) * 100);
};

// Get next milestone
export const getNextMilestone = (currentProgress) => {
  const milestones = [10, 25, 50, 75, 90, 100];
  
  for (let milestone of milestones) {
    if (currentProgress < milestone) {
      return {
        value: milestone,
        remaining: milestone - currentProgress
      };
    }
  }
  
  return { value: 100, remaining: 0 };
};

// Calculate progress velocity (progress per day)
export const calculateProgressVelocity = (currentProgress, daysSinceStart) => {
  if (!daysSinceStart || daysSinceStart === 0) return 0;
  return (currentProgress / daysSinceStart).toFixed(2);
};

// Calculate days to complete at current velocity
export const calculateDaysToComplete = (currentProgress, velocity) => {
  if (!velocity || velocity === 0) return null;
  
  const remainingProgress = 100 - currentProgress;
  const daysNeeded = Math.ceil(remainingProgress / velocity);
  
  return daysNeeded;
};

// Get subject mastery level
export const getSubjectMastery = (subjectData) => {
  const {
    lessonsCompleted = 0,
    totalLessons = 0,
    averageQuizScore = 0,
    challengesCompleted = 0
  } = subjectData;
  
  const completionRate = calculateModuleProgress(lessonsCompleted, totalLessons);
  
  // Weighted score
  const masteryScore = 
    (completionRate * 0.4) +
    (averageQuizScore * 0.4) +
    (Math.min(challengesCompleted * 10, 20) * 0.2);
  
  if (masteryScore >= 90) return { level: 'Master', color: 'gold' };
  if (masteryScore >= 75) return { level: 'Advanced', color: 'green' };
  if (masteryScore >= 60) return { level: 'Intermediate', color: 'blue' };
  if (masteryScore >= 40) return { level: 'Basic', color: 'yellow' };
  return { level: 'Beginner', color: 'gray' };
};

// Calculate learning streak impact on progress
export const calculateStreakImpact = (streakDays) => {
  // Bonus percentage based on streak
  if (streakDays >= 100) return 50; // 50% bonus
  if (streakDays >= 30) return 30;  // 30% bonus
  if (streakDays >= 7) return 15;   // 15% bonus
  if (streakDays >= 3) return 5;    // 5% bonus
  return 0;
};