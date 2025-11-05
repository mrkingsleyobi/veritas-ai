/**
 * Memory Manager
 *
 * Provides memory management and garbage collection utilities
 * to optimize performance and prevent memory leaks.
 */

const { performance } = require('perf_hooks');

class MemoryManager {
  constructor() {
    this.memoryUsageHistory = [];
    this.gcInterval = null;
    this.monitoringInterval = null;
    this.maxMemoryUsage = process.env.MAX_MEMORY_USAGE || 1024 * 1024 * 1024; // 1GB default
    this.warningThreshold = process.env.MEMORY_WARNING_THRESHOLD || 0.8; // 80% of max
  }

  /**
   * Start memory monitoring
   */
  startMonitoring() {
    // Monitor memory usage every 5 seconds
    this.monitoringInterval = setInterval(() => {
      const memoryUsage = process.memoryUsage();

      this.memoryUsageHistory.push({
        timestamp: Date.now(),
        ...memoryUsage
      });

      // Keep only last 100 measurements
      if (this.memoryUsageHistory.length > 100) {
        this.memoryUsageHistory.shift();
      }

      // Check for memory usage warnings
      this.checkMemoryUsage(memoryUsage);
    }, 5000);

    // Force garbage collection every 30 seconds if exposed
    if (global.gc) {
      this.gcInterval = setInterval(() => {
        try {
          global.gc();
          console.log('Manual garbage collection triggered');
        } catch (error) {
          console.error('Failed to trigger garbage collection:', error);
        }
      }, 30000);
    }
  }

  /**
   * Check memory usage and trigger warnings/actions
   * @param {Object} memoryUsage - Current memory usage
   */
  checkMemoryUsage(memoryUsage) {
    const usedMemory = memoryUsage.heapUsed;
    const maxMemory = this.maxMemoryUsage;
    const usageRatio = usedMemory / maxMemory;

    if (usageRatio > this.warningThreshold) {
      console.warn(`High memory usage detected: ${(usageRatio * 100).toFixed(2)}%`);

      // Log detailed memory information
      this.logMemoryInfo(memoryUsage);

      // Trigger garbage collection if available
      if (global.gc) {
        try {
          global.gc();
          console.log('Garbage collection triggered due to high memory usage');
        } catch (error) {
          console.error('Failed to trigger garbage collection:', error);
        }
      }
    }
  }

  /**
   * Log detailed memory information
   * @param {Object} memoryUsage - Memory usage data
   */
  logMemoryInfo(memoryUsage) {
    console.log('Memory Usage Details:');
    console.log(`  RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`);

    if (memoryUsage.arrayBuffers) {
      console.log(`  Array Buffers: ${(memoryUsage.arrayBuffers / 1024 / 1024).toFixed(2)} MB`);
    }
  }

  /**
   * Get memory usage statistics
   * @returns {Object} Memory usage statistics
   */
  getMemoryStats() {
    const currentUsage = process.memoryUsage();
    const history = this.memoryUsageHistory;

    let avgHeapUsed = 0;
    let maxHeapUsed = 0;
    let minHeapUsed = Infinity;

    if (history.length > 0) {
      const heapUsages = history.map(entry => entry.heapUsed);

      avgHeapUsed = heapUsages.reduce((sum, usage) => sum + usage, 0) / heapUsages.length;
      maxHeapUsed = Math.max(...heapUsages);
      minHeapUsed = Math.min(...heapUsages);
    }

    return {
      current: {
        rss: (currentUsage.rss / 1024 / 1024).toFixed(2) + ' MB',
        heapTotal: (currentUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
        heapUsed: (currentUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
        external: (currentUsage.external / 1024 / 1024).toFixed(2) + ' MB'
      },
      history: {
        samples: history.length,
        averageHeapUsed: (avgHeapUsed / 1024 / 1024).toFixed(2) + ' MB',
        maxHeapUsed: (maxHeapUsed / 1024 / 1024).toFixed(2) + ' MB',
        minHeapUsed: (minHeapUsed / 1024 / 1024).toFixed(2) + ' MB'
      }
    };
  }

  /**
   * Clear memory usage history
   */
  clearHistory() {
    this.memoryUsageHistory = [];
  }

  /**
   * Optimize memory by clearing caches and unused objects
   * @param {Object} cacheService - Cache service to clear
   */
  async optimizeMemory(cacheService = null) {
    const startTime = performance.now();

    // Clear memory usage history
    this.clearHistory();

    // Clear application caches if provided
    if (cacheService && typeof cacheService.clear === 'function') {
      try {
        await cacheService.clear();
        console.log('Application caches cleared');
      } catch (error) {
        console.error('Failed to clear application caches:', error);
      }
    }

    // Trigger garbage collection if available
    if (global.gc) {
      try {
        global.gc();
        console.log('Garbage collection triggered for optimization');
      } catch (error) {
        console.error('Failed to trigger garbage collection:', error);
      }
    }

    const optimizationTime = performance.now() - startTime;

    console.log(`Memory optimization completed in ${optimizationTime.toFixed(2)}ms`);
  }

  /**
   * Stop memory monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.gcInterval) {
      clearInterval(this.gcInterval);
      this.gcInterval = null;
    }
  }

  /**
   * Create a weak reference to an object for memory leak prevention
   * @param {Object} obj - Object to create weak reference for
   * @returns {WeakRef} Weak reference to the object
   */
  createWeakRef(obj) {
    if (typeof WeakRef !== 'undefined') {
      return new WeakRef(obj);
    }

    // Fallback for environments without WeakRef support
    return {
      deref: () => obj,
      [Symbol.toStringTag]: 'WeakRef'
    };
  }

  /**
   * Create a finalization registry for cleanup callbacks
   * @param {Function} callback - Cleanup callback function
   * @returns {FinalizationRegistry} Finalization registry
   */
  createFinalizationRegistry(callback) {
    if (typeof FinalizationRegistry !== 'undefined') {
      return new FinalizationRegistry(callback);
    }

    // Fallback for environments without FinalizationRegistry support
    return {
      register: () => {},
      unregister: () => {},
      [Symbol.toStringTag]: 'FinalizationRegistry'
    };
  }

  /**
   * Monitor object lifecycle for memory leak detection
   * @param {Object} obj - Object to monitor
   * @param {string} identifier - Object identifier for logging
   */
  monitorObjectLifecycle(obj, identifier) {
    const registry = this.createFinalizationRegistry((heldValue) => {
      console.log(`Object ${identifier} has been garbage collected`);
      // Perform cleanup operations here
    });

    registry.register(obj, identifier);
  }
}

// Create singleton instance
const memoryManager = new MemoryManager();

module.exports = { memoryManager, MemoryManager };
