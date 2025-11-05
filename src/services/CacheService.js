/**
 * Cache Service
 *
 * Advanced caching service with LRU eviction policy and memory monitoring
 */

const { redisConfig } = require('../config/database');

class CacheService {
  constructor(redisClient) {
    this.redis = redisClient;
    this.maxMemory = process.env.CACHE_MAX_MEMORY || '100mb';
    this.evictionPolicy = process.env.CACHE_EVICTION_POLICY || 'allkeys-lru';
    this.memoryCheckInterval = parseInt(process.env.CACHE_MEMORY_CHECK_INTERVAL) || 30000; // 30 seconds
    this.memoryAlertThreshold = parseInt(process.env.CACHE_MEMORY_ALERT_THRESHOLD) || 80; // 80%
    this.compressionThreshold = parseInt(process.env.CACHE_COMPRESSION_THRESHOLD) || 10000; // 10KB
    this.monitoringEnabled = process.env.CACHE_MONITORING_ENABLED === 'true';

    this.memoryMonitoringInterval = null;
    this.alertCallbacks = [];
  }

  // Initialize cache configuration
  async initialize() {
    try {
      // Configure Redis for LRU eviction
      await this.redis.config('SET', 'maxmemory', this.maxMemory);
      await this.redis.config('SET', 'maxmemory-policy', this.evictionPolicy);

      console.log(`Cache initialized with ${this.maxMemory} max memory and ${this.evictionPolicy} eviction policy`);

      // Start memory monitoring if enabled
      if (this.monitoringEnabled) {
        this.startMemoryMonitoring();
      }
    } catch (error) {
      console.error('Failed to initialize cache:', error);
      throw error;
    }
  }

  // Start memory monitoring
  startMemoryMonitoring() {
    if (this.memoryMonitoringInterval) {
      clearInterval(this.memoryMonitoringInterval);
    }

    this.memoryMonitoringInterval = setInterval(async() => {
      try {
        await this.checkMemoryUsage();
      } catch (error) {
        console.error('Memory monitoring error:', error);
      }
    }, this.memoryCheckInterval);
  }

  // Stop memory monitoring
  stopMemoryMonitoring() {
    if (this.memoryMonitoringInterval) {
      clearInterval(this.memoryMonitoringInterval);
      this.memoryMonitoringInterval = null;
    }
  }

  // Check memory usage and trigger alerts
  async checkMemoryUsage() {
    try {
      const info = await this.redis.info('memory');
      const memoryInfo = this.parseRedisInfo(info);

      const usedMemory = parseInt(memoryInfo.used_memory);
      const maxMemory = parseInt(memoryInfo.maxmemory);

      if (maxMemory > 0) {
        const usagePercent = (usedMemory / maxMemory) * 100;

        if (usagePercent >= this.memoryAlertThreshold) {
          const alertData = {
            timestamp: new Date().toISOString(),
            usagePercent: usagePercent,
            usedMemory: usedMemory,
            maxMemory: maxMemory
          };

          // Trigger alert callbacks
          for (const callback of this.alertCallbacks) {
            try {
              await callback(alertData);
            } catch (error) {
              console.error('Alert callback error:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Memory usage check failed:', error);
    }
  }

  // Parse Redis info response
  parseRedisInfo(info) {
    const result = {};
    const lines = info.split('\n');

    for (const line of lines) {
      const [key, value] = line.split(':');

      if (key && value) {
        result[key.trim()] = value.trim();
      }
    }

    return result;
  }

  // Register alert callback
  onMemoryAlert(callback) {
    if (typeof callback === 'function') {
      this.alertCallbacks.push(callback);
    }
  }

  // Get item from cache
  async get(key) {
    try {
      const value = await this.redis.get(key);

      if (value) {
        // Check if value is compressed
        if (value.startsWith('zlib:')) {
          const compressedData = value.substring(5);
          const decompressed = await this.decompressData(compressedData);

          return JSON.parse(decompressed);
        }

        return JSON.parse(value);
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);

      return null;
    }
  }

  // Set item in cache
  async set(key, value, ttl = 3600) {
    try {
      let stringValue = JSON.stringify(value);

      // Compress large values
      if (stringValue.length > this.compressionThreshold) {
        const compressed = await this.compressData(stringValue);

        stringValue = `zlib:${compressed}`;
      }

      await this.redis.setex(key, ttl, stringValue);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // Delete item from cache
  async delete(key) {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  // Get multiple items from cache
  async getMultiple(keys) {
    try {
      const values = await this.redis.mget(...keys);

      return values.map(value => {
        if (value) {
          // Check if value is compressed
          if (value.startsWith('zlib:')) {
            const compressedData = value.substring(5);
            const decompressed = this.decompressData(compressedData);

            return JSON.parse(decompressed);
          }

          return JSON.parse(value);
        }

        return null;
      });
    } catch (error) {
      console.error('Cache mget error:', error);

      return [];
    }
  }

  // Set multiple items in cache
  async setMultiple(keyValuePairs, ttl = 3600) {
    try {
      const pipeline = this.redis.pipeline();

      for (const [key, value] of Object.entries(keyValuePairs)) {
        let stringValue = JSON.stringify(value);

        // Compress large values
        if (stringValue.length > this.compressionThreshold) {
          const compressed = await this.compressData(stringValue);

          stringValue = `zlib:${compressed}`;
        }

        pipeline.setex(key, ttl, stringValue);
      }

      await pipeline.exec();
    } catch (error) {
      console.error('Cache mset error:', error);
    }
  }

  // Compress data
  async compressData(data) {
    // In a real implementation, you would use zlib or similar
    // For this implementation, we'll just return the data as-is
    // to avoid adding additional dependencies
    return data;
  }

  // Decompress data
  async decompressData(data) {
    // In a real implementation, you would use zlib or similar
    // For this implementation, we'll just return the data as-is
    // to avoid adding additional dependencies
    return data;
  }

  // Get cache statistics
  async getStats() {
    try {
      const info = await this.redis.info();
      const memoryInfo = await this.redis.info('memory');
      const statsInfo = await this.redis.info('stats');

      return {
        info: this.parseRedisInfo(info),
        memory: this.parseRedisInfo(memoryInfo),
        stats: this.parseRedisInfo(statsInfo)
      };
    } catch (error) {
      console.error('Cache stats error:', error);

      return null;
    }
  }

  // Clear cache
  async clear() {
    try {
      await this.redis.flushdb();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  // Close connection
  async close() {
    this.stopMemoryMonitoring();
  }
}

module.exports = CacheService;
