import Redis from 'ioredis';

let redisClient = null;
let isConnected = false;

/**
 * Initializes and returns the Redis client singleton.
 * Configured with resilient retry strategy, low connection timeouts,
 * and fail-open behavior (operations continue gracefully if Redis is unavailable).
 */
export function getRedisClient() {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      enableOfflineQueue: false, // Fail fast if Redis is down rather than buffering requests indefinitely
      retryStrategy(times) {
        if (times > 5) {
          // Reconnect with backoff capped at 10s
          return Math.min(times * 1000, 10000);
        }
        return 1000;
      },
      lazyConnect: false,
    });

    redisClient.on('connect', () => {
      isConnected = true;
      console.log('Connected to Redis');
    });

    redisClient.on('ready', () => {
      isConnected = true;
    });

    redisClient.on('error', (err) => {
      isConnected = false;
      // Log warning but don't crash - app will fall back to MongoDB
      console.warn('Redis warning (failing open to MongoDB):', err.message);
    });

    redisClient.on('close', () => {
      isConnected = false;
    });
  } catch (err) {
    console.warn('Failed to initialize Redis client (failing open):', err.message);
    redisClient = null;
    isConnected = false;
  }

  return redisClient;
}

/**
 * Express middleware to cache responses in Redis.
 * If Redis is unavailable or errors out, transparently bypasses cache and calls next().
 *
 * @param {Object} options
 * @param {number} options.ttlSeconds - Time to live in seconds (default 300)
 * @param {string} options.keyPrefix - Prefix for cache key
 */
export function cacheMiddleware({ ttlSeconds = 300, keyPrefix = 'cache' } = {}) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const client = getRedisClient();
    if (!client || !isConnected) {
      return next();
    }

    // Role-aware key if user exists so admin doesn't mix with public/learner view
    const roleSuffix = req.user?.role ? `:${req.user.role}` : '';
    const cacheKey = `${keyPrefix}:${req.originalUrl || req.url}${roleSuffix}`;

    try {
      const cached = await client.get(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.send(cached);
      }
    } catch (err) {
      console.warn(`Redis get error for key ${cacheKey} (failing open):`, err.message);
      return next();
    }

    // Wrap res.json or res.send to capture the response body and cache it
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      res.setHeader('X-Cache', 'MISS');
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const serialized = JSON.stringify(body);
          client.setex(cacheKey, ttlSeconds, serialized).catch((err) => {
            console.warn(`Redis setex error for key ${cacheKey}:`, err.message);
          });
        } catch (err) {
          console.warn('Failed to serialize cache data:', err.message);
        }
      }
      return originalJson(body);
    };

    next();
  };
}

/**
 * Invalidates cache keys matching a pattern (e.g. 'modules:*' or 'theory:*').
 * Uses SCAN instead of KEYS to avoid blocking the Redis event loop on memory-constrained servers.
 *
 * @param {string} pattern
 */
export async function invalidateCachePattern(pattern) {
  const client = getRedisClient();
  if (!client || !isConnected) return;

  try {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } while (cursor !== '0');
  } catch (err) {
    console.warn(`Error invalidating Redis cache pattern ${pattern}:`, err.message);
  }
}
