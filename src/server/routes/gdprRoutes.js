/**
 * GDPR Compliance Routes
 *
 * This module provides API endpoints for GDPR compliance features:
 * - Data access requests
 * - Data rectification requests
 * - Right to erasure
 * - Data portability
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const gdpr = require('../../compliance/gdpr');
const { authenticateToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/gdpr/access
 * Process data access request
 */
router.get('/access', authenticateToken, async(req, res) => {
  try {
    const userData = await gdpr.processAccessRequest(req.user.userId);

    res.json({
      message: 'Data access request processed successfully',
      data: userData
    });
  } catch (error) {
    console.error('GDPR access request error:', error);
    res.status(500).json({
      error: 'Failed to process data access request',
      message: error.message
    });
  }
});

/**
 * POST /api/gdpr/rectify
 * Process data rectification request
 */
router.post('/rectify', [
  authenticateToken,
  body('corrections').isObject().withMessage('Corrections must be an object')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { corrections } = req.body;
    const result = await gdpr.processRectificationRequest(req.user.userId, corrections);

    res.json({
      message: 'Data rectification request processed successfully',
      result
    });
  } catch (error) {
    console.error('GDPR rectification request error:', error);
    res.status(500).json({
      error: 'Failed to process data rectification request',
      message: error.message
    });
  }
});

/**
 * DELETE /api/gdpr/data
 * Process right to erasure request
 */
router.delete('/data', [
  authenticateToken,
  body('anonymizeOnly').optional().isBoolean().withMessage('anonymizeOnly must be a boolean')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const anonymizeOnly = req.body.anonymizeOnly || false;
    const result = await gdpr.processErasureRequest(req.user.userId, anonymizeOnly);

    res.json({
      message: `Data ${anonymizeOnly ? 'anonymized' : 'deleted'} successfully`,
      result
    });
  } catch (error) {
    console.error('GDPR erasure request error:', error);
    res.status(500).json({
      error: 'Failed to process right to erasure request',
      message: error.message
    });
  }
});

/**
 * GET /api/gdpr/export
 * Generate data portability export
 */
router.get('/export', authenticateToken, async(req, res) => {
  try {
    const exportData = await gdpr.generateDataExport(req.user.userId);

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="user-data-export-${exportData.exportId}.json"`);
    res.setHeader('Content-Type', 'application/json');

    res.json(exportData);
  } catch (error) {
    console.error('GDPR data export error:', error);
    res.status(500).json({
      error: 'Failed to generate data export',
      message: error.message
    });
  }
});

/**
 * POST /api/gdpr/consent
 * Manage user consent
 */
router.post('/consent', [
  authenticateToken,
  body('consentType').isString().notEmpty().withMessage('Consent type is required'),
  body('granted').optional().isBoolean().withMessage('Granted must be a boolean')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { consentType, granted = true } = req.body;
    const consentRecord = gdpr.generateConsentRecord(req.user.userId, consentType, granted);

    // In a real implementation, this would be saved to the database
    console.log('Consent record created:', consentRecord);

    res.json({
      message: 'Consent recorded successfully',
      consent: consentRecord
    });
  } catch (error) {
    console.error('GDPR consent error:', error);
    res.status(500).json({
      error: 'Failed to record consent',
      message: error.message
    });
  }
});

module.exports = router;
