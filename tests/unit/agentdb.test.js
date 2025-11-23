/**
 * AgentDB Unit Tests
 */

const AgentRegistry = require('../../src/models/AgentRegistry');
const AgentState = require('../../src/models/AgentState');
const AgentMemory = require('../../src/models/AgentMemory');

describe('AgentDB Models', () => {
  describe('AgentRegistry', () => {
    test('should create agent registry with valid data', () => {
      const agent = new AgentRegistry({
        agent_name: 'Test Agent',
        agent_type: 'claude-flow',
        agent_version: 'alpha',
        capabilities: ['content-verification'],
        configuration: { test: true }
      });

      expect(agent.agent_name).toBe('Test Agent');
      expect(agent.agent_type).toBe('claude-flow');
      expect(agent.status).toBe('active');
    });

    test('should validate agent registry data', () => {
      const invalidAgent = new AgentRegistry({});
      const validation = invalidAgent.validate();

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('should reject invalid agent type', () => {
      const agent = new AgentRegistry({
        agent_name: 'Test Agent',
        agent_type: 'invalid-type'
      });

      const validation = agent.validate();
      expect(validation.valid).toBe(false);
    });

    test('should convert to JSON', () => {
      const agent = new AgentRegistry({
        agent_name: 'Test Agent',
        agent_type: 'claude-flow'
      });

      const json = agent.toJSON();
      expect(json).toHaveProperty('agent_id');
      expect(json).toHaveProperty('agent_name');
      expect(json).toHaveProperty('created_at');
    });
  });

  describe('AgentState', () => {
    test('should create agent state with valid data', () => {
      const state = new AgentState({
        agent_id: 'test-agent-id',
        session_id: 'test-session',
        state_data: { step: 1 },
        workflow_stage: 'processing'
      });

      expect(state.agent_id).toBe('test-agent-id');
      expect(state.state_data.step).toBe(1);
    });

    test('should validate agent state data', () => {
      const invalidState = new AgentState({});
      const validation = invalidState.validate();

      expect(validation.valid).toBe(false);
    });

    test('should update state data', () => {
      const state = new AgentState({
        agent_id: 'test-agent-id',
        state_data: { step: 1 }
      });

      state.updateState({ step: 2, progress: 0.5 });

      expect(state.state_data.step).toBe(2);
      expect(state.state_data.progress).toBe(0.5);
    });
  });

  describe('AgentMemory', () => {
    test('should create agent memory with valid data', () => {
      const memory = new AgentMemory({
        agent_id: 'test-agent-id',
        memory_type: 'long_term',
        memory_key: 'test-key',
        memory_content: { data: 'test' },
        importance_score: 0.8
      });

      expect(memory.memory_type).toBe('long_term');
      expect(memory.importance_score).toBe(0.8);
    });

    test('should validate memory type', () => {
      const invalidMemory = new AgentMemory({
        agent_id: 'test-agent-id',
        memory_type: 'invalid_type',
        memory_content: {}
      });

      const validation = invalidMemory.validate();
      expect(validation.valid).toBe(false);
    });

    test('should validate importance score range', () => {
      const invalidMemory = new AgentMemory({
        agent_id: 'test-agent-id',
        memory_type: 'long_term',
        memory_content: {},
        importance_score: 1.5
      });

      const validation = invalidMemory.validate();
      expect(validation.valid).toBe(false);
    });

    test('should record access', () => {
      const memory = new AgentMemory({
        agent_id: 'test-agent-id',
        memory_type: 'long_term',
        memory_content: {},
        access_count: 0
      });

      memory.recordAccess();
      expect(memory.access_count).toBe(1);
      expect(memory.last_accessed_at).toBeDefined();
    });

    test('should check expiration', () => {
      const expiredMemory = new AgentMemory({
        agent_id: 'test-agent-id',
        memory_type: 'short_term',
        memory_content: {},
        expires_at: new Date(Date.now() - 1000)
      });

      expect(expiredMemory.isExpired()).toBe(true);

      const validMemory = new AgentMemory({
        agent_id: 'test-agent-id',
        memory_type: 'long_term',
        memory_content: {}
      });

      expect(validMemory.isExpired()).toBe(false);
    });
  });
});
