/**
 * AgentDB Service
 *
 * High-level service for managing AI agents, their state, memory, and execution
 */

const { v4: uuidv4 } = require('uuid');
const AgentRegistry = require('../models/AgentRegistry');
const AgentState = require('../models/AgentState');
const AgentMemory = require('../models/AgentMemory');
const AgentDBRepository = require('../repositories/AgentDBRepository');

class AgentDBService {
  constructor(dbConnection, cache = null) {
    this.repository = new AgentDBRepository(dbConnection, cache);
    this.activeAgents = new Map(); // In-memory registry of active agents
  }

  /**
   * Initialize AgentDB service and register MCP agents
   * @returns {Promise<void>}
   */
  async initialize() {
    console.log('Initializing AgentDB Service...');

    // Register default MCP agents from .mcp.json
    await this.registerDefaultMCPAgents();

    // Load active agents into memory
    const activeAgents = await this.repository.getActiveAgents();
    for (const agent of activeAgents) {
      this.activeAgents.set(agent.agent_id, agent);
    }

    console.log(`AgentDB Service initialized with ${this.activeAgents.size} active agents`);
  }

  /**
   * Register default MCP agents
   * @private
   */
  async registerDefaultMCPAgents() {
    const mcpAgents = [
      {
        agent_name: 'Claude Flow',
        agent_type: 'claude-flow',
        agent_version: 'alpha',
        capabilities: ['content-verification', 'orchestration', 'workflow-management'],
        configuration: {
          command: 'npx',
          args: ['claude-flow@alpha', 'mcp', 'start'],
          type: 'stdio'
        }
      },
      {
        agent_name: 'RUV Swarm',
        agent_type: 'ruv-swarm',
        agent_version: 'latest',
        capabilities: ['ruv-processing', 'swarm-intelligence', 'reputation-analysis'],
        configuration: {
          command: 'npx',
          args: ['ruv-swarm@latest', 'mcp', 'start'],
          type: 'stdio'
        }
      },
      {
        agent_name: 'Flow Nexus',
        agent_type: 'flow-nexus',
        agent_version: 'latest',
        capabilities: ['flow-orchestration', 'task-coordination', 'agent-communication'],
        configuration: {
          command: 'npx',
          args: ['flow-nexus@latest', 'mcp', 'start'],
          type: 'stdio'
        }
      },
      {
        agent_name: 'Agentic Payments',
        agent_type: 'agentic-payments',
        agent_version: 'latest',
        capabilities: ['payment-processing', 'transaction-management', 'billing'],
        configuration: {
          command: 'npx',
          args: ['agentic-payments@latest', 'mcp'],
          type: 'stdio'
        }
      }
    ];

    for (const agentData of mcpAgents) {
      try {
        // Check if agent already exists
        const existingAgents = await this.repository.getAgentsByType(agentData.agent_type);
        if (existingAgents.length === 0) {
          const agent = new AgentRegistry(agentData);
          await this.repository.registerAgent(agent);
          console.log(`Registered MCP agent: ${agent.agent_name}`);
        }
      } catch (error) {
        console.error(`Error registering agent ${agentData.agent_name}:`, error.message);
      }
    }
  }

  /**
   * Create and start an agent session
   * @param {string} agentId - Agent ID
   * @param {string} sessionId - Session ID
   * @param {Object} initialState - Initial state data
   * @returns {Promise<Object>} Session information
   */
  async startAgentSession(agentId, sessionId = null, initialState = {}) {
    sessionId = sessionId || uuidv4();

    // Verify agent exists
    const agent = await this.repository.getAgentById(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // Create initial state
    const state = new AgentState({
      agent_id: agentId,
      session_id: sessionId,
      state_data: {
        ...initialState,
        session_started_at: new Date().toISOString()
      },
      workflow_stage: 'initialized'
    });

    await this.repository.saveAgentState(state);

    // Update agent activity
    await this.repository.updateAgentActivity(agentId);

    // Add to active agents
    this.activeAgents.set(agentId, agent);

    return {
      agent_id: agentId,
      session_id: sessionId,
      state_id: state.state_id,
      started_at: new Date()
    };
  }

  /**
   * Update agent state during execution
   * @param {string} agentId - Agent ID
   * @param {string} sessionId - Session ID
   * @param {Object} stateUpdate - State updates
   * @returns {Promise<AgentState>}
   */
  async updateAgentState(agentId, sessionId, stateUpdate) {
    // Get current state
    let state = await this.repository.getAgentStateBySession(agentId, sessionId);

    if (!state) {
      // Create new state if doesn't exist
      state = new AgentState({
        agent_id: agentId,
        session_id: sessionId,
        state_data: stateUpdate
      });
    } else {
      // Update existing state
      state.updateState(stateUpdate);
    }

    return await this.repository.saveAgentState(state);
  }

  /**
   * Store agent memory
   * @param {string} agentId - Agent ID
   * @param {string} memoryType - Memory type
   * @param {string} memoryKey - Memory key
   * @param {Object} memoryContent - Memory content
   * @param {Object} options - Additional options (importance_score, expires_at)
   * @returns {Promise<AgentMemory>}
   */
  async storeMemory(agentId, memoryType, memoryKey, memoryContent, options = {}) {
    const memory = new AgentMemory({
      agent_id: agentId,
      memory_type: memoryType,
      memory_key: memoryKey,
      memory_content: memoryContent,
      importance_score: options.importance_score || 0.5,
      expires_at: options.expires_at
    });

    return await this.repository.saveAgentMemory(memory);
  }

  /**
   * Retrieve agent memories
   * @param {string} agentId - Agent ID
   * @param {string} memoryType - Memory type
   * @param {number} limit - Maximum number of memories
   * @returns {Promise<AgentMemory[]>}
   */
  async retrieveMemories(agentId, memoryType, limit = 10) {
    return await this.repository.getAgentMemoriesByType(agentId, memoryType, limit);
  }

  /**
   * Search agent memories by key
   * @param {string} agentId - Agent ID
   * @param {string} memoryKey - Memory key
   * @returns {Promise<AgentMemory[]>}
   */
  async searchMemories(agentId, memoryKey) {
    return await this.repository.searchMemoriesByKey(agentId, memoryKey);
  }

  /**
   * Start a conversation
   * @param {string} agentId - Agent ID
   * @param {string} userId - User ID
   * @param {string} title - Conversation title
   * @returns {Promise<Object>} Conversation object
   */
  async startConversation(agentId, userId = null, title = null) {
    const conversation = {
      conversation_id: uuidv4(),
      agent_id: agentId,
      session_id: uuidv4(),
      user_id: userId,
      conversation_title: title || 'New Conversation',
      status: 'active',
      metadata: {
        started_at: new Date().toISOString()
      }
    };

    return await this.repository.createConversation(conversation);
  }

  /**
   * Add message to conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} agentId - Agent ID
   * @param {string} role - Message role ('user', 'agent', 'system', 'tool')
   * @param {string} content - Message content
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Message object
   */
  async addMessage(conversationId, agentId, role, content, metadata = {}) {
    const message = {
      message_id: uuidv4(),
      conversation_id: conversationId,
      agent_id: agentId,
      role: role,
      content: content,
      content_type: 'text',
      metadata: metadata,
      token_count: this.estimateTokenCount(content)
    };

    return await this.repository.addMessage(message);
  }

  /**
   * Get conversation history
   * @param {string} conversationId - Conversation ID
   * @param {number} limit - Maximum number of messages
   * @returns {Promise<Array>} Array of messages
   */
  async getConversationHistory(conversationId, limit = 100) {
    return await this.repository.getConversationMessages(conversationId, limit);
  }

  /**
   * Log agent task execution
   * @param {string} agentId - Agent ID
   * @param {string} taskName - Task name
   * @param {Object} inputData - Input data
   * @param {Object} options - Additional options
   * @returns {Promise<string>} Execution ID
   */
  async startExecution(agentId, taskName, inputData, options = {}) {
    const execution = {
      execution_id: uuidv4(),
      agent_id: agentId,
      task_name: taskName,
      task_type: options.task_type || 'custom',
      input_data: inputData,
      output_data: {},
      status: 'running',
      started_at: new Date(),
      metadata: options.metadata || {}
    };

    await this.repository.logExecution(execution);
    return execution.execution_id;
  }

  /**
   * Complete agent task execution
   * @param {string} executionId - Execution ID
   * @param {Object} outputData - Output data
   * @param {string} status - Execution status
   * @param {string} errorMessage - Error message (if failed)
   * @returns {Promise<void>}
   */
  async completeExecution(executionId, outputData, status = 'completed', errorMessage = null) {
    const execution = {
      execution_id: executionId,
      output_data: outputData,
      status: status,
      error_message: errorMessage,
      completed_at: new Date(),
      execution_time_ms: null // Will be calculated in repository
    };

    // Re-fetch to calculate execution time
    const logs = await this.repository.getExecutionLogs(executionId, 1);
    if (logs.length > 0) {
      const log = logs[0];
      execution.execution_time_ms = new Date() - new Date(log.started_at);
    }

    await this.repository.logExecution(execution);
  }

  /**
   * Get agent execution history
   * @param {string} agentId - Agent ID
   * @param {number} limit - Maximum number of logs
   * @returns {Promise<Array>} Array of execution logs
   */
  async getExecutionHistory(agentId, limit = 50) {
    return await this.repository.getExecutionLogs(agentId, limit);
  }

  /**
   * Get agent statistics
   * @param {string} agentId - Agent ID
   * @returns {Promise<Object>} Agent statistics
   */
  async getAgentStatistics(agentId) {
    const agent = await this.repository.getAgentById(agentId);
    const executions = await this.repository.getExecutionLogs(agentId, 100);
    const memories = await this.repository.getAgentMemoriesByType(agentId, 'long_term', 1000);

    const stats = {
      agent_id: agentId,
      agent_name: agent?.agent_name,
      status: agent?.status,
      total_executions: executions.length,
      successful_executions: executions.filter(e => e.status === 'completed').length,
      failed_executions: executions.filter(e => e.status === 'failed').length,
      average_execution_time: this.calculateAverageExecutionTime(executions),
      memory_count: memories.length,
      last_active: agent?.last_active_at
    };

    return stats;
  }

  /**
   * Cleanup expired data
   * @returns {Promise<Object>} Cleanup results
   */
  async cleanup() {
    const deletedMemories = await this.repository.deleteExpiredMemories();

    return {
      deleted_memories: deletedMemories
    };
  }

  /**
   * Estimate token count for a message
   * @private
   * @param {string} content - Message content
   * @returns {number} Estimated token count
   */
  estimateTokenCount(content) {
    // Rough estimation: ~4 characters per token
    return Math.ceil(content.length / 4);
  }

  /**
   * Calculate average execution time
   * @private
   * @param {Array} executions - Array of execution logs
   * @returns {number} Average execution time in ms
   */
  calculateAverageExecutionTime(executions) {
    if (executions.length === 0) {
      return 0;
    }

    const completedExecutions = executions.filter(
      e => e.execution_time_ms && e.status === 'completed'
    );

    if (completedExecutions.length === 0) {
      return 0;
    }

    const totalTime = completedExecutions.reduce((sum, e) => sum + e.execution_time_ms, 0);
    return Math.round(totalTime / completedExecutions.length);
  }
}

module.exports = AgentDBService;
