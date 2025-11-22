/**
 * Agentic Flow Unit Tests
 */

const AgenticFlowEngine = require('../../src/services/agentic-flow/AgenticFlowEngine');
const AgentDecisionFramework = require('../../src/services/agentic-flow/AgentDecisionFramework');

// Mock AgentDBService
const mockAgentDBService = {
  startAgentSession: jest.fn().mockResolvedValue({ session_id: 'test-session' }),
  updateAgentState: jest.fn().mockResolvedValue({}),
  storeMemory: jest.fn().mockResolvedValue({}),
  retrieveMemories: jest.fn().mockResolvedValue([]),
  searchMemories: jest.fn().mockResolvedValue([]),
  startExecution: jest.fn().mockResolvedValue('exec-123'),
  completeExecution: jest.fn().mockResolvedValue({})
};

describe('Agentic Flow Engine', () => {
  let engine;

  beforeEach(() => {
    engine = new AgenticFlowEngine(mockAgentDBService);
    jest.clearAllMocks();
  });

  describe('Workflow Creation', () => {
    test('should create a new workflow', async () => {
      const workflow = await engine.createWorkflow(
        'agent-123',
        'content-verification',
        { initialContext: { test: true } }
      );

      expect(workflow).toHaveProperty('workflow_id');
      expect(workflow.type).toBe('content-verification');
      expect(workflow.status).toBe('initialized');
      expect(mockAgentDBService.startAgentSession).toHaveBeenCalled();
    });

    test('should store workflow in active workflows', async () => {
      const workflow = await engine.createWorkflow('agent-123', 'test-workflow');
      expect(engine.activeWorkflows.has(workflow.workflow_id)).toBe(true);
    });
  });

  describe('Workflow Steps', () => {
    test('should define workflow steps', async () => {
      const workflow = await engine.createWorkflow('agent-123', 'test-workflow');

      const steps = [
        { name: 'step1', action: 'verify_content', config: {} },
        { name: 'step2', action: 'store_data', config: {} }
      ];

      await engine.defineSteps(workflow.workflow_id, steps);

      const updatedWorkflow = engine.activeWorkflows.get(workflow.workflow_id);
      expect(updatedWorkflow.steps.length).toBe(2);
      expect(updatedWorkflow.status).toBe('ready');
    });

    test('should throw error for non-existent workflow', async () => {
      await expect(
        engine.defineSteps('invalid-id', [])
      ).rejects.toThrow('Workflow not found');
    });
  });

  describe('Workflow Execution', () => {
    test('should execute workflow with all steps', async () => {
      const workflow = await engine.createWorkflow('agent-123', 'test-workflow');

      await engine.defineSteps(workflow.workflow_id, [
        { name: 'wait', action: 'wait', config: { delayMs: 10 } }
      ]);

      const result = await engine.executeWorkflow(workflow.workflow_id);

      expect(result.success).toBe(true);
      expect(result.status).toBe('completed');
      expect(mockAgentDBService.startExecution).toHaveBeenCalled();
      expect(mockAgentDBService.completeExecution).toHaveBeenCalled();
    });

    test('should handle workflow execution failure', async () => {
      const workflow = await engine.createWorkflow('agent-123', 'test-workflow');

      await engine.defineSteps(workflow.workflow_id, [
        { name: 'invalid', action: 'invalid_action', config: {} }
      ]);

      const result = await engine.executeWorkflow(workflow.workflow_id);

      expect(result.success).toBe(false);
      expect(result.status).toBe('failed');
    });
  });

  describe('Workflow Control', () => {
    test('should pause workflow', async () => {
      const workflow = await engine.createWorkflow('agent-123', 'test-workflow');
      await engine.pauseWorkflow(workflow.workflow_id);

      const updatedWorkflow = engine.activeWorkflows.get(workflow.workflow_id);
      expect(updatedWorkflow.status).toBe('paused');
    });

    test('should cancel workflow', async () => {
      const workflow = await engine.createWorkflow('agent-123', 'test-workflow');
      await engine.cancelWorkflow(workflow.workflow_id);

      expect(engine.activeWorkflows.has(workflow.workflow_id)).toBe(false);
    });

    test('should get workflow status', async () => {
      const workflow = await engine.createWorkflow('agent-123', 'test-workflow');
      await engine.defineSteps(workflow.workflow_id, [
        { name: 'step1', action: 'wait', config: {} }
      ]);

      const status = engine.getWorkflowStatus(workflow.workflow_id);

      expect(status).toHaveProperty('workflow_id');
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('progress');
    });
  });
});

describe('Agent Decision Framework', () => {
  let framework;

  beforeEach(() => {
    framework = new AgentDecisionFramework(mockAgentDBService);
    jest.clearAllMocks();
  });

  describe('Decision Making', () => {
    test('should make decision based on rules', async () => {
      const context = { score: 0.8, type: 'image' };
      const rules = [
        {
          name: 'high_score',
          condition: 'context.score > 0.7',
          action: 'approve',
          priority: 10
        },
        {
          name: 'default',
          condition: 'true',
          action: 'review',
          priority: 1
        }
      ];

      const decision = await framework.makeDecision('agent-123', context, rules);

      expect(decision.decision).toBe('approve');
      expect(decision.matched_rules.length).toBeGreaterThan(0);
      expect(mockAgentDBService.storeMemory).toHaveBeenCalled();
    });

    test('should handle no matching rules', async () => {
      const context = { score: 0.3 };
      const rules = [
        {
          name: 'high_score',
          condition: 'context.score > 0.7',
          action: 'approve',
          priority: 10
        }
      ];

      const decision = await framework.makeDecision('agent-123', context, rules);

      expect(decision.decision).toBe('no_match');
    });
  });

  describe('Action Planning', () => {
    test('should plan actions to achieve goal', async () => {
      const currentState = { authenticated: false, verified: false };
      const goalState = { authenticated: true, verified: true };
      const availableActions = [
        {
          name: 'authenticate',
          effects: { authenticated: true }
        },
        {
          name: 'verify',
          effects: { verified: true }
        }
      ];

      const plan = await framework.planActions(
        'agent-123',
        currentState,
        goalState,
        availableActions
      );

      expect(plan.success).toBe(true);
      expect(plan.plan.length).toBeGreaterThan(0);
    });
  });

  describe('Learning', () => {
    test('should learn from positive experience', async () => {
      const experience = {
        action: 'verify_content',
        context: { type: 'image' },
        outcome: 'success',
        reward: 0.8
      };

      await framework.learn('agent-123', experience);

      expect(mockAgentDBService.storeMemory).toHaveBeenCalled();
    });
  });

  describe('Reasoning', () => {
    test('should reason about situation', async () => {
      const situation = { manipulation_score: 0.8 };

      const reasoning = await framework.reason('agent-123', situation);

      expect(reasoning).toHaveProperty('inferences');
      expect(reasoning).toHaveProperty('confidence');
    });
  });
});
