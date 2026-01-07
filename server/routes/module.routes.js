const express = require('express');
const router = express.Router();
const {
  createModule,
  getAllModules,
  getModuleById,
  getModulesBySubject,
  updateModule,
  deleteModule,
} = require('../controllers/moduleController');

// Static routes first
router.post('/', createModule);
router.get('/', getAllModules);
router.get('/subject/:subjectId', getModulesBySubject);

// Dynamic routes last
router.get('/:id', getModuleById);
router.put('/:id', updateModule);
router.delete('/:id', deleteModule);

module.exports = router;