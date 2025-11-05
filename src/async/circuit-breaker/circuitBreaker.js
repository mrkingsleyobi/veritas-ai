/**
 * Circuit Breaker Pattern Implementation
 *
 * This module provides circuit breaker functionality for fault tolerance
 * in distributed systems.
 */

const EventEmitter = require('events');

// Circuit breaker states
const STATE = {
  CLOSED: 'closed',
  OPEN: 'open',
  HALF_OPEN: 'half_open'
};

class CircuitBreaker extends EventEmitter {
  /**
   * Create a new circuit breaker
   * @param {Object} options - Configuration options
   * @param {number} options.failureThreshold - Number of failures before opening (default: 5)
   * @param {number} options.timeout - Timeout for operations in ms (default: 60000)
   * @param {number} options.resetTimeout - Time to wait before half-open state in ms (default: 30000)
   * @param {Function} options.fallback - Fallback function when circuit is open
   */
  constructor(options = {}) {
    super();

    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 60000;
    this.resetTimeout = options.resetTimeout || 30000;
    this.fallback = options.fallback || (() => Promise.reject(new Error('Circuit breaker is open')));

    this.state = STATE.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;

    // Metrics
    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      rejectedCalls: 0,
      totalTimeouts: 0
    };
  }

  /**
   * Execute a function with circuit breaker protection
   * @param {Function} fn - Function to execute
   * @returns {Promise} Result of the function or fallback
   */
  async execute(fn) {
    this.metrics.totalCalls++;

    // Check if circuit is open
    if (this.isOpen()) {
      this.metrics.rejectedCalls++;
      this.emit('rejected', {
        state: this.state,
        failureCount: this.failureCount,
        metrics: { ...this.metrics }
      });

      try {
        const result = await this.fallback();

        this.emit('fallback', { result });

        return result;
      } catch (fallbackError) {
        this.emit('fallbackError', { error: fallbackError });
        throw fallbackError;
      }
    }

    // Execute function with timeout
    try {
      const result = await this._executeWithTimeout(fn);

      this._onSuccess();

      return result;
    } catch (error) {
      this._onFailure(error);
      throw error;
    }
  }

  /**
   * Execute function with timeout
   * @param {Function} fn - Function to execute
   * @returns {Promise} Result of the function
   */
  async _executeWithTimeout(fn) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.metrics.totalTimeouts++;
        reject(new Error(`Operation timed out after ${this.timeout}ms`));
      }, this.timeout);

      fn()
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Handle successful operation
   */
  _onSuccess() {
    this.metrics.successfulCalls++;
    this.failureCount = 0;

    // If we were in HALF_OPEN state, go back to CLOSED
    if (this.state === STATE.HALF_OPEN) {
      this._setState(STATE.CLOSED);
      this.emit('closed');
    }
  }

  /**
   * Handle failed operation
   * @param {Error} error - Error that occurred
   */
  _onFailure(error) {
    this.metrics.failedCalls++;
    this.failureCount++;
    this.lastFailureTime = Date.now();

    this.emit('failure', { error, failureCount: this.failureCount });

    // Check if we should open the circuit
    if (this.failureCount >= this.failureThreshold && this.state === STATE.CLOSED) {
      this._setState(STATE.OPEN);
      this.nextAttemptTime = Date.now() + this.resetTimeout;
      this.emit('open');
    }
  }

  /**
   * Check if circuit is open
   * @returns {boolean} True if circuit is open
   */
  isOpen() {
    if (this.state === STATE.OPEN) {
      // Check if we should move to HALF_OPEN state
      if (this.nextAttemptTime && Date.now() >= this.nextAttemptTime) {
        this._setState(STATE.HALF_OPEN);
        this.emit('halfOpen');

        return false; // Not open anymore
      }

      return true; // Still open
    }

    return false; // CLOSED or HALF_OPEN
  }

  /**
   * Set circuit breaker state
   * @param {string} newState - New state
   */
  _setState(newState) {
    const oldState = this.state;

    this.state = newState;
    this.emit('stateChange', { from: oldState, to: newState });
  }

  /**
   * Get current state
   * @returns {string} Current state
   */
  getState() {
    return this.state;
  }

  /**
   * Get circuit breaker metrics
   * @returns {Object} Metrics
   */
  getMetrics() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
      metrics: { ...this.metrics }
    };
  }

  /**
   * Reset circuit breaker
   */
  reset() {
    this.state = STATE.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;

    // Reset metrics
    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      rejectedCalls: 0,
      totalTimeouts: 0
    };

    this.emit('reset');
  }

  /**
   * Force circuit breaker to open state
   */
  forceOpen() {
    this._setState(STATE.OPEN);
    this.nextAttemptTime = Date.now() + this.resetTimeout;
    this.emit('open');
  }

  /**
   * Force circuit breaker to close state
   */
  forceClose() {
    this._setState(STATE.CLOSED);
    this.failureCount = 0;
    this.emit('closed');
  }
}

// Circuit breaker registry
class CircuitBreakerRegistry {
  constructor() {
    this.breakers = new Map();
  }

  /**
   * Get or create a circuit breaker
   * @param {string} name - Name of the circuit breaker
   * @param {Object} options - Configuration options
   * @returns {CircuitBreaker} Circuit breaker instance
   */
  getBreaker(name, options = {}) {
    if (!this.breakers.has(name)) {
      const breaker = new CircuitBreaker(options);

      breaker.on('open', () => {
        console.warn(`Circuit breaker '${name}' opened`);
      });
      breaker.on('closed', () => {
        console.info(`Circuit breaker '${name}' closed`);
      });
      breaker.on('halfOpen', () => {
        console.info(`Circuit breaker '${name}' half-open`);
      });
      breaker.on('failure', (data) => {
        console.warn(`Circuit breaker '${name}' failure #${data.failureCount}`);
      });
      this.breakers.set(name, breaker);
    }

    return this.breakers.get(name);
  }

  /**
   * Get all circuit breakers
   * @returns {Array} Array of circuit breaker information
   */
  getAllBreakers() {
    const breakers = [];

    for (const [name, breaker] of this.breakers) {
      breakers.push({
        name,
        ...breaker.getMetrics()
      });
    }

    return breakers;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll() {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }
}

// Export singleton instance
module.exports = new CircuitBreakerRegistry();

// Export CircuitBreaker class for direct instantiation
module.exports.CircuitBreaker = CircuitBreaker;
module.exports.STATE = STATE;
