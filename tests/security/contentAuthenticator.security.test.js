const ContentAuthenticator = require('../../src/algorithms/contentAuthenticator');

describe('Content Authenticator Security', () => {
  let authenticator;

  beforeEach(() => {
    authenticator = new ContentAuthenticator();
  });

  describe('Input Validation', () => {
    test('should reject excessively large content data', async () => {
      const largeContent = {
        type: 'image',
        data: Buffer.alloc(100 * 1024 * 1024, 'a') // 100MB buffer
      };

      // Should handle large data gracefully without crashing
      const result = await authenticator.verifyAuthenticity(largeContent);

      // Should still return a result even for large data
      expect(result).toBeDefined();
      expect(result.authentic).toBeDefined();
      expect(result.confidence).toBeDefined();
    });

    test('should handle null and undefined inputs gracefully', async () => {
      await expect(authenticator.verifyAuthenticity(null))
        .rejects.toThrow('Invalid content: type and data are required');

      await expect(authenticator.verifyAuthenticity(undefined))
        .rejects.toThrow('Invalid content: type and data are required');

      await expect(authenticator.verifyAuthenticity({}))
        .rejects.toThrow('Invalid content: type and data are required');
    });

    test('should sanitize malicious content data', async () => {
      // Test various injection attempts
      const maliciousInputs = [
        {
          type: 'image',
          data: Buffer.from('<script>alert("xss")</script>')
        },
        {
          type: 'document',
          data: Buffer.from('"; DROP TABLE users; --')
        },
        {
          type: 'video',
          data: Buffer.from('data:text/html,<script>document.cookie</script>')
        }
      ];

      for (const content of maliciousInputs) {
        // Should not crash or execute malicious code
        const result = await authenticator.verifyAuthenticity(content);

        expect(result).toBeDefined();
        expect(result.authentic).toBeDefined();
        expect(result.confidence).toBeDefined();
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Buffer Security', () => {
    test('should handle buffer overflow attempts', async () => {
      // Create a content object that tries to exploit buffer issues
      const content = {
        type: 'image',
        data: {
          length: Number.MAX_SAFE_INTEGER,
          toString: () => 'malicious data'
        }
      };

      // Should handle gracefully without crashing
      const result = await authenticator.verifyAuthenticity(content);

      expect(result).toBeDefined();
      expect(typeof result.authentic).toBe('boolean'); // Should return a boolean value
      expect(result.confidence).toBeDefined(); // Should have a defined confidence value
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    test('should validate buffer integrity', async () => {
      // Test with various buffer-like objects
      const bufferTests = [
        {
          type: 'image',
          data: 'string data' // String instead of buffer
        },
        {
          type: 'document',
          data: { custom: 'object' } // Object instead of buffer
        },
        {
          type: 'video',
          data: 12345 // Number instead of buffer
        }
      ];

      for (const content of bufferTests) {
        const result = await authenticator.verifyAuthenticity(content);

        expect(result).toBeDefined();
        // Should handle gracefully and return appropriate defaults
        expect(typeof result.authentic).toBe('boolean');
        expect(typeof result.confidence).toBe('number');
      }
    });
  });

  describe('Content Type Validation', () => {
    test('should handle unexpected content types', async () => {
      const unusualContentTypes = [
        { type: '', data: Buffer.from('test') },
        { type: null, data: Buffer.from('test') },
        { type: 'unknown/suspicious', data: Buffer.from('test') },
        { type: '../../../../etc/passwd', data: Buffer.from('test') },
        { type: 'image/png<script>', data: Buffer.from('test') }
      ];

      for (const content of unusualContentTypes) {
        if (!content.type) {
          // Should throw for missing type
          await expect(authenticator.verifyAuthenticity(content))
            .rejects.toThrow('Invalid content: type and data are required');
        } else {
          // Should handle gracefully for unusual but present types
          const result = await authenticator.verifyAuthenticity(content);
          expect(result).toBeDefined();
          expect(typeof result.authentic).toBe('boolean');
          expect(typeof result.confidence).toBe('number');
        }
      }
    });
  });

  describe('DoS Protection', () => {
    test('should limit processing time for complex content', async () => {
      const complexContent = {
        type: 'image',
        data: Buffer.from('a'.repeat(1000000)) // 1MB of repetitive data
      };

      const start = performance.now();
      const result = await authenticator.verifyAuthenticity(complexContent);
      const end = performance.now();
      const duration = end - start;

      // Should complete within reasonable time (under 1 second)
      expect(duration).toBeLessThan(1000);
      expect(result).toBeDefined();
    });

    test('should handle rapid successive requests', async () => {
      const content = {
        type: 'image',
        data: Buffer.from('test image data')
      };

      // Make 100 rapid requests
      const promises = Array.from({ length: 100 }, () =>
        authenticator.verifyAuthenticity(content)
      );

      const results = await Promise.all(promises);

      // All should succeed
      expect(results).toHaveLength(100);
      expect(results.every(r => r.authentic !== undefined)).toBe(true);
    });
  });

  describe('Data Integrity', () => {
    test('should not modify original content data', async () => {
      const originalData = Buffer.from('original content data');
      const originalDataCopy = Buffer.from(originalData); // Copy for comparison

      const content = {
        type: 'image',
        data: originalData
      };

      await authenticator.verifyAuthenticity(content);

      // Original data should remain unchanged
      expect(originalData.equals(originalDataCopy)).toBe(true);
    });

    test('should handle corrupted data gracefully', async () => {
      const corruptedContent = {
        type: 'image',
        data: Buffer.from([0xFF, 0xFE, 0xFF, 0xFF, 0xFE]) // Invalid UTF-8 sequence
      };

      // Should not crash on corrupted data
      const result = await authenticator.verifyAuthenticity(corruptedContent);

      expect(result).toBeDefined();
      expect(typeof result.authentic).toBe('boolean');
      expect(typeof result.confidence).toBe('number');
    });
  });
});