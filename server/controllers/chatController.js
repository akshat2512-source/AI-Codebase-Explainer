const { generateRepoAnswer } = require('../services/chatService');

/**
 * @desc    Answer a question about a repository
 * @route   POST /api/chat/repo
 * @access  Public
 *
 * Accepts pre-fetched repoContext from the frontend to avoid
 * redundant GitHub API calls.
 */
const askRepoQuestion = async (req, res) => {
  try {
    const { question, repoContext } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Please provide a question' });
    }

    if (!repoContext) {
      return res.status(400).json({ message: 'Repository context is required' });
    }

    const result = await generateRepoAnswer(question.trim(), repoContext);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { askRepoQuestion };
