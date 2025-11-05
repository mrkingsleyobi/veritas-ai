/**
 * Data Persistence Service Tests
 *
 * Tests for the data persistence service with PostgreSQL and Redis integration
 */

const DataPersistenceService = require('../../src/services/DataPersistenceService');
const RUVProfile = require('../../src/models/RUVProfile');
const VerificationResult = require('../../src/models/VerificationResult');

describe('DataPersistenceService', () => {
  let persistenceService;

  beforeAll(async () => {
    // Initialize the service
    persistenceService = new DataPersistenceService();
    await persistenceService.initialize();
  });

  afterAll(async () => {
    // Clean up
    if (persistenceService) {
      await persistenceService.close();
    }
  });

  describe('RUV Profile Operations', () => {
    const testContentId = 'test-content-123';
    let testProfile;

    beforeEach(() => {
      testProfile = new RUVProfile({
        contentId: testContentId,
        reputation: 0.8,
        uniqueness: 0.7,
        verification: 0.9,
        fusionScore: 0.8,
        history: [
          {
            timestamp: new Date().toISOString(),
            reputation: 0.7,
            uniqueness: 0.6,
            verification: 0.8
          }
        ]
      });
    });

    test('should save and retrieve RUV profile', async () => {
      // Save profile
      await persistenceService.saveRUVProfile(testProfile);

      // Retrieve profile
      const retrievedProfile = await persistenceService.getRUVProfile(testContentId);

      expect(retrievedProfile).toBeDefined();
      expect(retrievedProfile.contentId).toBe(testContentId);
      expect(retrievedProfile.reputation).toBeCloseTo(0.8);
      expect(retrievedProfile.uniqueness).toBeCloseTo(0.7);
      expect(retrievedProfile.verification).toBeCloseTo(0.9);
      expect(retrievedProfile.fusionScore).toBeCloseTo(0.8);
      expect(retrievedProfile.history).toHaveLength(1);
    });

    test('should update existing RUV profile', async () => {
      const updatedProfile = new RUVProfile({
        ...testProfile,
        reputation: 0.85,
        uniqueness: 0.75
      });

      // Update profile
      await persistenceService.saveRUVProfile(updatedProfile);

      // Retrieve updated profile
      const retrievedProfile = await persistenceService.getRUVProfile(testContentId);

      expect(retrievedProfile.reputation).toBeCloseTo(0.85);
      expect(retrievedProfile.uniqueness).toBeCloseTo(0.75);
    });

    test('should delete RUV profile', async () => {
      // Delete profile
      await persistenceService.deleteRUVProfile(testContentId);

      // Try to retrieve deleted profile
      const retrievedProfile = await persistenceService.getRUVProfile(testContentId);

      expect(retrievedProfile).toBeNull();
    });
  });

  describe('Verification Result Operations', () => {
    let testResultId;
    const testContentId = 'test-content-456';
    let testResult;

    beforeEach(() => {
      testResult = new VerificationResult({
        contentId: testContentId,
        authentic: true,
        confidence: 0.95,
        details: {
          method: 'test_analysis',
          fileSize: 1024
        },
        metadata: {
          timestamp: new Date().toISOString(),
          contentLength: 1024
        }
      });
    });

    test('should create and retrieve verification result', async () => {
      // Create result
      const createdResult = await persistenceService.createVerificationResult(testResult);
      testResultId = createdResult.id;

      expect(createdResult.id).toBeDefined();
      expect(createdResult.contentId).toBe(testContentId);
      expect(createdResult.authentic).toBe(true);
      expect(createdResult.confidence).toBeCloseTo(0.95);

      // Retrieve result
      const retrievedResult = await persistenceService.getVerificationResult(testResultId);

      expect(retrievedResult).toBeDefined();
      expect(retrievedResult.id).toBe(testResultId);
      expect(retrievedResult.contentId).toBe(testContentId);
      expect(retrievedResult.authentic).toBe(true);
      expect(retrievedResult.confidence).toBeCloseTo(0.95);
    });

    test('should retrieve verification results by content ID', async () => {
      // Create a result first to ensure we have data
      const createdResult = await persistenceService.createVerificationResult(testResult);

      // Get results by content ID
      const results = await persistenceService.getVerificationResultsByContentId(testContentId);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].contentId).toBe(testContentId);
    });

    test('should update verification result', async () => {
      // Create result first
      const createdResult = await persistenceService.createVerificationResult(testResult);
      testResultId = createdResult.id;

      const updatedResult = new VerificationResult({
        id: testResultId,
        contentId: testContentId,
        authentic: false,
        confidence: 0.3,
        details: {
          method: 'test_analysis',
          fileSize: 1024
        },
        metadata: {
          timestamp: new Date().toISOString(),
          contentLength: 1024
        }
      });

      // Update result
      await persistenceService.updateVerificationResult(updatedResult);

      // Retrieve updated result
      const retrievedResult = await persistenceService.getVerificationResult(testResultId);

      expect(retrievedResult.authentic).toBe(false);
      expect(retrievedResult.confidence).toBeCloseTo(0.3);
    });

    test('should delete verification result', async () => {
      // Delete result
      await persistenceService.deleteVerificationResult(testResultId);

      // Try to retrieve deleted result
      const retrievedResult = await persistenceService.getVerificationResult(testResultId);

      expect(retrievedResult).toBeNull();
    });
  });

  describe('Cache Operations', () => {
    test('should get cache statistics', async () => {
      const stats = await persistenceService.getCacheStats();

      expect(stats).toBeDefined();
      expect(stats.info).toBeDefined();
      expect(stats.memory).toBeDefined();
      expect(stats.stats).toBeDefined();
    });
  });

  describe('Database Health', () => {
    test('should get database health status', async () => {
      const health = await persistenceService.getDatabaseHealth();

      expect(health).toBeDefined();
      expect(health.postgres).toBeDefined();
      expect(health.redis).toBeDefined();
      expect(health.postgres.status).toBe('healthy');
      expect(health.redis.status).toBe('healthy');
    });
  });

  describe('Access Statistics', () => {
    test('should get access statistics', async () => {
      const stats = await persistenceService.getAccessStatistics();

      expect(stats).toBeDefined();
      expect(stats.profiles).toBeDefined();
      expect(stats.compression).toBeDefined();
      expect(stats.verification).toBeDefined();
    });
  });
});