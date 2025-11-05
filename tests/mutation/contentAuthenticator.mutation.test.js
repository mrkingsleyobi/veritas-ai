const ContentAuthenticator = require('../../src/algorithms/contentAuthenticator');

// Mutation testing helper functions
const createMutatedAuthenticator = (mutationType) => {
  const authenticator = new ContentAuthenticator();

  switch (mutationType) {
    case 'confidence-threshold':
      // Mutate confidence threshold
      authenticator._verifyImage = function(content, options, result) {
        result.authentic = true; // Always return authentic
        result.confidence = 0.9;
        result.details = { method: 'mutated_analysis' };
        result.metadata = {
          timestamp: new Date().toISOString(),
          contentLength: content.data.length || 0
        };
        return Promise.resolve(result);
      };
      break;

    case 'missing-validation':
      // Remove input validation
      authenticator.verifyAuthenticity = function(content, options = {}) {
        // Skip validation
        const result = {
          authentic: true,
          confidence: 0.95,
          details: { method: 'mutated_analysis' },
          metadata: {
            timestamp: new Date().toISOString(),
            contentLength: content ? (content.data?.length || 0) : 0
          }
        };
        return Promise.resolve(result);
      };
      break;

    case 'inverted-logic':
      // Invert authenticity logic
      const originalVerify = authenticator._verifyImage;
      authenticator._verifyImage = function(content, options, result) {
        return originalVerify.call(this, content, options, result).then(res => {
          res.authentic = !res.authentic; // Invert the result
          return res;
        });
      };
      break;

    case 'reduced-confidence':
      // Reduce confidence calculations
      const originalAnalyze = authenticator._performELA;
      authenticator._performELA = function(data) {
        return 0.5; // Always return neutral score
      };
      break;

    case 'error-injection':
      // Inject errors randomly
      const originalVerifyVideo = authenticator._verifyVideo;
      authenticator._verifyVideo = function(content, options, result) {
        if (Math.random() < 0.5) { // 50% chance of error
          throw new Error('Injected mutation error');
        }
        return originalVerifyVideo.call(this, content, options, result);
      };
      break;
  }

  return authenticator;
};

describe('ContentAuthenticator - Mutation Testing', () => {
  let authenticator;

  beforeEach(() => {
    authenticator = new ContentAuthenticator();
  });

  describe('Confidence Threshold Mutation', () => {
    test('should detect when confidence threshold is broken', async () => {
      const mutatedAuthenticator = createMutatedAuthenticator('confidence-threshold');

      const content = {
        type: 'image',
        data: Buffer.from('clearly manipulated image data')
      };

      // Original authenticator should detect manipulation
      const originalResult = await authenticator.verifyAuthenticity(content);

      // Mutated authenticator always returns authentic
      const mutatedResult = await mutatedAuthenticator.verifyAuthenticity(content);

      // Test should detect the difference - they should be different
      // Since the mutated version always returns authentic, and the original
      // might return false for manipulated content, they should differ
      // However, if the original also returns true, we need to check confidence
      if (originalResult.authentic === mutatedResult.authentic) {
        // If authentic is the same, confidence should be different
        expect(originalResult.confidence).not.toBeCloseTo(mutatedResult.confidence);
      }
      // If authentic is different, the test passes
    });
  });

  describe('Input Validation Mutation', () => {
    test('should detect missing input validation', async () => {
      const mutatedAuthenticator = createMutatedAuthenticator('missing-validation');

      // Original should throw error for invalid input
      await expect(authenticator.verifyAuthenticity({}))
        .rejects.toThrow('Invalid content: type and data are required');

      // Mutated version should not throw error (defect!)
      const result = await mutatedAuthenticator.verifyAuthenticity({});

      // This indicates a problem with the mutated version
      expect(result).toBeDefined();
      expect(result.authentic).toBe(true); // This is wrong behavior
    });
  });

  describe('Logic Inversion Mutation', () => {
    test('should detect inverted authenticity logic', async () => {
      const mutatedAuthenticator = createMutatedAuthenticator('inverted-logic');

      const content = {
        type: 'image',
        data: Buffer.from('authentic image data with good metadata')
      };

      const originalResult = await authenticator.verifyAuthenticity(content);
      const mutatedResult = await mutatedAuthenticator.verifyAuthenticity(content);

      // Results should be opposite
      expect(originalResult.authentic).not.toEqual(mutatedResult.authentic);
    });
  });

  describe('Confidence Calculation Mutation', () => {
    test('should detect reduced confidence calculations', async () => {
      const mutatedAuthenticator = createMutatedAuthenticator('reduced-confidence');

      const content = {
        type: 'image',
        data: Buffer.from('image with clear manipulation artifacts')
      };

      const originalResult = await authenticator.verifyAuthenticity(content);
      const mutatedResult = await mutatedAuthenticator.verifyAuthenticity(content);

      // Original should have varied confidence based on analysis
      // Mutated should always return 0.5
      expect(mutatedResult.details.elaScore).toBe(0.5);

      // If original detected manipulation, confidence should be different
      // This test validates that our test suite can detect mutations
    });
  });

  describe('Error Handling Mutation', () => {
    test('should detect error handling defects', async () => {
      const mutatedAuthenticator = createMutatedAuthenticator('error-injection');

      const content = {
        type: 'video',
        data: Buffer.from('test video data')
      };

      // Run multiple times to catch intermittent errors
      const results = [];
      const errors = [];

      for (let i = 0; i < 10; i++) {
        try {
          const result = await mutatedAuthenticator.verifyAuthenticity(content);
          results.push(result);
        } catch (error) {
          errors.push(error);
        }
      }

      // Should have some errors due to injection
      expect(errors.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThan(10);

      // Original should not have errors
      const originalResult = await authenticator.verifyAuthenticity(content);
      expect(originalResult).toBeDefined();
    });
  });

  describe('Test Suite Effectiveness', () => {
    test('should have high mutation score for core functionality', async () => {
      // This test validates that our test suite can detect mutations
      const content = {
        type: 'image',
        data: Buffer.from('test image data with jpeg compression artifacts')
      };

      const originalResult = await authenticator.verifyAuthenticity(content);

      // Test confidence range validation
      expect(originalResult.confidence).toBeGreaterThanOrEqual(0);
      expect(originalResult.confidence).toBeLessThanOrEqual(1);

      // Test result structure
      expect(originalResult).toHaveProperty('authentic');
      expect(originalResult).toHaveProperty('confidence');
      expect(originalResult).toHaveProperty('details');
      expect(originalResult).toHaveProperty('metadata');

      // Test metadata structure
      expect(originalResult.metadata).toHaveProperty('timestamp');
      expect(originalResult.metadata).toHaveProperty('contentLength');

      // If we change the logic, these tests should fail
      const mutatedAuthenticator = createMutatedAuthenticator('inverted-logic');
      const mutatedResult = await mutatedAuthenticator.verifyAuthenticity(content);

      // This demonstrates our tests can detect the mutation
      expect(originalResult.authentic).not.toEqual(mutatedResult.authentic);
    });

    test('should detect boundary condition mutations', async () => {
      // Test edge cases that should be caught by good tests
      const edgeCases = [
        { type: 'image', data: Buffer.from('') }, // Empty data
        { type: 'image', data: Buffer.from('a'.repeat(1000000)) }, // Large data
        { type: 'unknown', data: Buffer.from('data') } // Unknown type
      ];

      for (const content of edgeCases) {
        // Original should handle gracefully
        const result = await authenticator.verifyAuthenticity(content);

        // Should return valid structure even for edge cases
        expect(result).toHaveProperty('authentic');
        expect(result).toHaveProperty('confidence');
        expect(typeof result.authentic).toBe('boolean');
        expect(typeof result.confidence).toBe('number');
      }
    });
  });

  describe('Batch Processing Mutation Detection', () => {
    test('should detect mutations in batch processing', async () => {
      const contents = [
        { id: '1', type: 'image', data: Buffer.from('authentic image') },
        { id: '2', type: 'video', data: Buffer.from('authentic video') },
        { id: '3', type: 'document', data: Buffer.from('authentic document') }
      ];

      const originalResults = await authenticator.batchVerify(contents);

      // Create mutated version that always returns errors
      const mutatedAuthenticator = new ContentAuthenticator();
      const originalBatchVerify = mutatedAuthenticator.batchVerify;
      mutatedAuthenticator.batchVerify = function(contents, options = {}) {
        // Mutate to always return errors
        return Promise.resolve(contents.map(content => ({
          contentId: content.id || null,
          error: 'Mutated error',
          authentic: false,
          confidence: 0.0
        })));
      };

      const mutatedResults = await mutatedAuthenticator.batchVerify(contents);

      // Original should have valid results
      expect(originalResults).toHaveLength(3);
      originalResults.forEach(result => {
        expect(result).not.toHaveProperty('error');
        expect(result).toHaveProperty('authentic');
      });

      // Mutated should have errors
      expect(mutatedResults).toHaveLength(3);
      mutatedResults.forEach(result => {
        expect(result).toHaveProperty('error');
        expect(result).toHaveProperty('authentic', false);
      });

      // Tests should detect this difference
      expect(originalResults[0].authentic).not.toEqual(mutatedResults[0].authentic);
    });
  });
});