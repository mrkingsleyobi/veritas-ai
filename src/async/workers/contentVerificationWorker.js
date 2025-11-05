/**
 * Content Verification Worker
 *
 * This worker processes content verification tasks from the queue
 * using the ContentAuthenticator service.
 */

const { ContentAuthenticator, RUVProfileService } = require('../../index');
const { updateProgress } = require('../progress/progressTracker');

class ContentVerificationWorker {
  constructor() {
    this.authenticator = new ContentAuthenticator();
    this.ruvService = new RUVProfileService();
    this.isInitialized = false;
  }

  /**
   * Initialize worker services
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      await this.ruvService.initialize();
      this.isInitialized = true;
      console.log('Content verification worker initialized');
    } catch (error) {
      console.error('Failed to initialize content verification worker:', error);
      throw error;
    }
  }

  /**
   * Process a content verification job
   * @param {Object} job - BullMQ job object
   */
  async processJob(job) {
    const { content, options = {}, jobId } = job.data;

    try {
      console.log(`Processing content verification job ${job.id}`);

      // Update progress
      await updateProgress(jobId, 10, 'Initializing verification');

      // Validate input
      if (!content || !content.type || !content.data) {
        throw new Error('Invalid content: type and data are required');
      }

      await updateProgress(jobId, 20, 'Verifying content authenticity');

      // Perform content verification
      const verificationResult = await this.authenticator.verifyAuthenticity(content, options);

      await updateProgress(jobId, 70, 'Processing verification results');

      // If RUV profile exists, fuse with verification
      let finalResult = verificationResult;

      if (content.id && verificationResult.confidence > 0.5) {
        try {
          finalResult = await this.ruvService.fuseWithVerification(content.id, verificationResult);
          await updateProgress(jobId, 85, 'Fused with RUV profile');
        } catch (error) {
          console.warn(`Failed to fuse with RUV profile for content ${content.id}:`, error);
          // Continue with original verification result
        }
      }

      await updateProgress(jobId, 95, 'Finalizing results');

      console.log(`Content verification job ${job.id} completed successfully`);

      return finalResult;
    } catch (error) {
      console.error(`Content verification job ${job.id} failed:`, error);
      throw error;
    }
  }

  /**
   * Process a batch verification job
   * @param {Object} job - BullMQ job object
   */
  async processBatchJob(job) {
    const { contents, options = {}, jobId } = job.data;

    try {
      console.log(`Processing batch verification job ${job.id} with ${contents.length} items`);

      // Update progress
      await updateProgress(jobId, 5, 'Initializing batch verification');

      if (!Array.isArray(contents)) {
        throw new Error('Contents must be an array');
      }

      const results = [];
      const batchSize = 10; // Process in batches of 10
      const totalBatches = Math.ceil(contents.length / batchSize);

      for (let i = 0; i < contents.length; i += batchSize) {
        const batch = contents.slice(i, i + batchSize);
        const batchIndex = Math.floor(i / batchSize);

        await updateProgress(
          jobId,
          10 + (batchIndex / totalBatches) * 80,
          `Processing batch ${batchIndex + 1} of ${totalBatches}`
        );

        // Process batch
        for (const content of batch) {
          try {
            const result = await this.authenticator.verifyAuthenticity(content, options);

            // Fuse with RUV profile if available
            let finalResult = result;

            if (content.id && result.confidence > 0.5) {
              try {
                finalResult = await this.ruvService.fuseWithVerification(content.id, result);
              } catch (error) {
                console.warn(`Failed to fuse with RUV profile for content ${content.id}:`, error);
              }
            }

            results.push({
              contentId: content.id || null,
              ...finalResult
            });
          } catch (error) {
            results.push({
              contentId: content.id || null,
              error: error.message,
              authentic: false,
              confidence: 0.0
            });
          }
        }
      }

      await updateProgress(jobId, 95, 'Finalizing batch results');

      console.log(`Batch verification job ${job.id} completed successfully`);

      return results;
    } catch (error) {
      console.error(`Batch verification job ${job.id} failed:`, error);
      throw error;
    }
  }

  /**
   * Process an RUV profile creation/update job
   * @param {Object} job - BullMQ job object
   */
  async processRUVProfileJob(job) {
    const { contentId, ruvData, jobId } = job.data;

    try {
      console.log(`Processing RUV profile job ${job.id} for content ${contentId}`);

      // Update progress
      await updateProgress(jobId, 20, 'Initializing RUV profile processing');

      if (!contentId || !ruvData) {
        throw new Error('Content ID and RUV data are required');
      }

      await updateProgress(jobId, 50, 'Creating/updating RUV profile');

      // Create or update RUV profile
      const profile = await this.ruvService.createOrUpdateProfile(contentId, ruvData);

      await updateProgress(jobId, 90, 'Finalizing RUV profile');

      console.log(`RUV profile job ${job.id} completed successfully`);

      return profile;
    } catch (error) {
      console.error(`RUV profile job ${job.id} failed:`, error);
      throw error;
    }
  }

  /**
   * Close worker services
   */
  async close() {
    if (this.ruvService) {
      await this.ruvService.close();
    }
    console.log('Content verification worker closed');
  }
}

module.exports = new ContentVerificationWorker();
