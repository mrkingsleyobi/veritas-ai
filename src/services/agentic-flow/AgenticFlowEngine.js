/**
 * Agentic Flow Engine
 *
 * Orchestrates agent workflows, decision-making, and task execution
 */

const { v4: uuidv4 } = require('uuid');

class AgenticFlowEngine {
  constructor(agentDBService) {
    this.agentDBService = agentDBService;
    this.activeWorkflows = new Map();
    this.taskQueue = [];
    this.isProcessing = false;
  }

  /**
   * Create a new workflow
   * @param {string} agentId - Agent ID
   * @param {string} workflowType - Type of workflow
   * @param {Object} config - Workflow configuration
   * @returns {Promise<Object>} Workflow instance
   */
  async createWorkflow(agentId, workflowType, config = {}) {
    const workflowId = uuidv4();
    const sessionId = uuidv4();

    const workflow = {
      workflow_id: workflowId,
      agent_id: agentId,
      session_id: sessionId,
      type: workflowType,
      status: 'initialized',
      config: config,
      steps: [],
      current_step: 0,
      created_at: new Date(),
      context: config.initialContext || {}
    };

    // Start agent session
    await this.agentDBService.startAgentSession(
      agentId,
      sessionId,
      {
        workflow_id: workflowId,
        workflow_type: workflowType,
        status: 'initialized'
      }
    );

    this.activeWorkflows.set(workflowId, workflow);

    console.log(`Workflow created: ${workflowId} (type: ${workflowType})`);

    return workflow;
  }

  /**
   * Define workflow steps
   * @param {string} workflowId - Workflow ID
   * @param {Array} steps - Array of step definitions
   */
  async defineSteps(workflowId, steps) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    workflow.steps = steps.map((step, index) => ({
      step_id: uuidv4(),
      order: index,
      name: step.name,
      action: step.action,
      config: step.config || {},
      status: 'pending',
      result: null
    }));

    workflow.status = 'ready';

    console.log(`Workflow ${workflowId}: ${steps.length} steps defined`);
  }

  /**
   * Execute workflow
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Object>} Execution result
   */
  async executeWorkflow(workflowId) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    if (workflow.status !== 'ready' && workflow.status !== 'paused') {
      throw new Error(`Workflow cannot be executed in status: ${workflow.status}`);
    }

    workflow.status = 'running';
    workflow.started_at = new Date();

    // Update agent state
    await this.agentDBService.updateAgentState(
      workflow.agent_id,
      workflow.session_id,
      { workflow_status: 'running', workflow_started_at: workflow.started_at }
    );

    // Start execution logging
    const executionId = await this.agentDBService.startExecution(
      workflow.agent_id,
      `workflow:${workflow.type}`,
      { workflow_id: workflowId, steps_count: workflow.steps.length },
      { task_type: 'workflow' }
    );

    try {
      // Execute each step sequentially
      for (let i = workflow.current_step; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        workflow.current_step = i;

        console.log(`Executing step ${i + 1}/${workflow.steps.length}: ${step.name}`);

        step.status = 'running';
        step.started_at = new Date();

        try {
          // Execute step action
          const result = await this.executeStep(workflow, step);

          step.status = 'completed';
          step.result = result;
          step.completed_at = new Date();

          // Update workflow context with step results
          workflow.context[step.name] = result;

          // Update agent state with progress
          await this.agentDBService.updateAgentState(
            workflow.agent_id,
            workflow.session_id,
            {
              current_step: i + 1,
              progress: (i + 1) / workflow.steps.length,
              last_step_result: result
            }
          );

          // Store step result in memory
          await this.agentDBService.storeMemory(
            workflow.agent_id,
            'episodic',
            `workflow:${workflowId}:step:${i}`,
            {
              step_name: step.name,
              result: result,
              timestamp: new Date()
            },
            { importance_score: 0.7 }
          );
        } catch (error) {
          step.status = 'failed';
          step.error = error.message;
          step.completed_at = new Date();

          console.error(`Step ${i + 1} failed:`, error.message);

          // Decide whether to continue or fail the workflow
          if (step.config.continueOnError) {
            console.log('Continuing to next step despite error...');
            continue;
          } else {
            throw error;
          }
        }
      }

      workflow.status = 'completed';
      workflow.completed_at = new Date();

      // Complete execution log
      await this.agentDBService.completeExecution(
        executionId,
        {
          steps_completed: workflow.steps.filter(s => s.status === 'completed').length,
          final_context: workflow.context
        },
        'completed'
      );

      // Update agent state
      await this.agentDBService.updateAgentState(
        workflow.agent_id,
        workflow.session_id,
        {
          workflow_status: 'completed',
          workflow_completed_at: workflow.completed_at,
          final_result: workflow.context
        }
      );

      console.log(`Workflow ${workflowId} completed successfully`);

      return {
        success: true,
        workflow_id: workflowId,
        status: 'completed',
        context: workflow.context,
        steps_executed: workflow.steps.length
      };
    } catch (error) {
      workflow.status = 'failed';
      workflow.error = error.message;
      workflow.completed_at = new Date();

      // Complete execution log with failure
      await this.agentDBService.completeExecution(
        executionId,
        { error: error.message },
        'failed',
        error.message
      );

      // Update agent state
      await this.agentDBService.updateAgentState(
        workflow.agent_id,
        workflow.session_id,
        {
          workflow_status: 'failed',
          workflow_error: error.message
        }
      );

      console.error(`Workflow ${workflowId} failed:`, error.message);

      return {
        success: false,
        workflow_id: workflowId,
        status: 'failed',
        error: error.message,
        steps_executed: workflow.current_step
      };
    }
  }

  /**
   * Execute a single workflow step
   * @private
   * @param {Object} workflow - Workflow instance
   * @param {Object} step - Step definition
   * @returns {Promise<any>} Step result
   */
  async executeStep(workflow, step) {
    // Get the action handler
    const actionHandler = this.getActionHandler(step.action);

    if (!actionHandler) {
      throw new Error(`Unknown action: ${step.action}`);
    }

    // Execute the action with workflow context
    const result = await actionHandler(workflow.context, step.config);

    return result;
  }

  /**
   * Get action handler for a step action
   * @private
   * @param {string} action - Action name
   * @returns {Function} Action handler
   */
  getActionHandler(action) {
    const handlers = {
      // Content verification action
      'verify_content': async (context, config) => {
        const { ContentAuthenticator } = require('../../index');
        const authenticator = new ContentAuthenticator();

        const content = context[config.contentKey] || config.content;
        const result = await authenticator.verifyAuthenticity(content, config.options);

        return {
          authentic: result.isAuthentic,
          confidence: result.confidence,
          details: result.details
        };
      },

      // RUV profile action
      'create_ruv_profile': async (context, config) => {
        const { RUVProfileService } = require('../../index');
        const ruvService = new RUVProfileService();

        const contentId = context[config.contentIdKey] || config.contentId;
        const ruvData = context[config.ruvDataKey] || config.ruvData;

        const profile = await ruvService.createOrUpdateProfile(contentId, ruvData);

        return profile;
      },

      // Decision making action
      'make_decision': async (context, config) => {
        const condition = config.condition;
        const evaluator = new Function('context', `return ${condition}`);

        const decision = evaluator(context);

        return {
          decision: decision,
          condition: condition,
          context_evaluated: context
        };
      },

      // Store data action
      'store_data': async (context, config) => {
        const key = config.key;
        const value = context[config.valueKey] || config.value;

        // Could store in database, cache, etc.
        return { stored: true, key, value };
      },

      // Transform data action
      'transform_data': async (context, config) => {
        const input = context[config.inputKey];
        const transformer = config.transformer;

        // Apply transformation function
        const transformFn = new Function('input', 'context', transformer);
        const output = transformFn(input, context);

        return output;
      },

      // Call external API action
      'call_api': async (context, config) => {
        // Placeholder for API calls
        return {
          api_called: config.endpoint,
          status: 'success'
        };
      },

      // Wait/delay action
      'wait': async (context, config) => {
        const delayMs = config.delayMs || 1000;
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return { waited: delayMs };
      }
    };

    return handlers[action];
  }

  /**
   * Pause workflow execution
   * @param {string} workflowId - Workflow ID
   */
  async pauseWorkflow(workflowId) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    workflow.status = 'paused';
    workflow.paused_at = new Date();

    await this.agentDBService.updateAgentState(
      workflow.agent_id,
      workflow.session_id,
      { workflow_status: 'paused' }
    );

    console.log(`Workflow ${workflowId} paused`);
  }

  /**
   * Resume workflow execution
   * @param {string} workflowId - Workflow ID
   */
  async resumeWorkflow(workflowId) {
    return await this.executeWorkflow(workflowId);
  }

  /**
   * Cancel workflow execution
   * @param {string} workflowId - Workflow ID
   */
  async cancelWorkflow(workflowId) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    workflow.status = 'cancelled';
    workflow.cancelled_at = new Date();

    await this.agentDBService.updateAgentState(
      workflow.agent_id,
      workflow.session_id,
      { workflow_status: 'cancelled' }
    );

    this.activeWorkflows.delete(workflowId);

    console.log(`Workflow ${workflowId} cancelled`);
  }

  /**
   * Get workflow status
   * @param {string} workflowId - Workflow ID
   * @returns {Object} Workflow status
   */
  getWorkflowStatus(workflowId) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      return null;
    }

    return {
      workflow_id: workflowId,
      status: workflow.status,
      current_step: workflow.current_step,
      total_steps: workflow.steps.length,
      progress: workflow.steps.length > 0 ? workflow.current_step / workflow.steps.length : 0,
      steps: workflow.steps.map(s => ({
        name: s.name,
        status: s.status,
        result: s.result
      }))
    };
  }

  /**
   * List all active workflows
   * @returns {Array} Active workflows
   */
  listActiveWorkflows() {
    return Array.from(this.activeWorkflows.values()).map(w => ({
      workflow_id: w.workflow_id,
      type: w.type,
      status: w.status,
      agent_id: w.agent_id,
      created_at: w.created_at
    }));
  }
}

module.exports = AgenticFlowEngine;
