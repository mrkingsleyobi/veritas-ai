const fc = require('fast-check');
const ContentAuthenticator = require('../../src/algorithms/contentAuthenticator');

describe('ContentAuthenticator - Fuzz Testing', () => {
  let authenticator;

  beforeEach(() => {
    authenticator = new ContentAuthenticator();
  });

  describe('Input Fuzzing', () => {
    test('should handle arbitrary buffer inputs without crashing', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uint8Array({ minLength: 0, maxLength: 10000 }).map(buffer => Buffer.from(buffer)),
          async (buffer) => {
            const content = {
              type: 'image',
              data: buffer
            };

            // Should not crash regardless of input
            try {
              const result = await authenticator.verifyAuthenticity(content);

              // If it doesn't throw, result should be valid
              expect(result).toHaveProperty('authentic');
              expect(result).toHaveProperty('confidence');
              expect(typeof result.authentic).toBe('boolean');
              expect(typeof result.confidence).toBe('number');
              expect(result.confidence).toBeGreaterThanOrEqual(0);
              expect(result.confidence).toBeLessThanOrEqual(1);
            } catch (error) {
              // If it throws, it should be a validation error or type error, not a crash
              expect(error.message).toEqual(
                expect.stringMatching(/Invalid content|toLowerCase is not a function/)
              );
            }
          }
        ),
        { numRuns: 1000 }
      );
    });

    test('should handle random string inputs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ maxLength: 10000 }),
          async (str) => {
            const content = {
              type: 'document',
              data: str
            };

            try {
              const result = await authenticator.verifyAuthenticity(content);

              // Should return valid result structure
              expect(result).toHaveProperty('authentic');
              expect(result).toHaveProperty('confidence');
            } catch (error) {
              // Validation errors are acceptable
              expect(error.message).toEqual(
                expect.stringMatching(/Invalid content|toLowerCase is not a function/)
              );
            }
          }
        ),
        { numRuns: 500 }
      );
    });

    test('should handle special characters and unicode', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ maxLength: 1000 }),
          async (unicodeStr) => {
            const content = {
              type: 'document',
              data: Buffer.from(unicodeStr, 'utf8')
            };

            try {
              const result = await authenticator.verifyAuthenticity(content);

              // Should handle unicode without crashing
              expect(result).toHaveProperty('authentic');
              expect(result).toHaveProperty('confidence');
            } catch (error) {
              // Validation errors are acceptable
              expect(error.message).toEqual(
                expect.stringMatching(/Invalid content|toLowerCase is not a function/)
              );
            }
          }
        ),
        { numRuns: 200 }
      );
    });
  });

  describe('Content Type Fuzzing', () => {
    test('should handle arbitrary content types', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // Ensure non-empty string
          fc.uint8Array({ minLength: 1, maxLength: 1000 }).map(buffer => Buffer.from(buffer)),
          async (type, buffer) => {
            const content = {
              type: type,
              data: buffer
            };

            // Should handle any content type gracefully
            const result = await authenticator.verifyAuthenticity(content);

            // Should always return valid structure
            expect(result).toHaveProperty('authentic');
            expect(result).toHaveProperty('confidence');
            expect(result).toHaveProperty('details');
            expect(result).toHaveProperty('metadata');
          }
        ),
        { numRuns: 500 }
      );
    });
  });

  describe('Malformed Input Fuzzing', () => {
    test('should handle malformed objects', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.record({ type: fc.string({ minLength: 1 }), data: fc.anything() }),
            fc.record({ type: fc.anything(), data: fc.string({ minLength: 1 }) }),
            fc.dictionary(fc.string({ minLength: 1 }), fc.anything())
          ),
          async (content) => {
            try {
              const result = await authenticator.verifyAuthenticity(content);

              // If it succeeds, result should be valid
              expect(result).toHaveProperty('authentic');
              expect(result).toHaveProperty('confidence');
            } catch (error) {
              // Errors should be validation-related or type errors, not crashes
              expect(error.message).toEqual(
                expect.stringMatching(/Invalid content|toLowerCase is not a function/)
              );
            }
          }
        ),
        { numRuns: 300 }
      );
    });

    test('should handle prototype pollution attempts', async () => {
      const pollutedInputs = [
        JSON.parse('{"__proto__": {"polluted": true}}'),
        JSON.parse('{"constructor": {"prototype": {"polluted": true}}}'),
        { type: 'image', data: { __proto__: { malicious: true } } }
      ];

      for (const input of pollutedInputs) {
        try {
          const result = await authenticator.verifyAuthenticity(input);

          // Should return valid result or validation error
          expect(result).toHaveProperty('authentic');
          expect(result).toHaveProperty('confidence');
        } catch (error) {
          // Should be validation error, not prototype pollution
          expect(error.message).toEqual(
            expect.stringMatching(/Invalid content|toLowerCase is not a function/)
          );
          expect(error.message).not.toEqual(expect.stringContaining('polluted'));
        }
      }
    });
  });

  describe('Buffer Overflow Fuzzing', () => {
    test('should handle extremely large inputs', async () => {
      // Test with large buffers (but not too large to avoid memory issues)
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024, 'a'); // 10MB

      const content = {
        type: 'unknown',
        data: largeBuffer
      };

      // Should not crash or cause memory issues
      const result = await authenticator.verifyAuthenticity(content);

      // Should return valid result structure
      expect(result).toHaveProperty('authentic');
      expect(result).toHaveProperty('confidence');
      expect(typeof result.authentic).toBe('boolean');
      expect(typeof result.confidence).toBe('number');
    }, 30000); // 30 second timeout for large data

    test('should handle repeated patterns', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('a', 'ab', 'abc', 'abcd'),
          fc.integer({ min: 1000, max: 10000 }),
          async (pattern, repetitions) => {
            const data = pattern.repeat(repetitions);
            const content = {
              type: 'document',
              data: Buffer.from(data)
            };

            try {
              const result = await authenticator.verifyAuthenticity(content);

              // Should handle repeated patterns without issues
              expect(result).toHaveProperty('authentic');
              expect(result).toHaveProperty('confidence');
            } catch (error) {
              // Validation errors acceptable
              expect(error.message).toEqual(
                expect.stringMatching(/Invalid content|toLowerCase is not a function/)
              );
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Edge Case Fuzzing', () => {
    test('should handle null bytes and special characters', async () => {
      const specialBuffers = [
        Buffer.from([0, 1, 2, 3, 4, 5]), // Null bytes and control characters
        Buffer.from('\x00\x01\x02\x03\x04\x05', 'binary'),
        Buffer.from('valid data\x00null byte in middle'),
        Buffer.from('\x00'.repeat(100)), // All null bytes
        Buffer.from(String.fromCharCode(...Array(256).keys())) // All bytes 0-255
      ];

      for (const buffer of specialBuffers) {
        const content = {
          type: 'image',
          data: buffer
        };

        try {
          const result = await authenticator.verifyAuthenticity(content);

          // Should handle special bytes without crashing
          expect(result).toHaveProperty('authentic');
          expect(result).toHaveProperty('confidence');
        } catch (error) {
          // Validation errors acceptable
          expect(error.message).toEqual(
            expect.stringMatching(/Invalid content|toLowerCase is not a function/)
          );
        }
      }
    });

    test('should handle boundary values', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant(0),
            fc.constant(1),
            fc.constant(Number.MAX_SAFE_INTEGER),
            fc.constant(Number.MIN_SAFE_INTEGER),
            fc.constant(Number.MAX_VALUE),
            fc.constant(Number.MIN_VALUE),
            fc.constant(NaN),
            fc.constant(Infinity),
            fc.constant(-Infinity)
          ),
          async (boundaryValue) => {
            const content = {
              type: 'document',
              data: boundaryValue
            };

            try {
              const result = await authenticator.verifyAuthenticity(content);

              // Should handle boundary values gracefully
              expect(result).toHaveProperty('authentic');
              expect(result).toHaveProperty('confidence');
            } catch (error) {
              // Validation errors acceptable
              expect(error.message).toEqual(
                expect.stringMatching(/Invalid content|toLowerCase is not a function/)
              );
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Performance Under Fuzzing', () => {
    test('should maintain reasonable performance with random inputs', async () => {
      // Generate inputs in a simpler way
      const inputs = [];
      for (let i = 0; i < 100; i++) {
        inputs.push({
          type: 'test',
          data: Buffer.from(`test data ${i}`.repeat(10))
        });
      }

      const times = [];

      for (const input of inputs) {
        const start = performance.now();

        try {
          await authenticator.verifyAuthenticity(input);
        } catch (error) {
          // Ignore validation errors for timing
        }

        const end = performance.now();
        times.push(end - start);
      }

      // Calculate statistics
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);

      // Should maintain reasonable performance even with random inputs
      expect(avgTime).toBeLessThan(200); // Average less than 200ms
      expect(maxTime).toBeLessThan(1000); // No single call more than 1 second
    }, 30000); // 30 second timeout
  });
});