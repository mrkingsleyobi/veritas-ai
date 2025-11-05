/**
 * Async Processing Unit Tests
 *
 * Unit tests for the async processing system components.
 */

const circuitBreakerRegistry = require('../../src/async/circuit-breaker/circuitBreaker');
const { CircuitBreaker } = require('../../src/async/circuit-breaker/circuitBreaker');

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
    const breaker = new CircuitBreaker({
      failureThreshold: 2
    });

    const result = await breaker.execute(() => Promise.resolve('success'));
    expect(result).toBe('success');
    expect(breaker.getState()).toBe(circuitBreakerRegistry.STATE.CLOSED);
  });

  test('should open circuit after failures', async () => {
    const breaker = new CircuitBreaker({
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