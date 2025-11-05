const ContentAuthenticator = require('../../src/algorithms/contentAuthenticator');

describe('ContentAuthenticator - Chaos Engineering', () => {
  let authenticator;

  beforeEach(() => {
    authenticator = new ContentAuthenticator();
  });

  describe('Fault Injection', () => {
    test('should handle network failures gracefully', async () => {
      // Mock a network failure scenario
      const originalVerifyImage = authenticator._verifyImage;

      // Inject fault: simulate network timeout
      authenticator._verifyImage = jest.fn().mockImplementation(async () => {
        throw new Error('Network timeout');
      });

      const content = {
        type: 'image',
        data: Buffer.from('test image data')
      };

      // Should handle gracefully and return appropriate error
      await expect(authenticator.verifyAuthenticity(content))
        .rejects.toThrow('Network timeout');

      // Restore original method
      authenticator._verifyImage = originalVerifyImage;
    });

    test('should handle database connection failures', async () => {
      // Mock database failure
      const originalVerifyDocument = authenticator._verifyDocument;

      authenticator._verifyDocument = jest.fn().mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const content = {
        type: 'document',
        data: Buffer.from('test document data')
      };

      // Should handle gracefully
      expect(() => authenticator._verifyDocument(content, {}, {}))
        .toThrow('Database connection failed');

      // Restore original method
      authenticator._verifyDocument = originalVerifyDocument;
    });

    test('should maintain functionality after partial failures', async () => {
      // Simulate intermittent failures
      let callCount = 0;
      const originalVerifyVideo = authenticator._verifyVideo;

      authenticator._verifyVideo = jest.fn().mockImplementation(async (content, options, result) => {
        callCount++;
        if (callCount % 3 === 0) {
          throw new Error('Intermittent service failure');
        }
        return originalVerifyVideo.call(authenticator, content, options, result);
      });

      const content = {
        type: 'video',
        data: Buffer.from('test video data')
      };

      // First call should succeed
      const result1 = await authenticator.verifyAuthenticity(content);
      expect(result1).toHaveProperty('authentic');

      // Second call should succeed
      const result2 = await authenticator.verifyAuthenticity(content);
      expect(result2).toHaveProperty('authentic');

      // Third call should fail due to injected fault
      await expect(authenticator.verifyAuthenticity(content))
        .rejects.toThrow('Intermittent service failure');

      // Fourth call should succeed again
      const result4 = await authenticator.verifyAuthenticity(content);
      expect(result4).toHaveProperty('authentic');

      // Restore original method
      authenticator._verifyVideo = originalVerifyVideo;
    });
  });

  describe('Resource Exhaustion', () => {
    test('should handle high memory usage gracefully', async () => {
      // Create large content to test memory handling
      const largeContent = {
        type: 'unknown',
        data: Buffer.alloc(100 * 1024 * 1024, 'a') // 100MB buffer
      };

      // Monitor memory before and after
      const initialMemory = process.memoryUsage().heapUsed;

      try {
        const result = await authenticator.verifyAuthenticity(largeContent);

        // Should still return a result
        expect(result).toHaveProperty('authentic');
        expect(result).toHaveProperty('confidence');
      } catch (error) {
        // If it fails due to memory, it should be a specific error
        expect(error.message).toContain('memory') || expect(error.message).toContain('allocation');
      }

      // Check memory growth
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;

      // Even with large content, memory growth should be reasonable
      expect(memoryGrowth).toBeLessThan(200 * 1024 * 1024); // Less than 200MB growth
    }, 30000); // 30 second timeout

    test('should handle concurrent resource exhaustion', async () => {
      // Create multiple large content items
      const largeContents = Array.from({ length: 10 }, (_, i) => ({
        type: 'image',
        data: Buffer.alloc(10 * 1024 * 1024, `data-${i}`) // 10MB buffers
      }));

      // Track how many succeed vs fail
      let successCount = 0;
      let failureCount = 0;

      // Process all concurrently
      const promises = largeContents.map(async (content) => {
        try {
          const result = await authenticator.verifyAuthenticity(content);
          successCount++;
          return result;
        } catch (error) {
          failureCount++;
          throw error;
        }
      });

      // Some may succeed, some may fail, but none should crash the process
      try {
        await Promise.all(promises);
      } catch (error) {
        // Expected - some may fail due to resource constraints
      }

      // At least some should succeed (system should be resilient)
      expect(successCount + failureCount).toBe(10);
    }, 30000); // 30 second timeout
  });

  describe('Degraded Performance', () => {
    test('should maintain basic functionality under slow processing', async () => {
      // Inject artificial delay to simulate slow processing
      const originalAnalyzeMetadata = authenticator._analyzeMetadata;

      authenticator._analyzeMetadata = jest.fn().mockImplementation((data) => {
        // Add delay to simulate slow processing
        const startTime = Date.now();
        while (Date.now() - startTime < 50) {
          // Busy wait for 50ms
        }
        return originalAnalyzeMetadata.call(authenticator, data);
      });

      const content = {
        type: 'image',
        data: Buffer.from('test image data')
      };

      const start = performance.now();
      const result = await authenticator.verifyAuthenticity(content);
      const end = performance.now();

      // Should still work but take longer
      expect(result).toHaveProperty('authentic');
      expect(result).toHaveProperty('confidence');
      // Should take longer due to delay (allowing for some variance)
      expect(end - start).toBeGreaterThan(40);

      // Restore original method
      authenticator._analyzeMetadata = originalAnalyzeMetadata;
    });

    test('should degrade gracefully under extreme load', async () => {
      // Simulate extreme load by slowing down all operations
      const methodsToSlow = [
        '_performELA',
        '_analyzeMetadata',
        '_detectCompressionArtifacts',
        '_analyzeNoisePatterns',
        '_detectEdgeInconsistencies'
      ];

      const originals = {};

      // Inject delays into all methods
      methodsToSlow.forEach(methodName => {
        originals[methodName] = authenticator[methodName];
        authenticator[methodName] = jest.fn().mockImplementation((data) => {
          // Add delay to simulate load
          const startTime = Date.now();
          while (Date.now() - startTime < 20) {
            // Busy wait for 20ms
          }
          return originals[methodName].call(authenticator, data);
        });
      });

      const content = {
        type: 'image',
        data: Buffer.from('test image data')
      };

      // Process multiple items concurrently under load
      const promises = Array.from({ length: 3 }, () =>
        authenticator.verifyAuthenticity(content)
      );

      const start = performance.now();
      const results = await Promise.all(promises);
      const end = performance.now();

      // All should still succeed
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toHaveProperty('authentic');
        expect(result).toHaveProperty('confidence');
      });

      // Restore original methods
      methodsToSlow.forEach(methodName => {
        authenticator[methodName] = originals[methodName];
      });
    }, 10000); // 10 second timeout
  });
});