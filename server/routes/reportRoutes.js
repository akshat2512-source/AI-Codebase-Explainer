const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { downloadReport } = require('../controllers/reportController');

// Protected — requires JWT
router.get('/:analysisId', protect, downloadReport);

module.exports = router;
