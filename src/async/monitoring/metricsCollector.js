/**
 * Async Processing Metrics Collector
 *
 * This module collects and exposes metrics for the async processing system.
 */

const redis = require('../../config/redis');

class MetricsCollector {
  constructor() {
    this.redisClient = null;
    this.isInitialized = false;
    this.metrics = {
      jobs: {
        total: 0,
        processed: 0,
        failed: 0,
        pending: 0
      },
      queues: {
        totalMessages: 0,
        processedMessages: 0,
        failedMessages: 0
      },
      workers: {
        active: 0,
        idle: 0,
        crashed: 0
      },
      performance: {
        avgProcessingTime: 0,
        totalProcessingTime: 0,
        processingTimeSamples: 0
      }
    };
  }

  /**
   * Initialize the metrics collector
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      this.redisClient = await redis.connect();
      this.isInitialized = true;
      console.log('Metrics collector initialized');
    } catch (error) {
      console.error('Failed to initialize metrics collector:', error);
      throw error;
    }
  }

  /**
   * Record a job being created
   */
  async recordJobCreated() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      this.metrics.jobs.total++;
      this.metrics.jobs.pending++;

      // Update in Redis
      await this._updateCounter('jobs:total', 1);
      await this._updateCounter('jobs:pending', 1);
    } catch (error) {
      console.error('Failed to record job creation:', error);
    }
  }

  /**
   * Record a job being processed
   * @param {string} jobId - Job ID
   * @param {number} startTime - Start time in milliseconds
   */
  async recordJobProcessing(jobId, startTime) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      this.metrics.jobs.pending--;
      this.metrics.workers.active++;

      // Store job start time for duration calculation
      const jobKey = `job:${jobId}:start`;

      await this.redisClient.setex(jobKey, 3600, startTime.toString());
    } catch (error) {
      console.error('Failed to record job processing:', error);
    }
  }

  /**
   * Record a job being completed
   * @param {string} jobId - Job ID
   * @param {number} endTime - End time in milliseconds
   */
  async recordJobCompleted(jobId, endTime) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      this.metrics.jobs.processed++;
      this.metrics.jobs.pending = Math.max(0, this.metrics.jobs.pending - 1);
      this.metrics.workers.active = Math.max(0, this.metrics.workers.active - 1);

      // Calculate processing time
      const jobKey = `job:${jobId}:start`;
      const startTimeStr = await this.redisClient.get(jobKey);

      if (startTimeStr) {
        const startTime = parseInt(startTimeStr);
        const processingTime = endTime - startTime;

        // Update performance metrics
        this.metrics.performance.totalProcessingTime += processingTime;
        this.metrics.performance.processingTimeSamples++;
        this.metrics.performance.avgProcessingTime =
          this.metrics.performance.totalProcessingTime / this.metrics.performance.processingTimeSamples;

        // Clean up
        await this.redisClient.del(jobKey);
      }

      // Update counters
      await this._updateCounter('jobs:processed', 1);
      await this._updateHistogram('job:processing_time', processingTime);
    } catch (error) {
      console.error('Failed to record job completion:', error);
    }
  }

  /**
   * Record a job failure
   * @param {string} jobId - Job ID
   * @param {Error} error - Error that occurred
   */
  async recordJobFailed(jobId, error) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      this.metrics.jobs.failed++;
      this.metrics.jobs.pending = Math.max(0, this.metrics.jobs.pending - 1);
      this.metrics.workers.active = Math.max(0, this.metrics.workers.active - 1);
      this.metrics.workers.crashed++;

      // Record error
      const errorKey = `error:${jobId}`;

      await this.redisClient.setex(errorKey, 3600, JSON.stringify({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }));

      // Update counters
      await this._updateCounter('jobs:failed', 1);
      await this._updateCounter('workers:crashed', 1);
    } catch (error) {
      console.error('Failed to record job failure:', error);
    }
  }

  /**
   * Record a queue message
   */
  async recordQueueMessage() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      this.metrics.queues.totalMessages++;

      // Update counter
      await this._updateCounter('queues:messages_total', 1);
    } catch (error) {
      console.error('Failed to record queue message:', error);
    }
  }

  /**
   * Record a processed queue message
   */
  async recordQueueMessageProcessed() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      this.metrics.queues.processedMessages++;

      // Update counter
      await this._updateCounter('queues:messages_processed', 1);
    } catch (error) {
      console.error('Failed to record processed queue message:', error);
    }
  }

  /**
   * Record a failed queue message
   */
  async recordQueueMessageFailed() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      this.metrics.queues.failedMessages++;

      // Update counter
      await this._updateCounter('queues:messages_failed', 1);
    } catch (error) {
      console.error('Failed to record failed queue message:', error);
    }
  }

  /**
   * Record worker status change
   * @param {string} status - Worker status (active, idle, crashed)
   */
  async recordWorkerStatus(status) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Update worker counters
      switch (status) {
      case 'active':
        this.metrics.workers.active++;
        this.metrics.workers.idle = Math.max(0, this.metrics.workers.idle - 1);
        break;
      case 'idle':
        this.metrics.workers.idle++;
        this.metrics.workers.active = Math.max(0, this.metrics.workers.active - 1);
        break;
      case 'crashed':
        this.metrics.workers.crashed++;
        this.metrics.workers.active = Math.max(0, this.metrics.workers.active - 1);
        break;
      }

      // Update counter
      await this._updateCounter(`workers:${status}`, 1);
    } catch (error) {
      console.error('Failed to record worker status:', error);
    }
  }

  /**
   * Get current metrics
   * @returns {Object} Current metrics
   */
  async getMetrics() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Get counters from Redis
      const counters = await this._getAllCounters();

      // Get histograms from Redis
      const histograms = await this._getAllHistograms();

      return {
        timestamp: new Date().toISOString(),
        jobs: {
          total: counters['jobs:total'] || this.metrics.jobs.total,
          processed: counters['jobs:processed'] || this.metrics.jobs.processed,
          failed: counters['jobs:failed'] || this.metrics.jobs.failed,
          pending: counters['jobs:pending'] || this.metrics.jobs.pending
        },
        queues: {
          totalMessages: counters['queues:messages_total'] || this.metrics.queues.totalMessages,
          processedMessages: counters['queues:messages_processed'] || this.metrics.queues.processedMessages,
          failedMessages: counters['queues:messages_failed'] || this.metrics.queues.failedMessages
        },
        workers: {
          active: counters['workers:active'] || this.metrics.workers.active,
          idle: counters['workers:idle'] || this.metrics.workers.idle,
          crashed: counters['workers:crashed'] || this.metrics.workers.crashed
        },
        performance: {
          avgProcessingTime: this.metrics.performance.avgProcessingTime,
          totalProcessingTime: this.metrics.performance.totalProcessingTime,
          processingTimeSamples: this.metrics.performance.processingTimeSamples
        },
        histograms,
        counters
      };
    } catch (error) {
      console.error('Failed to get metrics:', error);
      throw error;
    }
  }

  /**
   * Reset metrics
   */
  async resetMetrics() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Reset local metrics
      this.metrics = {
        jobs: {
          total: 0,
          processed: 0,
          failed: 0,
          pending: 0
        },
        queues: {
          totalMessages: 0,
          processedMessages: 0,
          failedMessages: 0
        },
        workers: {
          active: 0,
          idle: 0,
          crashed: 0
        },
        performance: {
          avgProcessingTime: 0,
          totalProcessingTime: 0,
          processingTimeSamples: 0
        }
      };

      // Reset Redis counters
      const counterKeys = await this.redisClient.keys('counter:*');

      if (counterKeys.length > 0) {
        await this.redisClient.del(...counterKeys);
      }

      // Reset Redis histograms
      const histogramKeys = await this.redisClient.keys('histogram:*');

      if (histogramKeys.length > 0) {
        await this.redisClient.del(...histogramKeys);
      }

      console.log('Metrics reset');
    } catch (error) {
      console.error('Failed to reset metrics:', error);
      throw error;
    }
  }

  /**
   * Update a counter in Redis
   * @param {string} key - Counter key
   * @param {number} increment - Increment value
   */
  async _updateCounter(key, increment) {
    const fullKey = `counter:${key}`;

    await this.redisClient.incrby(fullKey, increment);
  }

  /**
   * Update a histogram in Redis
   * @param {string} key - Histogram key
   * @param {number} value - Value to add
   */
  async _updateHistogram(key, value) {
    const fullKey = `histogram:${key}`;

    await this.redisClient.lpush(fullKey, value.toString());
    // Keep only last 1000 values
    await this.redisClient.ltrim(fullKey, 0, 999);
  }

  /**
   * Get all counters from Redis
   */
  async _getAllCounters() {
    const keys = await this.redisClient.keys('counter:*');
    const counters = {};

    for (const key of keys) {
      const value = await this.redisClient.get(key);
      const counterName = key.replace('counter:', '');

      counters[counterName] = parseInt(value) || 0;
    }

    return counters;
  }

  /**
   * Get all histograms from Redis
   */
  async _getAllHistograms() {
    const keys = await this.redisClient.keys('histogram:*');
    const histograms = {};

    for (const key of keys) {
      const values = await this.redisClient.lrange(key, 0, -1);
      const histogramName = key.replace('histogram:', '');

      histograms[histogramName] = values.map(v => parseInt(v)).filter(v => !isNaN(v));
    }

    return histograms;
  }

  /**
   * Close the metrics collector
   */
  async close() {
    // Redis connection is managed by the singleton, so we don't close it here
    this.isInitialized = false;
    console.log('Metrics collector closed');
  }
}

// Export singleton instance
module.exports = new MetricsCollector();
