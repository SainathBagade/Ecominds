const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/submissionController');

const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Static routes first
router.post('/start', startQuizAttempt);
router.post('/submit', submitQuiz);
router.get('/user/:userId', getUserSubmissions);

// Teacher Proof Review Routes
router.get('/proofs', getAllProofs);
router.get('/proofs/stats', getProofStats);
router.put('/proofs/:id/approve', approveProof);
router.put('/proofs/:id/reject', rejectProof);
router.post('/proofs/:id/verify-ai', verifyProofWithAI);

router.get('/proofs/user/:userId', getUserProofs);
router.get('/leaderboard/:quizId', getQuizLeaderboard);

// Dynamic routes last
router.get('/:id', getSubmissionById);

module.exports = router;