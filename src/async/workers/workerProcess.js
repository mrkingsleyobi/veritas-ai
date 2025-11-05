/**
 * Async Worker Process
 *
 * Standalone worker process that can be run independently
 * to process async jobs.
 */

const asyncProcessingService = require('../asyncProcessingService');
const taskScheduler = require('../schedulers/taskScheduler');

class WorkerProcess {
  constructor() {
    this.isRunning = false;
    this.schedulerInterval = null;
    this.cleanupInterval = null;
  }

  /**
   * Start the worker process
   */
  async start() {
    if (this.isRunning) {
      console.log('Worker process is already running');

      return;
    }

    try {
      console.log('Starting worker process...');

      // Initialize async processing service
      await asyncProcessingService.initialize();

      // Set up task scheduler intervals
      this._setupScheduler();

      // Set up cleanup intervals
      this._setupCleanup();

      this.isRunning = true;
      console.log('Worker process started successfully');

      // Keep the process alive
      this._keepAlive();
    } catch (error) {
      console.error('Failed to start worker process:', error);
      throw error;
    }
  }

  /**
   * Set up task scheduler intervals
   */
  _setupScheduler() {
    // Process due tasks every minute
    this.schedulerInterval = setInterval(async() => {
      try {
        await taskScheduler.processDueTasks();
        await taskScheduler.processRecurringTasks();
      } catch (error) {
        console.error('Task scheduler error:', error);
      }
    }, 60000); // 1 minute
  }

  /**
   * Set up cleanup intervals
   */
  _setupCleanup() {
    // Clean up old progress trackers every hour
    this.cleanupInterval = setInterval(async() => {
      try {
        const { cleanupOldTrackers } = require('../progress/progressTracker');

        await cleanupOldTrackers();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }, 3600000); // 1 hour
  }

  /**
   * Keep the process alive
   */
  _keepAlive() {
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('Received SIGTERM, shutting down gracefully...');
      this.stop();
    });

    process.on('SIGINT', () => {
      console.log('Received SIGINT, shutting down gracefully...');
      this.stop();
    });

    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      this.stop();
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled rejection at:', promise, 'reason:', reason);
      this.stop();
    });
  }

  /**
   * Stop the worker process
   */
  async stop() {
    if (!this.isRunning) {
      return;
    }

    try {
      console.log('Stopping worker process...');

      // Clear intervals
      if (this.schedulerInterval) {
        clearInterval(this.schedulerInterval);
      }

      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }

      // Close async processing service
      await asyncProcessingService.close();

      this.isRunning = false;
      console.log('Worker process stopped');

      // Exit process
      process.exit(0);
    } catch (error) {
      console.error('Error stopping worker process:', error);
      process.exit(1);
    }
  }
}

// Create and export worker process instance
const workerProcess = new WorkerProcess();

// If this file is run directly, start the worker
if (require.main === module) {
  workerProcess.start().catch((error) => {
    console.error('Failed to start worker process:', error);
    process.exit(1);
  });
}

module.exports = workerProcess;
