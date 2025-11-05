/**
 * Performance Benchmark Utility
 *
 * Provides comprehensive performance benchmarking for all platform components.
 */

const { performance } = require('perf_hooks');
const { memoryManager } = require('./memoryManager');
const { redisCache } = require('../cache/redisClient');

class PerformanceBenchmark {
  constructor() {
    this.benchmarks = new Map();
    this.results = [];
  }

  /**
   * Run a benchmark test
   * @param {string} name - Benchmark name
   * @param {Function} testFn - Test function to benchmark
   * @param {Object} options - Benchmark options
   * @returns {Object} Benchmark results
   */
  async runBenchmark(name, testFn, options = {}) {
    const {
      iterations = 100,
      warmupIterations = 10,
      measureMemory = true,
      measureGc = true
    } = options;

    console.log(`Running benchmark: ${name}`);

    // Warmup runs
    for (let i = 0; i < warmupIterations; i++) {
      try {
        await testFn();
      } catch (error) {
        console.warn(`Warmup iteration ${i + 1} failed:`, error.message);
      }
    }

    // Collect initial metrics
    const initialMemory = measureMemory ? process.memoryUsage() : null;
    const startTime = performance.now();

    // Run benchmark iterations
    const iterationTimes = [];
    const errors = [];

    for (let i = 0; i < iterations; i++) {
      const iterationStart = performance.now();

      try {
        await testFn();
        const iterationTime = performance.now() - iterationStart;

        iterationTimes.push(iterationTime);
      } catch (error) {
        errors.push({
          iteration: i,
          error: error.message
        });
        console.warn(`Benchmark iteration ${i + 1} failed:`, error.message);
      }
    }

    const totalTime = performance.now() - startTime;
    const finalMemory = measureMemory ? process.memoryUsage() : null;

    // Calculate statistics
    const stats = this.calculateStats(iterationTimes);

    // Calculate memory usage difference
    let memoryDiff = null;

    if (measureMemory && initialMemory && finalMemory) {
      memoryDiff = {
        rss: finalMemory.rss - initialMemory.rss,
        heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
        heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
        external: finalMemory.external - initialMemory.external
      };
    }

    const result = {
      name,
      iterations: iterationTimes.length,
      totalTime: totalTime,
      averageTime: stats.mean,
      medianTime: stats.median,
      minTime: stats.min,
      maxTime: stats.max,
      stdDev: stats.stdDev,
      throughput: iterationTimes.length / (totalTime / 1000), // requests per second
      errors: errors.length,
      errorRate: errors.length / iterations,
      memoryUsage: memoryDiff,
      timestamp: new Date().toISOString()
    };

    this.results.push(result);
    this.benchmarks.set(name, result);

    console.log(`Benchmark ${name} completed: ${result.averageTime.toFixed(2)}ms avg, ${result.throughput.toFixed(2)} req/s`);

    return result;
  }

  /**
   * Calculate statistics from timing data
   * @param {Array<number>} times - Array of timing measurements
   * @returns {Object} Statistical results
   */
  calculateStats(times) {
    if (times.length === 0) {
      return {
        mean: 0,
        median: 0,
        min: 0,
        max: 0,
        stdDev: 0
      };
    }

    // Sort times for median calculation
    const sortedTimes = [...times].sort((a, b) => a - b);

    // Calculate mean
    const mean = times.reduce((sum, time) => sum + time, 0) / times.length;

    // Calculate median
    const median = sortedTimes.length % 2 === 0
      ? (sortedTimes[sortedTimes.length / 2 - 1] + sortedTimes[sortedTimes.length / 2]) / 2
      : sortedTimes[Math.floor(sortedTimes.length / 2)];

    // Calculate min and max
    const min = Math.min(...times);
    const max = Math.max(...times);

    // Calculate standard deviation
    const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);

    return {
      mean,
      median,
      min,
      max,
      stdDev
    };
  }

  /**
   * Benchmark content verification performance
   * @param {Object} verificationService - Content verification service
   * @param {Array} testContents - Array of test content objects
   * @returns {Object} Benchmark results
   */
  async benchmarkContentVerification(verificationService, testContents) {
    const results = {};

    // Benchmark single verification
    results.singleVerification = await this.runBenchmark(
      'Single Content Verification',
      async() => {
        const content = testContents[0] || {
          type: 'image',
          data: Buffer.from('test content data')
        };

        await verificationService.verifyAuthenticity(content);
      },
      { iterations: 50, warmupIterations: 5 }
    );

    // Benchmark batch verification
    results.batchVerification = await this.runBenchmark(
      'Batch Content Verification',
      async() => {
        await verificationService.batchVerify(testContents.slice(0, 10));
      },
      { iterations: 20, warmupIterations: 3 }
    );

    // Benchmark streaming verification (if supported)
    if (typeof verificationService.streamVerify === 'function') {
      results.streamingVerification = await this.runBenchmark(
        'Streaming Content Verification',
        async() => {
          const { Readable } = require('stream');
          const stream = Readable.from(Buffer.from('streaming test data'));

          await verificationService.streamVerify(stream);
        },
        { iterations: 30, warmupIterations: 5 }
      );
    }

    return results;
  }

  /**
   * Benchmark RUV profile operations
   * @param {Object} profileService - RUV profile service
   * @param {Array} testProfiles - Array of test profile data
   * @returns {Object} Benchmark results
   */
  async benchmarkRuvProfiles(profileService, testProfiles) {
    const results = {};

    // Benchmark profile creation/update
    results.createProfile = await this.runBenchmark(
      'Create/Update RUV Profile',
      async() => {
        const profileData = testProfiles[0] || {
          reputation: Math.random(),
          uniqueness: Math.random(),
          verification: Math.random()
        };

        await profileService.createOrUpdateProfile(`test_${Date.now()}`, profileData);
      },
      { iterations: 100, warmupIterations: 10 }
    );

    // Benchmark profile retrieval
    results.getProfile = await this.runBenchmark(
      'Get RUV Profile',
      async() => {
        // Create a test profile first
        const testId = 'benchmark_test_profile';

        await profileService.createOrUpdateProfile(testId, {
          reputation: 0.8,
          uniqueness: 0.7,
          verification: 0.9
        });

        // Then retrieve it
        await profileService.getProfile(testId);
      },
      { iterations: 200, warmupIterations: 20 }
    );

    // Benchmark profile fusion
    results.fuseProfile = await this.runBenchmark(
      'Fuse RUV Profile with Verification',
      async() => {
        const testId = 'benchmark_fusion_profile';

        await profileService.createOrUpdateProfile(testId, {
          reputation: 0.85,
          uniqueness: 0.75,
          verification: 0.95
        });

        const verificationResult = {
          authentic: true,
          confidence: 0.92,
          details: { method: 'test' }
        };

        await profileService.fuseWithVerification(testId, verificationResult);
      },
      { iterations: 150, warmupIterations: 15 }
    );

    return results;
  }

  /**
   * Benchmark Redis cache performance
   * @returns {Object} Benchmark results
   */
  async benchmarkRedisCache() {
    if (!redisCache.isConnected) {
      console.log('Redis not connected, skipping cache benchmarks');

      return {};
    }

    const results = {};

    // Benchmark SET operations
    results.redisSet = await this.runBenchmark(
      'Redis SET Operation',
      async() => {
        const key = `benchmark_set_${Date.now()}_${Math.random()}`;

        await redisCache.set(key, { test: 'data', timestamp: Date.now() }, 60);
      },
      { iterations: 500, warmupIterations: 50 }
    );

    // Benchmark GET operations
    results.redisGet = await this.runBenchmark(
      'Redis GET Operation',
      async() => {
        const key = 'benchmark_get_test';

        await redisCache.set(key, { test: 'data', timestamp: Date.now() }, 60);
        await redisCache.get(key);
      },
      { iterations: 500, warmupIterations: 50 }
    );

    // Benchmark MSET operations
    results.redisMSet = await this.runBenchmark(
      'Redis MSET Operation',
      async() => {
        const keyValuePairs = {};

        for (let i = 0; i < 10; i++) {
          keyValuePairs[`batch_key_${i}`] = { data: `value_${i}`, index: i };
        }
        await redisCache.mset(keyValuePairs, 60);
      },
      { iterations: 100, warmupIterations: 10 }
    );

    // Benchmark MGET operations
    results.redisMGet = await this.runBenchmark(
      'Redis MGET Operation',
      async() => {
        const keys = [];

        for (let i = 0; i < 10; i++) {
          const key = `mget_test_${i}`;

          await redisCache.set(key, { data: `value_${i}`, index: i }, 60);
          keys.push(key);
        }
        await redisCache.mget(keys);
      },
      { iterations: 100, warmupIterations: 10 }
    );

    return results;
  }

  /**
   * Benchmark database operations
   * @param {Object} profileService - RUV profile service with database
   * @returns {Object} Benchmark results
   */
  async benchmarkDatabase(profileService) {
    const results = {};

    // This would require access to the database layer
    // For now, we'll simulate database-like operations
    console.log('Database benchmarks would be implemented based on specific database type');

    return results;
  }

  /**
   * Run comprehensive performance suite
   * @param {Object} services - Platform services to benchmark
   * @returns {Object} Complete benchmark results
   */
  async runComprehensiveBenchmark(services) {
    console.log('Starting comprehensive performance benchmark...');

    const startTime = performance.now();
    const results = {
      timestamp: new Date().toISOString(),
      totalTime: 0,
      memoryStats: memoryManager.getMemoryStats(),
      components: {}
    };

    try {
      // Benchmark content verification if service available
      if (services.contentAuthenticator) {
        console.log('Benchmarking content verification...');
        results.components.contentVerification = await this.benchmarkContentVerification(
          services.contentAuthenticator,
          [
            { type: 'image', data: Buffer.from('test image data') },
            { type: 'video', data: Buffer.from('test video data') },
            { type: 'document', data: Buffer.from('test document data') }
          ]
        );
      }

      // Benchmark RUV profiles if service available
      if (services.ruvProfileService) {
        console.log('Benchmarking RUV profiles...');
        results.components.ruvProfiles = await this.benchmarkRuvProfiles(
          services.ruvProfileService,
          [
            { reputation: 0.8, uniqueness: 0.7, verification: 0.9 },
            { reputation: 0.6, uniqueness: 0.8, verification: 0.7 },
            { reputation: 0.9, uniqueness: 0.6, verification: 0.8 }
          ]
        );
      }

      // Benchmark Redis cache
      console.log('Benchmarking Redis cache...');
      results.components.redisCache = await this.benchmarkRedisCache();

      // Benchmark database operations
      if (services.ruvProfileService) {
        console.log('Benchmarking database operations...');
        results.components.database = await this.benchmarkDatabase(services.ruvProfileService);
      }

      results.totalTime = performance.now() - startTime;
      results.finalMemoryStats = memoryManager.getMemoryStats();

      console.log('Comprehensive benchmark completed');

      return results;

    } catch (error) {
      console.error('Benchmark suite failed:', error);
      throw error;
    }
  }

  /**
   * Get formatted benchmark results
   * @returns {string} Formatted results
   */
  getFormattedResults() {
    if (this.results.length === 0) {
      return 'No benchmark results available';
    }

    let output = '\n=== Performance Benchmark Results ===\n\n';

    for (const result of this.results) {
      output += `${result.name}:\n`;
      output += `  Iterations: ${result.iterations}\n`;
      output += `  Average Time: ${result.averageTime.toFixed(2)}ms\n`;
      output += `  Throughput: ${result.throughput.toFixed(2)} req/s\n`;
      output += `  Error Rate: ${(result.errorRate * 100).toFixed(2)}%\n`;

      if (result.memoryUsage) {
        output += '  Memory Change:\n';
        output += `    RSS: ${(result.memoryUsage.rss / 1024 / 1024).toFixed(2)} MB\n`;
        output += `    Heap Used: ${(result.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB\n`;
      }

      output += '\n';
    }

    return output;
  }

  /**
   * Save benchmark results to file
   * @param {string} filename - Output filename
   */
  async saveResults(filename = `benchmark-results-${Date.now()}.json`) {
    const fs = require('fs').promises;
    const path = require('path');

    const outputPath = path.join(process.cwd(), 'benchmarks', filename);

    // Ensure benchmarks directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Save results
    await fs.writeFile(outputPath, JSON.stringify({
      results: this.results,
      benchmarks: Array.from(this.benchmarks.entries())
    }, null, 2));

    console.log(`Benchmark results saved to ${outputPath}`);

    return outputPath;
  }

  /**
   * Clear benchmark results
   */
  clearResults() {
    this.results = [];
    this.benchmarks.clear();
  }
}

// Create singleton instance
const performanceBenchmark = new PerformanceBenchmark();

module.exports = { performanceBenchmark, PerformanceBenchmark };
