/**
 * Verification Result Model
 *
 * Data model for content authenticity verification results
 */

class VerificationResult {
  constructor(data = {}) {
    this.id = data.id || null;
    this.contentId = data.contentId || null;
    this.authentic = data.authentic || false;
    this.confidence = data.confidence || 0.0;
    this.details = data.details || {};
    this.metadata = data.metadata || {};
    this.ruvProfile = data.ruvProfile || null;
    this.fusedConfidence = data.fusedConfidence || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.accessedAt = data.accessedAt || new Date().toISOString();
    this.compressed = data.compressed || false;
    this.accessCount = data.accessCount || 0;
  }

  // Update access statistics
  updateAccess() {
    this.accessedAt = new Date().toISOString();
    this.accessCount += 1;
  }

  // Convert to database row format
  toRow() {
    return {
      id: this.id,
      content_id: this.contentId,
      authentic: this.authentic,
      confidence: this.confidence,
      details: JSON.stringify(this.details),
      metadata: JSON.stringify(this.metadata),
      ruv_profile: this.ruvProfile ? JSON.stringify(this.ruvProfile) : null,
      fused_confidence: this.fusedConfidence,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      accessed_at: this.accessedAt,
      compressed: this.compressed,
      access_count: this.accessCount
    };
  }

  // Create from database row
  static fromRow(row) {
    // Helper function to safely parse JSON
    const safeJsonParse = (str, defaultValue = {}) => {
      if (!str) {
        return defaultValue;
      }
      try {
        return JSON.parse(str);
      } catch (error) {
        console.warn('Failed to parse JSON:', error);

        return defaultValue;
      }
    };

    return new VerificationResult({
      id: row.id,
      contentId: row.content_id,
      authentic: row.authentic,
      confidence: parseFloat(row.confidence),
      details: safeJsonParse(row.details, {}),
      metadata: safeJsonParse(row.metadata, {}),
      ruvProfile: safeJsonParse(row.ruv_profile, null),
      fusedConfidence: row.fused_confidence ? parseFloat(row.fused_confidence) : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      accessedAt: row.accessed_at,
      compressed: row.compressed,
      accessCount: parseInt(row.access_count)
    });
  }

  // Convert to cache format
  toCache() {
    return {
      id: this.id,
      contentId: this.contentId,
      authentic: this.authentic,
      confidence: this.confidence,
      details: this.details,
      metadata: this.metadata,
      ruvProfile: this.ruvProfile,
      fusedConfidence: this.fusedConfidence,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      accessedAt: this.accessedAt,
      compressed: this.compressed,
      accessCount: this.accessCount
    };
  }

  // Create from cache format
  static fromCache(data) {
    return new VerificationResult({
      id: data.id,
      contentId: data.contentId,
      authentic: data.authentic,
      confidence: data.confidence,
      details: data.details,
      metadata: data.metadata,
      ruvProfile: data.ruvProfile,
      fusedConfidence: data.fusedConfidence,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      accessedAt: data.accessedAt,
      compressed: data.compressed,
      accessCount: data.accessCount
    });
  }
}

module.exports = VerificationResult;
