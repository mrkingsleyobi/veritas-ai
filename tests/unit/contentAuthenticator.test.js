const ContentAuthenticator = require('../../src/algorithms/contentAuthenticator');

describe('ContentAuthenticator', () => {
  let authenticator;

  beforeEach(() => {
    authenticator = new ContentAuthenticator();
  });

  describe('verifyAuthenticity', () => {
    test('should validate input and throw error for missing data', async () => {
      await expect(authenticator.verifyAuthenticity({}))
        .rejects.toThrow('Invalid content: type and data are required');

      await expect(authenticator.verifyAuthenticity({ type: 'image' }))
        .rejects.toThrow('Invalid content: type and data are required');

      await expect(authenticator.verifyAuthenticity({ data: 'test' }))
        .rejects.toThrow('Invalid content: type and data are required');
    });

    test('should verify image authenticity with advanced analysis', async () => {
      const content = {
        type: 'image',
        data: Buffer.from('test image data with jpeg compression artifacts')
      };

      const result = await authenticator.verifyAuthenticity(content);

      expect(result).toHaveProperty('authentic');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('details');
      expect(result).toHaveProperty('metadata');
      expect(result.details.method).toBe('advanced_image_analysis');
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);

      // Check for new detailed analysis properties
      expect(result.details).toHaveProperty('elaScore');
      expect(result.details).toHaveProperty('metadataIntegrity');
      expect(result.details).toHaveProperty('compressionArtifacts');
      expect(result.details).toHaveProperty('noiseAnalysis');
      expect(result.details).toHaveProperty('edgeInconsistencies');
    });

    test('should verify video authenticity with facial landmark analysis', async () => {
      const content = {
        type: 'video',
        data: Buffer.from('test video data with facial landmarks and consistent frame rate')
      };

      const result = await authenticator.verifyAuthenticity(content);

      expect(result).toHaveProperty('authentic');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('details');
      expect(result).toHaveProperty('metadata');
      expect(result.details.method).toBe('advanced_video_analysis');
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);

      // Check for new detailed analysis properties
      expect(result.details).toHaveProperty('facialLandmarkConsistency');
      expect(result.details).toHaveProperty('frameRateConsistency');
      expect(result.details).toHaveProperty('metadataIntegrity');
      expect(result.details).toHaveProperty('compressionArtifacts');
      expect(result.details).toHaveProperty('temporalInconsistencies');
    });

    test('should verify document authenticity with digital signature', async () => {
      const content = {
        type: 'document',
        data: Buffer.from('document with signature and metadata')
      };

      const result = await authenticator.verifyAuthenticity(content);

      expect(result.authentic).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.details.method).toBe('document_analysis');
      expect(result.details.digitalSignature).toBe(true);
    });

    test('should handle unknown content types with generic verification', async () => {
      const content = {
        type: 'unknown',
        data: Buffer.from('large amount of data making it likely authentic')
      };

      const result = await authenticator.verifyAuthenticity(content);

      expect(result).toHaveProperty('authentic');
      expect(result).toHaveProperty('confidence');
      expect(result.details.method).toBe('generic_analysis');
    });

    test('should include metadata in results', async () => {
      const content = {
        type: 'image',
        data: Buffer.from('test image data')
      };

      const result = await authenticator.verifyAuthenticity(content);

      expect(result.metadata).toHaveProperty('timestamp');
      expect(result.metadata).toHaveProperty('contentLength');
      expect(typeof result.metadata.timestamp).toBe('string');
      expect(result.metadata.contentLength).toBeGreaterThan(0);
    });
  });

  describe('batchVerify', () => {
    test('should validate input and throw error for non-array', async () => {
      await expect(authenticator.batchVerify({}))
        .rejects.toThrow('Contents must be an array');
    });

    test('should verify multiple content items', async () => {
      const contents = [
        { id: '1', type: 'image', data: Buffer.from('authentic image with metadata') },
        { id: '2', type: 'document', data: Buffer.from('document with signature') },
        { id: '3', type: 'video', data: Buffer.from('video with facial landmarks') }
      ];

      const results = await authenticator.batchVerify(contents);

      expect(results).toHaveLength(3);
      expect(results[0].contentId).toBe('1');
      expect(results[1].contentId).toBe('2');
      expect(results[2].contentId).toBe('3');

      // All should be authentic with proper confidence
      results.forEach(result => {
        expect(result).toHaveProperty('authentic');
        expect(result).toHaveProperty('confidence');
      });

      // Check that each has the appropriate analysis method
      expect(results[0].details.method).toBe('advanced_image_analysis');
      expect(results[1].details.method).toBe('document_analysis');
      expect(results[2].details.method).toBe('advanced_video_analysis');
    });

    test('should handle errors in batch verification', async () => {
      const contents = [
        { id: '1', type: 'image', data: Buffer.from('good image') },
        { id: '2', type: 'invalid' }, // Missing data
        { id: '3', type: 'document', data: Buffer.from('document with signature') }
      ];

      const results = await authenticator.batchVerify(contents);

      expect(results).toHaveLength(3);
      expect(results[0].authentic).toBeDefined(); // Valid content
      expect(results[1].error).toBeDefined(); // Invalid content
      expect(results[1].authentic).toBe(false); // Error case
      expect(results[2].authentic).toBeDefined(); // Valid content
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty content data', async () => {
      const content = {
        type: 'image',
        data: Buffer.from('')
      };

      const result = await authenticator.verifyAuthenticity(content);

      expect(result.authentic).toBeDefined();
      expect(typeof result.authentic).toBe('boolean');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    test('should handle very large content data', async () => {
      const largeData = Buffer.alloc(50000, 'a'); // 50KB of data
      const content = {
        type: 'unknown',
        data: largeData
      };

      const result = await authenticator.verifyAuthenticity(content);

      expect(result.authentic).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    test('should handle null and undefined gracefully', async () => {
      await expect(authenticator.verifyAuthenticity(null))
        .rejects.toThrow('Invalid content: type and data are required');

      await expect(authenticator.verifyAuthenticity(undefined))
        .rejects.toThrow('Invalid content: type and data are required');
    });
  });

  describe('Advanced Deepfake Detection Features', () => {
    test('should perform Error Level Analysis (ELA) for images', async () => {
      const content = {
        type: 'image',
        data: Buffer.from('image data with quality=85 and resaved indicators')
      };

      const result = await authenticator.verifyAuthenticity(content);

      expect(result.details.method).toBe('advanced_image_analysis');
      expect(result.details).toHaveProperty('elaScore');
      expect(typeof result.details.elaScore).toBe('number');
    });

    test('should analyze metadata integrity', async () => {
      const content = {
        type: 'image',
        data: Buffer.from('image with Exif and IPTC metadata tags')
      };

      const result = await authenticator.verifyAuthenticity(content);

      expect(result.details).toHaveProperty('metadataIntegrity');
      expect(typeof result.details.metadataIntegrity).toBe('number');
    });

    test('should detect compression artifacts', async () => {
      const content = {
        type: 'image',
        data: Buffer.from('image with jpeg blocky and mosaic artifacts')
      };

      const result = await authenticator.verifyAuthenticity(content);

      expect(result.details).toHaveProperty('compressionArtifacts');
      expect(typeof result.details.compressionArtifacts).toBe('number');
    });

    test('should analyze facial landmark consistency for videos', async () => {
      const content = {
        type: 'video',
        data: Buffer.from('video with facial landmarks and consistent tracking')
      };

      const result = await authenticator.verifyAuthenticity(content);

      expect(result.details.method).toBe('advanced_video_analysis');
      expect(result.details).toHaveProperty('facialLandmarkConsistency');
      expect(typeof result.details.facialLandmarkConsistency).toBe('number');
    });

    test('should analyze frame rate consistency', async () => {
      const content = {
        type: 'video',
        data: Buffer.from('video with 30fps constant frame rate')
      };

      const result = await authenticator.verifyAuthenticity(content);

      expect(result.details).toHaveProperty('frameRateConsistency');
      expect(typeof result.details.frameRateConsistency).toBe('number');
    });
  });
});