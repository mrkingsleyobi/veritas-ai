/**
 * Add Compression Indexes Migration
 *
 * Adds indexes to support compression and eviction policies
 */

module.exports = {
  up: async(pgClient) => {
    // Add indexes for compression queries
    await pgClient.query(`
      CREATE INDEX IF NOT EXISTS idx_ruv_profiles_compressed ON ruv_profiles (compressed)
    `);
    await pgClient.query(`
      CREATE INDEX IF NOT EXISTS idx_ruv_profiles_history_length ON ruv_profiles (jsonb_array_length(history))
    `);
    await pgClient.query(`
      CREATE INDEX IF NOT EXISTS idx_verification_results_compressed ON verification_results (compressed)
    `);

    // Add updated_at trigger for automatic timestamp updates
    await pgClient.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
         NEW.updated_at = NOW();
         RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Add triggers for automatic updated_at updates
    await pgClient.query(`
      DROP TRIGGER IF EXISTS update_ruv_profiles_updated_at ON ruv_profiles
    `);
    await pgClient.query(`
      CREATE TRIGGER update_ruv_profiles_updated_at
         BEFORE UPDATE ON ruv_profiles
         FOR EACH ROW
         EXECUTE FUNCTION update_updated_at_column()
    `);

    await pgClient.query(`
      DROP TRIGGER IF EXISTS update_verification_results_updated_at ON verification_results
    `);
    await pgClient.query(`
      CREATE TRIGGER update_verification_results_updated_at
         BEFORE UPDATE ON verification_results
         FOR EACH ROW
         EXECUTE FUNCTION update_updated_at_column()
    `);

    console.log('Compression indexes migration completed successfully');
  },

  down: async(pgClient) => {
    // Drop triggers
    await pgClient.query('DROP TRIGGER IF EXISTS update_verification_results_updated_at ON verification_results');
    await pgClient.query('DROP TRIGGER IF EXISTS update_ruv_profiles_updated_at ON ruv_profiles');

    // Drop update function
    await pgClient.query('DROP FUNCTION IF EXISTS update_updated_at_column');

    // Drop compression indexes
    await pgClient.query('DROP INDEX IF EXISTS idx_verification_results_compressed');
    await pgClient.query('DROP INDEX IF EXISTS idx_ruv_profiles_history_length');
    await pgClient.query('DROP INDEX IF EXISTS idx_ruv_profiles_compressed');

    console.log('Compression indexes migration rolled back successfully');
  }
};
