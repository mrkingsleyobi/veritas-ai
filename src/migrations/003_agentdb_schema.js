/**
 * AgentDB Schema Migration
 *
 * Creates database tables for storing AI agent state, memory,
 * conversation history, and execution logs.
 */

/**
 * Apply the migration - Create AgentDB tables
 * @param {Object} db - Database connection
 */
async function up(db) {
  console.log('Creating AgentDB schema...');

  // 1. Agent Registry Table - Stores registered agents and their configuration
  await db.query(`
    CREATE TABLE IF NOT EXISTS agent_registry (
      agent_id VARCHAR(255) PRIMARY KEY,
      agent_name VARCHAR(255) NOT NULL,
      agent_type VARCHAR(100) NOT NULL, -- 'claude-flow', 'ruv-swarm', 'flow-nexus', 'custom'
      agent_version VARCHAR(50),
      capabilities JSONB, -- Array of capabilities/tools
      configuration JSONB, -- Agent-specific configuration
      status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_active_at TIMESTAMP
    )
  `);

  // 2. Agent State Table - Stores current state of active agents
  await db.query(`
    CREATE TABLE IF NOT EXISTS agent_state (
      state_id VARCHAR(255) PRIMARY KEY,
      agent_id VARCHAR(255) NOT NULL REFERENCES agent_registry(agent_id) ON DELETE CASCADE,
      session_id VARCHAR(255),
      state_data JSONB NOT NULL, -- Current agent state (variables, context, etc.)
      workflow_stage VARCHAR(100), -- Current stage in workflow
      metadata JSONB, -- Additional metadata
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Agent Memory Table - Long-term memory storage for agents
  await db.query(`
    CREATE TABLE IF NOT EXISTS agent_memory (
      memory_id VARCHAR(255) PRIMARY KEY,
      agent_id VARCHAR(255) NOT NULL REFERENCES agent_registry(agent_id) ON DELETE CASCADE,
      memory_type VARCHAR(50) NOT NULL, -- 'short_term', 'long_term', 'episodic', 'semantic'
      memory_key VARCHAR(255), -- Key for retrieving specific memories
      memory_content JSONB NOT NULL, -- The actual memory content
      importance_score DECIMAL(3,2), -- 0.00 to 1.00
      access_count INTEGER DEFAULT 0,
      last_accessed_at TIMESTAMP,
      expires_at TIMESTAMP, -- For TTL-based memories
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4. Agent Conversations Table - Stores conversation history
  await db.query(`
    CREATE TABLE IF NOT EXISTS agent_conversations (
      conversation_id VARCHAR(255) PRIMARY KEY,
      agent_id VARCHAR(255) NOT NULL REFERENCES agent_registry(agent_id) ON DELETE CASCADE,
      session_id VARCHAR(255),
      user_id VARCHAR(255),
      conversation_title VARCHAR(255),
      status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'archived'
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 5. Agent Messages Table - Individual messages in conversations
  await db.query(`
    CREATE TABLE IF NOT EXISTS agent_messages (
      message_id VARCHAR(255) PRIMARY KEY,
      conversation_id VARCHAR(255) NOT NULL REFERENCES agent_conversations(conversation_id) ON DELETE CASCADE,
      agent_id VARCHAR(255) NOT NULL REFERENCES agent_registry(agent_id) ON DELETE CASCADE,
      role VARCHAR(50) NOT NULL, -- 'user', 'agent', 'system', 'tool'
      content TEXT NOT NULL,
      content_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'json', 'error'
      metadata JSONB, -- Tool calls, thinking process, etc.
      token_count INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 6. Agent Execution Logs Table - Logs of agent task executions
  await db.query(`
    CREATE TABLE IF NOT EXISTS agent_execution_logs (
      execution_id VARCHAR(255) PRIMARY KEY,
      agent_id VARCHAR(255) NOT NULL REFERENCES agent_registry(agent_id) ON DELETE CASCADE,
      task_name VARCHAR(255) NOT NULL,
      task_type VARCHAR(100), -- 'verification', 'analysis', 'orchestration', 'custom'
      input_data JSONB,
      output_data JSONB,
      status VARCHAR(50) NOT NULL, -- 'pending', 'running', 'completed', 'failed', 'cancelled'
      error_message TEXT,
      execution_time_ms INTEGER,
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP,
      metadata JSONB
    )
  `);

  // 7. Agent Knowledge Base Table - RAG storage for agent knowledge
  await db.query(`
    CREATE TABLE IF NOT EXISTS agent_knowledge_base (
      knowledge_id VARCHAR(255) PRIMARY KEY,
      agent_id VARCHAR(255) REFERENCES agent_registry(agent_id) ON DELETE CASCADE,
      document_type VARCHAR(100), -- 'policy', 'procedure', 'fact', 'example', 'context'
      title VARCHAR(255),
      content TEXT NOT NULL,
      embedding VECTOR(1536), -- For vector similarity search (if using pgvector)
      tags TEXT[], -- Array of tags for filtering
      source_url VARCHAR(500),
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 8. Agent Collaboration Table - Multi-agent collaboration tracking
  await db.query(`
    CREATE TABLE IF NOT EXISTS agent_collaborations (
      collaboration_id VARCHAR(255) PRIMARY KEY,
      initiator_agent_id VARCHAR(255) NOT NULL REFERENCES agent_registry(agent_id),
      collaborator_agent_ids JSONB NOT NULL, -- Array of agent IDs
      collaboration_type VARCHAR(100), -- 'sequential', 'parallel', 'hierarchical'
      goal TEXT,
      status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'failed'
      result JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP
    )
  `);

  // Create indexes for better query performance
  console.log('Creating AgentDB indexes...');

  await db.query('CREATE INDEX IF NOT EXISTS idx_agent_state_agent_id ON agent_state(agent_id)');
  await db.query('CREATE INDEX IF NOT EXISTS idx_agent_state_session_id ON agent_state(session_id)');
  await db.query('CREATE INDEX IF NOT EXISTS idx_agent_memory_agent_id ON agent_memory(agent_id)');
  await db.query('CREATE INDEX IF NOT EXISTS idx_agent_memory_type ON agent_memory(memory_type)');
  await db.query('CREATE INDEX IF NOT EXISTS idx_agent_memory_key ON agent_memory(memory_key)');
  await db.query('CREATE INDEX IF NOT EXISTS idx_agent_conversations_agent_id ON agent_conversations(agent_id)');
  await db.query('CREATE INDEX IF NOT EXISTS idx_agent_conversations_session_id ON agent_conversations(session_id)');
  await db.query('CREATE INDEX IF NOT EXISTS idx_agent_messages_conversation_id ON agent_messages(conversation_id)');
  await db.query('CREATE INDEX IF NOT EXISTS idx_agent_messages_agent_id ON agent_messages(agent_id)');
  await db.query('CREATE INDEX IF NOT EXISTS idx_agent_execution_logs_agent_id ON agent_execution_logs(agent_id)');
  await db.query('CREATE INDEX IF NOT EXISTS idx_agent_execution_logs_status ON agent_execution_logs(status)');
  await db.query('CREATE INDEX IF NOT EXISTS idx_agent_knowledge_base_agent_id ON agent_knowledge_base(agent_id)');
  await db.query('CREATE INDEX IF NOT EXISTS idx_agent_knowledge_base_type ON agent_knowledge_base(document_type)');
  await db.query('CREATE INDEX IF NOT EXISTS idx_agent_collaborations_initiator ON agent_collaborations(initiator_agent_id)');

  console.log('AgentDB schema created successfully');
}

/**
 * Rollback the migration - Drop AgentDB tables
 * @param {Object} db - Database connection
 */
async function down(db) {
  console.log('Rolling back AgentDB schema...');

  await db.query('DROP TABLE IF EXISTS agent_collaborations CASCADE');
  await db.query('DROP TABLE IF EXISTS agent_knowledge_base CASCADE');
  await db.query('DROP TABLE IF EXISTS agent_execution_logs CASCADE');
  await db.query('DROP TABLE IF EXISTS agent_messages CASCADE');
  await db.query('DROP TABLE IF EXISTS agent_conversations CASCADE');
  await db.query('DROP TABLE IF EXISTS agent_memory CASCADE');
  await db.query('DROP TABLE IF EXISTS agent_state CASCADE');
  await db.query('DROP TABLE IF EXISTS agent_registry CASCADE');

  console.log('AgentDB schema rolled back successfully');
}

module.exports = { up, down };
