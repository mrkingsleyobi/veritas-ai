/**
 * Progress Tracking System
 *
 * This module provides progress tracking for long-running asynchronous operations.
 */

const redis = require('../../config/redis');

class ProgressTracker {
  constructor() {
    this.redisClient = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the progress tracker
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      this.redisClient = await redis.connect();
      this.isInitialized = true;
      console.log('Progress tracker initialized');
    } catch (error) {
      console.error('Failed to initialize progress tracker:', error);
      throw error;
    }
  }

  /**
   * Create a new progress tracker for an operation
   * @param {string} operationId - Unique identifier for the operation
   * @param {string} description - Description of the operation
   * @param {number} totalSteps - Total number of steps (optional)
   */
  async createProgressTracker(operationId, description, totalSteps = 100) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const progressKey = `progress:${operationId}`;
    const progressData = {
      operationId,
      description,
      status: 'started',
      progress: 0,
      totalSteps,
      currentStep: 0,
      startTime: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      steps: []
    };

    try {
      await this.redisClient.setex(
        progressKey,
        3600, // Expire after 1 hour
        JSON.stringify(progressData)
      );

      return progressData;
    } catch (error) {
      console.error(`Failed to create progress tracker for ${operationId}:`, error);
      throw error;
    }
  }

  /**
   * Update progress for an operation
   * @param {string} operationId - Unique identifier for the operation
   * @param {number} progress - Progress percentage (0-100)
   * @param {string} stepDescription - Description of current step
   * @param {Object} metadata - Additional metadata (optional)
   */
  async updateProgress(operationId, progress, stepDescription, metadata = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const progressKey = `progress:${operationId}`;

    try {
      const progressDataStr = await this.redisClient.get(progressKey);

      if (!progressDataStr) {
        console.warn(`Progress tracker not found for operation ${operationId}`);

        return null;
      }

      const progressData = JSON.parse(progressDataStr);

      // Update progress data
      progressData.progress = Math.min(100, Math.max(0, progress));
      progressData.currentStep = Math.floor((progress / 100) * progressData.totalSteps);
      progressData.lastUpdate = new Date().toISOString();
      progressData.steps.push({
        timestamp: new Date().toISOString(),
        progress,
        description: stepDescription,
        metadata
      });

      // Update status based on progress
      if (progress >= 100) {
        progressData.status = 'completed';
        progressData.endTime = new Date().toISOString();
      } else if (progress > 0) {
        progressData.status = 'in_progress';
      }

      // Update in Redis
      await this.redisClient.setex(
        progressKey,
        3600, // Expire after 1 hour
        JSON.stringify(progressData)
      );

      // Emit progress event (in a real implementation, this might use EventEmitter)
      console.log(`Progress update for ${operationId}: ${progress}% - ${stepDescription}`);

      return progressData;
    } catch (error) {
      console.error(`Failed to update progress for ${operationId}:`, error);
      throw error;
    }
  }

  /**
   * Mark an operation as failed
   * @param {string} operationId - Unique identifier for the operation
   * @param {string} errorMessage - Error message
   * @param {Object} errorDetails - Additional error details (optional)
   */
  async markFailed(operationId, errorMessage, errorDetails = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const progressKey = `progress:${operationId}`;

    try {
      const progressDataStr = await this.redisClient.get(progressKey);

      if (!progressDataStr) {
        console.warn(`Progress tracker not found for operation ${operationId}`);

        return null;
      }

      const progressData = JSON.parse(progressDataStr);

      // Update progress data
      progressData.status = 'failed';
      progressData.errorMessage = errorMessage;
      progressData.errorDetails = errorDetails;
      progressData.endTime = new Date().toISOString();
      progressData.lastUpdate = new Date().toISOString();

      // Update in Redis
      await this.redisClient.setex(
        progressKey,
        3600, // Expire after 1 hour
        JSON.stringify(progressData)
      );

      console.log(`Operation ${operationId} marked as failed: ${errorMessage}`);

      return progressData;
    } catch (error) {
      console.error(`Failed to mark operation ${operationId} as failed:`, error);
      throw error;
    }
  }

  /**
   * Get progress for an operation
   * @param {string} operationId - Unique identifier for the operation
   */
  async getProgress(operationId) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const progressKey = `progress:${operationId}`;

    try {
      const progressDataStr = await this.redisClient.get(progressKey);

      if (!progressDataStr) {
        return null;
      }

      return JSON.parse(progressDataStr);
    } catch (error) {
      console.error(`Failed to get progress for ${operationId}:`, error);
      throw error;
    }
  }

  /**
   * Get all active operations
   */
  async getActiveOperations() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const keys = await this.redisClient.keys('progress:*');
      const operations = [];

      for (const key of keys) {
        try {
          const progressDataStr = await this.redisClient.get(key);

          if (progressDataStr) {
            const progressData = JSON.parse(progressDataStr);

            // Only include operations that are not completed or failed
            if (progressData.status !== 'completed' && progressData.status !== 'failed') {
              operations.push(progressData);
            }
          }
        } catch (error) {
          console.error(`Failed to parse progress data for key ${key}:`, error);
        }
      }

      return operations;
    } catch (error) {
      console.error('Failed to get active operations:', error);
      throw error;
    }
  }

  /**
   * Clean up old progress trackers
   * @param {number} maxAgeSeconds - Maximum age in seconds (default: 1 hour)
   */
  async cleanupOldTrackers(maxAgeSeconds = 3600) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const keys = await this.redisClient.keys('progress:*');
      let cleanedCount = 0;

      for (const key of keys) {
        try {
          const progressDataStr = await this.redisClient.get(key);

          if (progressDataStr) {
            const progressData = JSON.parse(progressDataStr);
            const lastUpdate = new Date(progressData.lastUpdate);
            const ageSeconds = (Date.now() - lastUpdate.getTime()) / 1000;

            // Clean up completed/failed operations older than maxAgeSeconds
            if ((progressData.status === 'completed' || progressData.status === 'failed') &&
                ageSeconds > maxAgeSeconds) {
              await this.redisClient.del(key);
              cleanedCount++;
            }
          }
        } catch (error) {
          console.error(`Failed to clean up progress tracker for key ${key}:`, error);
        }
      }

      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} old progress trackers`);
      }

      return cleanedCount;
    } catch (error) {
      console.error('Failed to cleanup old progress trackers:', error);
      throw error;
    }
  }

  /**
   * Close the progress tracker
   */
  async close() {
    // Redis connection is managed by the singleton, so we don't close it here
    this.isInitialized = false;
    console.log('Progress tracker closed');
  }
}

// Export singleton instance
module.exports = new ProgressTracker();

// Convenience function for updating progress
async function updateProgress(operationId, progress, stepDescription, metadata = {}) {
  try {
    return await module.exports.updateProgress(operationId, progress, stepDescription, metadata);
  } catch (error) {
    console.error(`Failed to update progress for ${operationId}:`, error);

    // Don't throw error to avoid breaking the main operation
    return null;
  }
}

module.exports.updateProgress = updateProgress;
