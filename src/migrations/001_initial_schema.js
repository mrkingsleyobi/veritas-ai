/**
 * Initial Database Schema Migration
 *
 * Creates the initial database schema for RUV profiles and verification results
 */

module.exports = {
  up: async(pgClient) => {
    // Create RUV profiles table
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS ruv_profiles (
        content_id VARCHAR(255) PRIMARY KEY,
        reputation DECIMAL(5,4) NOT NULL DEFAULT 0.5,
        uniqueness DECIMAL(5,4) NOT NULL DEFAULT 0.5,
        verification DECIMAL(5,4) NOT NULL DEFAULT 0.5,
        fusion_score DECIMAL(5,4) NOT NULL DEFAULT 0.5,
        history JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        accessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        compressed BOOLEAN NOT NULL DEFAULT false,
        access_count INTEGER NOT NULL DEFAULT 0
      )
    `);

    // Create indexes for RUV profiles
    await pgClient.query(`
      CREATE INDEX IF NOT EXISTS idx_ruv_profiles_accessed_at ON ruv_profiles (accessed_at)
    `);
    await pgClient.query(`
      CREATE INDEX IF NOT EXISTS idx_ruv_profiles_access_count ON ruv_profiles (access_count)
    `);
    await pgClient.query(`
      CREATE INDEX IF NOT EXISTS idx_ruv_profiles_fusion_score ON ruv_profiles (fusion_score)
    `);

    // Create verification results table
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS verification_results (
        id SERIAL PRIMARY KEY,
        content_id VARCHAR(255) NOT NULL,
        authentic BOOLEAN NOT NULL DEFAULT false,
        confidence DECIMAL(5,4) NOT NULL DEFAULT 0.0,
        details JSONB NOT NULL DEFAULT '{}',
        metadata JSONB NOT NULL DEFAULT '{}',
        ruv_profile JSONB,
        fused_confidence DECIMAL(5,4),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        accessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        compressed BOOLEAN NOT NULL DEFAULT false,
        access_count INTEGER NOT NULL DEFAULT 0
      )
    `);

    // Create indexes for verification results
    await pgClient.query(`
      CREATE INDEX IF NOT EXISTS idx_verification_results_content_id ON verification_results (content_id)
    `);
    await pgClient.query(`
      CREATE INDEX IF NOT EXISTS idx_verification_results_created_at ON verification_results (created_at)
    `);
    await pgClient.query(`
      CREATE INDEX IF NOT EXISTS idx_verification_results_confidence ON verification_results (confidence)
    `);
    await pgClient.query(`
      CREATE INDEX IF NOT EXISTS idx_verification_results_accessed_at ON verification_results (accessed_at)
    `);

    console.log('Initial schema migration completed successfully');
  },

  down: async(pgClient) => {
    // Drop verification results table
    await pgClient.query('DROP TABLE IF EXISTS verification_results');

    // Drop RUV profiles table
    await pgClient.query('DROP TABLE IF EXISTS ruv_profiles');

    console.log('Initial schema migration rolled back successfully');
  }
};
