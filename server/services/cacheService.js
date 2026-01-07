/**
 * Cache Service
 * In-memory caching service for frequently accessed data
 * Note: Use Redis in production for distributed caching
 */

// Simple in-memory cache
const cache = new Map();

// Cache expiration times (in seconds)
const CACHE_TTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 1800,          // 30 minutes
  VERY_LONG: 3600,     // 1 hour
  DAY: 86400,          // 24 hours
};

/**
 * Generate cache key
 */
const generateKey = (prefix, identifier) => {
  return `${prefix}:${identifier}`;
};

/**
 * Set cache with TTL
 */
const set = (key, value, ttl = CACHE_TTL.MEDIUM) => {
  const expiresAt = Date.now() + (ttl * 1000);
  
  cache.set(key, {
    value,
    expiresAt,
  });
  
  return true;
};

/**
 * Get cache value
 */
const get = (key) => {
  const item = cache.get(key);
  
  if (!item) {
    return null;
  }
  
  // Check if expired
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return item.value;
};

/**
 * Delete cache key
 */
const del = (key) => {
  return cache.delete(key);
};

/**
 * Delete multiple keys by pattern
 */
const delPattern = (pattern) => {
  const regex = new RegExp(pattern);
  let count = 0;
  
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
      count++;
    }
  }
  
  return count;
};

/**
 * Check if key exists
 */
const exists = (key) => {
  const item = cache.get(key);
  
  if (!item) {
    return false;
  }
  
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return false;
  }
  
  return true;
};

/**
 * Clear all cache
 */
const clear = () => {
  cache.clear();
  return true;
};

/**
 * Get cache stats
 */
const getStats = () => {
  let expired = 0;
  let active = 0;
  
  for (const [key, item] of cache.entries()) {
    if (Date.now() > item.expiresAt) {
      expired++;
    } else {
      active++;
    }
  }
  
  return {
    total: cache.size,
    active,
    expired,
  };
};

/**
 * Clean expired cache entries
 */
const cleanExpired = () => {
  let count = 0;
  
  for (const [key, item] of cache.entries()) {
    if (Date.now() > item.expiresAt) {
      cache.delete(key);
      count++;
    }
  }
  
  return count;
};

/**
 * Cache leaderboard
 */
const cacheLeaderboard = (type, period, data) => {
  const key = generateKey('leaderboard', `${type}-${period}`);
  set(key, data, CACHE_TTL.MEDIUM);
};

/**
 * Get cached leaderboard
 */
const getCachedLeaderboard = (type, period) => {
  const key = generateKey('leaderboard', `${type}-${period}`);
  return get(key);
};

/**
 * Cache user profile
 */
const cacheUserProfile = (userId, data) => {
  const key = generateKey('user', userId);
  set(key, data, CACHE_TTL.SHORT);
};

/**
 * Get cached user profile
 */
const getCachedUserProfile = (userId) => {
  const key = generateKey('user', userId);
  return get(key);
};

/**
 * Invalidate user cache
 */
const invalidateUserCache = (userId) => {
  const key = generateKey('user', userId);
  return del(key);
};

/**
 * Cache quiz data
 */
const cacheQuiz = (quizId, data) => {
  const key = generateKey('quiz', quizId);
  set(key, data, CACHE_TTL.LONG);
};

/**
 * Get cached quiz
 */
const getCachedQuiz = (quizId) => {
  const key = generateKey('quiz', quizId);
  return get(key);
};

/**
 * Invalidate quiz cache
 */
const invalidateQuizCache = (quizId) => {
  const key = generateKey('quiz', quizId);
  return del(key);
};

/**
 * Cache analytics data
 */
const cacheAnalytics = (type, identifier, data) => {
  const key = generateKey('analytics', `${type}-${identifier}`);
  set(key, data, CACHE_TTL.LONG);
};

/**
 * Get cached analytics
 */
const getCachedAnalytics = (type, identifier) => {
  const key = generateKey('analytics', `${type}-${identifier}`);
  return get(key);
};

/**
 * Wrapper for caching function results
 */
const cacheWrapper = async (key, fn, ttl = CACHE_TTL.MEDIUM) => {
  // Check cache first
  const cached = get(key);
  if (cached !== null) {
    return cached;
  }
  
  // Execute function and cache result
  const result = await fn();
  set(key, result, ttl);
  
  return result;
};

/**
 * Cache with tags for group invalidation
 */
const setWithTags = (key, value, tags = [], ttl = CACHE_TTL.MEDIUM) => {
  set(key, value, ttl);
  
  // Store tags
  tags.forEach(tag => {
    const tagKey = generateKey('tag', tag);
    const taggedKeys = get(tagKey) || [];
    taggedKeys.push(key);
    set(tagKey, taggedKeys, ttl);
  });
  
  return true;
};

/**
 * Invalidate by tag
 */
const invalidateByTag = (tag) => {
  const tagKey = generateKey('tag', tag);
  const keys = get(tagKey) || [];
  
  keys.forEach(key => del(key));
  del(tagKey);
  
  return keys.length;
};

// Auto-cleanup expired entries every 5 minutes
setInterval(() => {
  const cleaned = cleanExpired();
  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
  }
}, 5 * 60 * 1000);

module.exports = {
  CACHE_TTL,
  generateKey,
  set,
  get,
  del,
  delPattern,
  exists,
  clear,
  getStats,
  cleanExpired,
  cacheLeaderboard,
  getCachedLeaderboard,
  cacheUserProfile,
  getCachedUserProfile,
  invalidateUserCache,
  cacheQuiz,
  getCachedQuiz,
  invalidateQuizCache,
  cacheAnalytics,
  getCachedAnalytics,
  cacheWrapper,
  setWithTags,
  invalidateByTag,
};