/**
 * System Integration Test
 *
 * Test that all async processing components integrate correctly at a basic level.
 */

describe('Async Processing System Integration', () => {
  test('should integrate all core components without conflicts', () => {
    // Test that we can import all major components without conflicts
    expect(() => {
      const rabbitmq = require('../../src/async/queues/rabbitmq');
      const bullmq = require('../../src/async/queues/bullmq');
      const worker = require('../../src/async/workers/contentVerificationWorker');
      const progress = require('../../src/async/progress/progressTracker');
      const circuitBreaker = require('../../src/async/circuit-breaker/circuitBreaker');
      const scheduler = require('../../src/async/schedulers/taskScheduler');
      const metrics = require('../../src/async/monitoring/metricsCollector');
      const service = require('../../src/async/asyncProcessingService');
    }).not.toThrow();
  });

  test('should have consistent component interfaces', () => {
    // Test that components have expected methods
    const circuitBreakerRegistry = require('../../src/async/circuit-breaker/circuitBreaker');
    expect(circuitBreakerRegistry).toBeDefined();
    expect(typeof circuitBreakerRegistry.getBreaker).toBe('function');
    expect(typeof circuitBreakerRegistry.getAllBreakers).toBe('function');

    const progressTracker = require('../../src/async/progress/progressTracker');
    expect(progressTracker).toBeDefined();
    expect(typeof progressTracker.createProgressTracker).toBe('function');
    expect(typeof progressTracker.updateProgress).toBe('function');
    expect(typeof progressTracker.getProgress).toBe('function');
  });

  test('should be able to create circuit breaker instances', () => {
    const { CircuitBreaker } = require('../../src/async/circuit-breaker/circuitBreaker');

    // Test creating a circuit breaker instance
    const breaker = new CircuitBreaker({
      failureThreshold: 3,
      timeout: 1000,
      resetTimeout: 2000
    });

    expect(breaker).toBeDefined();
    expect(typeof breaker.execute).toBe('function');
    expect(typeof breaker.getState).toBe('function');
    expect(typeof breaker.getMetrics).toBe('function');
  });

  test('should be able to initialize worker process', () => {
    const workerProcess = require('../../src/async/workers/workerProcess');

    expect(workerProcess).toBeDefined();
    expect(typeof workerProcess.start).toBe('function');
    expect(typeof workerProcess.stop).toBe('function');
  });
});