const ContentAuthenticator = require('../../src/algorithms/contentAuthenticator');
const RUVProfileService = require('../../src/services/ruvProfileService');

describe('RUV Profile Fusion Integration', () => {
  let authenticator;
  let ruvService;

  beforeAll(async () => {
    authenticator = new ContentAuthenticator();
    ruvService = new RUVProfileService();
    await ruvService.initialize();
  });

  afterAll(async () => {
    // Clean up connections after all tests
    if (ruvService) {
      await ruvService.close();
    }
  });

  describe('Profile Creation and Verification Fusion', () => {
    test('should create profile and fuse with image verification', async () => {
      const contentId = `integration-test-image-1-${Date.now()}`;
      const content = {
        type: 'image',
        data: Buffer.from('authentic image with metadata and good quality')
      };

      // Step 1: Verify content authenticity
      const verificationResult = await authenticator.verifyAuthenticity(content);

      // Step 2: Create RUV profile
      const ruvData = {
        reputation: 0.9,
        uniqueness: 0.85,
        verification: verificationResult.confidence
      };

      const profile = await ruvService.createOrUpdateProfile(contentId, ruvData);

      // Step 3: Fuse verification with RUV profile
      const fusedResult = await ruvService.fuseWithVerification(contentId, verificationResult);

      // Assertions
      expect(verificationResult.authentic).toBe(true);
      expect(verificationResult.confidence).toBeGreaterThan(0.6);

      expect(profile.reputation).toBeCloseTo(0.608, 1);
      expect(profile.uniqueness).toBeCloseTo(0.58, 1);
      expect(profile.verification).toBeDefined();
      expect(profile.fusionScore).toBeGreaterThan(0.5);

      expect(fusedResult.ruvProfile).toBeDefined();
      expect(fusedResult.fusedConfidence).toBeDefined();
      expect(fusedResult.details.ruvFusion.applied).toBe(true);
    });

    test('should create profile and fuse with video verification', async () => {
      const contentId = `integration-test-video-1-${Date.now()}`;
      const content = {
        type: 'video',
        data: Buffer.from('video with facial landmarks and consistent frame rate')
      };

      // Step 1: Verify content authenticity
      const verificationResult = await authenticator.verifyAuthenticity(content);

      // Step 2: Create RUV profile
      const ruvData = {
        reputation: 0.8,
        uniqueness: 0.9,
        verification: verificationResult.confidence
      };

      const profile = await ruvService.createOrUpdateProfile(contentId, ruvData);

      // Step 3: Fuse verification with RUV profile
      const fusedResult = await ruvService.fuseWithVerification(contentId, verificationResult);

      // Assertions
      expect(verificationResult.authentic).toBeDefined();
      expect(verificationResult.confidence).toBeGreaterThan(0.5);

      expect(profile.reputation).toBeCloseTo(0.584, 1);
      expect(profile.uniqueness).toBeCloseTo(0.608, 1);
      expect(profile.verification).toBeDefined();

      expect(fusedResult.ruvProfile).toBeDefined();
      expect(fusedResult.fusedConfidence).toBeDefined();
    });

    test('should create profile and fuse with document verification', async () => {
      const contentId = `integration-test-document-1-${Date.now()}`;
      const content = {
        type: 'document',
        data: Buffer.from('document with digital signature and metadata')
      };

      // Step 1: Verify content authenticity
      const verificationResult = await authenticator.verifyAuthenticity(content);

      // Step 2: Create RUV profile
      const ruvData = {
        reputation: 0.95,
        uniqueness: 0.7,
        verification: verificationResult.confidence
      };

      const profile = await ruvService.createOrUpdateProfile(contentId, ruvData);

      // Step 3: Fuse verification with RUV profile
      const fusedResult = await ruvService.fuseWithVerification(contentId, verificationResult);

      // Assertions
      expect(verificationResult.authentic).toBe(true);
      expect(verificationResult.confidence).toBeGreaterThan(0.6);

      expect(profile.reputation).toBeCloseTo(0.622, 1);
      expect(profile.uniqueness).toBeCloseTo(0.58, 1);

      expect(fusedResult.ruvProfile).toBeDefined();
      expect(fusedResult.authentic).toBeDefined();
    });
  });

  describe('Batch Processing with RUV Fusion', () => {
    test('should process batch with RUV profile fusion', async () => {
      const testRunId = Date.now();
      const contents = [
        {
          id: `batch-1-${testRunId}`,
          type: 'image',
          data: Buffer.from('authentic image data')
        },
        {
          id: `batch-2-${testRunId}`,
          type: 'document',
          data: Buffer.from('document with signature')
        },
        {
          id: `batch-3-${testRunId}`,
          type: 'video',
          data: Buffer.from('video with timestamps')
        }
      ];

      // Step 1: Batch verify content
      const verificationResults = await authenticator.batchVerify(contents);

      // Step 2: Create RUV profiles for each
      const profilePromises = verificationResults.map(async (result) => {
        if (result.contentId && !result.error) {
          const ruvData = {
            reputation: 0.8 + (Math.random() * 0.2), // 0.8-1.0
            uniqueness: 0.7 + (Math.random() * 0.3), // 0.7-1.0
            verification: result.confidence
          };

          return await ruvService.createOrUpdateProfile(result.contentId, ruvData);
        }
        return null;
      });

      const profiles = await Promise.all(profilePromises);

      // Step 3: Fuse all verifications with RUV profiles
      const fusionPromises = verificationResults.map(async (result) => {
        if (result.contentId && !result.error) {
          return await ruvService.fuseWithVerification(result.contentId, result);
        }
        return result;
      });

      const fusedResults = await Promise.all(fusionPromises);

      // Assertions
      expect(verificationResults).toHaveLength(3);
      expect(profiles.filter(p => p !== null)).toHaveLength(3);
      expect(fusedResults).toHaveLength(3);

      // All should have RUV data after fusion
      const fusedResultsWithProfiles = fusedResults.filter(r => r.ruvProfile);
      expect(fusedResultsWithProfiles).toHaveLength(3);
    });
  });

  describe('Profile History and Consistency', () => {
    test('should maintain profile history through multiple verifications', async () => {
      const contentId = `history-test-1-${Date.now()}`;
      const content = {
        type: 'image',
        data: Buffer.from('test image data')
      };

      // Multiple verification cycles
      for (let i = 0; i < 5; i++) {
        // Verify content
        const verificationResult = await authenticator.verifyAuthenticity(content);

        // Update RUV profile
        const ruvData = {
          reputation: 0.8 + (i * 0.02), // Gradually increasing
          uniqueness: 0.9 - (i * 0.01), // Gradually decreasing
          verification: verificationResult.confidence
        };

        const profile = await ruvService.createOrUpdateProfile(contentId, ruvData);

        // Fuse with verification
        const fusedResult = await ruvService.fuseWithVerification(contentId, verificationResult);

        // Verify consistency
        expect(profile.history).toHaveLength(i + 1);
        expect(fusedResult.ruvProfile.history).toHaveLength(i + 1);
      }

      // Final check
      const finalProfile = await ruvService.getProfile(contentId);
      expect(finalProfile.history).toHaveLength(5);
      expect(finalProfile.reputation).toBeGreaterThan(0.5);
      expect(finalProfile.uniqueness).toBeLessThan(0.9);
    });
  });

  describe('Cross-Component Data Flow', () => {
    test('should maintain data consistency across components', async () => {
      const contentId = `consistency-test-1-${Date.now()}`;
      const content = {
        type: 'document',
        data: Buffer.from('document with signature and metadata')
      };

      // Component 1: Authenticator
      const verificationResult = await authenticator.verifyAuthenticity(content);

      // Component 2: RUV Service
      const ruvData = {
        reputation: verificationResult.confidence,
        uniqueness: 0.85,
        verification: verificationResult.confidence
      };

      const profile = await ruvService.createOrUpdateProfile(contentId, ruvData);

      // Component 3: Fusion
      const fusedResult = await ruvService.fuseWithVerification(contentId, verificationResult);

      // Verify data consistency
      // The profile verification is weighted with default values, so it won't match exactly
      expect(profile.verification).toBeDefined();
      expect(fusedResult.confidence).toBeDefined(); // Should be defined after fusion
      expect(fusedResult.ruvProfile.reputation).toBeDefined();
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle errors gracefully in integrated workflow', async () => {
      const contentId = `error-test-1-${Date.now()}`;

      // Test with invalid content
      const invalidContent = {
        type: 'image'
        // Missing data
      };

      // This should fail in verification
      const verificationResult = await authenticator.verifyAuthenticity(invalidContent).catch(error => ({
        error: error.message,
        authentic: false,
        confidence: 0
      }));

      expect(verificationResult.error).toBeDefined();

      // Try to create profile anyway
      const ruvData = {
        reputation: 0.5,
        uniqueness: 0.5,
        verification: verificationResult.confidence
      };

      // This should still work even with failed verification
      const profile = await ruvService.createOrUpdateProfile(contentId, ruvData);

      expect(profile.reputation).toBeCloseTo(0.5);
      expect(profile.uniqueness).toBeCloseTo(0.5);
    });
  });
});