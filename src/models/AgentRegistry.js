/**
 * AgentRegistry Model
 *
 * Represents an AI agent registered in the system
 */

const { v4: uuidv4 } = require('uuid');

class AgentRegistry {
  constructor(data = {}) {
    this.agent_id = data.agent_id || uuidv4();
    this.agent_name = data.agent_name;
    this.agent_type = data.agent_type; // 'claude-flow', 'ruv-swarm', 'flow-nexus', 'custom'
    this.agent_version = data.agent_version;
    this.capabilities = data.capabilities || [];
    this.configuration = data.configuration || {};
    this.status = data.status || 'active';
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
    this.last_active_at = data.last_active_at;
  }

  /**
   * Validate the agent registry data
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.agent_name || this.agent_name.trim() === '') {
      errors.push('Agent name is required');
    }

    if (!this.agent_type || this.agent_type.trim() === '') {
      errors.push('Agent type is required');
    }

    const validTypes = ['claude-flow', 'ruv-swarm', 'flow-nexus', 'agentic-payments', 'custom'];
    if (this.agent_type && !validTypes.includes(this.agent_type)) {
      errors.push(`Agent type must be one of: ${validTypes.join(', ')}`);
    }

    const validStatuses = ['active', 'inactive', 'suspended'];
    if (this.status && !validStatuses.includes(this.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to plain object for database storage
   * @returns {Object}
   */
  toJSON() {
    return {
      agent_id: this.agent_id,
      agent_name: this.agent_name,
      agent_type: this.agent_type,
      agent_version: this.agent_version,
      capabilities: this.capabilities,
      configuration: this.configuration,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at,
      last_active_at: this.last_active_at
    };
  }

  /**
   * Create AgentRegistry from database row
   * @param {Object} row - Database row
   * @returns {AgentRegistry}
   */
  static fromDatabase(row) {
    return new AgentRegistry({
      agent_id: row.agent_id,
      agent_name: row.agent_name,
      agent_type: row.agent_type,
      agent_version: row.agent_version,
      capabilities: row.capabilities,
      configuration: row.configuration,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      last_active_at: row.last_active_at
    });
  }
}

module.exports = AgentRegistry;
