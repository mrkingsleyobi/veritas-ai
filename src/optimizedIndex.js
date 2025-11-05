/**
 * Deepfake Detection Platform - Optimized Entry Point
 *
 * This is the optimized entry point for the deepfake detection platform,
 * integrating performance-enhanced content authenticity verification with RUV profile fusion.
 */

// Import optimized services
const OptimizedContentAuthenticator = require('./algorithms/optimizedContentAuthenticator');
const OptimizedRUVProfileService = require('./services/optimizedRuvProfileService');

// Import utilities
const { redisCache } = require('./cache/redisClient');
const { dbPool } = require('./database/connectionPool');
const { memoryManager } = require('./utils/memoryManager');
const { performanceBenchmark } = require('./utils/performanceBenchmark');

// Initialize optimized services
const authenticator = new OptimizedContentAuthenticator();
const ruvService = new OptimizedRUVProfileService();

// Initialize utilities
memoryManager.startMonitoring();

// Connect to Redis if available
(async() => {
  if (process.env.REDIS_URL) {
    await redisCache.connect();
  }
})();

// Export optimized services and utilities
module.exports = {
  // Optimized services
  OptimizedContentAuthenticator,
  OptimizedRUVProfileService,
  authenticator,
  ruvService,

  // Utilities
  redisCache,
  dbPool,
  memoryManager,
  performanceBenchmark,

  // Initialize function for external use
  async initialize() {
    console.log('Initializing optimized deepfake detection platform...');

    // Connect to Redis
    if (process.env.REDIS_URL) {
      const redisConnected = await redisCache.connect();

      console.log(`Redis cache: ${redisConnected ? 'CONNECTED' : 'FAILED'}`);
    }

    // Initialize database
    try {
      await ruvService.initializeDatabase();
      console.log('Database initialized');
    } catch (error) {
      console.error('Database initialization failed:', error);
    }

    // Start memory monitoring
    memoryManager.startMonitoring();
    console.log('Memory monitoring started');

    console.log('Optimized platform initialization complete');
  },

  // Cleanup function for graceful shutdown
  async cleanup() {
    console.log('Cleaning up optimized platform resources...');

    // Close worker threads
    if (authenticator && typeof authenticator.closeWorkers === 'function') {
      await authenticator.closeWorkers();
      console.log('Worker threads closed');
    }

    // Close database connections
    if (ruvService && typeof ruvService.close === 'function') {
      await ruvService.close();
      console.log('Database connections closed');
    }

    // Disconnect Redis
    if (redisCache) {
      await redisCache.disconnect();
      console.log('Redis cache disconnected');
    }

    // Stop memory monitoring
    if (memoryManager) {
      memoryManager.stopMonitoring();
      console.log('Memory monitoring stopped');
    }

    console.log('Platform cleanup complete');
  }
};

// Simple server startup (for demonstration)
if (require.main === module) {
  console.log('Deepfake Detection Platform (Optimized) initialized');
  console.log('Services ready for content authenticity verification');

  // Initialize platform
  module.exports.initialize().catch(console.error);

  // Example usage
  const exampleContent = {
    type: 'image',
    data: Buffer.from('example image data')
  };

  // Perform verification with optimizations
  authenticator.verifyAuthenticity(exampleContent)
    .then(result => {
      console.log('Example verification result:', result);
    })
    .catch(error => {
      console.error('Verification error:', error.message);
    });

  // Graceful shutdown handling
  const gracefulShutdown = async() => {
    await module.exports.cleanup();
    process.exit(0);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}
