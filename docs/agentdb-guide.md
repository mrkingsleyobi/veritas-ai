# AgentDB Implementation Guide

## Overview

AgentDB is a comprehensive database system for managing AI agents, their state, memory, conversations, and execution logs. It provides persistent storage and retrieval for agentic workflows integrated with the Veritas AI platform.

## Architecture

### Database Schema

AgentDB consists of 8 main tables:

1. **agent_registry** - Registered agents and their configuration
2. **agent_state** - Current state of active agents
3. **agent_memory** - Long-term and short-term memory storage
4. **agent_conversations** - Conversation tracking
5. **agent_messages** - Individual messages in conversations
6. **agent_execution_logs** - Task execution logging
7. **agent_knowledge_base** - RAG (Retrieval Augmented Generation) storage
8. **agent_collaborations** - Multi-agent collaboration tracking

### Components

- **Models**: Data models for AgentRegistry, AgentState, AgentMemory
- **Repository**: Data access layer (AgentDBRepository)
- **Service**: Business logic layer (AgentDBService)
- **Monitoring**: Observability and health checks (AgentMonitoringService)
- **API Routes**: RESTful endpoints for agent management

## Getting Started

### 1. Database Migration

Run the AgentDB migration to create the necessary tables:

```bash
# Run migration (assuming you have a migration runner)
node src/migrations/003_agentdb_schema.js
```

### 2. Initialize AgentDB Service

```javascript
const AgentDBService = require('./src/services/AgentDBService');
const { Pool } = require('pg');
const Redis = require('ioredis');

// Database connection
const dbPool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD
});

// Redis cache (optional)
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

// Initialize service
const agentDBService = new AgentDBService(dbPool, redis);
await agentDBService.initialize();
```

### 3. Register MCP Agents

MCP agents are automatically registered during initialization based on `.mcp.json`:

- **claude-flow@alpha** - Main workflow orchestration agent
- **ruv-swarm@latest** - RUV profile processing agent
- **flow-nexus@latest** - Flow coordination agent
- **agentic-payments@latest** - Payment processing agent

## API Endpoints

### Agent Management

#### Get All Agents
```http
GET /api/agentdb/agents
```

**Response:**
```json
{
  "success": true,
  "count": 4,
  "agents": [
    {
      "agent_id": "uuid",
      "agent_name": "Claude Flow",
      "agent_type": "claude-flow",
      "status": "active",
      "capabilities": ["content-verification", "orchestration"]
    }
  ]
}
```

#### Get Agent Statistics
```http
GET /api/agentdb/agents/:agentId/statistics
```

**Response:**
```json
{
  "success": true,
  "statistics": {
    "agent_id": "uuid",
    "agent_name": "Claude Flow",
    "total_executions": 150,
    "successful_executions": 142,
    "failed_executions": 8,
    "average_execution_time": 1250,
    "memory_count": 45
  }
}
```

### Session Management

#### Start Agent Session
```http
POST /api/agentdb/sessions
Content-Type: application/json

{
  "agent_id": "uuid",
  "initial_state": {
    "workflow": "content-verification",
    "priority": "high"
  }
}
```

#### Update Agent State
```http
PUT /api/agentdb/sessions/:sessionId/state
Content-Type: application/json

{
  "agent_id": "uuid",
  "state_update": {
    "current_step": 3,
    "progress": 0.6,
    "last_action": "verification_complete"
  }
}
```

### Memory Management

#### Store Memory
```http
POST /api/agentdb/memory
Content-Type: application/json

{
  "agent_id": "uuid",
  "memory_type": "long_term",
  "memory_key": "user_preferences",
  "memory_content": {
    "theme": "dark",
    "notifications": true
  },
  "importance_score": 0.8
}
```

**Memory Types:**
- `short_term` - Temporary memory (session-based)
- `long_term` - Persistent memory
- `episodic` - Event-based memories
- `semantic` - Factual knowledge

#### Retrieve Memories
```http
GET /api/agentdb/memory/:agentId?memory_type=long_term&limit=10
```

#### Search Memories
```http
GET /api/agentdb/memory/:agentId/search?key=user_preferences
```

### Conversation Management

#### Start Conversation
```http
POST /api/agentdb/conversations
Content-Type: application/json

{
  "agent_id": "uuid",
  "user_id": "user123",
  "title": "Deepfake Verification Request"
}
```

#### Add Message
```http
POST /api/agentdb/conversations/:conversationId/messages
Content-Type: application/json

{
  "agent_id": "uuid",
  "role": "user",
  "content": "Please verify this image for authenticity",
  "metadata": {
    "image_url": "https://example.com/image.jpg"
  }
}
```

**Message Roles:**
- `user` - User messages
- `agent` - Agent responses
- `system` - System messages
- `tool` - Tool execution results

#### Get Conversation History
```http
GET /api/agentdb/conversations/:conversationId/messages?limit=100
```

### Execution Logging

#### Start Execution
```http
POST /api/agentdb/executions
Content-Type: application/json

{
  "agent_id": "uuid",
  "task_name": "verify_content",
  "task_type": "verification",
  "input_data": {
    "content_id": "abc123",
    "content_type": "image"
  }
}
```

#### Complete Execution
```http
PUT /api/agentdb/executions/:executionId
Content-Type: application/json

{
  "output_data": {
    "authentic": false,
    "confidence": 0.85
  },
  "status": "completed"
}
```

#### Get Execution History
```http
GET /api/agentdb/executions/:agentId?limit=50
```

## Agent Monitoring

### Dashboard
```http
GET /api/agent-monitoring/dashboard
```

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "total_agents": 4,
    "active_agents": 4,
    "agents": [
      {
        "agent_id": "uuid",
        "agent_name": "Claude Flow",
        "health": "healthy",
        "statistics": {
          "total_executions": 150,
          "success_rate": 0.95
        }
      }
    ]
  }
}
```

### Performance Trends
```http
GET /api/agent-monitoring/agents/:agentId/trends?days=7
```

### Monitoring Report
```http
GET /api/agent-monitoring/report
```

## Usage Examples

### Example 1: Content Verification with Agent State

```javascript
// Start agent session
const session = await agentDBService.startAgentSession(
  'claude-flow-agent-id',
  null,
  { workflow: 'content-verification' }
);

// Update state as verification progresses
await agentDBService.updateAgentState(
  session.agent_id,
  session.session_id,
  { step: 'analyzing', progress: 0.3 }
);

// Store important findings in memory
await agentDBService.storeMemory(
  session.agent_id,
  'episodic',
  `verification-${contentId}`,
  {
    content_id: contentId,
    findings: ['metadata_anomaly', 'compression_artifacts'],
    confidence: 0.85
  },
  { importance_score: 0.9 }
);

// Complete execution
await agentDBService.completeExecution(
  executionId,
  { authentic: false, confidence: 0.85 },
  'completed'
);
```

### Example 2: Multi-Agent Conversation

```javascript
// Start conversation
const conversation = await agentDBService.startConversation(
  'flow-nexus-agent-id',
  'user123',
  'Batch Verification Request'
);

// User message
await agentDBService.addMessage(
  conversation.conversation_id,
  conversation.agent_id,
  'user',
  'Please verify these 50 images'
);

// Agent response
await agentDBService.addMessage(
  conversation.conversation_id,
  conversation.agent_id,
  'agent',
  'Starting batch verification. This will take approximately 2 minutes.'
);

// Get conversation history
const history = await agentDBService.getConversationHistory(
  conversation.conversation_id
);
```

### Example 3: Memory-Based Decision Making

```javascript
// Retrieve past memories about a user
const memories = await agentDBService.searchMemories(
  agentId,
  `user-${userId}-preferences`
);

// Use memories to make informed decisions
const userPreferences = memories[0]?.memory_content;
if (userPreferences?.detailed_reports) {
  // Generate detailed report
}

// Store new memory
await agentDBService.storeMemory(
  agentId,
  'semantic',
  `user-${userId}-preferences`,
  {
    detailed_reports: true,
    notification_preference: 'email',
    last_updated: new Date()
  },
  { importance_score: 0.7 }
);
```

## Best Practices

### 1. State Management
- Update agent state frequently during long-running tasks
- Use meaningful workflow stages
- Store intermediate results in state for recovery

### 2. Memory Management
- Use appropriate memory types:
  - `short_term` for session data
  - `long_term` for persistent knowledge
  - `episodic` for events
  - `semantic` for facts
- Set importance scores to prioritize critical memories
- Use `expires_at` for temporary memories
- Regularly cleanup expired memories

### 3. Conversation Tracking
- Create new conversations for distinct interactions
- Use descriptive conversation titles
- Include metadata for context

### 4. Execution Logging
- Always log agent executions for debugging
- Record both input and output data
- Include execution time for performance analysis

### 5. Monitoring
- Enable agent monitoring in production
- Set appropriate alert thresholds
- Review monitoring reports regularly
- Use performance trends to optimize agents

## Integration with MCP Agents

AgentDB seamlessly integrates with MCP (Model Context Protocol) agents defined in `.mcp.json`:

```json
{
  "mcpServers": {
    "claude-flow@alpha": {
      "command": "npx",
      "args": ["claude-flow@alpha", "mcp", "start"],
      "type": "stdio"
    }
  }
}
```

Each MCP agent is automatically:
1. Registered in the agent_registry table
2. Monitored for health and performance
3. Tracked for all executions
4. Given persistent state and memory storage

## Troubleshooting

### Issue: Agent not found
**Solution**: Verify the agent is registered in agent_registry table

### Issue: Memory growing too large
**Solution**: Set `expires_at` for short-term memories and run cleanup regularly

### Issue: Slow query performance
**Solution**: Ensure database indexes are created (automatically done by migration)

### Issue: Monitoring not working
**Solution**: Call `agentMonitoringService.startMonitoring()` to enable monitoring

## Security Considerations

1. **Authentication**: Secure all API endpoints with JWT authentication
2. **Access Control**: Implement role-based access for agent management
3. **Data Encryption**: Encrypt sensitive agent state and memory data
4. **Audit Logging**: All agent operations are logged for compliance
5. **Rate Limiting**: Apply rate limits to prevent abuse

## Performance Optimization

1. **Database Indexing**: All tables have appropriate indexes
2. **Caching**: Use Redis for frequently accessed agent data
3. **Connection Pooling**: Use connection pools for database access
4. **Batch Operations**: Use batch operations for multiple agent updates
5. **Memory Cleanup**: Schedule regular cleanup of expired memories

## Future Enhancements

- [ ] Vector embeddings for semantic memory search (pgvector)
- [ ] Agent collaboration workflows
- [ ] Real-time agent communication via WebSockets
- [ ] Advanced RAG (Retrieval Augmented Generation)
- [ ] Multi-tenant agent isolation
- [ ] Agent versioning and rollback
- [ ] Distributed agent orchestration

## Support

For questions or issues with AgentDB:
- Review this documentation
- Check the codebase examples
- Contact the development team
