/**
 * Distributed Task Scheduler
 *
 * This module provides distributed task scheduling capabilities
 * using Redis for coordination between multiple instances.
 */

const redis = require('../../config/redis');
const { addJob } = require('../queues/bullmq');

class TaskScheduler {
  constructor() {
    this.redisClient = null;
    this.isInitialized = false;
    this.scheduledTasks = new Map();
  }

  /**
   * Initialize the task scheduler
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      this.redisClient = await redis.connect();
      this.isInitialized = true;
      console.log('Task scheduler initialized');
    } catch (error) {
      console.error('Failed to initialize task scheduler:', error);
      throw error;
    }
  }

  /**
   * Schedule a task to run at a specific time
   * @param {string} taskId - Unique identifier for the task
   * @param {Date} runAt - When to run the task
   * @param {string} queueName - Queue to add the task to
   * @param {Object} jobData - Data for the job
   * @param {Object} jobOptions - Options for the job
   */
  async scheduleTask(taskId, runAt, queueName, jobData, jobOptions = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const scheduleKey = `scheduled_task:${taskId}`;
    const taskData = {
      taskId,
      runAt: runAt.toISOString(),
      queueName,
      jobData,
      jobOptions,
      createdAt: new Date().toISOString()
    };

    try {
      // Store task in Redis with expiration
      const ttl = Math.max(0, Math.floor((runAt.getTime() - Date.now()) / 1000) + 3600); // Add 1 hour buffer

      await this.redisClient.setex(scheduleKey, ttl, JSON.stringify(taskData));

      // Add to scheduled tasks map
      this.scheduledTasks.set(taskId, taskData);

      console.log(`Task ${taskId} scheduled for ${runAt.toISOString()}`);

      return taskData;
    } catch (error) {
      console.error(`Failed to schedule task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Schedule a recurring task
   * @param {string} taskId - Unique identifier for the task
   * @param {string} cronExpression - Cron expression for scheduling
   * @param {string} queueName - Queue to add the task to
   * @param {Object} jobData - Data for the job
   * @param {Object} jobOptions - Options for the job
   * @param {Date} startDate - Start date for the schedule (optional)
   * @param {Date} endDate - End date for the schedule (optional)
   */
  async scheduleRecurringTask(taskId, cronExpression, queueName, jobData, jobOptions = {}, startDate, endDate) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const scheduleKey = `recurring_task:${taskId}`;
    const taskData = {
      taskId,
      cronExpression,
      queueName,
      jobData,
      jobOptions,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      createdAt: new Date().toISOString(),
      lastRun: null
    };

    try {
      // Store recurring task in Redis
      await this.redisClient.setex(
        scheduleKey,
        86400 * 30, // 30 days
        JSON.stringify(taskData)
      );

      // Add to scheduled tasks map
      this.scheduledTasks.set(taskId, taskData);

      console.log(`Recurring task ${taskId} scheduled with cron ${cronExpression}`);

      return taskData;
    } catch (error) {
      console.error(`Failed to schedule recurring task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled task
   * @param {string} taskId - Task ID to cancel
   */
  async cancelTask(taskId) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const scheduleKey = `scheduled_task:${taskId}`;
    const recurringKey = `recurring_task:${taskId}`;

    try {
      // Try to delete both scheduled and recurring tasks
      const deleted1 = await this.redisClient.del(scheduleKey);
      const deleted2 = await this.redisClient.del(recurringKey);

      // Remove from local map
      this.scheduledTasks.delete(taskId);

      const deleted = deleted1 + deleted2;

      if (deleted > 0) {
        console.log(`Task ${taskId} cancelled`);
      } else {
        console.log(`Task ${taskId} not found`);
      }

      return deleted > 0;
    } catch (error) {
      console.error(`Failed to cancel task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Get all scheduled tasks
   */
  async getScheduledTasks() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const keys = await this.redisClient.keys('scheduled_task:*');
      const tasks = [];

      for (const key of keys) {
        try {
          const taskDataStr = await this.redisClient.get(key);

          if (taskDataStr) {
            tasks.push(JSON.parse(taskDataStr));
          }
        } catch (error) {
          console.error(`Failed to parse scheduled task for key ${key}:`, error);
        }
      }

      return tasks;
    } catch (error) {
      console.error('Failed to get scheduled tasks:', error);
      throw error;
    }
  }

  /**
   * Get all recurring tasks
   */
  async getRecurringTasks() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const keys = await this.redisClient.keys('recurring_task:*');
      const tasks = [];

      for (const key of keys) {
        try {
          const taskDataStr = await this.redisClient.get(key);

          if (taskDataStr) {
            tasks.push(JSON.parse(taskDataStr));
          }
        } catch (error) {
          console.error(`Failed to parse recurring task for key ${key}:`, error);
        }
      }

      return tasks;
    } catch (error) {
      console.error('Failed to get recurring tasks:', error);
      throw error;
    }
  }

  /**
   * Process due tasks
   * This should be called periodically by a worker
   */
  async processDueTasks() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const now = new Date();
      const keys = await this.redisClient.keys('scheduled_task:*');
      let processedCount = 0;

      for (const key of keys) {
        try {
          const taskDataStr = await this.redisClient.get(key);

          if (taskDataStr) {
            const taskData = JSON.parse(taskDataStr);
            const runAt = new Date(taskData.runAt);

            // Check if task is due
            if (runAt <= now) {
              // Add job to queue
              await addJob(
                taskData.queueName,
                taskData.jobData,
                {
                  jobId: taskData.taskId,
                  ...taskData.jobOptions
                }
              );

              // Remove scheduled task
              await this.redisClient.del(key);
              this.scheduledTasks.delete(taskData.taskId);

              console.log(`Processed scheduled task ${taskData.taskId}`);
              processedCount++;
            }
          }
        } catch (error) {
          console.error(`Failed to process scheduled task for key ${key}:`, error);
        }
      }

      if (processedCount > 0) {
        console.log(`Processed ${processedCount} scheduled tasks`);
      }

      return processedCount;
    } catch (error) {
      console.error('Failed to process due tasks:', error);
      throw error;
    }
  }

  /**
   * Process recurring tasks
   * This is a simplified implementation - in a real system you'd use a proper cron parser
   */
  async processRecurringTasks() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const now = new Date();
      const keys = await this.redisClient.keys('recurring_task:*');
      let processedCount = 0;

      for (const key of keys) {
        try {
          const taskDataStr = await this.redisClient.get(key);

          if (taskDataStr) {
            const taskData = JSON.parse(taskDataStr);

            // Check start and end dates
            if (taskData.startDate && new Date(taskData.startDate) > now) {
              continue; // Not started yet
            }

            if (taskData.endDate && new Date(taskData.endDate) < now) {
              // Expired - remove it
              await this.redisClient.del(key);
              this.scheduledTasks.delete(taskData.taskId);
              continue;
            }

            // For this simplified implementation, we'll just run daily tasks
            // In a real implementation, you'd parse the cron expression properly
            const shouldRun = this._shouldRunRecurringTask(taskData, now);

            if (shouldRun) {
              // Add job to queue
              const jobId = `${taskData.taskId}_${now.getTime()}`;

              await addJob(
                taskData.queueName,
                taskData.jobData,
                {
                  jobId,
                  ...taskData.jobOptions
                }
              );

              // Update last run time
              taskData.lastRun = now.toISOString();
              await this.redisClient.setex(
                key,
                86400 * 30, // 30 days
                JSON.stringify(taskData)
              );

              console.log(`Processed recurring task ${taskData.taskId}`);
              processedCount++;
            }
          }
        } catch (error) {
          console.error(`Failed to process recurring task for key ${key}:`, error);
        }
      }

      if (processedCount > 0) {
        console.log(`Processed ${processedCount} recurring tasks`);
      }

      return processedCount;
    } catch (error) {
      console.error('Failed to process recurring tasks:', error);
      throw error;
    }
  }

  /**
   * Simple check for recurring task execution
   * @param {Object} taskData - Task data
   * @param {Date} now - Current time
   * @private
   */
  _shouldRunRecurringTask(taskData, now) {
    // This is a simplified implementation
    // In a real system, you'd use a proper cron parser like node-cron or cron-parser

    const lastRun = taskData.lastRun ? new Date(taskData.lastRun) : null;

    // For demonstration, we'll handle some common patterns:
    if (taskData.cronExpression === '0 0 * * *') {
      // Daily at midnight
      if (!lastRun || lastRun.getDate() !== now.getDate()) {
        return now.getHours() === 0 && now.getMinutes() === 0;
      }
    } else if (taskData.cronExpression === '0 * * * *') {
      // Hourly
      if (!lastRun || lastRun.getHours() !== now.getHours()) {
        return now.getMinutes() === 0;
      }
    } else if (taskData.cronExpression === '* * * * *') {
      // Every minute (for testing)
      return !lastRun || (now.getTime() - lastRun.getTime()) >= 60000;
    }

    return false;
  }

  /**
   * Close the task scheduler
   */
  async close() {
    // Redis connection is managed by the singleton, so we don't close it here
    this.isInitialized = false;
    this.scheduledTasks.clear();
    console.log('Task scheduler closed');
  }
}

// Export singleton instance
module.exports = new TaskScheduler();
