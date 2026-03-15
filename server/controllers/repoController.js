const { parseGitHubUrl, fetchRepoMetadata } = require('../services/githubService');

/**
 * @desc    Analyze a GitHub repository — parse URL and fetch metadata
 * @route   POST /api/repos/analyze
 * @access  Public
 */
const getRepoMetadata = async (req, res) => {
  try {
    const { repoUrl } = req.body;

    // 1. Validate input
    if (!repoUrl) {
      return res.status(400).json({ message: 'Please provide a repository URL' });
    }

    // 2. Parse the GitHub URL
    const { owner, repo } = parseGitHubUrl(repoUrl);

    // 3. Fetch metadata from GitHub API
    const metadata = await fetchRepoMetadata(owner, repo);

    res.json(metadata);
  } catch (error) {
    // Determine the proper status code based on error type
    const statusCode = error.message.includes('not found')
      ? 404
      : error.message.includes('rate limit')
        ? 429
        : error.message.includes('Invalid')
          ? 400
          : 500;

    res.status(statusCode).json({ message: error.message });
  }
};

module.exports = { getRepoMetadata };
