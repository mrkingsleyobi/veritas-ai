/**
 * Base Repository
 *
 * Base class for all repositories with common database operations
 */

class BaseRepository {
  constructor(pool, redisClient) {
    this.pool = pool;
    this.redis = redisClient;
  }

  // Execute a query with error handling
  async executeQuery(query, params = []) {
    const client = await this.pool.connect();

    try {
      const result = await client.query(query, params);

      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Execute a transaction
  async executeTransaction(queries) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const results = [];

      for (const { query, params } of queries) {
        const result = await client.query(query, params);

        results.push(result);
      }

      await client.query('COMMIT');

      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get item from cache
  async getFromCache(key) {
    try {
      const cached = await this.redis.get(key);

      if (cached) {
        return JSON.parse(cached);
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);

      return null;
    }
  }

  // Set item in cache
  async setInCache(key, value, ttl = 3600) {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // Delete item from cache
  async deleteFromCache(key) {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  // Get multiple items from cache
  async getMultipleFromCache(keys) {
    try {
      const cached = await this.redis.mget(...keys);

      return cached.map(item => item ? JSON.parse(item) : null);
    } catch (error) {
      console.error('Cache mget error:', error);

      return [];
    }
  }

  // Set multiple items in cache
  async setMultipleInCache(keyValuePairs, ttl = 3600) {
    try {
      const pipeline = this.redis.pipeline();

      for (const [key, value] of Object.entries(keyValuePairs)) {
        pipeline.setex(key, ttl, JSON.stringify(value));
      }
      await pipeline.exec();
    } catch (error) {
      console.error('Cache mset error:', error);
    }
  }
}

module.exports = BaseRepository;
