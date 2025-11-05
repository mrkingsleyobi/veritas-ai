/**
 * Verification Result Repository
 *
 * Repository for verification result data access with caching
 */

const BaseRepository = require('./BaseRepository');
const VerificationResult = require('../models/VerificationResult');

class VerificationResultRepository extends BaseRepository {
  constructor(pool, redisClient) {
    super(pool, redisClient);
    this.tableName = 'verification_results';
    this.cachePrefix = 'verification_result:';
    this.defaultTTL = 1800; // 30 minutes
  }

  // Create table if not exists
  async initialize() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id SERIAL PRIMARY KEY,
        content_id VARCHAR(255) NOT NULL,
        authentic BOOLEAN NOT NULL DEFAULT false,
        confidence DECIMAL(5,4) NOT NULL DEFAULT 0.0,
        details JSONB NOT NULL DEFAULT '{}',
        metadata JSONB NOT NULL DEFAULT '{}',
        ruv_profile JSONB,
        fused_confidence DECIMAL(5,4),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        accessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        compressed BOOLEAN NOT NULL DEFAULT false,
        access_count INTEGER NOT NULL DEFAULT 0,
        INDEX idx_content_id (content_id),
        INDEX idx_created_at (created_at),
        INDEX idx_confidence (confidence),
        INDEX idx_accessed_at (accessed_at)
      )
    `;

    await this.executeQuery(createTableQuery);
  }

  // Get result by ID (with caching)
  async getById(id) {
    const cacheKey = `${this.cachePrefix}${id}`;

    // Try cache first
    const resultData = await this.getFromCache(cacheKey);

    if (resultData) {
      const result = VerificationResult.fromCache(resultData);

      result.updateAccess();

      return result;
    }

    // Fetch from database
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const result = await this.executeQuery(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const verificationResult = VerificationResult.fromRow(result.rows[0]);

    verificationResult.updateAccess();

    // Store in cache
    await this.setInCache(cacheKey, verificationResult.toCache(), this.defaultTTL);

    return verificationResult;
  }

  // Get results by content ID
  async getByContentId(contentId) {
    const query = `SELECT * FROM ${this.tableName} WHERE content_id = $1 ORDER BY created_at DESC LIMIT 10`;
    const result = await this.executeQuery(query, [contentId]);

    return result.rows.map(row => {
      const verificationResult = VerificationResult.fromRow(row);

      verificationResult.updateAccess();

      return verificationResult;
    });
  }

  // Create new verification result
  async create(verificationResult) {
    // Ensure we're working with a VerificationResult instance
    const result = verificationResult instanceof VerificationResult ? verificationResult : new VerificationResult(verificationResult);

    const now = new Date().toISOString();

    result.createdAt = now;
    result.updatedAt = now;
    result.updateAccess();

    const query = `
      INSERT INTO ${this.tableName} (
        content_id, authentic, confidence, details, metadata, ruv_profile,
        fused_confidence, created_at, updated_at, accessed_at, compressed, access_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `;

    const params = [
      result.contentId,
      result.authentic,
      result.confidence,
      JSON.stringify(result.details),
      JSON.stringify(result.metadata),
      result.ruvProfile ? JSON.stringify(result.ruvProfile) : null,
      result.fusedConfidence,
      result.createdAt,
      result.updatedAt,
      result.accessedAt,
      result.compressed,
      result.accessCount
    ];

    const queryResult = await this.executeQuery(query, params);

    result.id = queryResult.rows[0].id;

    // Store in cache
    const cacheKey = `${this.cachePrefix}${result.id}`;

    await this.setInCache(cacheKey, result.toCache(), this.defaultTTL);

    return result;
  }

  // Update verification result
  async update(verificationResult) {
    // Ensure we're working with a VerificationResult instance
    const result = verificationResult instanceof VerificationResult ? verificationResult : new VerificationResult(verificationResult);

    const now = new Date().toISOString();

    result.updatedAt = now;
    result.updateAccess();

    const query = `
      UPDATE ${this.tableName}
      SET authentic = $2, confidence = $3, details = $4, metadata = $5,
          ruv_profile = $6, fused_confidence = $7, updated_at = $8,
          accessed_at = $9, compressed = $10, access_count = $11
      WHERE id = $1
    `;

    const params = [
      result.id,
      result.authentic,
      result.confidence,
      JSON.stringify(result.details),
      JSON.stringify(result.metadata),
      result.ruvProfile ? JSON.stringify(result.ruvProfile) : null,
      result.fusedConfidence,
      result.updatedAt,
      result.accessedAt,
      result.compressed,
      result.accessCount
    ];

    await this.executeQuery(query, params);

    // Update cache
    const cacheKey = `${this.cachePrefix}${result.id}`;

    await this.setInCache(cacheKey, result.toCache(), this.defaultTTL);

    return result;
  }

  // Delete verification result
  async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1`;

    await this.executeQuery(query, [id]);

    // Remove from cache
    const cacheKey = `${this.cachePrefix}${id}`;

    await this.deleteFromCache(cacheKey);
  }

  // Get recent results (paginated)
  async getRecent(limit = 100, offset = 0) {
    const query = `
      SELECT * FROM ${this.tableName}
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await this.executeQuery(query, [limit, offset]);

    return result.rows.map(row => VerificationResult.fromRow(row));
  }

  // Get results by authenticity
  async getByAuthenticity(authentic, limit = 100) {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE authentic = $1
      ORDER BY confidence DESC, created_at DESC
      LIMIT $2
    `;
    const result = await this.executeQuery(query, [authentic, limit]);

    return result.rows.map(row => VerificationResult.fromRow(row));
  }

  // Get verification statistics
  async getVerificationStatistics() {
    const query = `
      SELECT
        COUNT(*) as total_results,
        COUNT(*) FILTER (WHERE authentic = true) as authentic_count,
        COUNT(*) FILTER (WHERE authentic = false) as inauthentic_count,
        AVG(confidence) as avg_confidence,
        AVG(CASE WHEN authentic = true THEN confidence ELSE NULL END) as avg_authentic_confidence,
        AVG(CASE WHEN authentic = false THEN confidence ELSE NULL END) as avg_inauthentic_confidence
      FROM ${this.tableName}
    `;

    const result = await this.executeQuery(query);

    return result.rows[0];
  }
}

module.exports = VerificationResultRepository;
