/**
 * OAuth2 Integration Test
 *
 * Integration test to verify OAuth2 configuration works with Express server
 */

const request = require('supertest');
const express = require('express');
const session = require('express-session');
const oauth2Config = require('../../src/config/oauth2');

// Mock environment variables for testing
process.env.OAUTH2_PROVIDER = 'auth0';
process.env.AUTH0_DOMAIN = 'test.auth0.com';
process.env.OAUTH2_CLIENT_ID = 'test-client-id';
process.env.OAUTH2_CLIENT_SECRET = 'test-client-secret';
process.env.OAUTH2_REDIRECT_URI = 'http://localhost:3000/callback';
process.env.SESSION_SECRET = 'test-secret';

describe('OAuth2 Integration', () => {
  let app;

  beforeAll(async () => {
    // Initialize OAuth2 configuration
    await oauth2Config.initialize();

    // Create Express app for testing
    app = express();

    // Use session middleware with Redis store
    app.use(session(oauth2Config.getSessionConfig()));

    // Use passport middleware
    app.use(oauth2Config.getPassportMiddleware());
    app.use(oauth2Config.getPassportSessionMiddleware());

    // Simple route for testing
    app.get('/auth/test', (req, res) => {
      res.status(200).json({ message: 'OAuth2 configured successfully' });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Test error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  });

  afterAll(async () => {
    // Close OAuth2 connections
    await oauth2Config.close();
  });

  test('should configure OAuth2 successfully', () => {
    expect(oauth2Config.isInitialized).toBe(true);
    expect(oauth2Config.redisClient).not.toBeNull();
    expect(oauth2Config.redisStore).not.toBeNull();
  });

  test('should have working session configuration', () => {
    const sessionConfig = oauth2Config.getSessionConfig();
    expect(sessionConfig.store).toBe(oauth2Config.redisStore);
    expect(sessionConfig.secret).toBe('test-secret');
  });

  test('should have working passport middleware', () => {
    const passportMiddleware = oauth2Config.getPassportMiddleware();
    const passportSessionMiddleware = oauth2Config.getPassportSessionMiddleware();
    expect(passportMiddleware).toBeDefined();
    expect(passportSessionMiddleware).toBeDefined();
  });
});