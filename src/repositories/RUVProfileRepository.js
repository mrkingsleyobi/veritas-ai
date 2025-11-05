/**
 * RUV Profile Repository
 *
 * Repository for RUV profile data access with caching and compression
 */

const BaseRepository = require('./BaseRepository');
const RUVProfile = require('../models/RUVProfile');

class RUVProfileRepository extends BaseRepository {
  constructor(pool, redisClient) {
    super(pool, redisClient);
    this.tableName = 'ruv_profiles';
    this.cachePrefix = 'ruv_profile:';
    this.defaultTTL = 3600; // 1 hour
    this.compressionThreshold = 86400000; // 24 hours in milliseconds
  }

  // Create table if not exists
  async initialize() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        content_id VARCHAR(255) PRIMARY KEY,
        reputation DECIMAL(5,4) NOT NULL DEFAULT 0.5,
        uniqueness DECIMAL(5,4) NOT NULL DEFAULT 0.5,
        verification DECIMAL(5,4) NOT NULL DEFAULT 0.5,
        fusion_score DECIMAL(5,4) NOT NULL DEFAULT 0.5,
        history JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        accessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        compressed BOOLEAN NOT NULL DEFAULT false,
        access_count INTEGER NOT NULL DEFAULT 0,
        INDEX idx_accessed_at (accessed_at),
        INDEX idx_access_count (access_count),
        INDEX idx_fusion_score (fusion_score)
      )
    `;

    await this.executeQuery(createTableQuery);
  }

  // Get profile by content ID (with caching)
  async getByContentId(contentId) {
    const cacheKey = `${this.cachePrefix}${contentId}`;

    // Try cache first
    const profileData = await this.getFromCache(cacheKey);

    if (profileData) {
      const profile = RUVProfile.fromCache(profileData);

      profile.updateAccess();

      return profile;
    }

    // Fetch from database
    const query = `SELECT * FROM ${this.tableName} WHERE content_id = $1`;
    const result = await this.executeQuery(query, [contentId]);

    if (result.rows.length === 0) {
      return null;
    }

    const profile = RUVProfile.fromRow(result.rows[0]);

    profile.updateAccess();

    // Store in cache
    await this.setInCache(cacheKey, profile.toCache(), this.defaultTTL);

    return profile;
  }

  // Create or update profile
  async save(profile) {
    // Ensure we're working with a RUVProfile instance
    const ruvProfile = profile instanceof RUVProfile ? profile : new RUVProfile(profile);

    const now = new Date().toISOString();

    ruvProfile.updatedAt = now;
    ruvProfile.updateAccess();

    const query = `
      INSERT INTO ${this.tableName} (
        content_id, reputation, uniqueness, verification, fusion_score,
        history, created_at, updated_at, accessed_at, compressed, access_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (content_id)
      DO UPDATE SET
        reputation = EXCLUDED.reputation,
        uniqueness = EXCLUDED.uniqueness,
        verification = EXCLUDED.verification,
        fusion_score = EXCLUDED.fusion_score,
        history = EXCLUDED.history,
        updated_at = EXCLUDED.updated_at,
        accessed_at = EXCLUDED.accessed_at,
        compressed = EXCLUDED.compressed,
        access_count = EXCLUDED.access_count
    `;

    const params = [
      ruvProfile.contentId,
      ruvProfile.reputation,
      ruvProfile.uniqueness,
      ruvProfile.verification,
      ruvProfile.fusionScore,
      JSON.stringify(ruvProfile.history),
      ruvProfile.createdAt,
      ruvProfile.updatedAt,
      ruvProfile.accessedAt,
      ruvProfile.compressed,
      ruvProfile.accessCount
    ];

    await this.executeQuery(query, params);

    // Update cache
    const cacheKey = `${this.cachePrefix}${ruvProfile.contentId}`;

    await this.setInCache(cacheKey, ruvProfile.toCache(), this.defaultTTL);

    return ruvProfile;
  }

  // Delete profile
  async delete(contentId) {
    const query = `DELETE FROM ${this.tableName} WHERE content_id = $1`;

    await this.executeQuery(query, [contentId]);

    // Remove from cache
    const cacheKey = `${this.cachePrefix}${contentId}`;

    await this.deleteFromCache(cacheKey);
  }

  // Get all profiles (paginated)
  async getAll(limit = 100, offset = 0) {
    const query = `
      SELECT * FROM ${this.tableName}
      ORDER BY accessed_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await this.executeQuery(query, [limit, offset]);

    return result.rows.map(row => RUVProfile.fromRow(row));
  }

  // Get profiles by fusion score range
  async getByFusionScoreRange(minScore, maxScore, limit = 100) {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE fusion_score BETWEEN $1 AND $2
      ORDER BY fusion_score DESC
      LIMIT $3
    `;
    const result = await this.executeQuery(query, [minScore, maxScore, limit]);

    return result.rows.map(row => RUVProfile.fromRow(row));
  }

  // Compress infrequently accessed profiles
  async compressInfrequentlyAccessedProfiles() {
    const threshold = Date.now() - this.compressionThreshold;
    const query = `
      UPDATE ${this.tableName}
      SET compressed = true,
          history = jsonb_set(history, '{0}', '{"compressed": true}')
      WHERE accessed_at < $1
        AND compressed = false
        AND jsonb_array_length(history) > 10
    `;

    const result = await this.executeQuery(query, [new Date(threshold).toISOString()]);

    return result.rowCount;
  }

  // Get access statistics
  async getAccessStatistics() {
    const query = `
      SELECT
        COUNT(*) as total_profiles,
        AVG(access_count) as avg_access_count,
        MAX(accessed_at) as last_accessed,
        MIN(created_at) as oldest_profile
      FROM ${this.tableName}
    `;

    const result = await this.executeQuery(query);

    return result.rows[0];
  }

  // Get compression statistics
  async getCompressionStatistics() {
    const query = `
      SELECT
        COUNT(*) as total_profiles,
        COUNT(*) FILTER (WHERE compressed = true) as compressed_profiles,
        AVG(CASE WHEN compressed = true THEN access_count ELSE NULL END) as avg_access_count_compressed,
        AVG(CASE WHEN compressed = false THEN access_count ELSE NULL END) as avg_access_count_uncompressed
      FROM ${this.tableName}
    `;

    const result = await this.executeQuery(query);

    return result.rows[0];
  }
}

module.exports = RUVProfileRepository;
