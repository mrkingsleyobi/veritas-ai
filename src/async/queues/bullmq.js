/**
 * BullMQ Job Queue Manager
 *
 * This module provides a more advanced job queue system using BullMQ
 * for handling complex job scheduling, retries, and progress tracking.
 */

const { Queue, Worker, QueueEvents } = require('bullmq');
const redis = require('../../config/redis');
const { redisConfig } = require('../../config/database');

class JobQueueManager {
  constructor() {
    this.queues = new Map();
    this.workers = new Map();
    this.queueEvents = new Map();
    this.redisConnection = null;
  }

  /**
   * Initialize Redis connection and job queues
   */
  async initialize() {
    try {
      // Get Redis connection
      this.redisConnection = await redis.connect();

      // Initialize core queues
      await this._initializeQueue('content-verification');
      await this._initializeQueue('batch-processing');
      await this._initializeQueue('ruv-profile-processing');
      await this._initializeQueue('high-priority-tasks');

      console.log('Job queues initialized');
    } catch (error) {
      console.error('Failed to initialize job queues:', error);
      throw error;
    }
  }

  /**
   * Initialize a specific queue
   * @param {string} queueName - Name of the queue
   */
  async _initializeQueue(queueName) {
    // Create queue with proper prefix configuration
    const queue = new Queue(queueName, {
      connection: this.redisConnection,
      prefix: redisConfig.keyPrefix || 'bull',
      defaultJobOptions: {
        attempts: process.env.NODE_ENV === 'test' ? 1 : 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        },
        removeOnComplete: { age: 3600 }, // Remove completed jobs after 1 hour
        removeOnFail: { age: 86400 } // Remove failed jobs after 24 hours
      }
    });

    // Create queue events for monitoring
    const queueEvents = new QueueEvents(queueName, {
      connection: this.redisConnection,
      prefix: redisConfig.keyPrefix || 'bull'
    });

    this.queues.set(queueName, queue);
    this.queueEvents.set(queueName, queueEvents);

    console.log(`Queue ${queueName} initialized`);
  }

  /**
   * Add a job to a queue
   * @param {string} queueName - Name of the queue
   * @param {Object} data - Job data
   * @param {Object} options - Job options
   */
  async addJob(queueName, data, options = {}) {
    const queue = this.queues.get(queueName);

    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const jobId = options.jobId || this._generateJobId();

    const jobOptions = {
      jobId,
      ...options
    };

    return await queue.add(queueName, data, jobOptions);
  }

  /**
   * Process jobs from a queue
   * @param {string} queueName - Name of the queue
   * @param {Function} processor - Job processor function
   */
  async processQueue(queueName, processor) {
    const queue = this.queues.get(queueName);

    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const worker = new Worker(queueName, async(job) => {
      try {
        // Add progress tracking
        await job.updateProgress(0);

        const result = await processor(job);

        await job.updateProgress(100);

        return result;
      } catch (error) {
        console.error(`Job ${job.id} failed:`, error);
        throw error;
      }
    }, {
      connection: this.redisConnection,
      prefix: redisConfig.keyPrefix || 'bull',
      concurrency: process.env.NODE_ENV === 'test' ? 1 : 5 // Process fewer jobs concurrently in test mode
    });

    this.workers.set(queueName, worker);

    // Set up event listeners
    worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed`);
    });

    worker.on('failed', (job, error) => {
      console.error(`Job ${job.id} failed:`, error);
    });

    worker.on('progress', (job, progress) => {
      console.log(`Job ${job.id} progress: ${progress}%`);
    });

    console.log(`Worker for queue ${queueName} started`);
  }

  /**
   * Get queue metrics
   * @param {string} queueName - Name of the queue
   */
  async getQueueMetrics(queueName) {
    const queue = this.queues.get(queueName);

    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const counts = await queue.getJobCounts();
    const isPaused = await queue.isPaused();

    return {
      name: queueName,
      counts,
      isPaused
    };
  }

  /**
   * Get all queue metrics
   */
  async getAllQueueMetrics() {
    const metrics = [];

    for (const [queueName] of this.queues) {
      try {
        const queueMetrics = await this.getQueueMetrics(queueName);

        metrics.push(queueMetrics);
      } catch (error) {
        console.error(`Failed to get metrics for queue ${queueName}:`, error);
      }
    }

    return metrics;
  }

  /**
   * Pause a queue
   * @param {string} queueName - Name of the queue
   */
  async pauseQueue(queueName) {
    const queue = this.queues.get(queueName);

    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.pause();
    console.log(`Queue ${queueName} paused`);
  }

  /**
   * Resume a queue
   * @param {string} queueName - Name of the queue
   */
  async resumeQueue(queueName) {
    const queue = this.queues.get(queueName);

    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.resume();
    console.log(`Queue ${queueName} resumed`);
  }

  /**
   * Clean queue (remove completed/failed jobs)
   * @param {string} queueName - Name of the queue
   * @param {number} gracePeriod - Grace period in milliseconds
   * @param {string} status - Status to clean (completed, failed, delayed, wait, active)
   */
  async cleanQueue(queueName, gracePeriod = 0, status = 'completed') {
    const queue = this.queues.get(queueName);

    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const count = await queue.clean(gracePeriod, status);

    console.log(`Cleaned ${count} ${status} jobs from queue ${queueName}`);

    return count;
  }

  /**
   * Close all queues and workers
   */
  async close() {
    try {
      // Close workers
      for (const [queueName, worker] of this.workers) {
        await worker.close();
        console.log(`Worker for queue ${queueName} closed`);
      }

      // Close queues
      for (const [queueName, queue] of this.queues) {
        await queue.close();
        console.log(`Queue ${queueName} closed`);
      }

      // Close queue events
      for (const [queueName, queueEvents] of this.queueEvents) {
        await queueEvents.close();
        console.log(`Queue events for ${queueName} closed`);
      }

      console.log('All job queues closed');
    } catch (error) {
      console.error('Error closing job queues:', error);
    }
  }

  /**
   * Generate a unique job ID
   */
  _generateJobId() {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
module.exports = new JobQueueManager();
