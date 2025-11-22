## Agentic Flow System - Complete Guide

## Overview

The Agentic Flow system provides autonomous workflow orchestration, decision-making, planning, and learning capabilities for AI agents in the Veritas AI platform.

## Architecture

### Components

1. **AgenticFlowEngine** - Workflow orchestration and execution
2. **AgentDecisionFramework** - Decision-making, planning, and learning
3. **AgentDB** - Persistent state and memory storage
4. **MCP Integration** - Integration with Model Context Protocol agents

## Workflow Orchestration

### Creating a Workflow

```javascript
POST /api/agentic-flow/workflows
Content-Type: application/json

{
  "agent_id": "claude-flow-agent-id",
  "workflow_type": "content-verification",
  "config": {
    "initialContext": {
      "content_id": "abc123",
      "priority": "high"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "workflow": {
    "workflow_id": "wf-uuid",
    "agent_id": "claude-flow-agent-id",
    "type": "content-verification",
    "status": "initialized",
    "session_id": "session-uuid"
  }
}
```

### Defining Workflow Steps

```javascript
POST /api/agentic-flow/workflows/{workflowId}/steps
Content-Type: application/json

{
  "steps": [
    {
      "name": "verify_content",
      "action": "verify_content",
      "config": {
        "contentKey": "content",
        "options": { "deep_scan": true }
      }
    },
    {
      "name": "create_ruv",
      "action": "create_ruv_profile",
      "config": {
        "contentIdKey": "content_id",
        "ruvDataKey": "ruv_data"
      }
    },
    {
      "name": "decide_action",
      "action": "make_decision",
      "config": {
        "condition": "context.verify_content.confidence > 0.8"
      }
    }
  ]
}
```

### Available Actions

| Action | Description | Config |
|--------|-------------|--------|
| `verify_content` | Verify content authenticity | `contentKey`, `options` |
| `create_ruv_profile` | Create RUV profile | `contentIdKey`, `ruvDataKey` |
| `make_decision` | Make a decision | `condition` |
| `store_data` | Store data | `key`, `value` |
| `transform_data` | Transform data | `inputKey`, `transformer` |
| `call_api` | Call external API | `endpoint`, `method`, `data` |
| `wait` | Add delay | `delayMs` |

### Executing a Workflow

```javascript
POST /api/agentic-flow/workflows/{workflowId}/execute
```

**Response:**
```json
{
  "success": true,
  "execution_result": {
    "success": true,
    "workflow_id": "wf-uuid",
    "status": "completed",
    "context": {
      "verify_content": {
        "authentic": false,
        "confidence": 0.85
      },
      "create_ruv": {
        "profile_id": "profile-uuid"
      }
    },
    "steps_executed": 3
  }
}
```

### Workflow Control

#### Pause
```javascript
POST /api/agentic-flow/workflows/{workflowId}/pause
```

#### Resume
```javascript
POST /api/agentic-flow/workflows/{workflowId}/resume
```

#### Cancel
```javascript
POST /api/agentic-flow/workflows/{workflowId}/cancel
```

#### Get Status
```javascript
GET /api/agentic-flow/workflows/{workflowId}/status
```

**Response:**
```json
{
  "success": true,
  "status": {
    "workflow_id": "wf-uuid",
    "status": "running",
    "current_step": 2,
    "total_steps": 3,
    "progress": 0.67,
    "steps": [
      {
        "name": "verify_content",
        "status": "completed",
        "result": { "authentic": false }
      },
      {
        "name": "create_ruv",
        "status": "running",
        "result": null
      }
    ]
  }
}
```

## Decision Making

### Making Decisions

```javascript
POST /api/agentic-flow/decisions
Content-Type: application/json

{
  "agent_id": "agent-uuid",
  "context": {
    "content_type": "image",
    "confidence_score": 0.85,
    "manipulation_detected": true
  },
  "rules": [
    {
      "name": "high_confidence_reject",
      "condition": "context.confidence_score > 0.8 && context.manipulation_detected",
      "action": "reject",
      "priority": 10
    },
    {
      "name": "medium_confidence_review",
      "condition": "context.confidence_score > 0.5",
      "action": "review",
      "priority": 5
    },
    {
      "name": "default",
      "condition": "true",
      "action": "accept",
      "priority": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "decision": {
    "decision": "reject",
    "matched_rules": [
      {
        "rule": "high_confidence_reject",
        "result": true,
        "action": "reject",
        "priority": 10
      }
    ],
    "reasoning": "Selected rule 'high_confidence_reject' with priority 10",
    "confidence": 0.9
  }
}
```

## Action Planning

### Planning to Achieve a Goal

```javascript
POST /api/agentic-flow/planning
Content-Type: application/json

{
  "agent_id": "agent-uuid",
  "current_state": {
    "authenticated": false,
    "content_verified": false,
    "profile_created": false
  },
  "goal_state": {
    "authenticated": true,
    "content_verified": true,
    "profile_created": true
  },
  "available_actions": [
    {
      "name": "authenticate",
      "effects": { "authenticated": true }
    },
    {
      "name": "verify_content",
      "effects": { "content_verified": true }
    },
    {
      "name": "create_profile",
      "effects": { "profile_created": true }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "plan": {
    "success": true,
    "plan": [
      { "name": "authenticate", "effects": { "authenticated": true } },
      { "name": "verify_content", "effects": { "content_verified": true } },
      { "name": "create_profile", "effects": { "profile_created": true } }
    ],
    "steps": 3,
    "estimated_success_rate": 0.85
  }
}
```

## Learning from Experience

### Recording Experience

```javascript
POST /api/agentic-flow/learning
Content-Type: application/json

{
  "agent_id": "agent-uuid",
  "experience": {
    "action": "verify_content",
    "context": {
      "content_type": "image",
      "file_size": 2048000
    },
    "outcome": "success",
    "reward": 0.9
  }
}
```

**Reward Guidelines:**
- `0.8 - 1.0`: Highly successful action
- `0.5 - 0.8`: Moderately successful
- `0.0 - 0.5`: Poor outcome
- `< 0.0`: Negative outcome (penalty)

## Reasoning

### Reasoning About Situations

```javascript
POST /api/agentic-flow/reasoning
Content-Type: application/json

{
  "agent_id": "agent-uuid",
  "situation": {
    "manipulation_score": 0.85,
    "metadata_inconsistent": true,
    "compression_artifacts": true
  },
  "known_facts": [
    {
      "pattern": "context.manipulation_score > 0.7",
      "conclusion": "Likely deepfake",
      "confidence": 0.8,
      "pattern_description": "High manipulation score"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "reasoning": {
    "situation": { ... },
    "inferences": [
      {
        "conclusion": "Content is likely manipulated",
        "confidence": 0.85,
        "reasoning": "High manipulation score detected"
      },
      {
        "conclusion": "Likely deepfake",
        "confidence": 0.8,
        "reasoning": "Matches known pattern: High manipulation score"
      }
    ],
    "confidence": 0.7,
    "facts_analyzed": 5
  }
}
```

## Complete Example: Content Verification Workflow

```javascript
// 1. Create workflow
const createResponse = await fetch('/api/agentic-flow/workflows', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agent_id: 'claude-flow-agent',
    workflow_type: 'content-verification',
    config: {
      initialContext: {
        content: contentData,
        content_id: 'img-123'
      }
    }
  })
});

const { workflow } = await createResponse.json();

// 2. Define steps
await fetch(`/api/agentic-flow/workflows/${workflow.workflow_id}/steps`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    steps: [
      {
        name: 'verify',
        action: 'verify_content',
        config: { contentKey: 'content' }
      },
      {
        name: 'decide',
        action: 'make_decision',
        config: {
          condition: 'context.verify.confidence > 0.7'
        }
      },
      {
        name: 'create_profile',
        action: 'create_ruv_profile',
        config: {
          contentIdKey: 'content_id',
          ruvDataKey: 'verify'
        }
      }
    ]
  })
});

// 3. Execute workflow
const executeResponse = await fetch(
  `/api/agentic-flow/workflows/${workflow.workflow_id}/execute`,
  { method: 'POST' }
);

const result = await executeResponse.json();
console.log('Workflow completed:', result);
```

## Integration with AgentDB

All workflow executions are automatically:
- Stored in agent state
- Recorded in execution logs
- Saved in agent memory (episodic memories)
- Tracked for monitoring

## Best Practices

### Workflow Design
1. Keep steps focused and single-purpose
2. Use meaningful step names
3. Handle errors gracefully with `continueOnError`
4. Store important intermediate results

### Decision Making
1. Order rules by priority (highest first)
2. Always include a default rule
3. Use clear, testable conditions
4. Store decisions for future learning

### Planning
1. Define clear goal states
2. Provide comprehensive available actions
3. Use past successful plans for learning

### Learning
1. Reward successful actions highly (> 0.8)
2. Penalize failures (< 0)
3. Store experiences consistently
4. Review learned patterns regularly

## Monitoring

All agentic activities are monitored through:
- Agent execution logs
- Performance metrics
- Memory usage tracking
- Health checks

Access monitoring via:
```javascript
GET /api/agent-monitoring/dashboard
GET /api/agent-monitoring/agents/{agentId}/trends
```

## Security

- Workflow actions run in sandboxed environment
- Decision conditions are safely evaluated
- No arbitrary code execution
- All actions logged for audit

## Troubleshooting

### Workflow Not Executing
- Check workflow status is 'ready'
- Verify all steps are properly defined
- Check agent DB connectivity

### Decision Not Matching
- Verify condition syntax
- Check context data availability
- Review rule priorities

### Planning Fails
- Ensure goal state is achievable
- Verify available actions are sufficient
- Check for circular dependencies
