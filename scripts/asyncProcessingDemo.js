/**
 * Async Processing Demo
 *
 * Demonstration of how to use the async processing system.
 */

const asyncProcessingService = require('../src/async/asyncProcessingService');

async function demo() {
  console.log('Async Processing System Demo');
  console.log('============================');

  try {
    // Initialize the async processing service
    console.log('Initializing async processing service...');
    await asyncProcessingService.initialize();
    console.log('Async processing service initialized successfully!');

    // Example content to verify
    const exampleContent = {
      id: 'demo-content-123',
      type: 'image',
      data: 'This is example image data for demonstration purposes',
      metadata: {
        filename: 'demo.jpg',
        size: 102400,
        createdAt: new Date().toISOString()
      }
    };

    // Example RUV data
    const exampleRUVData = {
      reputation: 0.85,
      uniqueness: 0.92,
      verification: 0.78
    };

    // Submit a content verification job
    console.log('\n1. Submitting content verification job...');
    const verificationJobId = await asyncProcessingService.submitContentVerificationJob(
      exampleContent,
      { strictMode: true },
      false // not high priority
    );
    console.log(`   Submitted verification job with ID: ${verificationJobId}`);

    // Submit a batch verification job
    console.log('\n2. Submitting batch verification job...');
    const batchContents = [
      { ...exampleContent, id: 'batch-1' },
      { ...exampleContent, id: 'batch-2', type: 'video' },
      { ...exampleContent, id: 'batch-3', type: 'document' }
    ];

    const batchJobId = await asyncProcessingService.submitBatchVerificationJob(
      batchContents,
      { parallel: true }
    );
    console.log(`   Submitted batch job with ID: ${batchJobId}`);

    // Submit an RUV profile job
    console.log('\n3. Submitting RUV profile job...');
    const ruvJobId = await asyncProcessingService.submitRUVProfileJob(
      exampleContent.id,
      exampleRUVData
    );
    console.log(`   Submitted RUV profile job with ID: ${ruvJobId}`);

    // Schedule a recurring task
    console.log('\n4. Scheduling recurring task...');
    const taskId = await asyncProcessingService.scheduleRecurringVerification(
      'daily-demo-task',
      '0 0 * * *', // Daily at midnight
      { contentId: exampleContent.id },
      new Date(), // Start immediately
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // End in 7 days
    );
    console.log(`   Scheduled recurring task with ID: ${taskId}`);

    // Check job progress (this would normally show progress updates)
    console.log('\n5. Checking job progress...');
    const progress = await asyncProcessingService.getJobProgress(verificationJobId);
    console.log(`   Job ${verificationJobId} progress:`, progress ? progress.status : 'Not available');

    // Get system metrics
    console.log('\n6. Getting system metrics...');
    const metrics = await asyncProcessingService.getMetrics();
    console.log(`   System metrics retrieved. Total jobs: ${metrics.jobs?.total || 0}`);

    // Get health status
    console.log('\n7. Checking system health...');
    const health = await asyncProcessingService.getHealthStatus();
    console.log('   Health status retrieved:',
      Object.keys(health.components || {}).length > 0 ? 'OK' : 'No components found');

    console.log('\nDemo completed successfully!');
    console.log('\nNote: In a real environment with running services, jobs would be processed by worker processes.');
    console.log('To run workers, use: node src/async/workers/workerProcess.js');

  } catch (error) {
    console.error('Demo failed:', error);
  } finally {
    // Close the service
    console.log('\nClosing async processing service...');
    await asyncProcessingService.close();
    console.log('Async processing service closed.');
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  demo().catch(console.error);
}

module.exports = { demo };