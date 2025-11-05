/**
 * Async Processing Service
 *
 * Main service that orchestrates all async processing components
 * including queues, workers, schedulers, and monitoring.
 */

const rabbitmq = require('./queues/rabbitmq');
const jobQueueManager = require('./queues/bullmq');
const contentVerificationWorker = require('./workers/contentVerificationWorker');
const { createProgressTracker, updateProgress } = require('./progress/progressTracker');
const circuitBreakerRegistry = require('./circuit-breaker/circuitBreaker');
const taskScheduler = require('./schedulers/taskScheduler');
const metricsCollector = require('./monitoring/metricsCollector');

class AsyncProcessingService {
  constructor() {
    this.isInitialized = false;
    this.healthCheckInterval = null;
  }

  /**
   * Initialize all async processing components
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing async processing service...');

      // Initialize core components
      await Promise.all([
        rabbitmq.initialize(),
        jobQueueManager.initialize(),
        contentVerificationWorker.initialize(),
        taskScheduler.initialize(),
        metricsCollector.initialize()
      ]);

      // Set up workers
      await this._setupWorkers();

      // Set up health checks
      this._setupHealthChecks();

      this.isInitialized = true;
      console.log('Async processing service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize async processing service:', error);
      throw error;
    }
  }

  /**
   * Set up workers for processing jobs
   */
  async _setupWorkers() {
    try {
      // Set up content verification worker
      await jobQueueManager.processQueue('content-verification', async(job) => {
        await metricsCollector.recordJobProcessing(job.id, Date.now());

        try {
          const result = await contentVerificationWorker.processJob(job);

          await metricsCollector.recordJobCompleted(job.id, Date.now());

          return result;
        } catch (error) {
          await metricsCollector.recordJobFailed(job.id, error);
          throw error;
        }
      });

      // Set up batch processing worker
      await jobQueueManager.processQueue('batch-processing', async(job) => {
        await metricsCollector.recordJobProcessing(job.id, Date.now());

        try {
          const result = await contentVerificationWorker.processBatchJob(job);

          await metricsCollector.recordJobCompleted(job.id, Date.now());

          return result;
        } catch (error) {
          await metricsCollector.recordJobFailed(job.id, error);
          throw error;
        }
      });

      // Set up RUV profile processing worker
      await jobQueueManager.processQueue('ruv-profile-processing', async(job) => {
        await metricsCollector.recordJobProcessing(job.id, Date.now());

        try {
          const result = await contentVerificationWorker.processRUVProfileJob(job);

          await metricsCollector.recordJobCompleted(job.id, Date.now());

          return result;
        } catch (error) {
          await metricsCollector.recordJobFailed(job.id, error);
          throw error;
        }
      });

      // Set up high priority worker
      await jobQueueManager.processQueue('high-priority-tasks', async(job) => {
        await metricsCollector.recordJobProcessing(job.id, Date.now());

        try {
          // Process based on job type
          let result;

          switch (job.data.type) {
          case 'content-verification':
            result = await contentVerificationWorker.processJob(job);
            break;
          case 'batch-processing':
            result = await contentVerificationWorker.processBatchJob(job);
            break;
          case 'ruv-profile':
            result = await contentVerificationWorker.processRUVProfileJob(job);
            break;
          default:
            throw new Error(`Unknown job type: ${job.data.type}`);
          }

          await metricsCollector.recordJobCompleted(job.id, Date.now());

          return result;
        } catch (error) {
          await metricsCollector.recordJobFailed(job.id, error);
          throw error;
        }
      });

      console.log('Workers set up successfully');
    } catch (error) {
      console.error('Failed to set up workers:', error);
      throw error;
    }
  }

  /**
   * Set up health checks
   */
  _setupHealthChecks() {
    // Run health checks every 30 seconds
    this.healthCheckInterval = setInterval(async() => {
      try {
        await this._performHealthCheck();
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, 30000);
  }

  /**
   * Perform health check
   */
  async _performHealthCheck() {
    const healthStatus = {
      timestamp: new Date().toISOString(),
      components: {}
    };

    // Check RabbitMQ
    try {
      const queueMetrics = await rabbitmq.getQueueMetrics();

      healthStatus.components.rabbitmq = {
        status: 'healthy',
        metrics: queueMetrics
      };
    } catch (error) {
      healthStatus.components.rabbitmq = {
        status: 'unhealthy',
        error: error.message
      };
    }

    // Check job queues
    try {
      const queueMetrics = await jobQueueManager.getAllQueueMetrics();

      healthStatus.components.jobQueues = {
        status: 'healthy',
        metrics: queueMetrics
      };
    } catch (error) {
      healthStatus.components.jobQueues = {
        status: 'unhealthy',
        error: error.message
      };
    }

    // Log health status
    const unhealthyComponents = Object.entries(healthStatus.components)
      .filter(([_, component]) => component.status === 'unhealthy');

    if (unhealthyComponents.length > 0) {
      console.warn('Health check found unhealthy components:', unhealthyComponents);
    } else {
      console.log('Health check: All components healthy');
    }

    return healthStatus;
  }

  /**
   * Submit a content verification job
   * @param {Object} content - Content to verify
   * @param {Object} options - Verification options
   * @param {boolean} highPriority - Whether this is a high priority job
   */
  async submitContentVerificationJob(content, options = {}, highPriority = false) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await metricsCollector.recordJobCreated();

      const jobData = {
        content,
        options,
        jobId: `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Create progress tracker
      await createProgressTracker(jobData.jobId, 'Content verification', 100);

      // Add job to appropriate queue
      const queueName = highPriority ? 'high-priority-tasks' : 'content-verification';
      const jobOptions = highPriority ? {
        jobId: jobData.jobId,
        priority: 10
      } : {
        jobId: jobData.jobId
      };

      if (highPriority) {
        jobData.type = 'content-verification';
      }

      const job = await jobQueueManager.addJob(queueName, jobData, jobOptions);

      console.log(`Content verification job ${job.id} submitted to queue ${queueName}`);

      return job.id;
    } catch (error) {
      console.error('Failed to submit content verification job:', error);
      throw error;
    }
  }

  /**
   * Submit a batch verification job
   * @param {Array} contents - Array of content to verify
   * @param {Object} options - Verification options
   */
  async submitBatchVerificationJob(contents, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await metricsCollector.recordJobCreated();

      const jobData = {
        contents,
        options,
        jobId: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Create progress tracker
      await createProgressTracker(jobData.jobId, 'Batch content verification', 100);

      // Add job to queue
      const job = await jobQueueManager.addJob('batch-processing', jobData, {
        jobId: jobData.jobId
      });

      console.log(`Batch verification job ${job.id} submitted`);

      return job.id;
    } catch (error) {
      console.error('Failed to submit batch verification job:', error);
      throw error;
    }
  }

  /**
   * Submit an RUV profile processing job
   * @param {string} contentId - Content ID
   * @param {Object} ruvData - RUV data
   */
  async submitRUVProfileJob(contentId, ruvData) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await metricsCollector.recordJobCreated();

      const jobData = {
        contentId,
        ruvData,
        jobId: `ruv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Create progress tracker
      await createProgressTracker(jobData.jobId, 'RUV profile processing', 100);

      // Add job to queue
      const job = await jobQueueManager.addJob('ruv-profile-processing', jobData, {
        jobId: jobData.jobId
      });

      console.log(`RUV profile job ${job.id} submitted`);

      return job.id;
    } catch (error) {
      console.error('Failed to submit RUV profile job:', error);
      throw error;
    }
  }

  /**
   * Schedule a recurring verification task
   * @param {string} taskId - Task ID
   * @param {string} cronExpression - Cron expression
   * @param {Object} jobData - Job data
   * @param {Date} startDate - Start date (optional)
   * @param {Date} endDate - End date (optional)
   */
  async scheduleRecurringVerification(taskId, cronExpression, jobData, startDate, endDate) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await taskScheduler.scheduleRecurringTask(
        taskId,
        cronExpression,
        'content-verification',
        jobData,
        {},
        startDate,
        endDate
      );

      console.log(`Recurring verification task ${taskId} scheduled`);

      return taskId;
    } catch (error) {
      console.error('Failed to schedule recurring verification task:', error);
      throw error;
    }
  }

  /**
   * Get job progress
   * @param {string} jobId - Job ID
   */
  async getJobProgress(jobId) {
    try {
      const progress = await require('./progress/progressTracker').getProgress(jobId);

      return progress;
    } catch (error) {
      console.error(`Failed to get progress for job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Get system metrics
   */
  async getMetrics() {
    try {
      const metrics = await metricsCollector.getMetrics();

      // Add queue metrics
      const queueMetrics = await jobQueueManager.getAllQueueMetrics();

      metrics.queues.details = queueMetrics;

      // Add circuit breaker metrics
      const breakerMetrics = circuitBreakerRegistry.getAllBreakers();

      metrics.circuitBreakers = breakerMetrics;

      return metrics;
    } catch (error) {
      console.error('Failed to get system metrics:', error);
      throw error;
    }
  }

  /**
   * Get health status
   */
  async getHealthStatus() {
    try {
      return await this._performHealthCheck();
    } catch (error) {
      console.error('Failed to get health status:', error);
      throw error;
    }
  }

  /**
   * Close all async processing components
   */
  async close() {
    try {
      console.log('Closing async processing service...');

      // Clear health check interval
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }

      // Close components in parallel
      await Promise.allSettled([
        rabbitmq.close(),
        jobQueueManager.close(),
        contentVerificationWorker.close(),
        taskScheduler.close(),
        metricsCollector.close()
      ]);

      this.isInitialized = false;
      console.log('Async processing service closed');
    } catch (error) {
      console.error('Error closing async processing service:', error);
    }
  }
}

// Export singleton instance
module.exports = new AsyncProcessingService();
