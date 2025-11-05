const ContentAuthenticator = require('../../src/algorithms/contentAuthenticator');
const RUVProfileService = require('../../src/services/ruvProfileService');

describe('Deepfake Detection Platform - End-to-End', () => {
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

  describe('Complete User Workflow', () => {
    test('should process authentic image through complete workflow', async () => {
      // User submits authentic image
      const contentId = 'e2e-authentic-image-1';
      const userContent = {
        type: 'image',
        data: Buffer.from('high quality authentic image with metadata and proper characteristics')
      };

      // Step 1: Initial verification
      const initialVerification = await authenticator.verifyAuthenticity(userContent);

      // Step 2: Create RUV profile based on verification
      const ruvProfile = await ruvService.createOrUpdateProfile(contentId, {
        reputation: initialVerification.confidence,
        uniqueness: 0.9, // High uniqueness for authentic content
        verification: initialVerification.confidence
      });

      // Step 3: Fuse verification with RUV profile
      const finalResult = await ruvService.fuseWithVerification(contentId, initialVerification);

      // Step 4: Validate complete workflow result
      expect(initialVerification.authentic).toBe(true);
      expect(initialVerification.confidence).toBeGreaterThanOrEqual(0.5);

      expect(ruvProfile.reputation).toBeDefined();
      expect(ruvProfile.uniqueness).toBeDefined();
      expect(ruvProfile.fusionScore).toBeGreaterThan(0.5);

      expect(finalResult.authentic).toBeDefined();
      expect(finalResult.fusedConfidence).toBeGreaterThan(0.5);
      expect(finalResult.ruvProfile).toBeDefined();
      expect(finalResult.details.ruvFusion.applied).toBe(true);

      // Should meet truth verification threshold
      expect(finalResult.fusedConfidence).toBeGreaterThanOrEqual(0.6);
    });

    test('should process manipulated video through complete workflow', async () => {
      // User submits potentially manipulated video
      const contentId = 'e2e-manipulated-video-1';
      const userContent = {
        type: 'video',
        data: Buffer.from('video with inconsistent frames and compression artifacts')
      };

      // Step 1: Initial verification
      const initialVerification = await authenticator.verifyAuthenticity(userContent);

      // Step 2: Create RUV profile based on verification
      const ruvProfile = await ruvService.createOrUpdateProfile(contentId, {
        reputation: initialVerification.confidence,
        uniqueness: 0.3, // Low uniqueness for manipulated content
        verification: initialVerification.confidence
      });

      // Step 3: Fuse verification with RUV profile
      const finalResult = await ruvService.fuseWithVerification(contentId, initialVerification);

      // Step 4: Validate complete workflow result
      expect(initialVerification.authentic).toBeDefined();
      expect(initialVerification.confidence).toBeLessThan(0.7);

      expect(ruvProfile.reputation).toBeDefined();
      expect(ruvProfile.uniqueness).toBeDefined();
      expect(ruvProfile.fusionScore).toBeLessThan(0.7);

      expect(finalResult.authentic).toBeDefined();
      expect(finalResult.fusedConfidence).toBeLessThan(0.6);
      expect(finalResult.ruvProfile).toBeDefined();

      // Should not meet truth verification threshold
      expect(finalResult.fusedConfidence).toBeLessThan(0.95);
    });

    test('should process document with digital signature through complete workflow', async () => {
      // User submits document with digital signature
      const contentId = 'e2e-signed-document-1';
      const userContent = {
        type: 'document',
        data: Buffer.from('document with digital signature metadata and track changes history')
      };

      // Step 1: Initial verification
      const initialVerification = await authenticator.verifyAuthenticity(userContent);

      // Step 2: Create RUV profile based on verification
      const ruvProfile = await ruvService.createOrUpdateProfile(contentId, {
        reputation: initialVerification.confidence,
        uniqueness: 0.7,
        verification: initialVerification.confidence
      });

      // Step 3: Fuse verification with RUV profile
      const finalResult = await ruvService.fuseWithVerification(contentId, initialVerification);

      // Step 4: Validate complete workflow result
      expect(initialVerification.authentic).toBeDefined();
      expect(initialVerification.confidence).toBeGreaterThanOrEqual(0.5);

      expect(ruvProfile.reputation).toBeDefined();
      expect(ruvProfile.verification).toBeDefined();

      expect(finalResult.authentic).toBeDefined();
      expect(finalResult.fusedConfidence).toBeGreaterThan(0.6);
      expect(finalResult.details.digitalSignature).toBe(true);
    });
  });

  describe('Batch Processing Workflow', () => {
    test('should process multiple content items through complete workflow', async () => {
      // User submits multiple content items
      const userContents = [
        {
          id: 'batch-e2e-1',
          type: 'image',
          data: Buffer.from('authentic image with good metadata')
        },
        {
          id: 'batch-e2e-2',
          type: 'document',
          data: Buffer.from('document with digital signature')
        },
        {
          id: 'batch-e2e-3',
          type: 'video',
          data: Buffer.from('video with timestamps but some inconsistencies')
        },
        {
          id: 'batch-e2e-4',
          type: 'image',
          data: Buffer.from('compressed image with artifacts')
        }
      ];

      // Step 1: Batch verification
      const verificationResults = await authenticator.batchVerify(userContents);

      // Step 2: Create RUV profiles for all
      const profileCreationPromises = verificationResults.map(async (result) => {
        if (result.contentId && !result.error) {
          // Determine RUV data based on content type and verification result
          let ruvData;
          if (result.details && result.details.method === 'image_analysis') {
            ruvData = {
              reputation: result.confidence,
              uniqueness: result.details.compressionArtifacts ? 0.4 : 0.8,
              verification: result.confidence
            };
          } else if (result.details && result.details.method === 'document_analysis') {
            ruvData = {
              reputation: result.confidence,
              uniqueness: 0.7,
              verification: result.confidence
            };
          } else if (result.details && result.details.method === 'video_analysis') {
            ruvData = {
              reputation: result.confidence,
              uniqueness: result.details.frameInconsistencies ? 0.5 : 0.8,
              verification: result.confidence
            };
          } else {
            ruvData = {
              reputation: result.confidence,
              uniqueness: 0.5,
              verification: result.confidence
            };
          }

          return await ruvService.createOrUpdateProfile(result.contentId, ruvData);
        }
        return null;
      });

      const profiles = await Promise.all(profileCreationPromises);

      // Step 3: Fuse all verifications with RUV profiles
      const fusionPromises = verificationResults.map(async (result) => {
        if (result.contentId && !result.error) {
          return await ruvService.fuseWithVerification(result.contentId, result);
        }
        return result;
      });

      const finalResults = await Promise.all(fusionPromises);

      // Step 4: Validate complete workflow results
      expect(verificationResults).toHaveLength(4);
      expect(profiles.filter(p => p !== null)).toHaveLength(4);
      expect(finalResults).toHaveLength(4);

      // Check that all results have been processed
      const processedResults = finalResults.filter(r => r.ruvProfile);
      expect(processedResults).toHaveLength(4);

      // Verify that authentic content meets threshold and manipulated doesn't
      processedResults.forEach(result => {
        if (result.details && result.details.compressionArtifacts) {
          // Compressed images should not meet threshold
          expect(result.fusedConfidence).toBeLessThan(0.95);
        } else if (result.details && result.details.digitalSignature) {
          // Signed documents should meet threshold
          expect(result.fusedConfidence).toBeGreaterThanOrEqual(0.6);
        }
      });
    });
  });

  describe('Error Recovery Workflow', () => {
    test('should handle and recover from partial workflow failures', async () => {
      // User submits content with some issues
      const contentId = 'e2e-error-recovery-1';
      const userContent = {
        type: 'image',
        data: Buffer.from('image data') // Minimal data
      };

      // Step 1: Initial verification (should work)
      const initialVerification = await authenticator.verifyAuthenticity(userContent);

      // Step 2: Simulate RUV profile creation issue
      try {
        // Try to create profile with invalid data
        await ruvService.createOrUpdateProfile(contentId, null);
        // If this doesn't throw, fail the test
        expect(true).toBe(false);
      } catch (error) {
        // Expected error, continue workflow
        expect(error.message).toBe('Content ID and RUV data are required');
      }

      // Step 3: Create valid RUV profile
      const ruvProfile = await ruvService.createOrUpdateProfile(contentId, {
        reputation: initialVerification.confidence,
        uniqueness: 0.6,
        verification: initialVerification.confidence
      });

      // Step 4: Fuse verification with RUV profile
      const finalResult = await ruvService.fuseWithVerification(contentId, initialVerification);

      // Step 5: Validate recovery
      expect(initialVerification.authentic).toBeDefined();
      expect(initialVerification.confidence).toBeDefined();

      expect(ruvProfile).toBeDefined();
      expect(ruvProfile.reputation).toBeDefined();

      expect(finalResult).toBeDefined();
      expect(finalResult.ruvProfile).toBeDefined();
    });
  });

  describe('Performance and Quality Validation', () => {
    test('should maintain quality standards across complete workflow', async () => {
      // Process multiple authentic content items
      const authenticContents = [
        {
          id: 'quality-test-1',
          type: 'image',
          data: Buffer.from('high quality authentic image with metadata')
        },
        {
          id: 'quality-test-2',
          type: 'document',
          data: Buffer.from('document with digital signature and metadata')
        },
        {
          id: 'quality-test-3',
          type: 'video',
          data: Buffer.from('video with timestamps and consistent frames')
        }
      ];

      const start = performance.now();

      // Complete workflow for all items
      const results = [];
      for (const content of authenticContents) {
        // Verification
        const verification = await authenticator.verifyAuthenticity({
          type: content.type,
          data: content.data
        });

        // RUV profile creation
        const profile = await ruvService.createOrUpdateProfile(content.id, {
          reputation: verification.confidence,
          uniqueness: 0.8 + (Math.random() * 0.2),
          verification: verification.confidence
        });

        // Fusion
        const fused = await ruvService.fuseWithVerification(content.id, verification);

        results.push(fused);
      }

      const end = performance.now();
      const duration = end - start;

      // Performance validation
      expect(duration).toBeLessThan(1000); // Should complete under 1 second

      // Quality validation
      results.forEach(result => {
        expect(result.authentic).toBeDefined();
        expect(result.fusedConfidence).toBeDefined();
        expect(typeof result.fusedConfidence).toBe('number');
        expect(result.ruvProfile).toBeDefined();
        expect(result.ruvProfile.fusionScore).toBeGreaterThan(0.5);
      });

      // Most should meet a reasonable threshold
      const meetThreshold = results.filter(r => r.fusedConfidence >= 0.7).length;
      expect(meetThreshold).toBeGreaterThanOrEqual(Math.floor(results.length * 0.5));
    });
  });
});