/**
 * Database Migration Runner
 *
 * Manages database schema migrations with version tracking
 */

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const { postgresConfig } = require('../config/database');

class MigrationRunner {
  constructor(pool = null) {
    this.pool = pool || new Pool(postgresConfig);
    this.migrationsDir = path.join(__dirname, '../migrations');
  }

  /**
   * Initialize migration tracking table
   */
  async initializeMigrationTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        execution_time_ms INTEGER,
        status VARCHAR(50) DEFAULT 'completed'
      )
    `;

    await this.pool.query(query);
    console.log('Migration tracking table initialized');
  }

  /**
   * Get list of executed migrations
   */
  async getExecutedMigrations() {
    const query = 'SELECT migration_name FROM schema_migrations ORDER BY id';
    const result = await this.pool.query(query);
    return result.rows.map(row => row.migration_name);
  }

  /**
   * Get list of available migration files
   */
  async getAvailableMigrations() {
    const files = await fs.readdir(this.migrationsDir);
    return files
      .filter(file => file.endsWith('.js'))
      .sort();
  }

  /**
   * Get pending migrations
   */
  async getPendingMigrations() {
    const executed = await this.getExecutedMigrations();
    const available = await this.getAvailableMigrations();

    return available.filter(migration => !executed.includes(migration));
  }

  /**
   * Execute a single migration
   */
  async executeMigration(migrationFile) {
    const migrationPath = path.join(this.migrationsDir, migrationFile);
    const migration = require(migrationPath);

    console.log(`\nExecuting migration: ${migrationFile}`);
    const startTime = Date.now();

    try {
      // Create a wrapper object with query method for migration compatibility
      const dbWrapper = {
        query: async (sql, params) => {
          return await this.pool.query(sql, params);
        }
      };

      // Execute migration up() function
      if (typeof migration.up === 'function') {
        await migration.up(dbWrapper);
      } else {
        throw new Error('Migration must export an "up" function');
      }

      const executionTime = Date.now() - startTime;

      // Record migration in tracking table
      await this.pool.query(
        'INSERT INTO schema_migrations (migration_name, execution_time_ms, status) VALUES ($1, $2, $3)',
        [migrationFile, executionTime, 'completed']
      );

      console.log(`✅ Migration ${migrationFile} completed in ${executionTime}ms`);
      return { success: true, executionTime };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Record failed migration
      try {
        await this.pool.query(
          'INSERT INTO schema_migrations (migration_name, execution_time_ms, status) VALUES ($1, $2, $3)',
          [migrationFile, executionTime, 'failed']
        );
      } catch (recordError) {
        console.error('Failed to record migration failure:', recordError);
      }

      console.error(`❌ Migration ${migrationFile} failed:`, error.message);
      throw error;
    }
  }

  /**
   * Run all pending migrations
   */
  async migrate() {
    console.log('Starting database migration...\n');

    try {
      // Initialize migration tracking table
      await this.initializeMigrationTable();

      // Get pending migrations
      const pending = await this.getPendingMigrations();

      if (pending.length === 0) {
        console.log('✅ No pending migrations');
        return { executed: 0, migrations: [] };
      }

      console.log(`Found ${pending.length} pending migration(s):`);
      pending.forEach(m => console.log(`  - ${m}`));
      console.log('');

      const results = [];

      // Execute each pending migration
      for (const migration of pending) {
        const result = await this.executeMigration(migration);
        results.push({ migration, ...result });
      }

      console.log(`\n✅ Successfully executed ${results.length} migration(s)`);

      return {
        executed: results.length,
        migrations: results
      };
    } catch (error) {
      console.error('\n❌ Migration failed:', error.message);
      throw error;
    }
  }

  /**
   * Rollback last migration
   */
  async rollback() {
    console.log('Starting migration rollback...\n');

    try {
      const executed = await this.getExecutedMigrations();

      if (executed.length === 0) {
        console.log('No migrations to rollback');
        return { success: false, message: 'No migrations to rollback' };
      }

      const lastMigration = executed[executed.length - 1];
      const migrationPath = path.join(this.migrationsDir, lastMigration);
      const migration = require(migrationPath);

      console.log(`Rolling back migration: ${lastMigration}`);

      // Create a wrapper object with query method
      const dbWrapper = {
        query: async (sql, params) => {
          return await this.pool.query(sql, params);
        }
      };

      // Execute migration down() function
      if (typeof migration.down === 'function') {
        await migration.down(dbWrapper);
      } else {
        throw new Error('Migration must export a "down" function');
      }

      // Remove from tracking table
      await this.pool.query(
        'DELETE FROM schema_migrations WHERE migration_name = $1',
        [lastMigration]
      );

      console.log(`✅ Successfully rolled back: ${lastMigration}`);

      return { success: true, migration: lastMigration };
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      throw error;
    }
  }

  /**
   * Get migration status
   */
  async status() {
    await this.initializeMigrationTable();

    const executed = await this.getExecutedMigrations();
    const available = await this.getAvailableMigrations();
    const pending = await this.getPendingMigrations();

    console.log('\n=== Migration Status ===\n');
    console.log(`Total migrations: ${available.length}`);
    console.log(`Executed: ${executed.length}`);
    console.log(`Pending: ${pending.length}\n`);

    if (executed.length > 0) {
      console.log('Executed migrations:');
      for (const migration of executed) {
        console.log(`  ✅ ${migration}`);
      }
      console.log('');
    }

    if (pending.length > 0) {
      console.log('Pending migrations:');
      for (const migration of pending) {
        console.log(`  ⏳ ${migration}`);
      }
      console.log('');
    }

    return { available, executed, pending };
  }

  /**
   * Close database connection
   */
  async close() {
    await this.pool.end();
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2] || 'migrate';

  const runner = new MigrationRunner();

  const run = async () => {
    try {
      switch (command) {
        case 'migrate':
        case 'up':
          await runner.migrate();
          break;

        case 'rollback':
        case 'down':
          await runner.rollback();
          break;

        case 'status':
          await runner.status();
          break;

        default:
          console.log('Usage: node migrationRunner.js [migrate|rollback|status]');
          console.log('  migrate  - Run pending migrations');
          console.log('  rollback - Rollback last migration');
          console.log('  status   - Show migration status');
      }

      await runner.close();
      process.exit(0);
    } catch (error) {
      console.error('Migration runner error:', error);
      await runner.close();
      process.exit(1);
    }
  };

  run();
}

module.exports = MigrationRunner;
