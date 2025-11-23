/**
 * AgentState Model
 *
 * Represents the current state of an active agent
 */

const { v4: uuidv4 } = require('uuid');

class AgentState {
  constructor(data = {}) {
    this.state_id = data.state_id || uuidv4();
    this.agent_id = data.agent_id;
    this.session_id = data.session_id;
    this.state_data = data.state_data || {};
    this.workflow_stage = data.workflow_stage;
    this.metadata = data.metadata || {};
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  /**
   * Validate the agent state data
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.agent_id || this.agent_id.trim() === '') {
      errors.push('Agent ID is required');
    }

    if (!this.state_data || typeof this.state_data !== 'object') {
      errors.push('State data must be an object');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Update state data
   * @param {Object} newData - New state data to merge
   */
  updateState(newData) {
    this.state_data = { ...this.state_data, ...newData };
    this.updated_at = new Date();
  }

  /**
   * Convert to plain object for database storage
   * @returns {Object}
   */
  toJSON() {
    return {
      state_id: this.state_id,
      agent_id: this.agent_id,
      session_id: this.session_id,
      state_data: this.state_data,
      workflow_stage: this.workflow_stage,
      metadata: this.metadata,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  /**
   * Create AgentState from database row
   * @param {Object} row - Database row
   * @returns {AgentState}
   */
  static fromDatabase(row) {
    return new AgentState({
      state_id: row.state_id,
      agent_id: row.agent_id,
      session_id: row.session_id,
      state_data: row.state_data,
      workflow_stage: row.workflow_stage,
      metadata: row.metadata,
      created_at: row.created_at,
      updated_at: row.updated_at
    });
  }
}

module.exports = AgentState;
