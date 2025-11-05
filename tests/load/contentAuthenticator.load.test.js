const ContentAuthenticator = require('../../src/algorithms/contentAuthenticator');

describe('ContentAuthenticator - Load Testing', () => {
  let authenticator;

  beforeEach(() => {
    authenticator = new ContentAuthenticator();
  });

  describe('Concurrent Processing', () => {
    test('should handle concurrent verification requests', async () => {
      const contentItems = Array.from({ length: 50 }, (_, i) => ({
        id: `item-${i}`,
        type: i % 3 === 0 ? 'image' : i % 3 === 1 ? 'video' : 'document',
        data: Buffer.from(`test content data for item ${i}`.repeat(10))
      }));

      // Measure execution time
      const start = performance.now();

      // Process all items concurrently
      const promises = contentItems.map(item =>
        authenticator.verifyAuthenticity(item)
      );

      const results = await Promise.all(promises);
      const end = performance.now();

      // Verify all results are valid
      expect(results).toHaveLength(50);
      results.forEach(result => {
        expect(result).toHaveProperty('authentic');
        expect(result).toHaveProperty('confidence');
        expect(typeof result.authentic).toBe('boolean');
        expect(typeof result.confidence).toBe('number');
      });

      // Should complete within reasonable time (less than 5 seconds for 50 items)
      expect(end - start).toBeLessThan(5000);
    }, 10000); // 10 second timeout

    test('should maintain consistent performance under load', async () => {
      const content = {
        type: 'image',
        data: Buffer.from('test image data with jpeg compression artifacts')
      };

      // Warm up
      await authenticator.verifyAuthenticity(content);

      // Measure performance for 100 consecutive calls
      const times = [];
      for (let i = 0; i < 100; i++) {
        const start = performance.now();
        await authenticator.verifyAuthenticity(content);
        const end = performance.now();
        times.push(end - start);
      }

      // Calculate statistics
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);

      // Performance should be consistent
      expect(avgTime).toBeLessThan(100); // Average should be less than 100ms
      expect(maxTime).toBeLessThan(500); // No single call should take more than 500ms
    });
  });

  describe('Batch Processing Performance', () => {
    test('should efficiently process large batches', async () => {
      const batchSizes = [10, 50, 100];

      for (const batchSize of batchSizes) {
        const contents = Array.from({ length: batchSize }, (_, i) => ({
          id: `batch-${batchSize}-${i}`,
          type: 'image',
          data: Buffer.from(`batch item ${i}`.repeat(5))
        }));

        const start = performance.now();
        const results = await authenticator.batchVerify(contents);
        const end = performance.now();

        // Verify results
        expect(results).toHaveLength(batchSize);
        results.forEach(result => {
          expect(result.contentId).toBeDefined();
          expect(result).toHaveProperty('authentic');
          expect(result).toHaveProperty('confidence');
        });

        // Performance check - should scale reasonably
        const timePerItem = (end - start) / batchSize;
        expect(timePerItem).toBeLessThan(50); // Average less than 50ms per item
      }
    }, 30000); // 30 second timeout for large batches
  });

  describe('Memory Usage', () => {
    test('should not cause excessive memory growth under sustained load', async () => {
      // Get initial memory usage
      const initialMemory = process.memoryUsage().heapUsed;

      // Process many items
      for (let i = 0; i < 500; i++) {
        const content = {
          id: `memory-test-${i}`,
          type: i % 3 === 0 ? 'image' : i % 3 === 1 ? 'video' : 'document',
          data: Buffer.from(`memory test data ${i}`.repeat(20))
        };

        await authenticator.verifyAuthenticity(content);

        // Periodically check memory (every 100 items)
        if (i % 100 === 0) {
          const currentMemory = process.memoryUsage().heapUsed;
          const memoryGrowth = currentMemory - initialMemory;

          // Memory growth should be reasonable (less than 50MB)
          expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
        }
      }

      // Final memory check
      const finalMemory = process.memoryUsage().heapUsed;
      const totalMemoryGrowth = finalMemory - initialMemory;

      // Total memory growth should be reasonable
      expect(totalMemoryGrowth).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
    }, 30000); // 30 second timeout
  });
});