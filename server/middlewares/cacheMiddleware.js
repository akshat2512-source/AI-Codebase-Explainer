/**
 * Simple in-memory cache middleware for API responses.
 *
 * Uses a Map with TTL-based expiry (default 10 minutes).
 * Designed for repo metadata / tree / tech-stack routes that hit the
 * GitHub API — avoids redundant external calls for the same repo.
 */

const cache = new Map();

const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_ENTRIES = 200;

/**
 * Evict the oldest entry when the cache exceeds MAX_ENTRIES.
 */
const evictOldest = () => {
  if (cache.size <= MAX_ENTRIES) return;
  const oldestKey = cache.keys().next().value;
  cache.delete(oldestKey);
};

/**
 * Build a cache key from the request.
 * Key = "METHOD:path:body.repoUrl"
 */
const buildKey = (req) => {
  const repoUrl = (req.body && req.body.repoUrl) || '';
  return `${req.method}:${req.originalUrl}:${repoUrl}`.toLowerCase();
};

/**
 * Express middleware factory.
 * @param {number} [ttl] – time-to-live in ms (default 10 min)
 */
const cacheMiddleware = (ttl = DEFAULT_TTL) => {
  return (req, res, next) => {
    const key = buildKey(req);
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return res.json(cached.data);
    }

    // Monkey-patch res.json to intercept the response and cache it
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, { data: body, timestamp: Date.now() });
        evictOldest();
      }
      return originalJson(body);
    };

    next();
  };
};

/**
 * Manually clear the entire cache (useful for testing / admin).
 */
const clearCache = () => cache.clear();

module.exports = { cacheMiddleware, clearCache };
