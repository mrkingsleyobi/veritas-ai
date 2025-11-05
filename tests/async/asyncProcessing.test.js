/**
 * Async Processing Integration Tests
 *
 * Tests for the async processing system components.
 */

const { ContentAuthenticator } = require('../../src/index');
const asyncProcessingService = require('../../src/async/asyncProcessingService');
const { getProgress } = require('../../src/async/progress/progressTracker');
const jobQueueManager = require('../../src/async/queues/bullmq');
const circuitBreakerRegistry = require('../../src/async/circuit-breaker/circuitBreaker');

// Mock content data for testing
const mockContent = {
  id: 'test-content-123',
  type: 'image',
  data: 'mock image data for testing',
  metadata: {
    filename: 'test.jpg',
    size: 1024
  }
};

const mockRUVData = {
  reputation: 0.8,
  uniqueness: 0.9,
  verification: 0.7
};

describe('Async Processing Service', () => {
  beforeAll(async () => {
    // Initialize the async processing service
    await asyncProcessingService.initialize();
  });

  afterAll(async () => {
    // Close the async processing service
    await asyncProcessingService.close();
  });

  describe('Content Verification Jobs', () => {
    test('should submit and process a content verification job', async () => {
      // Submit a content verification job
      const jobId = await asyncProcessingService.submitContentVerificationJob(
        mockContent,
        { strictMode: true }
      );

      expect(jobId).toBeDefined();
      expect(typeof jobId).toBe('string');

      // Wait a bit for processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check job progress
      const progress = await asyncProcessingService.getJobProgress(jobId);
      expect(progress).toBeDefined();

      // Job should either be completed or still in progress
      expect(['completed', 'in_progress', 'started']).toContain(progress?.status);
    }, 10000); // 10 second timeout

    test('should submit and process a high priority content verification job', async () => {
      // Submit a high priority content verification job
      const jobId = await asyncProcessingService.submitContentVerificationJob(
        mockContent,
        { strictMode: true },
        true // high priority
      );

      expect(jobId).toBeDefined();
      expect(typeof jobId).toBe('string');

      // Wait a bit for processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check job progress
      const progress = await asyncProcessingService.getJobProgress(jobId);
      expect(progress).toBeDefined();
    }, 10000);
  });

  describe('Batch Processing Jobs', () => {
    test('should submit and process a batch verification job', async () => {
      const batchContents = [
        { ...mockContent, id: 'batch-1' },
        { ...mockContent, id: 'batch-2', type: 'video' },
        { ...mockContent, id: 'batch-3', type: 'document' }
      ];

      // Submit a batch verification job
      const jobId = await asyncProcessingService.submitBatchVerificationJob(
        batchContents,
        { parallel: true }
      );

      expect(jobId).toBeDefined();
      expect(typeof jobId).toBe('string');

      // Wait a bit for processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check job progress
      const progress = await asyncProcessingService.getJobProgress(jobId);
      expect(progress).toBeDefined();
    }, 15000); // 15 second timeout
  });

  describe('RUV Profile Jobs', () => {
    test('should submit and process an RUV profile job', async () => {
      // Submit an RUV profile job
      const jobId = await asyncProcessingService.submitRUVProfileJob(
        mockContent.id,
        mockRUVData
      );

      expect(jobId).toBeDefined();
      expect(typeof jobId).toBe('string');

      // Wait a bit for processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check job progress
      const progress = await asyncProcessingService.getJobProgress(jobId);
      expect(progress).toBeDefined();
    }, 10000);
  });

  describe('Progress Tracking', () => {
    test('should track progress for jobs', async () => {
      // Submit a job to track
      const jobId = await asyncProcessingService.submitContentVerificationJob(
        mockContent
      );

      // Check initial progress
      const initialProgress = await getProgress(jobId);
      expect(initialProgress).toBeDefined();
      expect(initialProgress.operationId).toBe(jobId);
      expect(initialProgress.status).toBe('started');
      expect(initialProgress.progress).toBe(0);

      // Wait for some processing
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check updated progress
      const updatedProgress = await getProgress(jobId);
      expect(updatedProgress).toBeDefined();
    }, 10000);
  });

  describe('Metrics Collection', () => {
    test('should collect system metrics', async () => {
      // Get system metrics
      const metrics = await asyncProcessingService.getMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.timestamp).toBeDefined();
      expect(metrics.jobs).toBeDefined();
      expect(metrics.queues).toBeDefined();
      expect(metrics.workers).toBeDefined();
      expect(metrics.performance).toBeDefined();
    });
  });

  describe('Health Checks', () => {
    test('should provide health status', async () => {
      // Get health status
      const health = await asyncProcessingService.getHealthStatus();

      expect(health).toBeDefined();
      expect(health.timestamp).toBeDefined();
      expect(health.components).toBeDefined();

      // Should have at least rabbitmq and jobQueues components
      expect(health.components.rabbitmq).toBeDefined();
      expect(health.components.jobQueues).toBeDefined();
    });
  });
});

describe('Circuit Breaker', () => {
  test('should handle circuit breaker states', () => {
    // Create a circuit breaker
    const breaker = circuitBreakerRegistry.getBreaker('test-breaker', {
      failureThreshold: 3,
      timeout: 1000,
      resetTimeout: 2000
    });

    expect(breaker).toBeDefined();
    expect(breaker.getState()).toBe(circuitBreakerRegistry.STATE.CLOSED);

    // Get all breakers
    const allBreakers = circuitBreakerRegistry.getAllBreakers();
    expect(Array.isArray(allBreakers)).toBe(true);
  });

  test('should execute function successfully when closed', async () => {
    const breaker = circuitBreakerRegistry.getBreaker('test-success', {
      failureThreshold: 2
    });

    const result = await breaker.execute(() => Promise.resolve('success'));
    expect(result).toBe('success');
    expect(breaker.getState()).toBe(circuitBreakerRegistry.STATE.CLOSED);
  });

  test('should open circuit after failures', async () => {
    const breaker = circuitBreakerRegistry.getBreaker('test-failure', {
      failureThreshold: 2,
      resetTimeout: 1000
    });

    // Fail twice to open circuit
    await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail');
    await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail');

    // Circuit should now be open
    expect(breaker.getState()).toBe(circuitBreakerRegistry.STATE.OPEN);

    // Next call should be rejected
    await expect(breaker.execute(() => Promise.resolve('should not execute')))
      .rejects.toThrow('Circuit breaker is open');
  });
});

describe('Job Queue Manager', () => {
  beforeAll(async () => {
    await jobQueueManager.initialize();
  });

  afterAll(async () => {
    await jobQueueManager.close();
  });

  test('should manage queues', async () => {
    // Get queue metrics
    const metrics = await jobQueueManager.getAllQueueMetrics();
    expect(Array.isArray(metrics)).toBe(true);

    // Should have at least our core queues
    const queueNames = metrics.map(m => m.name);
    expect(queueNames).toContain('content-verification');
    expect(queueNames).toContain('batch-processing');
  });
});