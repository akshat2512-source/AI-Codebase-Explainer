const express = require('express');
const router = express.Router();
const { getRepoMetadata, getRepoFileTree, getTechStack } = require('../controllers/repoController');

// POST /api/repos/analyze — parse a GitHub URL and fetch repo metadata
router.post('/analyze', getRepoMetadata);

// POST /api/repos/tree — fetch the full file tree of a repository
router.post('/tree', getRepoFileTree);

// POST /api/repos/tech-stack — detect the tech stack of a repository
router.post('/tech-stack', getTechStack);

module.exports = router;
