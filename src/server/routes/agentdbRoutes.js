/**
 * AgentDB API Routes
 *
 * RESTful API endpoints for agent database operations
 */

const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to validate request
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * Initialize AgentDB routes
 * @param {Object} agentDBService - AgentDB service instance
 * @returns {Router} Express router
 */
function initializeAgentDBRoutes(agentDBService) {
  // ==================== AGENT MANAGEMENT ====================

  /**
   * GET /api/agentdb/agents
   * Get all active agents
   */
  router.get('/agents', async (req, res) => {
    try {
      const agents = await agentDBService.repository.getActiveAgents();
      res.json({
        success: true,
        count: agents.length,
        agents: agents.map(a => a.toJSON())
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/agentdb/agents/:agentId
   * Get agent by ID
   */
  router.get(
    '/agents/:agentId',
    [param('agentId').notEmpty().withMessage('Agent ID is required')],
    validate,
    async (req, res) => {
      try {
        const agent = await agentDBService.repository.getAgentById(req.params.agentId);

        if (!agent) {
          return res.status(404).json({
            success: false,
            error: 'Agent not found'
          });
        }

        res.json({
          success: true,
          agent: agent.toJSON()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  );

  /**
   * GET /api/agentdb/agents/:agentId/statistics
   * Get agent statistics
   */
  router.get(
    '/agents/:agentId/statistics',
    [param('agentId').notEmpty().withMessage('Agent ID is required')],
    validate,
    async (req, res) => {
      try {
        const stats = await agentDBService.getAgentStatistics(req.params.agentId);
        res.json({
          success: true,
          statistics: stats
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  );

  // ==================== SESSION MANAGEMENT ====================

  /**
   * POST /api/agentdb/sessions
   * Start a new agent session
   */
  router.post(
    '/sessions',
    [
      body('agent_id').notEmpty().withMessage('Agent ID is required'),
      body('initial_state').optional().isObject()
    ],
    validate,
    async (req, res) => {
      try {
        const { agent_id, session_id, initial_state } = req.body;

        const session = await agentDBService.startAgentSession(
          agent_id,
          session_id,
          initial_state || {}
        );

        res.json({
          success: true,
          session
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  );

  /**
   * PUT /api/agentdb/sessions/:sessionId/state
   * Update agent state
   */
  router.put(
    '/sessions/:sessionId/state',
    [
      param('sessionId').notEmpty().withMessage('Session ID is required'),
      body('agent_id').notEmpty().withMessage('Agent ID is required'),
      body('state_update').isObject().withMessage('State update must be an object')
    ],
    validate,
    async (req, res) => {
      try {
        const { agent_id, state_update } = req.body;
        const { sessionId } = req.params;

        const state = await agentDBService.updateAgentState(
          agent_id,
          sessionId,
          state_update
        );

        res.json({
          success: true,
          state: state.toJSON()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  );

  // ==================== MEMORY MANAGEMENT ====================

  /**
   * POST /api/agentdb/memory
   * Store agent memory
   */
  router.post(
    '/memory',
    [
      body('agent_id').notEmpty().withMessage('Agent ID is required'),
      body('memory_type').isIn(['short_term', 'long_term', 'episodic', 'semantic'])
        .withMessage('Invalid memory type'),
      body('memory_key').notEmpty().withMessage('Memory key is required'),
      body('memory_content').isObject().withMessage('Memory content must be an object')
    ],
    validate,
    async (req, res) => {
      try {
        const { agent_id, memory_type, memory_key, memory_content, importance_score, expires_at } = req.body;

        const memory = await agentDBService.storeMemory(
          agent_id,
          memory_type,
          memory_key,
          memory_content,
          { importance_score, expires_at }
        );

        res.json({
          success: true,
          memory: memory.toJSON()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  );

  /**
   * GET /api/agentdb/memory/:agentId
   * Retrieve agent memories
   */
  router.get(
    '/memory/:agentId',
    [
      param('agentId').notEmpty().withMessage('Agent ID is required'),
      query('memory_type').optional().isIn(['short_term', 'long_term', 'episodic', 'semantic']),
      query('limit').optional().isInt({ min: 1, max: 1000 })
    ],
    validate,
    async (req, res) => {
      try {
        const { agentId } = req.params;
        const memoryType = req.query.memory_type || 'long_term';
        const limit = parseInt(req.query.limit) || 10;

        const memories = await agentDBService.retrieveMemories(agentId, memoryType, limit);

        res.json({
          success: true,
          count: memories.length,
          memories: memories.map(m => m.toJSON())
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  );

  /**
   * GET /api/agentdb/memory/:agentId/search
   * Search agent memories by key
   */
  router.get(
    '/memory/:agentId/search',
    [
      param('agentId').notEmpty().withMessage('Agent ID is required'),
      query('key').notEmpty().withMessage('Search key is required')
    ],
    validate,
    async (req, res) => {
      try {
        const { agentId } = req.params;
        const { key } = req.query;

        const memories = await agentDBService.searchMemories(agentId, key);

        res.json({
          success: true,
          count: memories.length,
          memories: memories.map(m => m.toJSON())
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  );

  // ==================== CONVERSATION MANAGEMENT ====================

  /**
   * POST /api/agentdb/conversations
   * Start a new conversation
   */
  router.post(
    '/conversations',
    [
      body('agent_id').notEmpty().withMessage('Agent ID is required'),
      body('user_id').optional().isString(),
      body('title').optional().isString()
    ],
    validate,
    async (req, res) => {
      try {
        const { agent_id, user_id, title } = req.body;

        const conversation = await agentDBService.startConversation(
          agent_id,
          user_id,
          title
        );

        res.json({
          success: true,
          conversation
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  );

  /**
   * POST /api/agentdb/conversations/:conversationId/messages
   * Add message to conversation
   */
  router.post(
    '/conversations/:conversationId/messages',
    [
      param('conversationId').notEmpty().withMessage('Conversation ID is required'),
      body('agent_id').notEmpty().withMessage('Agent ID is required'),
      body('role').isIn(['user', 'agent', 'system', 'tool']).withMessage('Invalid role'),
      body('content').notEmpty().withMessage('Content is required')
    ],
    validate,
    async (req, res) => {
      try {
        const { conversationId } = req.params;
        const { agent_id, role, content, metadata } = req.body;

        const message = await agentDBService.addMessage(
          conversationId,
          agent_id,
          role,
          content,
          metadata || {}
        );

        res.json({
          success: true,
          message
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  );

  /**
   * GET /api/agentdb/conversations/:conversationId/messages
   * Get conversation history
   */
  router.get(
    '/conversations/:conversationId/messages',
    [
      param('conversationId').notEmpty().withMessage('Conversation ID is required'),
      query('limit').optional().isInt({ min: 1, max: 1000 })
    ],
    validate,
    async (req, res) => {
      try {
        const { conversationId } = req.params;
        const limit = parseInt(req.query.limit) || 100;

        const messages = await agentDBService.getConversationHistory(
          conversationId,
          limit
        );

        res.json({
          success: true,
          count: messages.length,
          messages
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  );

  // ==================== EXECUTION LOGGING ====================

  /**
   * POST /api/agentdb/executions
   * Start a new execution
   */
  router.post(
    '/executions',
    [
      body('agent_id').notEmpty().withMessage('Agent ID is required'),
      body('task_name').notEmpty().withMessage('Task name is required'),
      body('input_data').optional().isObject()
    ],
    validate,
    async (req, res) => {
      try {
        const { agent_id, task_name, input_data, task_type, metadata } = req.body;

        const executionId = await agentDBService.startExecution(
          agent_id,
          task_name,
          input_data || {},
          { task_type, metadata }
        );

        res.json({
          success: true,
          execution_id: executionId
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  );

  /**
   * PUT /api/agentdb/executions/:executionId
   * Complete an execution
   */
  router.put(
    '/executions/:executionId',
    [
      param('executionId').notEmpty().withMessage('Execution ID is required'),
      body('output_data').optional().isObject(),
      body('status').isIn(['completed', 'failed', 'cancelled']).withMessage('Invalid status')
    ],
    validate,
    async (req, res) => {
      try {
        const { executionId } = req.params;
        const { output_data, status, error_message } = req.body;

        await agentDBService.completeExecution(
          executionId,
          output_data || {},
          status,
          error_message
        );

        res.json({
          success: true,
          message: 'Execution completed'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  );

  /**
   * GET /api/agentdb/executions/:agentId
   * Get execution history
   */
  router.get(
    '/executions/:agentId',
    [
      param('agentId').notEmpty().withMessage('Agent ID is required'),
      query('limit').optional().isInt({ min: 1, max: 500 })
    ],
    validate,
    async (req, res) => {
      try {
        const { agentId } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        const executions = await agentDBService.getExecutionHistory(agentId, limit);

        res.json({
          success: true,
          count: executions.length,
          executions
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  );

  // ==================== MAINTENANCE ====================

  /**
   * POST /api/agentdb/cleanup
   * Clean up expired data
   */
  router.post('/cleanup', async (req, res) => {
    try {
      const results = await agentDBService.cleanup();
      res.json({
        success: true,
        cleanup_results: results
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

module.exports = initializeAgentDBRoutes;
