const express = require('express');
const router = express.Router();
const { askRepoQuestion } = require('../controllers/chatController');

// POST /api/chat/repo — ask a question about a repository
router.post('/repo', askRepoQuestion);

module.exports = router;
