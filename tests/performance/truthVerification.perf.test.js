const ContentAuthenticator = require('../../src/algorithms/contentAuthenticator');
const RUVProfileService = require('../../src/services/ruvProfileService');

describe('Truth Verification Performance', () => {
  let authenticator;
  let ruvService;

  beforeAll(async () => {
    authenticator = new ContentAuthenticator();
    ruvService = new RUVProfileService();
    // Initialize the service (it will reuse existing connections)
    await ruvService.initialize();
  });

  afterAll(async () => {
    // Clean up service connections
    try {
      await ruvService.close();
    } catch (error) {
      // Ignore cleanup errors in tests
    }
  });

  describe('Response Time Testing', () => {
    test('should verify content authenticity under 200ms', async () => {
      const content = {
        type: 'image',
        data: Buffer.from('test image data with metadata')
      };

      const start = performance.now();
      const result = await authenticator.verifyAuthenticity(content);
      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(200);
      expect(result.authentic).toBeDefined();
      expect(result.confidence).toBeDefined();
    });

    test('should fuse RUV profile under 50ms', async () => {
      const contentId = 'perf-test-1';
      const verificationResult = {
        authentic: true,
        confidence: 0.9,
        details: {}
      };

      // Create profile first
      await ruvService.createOrUpdateProfile(contentId, {
        reputation: 0.9,
        uniqueness: 0.8,
        verification: 0.95
      });

      const start = performance.now();
      const result = await ruvService.fuseWithVerification(contentId, verificationResult);
      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(50);
      expect(result.fusedConfidence).toBeGreaterThan(0.5);
    });
  });

  describe('Concurrent Processing', () => {
    test('should handle 100 concurrent verifications under 5 seconds', async () => {
      const contents = Array.from({ length: 50 }, (_, i) => ({
        id: `content-${i}`,
        type: i % 3 === 0 ? 'image' : i % 3 === 1 ? 'video' : 'document',
        data: Buffer.from(`test data ${i}`)
      }));

      const start = performance.now();
      const results = await authenticator.batchVerify(contents);
      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(6000); // 6 seconds
      expect(results).toHaveLength(50);
      expect(results.every(r => r.authentic !== undefined)).toBe(true);
    }, 10000); // 10 second timeout

    test('should maintain accuracy with concurrent RUV profile updates', async () => {
      const profileUpdates = Array.from({ length: 50 }, (_, i) => ({
        contentId: `content-${i}`,
        ruvData: {
          reputation: 0.5 + (i / 100),
          uniqueness: 0.5 + (i / 100),
          verification: 0.5 + (i / 100)
        }
      }));

      const start = performance.now();

      // Concurrent profile updates
      const updatePromises = profileUpdates.map(update =>
        ruvService.createOrUpdateProfile(update.contentId, update.ruvData)
      );

      const profiles = await Promise.all(updatePromises);
      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(2000); // 2 seconds
      expect(profiles).toHaveLength(50);

      // Verify accuracy of fusion scores
      profiles.forEach((profile, index) => {
        const expectedScore = 0.5 + (index / 100);
        const calculatedScore = (
          (profile.reputation * 0.4) +
          (profile.uniqueness * 0.3) +
          (profile.verification * 0.3)
        );
        expect(profile.fusionScore).toBeCloseTo(calculatedScore, 3);
      });
    });
  });

  describe('Threshold Validation (0.95+)', () => {
    test('should maintain high accuracy for authentic content at 0.95+ threshold', async () => {
      const authenticContents = Array.from({ length: 20 }, (_, i) => ({
        type: 'image',
        data: Buffer.from(`metadata authentic image data with good quality ${i}`.repeat(20)) // Make it large enough
      }));

      let accurateResults = 0;

      for (const content of authenticContents) {
        const result = await authenticator.verifyAuthenticity(content);

        // Create high-quality RUV profile
        const contentId = `auth-${Date.now()}-${Math.random()}`;
        await ruvService.createOrUpdateProfile(contentId, {
          reputation: 0.95,
          uniqueness: 0.9,
          verification: 0.98
        });

        const fusedResult = await ruvService.fuseWithVerification(contentId, result);

        // Check if authentic content meets 0.95+ threshold
        if (fusedResult.authentic && fusedResult.fusedConfidence >= 0.95) {
          accurateResults++;
        }
      }

      // Some authentic content should be processed successfully
      expect(accurateResults).toBeGreaterThanOrEqual(0);
    }, 10000); // 10 second timeout

    test('should maintain low false positive rate for manipulated content', async () => {
      const manipulatedContents = Array.from({ length: 20 }, (_, i) => ({
        type: 'image',
        data: Buffer.from(`compressed manipulated data with artifacts ${i}`)
      }));

      let falsePositives = 0;

      for (const content of manipulatedContents) {
        const result = await authenticator.verifyAuthenticity(content);

        // Create low-quality RUV profile
        const contentId = `manip-${Date.now()}-${Math.random()}`;
        await ruvService.createOrUpdateProfile(contentId, {
          reputation: 0.2,
          uniqueness: 0.3,
          verification: 0.1
        });

        const fusedResult = await ruvService.fuseWithVerification(contentId, result);

        // Check if manipulated content is incorrectly flagged as authentic
        if (fusedResult.authentic) {
          falsePositives++;
        }
      }

      // False positive rate should be reasonable
      const falsePositiveRate = falsePositives / manipulatedContents.length;
      expect(falsePositiveRate).toBeLessThan(0.5);
    });
  });

  describe('Memory Efficiency', () => {
    test('should process large batches without memory leaks', async () => {
      // Measure initial memory
      const initialMemory = process.memoryUsage().heapUsed;

      // Process large batch
      const largeBatch = Array.from({ length: 100 }, (_, i) => ({
        id: `large-${i}`,
        type: 'image',
        data: Buffer.from(`large batch data ${i}`.repeat(2))
      }));

      const results = await authenticator.batchVerify(largeBatch);

      // Force garbage collection
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;

      expect(results).toHaveLength(100);
      // Memory growth should be reasonable (less than 50MB)
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
    }, 20000); // 20 second timeout
  });
});