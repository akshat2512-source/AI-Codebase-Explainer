/**
 * GitHub Service
 * Handles parsing GitHub URLs and fetching repository metadata via the GitHub REST API.
 */

const FILE_LIMIT = 2000; // Max files returned from tree endpoint

/**
 * Returns common GitHub API headers (including auth token if set).
 */
const getGitHubHeaders = () => {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'AI-Codebase-Explainer',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
};

/**
 * Throws a descriptive error for non-OK GitHub responses.
 */
const handleGitHubError = (response) => {
  if (response.status === 404) {
    throw new Error('Repository not found. Please check the owner and repository name.');
  }
  if (response.status === 403) {
    const rateLimitReset = response.headers.get('x-ratelimit-reset');
    const resetTime = rateLimitReset
      ? new Date(rateLimitReset * 1000).toLocaleTimeString()
      : 'soon';
    throw new Error(`GitHub API rate limit exceeded. Try again at ${resetTime}, or add a GITHUB_TOKEN to your .env file.`);
  }
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
};

/**
 * Parses a GitHub repository URL and extracts owner and repo name.
 */
const parseGitHubUrl = (url) => {
  if (!url || typeof url !== 'string') {
    throw new Error('Repository URL is required');
  }

  const trimmedUrl = url.trim();
  const regex = /^https?:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(\.git)?(\/.*)?$/;
  const match = trimmedUrl.match(regex);

  if (!match) {
    throw new Error('Invalid GitHub repository URL. Expected format: https://github.com/owner/repo');
  }

  return { owner: match[1], repo: match[2] };
};

/**
 * Fetches repository metadata from the GitHub REST API.
 */
const fetchRepoMetadata = async (owner, repo) => {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const response = await fetch(apiUrl, { headers: getGitHubHeaders() });

  handleGitHubError(response);

  const data = await response.json();

  return {
    name: data.name,
    fullName: data.full_name,
    owner: data.owner?.login,
    ownerAvatar: data.owner?.avatar_url,
    description: data.description,
    stars: data.stargazers_count,
    forks: data.forks_count,
    watchers: data.watchers_count,
    openIssues: data.open_issues_count,
    language: data.language,
    size: data.size,
    defaultBranch: data.default_branch,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    htmlUrl: data.html_url,
    topics: data.topics || [],
    license: data.license?.spdx_id || null,
    isPrivate: data.private,
  };
};

/**
 * Fetches the full recursive file tree of a repository.
 * Uses the default branch obtained from the repo metadata.
 * Caps the response at FILE_LIMIT entries.
 *
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<{ tree: Array<{path: string, type: string, size?: number}>, truncated: boolean, totalFiles: number }>}
 */
const fetchRepoTree = async (owner, repo) => {
  // 1. Get the default branch
  const metaUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const metaRes = await fetch(metaUrl, { headers: getGitHubHeaders() });
  handleGitHubError(metaRes);
  const metaData = await metaRes.json();
  const branch = metaData.default_branch;

  // 2. Fetch the recursive tree
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const treeRes = await fetch(treeUrl, { headers: getGitHubHeaders() });
  handleGitHubError(treeRes);
  const treeData = await treeRes.json();

  if (!treeData.tree) {
    throw new Error('Failed to retrieve repository file tree.');
  }

  // 3. Map and cap results
  const fullTree = treeData.tree.map((item) => ({
    path: item.path,
    type: item.type === 'blob' ? 'blob' : 'tree', // blob = file, tree = folder
    size: item.size || 0,
  }));

  const limited = fullTree.slice(0, FILE_LIMIT);

  return {
    tree: limited,
    truncated: treeData.truncated || fullTree.length > FILE_LIMIT,
    totalFiles: fullTree.length,
  };
};

module.exports = { parseGitHubUrl, fetchRepoMetadata, fetchRepoTree };

