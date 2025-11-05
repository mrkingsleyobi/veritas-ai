/**
 * Database Configuration
 *
 * Configuration for PostgreSQL and Redis connections
 */

const dotenv = require('dotenv');

dotenv.config();

// PostgreSQL configuration
const postgresConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
  database: process.env.POSTGRES_DB || 'veritas_ai',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  ssl: process.env.POSTGRES_SSL === 'true',
  max: parseInt(process.env.POSTGRES_POOL_MAX) || (process.env.NODE_ENV === 'test' ? 5 : 20),
  min: parseInt(process.env.POSTGRES_POOL_MIN) || (process.env.NODE_ENV === 'test' ? 1 : 5),
  idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: parseInt(process.env.POSTGRES_CONNECTION_TIMEOUT) || 2000
};

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || null,
  db: parseInt(process.env.REDIS_DB) || 0,
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'veritas:',
  retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY) || 1000,
  // BullMQ requires maxRetriesPerRequest to be null
  maxRetriesPerRequest: null,
  maxRetries: process.env.NODE_ENV === 'test' ? 1 : 10
};

module.exports = {
  postgresConfig,
  redisConfig
};
