/**
 * Simple rate limiting middleware to prevent infinite loops and abuse
 */

// Store request counts per IP
const requestCounts = new Map();
const WINDOW_SIZE = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 200; // Max requests per window (increased for development)

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.resetTime > WINDOW_SIZE) {
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000);

const rateLimiter = (req, res, next) => {
  // Skip rate limiting for development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  const clientId = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Get or create request data for this client
  let requestData = requestCounts.get(clientId);
  
  if (!requestData || now - requestData.resetTime > WINDOW_SIZE) {
    // New window or first request
    requestData = {
      count: 1,
      resetTime: now
    };
    requestCounts.set(clientId, requestData);
  } else {
    // Increment request count
    requestData.count++;
  }
  
  // Check if limit exceeded
  if (requestData.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((WINDOW_SIZE - (now - requestData.resetTime)) / 1000)
    });
  }
  
  // Set rate limit headers
  res.set({
    'X-RateLimit-Limit': MAX_REQUESTS,
    'X-RateLimit-Remaining': Math.max(0, MAX_REQUESTS - requestData.count),
    'X-RateLimit-Reset': new Date(requestData.resetTime + WINDOW_SIZE).toISOString()
  });
  
  next();
};

// Aggressive rate limiter for authentication endpoints
const authRateLimiter = (req, res, next) => {
  const clientId = req.ip || req.connection.remoteAddress || 'unknown';
  const authKey = `auth_${clientId}`;
  const now = Date.now();
  const AUTH_WINDOW = 15 * 60 * 1000; // 15 minutes
  const MAX_AUTH_ATTEMPTS = 10; // Max 10 auth attempts per 15 minutes
  
  let authData = requestCounts.get(authKey);
  
  if (!authData || now - authData.resetTime > AUTH_WINDOW) {
    authData = {
      count: 1,
      resetTime: now
    };
    requestCounts.set(authKey, authData);
  } else {
    authData.count++;
  }
  
  if (authData.count > MAX_AUTH_ATTEMPTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
      retryAfter: Math.ceil((AUTH_WINDOW - (now - authData.resetTime)) / 1000)
    });
  }
  
  next();
};

module.exports = {
  rateLimiter,
  authRateLimiter
};
