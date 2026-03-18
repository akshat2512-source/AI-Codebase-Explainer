const express = require('express');
const router = express.Router();
const { getRepoMetadata, getRepoFileTree, getTechStack, generateAIAnalysis, getArchitectureDiagram } = require('../controllers/repoController');
const { cacheMiddleware } = require('../middlewares/cacheMiddleware');

// Cached GitHub-API routes (10-min TTL)
router.post('/analyze', cacheMiddleware(), getRepoMetadata);
router.post('/tree', cacheMiddleware(), getRepoFileTree);
router.post('/tech-stack', cacheMiddleware(), getTechStack);

// AI routes — not cached (unique per request context)
router.post('/ai-analysis', generateAIAnalysis);
router.post('/architecture', getArchitectureDiagram);

module.exports = router;
