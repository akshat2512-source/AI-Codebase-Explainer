const express = require('express');
const router = express.Router();
const { getRepoMetadata } = require('../controllers/repoController');

// POST /api/repos/analyze — parse a GitHub URL and fetch repo metadata
router.post('/analyze', getRepoMetadata);

module.exports = router;
