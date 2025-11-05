#!/usr/bin/env node

/**
 * Database Migration Runner
 *
 * Runs database migrations in order
 */

const fs = require('fs').promises;
const path = require('path');
const postgresClient = require('../config/postgres');

async function runMigrations() {
  try {
    console.log('Starting database migrations...');

    // Connect to database
    const pool = await postgresClient.connect();

    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of already executed migrations
    const executedResult = await pool.query('SELECT name FROM migrations ORDER BY id');
    const executedMigrations = executedResult.rows.map(row => row.name);

    // Get list of migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files
      .filter(file => file.endsWith('.js') && file.match(/^\d+_.+\.js$/))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files`);

    // Execute pending migrations
    let executedCount = 0;

    for (const file of migrationFiles) {
      if (!executedMigrations.includes(file)) {
        console.log(`Executing migration: ${file}`);

        const migrationPath = path.join(migrationsDir, file);
        const migration = require(migrationPath);

        // Run migration in a transaction
        const client = await pool.connect();

        try {
          await client.query('BEGIN');

          if (typeof migration.up === 'function') {
            await migration.up(client);
          }

          // Record migration execution
          await client.query(
            'INSERT INTO migrations (name) VALUES ($1)',
            [file]
          );

          await client.query('COMMIT');
          console.log(`Migration ${file} executed successfully`);
          executedCount++;
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`Migration ${file} failed:`, error);
          throw error;
        } finally {
          client.release();
        }
      } else {
        console.log(`Migration ${file} already executed, skipping`);
      }
    }

    console.log(`Migration process completed. ${executedCount} migrations executed.`);

    // Close connection
    await postgresClient.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration process failed:', error);
    process.exit(1);
  }
}

// Run migrations if script is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
