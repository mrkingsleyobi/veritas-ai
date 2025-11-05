const ContentAuthenticator = require('../../src/algorithms/contentAuthenticator');

describe('ContentAuthenticator - Stress Testing', () => {
  let authenticator;

  beforeEach(() => {
    authenticator = new ContentAuthenticator();
  });

  describe('High Load Scenarios', () => {
    test('should handle high concurrency', async () => {
      // Create 100 concurrent verification requests
      const promises = Array.from({ length: 100 }, (_, i) => {
        const content = {
          type: i % 3 === 0 ? 'image' : i % 3 === 1 ? 'video' : 'document',
          data: Buffer.from(`stress test data ${i}`.repeat(10))
        };
        return authenticator.verifyAuthenticity(content);
      });

      const results = await Promise.all(promises);

      // All should complete successfully
      expect(results).toHaveLength(100);
      results.forEach(result => {
        expect(result).toHaveProperty('authentic');
        expect(result).toHaveProperty('confidence');
      });
    }, 10000); // 10 second timeout

    test('should maintain performance under sustained load', async () => {
      const content = {
        type: 'image',
        data: Buffer.from('performance test data')
      };

      // Warm up
      await authenticator.verifyAuthenticity(content);

      // Measure performance for 200 consecutive calls
      const times = [];
      for (let i = 0; i < 200; i++) {
        const start = performance.now();
        await authenticator.verifyAuthenticity(content);
        const end = performance.now();
        times.push(end - start);
      }

      // Calculate statistics
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);

      // Performance should be acceptable
      expect(avgTime).toBeLessThan(200); // Average should be less than 200ms
      expect(maxTime).toBeLessThan(1000); // No single call should take more than 1 second
    }, 30000); // 30 second timeout
  });

  describe('Large Data Processing', () => {
    test('should handle large content items', async () => {
      // Test with large content (1MB)
      const largeContent = {
        type: 'unknown',
        data: Buffer.alloc(1024 * 1024, 'a') // 1MB buffer
      };

      const start = performance.now();
      const result = await authenticator.verifyAuthenticity(largeContent);
      const end = performance.now();

      // Should complete successfully
      expect(result).toHaveProperty('authentic');
      expect(result).toHaveProperty('confidence');
      expect(typeof result.authentic).toBe('boolean');
      expect(typeof result.confidence).toBe('number');

      // Should complete within reasonable time
      expect(end - start).toBeLessThan(5000); // Less than 5 seconds
    }, 10000); // 10 second timeout

    test('should handle batch processing of large datasets', async () => {
      // Create a large batch of content items
      const largeBatch = Array.from({ length: 50 }, (_, i) => ({
        id: `large-batch-${i}`,
        type: 'image',
        data: Buffer.from(`large batch item ${i}`.repeat(50)) // Larger data per item
      }));

      const start = performance.now();
      const results = await authenticator.batchVerify(largeBatch);
      const end = performance.now();

      // All items should be processed
      expect(results).toHaveLength(50);
      results.forEach(result => {
        expect(result.contentId).toBeDefined();
        expect(result).toHaveProperty('authentic');
        expect(result).toHaveProperty('confidence');
      });

      // Should complete within reasonable time
      expect(end - start).toBeLessThan(10000); // Less than 10 seconds
    }, 15000); // 15 second timeout
  });
});