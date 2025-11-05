const fc = require('fast-check');
const ContentAuthenticator = require('../../src/algorithms/contentAuthenticator');

describe('ContentAuthenticator - Property-Based Tests', () => {
  let authenticator;

  beforeEach(() => {
    authenticator = new ContentAuthenticator();
  });

  describe('verifyAuthenticity Properties', () => {
    test('should always return a valid result structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            type: fc.constantFrom('image', 'video', 'document', 'unknown'),
            data: fc.uint8Array({ minLength: 1, maxLength: 1000 }).map(buffer => Buffer.from(buffer))
          }),
          async (content) => {
            const result = await authenticator.verifyAuthenticity(content);

            // Check result structure
            expect(result).toHaveProperty('authentic');
            expect(result).toHaveProperty('confidence');
            expect(result).toHaveProperty('details');
            expect(result).toHaveProperty('metadata');

            // Check data types
            expect(typeof result.authentic).toBe('boolean');
            expect(typeof result.confidence).toBe('number');
            expect(result.confidence).toBeGreaterThanOrEqual(0);
            expect(result.confidence).toBeLessThanOrEqual(1);

            // Check metadata
            expect(result.metadata).toHaveProperty('timestamp');
            expect(result.metadata).toHaveProperty('contentLength');
            expect(typeof result.metadata.timestamp).toBe('string');
            expect(typeof result.metadata.contentLength).toBe('number');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should handle edge cases gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.constant({}),
            fc.record({
              type: fc.string(),
              data: fc.oneof(fc.constant(null), fc.constant(undefined), fc.constant(''))
            })
          ),
          async (content) => {
            if (!content || !content.type || !content.data) {
              await expect(authenticator.verifyAuthenticity(content))
                .rejects.toThrow('Invalid content: type and data are required');
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    test('confidence should be consistent for identical inputs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            type: fc.constantFrom('image', 'video', 'document'),
            data: fc.uint8Array({ minLength: 10, maxLength: 100 }).map(buffer => Buffer.from(buffer))
          }),
          async (content) => {
            const result1 = await authenticator.verifyAuthenticity(content);
            const result2 = await authenticator.verifyAuthenticity(content);

            // Results should be identical for identical inputs
            expect(result1.authentic).toBe(result2.authentic);
            expect(result1.confidence).toBeCloseTo(result2.confidence, 5);
          }
        ),
        { numRuns: 50 }
      );
    });

    test('large content should not crash the system', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            type: fc.constantFrom('image', 'video', 'document', 'unknown'),
            data: fc.uint8Array({ minLength: 10000, maxLength: 100000 }).map(buffer => Buffer.from(buffer))
          }),
          async (content) => {
            const result = await authenticator.verifyAuthenticity(content);

            // Should not crash and return valid result
            expect(result).toHaveProperty('authentic');
            expect(result).toHaveProperty('confidence');
            expect(typeof result.authentic).toBe('boolean');
            expect(typeof result.confidence).toBe('number');
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('batchVerify Properties', () => {
    test('should handle arrays of various sizes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.string(),
              type: fc.constantFrom('image', 'video', 'document'),
              data: fc.uint8Array({ minLength: 1, maxLength: 100 }).map(buffer => Buffer.from(buffer))
            }),
            { minLength: 0, maxLength: 20 }
          ),
          async (contents) => {
            const results = await authenticator.batchVerify(contents);

            expect(results).toHaveLength(contents.length);

            results.forEach((result, index) => {
              // Match the implementation behavior: content.id || null
              // This means empty strings, null, undefined all become null
              const expectedId = contents[index].id ? contents[index].id : null;
              expect(result.contentId).toBe(expectedId);
              expect(result).toHaveProperty('authentic');
              expect(result).toHaveProperty('confidence');
            });
          }
        ),
        { numRuns: 30 }
      );
    });

    test('should handle invalid inputs gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.constant({}),
            fc.constant('not-an-array')
          ),
          async (contents) => {
            await expect(authenticator.batchVerify(contents))
              .rejects.toThrow('Contents must be an array');
          }
        )
      );
    });
  });
});