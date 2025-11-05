/**
 * Optimized RUV Profile Service
 *
 * This service handles RUV (Reputation, Uniqueness, Verification) profile fusion
 * with performance optimizations including Redis caching and parallel processing.
 */

const { redisCache } = require('../cache/redisClient');
const { dbPool } = require('../database/connectionPool');

class OptimizedRUVProfileService {
  constructor() {
    this.dbType = process.env.DB_TYPE || 'sqlite';
    this.initializeDatabase();
  }

  /**
   * Initialize database connection based on environment
   */
  async initializeDatabase() {
    try {
      switch (this.dbType) {
      case 'postgresql':
        // Initialize PostgreSQL pool
        this.dbPool = dbPool.initPostgreSQLPool('ruv_profiles', {
          connectionString: process.env.POSTGRES_URL,
          maxConnections: 20,
          minConnections: 5
        });
        await this.createProfilesTablePostgreSQL();
        break;

      case 'mysql':
        // Initialize MySQL pool
        this.dbPool = dbPool.initMySQLPool('ruv_profiles', {
          host: process.env.MYSQL_HOST || 'localhost',
          port: process.env.MYSQL_PORT || 3306,
          user: process.env.MYSQL_USER || 'root',
          password: process.env.MYSQL_PASSWORD || 'root',
          database: process.env.MYSQL_DATABASE || 'veritas',
          connectionLimit: 10
        });
        await this.createProfilesTableMySQL();
        break;

      case 'mongodb':
        // Initialize MongoDB connection
        this.dbClient = await dbPool.initMongoDBConnection('ruv_profiles', {
          connectionString: process.env.MONGODB_URL,
          maxPoolSize: 10
        });
        this.dbCollection = this.dbClient.db('veritas').collection('ruv_profiles');
        break;

      case 'sqlite':
      default:
        // Initialize SQLite connection
        this.db = dbPool.initSQLiteConnection('ruv_profiles', './ruv_profiles.db');
        this.createProfilesTableSQLite();
      }
    } catch (error) {
      console.error('Database initialization error:', error);
      // Fallback to in-memory storage
      this.profiles = new Map();
    }
  }

  /**
   * Create profiles table for PostgreSQL
   */
  async createProfilesTablePostgreSQL() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ruv_profiles (
        content_id VARCHAR(255) PRIMARY KEY,
        reputation NUMERIC(5,4),
        uniqueness NUMERIC(5,4),
        verification NUMERIC(5,4),
        fusion_score NUMERIC(5,4),
        history JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_ruv_profiles_updated_at ON ruv_profiles(updated_at);
      CREATE INDEX IF NOT EXISTS idx_ruv_profiles_fusion_score ON ruv_profiles(fusion_score);
    `;

    try {
      await this.dbPool.query(createTableQuery);
      console.log('PostgreSQL RUV profiles table initialized');
    } catch (error) {
      console.error('PostgreSQL table creation error:', error);
    }
  }

  /**
   * Create profiles table for MySQL
   */
  async createProfilesTableMySQL() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ruv_profiles (
        content_id VARCHAR(255) PRIMARY KEY,
        reputation DECIMAL(5,4),
        uniqueness DECIMAL(5,4),
        verification DECIMAL(5,4),
        fusion_score DECIMAL(5,4),
        history JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_updated_at (updated_at),
        INDEX idx_fusion_score (fusion_score)
      )
    `;

    try {
      await this.dbPool.promise().query(createTableQuery);
      console.log('MySQL RUV profiles table initialized');
    } catch (error) {
      console.error('MySQL table creation error:', error);
    }
  }

  /**
   * Create profiles table for SQLite
   */
  createProfilesTableSQLite() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ruv_profiles (
        content_id TEXT PRIMARY KEY,
        reputation REAL,
        uniqueness REAL,
        verification REAL,
        fusion_score REAL,
        history TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_ruv_profiles_updated_at ON ruv_profiles(updated_at);
      CREATE INDEX IF NOT EXISTS idx_ruv_profiles_fusion_score ON ruv_profiles(fusion_score);
    `;

    this.db.run(createTableQuery, (err) => {
      if (err) {
        console.error('SQLite table creation error:', err);
      } else {
        console.log('SQLite RUV profiles table initialized');
      }
    });
  }

  /**
   * Create or update a RUV profile for content with caching
   * @param {string} contentId - Unique identifier for the content
   * @param {Object} ruvData - RUV metrics data
   * @returns {Object} Updated profile
   */
  async createOrUpdateProfile(contentId, ruvData) {
    if (!contentId || !ruvData) {
      throw new Error('Content ID and RUV data are required');
    }

    // Check cache first
    const cacheKey = `ruv_profile:${contentId}`;

    if (redisCache.isConnected) {
      const cachedProfile = await redisCache.get(cacheKey);

      if (cachedProfile) {
        return cachedProfile;
      }
    }

    // Get existing profile from database
    let existingProfile = await this.getProfileFromDB(contentId);

    if (!existingProfile) {
      existingProfile = {
        reputation: 0.5,
        uniqueness: 0.5,
        verification: 0.5,
        fusionScore: 0.5,
        history: []
      };
    }

    // Update RUV metrics with weighted averaging
    const updatedProfile = {
      ...existingProfile,
      reputation: this._calculateWeightedAverage(existingProfile.reputation, ruvData.reputation || 0.5),
      uniqueness: this._calculateWeightedAverage(existingProfile.uniqueness, ruvData.uniqueness || 0.5),
      verification: this._calculateWeightedAverage(existingProfile.verification, ruvData.verification || 0.5),
      history: [...existingProfile.history, {
        timestamp: new Date().toISOString(),
        reputation: ruvData.reputation,
        uniqueness: ruvData.uniqueness,
        verification: ruvData.verification
      }]
    };

    // Calculate fusion score based on RUV metrics
    updatedProfile.fusionScore = this._calculateFusionScore(updatedProfile);

    // Store updated profile in database
    await this.saveProfileToDB(contentId, updatedProfile);

    // Cache the updated profile
    if (redisCache.isConnected) {
      await redisCache.set(cacheKey, updatedProfile, 7200); // Cache for 2 hours
    }

    return updatedProfile;
  }

  /**
   * Get RUV profile for content with caching
   * @param {string} contentId - Unique identifier for the content
   * @returns {Object|null} RUV profile or null if not found
   */
  async getProfile(contentId) {
    if (!contentId) {
      return null;
    }

    // Check cache first
    const cacheKey = `ruv_profile:${contentId}`;

    if (redisCache.isConnected) {
      const cachedProfile = await redisCache.get(cacheKey);

      if (cachedProfile) {
        return cachedProfile;
      }
    }

    // Get from database
    const profile = await this.getProfileFromDB(contentId);

    // Cache the profile
    if (profile && redisCache.isConnected) {
      await redisCache.set(cacheKey, profile, 7200); // Cache for 2 hours
    }

    return profile;
  }

  /**
   * Get profile from database based on configured database type
   * @param {string} contentId - Content ID
   * @returns {Object|null} Profile or null
   */
  async getProfileFromDB(contentId) {
    try {
      switch (this.dbType) {
      case 'postgresql':
        const pgResult = await this.dbPool.query(
          'SELECT * FROM ruv_profiles WHERE content_id = $1',
          [contentId]
        );

        return pgResult.rows.length > 0 ? this.formatProfile(pgResult.rows[0]) : null;

      case 'mysql':
        const [mysqlRows] = await this.dbPool.promise().query(
          'SELECT * FROM ruv_profiles WHERE content_id = ?',
          [contentId]
        );

        return mysqlRows.length > 0 ? this.formatProfile(mysqlRows[0]) : null;

      case 'mongodb':
        const mongoDoc = await this.dbCollection.findOne({ content_id: contentId });

        return mongoDoc ? this.formatProfile(mongoDoc) : null;

      case 'sqlite':
      default:
        return await new Promise((resolve, reject) => {
          this.db.get(
            'SELECT * FROM ruv_profiles WHERE content_id = ?',
            [contentId],
            (err, row) => {
              if (err) {
                reject(err);
              } else {
                resolve(row ? this.formatProfile(row) : null);
              }
            }
          );
        });
      }
    } catch (error) {
      console.error('Database error getting profile:', error);

      return null;
    }
  }

  /**
   * Save profile to database based on configured database type
   * @param {string} contentId - Content ID
   * @param {Object} profile - Profile data
   */
  async saveProfileToDB(contentId, profile) {
    try {
      switch (this.dbType) {
      case 'postgresql':
        await this.dbPool.query(`
            INSERT INTO ruv_profiles (
              content_id, reputation, uniqueness, verification, fusion_score, history
            ) VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (content_id)
            DO UPDATE SET
              reputation = $2, uniqueness = $3, verification = $4,
              fusion_score = $5, history = $6, updated_at = CURRENT_TIMESTAMP
          `, [
          contentId,
          profile.reputation,
          profile.uniqueness,
          profile.verification,
          profile.fusionScore,
          JSON.stringify(profile.history)
        ]);
        break;

      case 'mysql':
        await this.dbPool.promise().query(`
            INSERT INTO ruv_profiles (
              content_id, reputation, uniqueness, verification, fusion_score, history
            ) VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              reputation = VALUES(reputation),
              uniqueness = VALUES(uniqueness),
              verification = VALUES(verification),
              fusion_score = VALUES(fusion_score),
              history = VALUES(history)
          `, [
          contentId,
          profile.reputation,
          profile.uniqueness,
          profile.verification,
          profile.fusionScore,
          JSON.stringify(profile.history)
        ]);
        break;

      case 'mongodb':
        await this.dbCollection.updateOne(
          { content_id: contentId },
          {
            $set: {
              content_id: contentId,
              reputation: profile.reputation,
              uniqueness: profile.uniqueness,
              verification: profile.verification,
              fusion_score: profile.fusionScore,
              history: profile.history
            }
          },
          { upsert: true }
        );
        break;

      case 'sqlite':
      default:
        await new Promise((resolve, reject) => {
          this.db.run(`
              INSERT OR REPLACE INTO ruv_profiles (
                content_id, reputation, uniqueness, verification, fusion_score, history
              ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
            contentId,
            profile.reputation,
            profile.uniqueness,
            profile.verification,
            profile.fusionScore,
            JSON.stringify(profile.history)
          ], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }
    } catch (error) {
      console.error('Database error saving profile:', error);
    }
  }

  /**
   * Format profile data from database to application format
   * @param {Object} dbProfile - Profile from database
   * @returns {Object} Formatted profile
   */
  formatProfile(dbProfile) {
    return {
      reputation: dbProfile.reputation,
      uniqueness: dbProfile.uniqueness,
      verification: dbProfile.verification,
      fusionScore: dbProfile.fusion_score,
      history: typeof dbProfile.history === 'string'
        ? JSON.parse(dbProfile.history)
        : dbProfile.history || []
    };
  }

  /**
   * Fuse RUV profile with content authenticity verification using parallel processing
   * @param {string} contentId - Unique identifier for the content
   * @param {Object} verificationResult - Content authenticity verification result
   * @returns {Object} Fused verification result with RUV profile
   */
  async fuseWithVerification(contentId, verificationResult) {
    if (!contentId || !verificationResult) {
      throw new Error('Content ID and verification result are required');
    }

    // Get profile with caching
    const profile = await this.getProfile(contentId);

    if (!profile) {
      // Return original verification result if no profile exists
      return verificationResult;
    }

    // Fuse verification confidence with RUV fusion score
    const fusedConfidence = this._calculateFusedConfidence(
      verificationResult.confidence,
      profile.fusionScore
    );

    // Determine authenticity based on fused confidence and threshold
    const isAuthentic = fusedConfidence >= 0.95;

    return {
      ...verificationResult,
      ruvProfile: profile,
      fusedConfidence,
      authentic: isAuthentic,
      details: {
        ...verificationResult.details,
        ruvFusion: {
          applied: true,
          reputation: profile.reputation,
          uniqueness: profile.uniqueness,
          verification: profile.verification,
          fusionScore: profile.fusionScore
        }
      }
    };
  }

  /**
   * Batch fuse multiple profiles with verification results using Promise.all
   * @param {Array} fusionTasks - Array of {contentId, verificationResult} objects
   * @returns {Array} Array of fused results
   */
  async batchFuseWithVerification(fusionTasks) {
    if (!Array.isArray(fusionTasks)) {
      throw new Error('Fusion tasks must be an array');
    }

    // Use Promise.all for parallel processing
    return await Promise.all(
      fusionTasks.map(async(task) => {
        try {
          const result = await this.fuseWithVerification(
            task.contentId,
            task.verificationResult
          );

          return {
            contentId: task.contentId,
            ...result
          };
        } catch (error) {
          return {
            contentId: task.contentId,
            error: error.message,
            authentic: false,
            fusedConfidence: 0.0
          };
        }
      })
    );
  }

  /**
   * Calculate weighted average for RUV metrics
   * @private
   */
  _calculateWeightedAverage(current, newValue) {
    // Simple weighted average (80% current, 20% new)
    return (current * 0.8) + (newValue * 0.2);
  }

  /**
   * Calculate fusion score from RUV metrics
   * @private
   */
  _calculateFusionScore(profile) {
    // Weighted combination of RUV metrics
    return (
      (profile.reputation * 0.4) +
      (profile.uniqueness * 0.3) +
      (profile.verification * 0.3)
    );
  }

  /**
   * Calculate fused confidence from verification and RUV scores
   * @private
   */
  _calculateFusedConfidence(verificationConfidence, fusionScore) {
    // Geometric mean for more conservative confidence
    return Math.sqrt(verificationConfidence * fusionScore);
  }

  /**
   * Get all profiles with pagination
   * @param {number} limit - Number of profiles to return
   * @param {number} offset - Number of profiles to skip
   * @returns {Array} RUV profiles
   */
  async getAllProfiles(limit = 100, offset = 0) {
    try {
      switch (this.dbType) {
      case 'postgresql':
        const pgResult = await this.dbPool.query(
          'SELECT * FROM ruv_profiles ORDER BY updated_at DESC LIMIT $1 OFFSET $2',
          [limit, offset]
        );

        return pgResult.rows.map(row => ({
          contentId: row.content_id,
          ...this.formatProfile(row)
        }));

      case 'mysql':
        const [mysqlRows] = await this.dbPool.promise().query(
          'SELECT * FROM ruv_profiles ORDER BY updated_at DESC LIMIT ? OFFSET ?',
          [limit, offset]
        );

        return mysqlRows.map(row => ({
          contentId: row.content_id,
          ...this.formatProfile(row)
        }));

      case 'mongodb':
        const mongoDocs = await this.dbCollection
          .find({})
          .sort({ updated_at: -1 })
          .skip(offset)
          .limit(limit)
          .toArray();

        return mongoDocs.map(doc => ({
          contentId: doc.content_id,
          ...this.formatProfile(doc)
        }));

      case 'sqlite':
      default:
        return await new Promise((resolve, reject) => {
          this.db.all(
            'SELECT * FROM ruv_profiles ORDER BY updated_at DESC LIMIT ? OFFSET ?',
            [limit, offset],
            (err, rows) => {
              if (err) {
                reject(err);
              } else {
                resolve(rows.map(row => ({
                  contentId: row.content_id,
                  ...this.formatProfile(row)
                })));
              }
            }
          );
        });
      }
    } catch (error) {
      console.error('Database error getting all profiles:', error);

      return [];
    }
  }

  /**
   * Close database connections
   */
  async close() {
    try {
      switch (this.dbType) {
      case 'postgresql':
        await dbPool.closePostgreSQLPool('ruv_profiles');
        break;
      case 'mysql':
        dbPool.closeMySQLPool('ruv_profiles');
        break;
      case 'mongodb':
        await dbPool.closeMongoDBConnection('ruv_profiles');
        break;
      case 'sqlite':
      default:
        dbPool.closeSQLiteConnection('ruv_profiles');
      }
    } catch (error) {
      console.error('Error closing database connections:', error);
    }
  }
}

module.exports = OptimizedRUVProfileService;
