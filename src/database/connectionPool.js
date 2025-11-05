/**
 * Database Connection Pool
 *
 * Provides connection pooling for various database backends.
 */

const { Pool } = require('pg'); // PostgreSQL
const mysql = require('mysql2'); // MySQL
const sqlite3 = require('sqlite3').verbose(); // SQLite
const { MongoClient } = require('mongodb'); // MongoDB

class DatabasePool {
  constructor() {
    this.pools = new Map();
    this.connections = new Map();
  }

  /**
   * Initialize PostgreSQL connection pool
   * @param {string} name - Pool name
   * @param {Object} config - Database configuration
   * @returns {Pool} PostgreSQL pool
   */
  initPostgreSQLPool(name, config) {
    const pool = new Pool({
      connectionString: config.connectionString || process.env.DATABASE_URL,
      host: config.host || 'localhost',
      port: config.port || 5432,
      database: config.database || 'veritas',
      user: config.user || 'postgres',
      password: config.password || 'postgres',
      max: config.maxConnections || 20, // Maximum number of clients in the pool
      min: config.minConnections || 5,  // Minimum number of clients in the pool
      idleTimeoutMillis: config.idleTimeout || 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: config.connectionTimeout || 2000, // Return an error after 2 seconds if connection could not be established
      maxUses: config.maxUses || 7500 // Close (and replace) a connection after it has been used 7500 times
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });

    this.pools.set(name, pool);

    return pool;
  }

  /**
   * Initialize MySQL connection pool
   * @param {string} name - Pool name
   * @param {Object} config - Database configuration
   * @returns {mysql.Pool} MySQL pool
   */
  initMySQLPool(name, config) {
    const pool = mysql.createPool({
      host: config.host || 'localhost',
      port: config.port || 3306,
      user: config.user || 'root',
      password: config.password || 'root',
      database: config.database || 'veritas',
      connectionLimit: config.connectionLimit || 10,
      acquireTimeout: config.acquireTimeout || 60000,
      timeout: config.timeout || 60000,
      queueLimit: config.queueLimit || 0, // unlimited
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });

    this.pools.set(name, pool);

    return pool;
  }

  /**
   * Initialize SQLite connection
   * @param {string} name - Connection name
   * @param {string} filename - Database file path
   * @returns {sqlite3.Database} SQLite database
   */
  initSQLiteConnection(name, filename) {
    const db = new sqlite3.Database(filename || './veritas.db', (err) => {
      if (err) {
        console.error('SQLite connection error:', err);
      } else {
        console.log('Connected to SQLite database');
      }
    });

    // Enable WAL mode for better concurrency
    db.exec('PRAGMA journal_mode = WAL;', (err) => {
      if (err) {
        console.error('Failed to enable WAL mode:', err);
      }
    });

    // Enable foreign key constraints
    db.exec('PRAGMA foreign_keys = ON;', (err) => {
      if (err) {
        console.error('Failed to enable foreign keys:', err);
      }
    });

    this.connections.set(name, db);

    return db;
  }

  /**
   * Initialize MongoDB connection
   * @param {string} name - Connection name
   * @param {Object} config - MongoDB configuration
   * @returns {Promise<MongoClient>} MongoDB client
   */
  async initMongoDBConnection(name, config) {
    try {
      const client = new MongoClient(
        config.connectionString || process.env.MONGODB_URL || 'mongodb://localhost:27017',
        {
          maxPoolSize: config.maxPoolSize || 10,
          minPoolSize: config.minPoolSize || 5,
          maxIdleTimeMS: config.maxIdleTimeMS || 30000,
          serverSelectionTimeoutMS: config.serverSelectionTimeout || 5000,
          socketTimeoutMS: config.socketTimeout || 45000
        }
      );

      await client.connect();
      console.log('Connected to MongoDB');

      this.connections.set(name, client);

      return client;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  /**
   * Get PostgreSQL pool
   * @param {string} name - Pool name
   * @returns {Pool} PostgreSQL pool
   */
  getPostgreSQLPool(name) {
    return this.pools.get(name);
  }

  /**
   * Get MySQL pool
   * @param {string} name - Pool name
   * @returns {mysql.Pool} MySQL pool
   */
  getMySQLPool(name) {
    return this.pools.get(name);
  }

  /**
   * Get SQLite connection
   * @param {string} name - Connection name
   * @returns {sqlite3.Database} SQLite database
   */
  getSQLiteConnection(name) {
    return this.connections.get(name);
  }

  /**
   * Get MongoDB connection
   * @param {string} name - Connection name
   * @returns {MongoClient} MongoDB client
   */
  getMongoDBConnection(name) {
    return this.connections.get(name);
  }

  /**
   * Close PostgreSQL pool
   * @param {string} name - Pool name
   */
  async closePostgreSQLPool(name) {
    const pool = this.pools.get(name);

    if (pool) {
      await pool.end();
      this.pools.delete(name);
    }
  }

  /**
   * Close MySQL pool
   * @param {string} name - Pool name
   */
  closeMySQLPool(name) {
    const pool = this.pools.get(name);

    if (pool) {
      pool.end();
      this.pools.delete(name);
    }
  }

  /**
   * Close SQLite connection
   * @param {string} name - Connection name
   */
  closeSQLiteConnection(name) {
    const db = this.connections.get(name);

    if (db) {
      db.close();
      this.connections.delete(name);
    }
  }

  /**
   * Close MongoDB connection
   * @param {string} name - Connection name
   */
  async closeMongoDBConnection(name) {
    const client = this.connections.get(name);

    if (client) {
      await client.close();
      this.connections.delete(name);
    }
  }

  /**
   * Close all connections
   */
  async closeAll() {
    // Close all pools
    for (const [name, pool] of this.pools) {
      if (pool.constructor.name === 'Pool') {
        // PostgreSQL
        await pool.end();
      } else if (pool.constructor.name === 'Pool' && pool._allConnections) {
        // MySQL
        pool.end();
      }
    }

    // Close all connections
    for (const [name, connection] of this.connections) {
      if (connection.constructor.name === 'Database') {
        // SQLite
        connection.close();
      } else if (connection.constructor.name === 'MongoClient') {
        // MongoDB
        await connection.close();
      }
    }

    this.pools.clear();
    this.connections.clear();
  }
}

// Create singleton instance
const dbPool = new DatabasePool();

module.exports = { dbPool, DatabasePool };
