/**
 * Optimized Express.js Server for Deepfake Detection Platform
 *
 * This server implements comprehensive performance optimizations including:
 * - Parallel batch processing using Promise.all()
 * - Distributed caching with Redis
 * - Worker threads for CPU-intensive operations
 * - Streaming processing for large content
 * - Database connection pooling
 * - Memory management and garbage collection
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { Readable } = require('stream');

// Load environment variables
dotenv.config();

// Import optimized platform services
const OptimizedContentAuthenticator = require('../algorithms/optimizedContentAuthenticator');
const OptimizedRUVProfileService = require('../services/optimizedRuvProfileService');

// Import utilities
const { redisCache } = require('../cache/redisClient');
const { memoryManager } = require('../utils/memoryManager');
const StreamingMiddleware = require('./middleware/streaming');
const { performanceBenchmark } = require('../utils/performanceBenchmark');

// Initialize services
const authenticator = new OptimizedContentAuthenticator();
const ruvService = new OptimizedRUVProfileService();

// Initialize utilities
memoryManager.startMonitoring();

// Connect to Redis if available
(async() => {
  if (process.env.REDIS_URL) {
    await redisCache.connect();
  }
})();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],
      scriptSrc: ['\'self\''],
      imgSrc: ['\'self\'', 'data:', 'https:'],
      connectSrc: ['\'self\''],
      fontSrc: ['\'self\'', 'https:', 'data:']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Built-in middleware
app.use(express.json({ limit: '50mb' })); // Increased limit for large content
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_key_for_development',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Streaming middleware for large content
app.use('/api/stream-verify', StreamingMiddleware.streamUpload({
  maxFileSize: 500 * 1024 * 1024, // 500MB
  enableProgress: true
}));

// Import custom middleware
const { authenticateToken, requireAuth } = require('./middleware/auth');
const { validateContent } = require('./middleware/validation');

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Deepfake Detection Platform API (Optimized)',
    version: '1.0.0',
    status: 'running',
    optimizations: {
      parallelBatchProcessing: true,
      redisCaching: redisCache.isConnected,
      workerThreads: true,
      streamingProcessing: true,
      databasePooling: true,
      memoryManagement: true
    }
  });
});

// Authentication routes
app.post('/api/auth/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check if user already exists (simplified for example)
    // In a real implementation, you would check a database

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user (simplified for example)
    const user = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword
    };

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'fallback_jwt_secret_for_development',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, username: user.username, email: user.email },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // In a real implementation, you would fetch user from database
    // This is a simplified example
    const user = {
      id: '12345',
      username: 'testuser',
      email: 'test@example.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.S' // bcrypt hash of 'password123'
    };

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'fallback_jwt_secret_for_development',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: { id: user.id, username: user.username, email: user.email },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected routes for content verification
app.post('/api/verify', validateContent, authenticateToken, async(req, res) => {
  try {
    const { content, options } = req.body;

    // Verify content authenticity
    const verificationResult = await authenticator.verifyAuthenticity(content, options);

    // If RUV profile exists, fuse with verification
    if (content.id) {
      const fusedResult = await ruvService.fuseWithVerification(content.id, verificationResult);

      return res.json(fusedResult);
    }

    res.json(verificationResult);
  } catch (error) {
    res.status(500).json({ error: 'Verification failed', message: error.message });
  }
});

// Optimized batch verification with parallel processing
app.post('/api/batch-verify', authenticateToken, async(req, res) => {
  try {
    const { contents, options } = req.body;

    if (!Array.isArray(contents)) {
      return res.status(400).json({ error: 'Contents must be an array' });
    }

    // Batch verify contents using Promise.all for parallel processing
    const results = await authenticator.batchVerify(contents, options);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Batch verification failed', message: error.message });
  }
});

// Streaming verification for large content
app.post('/api/stream-verify', authenticateToken, async(req, res) => {
  try {
    const { options } = req.body;

    // Check if streaming is available
    if (!req.streaming || !req.streaming.stream) {
      return res.status(400).json({ error: 'Streaming not available for this request' });
    }

    // Process streaming content
    const result = await StreamingMiddleware.streamToVerification(
      req.streaming.stream,
      authenticator,
      options
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Streaming verification failed', message: error.message });
  }
});

// RUV profile routes with caching
app.post('/api/ruv-profile', authenticateToken, async(req, res) => {
  try {
    const { contentId, ruvData } = req.body;

    if (!contentId || !ruvData) {
      return res.status(400).json({ error: 'Content ID and RUV data are required' });
    }

    // Create or update RUV profile with caching
    const profile = await ruvService.createOrUpdateProfile(contentId, ruvData);

    res.json({
      message: 'RUV profile created/updated successfully',
      profile
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create/update RUV profile', message: error.message });
  }
});

app.get('/api/ruv-profile/:contentId', authenticateToken, async(req, res) => {
  try {
    const { contentId } = req.params;

    // Get profile with caching
    const profile = await ruvService.getProfile(contentId);

    if (!profile) {
      return res.status(404).json({ error: 'RUV profile not found' });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve RUV profile', message: error.message });
  }
});

// Batch RUV profile fusion with parallel processing
app.post('/api/batch-fuse', authenticateToken, async(req, res) => {
  try {
    const { fusionTasks } = req.body;

    if (!Array.isArray(fusionTasks)) {
      return res.status(400).json({ error: 'Fusion tasks must be an array' });
    }

    // Batch fuse profiles using Promise.all for parallel processing
    const results = await ruvService.batchFuseWithVerification(fusionTasks);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Batch fusion failed', message: error.message });
  }
});

// Performance monitoring routes
app.get('/api/performance/memory', authenticateToken, (req, res) => {
  try {
    const memoryStats = memoryManager.getMemoryStats();

    res.json(memoryStats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve memory stats', message: error.message });
  }
});

app.get('/api/performance/cache', authenticateToken, async(req, res) => {
  try {
    if (!redisCache.isConnected) {
      return res.status(503).json({ error: 'Redis cache not available' });
    }

    const cacheStats = await redisCache.getStats();

    res.json({
      connected: redisCache.isConnected,
      stats: cacheStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve cache stats', message: error.message });
  }
});

// Run performance benchmarks
app.post('/api/benchmark/run', authenticateToken, async(req, res) => {
  try {
    const { components } = req.body;

    // Run comprehensive benchmark
    const results = await performanceBenchmark.runComprehensiveBenchmark({
      contentAuthenticator: authenticator,
      ruvProfileService: ruvService
    });

    res.json({
      message: 'Benchmark completed successfully',
      results
    });
  } catch (error) {
    res.status(500).json({ error: 'Benchmark failed', message: error.message });
  }
});

// Get benchmark results
app.get('/api/benchmark/results', authenticateToken, (req, res) => {
  try {
    const results = performanceBenchmark.getFormattedResults();

    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve benchmark results', message: error.message });
  }
});

// Health check endpoint with performance metrics
app.get('/api/health', (req, res) => {
  const memoryStats = memoryManager.getMemoryStats();

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: memoryStats.current,
    optimizations: {
      redisCache: redisCache.isConnected,
      workerThreads: authenticator.workerPool.length > 0,
      streaming: true,
      parallelProcessing: true
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Graceful shutdown
process.on('SIGTERM', async() => {
  console.log('SIGTERM received, shutting down gracefully...');

  // Close worker threads
  await authenticator.closeWorkers();

  // Close database connections
  await ruvService.close();

  // Close Redis connection
  await redisCache.disconnect();

  // Stop memory monitoring
  memoryManager.stopMonitoring();

  process.exit(0);
});

process.on('SIGINT', async() => {
  console.log('SIGINT received, shutting down gracefully...');

  // Close worker threads
  await authenticator.closeWorkers();

  // Close database connections
  await ruvService.close();

  // Close Redis connection
  await redisCache.disconnect();

  // Stop memory monitoring
  memoryManager.stopMonitoring();

  process.exit(0);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Optimized server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Redis caching: ${redisCache.isConnected ? 'ENABLED' : 'DISABLED'}`);
  console.log(`Worker threads: ${authenticator.workerPool.length} workers available`);
});

module.exports = { app, server };
