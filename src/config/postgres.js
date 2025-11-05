/**
 * PostgreSQL Client Configuration
 *
 * PostgreSQL client setup with connection pooling and error handling
 * Implemented as a singleton to prevent connection pool exhaustion
 */

const { Pool } = require('pg');
const { postgresConfig } = require('./database');

class PostgreSQLClient {
  constructor() {
    if (PostgreSQLClient.instance) {
      return PostgreSQLClient.instance;
    }

    this.pool = null;
    this.isConnected = false;
    this.refCount = 0;

    PostgreSQLClient.instance = this;
  }

  async connect() {
    this.refCount++;

    if (this.isConnected && this.pool) {
      console.log(`PostgreSQL client reused (ref count: ${this.refCount})`);

      return this.pool;
    }

    try {
      this.pool = new Pool({
        host: postgresConfig.host,
        port: postgresConfig.port,
        database: postgresConfig.database,
        user: postgresConfig.user,
        password: postgresConfig.password,
        ssl: postgresConfig.ssl,
        max: postgresConfig.max,
        min: postgresConfig.min,
        idleTimeoutMillis: postgresConfig.idleTimeoutMillis,
        connectionTimeoutMillis: postgresConfig.connectionTimeoutMillis,
        // Connection validation
        validate: (client) => {
          return client.query('SELECT 1');
        }
      });

      // Event handlers
      this.pool.on('connect', (client) => {
        console.log('PostgreSQL client connected');
        this.isConnected = true;
      });

      this.pool.on('error', (err, client) => {
        console.error('PostgreSQL client error:', err);
        this.isConnected = false;
      });

      this.pool.on('remove', (client) => {
        console.log('PostgreSQL client removed from pool');
      });

      this.pool.on('acquire', (client) => {
        console.log('PostgreSQL client acquired from pool');
      });

      // Test connection
      const client = await this.pool.connect();

      await client.query('SELECT NOW()');
      client.release();

      console.log('PostgreSQL connection established successfully');
      this.isConnected = true;

      return this.pool;
    } catch (error) {
      console.error('Failed to connect to PostgreSQL:', error);
      this.refCount--;
      throw error;
    }
  }

  async disconnect() {
    this.refCount--;

    // Only disconnect when no more references
    if (this.refCount <= 0) {
      try {
        if (this.pool) {
          await this.pool.end();
          this.isConnected = false;
          console.log('PostgreSQL pool disconnected');
        }
      } catch (error) {
        console.error('Error disconnecting from PostgreSQL:', error);
      }
    } else {
      console.log(`PostgreSQL client reference released (remaining: ${this.refCount})`);
    }
  }

  getPool() {
    if (!this.isConnected) {
      throw new Error('PostgreSQL pool is not connected');
    }

    return this.pool;
  }

  isConnected() {
    return this.isConnected;
  }

  getRefCount() {
    return this.refCount;
  }

  // Health check
  async healthCheck() {
    try {
      if (!this.pool) {
        return {
          status: 'unhealthy',
          error: 'Pool not initialized'
        };
      }

      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW() as now');

      client.release();

      return {
        status: 'healthy',
        timestamp: result.rows[0].now
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

// Export singleton instance
module.exports = new PostgreSQLClient();
