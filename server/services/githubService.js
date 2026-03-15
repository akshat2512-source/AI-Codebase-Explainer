/**
 * GitHub Service
 * Handles parsing GitHub URLs and fetching repository metadata via the GitHub REST API.
 */

/**
 * Parses a GitHub repository URL and extracts owner and repo name.
 * Supports formats:
 *   - https://github.com/owner/repo
 *   - https://github.com/owner/repo.git
 *   - http://github.com/owner/repo/...
 *
 * @param {string} url - The GitHub repository URL
 * @returns {{ owner: string, repo: string }}
 * @throws {Error} If the URL format is invalid
 */
const parseGitHubUrl = (url) => {
  if (!url || typeof url !== 'string') {
    throw new Error('Repository URL is required');
  }

  const trimmedUrl = url.trim();

  // Match GitHub URL patterns
  const regex = /^https?:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(\.git)?(\/.*)?$/;
  const match = trimmedUrl.match(regex);

  if (!match) {
    throw new Error('Invalid GitHub repository URL. Expected format: https://github.com/owner/repo');
  }

  return {
    owner: match[1],
    repo: match[2],
  };
};

/**
 * Fetches repository metadata from the GitHub REST API.
 *
 * @param {string} owner - The repository owner/organization
 * @param {string} repo  - The repository name
 * @returns {Promise<Object>} Formatted repository metadata
 */
const fetchRepoMetadata = async (owner, repo) => {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'AI-Codebase-Explainer',
  };

  // Attach personal access token if available (helps avoid rate limits)
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(apiUrl, { headers });

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
    size: data.size, // in KB
    defaultBranch: data.default_branch,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    htmlUrl: data.html_url,
    topics: data.topics || [],
    license: data.license?.spdx_id || null,
    isPrivate: data.private,
  };
};

module.exports = { parseGitHubUrl, fetchRepoMetadata };
