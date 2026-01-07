const express = require('express');
const router = express.Router();
const {
    getSchools,
    addSchool,
    getPendingAdmins,
    approveAdmin,
    getPlatformAnalytics,
    createAdmin
} = require('../controllers/superAdminController');
const { protect } = require('../middleware/auth');
const { superAdminOnly } = require('../middleware/role.middleware');

router.use(protect);
router.use(superAdminOnly);

router.get('/schools', getSchools);
router.post('/schools', addSchool);
router.get('/pending-admins', getPendingAdmins);
router.put('/approve-admin/:id', approveAdmin);
router.get('/analytics', getPlatformAnalytics);
router.post('/create-admin', createAdmin);

module.exports = router;
