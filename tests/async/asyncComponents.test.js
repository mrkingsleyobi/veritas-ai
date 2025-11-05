/**
 * Async Components Test
 *
 * Test that async processing components can be imported and instantiated.
 */

// Test that we can import all the components without errors
describe('Async Processing Components', () => {
  test('should be able to import all async components', () => {
    // This test just verifies that all components can be imported without syntax errors
    expect(() => {
      require('../../src/async/queues/rabbitmq');
    }).not.toThrow();

    expect(() => {
      require('../../src/async/queues/bullmq');
    }).not.toThrow();

    expect(() => {
      require('../../src/async/workers/contentVerificationWorker');
    }).not.toThrow();

    expect(() => {
      require('../../src/async/progress/progressTracker');
    }).not.toThrow();

    expect(() => {
      require('../../src/async/circuit-breaker/circuitBreaker');
    }).not.toThrow();

    expect(() => {
      require('../../src/async/schedulers/taskScheduler');
    }).not.toThrow();

    expect(() => {
      require('../../src/async/monitoring/metricsCollector');
    }).not.toThrow();

    expect(() => {
      require('../../src/async/asyncProcessingService');
    }).not.toThrow();
  });

  test('should be able to import worker process', () => {
    expect(() => {
      require('../../src/async/workers/workerProcess');
    }).not.toThrow();
  });

  test('should be able to import async routes', () => {
    expect(() => {
      require('../../src/server/routes/asyncRoutes');
    }).not.toThrow();
  });
});