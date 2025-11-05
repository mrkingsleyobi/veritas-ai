/**
 * Test Setup
 *
 * Global test setup and teardown for database connections
 */

const DataPersistenceService = require('../src/services/DataPersistenceService');
const postgresClient = require('../src/config/postgres');
const redisClient = require('../src/config/redis');

// Global setup before all tests
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';

  // Initialize database connections once for all tests
  try {
    console.log('Setting up test environment...');
  } catch (error) {
    console.error('Test setup error:', error);
  }
});

// Global teardown after all tests
afterAll(async () => {
  try {
    console.log('Tearing down test environment...');

    // Clean up any remaining connections
    const persistenceService = new DataPersistenceService();

    // Try to close connections gracefully
    try {
      await persistenceService.close();
    } catch (error) {
      console.warn('Error closing persistence service:', error);
    }

    // Force close PostgreSQL connections
    try {
      await postgresClient.disconnect();
    } catch (error) {
      console.warn('Error disconnecting PostgreSQL:', error);
    }

    // Force close Redis connections
    try {
      await redisClient.disconnect();
    } catch (error) {
      console.warn('Error disconnecting Redis:', error);
    }

    console.log('Test environment teardown completed');
  } catch (error) {
    console.error('Test teardown error:', error);
  }
});

// Setup before each test
beforeEach(async () => {
  // Clear any test data if needed
});

// Cleanup after each test
afterEach(async () => {
  // Clean up after each test
});