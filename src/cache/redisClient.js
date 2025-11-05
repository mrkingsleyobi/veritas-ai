/**
 * Redis Cache Client
 *
 * Provides distributed caching functionality for RUV profiles and verification results.
 */

const Redis = require('ioredis');

class RedisCache {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    try {
      // Use environment variables or default to localhost
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      this.client = new Redis(redisUrl, {
        retryStrategy: (times) => {
          // Retry after increasing delays
          return Math.min(times * 50, 2000);
        },
        maxRetriesPerRequest: 3,
        connectTimeout: 10000,
        lazyConnect: true
      });

      // Handle connection events
      this.client.on('connect', () => {
        console.log('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('Redis client error:', err);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('Redis client connection closed');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        console.log('Redis client reconnecting...');
      });

      // Connect to Redis
      await this.client.connect();

      return true;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.isConnected = false;

      return false;
    }
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null
   */
  async get(key) {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);

      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);

      return null;
    }
  }

  /**
   * Set value in cache with expiration
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 1 hour)
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value, ttl = 3600) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      const result = await this.client.setex(key, ttl, serializedValue);

      return result === 'OK';
    } catch (error) {
      console.error('Redis SET error:', error);

      return false;
    }
  }

  /**
   * Delete key from cache
   * @param {string} key - Cache key
   * @returns {Promise<number>} Number of keys deleted
   */
  async del(key) {
    if (!this.isConnected || !this.client) {
      return 0;
    }

    try {
      return await this.client.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);

      return 0;
    }
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Existence status
   */
  async exists(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);

      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);

      return false;
    }
  }

  /**
   * Set multiple values in cache
   * @param {Object} keyValuePairs - Object with key-value pairs
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async mset(keyValuePairs, ttl = 3600) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const serializedPairs = [];

      for (const [key, value] of Object.entries(keyValuePairs)) {
        serializedPairs.push(key, JSON.stringify(value));
      }

      const result = await this.client.mset(serializedPairs);

      // Set expiration for all keys
      const keys = Object.keys(keyValuePairs);

      if (keys.length > 0) {
        const pipeline = this.client.pipeline();

        for (const key of keys) {
          pipeline.expire(key, ttl);
        }
        await pipeline.exec();
      }

      return result === 'OK';
    } catch (error) {
      console.error('Redis MSET error:', error);

      return false;
    }
  }

  /**
   * Get multiple values from cache
   * @param {Array<string>} keys - Array of cache keys
   * @returns {Promise<Array<any>>} Array of values
   */
  async mget(keys) {
    if (!this.isConnected || !this.client) {
      return [];
    }

    try {
      const values = await this.client.mget(keys);

      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      console.error('Redis MGET error:', error);

      return [];
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect() {
    if (this.client) {
      try {
        await this.client.quit();
        this.isConnected = false;
      } catch (error) {
        console.error('Error disconnecting from Redis:', error);
      }
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} Cache statistics
   */
  async getStats() {
    if (!this.isConnected || !this.client) {
      return {};
    }

    try {
      const info = await this.client.info();
      const lines = info.split('\n');
      const stats = {};

      for (const line of lines) {
        if (line.includes(':')) {
          const [key, value] = line.split(':');

          stats[key.trim()] = value ? value.trim() : '';
        }
      }

      return stats;
    } catch (error) {
      console.error('Redis INFO error:', error);

      return {};
    }
  }
}

// Create singleton instance
const redisCache = new RedisCache();

module.exports = { redisCache, RedisCache };
