/**
 * Deepfake Detection Platform - Main Entry Point
 *
 * This is the main entry point for the deepfake detection platform,
 * integrating content authenticity verification with RUV profile fusion.
 */

const ContentAuthenticator = require('./algorithms/contentAuthenticator');
const RUVProfileService = require('./services/ruvProfileService');
const DataPersistenceService = require('./services/DataPersistenceService');

// Initialize services
const authenticator = new ContentAuthenticator();
const ruvService = new RUVProfileService();
const persistenceService = new DataPersistenceService();

// Export services for use in tests and other modules
module.exports = {
  ContentAuthenticator,
  RUVProfileService,
  DataPersistenceService,
  authenticator,
  ruvService,
  persistenceService
};

// Simple server startup (for demonstration)
if (require.main === module) {
  console.log('Deepfake Detection Platform initialized');
  console.log('Services ready for content authenticity verification');

  // Example usage
  const exampleContent = {
    type: 'image',
    data: Buffer.from('example image data')
  };

  authenticator.verifyAuthenticity(exampleContent)
    .then(result => {
      console.log('Example verification result:', result);
    })
    .catch(error => {
      console.error('Verification error:', error.message);
    });
}
