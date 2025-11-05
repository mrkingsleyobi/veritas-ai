/**
 * SOC 2 Compliance Routes
 *
 * This module provides API endpoints for SOC 2 compliance features:
 * - Audit logging
 * - Compliance reporting
 * - Access control validation
 * - Security monitoring
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const soc2 = require('../../compliance/soc2');
const { authenticateToken, requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/soc2/log
 * Log security events
 */
router.post('/log', [
  authenticateToken,
  requireRole(['admin', 'security']),
  body('eventType').isString().notEmpty().withMessage('Event type is required'),
  body('details').optional().isObject(),
  body('severity').optional().isIn(['info', 'warn', 'error']).withMessage('Invalid severity level')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventType, details = {}, severity = 'info' } = req.body;
    const logEntry = soc2.logSecurityEvent(eventType, req.user.userId, details, severity);

    res.json({
      message: 'Security event logged successfully',
      logEntry
    });
  } catch (error) {
    console.error('SOC 2 log error:', error);
    res.status(500).json({
      error: 'Failed to log security event',
      message: error.message
    });
  }
});

/**
 * POST /api/soc2/access-control
 * Validate access control
 */
router.post('/access-control', [
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
    const accessDecision = soc2.validateAccessControl(req.user.userId, resource, action, userRoles);

    res.json({
      message: 'Access control validated',
      accessDecision
    });
  } catch (error) {
    console.error('SOC 2 access control error:', error);
    res.status(500).json({
      error: 'Failed to validate access control',
      message: error.message
    });
  }
});

/**
 * GET /api/soc2/report
 * Generate compliance report
 */
router.get('/report', [
  authenticateToken,
  requireRole(['admin', 'auditor']),
  body('period').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid period')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const period = req.query.period || 'monthly';
    const report = await soc2.generateComplianceReport(period);

    res.json({
      message: 'Compliance report generated successfully',
      report
    });
  } catch (error) {
    console.error('SOC 2 report error:', error);
    res.status(500).json({
      error: 'Failed to generate compliance report',
      message: error.message
    });
  }
});

/**
 * GET /api/soc2/availability
 * Check system availability
 */
router.get('/availability', [
  authenticateToken,
  requireRole(['admin', 'auditor'])
], async(req, res) => {
  try {
    const availability = soc2.checkAvailability();

    res.json({
      message: 'Availability check completed',
      availability
    });
  } catch (error) {
    console.error('SOC 2 availability error:', error);
    res.status(500).json({
      error: 'Failed to check system availability',
      message: error.message
    });
  }
});

/**
 * POST /api/soc2/threats
 * Monitor security threats
 */
router.post('/threats', [
  authenticateToken,
  requireRole(['admin', 'security']),
  body('eventData').isObject().withMessage('Event data is required')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventData } = req.body;
    const threatAssessment = soc2.monitorSecurityThreats(eventData);

    res.json({
      message: 'Security threat assessment completed',
      threatAssessment
    });
  } catch (error) {
    console.error('SOC 2 threat monitoring error:', error);
    res.status(500).json({
      error: 'Failed to monitor security threats',
      message: error.message
    });
  }
});

/**
 * POST /api/soc2/encrypt
 * Encrypt sensitive data
 */
router.post('/encrypt', [
  authenticateToken,
  requireRole(['admin']),
  body('data').isString().notEmpty().withMessage('Data is required')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { data } = req.body;
    const encryptedData = soc2.encryptData(data);

    res.json({
      message: 'Data encrypted successfully',
      encryptedData
    });
  } catch (error) {
    console.error('SOC 2 encryption error:', error);
    res.status(500).json({
      error: 'Failed to encrypt data',
      message: error.message
    });
  }
});

/**
 * POST /api/soc2/decrypt
 * Decrypt sensitive data
 */
router.post('/decrypt', [
  authenticateToken,
  requireRole(['admin']),
  body('encryptedData').isString().notEmpty().withMessage('Encrypted data is required')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { encryptedData } = req.body;
    const decryptedData = soc2.decryptData(encryptedData);

    res.json({
      message: 'Data decrypted successfully',
      decryptedData
    });
  } catch (error) {
    console.error('SOC 2 decryption error:', error);
    res.status(500).json({
      error: 'Failed to decrypt data',
      message: error.message
    });
  }
});

/**
 * POST /api/soc2/key-rotation
 * Rotate encryption keys
 */
router.post('/key-rotation', [
  authenticateToken,
  requireRole(['admin'])
], async(req, res) => {
  try {
    const rotationResult = await soc2.rotateEncryptionKeys();

    res.json({
      message: 'Encryption keys rotated successfully',
      rotationResult
    });
  } catch (error) {
    console.error('SOC 2 key rotation error:', error);
    res.status(500).json({
      error: 'Failed to rotate encryption keys',
      message: error.message
    });
  }
});

module.exports = router;
