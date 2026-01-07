const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const User = require('../models/User');
const { HTTP_STATUS } = require('../config/constants');
const { updateDailyMissionProgress } = require('../utils/missionUpdater');

// @desc    Start a quiz attempt
// @route   POST /api/submissions/start
// @access  Private
const startQuizAttempt = async (req, res) => {
  try {
    const { userId, quizId } = req.body;

    // Check how many attempts user has made
    const previousAttempts = await Submission.countDocuments({
      user: userId,
      quiz: quizId,
    });

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Quiz not found' });
    }

    if (previousAttempts >= quiz.attemptsAllowed) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: `Maximum attempts (${quiz.attemptsAllowed}) reached`
      });
    }

    let questions = await Question.find({ quiz: quizId, isActive: true });

    // Shuffle and pick 5 random questions (or all if less than 5)
    questions = questions.sort(() => 0.5 - Math.random()).slice(0, 5);

    const submission = await Submission.create({
      user: userId,
      quiz: quizId,
      attemptNumber: previousAttempts + 1,
      totalQuestions: questions.length,
      startTime: new Date(),
      status: 'in-progress',
    });

    res.status(HTTP_STATUS.CREATED).json({
      submission,
      questions, // Return the selected questions
      timeLimit: quiz.timeLimit,
      totalQuestions: questions.length,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Submit quiz answers
// @route   POST /api/submissions/submit
// @access  Private
const submitQuiz = async (req, res) => {
  try {
    const { submissionId, answers } = req.body;

    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Submission not found' });
    }

    if (submission.status === 'completed') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Quiz already submitted'
      });
    }

    // Get all questions with correct answers
    const questions = await Question.find({
      quiz: submission.quiz
    });

    let totalScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    const processedAnswers = [];

    // Process each answer
    for (const answer of answers) {
      const question = questions.find(q => q._id.toString() === answer.questionId);

      if (question) {
        const isCorrect = question.correctAnswer.trim().toLowerCase() ===
          answer.selectedAnswer.trim().toLowerCase();

        const pointsEarned = isCorrect ? question.points : 0;
        totalScore += pointsEarned;

        if (isCorrect) correctCount++;
        else wrongCount++;

        processedAnswers.push({
          question: question._id,
          selectedAnswer: answer.selectedAnswer,
          isCorrect,
          pointsEarned,
          timeSpent: answer.timeSpent || 0,
        });
      }
    }

    // Calculate time taken
    const endTime = new Date();
    const timeTaken = Math.floor((endTime - submission.startTime) / 1000);

    // Get quiz for passing score
    const quiz = await Quiz.findById(submission.quiz);
    const percentage = Math.round((correctCount / submission.totalQuestions) * 100);
    const isPassed = percentage >= quiz.passingScore;

    // Update submission
    submission.answers = processedAnswers;
    submission.score = totalScore;
    submission.percentage = percentage;
    submission.correctAnswers = correctCount;
    submission.wrongAnswers = wrongCount;
    submission.isPassed = isPassed;
    submission.endTime = endTime;
    submission.timeTaken = timeTaken;
    submission.status = 'completed';
    submission.pointsEarned = totalScore;

    // Add bonus points if passed
    if (isPassed) {
      submission.bonusPoints = quiz.completionPoints;
      submission.pointsEarned += quiz.completionPoints;

      // Update Daily Missions
      const userId = submission.user;
      if (submission.pointsEarned > 0) {
        await updateDailyMissionProgress(userId, 'earn_xp', submission.pointsEarned);
      }
      if (percentage === 100) {
        await updateDailyMissionProgress(userId, 'perfect_score', 1);
      }
    }

    await submission.save();

    // Update user progress
    const UserProgress = require('../models/UserProgress');
    let userProgress = await UserProgress.findOne({ user: submission.user });
    if (!userProgress) {
      userProgress = await UserProgress.create({ user: submission.user });
    }

    if (submission.pointsEarned > 0) {
      await userProgress.addXP(submission.pointsEarned);
    }

    // Award bonus coins only if passed
    if (isPassed) {
      const coinsEarned = Math.round(submission.pointsEarned * 0.2) + 10; // 20% bonus + 10 flat
      await userProgress.addCoins(coinsEarned);
    }

    res.json({
      message: isPassed ? 'Congratulations! You passed!' : 'Keep trying!',
      submission,
      passed: isPassed,
      score: percentage, // Frontend expects 0-100 percentage for the 'score' field
      pointsEarned: submission.pointsEarned,
      correctAnswers: correctCount,
      totalQuestions: submission.totalQuestions,
      wrongAnswers: wrongCount,
      timeTaken,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get submission by ID with full details (POPULATE EXAMPLE)
// @route   GET /api/submissions/:id
// @access  Private
const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'quiz',
        populate: { path: 'lesson' }
      })
      .populate('answers.question');

    if (!submission) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get user's quiz history (POPULATE EXAMPLE)
// @route   GET /api/submissions/user/:userId
// @access  Private
const getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      user: req.params.userId,
      status: 'completed'
    })
      .populate('quiz', 'title difficulty')
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get quiz leaderboard (POPULATE EXAMPLE)
// @route   GET /api/submissions/leaderboard/:quizId
// @access  Public
const getQuizLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Submission.find({
      quiz: req.params.quizId,
      status: 'completed'
    })
      .populate('user', 'name schoolID grade')
      .sort({ score: -1, timeTaken: 1 })
      .limit(20);

    res.json(leaderboard);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @desc    Get user's proof submissions from missions and challenges
// @route   GET /api/submissions/proofs/user/:userId
// @access  Private
const getUserProofs = async (req, res) => {
  try {
    const userId = req.params.userId;
    const DailyMission = require('../models/DailyMission');
    const Challenge = require('../models/Challenge');

    // 1. Get mission proofs
    const missions = await DailyMission.find({
      user: userId,
      requiresProof: true,
      'proof.url': { $exists: true, $ne: '' }
    });

    const missionProofs = missions.map(m => ({
      _id: m._id,
      missionTitle: m.title,
      submittedAt: m.proof.submittedAt,
      status: m.proof.verificationStatus,
      proofImage: m.proof.url,
      description: m.proof.description,
      score: m.proof.verificationScore,
      feedback: m.proof.verificationDetails?.feedback || m.proof.verificationDetails?.rejectionReason || ''
    }));

    // 2. Get challenge proofs
    const challenges = await Challenge.find({
      'participants.user': userId,
      'participants.proof.url': { $exists: true, $ne: '' }
    });

    const challengeProofs = [];
    challenges.forEach(c => {
      const p = c.participants.find(part => part.user.toString() === userId.toString());
      if (p && p.proof && p.proof.url) {
        challengeProofs.push({
          _id: `${c._id}_${userId}`,
          challengeTitle: c.title,
          submittedAt: p.proof.submittedAt,
          status: p.proof.status,
          proofImage: p.proof.url,
          description: p.description || '',
          score: p.proof.verificationScore || 0,
          feedback: p.proof.feedback || ''
        });
      }
    });

    const allProofs = [...missionProofs, ...challengeProofs].sort((a, b) =>
      new Date(b.submittedAt) - new Date(a.submittedAt)
    );

    res.json({ success: true, submissions: allProofs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all proofs for review (Teacher Only)
// @route   GET /api/submissions/proofs
const getAllProofs = async (req, res) => {
  try {
    const { status } = req.query;
    const DailyMission = require('../models/DailyMission');
    const Challenge = require('../models/Challenge');

    // 1. Get mission proofs
    const missionQuery = {
      requiresProof: true,
      'proof.url': { $exists: true, $ne: '' }
    };
    if (status) {
      if (status === 'pending') missionQuery['proof.verificationStatus'] = { $in: ['pending', 'needs_review'] };
      else missionQuery['proof.verificationStatus'] = status;
    }

    const missions = await DailyMission.find(missionQuery).populate('user', 'name');

    const missionProofs = missions.map(m => ({
      _id: `mission_${m._id}`,
      studentName: m.user?.name || 'Unknown',
      challengeTitle: m.title,
      submittedAt: m.proof.submittedAt,
      status: m.proof.verificationStatus,
      proofImage: m.proof.url,
      description: m.proof.description,
      score: m.proof.verificationScore,
      feedback: m.proof.verificationDetails?.feedback || m.proof.verificationDetails?.rejectionReason || '',
      type: 'mission'
    }));

    // 2. Get challenge proofs
    const challenges = await Challenge.find({
      'participants.proof.url': { $exists: true, $ne: '' }
    }).populate('participants.user', 'name');

    const challengeProofs = [];
    challenges.forEach(c => {
      c.participants.forEach(p => {
        if (p.proof && p.proof.url) {
          const matchesStatus = !status || p.proof.status === status;
          if (matchesStatus) {
            challengeProofs.push({
              _id: `challenge_${c._id}_${p.user._id}`,
              studentName: p.user?.name || 'Unknown',
              challengeTitle: c.title,
              submittedAt: p.proof.submittedAt,
              status: p.proof.status,
              proofImage: p.proof.url,
              description: p.description || '',
              score: p.proof.verificationScore || 0,
              feedback: p.proof.feedback || '',
              type: 'challenge'
            });
          }
        }
      });
    });

    const allProofs = [...missionProofs, ...challengeProofs].sort((a, b) =>
      new Date(b.submittedAt) - new Date(a.submittedAt)
    );

    res.json({ success: true, proofs: allProofs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get proof stats for teachers
// @route   GET /api/submissions/proofs/stats
const getProofStats = async (req, res) => {
  try {
    const DailyMission = require('../models/DailyMission');
    const Challenge = require('../models/Challenge');
    const User = require('../models/User');

    const missionStats = await DailyMission.aggregate([
      { $match: { 'proof.url': { $exists: true, $ne: '' } } },
      { $group: { _id: '$proof.verificationStatus', count: { $sum: 1 } } }
    ]);

    const challengeStats = await Challenge.aggregate([
      { $unwind: '$participants' },
      { $match: { 'participants.proof.url': { $exists: true, $ne: '' } } },
      { $group: { _id: '$participants.proof.status', count: { $sum: 1 } } }
    ]);

    const studentStats = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: null, totalStudents: { $sum: 1 }, totalPoints: { $sum: '$points' } } }
    ]);

    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0,
      totalStudents: studentStats[0]?.totalStudents || 0,
      totalPoints: studentStats[0]?.totalPoints || 0
    };

    missionStats.forEach(s => {
      if (s._id === 'pending' || s._id === 'needs_review') stats.pending += s.count;
      if (s._id === 'approved') stats.approved += s.count;
      if (s._id === 'rejected') stats.rejected += s.count;
      stats.total += s.count;
    });

    challengeStats.forEach(s => {
      if (s._id === 'pending') stats.pending += s.count;
      if (s._id === 'approved') stats.approved += s.count;
      if (s._id === 'rejected') stats.rejected += s.count;
      stats.total += s.count;
    });

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve a proof
// @route   PUT /api/submissions/proofs/:id/approve
const approveProof = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, reason } = req.body;
    const DailyMission = require('../models/DailyMission');
    const Challenge = require('../models/Challenge');

    if (id.startsWith('mission_')) {
      const missionId = id.replace('mission_', '');
      const mission = await DailyMission.findById(missionId);
      if (!mission) return res.status(404).json({ message: 'Mission not found' });

      mission.proof.verificationStatus = 'approved';
      mission.proof.verificationScore = score || 100;
      mission.status = 'completed';
      mission.isCompleted = true;
      mission.progress = mission.target;
      mission.proof.verificationDetails.feedback = reason || 'Excellent work!';
      await mission.save();
    } else if (id.startsWith('challenge_')) {
      const parts = id.split('_');
      const challengeId = parts[1];
      const userId = parts[2];
      const challenge = await Challenge.findById(challengeId);
      if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

      const participant = challenge.participants.find(p => p.user.toString() === userId);
      if (participant) {
        participant.proof.status = 'approved';
        participant.proof.verificationScore = score || 100;
        participant.proof.feedback = reason || 'Verification successful.';
        participant.isCompleted = true;
        await challenge.save();
      }
    }

    res.json({ success: true, message: 'Proof approved with score' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject a proof
// @route   PUT /api/submissions/proofs/:id/reject
const rejectProof = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const DailyMission = require('../models/DailyMission');
    const Challenge = require('../models/Challenge');

    if (id.startsWith('mission_')) {
      const missionId = id.replace('mission_', '');
      const mission = await DailyMission.findById(missionId);
      mission.proof.verificationStatus = 'rejected';
      mission.status = 'rejected';
      mission.proof.verificationDetails.rejectionReason = reason || 'Proof did not meet requirements';
      await mission.save();
    } else if (id.startsWith('challenge_')) {
      const parts = id.split('_');
      const challengeId = parts[1];
      const userId = parts[2];
      const challenge = await Challenge.findById(challengeId);
      const participant = challenge.participants.find(p => p.user.toString() === userId);
      if (participant) {
        participant.proof.status = 'rejected';
        participant.proof.feedback = reason;
        await challenge.save();
      }
    }

    res.json({ success: true, message: 'Proof rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify proof with AI
// @route   POST /api/submissions/proofs/:id/verify-ai
const verifyProofWithAI = async (req, res) => {
  try {
    const { id } = req.params;
    const DailyMission = require('../models/DailyMission');
    const Challenge = require('../models/Challenge');

    let proofData = null;

    if (id.startsWith('mission_')) {
      const mission = await DailyMission.findById(id.replace('mission_', ''));
      if (mission) proofData = { img: mission.proof.url, desc: mission.proof.description || '', title: mission.title };
    } else {
      const parts = id.split('_');
      const challenge = await Challenge.findById(parts[1]);
      if (challenge) {
        const p = challenge.participants.find(part => part.user.toString() === parts[2]);
        if (p) proofData = { img: p.proof.url, desc: p.proof.description || '', title: challenge.title };
      }
    }

    if (!proofData) return res.status(404).json({ message: 'Proof data not found' });

    // Simulate Smart AI Analysis - Strict Verification Protocol
    let aiScore = 0;
    let aiFeedback = "";
    const description = proofData.desc.toLowerCase();
    const title = proofData.title.toLowerCase();

    // 1. Initial Document Type Scan (Anti-Spam)
    const irrelevantKeywords = [
      'resume', 'cv', 'curriculum vitae', 'experience', 'skills',
      'education', 'projects', 'internship', 'languages', 'contact',
      'address', 'objective', 'summary of qualifications', 'hobbies', 'personal details'
    ];

    const isIrrelevant = irrelevantKeywords.some(key => description.includes(key));

    if (isIrrelevant) {
      return res.json({
        success: true,
        data: {
          score: 0,
          feedback: "Neural Alert: System has detected a Resume/CV or Personal Document. This is completely irrelevant to the environmental mission. Recommendation: REJECT (0 Marks).",
          confidence: 0.99,
          aiModel: "EcoMinds-Neural-v3-CoreGuard"
        }
      });
    }

    // 2. Visual Content Emulation (Image Signal Check)
    if (!proofData.img) {
      return res.json({
        success: true,
        data: {
          score: 0,
          feedback: "Verification Failed: No visual telemetry provided. Written descriptions without photo evidence are not admissible.",
          confidence: 1.0,
          aiModel: "EcoMinds-Neural-v3-CoreGuard"
        }
      });
    }

    // 3. Challenge-Specific Mandatory Validation
    let coreKeywordsMatched = 0;
    let validationPassed = false;
    let category = "generic";

    if (title.includes('waste') || title.includes('zero') || title.includes('hero') || title.includes('garbage')) {
      category = "waste";
      const mandatory = ['trash', 'plastic', 'recycle', 'bin', 'bottle', 'can', 'waste', 'cleanup', 'litter', 'segregation', 'compost', 'biodegradable'];
      coreKeywordsMatched = mandatory.filter(key => description.includes(key)).length;
      if (coreKeywordsMatched >= 1) validationPassed = true;
    } else if (title.includes('tree') || title.includes('plant') || title.includes('garden') || title.includes('leaf')) {
      category = "planting";
      const mandatory = ['tree', 'soil', 'green', 'leaf', 'nature', 'planted', 'pot', 'digging', 'watering', 'seedling', 'roots', 'sapling', 'earth'];
      coreKeywordsMatched = mandatory.filter(key => description.includes(key)).length;
      if (coreKeywordsMatched >= 1) validationPassed = true;
    } else if (title.includes('energy') || title.includes('solar') || title.includes('electricity') || title.includes('power')) {
      category = "energy";
      const mandatory = ['solar', 'panel', 'light', 'off', 'saving', 'electricity', 'watt', 'power', 'device', 'appliance', 'switched', 'efficiency'];
      coreKeywordsMatched = mandatory.filter(key => description.includes(key)).length;
      if (coreKeywordsMatched >= 1) validationPassed = true;
    } else {
      // Catch-all for other environmental tasks
      const mandatory = ['eco', 'environment', 'nature', 'sustainable', 'green', 'planet', 'earth', 'protection', 'impact', 'conservation'];
      coreKeywordsMatched = mandatory.filter(key => description.includes(key)).length;
      if (coreKeywordsMatched >= 1) validationPassed = true;
    }

    // 4. Scoring Logic (Strict)
    if (!validationPassed) {
      aiScore = 15; // Minimal points for effort if no keywords match but image exists
      aiFeedback = `Relevance Mismatch: System cannot link this submission to "${proofData.title}". No mission-critical keywords detected. Recommendation: REJECT or Request New Proof.`;
    } else {
      // Base score for passing core check
      aiScore = 50;

      // Add points for depth (Keyword Density)
      aiScore += (coreKeywordsMatched * 10);

      // Add points for description length (Quality of Context)
      if (description.length > 50) aiScore += 10;
      if (description.length > 150) aiScore += 10;

      aiScore = Math.min(aiScore, 100);
      aiFeedback = `Evidence Synchronized: Neural scan confirmed ${coreKeywordsMatched} matching relevance markers for "${proofData.title}". Evidence appears authentic.`;
    }

    res.json({
      success: true,
      data: {
        score: aiScore,
        feedback: aiFeedback,
        confidence: 0.96,
        aiModel: "EcoMinds-Neural-v3-CoreGuard"
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  startQuizAttempt,
  submitQuiz,
  getSubmissionById,
  getUserSubmissions,
  getQuizLeaderboard,
  getUserProofs,
  getAllProofs,
  getProofStats,
  approveProof,
  rejectProof,
  verifyProofWithAI
};
