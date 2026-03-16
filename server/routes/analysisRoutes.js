const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  saveAnalysis,
  getUserAnalyses,
  getAnalysisById,
  deleteAnalysis,
} = require('../controllers/analysisController');

// All routes are protected — require JWT
router.use(protect);

// GET    /api/analysis      — list all analyses for current user
// POST   /api/analysis      — save/update an analysis
router.route('/').get(getUserAnalyses).post(saveAnalysis);

// GET    /api/analysis/:id  — get full analysis by ID
// DELETE /api/analysis/:id  — delete an analysis
router.route('/:id').get(getAnalysisById).delete(deleteAnalysis);

module.exports = router;
