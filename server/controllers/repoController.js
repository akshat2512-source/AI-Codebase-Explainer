const {
  parseGitHubUrl,
  fetchRepoMetadata,
  fetchRepoTree,
  fetchRepoLanguages,
  fetchFileContent,
} = require('../services/githubService');
const { detectTechStack } = require('../services/techStackService');
const { generateCodebaseExplanation } = require('../services/aiService');
const { generateArchitectureDiagram } = require('../services/architectureService');

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

/**
 * @desc    Detect the tech stack of a GitHub repository
 * @route   POST /api/repos/tech-stack
 * @access  Public
 */
const getTechStack = async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ message: 'Please provide a repository URL' });
    }

    const { owner, repo } = parseGitHubUrl(repoUrl);

    // Fetch languages, tree, and package.json in parallel
    const [languages, treeData, packageJson] = await Promise.all([
      fetchRepoLanguages(owner, repo),
      fetchRepoTree(owner, repo),
      fetchFileContent(owner, repo, 'package.json'),
    ]);

    const techStack = detectTechStack(languages, treeData.tree, packageJson);

    res.json(techStack);
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
 * @desc    Generate an AI-powered codebase explanation
 * @route   POST /api/repos/ai-analysis
 * @access  Public
 *
 * Accepts pre-fetched data to avoid redundant GitHub API calls:
 *   { repoUrl, repoData, techStackData }
 * Falls back to fetching from GitHub if pre-fetched data is not supplied.
 */
const generateAIAnalysis = async (req, res) => {
  try {
    const { repoUrl, repoData: cachedMeta, techStackData: cachedStack } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ message: 'Please provide a repository URL' });
    }

    let name, fullName, description, tree, techStack;

    if (cachedMeta && cachedStack) {
      // ── Fast path: use data the frontend already has ──
      name = cachedMeta.name;
      fullName = cachedMeta.fullName;
      description = cachedMeta.description;
      tree = cachedMeta.tree || [];
      techStack = cachedStack;
    } else {
      // ── Slow path: fetch everything from GitHub ──
      const { owner, repo } = parseGitHubUrl(repoUrl);

      const [metadata, treeData, languages, packageJson] = await Promise.all([
        fetchRepoMetadata(owner, repo),
        fetchRepoTree(owner, repo),
        fetchRepoLanguages(owner, repo),
        fetchFileContent(owner, repo, 'package.json'),
      ]);

      name = metadata.name;
      fullName = metadata.fullName;
      description = metadata.description;
      tree = treeData.tree;
      techStack = detectTechStack(languages, treeData.tree, packageJson);
    }

    const aiInput = { name, fullName, description, tree, ...techStack };
    const explanation = await generateCodebaseExplanation(aiInput);

    res.json(explanation);
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
 * @desc    Generate architecture diagram from repo data
 * @route   POST /api/repos/architecture
 * @access  Public
 */
const getArchitectureDiagram = async (req, res) => {
  try {
    const { repoName, techStack, folders } = req.body;

    if (!repoName) {
      return res.status(400).json({ message: 'repoName is required' });
    }

    const result = generateArchitectureDiagram({ repoName, techStack, folders });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRepoMetadata, getRepoFileTree, getTechStack, generateAIAnalysis, getArchitectureDiagram };
