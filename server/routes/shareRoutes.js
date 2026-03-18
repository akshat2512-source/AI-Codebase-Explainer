const express = require('express');
const router = express.Router();
const { getSharedAnalysis } = require('../controllers/shareController');

// Public — no authentication required
router.get('/:shareId', getSharedAnalysis);

module.exports = router;
