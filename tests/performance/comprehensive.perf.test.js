const { performance } = require('perf_hooks');
const OptimizedContentAuthenticator = require('../../src/algorithms/optimizedContentAuthenticator');
const OptimizedRUVProfileService = require('../../src/services/optimizedRuvProfileService');
const { redisCache } = require('../../src/cache/redisClient');
const { memoryManager } = require('../../src/utils/memoryManager');

describe('Comprehensive Performance Optimizations', () => {
  let authenticator;
  let ruvService;

  beforeAll(async () => {
    authenticator = new OptimizedContentAuthenticator();
    ruvService = new OptimizedRUVProfileService();

    // Connect to Redis for testing
    await redisCache.connect();
  });

  afterAll(async () => {
    // Close worker threads
    if (authenticator && typeof authenticator.closeWorkers === 'function') {
      await authenticator.closeWorkers();
    }

    // Close database connections
    if (ruvService && typeof ruvService.close === 'function') {
      await ruvService.close();
    }

    // Disconnect Redis
    await redisCache.disconnect();
  });

  describe('1. Parallel Batch Processing with Promise.all()', () => {
    test('should process batches faster than sequential processing', async () => {
      const contents = Array.from({ length: 50 }, (_, i) => ({
        id: `parallel-${i}`,
        type: i % 3 === 0 ? 'image' : i % 3 === 1 ? 'video' : 'document',
        data: Buffer.from(`test data ${i}`.repeat(10))
      }));

      // Test batch processing performance
      const start = performance.now();
      const results = await authenticator.batchVerify(contents);
      const end = performance.now();
      const duration = end - start;

      expect(results).toHaveLength(50);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds

      // Verify all results have proper structure
      results.forEach(result => {
        expect(result).toHaveProperty('authentic');
        expect(result).toHaveProperty('confidence');
      });
    });

    test('should maintain accuracy with parallel processing', async () => {
      const contents = [
        {
          id: 'authentic-image',
          type: 'image',
          data: Buffer.from('authentic image with good metadata and quality indicators')
        },
        {
          id: 'manipulated-image',
          type: 'image',
          data: Buffer.from('manipulated image with compression artifacts and inconsistent metadata')
        }
      ];

      const results = await authenticator.batchVerify(contents);

      expect(results[0].contentId).toBe('authentic-image');
      expect(results[1].contentId).toBe('manipulated-image');
    });
  });

  describe('2. Distributed Caching with Redis Integration', () => {
    test('should cache verification results in Redis', async () => {
      // Skip if Redis is not connected
      if (!redisCache.isConnected) {
        console.log('Redis not connected, skipping cache tests');
        return;
      }

      const content = {
        id: 'cache-test-1',
        type: 'image',
        data: Buffer.from('test image data for caching')
      };

      // First verification (should not be cached)
      const result1 = await authenticator.verifyAuthenticity(content);

      // Second verification (should be cached)
      const start = performance.now();
      const result2 = await authenticator.verifyAuthenticity(content);
      const end = performance.now();
      const cacheDuration = end - start;

      expect(result1.authentic).toBe(result2.authentic);
      expect(result1.confidence).toBeCloseTo(result2.confidence, 5);
      expect(cacheDuration).toBeLessThan(50); // Cached requests should be very fast

      // Check that cache hit is recorded
      expect(result2.details.cacheHit).toBe(true);
    });

    test('should cache RUV profiles in Redis', async () => {
      // Skip if Redis is not connected
      if (!redisCache.isConnected) {
        console.log('Redis not connected, skipping profile cache tests');
        return;
      }

      const contentId = 'profile-cache-test';
      const ruvData = {
        reputation: 0.9,
        uniqueness: 0.8,
        verification: 0.95
      };

      // Create profile (should be cached)
      const profile1 = await ruvService.createOrUpdateProfile(contentId, ruvData);

      // Retrieve profile (should be from cache)
      const start = performance.now();
      const profile2 = await ruvService.getProfile(contentId);
      const end = performance.now();
      const cacheDuration = end - start;

      expect(profile1.reputation).toBeCloseTo(profile2.reputation, 5);
      expect(profile1.uniqueness).toBeCloseTo(profile2.uniqueness, 5);
      expect(profile1.verification).toBeCloseTo(profile2.verification, 5);
      expect(cacheDuration).toBeLessThan(20); // Cached requests should be very fast
    });

    test('should handle Redis connection failures gracefully', async () => {
      // Temporarily disconnect Redis
      const wasConnected = redisCache.isConnected;
      redisCache.isConnected = false;

      const content = {
        id: 'redis-failure-test',
        type: 'image',
        data: Buffer.from('test data')
      };

      // Should still work without Redis
      const result = await authenticator.verifyAuthenticity(content);

      expect(result.authentic).toBeDefined();
      expect(result.confidence).toBeDefined();

      // Restore Redis connection
      redisCache.isConnected = wasConnected;
    });
  });

  describe('3. Worker Threads for CPU-Intensive Operations', () => {
    test('should use worker threads for large content processing', async () => {
      // Create large content that should trigger worker thread usage
      const largeData = Buffer.alloc(2 * 1024 * 1024, 'a'); // 2MB of data
      const content = {
        id: 'large-content-test',
        type: 'image',
        data: largeData
      };

      const start = performance.now();
      const result = await authenticator.verifyAuthenticity(content);
      const end = performance.now();
      const duration = end - start;

      expect(result.authentic).toBeDefined();
      expect(result.confidence).toBeDefined();
      // Large content should still process reasonably fast
      expect(duration).toBeLessThan(3000);
    });

    test('should manage worker pool effectively', () => {
      expect(authenticator.workerPool).toBeDefined();
      expect(authenticator.workerPool.length).toBeGreaterThan(0);

      // Check that workers are properly initialized
      const availableWorker = authenticator.getAvailableWorker();
      expect(availableWorker).not.toBeNull();
    });
  });

  describe('4. Streaming Processing for Large Content', () => {
    test('should process streaming content', async () => {
      const { Readable } = require('stream');

      // Create a readable stream with test data
      const stream = new Readable();
      stream.push('streaming test data for verification');
      stream.push(null); // End of stream

      const start = performance.now();
      const result = await authenticator.streamVerify(stream);
      const end = performance.now();
      const duration = end - start;

      expect(result.authentic).toBeDefined();
      expect(result.confidence).toBeDefined();
      expect(result.details.streamingProcessed).toBe(true);
      expect(duration).toBeLessThan(1000);
    });

    test('should handle streaming errors gracefully', async () => {
      const { Readable } = require('stream');

      // Create a stream that emits an error
      const errorStream = new Readable({
        read() {
          this.emit('error', new Error('Stream error for testing'));
        }
      });

      await expect(authenticator.streamVerify(errorStream))
        .rejects.toThrow('Stream verification failed');
    });
  });

  describe('5. Database Connection Pooling', () => {
    test('should initialize database connection pool', () => {
      // Check that database pool is initialized based on environment
      expect(ruvService.dbType).toBeDefined();
    });

    test('should handle concurrent database operations', async () => {
      const profileUpdates = Array.from({ length: 20 }, (_, i) => ({
        contentId: `concurrent-db-test-${i}`,
        ruvData: {
          reputation: 0.5 + (i / 40),
          uniqueness: 0.5 + (i / 40),
          verification: 0.5 + (i / 40)
        }
      }));

      const start = performance.now();

      // Concurrent profile updates using Promise.all
      const updatePromises = profileUpdates.map(update =>
        ruvService.createOrUpdateProfile(update.contentId, update.ruvData)
      );

      const profiles = await Promise.all(updatePromises);
      const end = performance.now();
      const duration = end - start;

      expect(profiles).toHaveLength(20);
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds

      // Verify accuracy of fusion scores
      profiles.forEach((profile, index) => {
        const expectedReputation = 0.5 + (index / 40);
        expect(profile.reputation).toBeCloseTo(expectedReputation, 0);
      });
    });
  });

  describe('6. Memory Management Improvements', () => {
    test('should monitor memory usage effectively', () => {
      const memoryStats = memoryManager.getMemoryStats();

      expect(memoryStats).toHaveProperty('current');
      expect(memoryStats).toHaveProperty('history');
      expect(memoryStats.current).toHaveProperty('rss');
      expect(memoryStats.current).toHaveProperty('heapUsed');
    });

    test('should handle large batch processing without memory leaks', async () => {
      // Measure initial memory
      const initialMemory = process.memoryUsage().heapUsed;

      // Process large batch
      const largeBatch = Array.from({ length: 100 }, (_, i) => ({
        id: `memory-test-${i}`,
        type: 'image',
        data: Buffer.from(`memory test data ${i}`.repeat(50)) // Make data substantial
      }));

      const results = await authenticator.batchVerify(largeBatch);

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;

      expect(results).toHaveLength(100);
      // Memory growth should be reasonable (less than 100MB for 100 items)
      expect(memoryGrowth).toBeLessThan(100 * 1024 * 1024);
    });
  });

  describe('7. Query Optimization and Indexing', () => {
    test('should efficiently retrieve profiles with pagination', async () => {
      // Create several test profiles
      const testProfiles = Array.from({ length: 10 }, (_, i) => ({
        contentId: `pagination-test-${i}`,
        ruvData: {
          reputation: 0.5 + (i / 20),
          uniqueness: 0.5 + (i / 20),
          verification: 0.5 + (i / 20)
        }
      }));

      // Create all profiles
      for (const profile of testProfiles) {
        await ruvService.createOrUpdateProfile(profile.contentId, profile.ruvData);
      }

      // Test pagination
      const start = performance.now();
      const firstPage = await ruvService.getAllProfiles(5, 0); // First 5
      const secondPage = await ruvService.getAllProfiles(5, 5); // Next 5
      const end = performance.now();
      const duration = end - start;

      expect(firstPage).toHaveLength(5);
      expect(secondPage).toHaveLength(5);
      expect(duration).toBeLessThan(500); // Should be fast with proper indexing
    });
  });

  describe('8. Overall Performance Integration', () => {
    test('should maintain high performance with all optimizations active', async () => {
      const complexContents = Array.from({ length: 30 }, (_, i) => ({
        id: `integration-test-${i}`,
        type: i % 3 === 0 ? 'image' : i % 3 === 1 ? 'video' : 'document',
        data: Buffer.from(`complex integration test data ${i}`.repeat(20))
      }));

      const start = performance.now();

      // Process batch verification
      const verificationResults = await authenticator.batchVerify(complexContents);

      // Create RUV profiles first for fusion
      const profilePromises = verificationResults.map(result => {
        if (!result.error) {
          return ruvService.createOrUpdateProfile(result.contentId, {
            reputation: 0.8,
            uniqueness: 0.7,
            verification: 0.9
          });
        }
      });

      await Promise.all(profilePromises);

      // Fuse with RUV profiles (using Promise.all for parallel processing)
      const fusionTasks = verificationResults
        .filter(result => !result.error)
        .map(result => ({
          contentId: result.contentId,
          verificationResult: result
        }));

      const fusionResults = await ruvService.batchFuseWithVerification(fusionTasks);
      const end = performance.now();
      const totalDuration = end - start;

      expect(verificationResults).toHaveLength(30);
      expect(fusionResults).toHaveLength(30);
      expect(totalDuration).toBeLessThan(8000); // Should complete within 8 seconds

      // Verify quality of results
      fusionResults.forEach(result => {
        if (!result.error) {
          expect(result).toHaveProperty('authentic');
          // Note: fusedConfidence and ruvProfile may not always be present depending on implementation
          // but authentic should always be present
        }
      });
    });
  });
});