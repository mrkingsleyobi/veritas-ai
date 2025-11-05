# Asynchronous Processing System

## Overview

The asynchronous processing system provides scalable, fault-tolerant processing capabilities for intensive computational tasks in the Deepfake Detection Platform. It uses a combination of message queues, worker processes, and distributed scheduling to handle content verification, batch processing, and RUV profile management.

## Architecture

The system is composed of several key components:

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   API Layer     │    │   Job Queues     │    │   Worker Pods    │
│                 │───▶│                  │───▶│                  │
│ (Express.js)    │    │ (BullMQ/Redis)   │    │ (Docker Pods)    │
└─────────────────┘    └──────────────────┘    └──────────────────┘
                              │                         │
                              ▼                         ▼
                   ┌──────────────────┐    ┌──────────────────┐
                   │ Progress Tracking│    │ Circuit Breakers │
                   │                  │    │                  │
                   │   (Redis)        │    │   (Fault Tolerance)│
                   └──────────────────┘    └──────────────────┘
                              │
                              ▼
                   ┌──────────────────┐
                   │  Monitoring &    │
                   │   Metrics        │
                   │                  │
                   │   (Prometheus)   │
                   └──────────────────┘
```

## Components

### 1. Message Queues

The system uses two queue implementations:

- **BullMQ/Redis**: Primary job queue system with advanced features
- **RabbitMQ**: Secondary messaging system for additional reliability

#### Queues:
- `content-verification`: Individual content verification tasks
- `batch-processing`: Batch verification of multiple contents
- `ruv-profile-processing`: RUV profile creation and updates
- `high-priority-tasks`: High priority tasks with expedited processing

### 2. Worker Services

Worker processes that consume jobs from queues:

- **Content Verification Worker**: Processes content authenticity verification
- **Batch Processing Worker**: Handles batch verification tasks
- **RUV Profile Worker**: Manages RUV profile creation and updates

### 3. Progress Tracking

Real-time progress tracking for long-running operations using Redis:

- Progress percentage updates
- Step-by-step tracking
- Operation status (started, in_progress, completed, failed)
- Historical step tracking

### 4. Circuit Breaker Pattern

Fault tolerance mechanism that prevents cascading failures:

- Automatic failure detection
- Circuit state management (CLOSED, OPEN, HALF_OPEN)
- Configurable failure thresholds
- Automatic recovery

### 5. Task Scheduling

Distributed task scheduling system:

- One-time task scheduling
- Recurring task scheduling with cron expressions
- Task cancellation
- Automatic task execution

### 6. Monitoring & Metrics

Comprehensive monitoring and metrics collection:

- Job processing metrics
- Queue depth and performance
- Worker status tracking
- Processing time histograms
- Error rate tracking

## Usage

### Submitting Jobs

```javascript
const asyncProcessingService = require('./src/async/asyncProcessingService');

// Initialize the service
await asyncProcessingService.initialize();

// Submit a content verification job
const jobId = await asyncProcessingService.submitContentVerificationJob(
  content,
  options,
  highPriority
);

// Submit a batch verification job
const batchJobId = await asyncProcessingService.submitBatchVerificationJob(
  contents,
  options
);

// Submit an RUV profile job
const ruvJobId = await asyncProcessingService.submitRUVProfileJob(
  contentId,
  ruvData
);

// Check job progress
const progress = await asyncProcessingService.getJobProgress(jobId);

// Get system metrics
const metrics = await asyncProcessingService.getMetrics();

// Get health status
const health = await asyncProcessingService.getHealthStatus();
```

### Scheduling Recurring Tasks

```javascript
// Schedule a recurring verification task
await asyncProcessingService.scheduleRecurringVerification(
  'daily-verification',
  '0 0 * * *', // Daily at midnight
  { contentId: 'important-content-123' },
  new Date(), // Start immediately
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // End in 30 days
);
```

### Running Worker Processes

```bash
# Start a worker process
node src/async/workers/workerProcess.js
```

## Configuration

The system uses environment variables for configuration:

```env
# Redis Configuration (required for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# RabbitMQ Configuration (optional)
RABBITMQ_URL=amqp://localhost

# Worker Configuration
WORKER_CONCURRENCY=5
WORKER_TIMEOUT=60000
```

## Monitoring Endpoints

The system provides monitoring endpoints through the main Express.js server:

- `GET /api/async/metrics` - System metrics
- `GET /api/async/health` - Health status
- `GET /api/async/jobs/:jobId/progress` - Job progress
- `GET /api/async/queues` - Queue status

## Fault Tolerance

The system implements several fault tolerance mechanisms:

1. **Circuit Breakers**: Prevent cascading failures
2. **Retry Logic**: Automatic job retries with exponential backoff
3. **Dead Letter Queues**: Failed messages are moved to DLQ for later inspection
4. **Graceful Shutdown**: Proper cleanup on process termination
5. **Health Checks**: Continuous monitoring of system components

## Scaling

The system can be scaled horizontally by:

1. **Adding Worker Instances**: Run multiple worker processes
2. **Increasing Concurrency**: Adjust worker concurrency settings
3. **Queue Partitioning**: Split queues for different task types
4. **Database Connection Pooling**: Optimize database connections

## Testing

Integration tests are provided in `tests/async/` directory:

```bash
# Run async processing tests
npm run test:async

# Run all tests
npm test
```

## Performance Considerations

1. **Batch Processing**: Process multiple items together for efficiency
2. **Memory Management**: Progress trackers automatically expire
3. **Connection Pooling**: Reuse database and message queue connections
4. **Caching**: Use Redis for frequently accessed data
5. **Compression**: Compress large data before queueing

## Security

1. **Message Validation**: Validate all incoming messages
2. **Authentication**: Secure worker-to-queue communication
3. **Authorization**: Control access to monitoring endpoints
4. **Encryption**: Encrypt sensitive data in queues
5. **Rate Limiting**: Prevent queue flooding

## Troubleshooting

### Common Issues

1. **Jobs Stuck in Queue**: Check worker status and logs
2. **High Memory Usage**: Monitor progress tracker expiration
3. **Circuit Breaker Open**: Check downstream service health
4. **Queue Backlog**: Add more worker instances

### Monitoring

Use the built-in metrics and health endpoints to monitor system status:

```javascript
// Get detailed system metrics
const metrics = await asyncProcessingService.getMetrics();

// Check specific component health
const health = await asyncProcessingService.getHealthStatus();
```

## Future Enhancements

1. **Kubernetes Integration**: Deploy workers as Kubernetes pods
2. **Advanced Scheduling**: Implement more sophisticated scheduling algorithms
3. **Distributed Tracing**: Add OpenTelemetry integration
4. **Advanced Metrics**: Integrate with Prometheus/Grafana
5. **Auto-scaling**: Implement automatic worker scaling based on queue depth