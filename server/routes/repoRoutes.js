const express = require('express');
const router = express.Router();
const { getRepoMetadata, getRepoFileTree } = require('../controllers/repoController');

// POST /api/repos/analyze — parse a GitHub URL and fetch repo metadata
router.post('/analyze', getRepoMetadata);

// POST /api/repos/tree — fetch the full file tree of a repository
router.post('/tree', getRepoFileTree);

module.exports = router;
