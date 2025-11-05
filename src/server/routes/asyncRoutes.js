/**
 * Async Processing Routes
 *
 * Express.js routes for async processing functionality
 */

const express = require('express');
const asyncProcessingService = require('../../async/asyncProcessingService');

const router = express.Router();

// Initialize async processing service
asyncProcessingService.initialize().catch(error => {
  console.error('Failed to initialize async processing service:', error);
});

/**
 * Submit a content verification job
 */
router.post('/verify', async(req, res) => {
  try {
    const { content, options, highPriority } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const jobId = await asyncProcessingService.submitContentVerificationJob(
      content,
      options,
      highPriority
    );

    res.status(202).json({
      message: 'Content verification job submitted',
      jobId,
      statusUrl: `/api/async/jobs/${jobId}/progress`
    });
  } catch (error) {
    console.error('Failed to submit content verification job:', error);
    res.status(500).json({ error: 'Failed to submit job', message: error.message });
  }
});

/**
 * Submit a batch verification job
 */
router.post('/batch-verify', async(req, res) => {
  try {
    const { contents, options } = req.body;

    if (!Array.isArray(contents)) {
      return res.status(400).json({ error: 'Contents must be an array' });
    }

    const jobId = await asyncProcessingService.submitBatchVerificationJob(contents, options);

    res.status(202).json({
      message: 'Batch verification job submitted',
      jobId,
      statusUrl: `/api/async/jobs/${jobId}/progress`
    });
  } catch (error) {
    console.error('Failed to submit batch verification job:', error);
    res.status(500).json({ error: 'Failed to submit job', message: error.message });
  }
});

/**
 * Submit an RUV profile processing job
 */
router.post('/ruv-profile', async(req, res) => {
  try {
    const { contentId, ruvData } = req.body;

    if (!contentId || !ruvData) {
      return res.status(400).json({ error: 'Content ID and RUV data are required' });
    }

    const jobId = await asyncProcessingService.submitRUVProfileJob(contentId, ruvData);

    res.status(202).json({
      message: 'RUV profile job submitted',
      jobId,
      statusUrl: `/api/async/jobs/${jobId}/progress`
    });
  } catch (error) {
    console.error('Failed to submit RUV profile job:', error);
    res.status(500).json({ error: 'Failed to submit job', message: error.message });
  }
});

/**
 * Schedule a recurring verification task
 */
router.post('/schedule', async(req, res) => {
  try {
    const { taskId, cronExpression, jobData, startDate, endDate } = req.body;

    if (!taskId || !cronExpression || !jobData) {
      return res.status(400).json({
        error: 'Task ID, cron expression, and job data are required'
      });
    }

    await asyncProcessingService.scheduleRecurringVerification(
      taskId,
      cronExpression,
      jobData,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    res.status(200).json({
      message: 'Recurring task scheduled',
      taskId
    });
  } catch (error) {
    console.error('Failed to schedule recurring task:', error);
    res.status(500).json({ error: 'Failed to schedule task', message: error.message });
  }
});

/**
 * Get job progress
 */
router.get('/jobs/:jobId/progress', async(req, res) => {
  try {
    const { jobId } = req.params;
    const progress = await asyncProcessingService.getJobProgress(jobId);

    if (!progress) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(progress);
  } catch (error) {
    console.error('Failed to get job progress:', error);
    res.status(500).json({ error: 'Failed to get progress', message: error.message });
  }
});

/**
 * Get system metrics
 */
router.get('/metrics', async(req, res) => {
  try {
    const metrics = await asyncProcessingService.getMetrics();

    res.json(metrics);
  } catch (error) {
    console.error('Failed to get metrics:', error);
    res.status(500).json({ error: 'Failed to get metrics', message: error.message });
  }
});

/**
 * Get health status
 */
router.get('/health', async(req, res) => {
  try {
    const health = await asyncProcessingService.getHealthStatus();
    const isHealthy = Object.values(health.components).every(c => c.status === 'healthy');

    res.status(isHealthy ? 200 : 503).json(health);
  } catch (error) {
    console.error('Failed to get health status:', error);
    res.status(500).json({ error: 'Failed to get health status', message: error.message });
  }
});

/**
 * Get queue status
 */
router.get('/queues', async(req, res) => {
  try {
    const metrics = await asyncProcessingService.getMetrics();

    res.json(metrics.queues.details || []);
  } catch (error) {
    console.error('Failed to get queue status:', error);
    res.status(500).json({ error: 'Failed to get queue status', message: error.message });
  }
});

/**
 * Cancel a scheduled task
 */
router.delete('/schedule/:taskId', async(req, res) => {
  try {
    const { taskId } = req.params;

    // Note: This would require implementing a cancelTask method in taskScheduler
    // For now, we'll return a not implemented response
    res.status(501).json({ error: 'Not implemented' });
  } catch (error) {
    console.error('Failed to cancel scheduled task:', error);
    res.status(500).json({ error: 'Failed to cancel task', message: error.message });
  }
});

module.exports = router;
