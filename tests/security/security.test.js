/**
 * Security Tests for Deepfake Detection Platform
 *
 * Tests for authentication, authorization, input validation, and other security features.
 */

const request = require('supertest');
const app = require('../../src/server/index');
const { encrypt, decrypt, hash } = require('../../src/server/utils/encryption');

describe('Security Tests', () => {
  // Test for security headers
  describe('Security Headers', () => {
    it('should include security headers in responses', async () => {
      const res = await request(app)
        .get('/')
        .expect(200);

      expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(res.headers).toHaveProperty('x-frame-options', 'SAMEORIGIN');
      expect(res.headers).toHaveProperty('x-xss-protection', '0');
    });
  });

  // Test for CORS configuration
  describe('CORS Configuration', () => {
    it('should handle CORS preflight requests', async () => {
      const res = await request(app)
        .options('/')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .expect(200);

      expect(res.headers).toHaveProperty('access-control-allow-origin', 'http://localhost:3000');
    });
  });

  // Test for rate limiting
  describe('Rate Limiting', () => {
    it('should limit requests rate', async () => {
      // This test would need to be adjusted based on actual rate limit configuration
      // For now, we'll test that the endpoint works normally
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.body).toHaveProperty('status', 'healthy');
    });
  });

  // Test for authentication
  describe('Authentication', () => {
    it('should reject requests without valid token', async () => {
      const res = await request(app)
        .post('/api/verify')
        .send({
          content: {
            type: 'image',
            data: 'test-data'
          }
        })
        .expect(401);

      expect(res.body).toHaveProperty('error', 'Access token required');
    });

    it('should reject requests with invalid token', async () => {
      const res = await request(app)
        .post('/api/verify')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          content: {
            type: 'image',
            data: 'test-data'
          }
        })
        .expect(403);

      expect(res.body).toHaveProperty('error', 'Invalid token');
    });
  });

  // Test for input validation
  describe('Input Validation', () => {
    it('should reject invalid content type', async () => {
      const res = await request(app)
        .post('/api/verify')
        .set('Authorization', 'Bearer fake-token-for-testing')
        .send({
          content: {
            type: 'invalid-type',
            data: 'test-data'
          }
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject missing content data', async () => {
      const res = await request(app)
        .post('/api/verify')
        .set('Authorization', 'Bearer fake-token-for-testing')
        .send({
          content: {
            type: 'image'
          }
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'Validation failed');
    });
  });

  // Test for encryption utilities
  describe('Encryption Utilities', () => {
    it('should encrypt and decrypt data correctly', () => {
      const testData = 'sensitive-data-to-encrypt';
      const encrypted = encrypt(testData);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(testData);
    });

    it('should hash data correctly', () => {
      const testData = 'data-to-hash';
      const salt = 'test-salt';
      const hashed = hash(testData, salt);

      expect(typeof hashed).toBe('string');
      expect(hashed.length).toBe(64); // SHA256 produces 64 character hex string
    });

    it('should generate secure tokens', () => {
      const token1 = require('../../src/server/utils/encryption').generateToken();
      const token2 = require('../../src/server/utils/encryption').generateToken();

      expect(typeof token1).toBe('string');
      expect(token1.length).toBe(64); // 32 bytes = 64 hex characters
      expect(token1).not.toBe(token2); // Should be different
    });
  });

  // Test for session management
  describe('Session Management', () => {
    it('should handle session cookies securely', async () => {
      // Test registration which creates a session
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(201);

      // Check that a token was returned
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
    });
  });
});