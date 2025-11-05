/**
 * Compliance Dashboard Routes
 *
 * This module provides API endpoints for compliance dashboard features:
 * - Dashboard data retrieval
 * - Regulation status tracking
 * - Compliance reporting
 * - Alert management
 */

const express = require('express');
const { body, validationResult, query, param } = require('express-validator');
const complianceDashboard = require('../../compliance/dashboard');
const { authenticateToken, requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/dashboard
 * Get compliance dashboard data
 */
router.get('/', [
  authenticateToken,
  requireRole(['admin', 'auditor', 'compliance'])
], async(req, res) => {
  try {
    const dashboard = await complianceDashboard.generateDashboard();

    res.json({
      message: 'Compliance dashboard retrieved successfully',
      dashboard
    });
  } catch (error) {
    console.error('Dashboard retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve compliance dashboard',
      message: error.message
    });
  }
});

/**
 * GET /api/dashboard/regulations
 * Get regulation status
 */
router.get('/regulations', [
  authenticateToken,
  requireRole(['admin', 'auditor', 'compliance'])
], async(req, res) => {
  try {
    const regulations = complianceDashboard.regulations;

    res.json({
      message: 'Regulation statuses retrieved successfully',
      regulations
    });
  } catch (error) {
    console.error('Regulation status retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve regulation statuses',
      message: error.message
    });
  }
});

/**
 * GET /api/dashboard/regulations/:regulation
 * Get specific regulation details
 */
router.get('/regulations/:regulation', [
  authenticateToken,
  requireRole(['admin', 'auditor', 'compliance']),
  param('regulation').isString().notEmpty().withMessage('Regulation name is required')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { regulation } = req.params;
    const details = complianceDashboard.getRegulationDetails(regulation);

    if (!details) {
      return res.status(404).json({
        error: 'Regulation not found',
        message: `Regulation ${regulation} not found`
      });
    }

    res.json({
      message: 'Regulation details retrieved successfully',
      regulation: details
    });
  } catch (error) {
    console.error('Regulation details retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve regulation details',
      message: error.message
    });
  }
});

/**
 * PUT /api/dashboard/regulations/:regulation
 * Update regulation status
 */
router.put('/regulations/:regulation', [
  authenticateToken,
  requireRole(['admin', 'compliance']),
  param('regulation').isString().notEmpty().withMessage('Regulation name is required'),
  body('status').isIn(['compliant', 'non_compliant', 'partially_compliant', 'not_applicable']).withMessage('Invalid status'),
  body('lastAudit').optional().isISO8601().withMessage('Invalid date format')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { regulation } = req.params;
    const { status, lastAudit } = req.body;

    complianceDashboard.updateRegulationStatus(
      regulation,
      status,
      lastAudit ? new Date(lastAudit) : new Date()
    );

    const updatedDetails = complianceDashboard.getRegulationDetails(regulation);

    res.json({
      message: 'Regulation status updated successfully',
      regulation: updatedDetails
    });
  } catch (error) {
    console.error('Regulation status update error:', error);
    res.status(500).json({
      error: 'Failed to update regulation status',
      message: error.message
    });
  }
});

/**
 * GET /api/dashboard/export
 * Export dashboard data
 */
router.get('/export', [
  authenticateToken,
  requireRole(['admin', 'auditor', 'compliance']),
  query('format').optional().isIn(['json', 'csv']).withMessage('Format must be json or csv')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const format = req.query.format || 'json';
    const exportedData = await complianceDashboard.exportDashboard(format);

    // Set appropriate headers for file download
    const filename = `compliance-dashboard-${new Date().toISOString().split('T')[0]}.${format}`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');

    res.send(exportedData);
  } catch (error) {
    console.error('Dashboard export error:', error);
    res.status(500).json({
      error: 'Failed to export compliance dashboard',
      message: error.message
    });
  }
});

/**
 * GET /api/dashboard/alerts
 * Get compliance alerts
 */
router.get('/alerts', [
  authenticateToken,
  requireRole(['admin', 'auditor', 'compliance', 'security'])
], async(req, res) => {
  try {
    const dashboard = await complianceDashboard.generateDashboard();
    const alerts = dashboard.alerts || [];

    res.json({
      message: 'Compliance alerts retrieved successfully',
      alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('Alerts retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve compliance alerts',
      message: error.message
    });
  }
});

module.exports = router;
