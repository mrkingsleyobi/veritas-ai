/**
 * Audit Logging Routes
 *
 * This module provides API endpoints for audit logging features:
 * - Log retrieval
 * - Log export
 * - Compliance reporting
 * - Security monitoring
 */

const express = require('express');
const { body, validationResult, query } = require('express-validator');
const auditLogger = require('../../logging/auditLogger');
const { authenticateToken, requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/audit/logs
 * Get audit logs with filtering
 */
router.get('/logs', [
  authenticateToken,
  requireRole(['admin', 'auditor']),
  query('eventType').optional().isString(),
  query('userId').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('severity').optional().isIn(['info', 'warn', 'error']),
  query('limit').optional().isInt({ min: 1, max: 1000 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt()
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      eventType,
      userId,
      startDate,
      endDate,
      severity,
      limit = 100,
      offset = 0
    } = req.query;

    const filters = {};

    if (eventType) {
      filters.eventType = eventType;
    }
    if (userId) {
      filters.userId = userId;
    }
    if (startDate) {
      filters.startDate = startDate;
    }
    if (endDate) {
      filters.endDate = endDate;
    }
    if (severity) {
      filters.severity = severity;
    }

    const result = await auditLogger.getAuditLogs(filters, limit, offset);

    // Log this access for audit trail
    auditLogger.logEvent('audit_logs_accessed', req.user.userId, {
      filters,
      resultCount: result.logs.length
    }, 'info');

    res.json({
      message: 'Audit logs retrieved successfully',
      ...result
    });
  } catch (error) {
    console.error('Audit logs retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve audit logs',
      message: error.message
    });
  }
});

/**
 * GET /api/audit/logs/export
 * Export audit logs
 */
router.get('/logs/export', [
  authenticateToken,
  requireRole(['admin', 'auditor']),
  query('eventType').optional().isString(),
  query('userId').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('format').optional().isIn(['json', 'csv']).withMessage('Format must be json or csv')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      eventType,
      userId,
      startDate,
      endDate,
      format = 'json'
    } = req.query;

    const filters = {};

    if (eventType) {
      filters.eventType = eventType;
    }
    if (userId) {
      filters.userId = userId;
    }
    if (startDate) {
      filters.startDate = startDate;
    }
    if (endDate) {
      filters.endDate = endDate;
    }

    const exportedLogs = await auditLogger.exportAuditLogs(filters, format);

    // Set appropriate headers for file download
    const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');

    // Log this export for audit trail
    auditLogger.logEvent('audit_logs_exported', req.user.userId, {
      filters,
      format,
      exportSize: exportedLogs.length
    }, 'info');

    res.send(exportedLogs);
  } catch (error) {
    console.error('Audit logs export error:', error);
    res.status(500).json({
      error: 'Failed to export audit logs',
      message: error.message
    });
  }
});

/**
 * POST /api/audit/logs/verify
 * Verify log entry signature
 */
router.post('/logs/verify', [
  authenticateToken,
  requireRole(['admin', 'auditor']),
  body('logEntry').isObject().withMessage('Log entry is required')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { logEntry } = req.body;
    const isValid = auditLogger.verifyLogEntry(logEntry);

    res.json({
      message: 'Log entry verification completed',
      isValid,
      logEntryId: logEntry.id
    });
  } catch (error) {
    console.error('Log entry verification error:', error);
    res.status(500).json({
      error: 'Failed to verify log entry',
      message: error.message
    });
  }
});

/**
 * GET /api/audit/report
 * Generate compliance report
 */
router.get('/report', [
  authenticateToken,
  requireRole(['admin', 'auditor']),
  query('period').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid period')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const period = req.query.period || 'monthly';
    const report = await auditLogger.generateComplianceReport(period);

    // Log this report generation for audit trail
    auditLogger.logEvent('compliance_report_generated', req.user.userId, {
      reportId: report.reportId,
      period
    }, 'info');

    res.json({
      message: 'Compliance report generated successfully',
      report
    });
  } catch (error) {
    console.error('Compliance report generation error:', error);
    res.status(500).json({
      error: 'Failed to generate compliance report',
      message: error.message
    });
  }
});

/**
 * POST /api/audit/archive
 * Archive old audit logs
 */
router.post('/archive', [
  authenticateToken,
  requireRole(['admin']),
  body('days').optional().isInt({ min: 1 }).withMessage('Days must be a positive integer')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const days = req.body.days || parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || 365);
    const result = await auditLogger.archiveOldLogs(days);

    res.json({
      message: 'Audit logs archived successfully',
      result
    });
  } catch (error) {
    console.error('Audit logs archiving error:', error);
    res.status(500).json({
      error: 'Failed to archive audit logs',
      message: error.message
    });
  }
});

/**
 * POST /api/audit/monitor
 * Monitor security events
 */
router.post('/monitor', [
  authenticateToken,
  requireRole(['admin', 'security']),
  body('logEntry').isObject().withMessage('Log entry is required')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { logEntry } = req.body;
    const alerts = auditLogger.monitorSecurityEvents(logEntry);

    res.json({
      message: 'Security monitoring completed',
      alerts,
      logEntryId: logEntry.id
    });
  } catch (error) {
    console.error('Security monitoring error:', error);
    res.status(500).json({
      error: 'Failed to monitor security events',
      message: error.message
    });
  }
});

module.exports = router;
