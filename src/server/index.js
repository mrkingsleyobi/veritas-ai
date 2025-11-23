/**
 * Secure Express.js Server for Deepfake Detection Platform
 *
 * This server implements comprehensive security features including:
 * - JWT-based authentication
 * - Rate limiting
 * - Security headers
 * - Input validation and sanitization
 * - Session management
 * - CORS configuration
 * - Environment variable management
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

// Load environment variables
dotenv.config();

// Import platform services
const { ContentAuthenticator, RUVProfileService } = require('../index');

// Import OpenTelemetry
const opentelemetry = require('@opentelemetry/api');
const openTelemetryConfig = require('../config/opentelemetry');

// Import OAuth2 configuration
const oauth2Config = require('../config/oauth2');

// Import database configuration
const { Pool } = require('pg');
const { postgresConfig } = require('../config/database');
const redisClient = require('../config/redis');

// Import AgentDB services
const AgentDBService = require('../services/AgentDBService');
const AgentMonitoringService = require('../services/AgentMonitoringService');

// Import Agentic Flow services
const AgenticFlowEngine = require('../services/agentic-flow/AgenticFlowEngine');
const AgentDecisionFramework = require('../services/agentic-flow/AgentDecisionFramework');

// Initialize services
const authenticator = new ContentAuthenticator();
const ruvService = new RUVProfileService();

// Initialize database pool
const dbPool = new Pool(postgresConfig);

// AgentDB and Monitoring services (will be initialized after server starts)
let agentDBService = null;
let agentMonitoringService = null;
let agenticFlowEngine = null;
let agentDecisionFramework = null;
let redis = null;

// Initialize OpenTelemetry
let tracer;

openTelemetryConfig.initialize().then(() => {
  tracer = openTelemetryConfig.getTracer('veritas-ai-server');
  console.log('OpenTelemetry tracing initialized');
}).catch(error => {
  console.error('Failed to initialize OpenTelemetry:', error);
});

// Initialize OAuth2
oauth2Config.initialize().then(() => {
  console.log('OAuth2 configuration initialized');
}).catch(error => {
  console.error('Failed to initialize OAuth2 configuration:', error);
});

// Initialize Audit Logger
const auditLogger = require('../logging/auditLogger');

auditLogger.initialize().then(() => {
  console.log('Audit logger initialized');
  // Log server startup
  auditLogger.logEvent('server_startup', null, { port: PORT }, 'info');
}).catch(error => {
  console.error('Failed to initialize audit logger:', error);
});

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session configuration with OAuth2 (if configured)
const sessionConfig = oauth2Config.getSessionConfig();
if (sessionConfig) {
  app.use(session(sessionConfig));

  // Passport middleware for OAuth2 (if configured)
  if (oauth2Config.getPassportMiddleware) {
    app.use(oauth2Config.getPassportMiddleware());
    app.use(oauth2Config.getPassportSessionMiddleware());
  }
}

// Import custom middleware
const { authenticateToken, requireAuth } = require('./middleware/auth');
const { validateContent } = require('./middleware/validation');

// Import async processing routes
const asyncRoutes = require('./routes/asyncRoutes');

// Import GDPR compliance routes
const gdprRoutes = require('./routes/gdprRoutes');

// Import SOC 2 compliance routes
const soc2Routes = require('./routes/soc2Routes');

// Import Zero Trust security routes
const zeroTrustRoutes = require('./routes/zeroTrustRoutes');

// Import Multi-Tenancy routes
const tenancyRoutes = require('./routes/tenancyRoutes');

// Import Audit Logging routes
const auditRoutes = require('./routes/auditRoutes');

// Import Compliance Dashboard routes
const dashboardRoutes = require('./routes/dashboardRoutes');

// Import AgentDB routes
const initializeAgentDBRoutes = require('./routes/agentdbRoutes');
const initializeAgentMonitoringRoutes = require('./routes/agentMonitoringRoutes');

// Import Agentic Flow routes
const initializeAgenticFlowRoutes = require('./routes/agenticFlowRoutes');

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Deepfake Detection Platform API',
    version: '1.0.0',
    status: 'running'
  });
});

// Async processing routes
app.use('/api/async', asyncRoutes);

// GDPR compliance routes
app.use('/api/gdpr', gdprRoutes);

// SOC 2 compliance routes
app.use('/api/soc2', soc2Routes);

// Zero Trust security routes
app.use('/api/security', zeroTrustRoutes);

// Multi-Tenancy routes
app.use('/api/tenants', tenancyRoutes);

// Audit Logging routes
app.use('/api/audit', auditRoutes);

// Compliance Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// AgentDB routes (will be initialized after AgentDB service is ready)
// Placeholder - routes will be registered in server startup

// OAuth2 routes (only if OAuth2 is configured)
if (process.env.OAUTH2_CLIENT_ID && process.env.OAUTH2_CLIENT_SECRET) {
  app.get('/auth/oauth2', (req, res, next) => {
    const passport = require('passport');

    passport.authenticate('oauth2')(req, res, next);
  });

  app.get('/auth/oauth2/callback', (req, res, next) => {
    const passport = require('passport');

    passport.authenticate('oauth2', { failureRedirect: '/login' })(req, res, next);
  }, (req, res) => {
    // Successful authentication, redirect to dashboard or home
    res.redirect('/dashboard');
  });
}

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
  // Start tracing span
  const span = tracer ? tracer.startSpan('content-verification') : null;

  try {
    const { content, options } = req.body;

    if (span) {
      span.setAttribute('content.id', content.id || 'unknown');
      span.setAttribute('content.type', content.type || 'unknown');
    }

    // Verify content authenticity
    const verificationResult = await authenticator.verifyAuthenticity(content, options);

    if (span) {
      span.setAttribute('verification.confidence', verificationResult.confidence || 0);
      span.setAttribute('verification.isAuthentic', verificationResult.isAuthentic || false);
    }

    // If RUV profile exists, fuse with verification
    if (content.id) {
      const fusedResult = await ruvService.fuseWithVerification(content.id, verificationResult);

      if (span) {
        span.setAttribute('fusion.applied', true);
        span.setAttribute('fused.confidence', fusedResult.confidence || 0);
      }

      if (span) {
        span.end();
      }

      return res.json(fusedResult);
    }

    if (span) {
      span.end();
    }
    res.json(verificationResult);
  } catch (error) {
    if (span) {
      span.setAttribute('error', true);
      span.setAttribute('error.message', error.message);
      span.end();
    }
    res.status(500).json({ error: 'Verification failed', message: error.message });
  }
});

app.post('/api/batch-verify', authenticateToken, async(req, res) => {
  // Start tracing span
  const span = tracer ? tracer.startSpan('batch-verification') : null;

  try {
    const { contents, options } = req.body;

    if (span) {
      span.setAttribute('batch.size', contents ? contents.length : 0);
    }

    if (!Array.isArray(contents)) {
      if (span) {
        span.end();
      }

      return res.status(400).json({ error: 'Contents must be an array' });
    }

    // Batch verify contents
    const results = await authenticator.batchVerify(contents, options);

    if (span) {
      span.setAttribute('batch.results.count', results ? results.length : 0);
      span.setAttribute('batch.completed', true);
      span.end();
    }

    res.json(results);
  } catch (error) {
    if (span) {
      span.setAttribute('error', true);
      span.setAttribute('error.message', error.message);
      span.end();
    }
    res.status(500).json({ error: 'Batch verification failed', message: error.message });
  }
});

app.post('/api/ruv-profile', authenticateToken, async(req, res) => {
  // Start tracing span
  const span = tracer ? tracer.startSpan('ruv-profile-update') : null;

  try {
    const { contentId, ruvData } = req.body;

    if (span) {
      span.setAttribute('content.id', contentId || 'unknown');
    }

    if (!contentId || !ruvData) {
      if (span) {
        span.end();
      }

      return res.status(400).json({ error: 'Content ID and RUV data are required' });
    }

    // Create or update RUV profile
    const profile = await ruvService.createOrUpdateProfile(contentId, ruvData);

    if (span) {
      span.setAttribute('profile.updated', true);
      span.setAttribute('profile.reputation', profile.reputation || 0);
      span.setAttribute('profile.uniqueness', profile.uniqueness || 0);
      span.setAttribute('profile.verificationCount', profile.verificationCount || 0);
      span.end();
    }

    res.json({
      message: 'RUV profile created/updated successfully',
      profile
    });
  } catch (error) {
    if (span) {
      span.setAttribute('error', true);
      span.setAttribute('error.message', error.message);
      span.end();
    }
    res.status(500).json({ error: 'Failed to create/update RUV profile', message: error.message });
  }
});

app.get('/api/ruv-profile/:contentId', authenticateToken, async(req, res) => {
  // Start tracing span
  const span = tracer ? tracer.startSpan('ruv-profile-retrieve') : null;

  try {
    const { contentId } = req.params;

    if (span) {
      span.setAttribute('content.id', contentId || 'unknown');
    }

    const profile = ruvService.getProfile(contentId);

    if (!profile) {
      if (span) {
        span.setAttribute('profile.found', false);
        span.end();
      }

      return res.status(404).json({ error: 'RUV profile not found' });
    }

    if (span) {
      span.setAttribute('profile.found', true);
      span.setAttribute('profile.reputation', profile.reputation || 0);
      span.setAttribute('profile.uniqueness', profile.uniqueness || 0);
      span.setAttribute('profile.verificationCount', profile.verificationCount || 0);
      span.end();
    }

    res.json(profile);
  } catch (error) {
    if (span) {
      span.setAttribute('error', true);
      span.setAttribute('error.message', error.message);
      span.end();
    }
    res.status(500).json({ error: 'Failed to retrieve RUV profile', message: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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
  try {
    if (agentMonitoringService) {
      agentMonitoringService.stopMonitoring();
    }
    if (agentDBService) {
      await agentDBService.cleanup();
    }
    if (dbPool) {
      await dbPool.end();
    }
    if (redis) {
      await redisClient.disconnect();
    }
    await openTelemetryConfig.close();
    await oauth2Config.close();
    await auditLogger.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async() => {
  console.log('SIGINT received, shutting down gracefully...');
  try {
    if (agentMonitoringService) {
      agentMonitoringService.stopMonitoring();
    }
    if (agentDBService) {
      await agentDBService.cleanup();
    }
    if (dbPool) {
      await dbPool.end();
    }
    if (redis) {
      await redisClient.disconnect();
    }
    await openTelemetryConfig.close();
    await oauth2Config.close();
    await auditLogger.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`Secure server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Prometheus metrics available at http://localhost:${process.env.PROMETHEUS_PORT || 9464}/metrics`);

  // Initialize AgentDB after server starts
  try {
    console.log('\nInitializing AgentDB services...');

    // Connect to Redis
    redis = await redisClient.connect();
    console.log('Redis connected');

    // Initialize AgentDB service
    agentDBService = new AgentDBService(dbPool, redis);
    await agentDBService.initialize();
    console.log('AgentDB service initialized');

    // Initialize Agent Monitoring
    agentMonitoringService = new AgentMonitoringService(agentDBService);
    agentMonitoringService.startMonitoring(60000); // Monitor every 60 seconds
    console.log('Agent monitoring started');

    // Initialize Agentic Flow Engine
    agenticFlowEngine = new AgenticFlowEngine(agentDBService);
    console.log('Agentic Flow Engine initialized');

    // Initialize Agent Decision Framework
    agentDecisionFramework = new AgentDecisionFramework(agentDBService);
    console.log('Agent Decision Framework initialized');

    // Register AgentDB routes dynamically
    app.use('/api/agentdb', initializeAgentDBRoutes(agentDBService));
    app.use('/api/agent-monitoring', initializeAgentMonitoringRoutes(agentMonitoringService));
    app.use('/api/agentic-flow', initializeAgenticFlowRoutes(agenticFlowEngine, agentDecisionFramework));
    console.log('AgentDB and Agentic Flow routes registered\n');

    console.log('✅ AgentDB and Agentic Flow fully operational');
  } catch (error) {
    console.error('❌ Failed to initialize AgentDB:', error.message);
    console.error('Server will continue without AgentDB functionality');
  }
});

module.exports = server;
