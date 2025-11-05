/**
 * Zero Trust Security Routes
 *
 * This module provides API endpoints for zero-trust security features:
 * - Multi-factor authentication (MFA)
 * - Device trust management
 * - Continuous verification
 * - Session management
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const zeroTrust = require('../../security/zeroTrust');
const { authenticateToken, requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/security/mfa/setup
 * Set up MFA for a user
 */
router.post('/mfa/setup', [
  authenticateToken,
  body('userEmail').isEmail().withMessage('Valid email is required')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userEmail } = req.body;
    const mfaSetup = await zeroTrust.generateMFASecret(req.user.userId, userEmail);

    // In a real implementation, you would:
    // 1. Encrypt and store the secret in a secure database
    // 2. Send the QR code to the user via secure channel
    // 3. Implement backup code storage

    res.json({
      message: 'MFA setup initiated successfully',
      mfaSetup: {
        userId: mfaSetup.userId,
        qrCode: mfaSetup.qrCode,
        backupCodes: mfaSetup.backupCodes
        // Don't send the secret in the response for security
      }
    });
  } catch (error) {
    console.error('MFA setup error:', error);
    res.status(500).json({
      error: 'Failed to set up MFA',
      message: error.message
    });
  }
});

/**
 * POST /api/security/mfa/verify
 * Verify MFA token
 */
router.post('/mfa/verify', [
  authenticateToken,
  body('token').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Valid 6-digit token required')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.body;
    const isValid = zeroTrust.verifyTOTP(req.user.userId, token);

    if (isValid) {
      // Create a secure session after successful MFA
      const sessionId = zeroTrust.createSecureSession(req.user.userId, {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        deviceId: req.headers['device-id'] || 'unknown'
      });

      res.json({
        message: 'MFA verification successful',
        isValid,
        sessionId
      });
    } else {
      res.status(401).json({
        message: 'Invalid MFA token',
        isValid
      });
    }
  } catch (error) {
    console.error('MFA verification error:', error);
    res.status(500).json({
      error: 'Failed to verify MFA token',
      message: error.message
    });
  }
});

/**
 * POST /api/security/mfa/backup
 * Verify backup code
 */
router.post('/mfa/backup', [
  authenticateToken,
  body('backupCode').isLength({ min: 12 }).withMessage('Valid backup code required')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { backupCode } = req.body;
    const isValid = zeroTrust.verifyBackupCode(req.user.userId, backupCode);

    if (isValid) {
      // Create a secure session after successful backup code verification
      const sessionId = zeroTrust.createSecureSession(req.user.userId, {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        deviceId: req.headers['device-id'] || 'unknown'
      });

      res.json({
        message: 'Backup code verification successful',
        isValid,
        sessionId
      });
    } else {
      res.status(401).json({
        message: 'Invalid backup code',
        isValid
      });
    }
  } catch (error) {
    console.error('Backup code verification error:', error);
    res.status(500).json({
      error: 'Failed to verify backup code',
      message: error.message
    });
  }
});

/**
 * POST /api/security/device/register
 * Register trusted device
 */
router.post('/device/register', [
  authenticateToken,
  body('deviceId').isString().notEmpty().withMessage('Device ID is required'),
  body('deviceInfo').isObject().withMessage('Device info is required')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { deviceId, deviceInfo } = req.body;
    const result = zeroTrust.registerTrustedDevice(req.user.userId, deviceId, deviceInfo);

    res.json({
      message: 'Device registered successfully',
      result
    });
  } catch (error) {
    console.error('Device registration error:', error);
    res.status(500).json({
      error: 'Failed to register device',
      message: error.message
    });
  }
});

/**
 * POST /api/security/device/assess
 * Assess device trust
 */
router.post('/device/assess', [
  authenticateToken,
  body('deviceId').isString().notEmpty().withMessage('Device ID is required'),
  body('deviceInfo').optional().isObject()
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { deviceId, deviceInfo = {} } = req.body;
    const assessment = zeroTrust.assessDeviceTrust(deviceId, deviceInfo);

    res.json({
      message: 'Device trust assessment completed',
      assessment
    });
  } catch (error) {
    console.error('Device assessment error:', error);
    res.status(500).json({
      error: 'Failed to assess device trust',
      message: error.message
    });
  }
});

/**
 * POST /api/security/verify/continuous
 * Continuous verification check
 */
router.post('/verify/continuous', [
  authenticateToken,
  body('sessionId').isString().notEmpty().withMessage('Session ID is required'),
  body('context').isObject().withMessage('Context is required')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId, context } = req.body;
    const verification = zeroTrust.continuousVerification(req.user.userId, sessionId, context);

    res.json({
      message: 'Continuous verification completed',
      verification
    });
  } catch (error) {
    console.error('Continuous verification error:', error);
    res.status(500).json({
      error: 'Failed to perform continuous verification',
      message: error.message
    });
  }
});

/**
 * POST /api/security/access/privilege
 * Enforce least privilege access
 */
router.post('/access/privilege', [
  authenticateToken,
  requireRole(['admin', 'security']),
  body('resource').isString().notEmpty().withMessage('Resource is required'),
  body('action').isString().notEmpty().withMessage('Action is required'),
  body('userRoles').isArray().withMessage('User roles must be an array')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resource, action, userRoles } = req.body;
    const decision = zeroTrust.enforceLeastPrivilege(req.user.userId, userRoles, resource, action);

    res.json({
      message: 'Access privilege check completed',
      decision
    });
  } catch (error) {
    console.error('Privilege access error:', error);
    res.status(500).json({
      error: 'Failed to enforce least privilege access',
      message: error.message
    });
  }
});

/**
 * GET /api/security/session/validate
 * Validate secure session
 */
router.get('/session/validate/:sessionId', [
  authenticateToken
], async(req, res) => {
  try {
    const { sessionId } = req.params;
    const validation = zeroTrust.validateSecureSession(sessionId);

    res.json({
      message: 'Session validation completed',
      validation
    });
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({
      error: 'Failed to validate session',
      message: error.message
    });
  }
});

/**
 * DELETE /api/security/session/revoke
 * Revoke session
 */
router.delete('/session/revoke/:sessionId', [
  authenticateToken
], async(req, res) => {
  try {
    const { sessionId } = req.params;
    const result = zeroTrust.revokeSession(sessionId);

    res.json({
      message: 'Session revocation completed',
      result
    });
  } catch (error) {
    console.error('Session revocation error:', error);
    res.status(500).json({
      error: 'Failed to revoke session',
      message: error.message
    });
  }
});

module.exports = router;
