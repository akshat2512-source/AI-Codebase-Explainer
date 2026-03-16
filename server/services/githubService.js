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

const IGNORED_PATHS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.cache',
  '.DS_Store',
];

/**
 * Fetches the full recursive file tree of a repository.
 * Filters out common noise directories and caps at FILE_LIMIT entries.
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

  // 3. Filter out ignored paths, then map and cap results
  const filtered = treeData.tree.filter((item) => {
    const segments = item.path.split('/');
    return !segments.some((seg) => IGNORED_PATHS.includes(seg));
  });

  const mapped = filtered.map((item) => ({
    path: item.path,
    type: item.type === 'blob' ? 'blob' : 'tree',
    size: item.size || 0,
  }));

  const limited = mapped.slice(0, FILE_LIMIT);

  return {
    tree: limited,
    truncated: treeData.truncated || mapped.length > FILE_LIMIT,
    totalFiles: mapped.filter((i) => i.type === 'blob').length,
  };
};

/**
 * Fetches the language breakdown for a repository.
 * Returns an object like { JavaScript: 80000, TypeScript: 12000 }.
 */
const fetchRepoLanguages = async (owner, repo) => {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/languages`;
  const response = await fetch(apiUrl, { headers: getGitHubHeaders() });
  handleGitHubError(response);
  return response.json();
};

/**
 * Fetches the raw content of a single file from a repository.
 * Returns the parsed JSON if the file is JSON, otherwise the raw string.
 * Returns null if the file is not found (404).
 */
const fetchFileContent = async (owner, repo, path) => {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const response = await fetch(apiUrl, { headers: getGitHubHeaders() });

  if (response.status === 404) return null;
  handleGitHubError(response);

  const data = await response.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');

  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
};

module.exports = {
  parseGitHubUrl,
  fetchRepoMetadata,
  fetchRepoTree,
  fetchRepoLanguages,
  fetchFileContent,
};
