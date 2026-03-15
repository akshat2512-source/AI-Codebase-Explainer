const { parseGitHubUrl, fetchRepoMetadata, fetchRepoTree } = require('../services/githubService');

/**
 * @desc    Analyze a GitHub repository — parse URL and fetch metadata
 * @route   POST /api/repos/analyze
 * @access  Public
 */
const getRepoMetadata = async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ message: 'Please provide a repository URL' });
    }

    const { owner, repo } = parseGitHubUrl(repoUrl);
    const metadata = await fetchRepoMetadata(owner, repo);

    res.json(metadata);
  } catch (error) {
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

/**
 * @desc    Fetch the full file tree of a GitHub repository
 * @route   POST /api/repos/tree
 * @access  Public
 */
const getRepoFileTree = async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ message: 'Please provide a repository URL' });
    }

    const { owner, repo } = parseGitHubUrl(repoUrl);
    const treeData = await fetchRepoTree(owner, repo);

    res.json(treeData);
  } catch (error) {
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

module.exports = { getRepoMetadata, getRepoFileTree };
