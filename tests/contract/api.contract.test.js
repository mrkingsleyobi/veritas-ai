const ContentAuthenticator = require('../../src/algorithms/contentAuthenticator');

describe('API Contract Tests', () => {
  let authenticator;

  beforeEach(() => {
    authenticator = new ContentAuthenticator();
  });

  describe('Content Verification Endpoint', () => {
    test('should accept valid content verification requests', async () => {
      const content = {
        type: 'image',
        data: Buffer.from('test image data')
      };

      const result = await authenticator.verifyAuthenticity(content);

      // Validate response structure
      expect(result).toEqual(
        expect.objectContaining({
          authentic: expect.any(Boolean),
          confidence: expect.any(Number),
          details: expect.objectContaining({
            method: expect.any(String)
          }),
          metadata: expect.objectContaining({
            timestamp: expect.any(String),
            contentLength: expect.any(Number)
          })
        })
      );

      // Validate confidence range
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    test('should reject invalid content verification requests', async () => {
      // Test missing type
      await expect(authenticator.verifyAuthenticity({ data: 'test' }))
        .rejects.toThrow('Invalid content: type and data are required');

      // Test missing data
      await expect(authenticator.verifyAuthenticity({ type: 'image' }))
        .rejects.toThrow('Invalid content: type and data are required');

      // Test empty object
      await expect(authenticator.verifyAuthenticity({}))
        .rejects.toThrow('Invalid content: type and data are required');

      // Test null/undefined
      await expect(authenticator.verifyAuthenticity(null))
        .rejects.toThrow('Invalid content: type and data are required');

      await expect(authenticator.verifyAuthenticity(undefined))
        .rejects.toThrow('Invalid content: type and data are required');
    });

    test('should handle all supported content types', async () => {
      const contentTypes = ['image', 'video', 'document'];

      for (const type of contentTypes) {
        const content = {
          type,
          data: Buffer.from(`test ${type} data`)
        };

        const result = await authenticator.verifyAuthenticity(content);

        // Should return valid result for all types
        expect(result).toHaveProperty('authentic');
        expect(result).toHaveProperty('confidence');
        expect(result.details).toHaveProperty('method');
      }
    });
  });

  describe('Batch Verification Endpoint', () => {
    test('should accept valid batch verification requests', async () => {
      const contents = [
        { id: '1', type: 'image', data: Buffer.from('image data 1') },
        { id: '2', type: 'video', data: Buffer.from('video data 2') },
        { id: '3', type: 'document', data: Buffer.from('document data 3') }
      ];

      const results = await authenticator.batchVerify(contents);

      // Validate response structure
      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        // Match the implementation behavior: content.id || null
        const expectedId = contents[index].id ? contents[index].id : null;
        expect(result.contentId).toBe(expectedId);
        expect(result).toHaveProperty('authentic');
        expect(result).toHaveProperty('confidence');
        expect(result.details).toHaveProperty('method');
        expect(result.metadata).toHaveProperty('timestamp');
      });
    });

    test('should reject invalid batch verification requests', async () => {
      // Test non-array input
      await expect(authenticator.batchVerify({}))
        .rejects.toThrow('Contents must be an array');

      await expect(authenticator.batchVerify(null))
        .rejects.toThrow('Contents must be an array');

      await expect(authenticator.batchVerify('not-an-array'))
        .rejects.toThrow('Contents must be an array');
    });

    test('should handle empty batch requests', async () => {
      const results = await authenticator.batchVerify([]);

      // Should return empty array for empty input
      expect(results).toEqual([]);
    });

    test('should handle batch requests with invalid items', async () => {
      const contents = [
        { id: '1', type: 'image', data: Buffer.from('valid data') },
        { id: '2', type: 'invalid' }, // Missing data
        { id: '3', type: 'video', data: Buffer.from('valid data') }
      ];

      const results = await authenticator.batchVerify(contents);

      // Should return results for all items, with errors for invalid ones
      expect(results).toHaveLength(3);

      // First item should be valid
      expect(results[0].contentId).toBe('1');
      expect(results[0].authentic).toBeDefined();

      // Second item should have error
      // The contentId should be '2' since that's what was provided, even though it's invalid
      expect(results[1].contentId).toBe('2');
      expect(results[1].error).toBeDefined();
      expect(results[1].authentic).toBe(false);

      // Third item should be valid
      expect(results[2].contentId).toBe('3');
      expect(results[2].authentic).toBeDefined();
    });
  });

  describe('Response Format Consistency', () => {
    test('should maintain consistent response structure across all endpoints', async () => {
      // Test single verification
      const singleResult = await authenticator.verifyAuthenticity({
        type: 'image',
        data: Buffer.from('test data')
      });

      // Test batch verification
      const batchResults = await authenticator.batchVerify([
        { id: '1', type: 'image', data: Buffer.from('test data') }
      ]);

      // Validate single result structure
      expect(singleResult).toEqual(
        expect.objectContaining({
          authentic: expect.any(Boolean),
          confidence: expect.any(Number),
          details: expect.any(Object),
          metadata: expect.any(Object)
        })
      );

      // Validate batch result structure
      expect(batchResults[0]).toEqual(
        expect.objectContaining({
          contentId: expect.any(String),
          authentic: expect.any(Boolean),
          confidence: expect.any(Number),
          details: expect.any(Object),
          metadata: expect.any(Object)
        })
      );

      // Both should have the same core properties
      const coreProperties = ['authentic', 'confidence', 'details', 'metadata'];
      coreProperties.forEach(prop => {
        expect(singleResult).toHaveProperty(prop);
        expect(batchResults[0]).toHaveProperty(prop);
      });
    });

    test('should include proper metadata in all responses', async () => {
      const content = {
        type: 'image',
        data: Buffer.from('test data')
      };

      const result = await authenticator.verifyAuthenticity(content);

      // Validate metadata structure
      expect(result.metadata).toEqual(
        expect.objectContaining({
          timestamp: expect.any(String),
          contentLength: expect.any(Number)
        })
      );

      // Validate timestamp format
      expect(new Date(result.metadata.timestamp)).toBeInstanceOf(Date);

      // Validate content length
      expect(result.metadata.contentLength).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling Contract', () => {
    test('should return consistent error formats', async () => {
      // Test various error scenarios
      const errorCases = [
        { type: 'image' }, // Missing data
        { data: 'test' }, // Missing type
        {}, // Empty object
        null, // Null input
        undefined // Undefined input
      ];

      for (const content of errorCases) {
        try {
          await authenticator.verifyAuthenticity(content);
          // Should not reach here
          fail('Expected error was not thrown');
        } catch (error) {
          // Validate error structure
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toEqual(expect.any(String));
          expect(error.message.length).toBeGreaterThan(0);
        }
      }
    });

    test('should handle batch errors consistently', async () => {
      const contents = [
        { id: '1', type: 'image', data: Buffer.from('valid data') },
        { id: '2' }, // Invalid - missing type and data
        { id: '3', type: 'video', data: Buffer.from('valid data') }
      ];

      const results = await authenticator.batchVerify(contents);

      // Valid items should have results
      expect(results[0]).not.toHaveProperty('error');
      expect(results[0]).toHaveProperty('authentic');
      expect(results[0]).toHaveProperty('confidence');

      // Invalid items should have errors
      expect(results[1]).toHaveProperty('error');
      expect(results[1]).toHaveProperty('authentic', false);
      expect(results[1]).toHaveProperty('confidence', 0.0);

      // Valid items should have results
      expect(results[2]).not.toHaveProperty('error');
      expect(results[2]).toHaveProperty('authentic');
      expect(results[2]).toHaveProperty('confidence');
    });
  });
});