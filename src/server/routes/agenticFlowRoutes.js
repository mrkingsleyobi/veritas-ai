/**
 * Agentic Flow API Routes
 *
 * RESTful API endpoints for workflow orchestration and agent decision-making
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
 * Initialize Agentic Flow routes
 * @param {Object} agenticFlowEngine - Agentic Flow Engine instance
 * @param {Object} agentDecisionFramework - Agent Decision Framework instance
 * @returns {Router} Express router
 */
function initializeAgenticFlowRoutes(agenticFlowEngine, agentDecisionFramework) {
  // ==================== WORKFLOW MANAGEMENT ====================

  /**
   * POST /api/agentic-flow/workflows
   * Create a new workflow
   */
  router.post(
    '/workflows',
    [
      body('agent_id').notEmpty().withMessage('Agent ID is required'),
      body('workflow_type').notEmpty().withMessage('Workflow type is required'),
      body('config').optional().isObject()
    ],
    validate,
    async (req, res) => {
      try {
        const { agent_id, workflow_type, config } = req.body;

        const workflow = await agenticFlowEngine.createWorkflow(
          agent_id,
          workflow_type,
          config || {}
        );

        res.json({
          success: true,
          workflow: {
            workflow_id: workflow.workflow_id,
            agent_id: workflow.agent_id,
            type: workflow.type,
            status: workflow.status,
            session_id: workflow.session_id
          }
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
   * POST /api/agentic-flow/workflows/:workflowId/steps
   * Define workflow steps
   */
  router.post(
    '/workflows/:workflowId/steps',
    [
      param('workflowId').notEmpty().withMessage('Workflow ID is required'),
      body('steps').isArray().withMessage('Steps must be an array')
    ],
    validate,
    async (req, res) => {
      try {
        const { workflowId } = req.params;
        const { steps } = req.body;

        await agenticFlowEngine.defineSteps(workflowId, steps);

        res.json({
          success: true,
          message: 'Workflow steps defined',
          steps_count: steps.length
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
   * POST /api/agentic-flow/workflows/:workflowId/execute
   * Execute workflow
   */
  router.post(
    '/workflows/:workflowId/execute',
    [param('workflowId').notEmpty().withMessage('Workflow ID is required')],
    validate,
    async (req, res) => {
      try {
        const { workflowId } = req.params;

        const result = await agenticFlowEngine.executeWorkflow(workflowId);

        res.json({
          success: true,
          execution_result: result
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
   * GET /api/agentic-flow/workflows/:workflowId/status
   * Get workflow status
   */
  router.get(
    '/workflows/:workflowId/status',
    [param('workflowId').notEmpty().withMessage('Workflow ID is required')],
    validate,
    async (req, res) => {
      try {
        const { workflowId } = req.params;

        const status = agenticFlowEngine.getWorkflowStatus(workflowId);

        if (!status) {
          return res.status(404).json({
            success: false,
            error: 'Workflow not found'
          });
        }

        res.json({
          success: true,
          status
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
   * POST /api/agentic-flow/workflows/:workflowId/pause
   * Pause workflow execution
   */
  router.post(
    '/workflows/:workflowId/pause',
    [param('workflowId').notEmpty().withMessage('Workflow ID is required')],
    validate,
    async (req, res) => {
      try {
        const { workflowId } = req.params;

        await agenticFlowEngine.pauseWorkflow(workflowId);

        res.json({
          success: true,
          message: 'Workflow paused'
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
   * POST /api/agentic-flow/workflows/:workflowId/resume
   * Resume workflow execution
   */
  router.post(
    '/workflows/:workflowId/resume',
    [param('workflowId').notEmpty().withMessage('Workflow ID is required')],
    validate,
    async (req, res) => {
      try {
        const { workflowId } = req.params;

        const result = await agenticFlowEngine.resumeWorkflow(workflowId);

        res.json({
          success: true,
          execution_result: result
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
   * POST /api/agentic-flow/workflows/:workflowId/cancel
   * Cancel workflow execution
   */
  router.post(
    '/workflows/:workflowId/cancel',
    [param('workflowId').notEmpty().withMessage('Workflow ID is required')],
    validate,
    async (req, res) => {
      try {
        const { workflowId } = req.params;

        await agenticFlowEngine.cancelWorkflow(workflowId);

        res.json({
          success: true,
          message: 'Workflow cancelled'
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
   * GET /api/agentic-flow/workflows
   * List all active workflows
   */
  router.get('/workflows', async (req, res) => {
    try {
      const workflows = agenticFlowEngine.listActiveWorkflows();

      res.json({
        success: true,
        count: workflows.length,
        workflows
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ==================== DECISION MAKING ====================

  /**
   * POST /api/agentic-flow/decisions
   * Make a decision based on context and rules
   */
  router.post(
    '/decisions',
    [
      body('agent_id').notEmpty().withMessage('Agent ID is required'),
      body('context').isObject().withMessage('Context must be an object'),
      body('rules').isArray().withMessage('Rules must be an array')
    ],
    validate,
    async (req, res) => {
      try {
        const { agent_id, context, rules } = req.body;

        const decision = await agentDecisionFramework.makeDecision(
          agent_id,
          context,
          rules
        );

        res.json({
          success: true,
          decision
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
   * POST /api/agentic-flow/planning
   * Plan actions to achieve a goal
   */
  router.post(
    '/planning',
    [
      body('agent_id').notEmpty().withMessage('Agent ID is required'),
      body('current_state').isObject().withMessage('Current state must be an object'),
      body('goal_state').isObject().withMessage('Goal state must be an object'),
      body('available_actions').isArray().withMessage('Available actions must be an array')
    ],
    validate,
    async (req, res) => {
      try {
        const { agent_id, current_state, goal_state, available_actions } = req.body;

        const plan = await agentDecisionFramework.planActions(
          agent_id,
          current_state,
          goal_state,
          available_actions
        );

        res.json({
          success: true,
          plan
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
   * POST /api/agentic-flow/reasoning
   * Reason about a situation
   */
  router.post(
    '/reasoning',
    [
      body('agent_id').notEmpty().withMessage('Agent ID is required'),
      body('situation').isObject().withMessage('Situation must be an object'),
      body('known_facts').optional().isArray()
    ],
    validate,
    async (req, res) => {
      try {
        const { agent_id, situation, known_facts } = req.body;

        const reasoning = await agentDecisionFramework.reason(
          agent_id,
          situation,
          known_facts || []
        );

        res.json({
          success: true,
          reasoning
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
   * POST /api/agentic-flow/learning
   * Learn from experience
   */
  router.post(
    '/learning',
    [
      body('agent_id').notEmpty().withMessage('Agent ID is required'),
      body('experience').isObject().withMessage('Experience must be an object'),
      body('experience.action').notEmpty().withMessage('Action is required'),
      body('experience.context').isObject().withMessage('Context must be an object'),
      body('experience.outcome').notEmpty().withMessage('Outcome is required'),
      body('experience.reward').isNumeric().withMessage('Reward must be a number')
    ],
    validate,
    async (req, res) => {
      try {
        const { agent_id, experience } = req.body;

        await agentDecisionFramework.learn(agent_id, experience);

        res.json({
          success: true,
          message: 'Experience learned successfully'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  );

  return router;
}

module.exports = initializeAgenticFlowRoutes;
