/**
 * AgentMemory Model
 *
 * Represents a memory entry for an AI agent
 */

const { v4: uuidv4 } = require('uuid');

class AgentMemory {
  constructor(data = {}) {
    this.memory_id = data.memory_id || uuidv4();
    this.agent_id = data.agent_id;
    this.memory_type = data.memory_type; // 'short_term', 'long_term', 'episodic', 'semantic'
    this.memory_key = data.memory_key;
    this.memory_content = data.memory_content || {};
    this.importance_score = data.importance_score || 0.5;
    this.access_count = data.access_count || 0;
    this.last_accessed_at = data.last_accessed_at;
    this.expires_at = data.expires_at;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  /**
   * Validate the agent memory data
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.agent_id || this.agent_id.trim() === '') {
      errors.push('Agent ID is required');
    }

    const validTypes = ['short_term', 'long_term', 'episodic', 'semantic'];
    if (!this.memory_type || !validTypes.includes(this.memory_type)) {
      errors.push(`Memory type must be one of: ${validTypes.join(', ')}`);
    }

    if (!this.memory_content || typeof this.memory_content !== 'object') {
      errors.push('Memory content must be an object');
    }

    if (this.importance_score < 0 || this.importance_score > 1) {
      errors.push('Importance score must be between 0 and 1');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Mark memory as accessed
   */
  recordAccess() {
    this.access_count += 1;
    this.last_accessed_at = new Date();
  }

  /**
   * Check if memory has expired
   * @returns {boolean}
   */
  isExpired() {
    if (!this.expires_at) {
      return false;
    }
    return new Date() > new Date(this.expires_at);
  }

  /**
   * Convert to plain object for database storage
   * @returns {Object}
   */
  toJSON() {
    return {
      memory_id: this.memory_id,
      agent_id: this.agent_id,
      memory_type: this.memory_type,
      memory_key: this.memory_key,
      memory_content: this.memory_content,
      importance_score: this.importance_score,
      access_count: this.access_count,
      last_accessed_at: this.last_accessed_at,
      expires_at: this.expires_at,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  /**
   * Create AgentMemory from database row
   * @param {Object} row - Database row
   * @returns {AgentMemory}
   */
  static fromDatabase(row) {
    return new AgentMemory({
      memory_id: row.memory_id,
      agent_id: row.agent_id,
      memory_type: row.memory_type,
      memory_key: row.memory_key,
      memory_content: row.memory_content,
      importance_score: parseFloat(row.importance_score),
      access_count: row.access_count,
      last_accessed_at: row.last_accessed_at,
      expires_at: row.expires_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    });
  }
}

module.exports = AgentMemory;
