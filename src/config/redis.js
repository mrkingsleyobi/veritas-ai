/**
 * Redis Client Configuration
 *
 * Redis client setup with connection pooling and error handling
 * Implemented as a singleton to prevent connection exhaustion
 */

const Redis = require('ioredis');
const { redisConfig } = require('./database');

class RedisClient {
  constructor() {
    // Singleton pattern
    if (RedisClient.instance) {
      return RedisClient.instance;
    }

    this.client = null;
    this.subscriber = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.refCount = 0;

    RedisClient.instance = this;
  }

  async connect() {
    this.refCount++;

    // If already connected, return existing client
    if (this.isConnected && this.client) {
      console.log(`Redis client reused (ref count: ${this.refCount})`);

      return this.client;
    }

    try {
      // Main client for operations
      this.client = new Redis({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password,
        db: redisConfig.db,
        // keyPrefix is not used here because BullMQ requires prefix to be specified in queue options
        retryDelayOnFailover: redisConfig.retryDelayOnFailover,
        maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
        maxRetries: redisConfig.maxRetries,
        lazyConnect: true,
        reconnectOnError: (err) => {
          const targetError = 'READONLY';

          if (err.message.includes(targetError)) {
            return true; // or `return 1;`
          }
        }
      });

      // Event handlers
      this.client.on('connect', () => {
        console.log('Redis client connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.client.on('ready', () => {
        console.log('Redis client ready');
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
        this.reconnectAttempts++;
      });

      this.client.on('end', () => {
        console.log('Redis client connection ended');
        this.isConnected = false;
      });

      await this.client.connect();

      // Create subscriber client for pub/sub if needed
      this.subscriber = new Redis({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password,
        db: redisConfig.db,
        // keyPrefix is not used here because BullMQ requires prefix to be specified in queue options
        maxRetries: redisConfig.maxRetries,
        lazyConnect: true
      });

      return this.client;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.refCount--;
      throw error;
    }
  }

  async disconnect() {
    this.refCount--;

    // Only disconnect when no more references
    if (this.refCount <= 0) {
      try {
        if (this.client) {
          await this.client.quit();
        }
        if (this.subscriber) {
          await this.subscriber.quit();
        }
        this.isConnected = false;
        console.log('Redis clients disconnected');
      } catch (error) {
        console.error('Error disconnecting from Redis:', error);
      }
    } else {
      console.log(`Redis client reference released (remaining: ${this.refCount})`);
    }
  }

  getClient() {
    if (!this.isConnected) {
      throw new Error('Redis client is not connected');
    }

    return this.client;
  }

  getSubscriber() {
    if (!this.subscriber) {
      throw new Error('Redis subscriber is not initialized');
    }

    return this.subscriber;
  }

  isConnected() {
    return this.isConnected;
  }

  getRefCount() {
    return this.refCount;
  }
}

// Export singleton instance
module.exports = new RedisClient();
