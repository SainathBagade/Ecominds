/**
 * Rate Limiter Middleware
 * Prevents abuse by limiting request rates
 */

// In-memory store for rate limiting (use Redis in production)
const requestStore = new Map();

/**
 * Clean up old entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestStore.entries()) {
    if (now - data.resetTime > 0) {
      requestStore.delete(key);
    }
  }
}, 60000); // Clean every minute

/**
 * Generic rate limiter
 * @param {Object} options - Configuration options
 */
const rateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // Max requests per window
    message = 'Too many requests, please try again later',
    keyGenerator = (req) => req.ip, // Default: use IP
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    if (!requestStore.has(key)) {
      requestStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    const data = requestStore.get(key);

    // Reset if window expired
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
      return next();
    }

    // Increment count
    data.count++;

    // Check if limit exceeded
    if (data.count > max) {
      const retryAfter = Math.ceil((data.resetTime - now) / 1000);
      res.set('Retry-After', retryAfter);
      res.set('X-RateLimit-Limit', max);
      res.set('X-RateLimit-Remaining', 0);
      res.set('X-RateLimit-Reset', new Date(data.resetTime).toISOString());
      
      return res.status(429).json({
        success: false,
        message,
        retryAfter: `${retryAfter} seconds`,
      });
    }

    // Set rate limit headers
    res.set('X-RateLimit-Limit', max);
    res.set('X-RateLimit-Remaining', max - data.count);
    res.set('X-RateLimit-Reset', new Date(data.resetTime).toISOString());

    next();
  };
};

/**
 * Strict rate limiter for auth routes (login, register)
 */
const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again after 15 minutes',
  keyGenerator: (req) => req.body.email || req.ip,
});

/**
 * General API rate limiter
 */
const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests
  message: 'Too many requests from this IP, please try again later',
});

/**
 * Quiz submission rate limiter
 */
const quizLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 quiz attempts per minute
  message: 'Too many quiz submissions, please slow down',
  keyGenerator: (req) => req.user ? req.user._id.toString() : req.ip,
});

/**
 * File upload rate limiter
 */
const uploadLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: 'Upload limit exceeded, please try again later',
  keyGenerator: (req) => req.user ? req.user._id.toString() : req.ip,
});

/**
 * Search rate limiter (to prevent scraping)
 */
const searchLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: 'Too many search requests, please slow down',
});

/**
 * Create custom rate limiter
 */
const createRateLimiter = (windowMs, max, message) => {
  return rateLimiter({ windowMs, max, message });
};

module.exports = {
  rateLimiter,
  authLimiter,
  apiLimiter,
  quizLimiter,
  uploadLimiter,
  searchLimiter,
  createRateLimiter,
};