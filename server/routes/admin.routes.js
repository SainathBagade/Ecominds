const express = require('express');
const router = express.Router();
const { getPendingApprovals, approveUser, getAdminStats, createTeacher } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role.middleware');

router.use(protect);
router.use(adminOnly);

router.get('/pending-approvals', getPendingApprovals);
router.put('/approve/:id', approveUser);
router.get('/stats', getAdminStats);
router.post('/create-teacher', createTeacher);

module.exports = router;
