/**
 * Data Persistence Service
 *
 * Main service for data persistence with PostgreSQL, Redis caching, and backup mechanisms
 * Implemented as a singleton to prevent connection pool exhaustion
 */

const postgresClient = require('../config/postgres');
const redisClient = require('../config/redis');
const CacheService = require('./CacheService');
const BackupService = require('./BackupService');
const RUVProfileRepository = require('../repositories/RUVProfileRepository');
const VerificationResultRepository = require('../repositories/VerificationResultRepository');

class DataPersistenceService {
  constructor() {
    // Singleton pattern
    if (DataPersistenceService.instance) {
      return DataPersistenceService.instance;
    }

    this.postgres = null;
    this.redis = null;
    this.cacheService = null;
    this.backupService = null;
    this.ruvProfileRepository = null;
    this.verificationResultRepository = null;
    this.isInitialized = false;
    this.compressionInterval = null;
    this.backupInterval = null;
    this.refCount = 0;

    DataPersistenceService.instance = this;
  }

  // Initialize all services
  async initialize() {
    this.refCount++;

    if (this.isInitialized) {
      console.log(`Data persistence service reused (ref count: ${this.refCount})`);

      return;
    }

    try {
      console.log('Initializing data persistence service...');

      // Initialize PostgreSQL
      this.postgres = await postgresClient.connect();
      console.log('PostgreSQL initialized');

      // Initialize Redis
      this.redis = await redisClient.connect();
      console.log('Redis initialized');

      // Initialize cache service
      this.cacheService = new CacheService(this.redis);
      await this.cacheService.initialize();
      console.log('Cache service initialized');

      // Initialize backup service
      this.backupService = new BackupService();
      await this.backupService.initialize();
      console.log('Backup service initialized');

      // Initialize repositories
      this.ruvProfileRepository = new RUVProfileRepository(this.postgres, this.redis);
      await this.ruvProfileRepository.initialize();
      console.log('RUV profile repository initialized');

      this.verificationResultRepository = new VerificationResultRepository(this.postgres, this.redis);
      await this.verificationResultRepository.initialize();
      console.log('Verification result repository initialized');

      // Set up compression interval (every 6 hours)
      this.compressionInterval = setInterval(async() => {
        try {
          await this.compressInfrequentlyAccessedData();
        } catch (error) {
          console.error('Data compression error:', error);
        }
      }, 6 * 60 * 60 * 1000); // 6 hours

      // Set up backup interval (daily)
      this.backupInterval = setInterval(async() => {
        try {
          await this.createAutomaticBackup();
        } catch (error) {
          console.error('Automatic backup error:', error);
        }
      }, 24 * 60 * 60 * 1000); // 24 hours

      // Set up memory monitoring alerts
      if (this.cacheService) {
        this.cacheService.onMemoryAlert(async(alertData) => {
          console.warn('Cache memory alert:', alertData);
          // In a real implementation, you might want to send alerts to monitoring systems
        });
      }

      this.isInitialized = true;
      console.log('Data persistence service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize data persistence service:', error);
      this.refCount--;
      throw error;
    }
  }

  // Compress infrequently accessed data
  async compressInfrequentlyAccessedData() {
    if (!this.isInitialized) {
      throw new Error('Data persistence service not initialized');
    }

    try {
      console.log('Starting data compression process...');

      const compressedCount = await this.ruvProfileRepository.compressInfrequentlyAccessedProfiles();

      console.log(`Compressed ${compressedCount} RUV profiles`);

      // Add more compression logic for other data types as needed

      console.log('Data compression process completed');
    } catch (error) {
      console.error('Data compression failed:', error);
      throw error;
    }
  }

  // Create automatic backup
  async createAutomaticBackup() {
    if (!this.isInitialized) {
      throw new Error('Data persistence service not initialized');
    }

    try {
      console.log('Starting automatic backup process...');

      const backupPath = await this.backupService.createBackup();

      console.log(`Automatic backup created: ${backupPath}`);

      // Cleanup old backups
      const deletedCount = await this.backupService.cleanupOldBackups();

      console.log(`Cleaned up ${deletedCount} old backups`);

      console.log('Automatic backup process completed');
    } catch (error) {
      console.error('Automatic backup failed:', error);
      throw error;
    }
  }

  // Get RUV profile by content ID
  async getRUVProfile(contentId) {
    if (!this.isInitialized) {
      throw new Error('Data persistence service not initialized');
    }

    return await this.ruvProfileRepository.getByContentId(contentId);
  }

  // Save RUV profile
  async saveRUVProfile(profile) {
    if (!this.isInitialized) {
      throw new Error('Data persistence service not initialized');
    }

    return await this.ruvProfileRepository.save(profile);
  }

  // Delete RUV profile
  async deleteRUVProfile(contentId) {
    if (!this.isInitialized) {
      throw new Error('Data persistence service not initialized');
    }

    return await this.ruvProfileRepository.delete(contentId);
  }

  // Get verification result by ID
  async getVerificationResult(id) {
    if (!this.isInitialized) {
      throw new Error('Data persistence service not initialized');
    }

    return await this.verificationResultRepository.getById(id);
  }

  // Get verification results by content ID
  async getVerificationResultsByContentId(contentId) {
    if (!this.isInitialized) {
      throw new Error('Data persistence service not initialized');
    }

    return await this.verificationResultRepository.getByContentId(contentId);
  }

  // Create verification result
  async createVerificationResult(result) {
    if (!this.isInitialized) {
      throw new Error('Data persistence service not initialized');
    }

    return await this.verificationResultRepository.create(result);
  }

  // Update verification result
  async updateVerificationResult(result) {
    if (!this.isInitialized) {
      throw new Error('Data persistence service not initialized');
    }

    return await this.verificationResultRepository.update(result);
  }

  // Delete verification result
  async deleteVerificationResult(id) {
    if (!this.isInitialized) {
      throw new Error('Data persistence service not initialized');
    }

    return await this.verificationResultRepository.delete(id);
  }

  // Get cache statistics
  async getCacheStats() {
    if (!this.isInitialized) {
      throw new Error('Data persistence service not initialized');
    }

    return await this.cacheService.getStats();
  }

  // Get database health
  async getDatabaseHealth() {
    if (!this.isInitialized) {
      throw new Error('Data persistence service not initialized');
    }

    const postgresHealth = await postgresClient.healthCheck();
    const redisConnected = this.redis ? true : false;

    return {
      postgres: postgresHealth,
      redis: {
        status: redisConnected ? 'healthy' : 'unhealthy',
        connected: redisConnected
      }
    };
  }

  // Get access statistics
  async getAccessStatistics() {
    if (!this.isInitialized) {
      throw new Error('Data persistence service not initialized');
    }

    const profileStats = await this.ruvProfileRepository.getAccessStatistics();
    const compressionStats = await this.ruvProfileRepository.getCompressionStatistics();
    const verificationStats = await this.verificationResultRepository.getVerificationStatistics();

    return {
      profiles: profileStats,
      compression: compressionStats,
      verification: verificationStats
    };
  }

  // Clear cache
  async clearCache() {
    if (!this.isInitialized) {
      throw new Error('Data persistence service not initialized');
    }

    return await this.cacheService.clear();
  }

  // Restore from backup
  async restoreFromBackup(backupPath) {
    if (!this.isInitialized) {
      throw new Error('Data persistence service not initialized');
    }

    return await this.backupService.restoreBackup(backupPath);
  }

  // List available backups
  async listBackups() {
    if (!this.isInitialized) {
      throw new Error('Data persistence service not initialized');
    }

    return await this.backupService.listBackups();
  }

  // Close all connections
  async close() {
    this.refCount--;

    // Only close when no more references
    if (this.refCount <= 0) {
      try {
        console.log('Closing data persistence service connections...');

        // Clear intervals
        if (this.compressionInterval) {
          clearInterval(this.compressionInterval);
        }
        if (this.backupInterval) {
          clearInterval(this.backupInterval);
        }

        // Close cache service
        if (this.cacheService) {
          await this.cacheService.close();
        }

        // Close Redis connection through singleton
        if (redisClient) {
          await redisClient.disconnect();
        }

        // Close PostgreSQL connection through singleton
        if (postgresClient) {
          await postgresClient.disconnect();
        }

        this.isInitialized = false;
        console.log('Data persistence service connections closed');
      } catch (error) {
        console.error('Error closing data persistence service:', error);
      }
    } else {
      console.log(`Data persistence service reference released (remaining: ${this.refCount})`);
    }
  }

  // Get reference count
  getRefCount() {
    return this.refCount;
  }
}

module.exports = DataPersistenceService;
