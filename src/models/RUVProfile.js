/**
 * RUV Profile Model
 *
 * Data model for RUV (Reputation, Uniqueness, Verification) profiles
 */

class RUVProfile {
  constructor(data = {}) {
    this.contentId = data.contentId || null;
    this.reputation = data.reputation || 0.5;
    this.uniqueness = data.uniqueness || 0.5;
    this.verification = data.verification || 0.5;
    this.fusionScore = data.fusionScore || 0.5;
    this.history = data.history || [];
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
      content_id: this.contentId,
      reputation: this.reputation,
      uniqueness: this.uniqueness,
      verification: this.verification,
      fusion_score: this.fusionScore,
      history: JSON.stringify(this.history),
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
    const safeJsonParse = (str, defaultValue = []) => {
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

    return new RUVProfile({
      contentId: row.content_id,
      reputation: parseFloat(row.reputation),
      uniqueness: parseFloat(row.uniqueness),
      verification: parseFloat(row.verification),
      fusionScore: parseFloat(row.fusion_score),
      history: safeJsonParse(row.history, []),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      accessedAt: row.accessed_at,
      compressed: row.compressed,
      accessCount: parseInt(row.access_count)
    });
  }

  // Convert to cache format (compressed if needed)
  toCache() {
    return {
      contentId: this.contentId,
      reputation: this.reputation,
      uniqueness: this.uniqueness,
      verification: this.verification,
      fusionScore: this.fusionScore,
      history: this.history,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      accessedAt: this.accessedAt,
      compressed: this.compressed,
      accessCount: this.accessCount
    };
  }

  // Create from cache format
  static fromCache(data) {
    return new RUVProfile({
      contentId: data.contentId,
      reputation: data.reputation,
      uniqueness: data.uniqueness,
      verification: data.verification,
      fusionScore: data.fusionScore,
      history: data.history,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      accessedAt: data.accessedAt,
      compressed: data.compressed,
      accessCount: data.accessCount
    });
  }
}

module.exports = RUVProfile;
