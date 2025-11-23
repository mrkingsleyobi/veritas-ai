/**
 * AgentDB Repository
 *
 * Data access layer for AI agent database operations
 */

const AgentRegistry = require('../models/AgentRegistry');
const AgentState = require('../models/AgentState');
const AgentMemory = require('../models/AgentMemory');

class AgentDBRepository {
  constructor(dbConnection, cache = null) {
    this.db = dbConnection;
    this.cache = cache;
    this.cacheTTL = 300; // 5 minutes
  }

  // ==================== AGENT REGISTRY OPERATIONS ====================

  /**
   * Register a new agent
   * @param {AgentRegistry} agent - Agent to register
   * @returns {Promise<AgentRegistry>}
   */
  async registerAgent(agent) {
    const validation = agent.validate();
    if (!validation.valid) {
      throw new Error(`Invalid agent data: ${validation.errors.join(', ')}`);
    }

    const query = `
      INSERT INTO agent_registry (
        agent_id, agent_name, agent_type, agent_version,
        capabilities, configuration, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      agent.agent_id,
      agent.agent_name,
      agent.agent_type,
      agent.agent_version,
      JSON.stringify(agent.capabilities),
      JSON.stringify(agent.configuration),
      agent.status,
      agent.created_at,
      agent.updated_at
    ];

    const result = await this.db.query(query, values);
    return AgentRegistry.fromDatabase(result.rows[0]);
  }

  /**
   * Get agent by ID
   * @param {string} agentId - Agent ID
   * @returns {Promise<AgentRegistry|null>}
   */
  async getAgentById(agentId) {
    // Check cache first
    if (this.cache) {
      const cacheKey = `agent:${agentId}`;
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return AgentRegistry.fromDatabase(JSON.parse(cached));
      }
    }

    const query = 'SELECT * FROM agent_registry WHERE agent_id = $1';
    const result = await this.db.query(query, [agentId]);

    if (result.rows.length === 0) {
      return null;
    }

    const agent = AgentRegistry.fromDatabase(result.rows[0]);

    // Cache the result
    if (this.cache) {
      const cacheKey = `agent:${agentId}`;
      await this.cache.setex(cacheKey, this.cacheTTL, JSON.stringify(agent.toJSON()));
    }

    return agent;
  }

  /**
   * Get all agents by type
   * @param {string} agentType - Agent type
   * @returns {Promise<AgentRegistry[]>}
   */
  async getAgentsByType(agentType) {
    const query = 'SELECT * FROM agent_registry WHERE agent_type = $1 ORDER BY created_at DESC';
    const result = await this.db.query(query, [agentType]);
    return result.rows.map(row => AgentRegistry.fromDatabase(row));
  }

  /**
   * Get all active agents
   * @returns {Promise<AgentRegistry[]>}
   */
  async getActiveAgents() {
    const query = 'SELECT * FROM agent_registry WHERE status = $1 ORDER BY last_active_at DESC';
    const result = await this.db.query(query, ['active']);
    return result.rows.map(row => AgentRegistry.fromDatabase(row));
  }

  /**
   * Update agent last active timestamp
   * @param {string} agentId - Agent ID
   * @returns {Promise<void>}
   */
  async updateAgentActivity(agentId) {
    const query = 'UPDATE agent_registry SET last_active_at = $1 WHERE agent_id = $2';
    await this.db.query(query, [new Date(), agentId]);

    // Invalidate cache
    if (this.cache) {
      await this.cache.del(`agent:${agentId}`);
    }
  }

  /**
   * Update agent status
   * @param {string} agentId - Agent ID
   * @param {string} status - New status
   * @returns {Promise<void>}
   */
  async updateAgentStatus(agentId, status) {
    const query = 'UPDATE agent_registry SET status = $1, updated_at = $2 WHERE agent_id = $3';
    await this.db.query(query, [status, new Date(), agentId]);

    // Invalidate cache
    if (this.cache) {
      await this.cache.del(`agent:${agentId}`);
    }
  }

  // ==================== AGENT STATE OPERATIONS ====================

  /**
   * Save agent state
   * @param {AgentState} state - Agent state to save
   * @returns {Promise<AgentState>}
   */
  async saveAgentState(state) {
    const validation = state.validate();
    if (!validation.valid) {
      throw new Error(`Invalid state data: ${validation.errors.join(', ')}`);
    }

    const query = `
      INSERT INTO agent_state (
        state_id, agent_id, session_id, state_data,
        workflow_stage, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (state_id) DO UPDATE SET
        state_data = EXCLUDED.state_data,
        workflow_stage = EXCLUDED.workflow_stage,
        metadata = EXCLUDED.metadata,
        updated_at = EXCLUDED.updated_at
      RETURNING *
    `;

    const values = [
      state.state_id,
      state.agent_id,
      state.session_id,
      JSON.stringify(state.state_data),
      state.workflow_stage,
      JSON.stringify(state.metadata),
      state.created_at,
      state.updated_at
    ];

    const result = await this.db.query(query, values);
    return AgentState.fromDatabase(result.rows[0]);
  }

  /**
   * Get agent state by ID
   * @param {string} stateId - State ID
   * @returns {Promise<AgentState|null>}
   */
  async getAgentState(stateId) {
    const query = 'SELECT * FROM agent_state WHERE state_id = $1';
    const result = await this.db.query(query, [stateId]);

    if (result.rows.length === 0) {
      return null;
    }

    return AgentState.fromDatabase(result.rows[0]);
  }

  /**
   * Get agent state by agent ID and session ID
   * @param {string} agentId - Agent ID
   * @param {string} sessionId - Session ID
   * @returns {Promise<AgentState|null>}
   */
  async getAgentStateBySession(agentId, sessionId) {
    const query = 'SELECT * FROM agent_state WHERE agent_id = $1 AND session_id = $2';
    const result = await this.db.query(query, [agentId, sessionId]);

    if (result.rows.length === 0) {
      return null;
    }

    return AgentState.fromDatabase(result.rows[0]);
  }

  /**
   * Delete agent state
   * @param {string} stateId - State ID
   * @returns {Promise<void>}
   */
  async deleteAgentState(stateId) {
    const query = 'DELETE FROM agent_state WHERE state_id = $1';
    await this.db.query(query, [stateId]);
  }

  // ==================== AGENT MEMORY OPERATIONS ====================

  /**
   * Save agent memory
   * @param {AgentMemory} memory - Memory to save
   * @returns {Promise<AgentMemory>}
   */
  async saveAgentMemory(memory) {
    const validation = memory.validate();
    if (!validation.valid) {
      throw new Error(`Invalid memory data: ${validation.errors.join(', ')}`);
    }

    const query = `
      INSERT INTO agent_memory (
        memory_id, agent_id, memory_type, memory_key, memory_content,
        importance_score, access_count, last_accessed_at, expires_at,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (memory_id) DO UPDATE SET
        memory_content = EXCLUDED.memory_content,
        importance_score = EXCLUDED.importance_score,
        access_count = EXCLUDED.access_count,
        last_accessed_at = EXCLUDED.last_accessed_at,
        updated_at = EXCLUDED.updated_at
      RETURNING *
    `;

    const values = [
      memory.memory_id,
      memory.agent_id,
      memory.memory_type,
      memory.memory_key,
      JSON.stringify(memory.memory_content),
      memory.importance_score,
      memory.access_count,
      memory.last_accessed_at,
      memory.expires_at,
      memory.created_at,
      memory.updated_at
    ];

    const result = await this.db.query(query, values);
    return AgentMemory.fromDatabase(result.rows[0]);
  }

  /**
   * Get agent memory by ID
   * @param {string} memoryId - Memory ID
   * @returns {Promise<AgentMemory|null>}
   */
  async getAgentMemory(memoryId) {
    const query = 'SELECT * FROM agent_memory WHERE memory_id = $1';
    const result = await this.db.query(query, [memoryId]);

    if (result.rows.length === 0) {
      return null;
    }

    const memory = AgentMemory.fromDatabase(result.rows[0]);

    // Update access count
    memory.recordAccess();
    await this.saveAgentMemory(memory);

    return memory;
  }

  /**
   * Get agent memories by agent ID and type
   * @param {string} agentId - Agent ID
   * @param {string} memoryType - Memory type
   * @param {number} limit - Maximum number of memories to return
   * @returns {Promise<AgentMemory[]>}
   */
  async getAgentMemoriesByType(agentId, memoryType, limit = 100) {
    const query = `
      SELECT * FROM agent_memory
      WHERE agent_id = $1 AND memory_type = $2
      AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY importance_score DESC, created_at DESC
      LIMIT $3
    `;
    const result = await this.db.query(query, [agentId, memoryType, limit]);
    return result.rows.map(row => AgentMemory.fromDatabase(row));
  }

  /**
   * Search agent memories by key
   * @param {string} agentId - Agent ID
   * @param {string} memoryKey - Memory key to search
   * @returns {Promise<AgentMemory[]>}
   */
  async searchMemoriesByKey(agentId, memoryKey) {
    const query = `
      SELECT * FROM agent_memory
      WHERE agent_id = $1 AND memory_key = $2
      AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC
    `;
    const result = await this.db.query(query, [agentId, memoryKey]);
    return result.rows.map(row => AgentMemory.fromDatabase(row));
  }

  /**
   * Delete expired memories
   * @returns {Promise<number>} Number of deleted memories
   */
  async deleteExpiredMemories() {
    const query = 'DELETE FROM agent_memory WHERE expires_at IS NOT NULL AND expires_at < NOW()';
    const result = await this.db.query(query);
    return result.rowCount;
  }

  // ==================== CONVERSATION OPERATIONS ====================

  /**
   * Create a new conversation
   * @param {Object} conversation - Conversation data
   * @returns {Promise<Object>}
   */
  async createConversation(conversation) {
    const query = `
      INSERT INTO agent_conversations (
        conversation_id, agent_id, session_id, user_id,
        conversation_title, status, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      conversation.conversation_id,
      conversation.agent_id,
      conversation.session_id,
      conversation.user_id,
      conversation.conversation_title,
      conversation.status || 'active',
      JSON.stringify(conversation.metadata || {}),
      new Date(),
      new Date()
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  /**
   * Add message to conversation
   * @param {Object} message - Message data
   * @returns {Promise<Object>}
   */
  async addMessage(message) {
    const query = `
      INSERT INTO agent_messages (
        message_id, conversation_id, agent_id, role,
        content, content_type, metadata, token_count, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      message.message_id,
      message.conversation_id,
      message.agent_id,
      message.role,
      message.content,
      message.content_type || 'text',
      JSON.stringify(message.metadata || {}),
      message.token_count,
      new Date()
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get conversation messages
   * @param {string} conversationId - Conversation ID
   * @param {number} limit - Maximum number of messages
   * @returns {Promise<Array>}
   */
  async getConversationMessages(conversationId, limit = 100) {
    const query = `
      SELECT * FROM agent_messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
      LIMIT $2
    `;
    const result = await this.db.query(query, [conversationId, limit]);
    return result.rows;
  }

  // ==================== EXECUTION LOG OPERATIONS ====================

  /**
   * Log agent execution
   * @param {Object} execution - Execution log data
   * @returns {Promise<Object>}
   */
  async logExecution(execution) {
    const query = `
      INSERT INTO agent_execution_logs (
        execution_id, agent_id, task_name, task_type,
        input_data, output_data, status, error_message,
        execution_time_ms, started_at, completed_at, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      execution.execution_id,
      execution.agent_id,
      execution.task_name,
      execution.task_type,
      JSON.stringify(execution.input_data || {}),
      JSON.stringify(execution.output_data || {}),
      execution.status,
      execution.error_message,
      execution.execution_time_ms,
      execution.started_at || new Date(),
      execution.completed_at,
      JSON.stringify(execution.metadata || {})
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get execution logs for an agent
   * @param {string} agentId - Agent ID
   * @param {number} limit - Maximum number of logs
   * @returns {Promise<Array>}
   */
  async getExecutionLogs(agentId, limit = 50) {
    const query = `
      SELECT * FROM agent_execution_logs
      WHERE agent_id = $1
      ORDER BY started_at DESC
      LIMIT $2
    `;
    const result = await this.db.query(query, [agentId, limit]);
    return result.rows;
  }
}

module.exports = AgentDBRepository;
