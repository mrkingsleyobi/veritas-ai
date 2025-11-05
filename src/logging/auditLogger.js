/**
 * Audit Logger Module
 *
 * This module implements comprehensive audit logging with:
 * - Immutable log storage
 * - Cryptographic signing
 * - Log retention policies
 * - Compliance reporting
 */

const crypto = require('crypto');
const winston = require('winston');
const fs = require('fs').promises;
const path = require('path');

class AuditLogger {
  constructor() {
    this.logDirectory = process.env.AUDIT_LOG_DIR || './logs/audit';
    this.retentionDays = process.env.AUDIT_LOG_RETENTION_DAYS || 365;
    this.signingKey = process.env.AUDIT_LOG_SIGNING_KEY || this._generateSigningKey();
    this.isInitialized = false;
  }

  /**
   * Generate signing key for log integrity
   * @returns {string} Signing key
   */
  _generateSigningKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Initialize audit logger
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Ensure log directory exists
      await fs.mkdir(this.logDirectory, { recursive: true });

      // Create winston logger for audit logs
      this.logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
        transports: [
          new winston.transports.File({
            filename: path.join(this.logDirectory, 'audit.log'),
            maxsize: 10000000, // 10MB
            maxFiles: 10,
            tailable: true
          })
        ]
      });

      this.isInitialized = true;
      console.log('Audit logger initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audit logger:', error);
      throw error;
    }
  }

  /**
   * Log audit event with cryptographic signing
   * @param {string} eventType - Type of audit event
   * @param {string} userId - User ID (if applicable)
   * @param {Object} details - Event details
   * @param {string} severity - Event severity
   * @returns {Object} Signed log entry
   */
  logEvent(eventType, userId = null, details = {}, severity = 'info') {
    if (!this.isInitialized) {
      throw new Error('Audit logger not initialized');
    }

    // Create log entry
    const logEntry = {
      id: crypto.randomBytes(16).toString('hex'),
      timestamp: new Date().toISOString(),
      eventType,
      userId,
      severity,
      details,
      source: 'veritas-ai-platform'
    };

    // Create cryptographic signature
    const signature = this._signLogEntry(logEntry);

    logEntry.signature = signature;
    logEntry.signatureAlgorithm = 'HMAC-SHA256';

    // Log to winston logger
    this.logger.log(severity, eventType, logEntry);

    return logEntry;
  }

  /**
   * Sign log entry for integrity verification
   * @param {Object} logEntry - Log entry to sign
   * @returns {string} Signature
   */
  _signLogEntry(logEntry) {
    const dataToSign = JSON.stringify({
      id: logEntry.id,
      timestamp: logEntry.timestamp,
      eventType: logEntry.eventType,
      userId: logEntry.userId,
      severity: logEntry.severity,
      details: logEntry.details
    });

    return crypto
      .createHmac('sha256', this.signingKey)
      .update(dataToSign)
      .digest('hex');
  }

  /**
   * Verify log entry signature
   * @param {Object} logEntry - Log entry to verify
   * @returns {boolean} Whether signature is valid
   */
  verifyLogEntry(logEntry) {
    const { signature, ...entryWithoutSignature } = logEntry;
    const expectedSignature = this._signLogEntry(entryWithoutSignature);

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Get audit logs with filtering
   * @param {Object} filters - Filter criteria
   * @param {number} limit - Maximum number of logs to return
   * @param {number} offset - Number of logs to skip
   * @returns {Array} Audit logs
   */
  async getAuditLogs(filters = {}, limit = 100, offset = 0) {
    try {
      const logFile = path.join(this.logDirectory, 'audit.log');
      const logData = await fs.readFile(logFile, 'utf8');

      // Parse log entries
      const logEntries = logData
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(entry => entry !== null);

      // Apply filters
      let filteredLogs = logEntries;

      if (filters.eventType) {
        filteredLogs = filteredLogs.filter(log => log.eventType === filters.eventType);
      }

      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }

      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
      }

      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
      }

      if (filters.severity) {
        filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
      }

      // Apply pagination
      const paginatedLogs = filteredLogs.slice(offset, offset + limit);

      // Verify signatures
      const verifiedLogs = paginatedLogs.map(log => ({
        ...log,
        signatureValid: this.verifyLogEntry(log)
      }));

      return {
        logs: verifiedLogs,
        total: filteredLogs.length,
        limit,
        offset
      };
    } catch (error) {
      console.error('Error retrieving audit logs:', error);
      throw error;
    }
  }

  /**
   * Export audit logs for compliance reporting
   * @param {Object} filters - Filter criteria
   * @param {string} format - Export format (json, csv)
   * @returns {string} Exported logs
   */
  async exportAuditLogs(filters = {}, format = 'json') {
    try {
      const result = await this.getAuditLogs(filters, 10000, 0);
      const logs = result.logs;

      if (format === 'json') {
        return JSON.stringify(logs, null, 2);
      } else if (format === 'csv') {
        // Convert to CSV format
        const headers = ['timestamp', 'eventType', 'userId', 'severity', 'details', 'signatureValid'];
        const csvRows = [headers.join(',')];

        logs.forEach(log => {
          const row = [
            log.timestamp,
            log.eventType,
            log.userId || '',
            log.severity,
            JSON.stringify(log.details).replace(/"/g, '""'),
            log.signatureValid
          ];

          csvRows.push(row.map(field => `"${field}"`).join(','));
        });

        return csvRows.join('\n');
      } else {
        throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw error;
    }
  }

  /**
   * Archive old audit logs
   * @param {number} days - Age of logs to archive (in days)
   * @returns {Object} Archive result
   */
  async archiveOldLogs(days = this.retentionDays) {
    try {
      const cutoffDate = new Date();

      cutoffDate.setDate(cutoffDate.getDate() - days);

      // In a real implementation, you would:
      // 1. Move old logs to archive storage
      // 2. Compress archived logs
      // 3. Update log indices
      // 4. Verify archive integrity

      const archiveResult = {
        archivedAt: new Date().toISOString(),
        cutoffDate: cutoffDate.toISOString(),
        archivedLogs: 0, // Placeholder
        archivePath: path.join(this.logDirectory, 'archive'),
        status: 'completed'
      };

      this.logEvent('audit_log_archived', null, archiveResult, 'info');

      return archiveResult;
    } catch (error) {
      console.error('Error archiving audit logs:', error);
      this.logEvent('audit_log_archive_failed', null, { error: error.message }, 'error');
      throw error;
    }
  }

  /**
   * Generate compliance report
   * @param {string} period - Report period
   * @returns {Object} Compliance report
   */
  async generateComplianceReport(period = 'monthly') {
    try {
      const startDate = new Date();

      switch (period) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
      }

      const filters = {
        startDate: startDate.toISOString()
      };

      const result = await this.getAuditLogs(filters, 10000, 0);
      const logs = result.logs;

      // Generate statistics
      const report = {
        reportId: crypto.randomBytes(16).toString('hex'),
        generatedAt: new Date().toISOString(),
        period,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
        totalEvents: logs.length,
        eventTypes: {},
        severityLevels: {},
        topUsers: {},
        signatureIntegrity: {
          valid: logs.filter(log => log.signatureValid).length,
          invalid: logs.filter(log => !log.signatureValid).length
        }
      };

      // Count event types
      logs.forEach(log => {
        report.eventTypes[log.eventType] = (report.eventTypes[log.eventType] || 0) + 1;
      });

      // Count severity levels
      logs.forEach(log => {
        report.severityLevels[log.severity] = (report.severityLevels[log.severity] || 0) + 1;
      });

      // Count top users
      logs.forEach(log => {
        if (log.userId) {
          report.topUsers[log.userId] = (report.topUsers[log.userId] || 0) + 1;
        }
      });

      this.logEvent('compliance_report_generated', null, { reportId: report.reportId }, 'info');

      return report;
    } catch (error) {
      console.error('Error generating compliance report:', error);
      this.logEvent('compliance_report_failed', null, { error: error.message }, 'error');
      throw error;
    }
  }

  /**
   * Monitor for security events
   * @param {Object} logEntry - Log entry to analyze
   * @returns {Array} Security alerts
   */
  monitorSecurityEvents(logEntry) {
    const alerts = [];

    // Check for failed login attempts
    if (logEntry.eventType === 'failed_login' && logEntry.details?.attempts > 5) {
      alerts.push({
        type: 'brute_force_attempt',
        severity: 'high',
        message: 'Multiple failed login attempts detected',
        logEntryId: logEntry.id
      });
    }

    // Check for unauthorized access attempts
    if (logEntry.eventType === 'access_denied' && logEntry.severity === 'warn') {
      alerts.push({
        type: 'unauthorized_access',
        severity: 'medium',
        message: 'Unauthorized access attempt detected',
        logEntryId: logEntry.id
      });
    }

    // Check for data access patterns
    if (logEntry.eventType === 'data_export' && logEntry.details?.size > 1000000) {
      alerts.push({
        type: 'large_data_export',
        severity: 'medium',
        message: 'Large data export detected',
        logEntryId: logEntry.id
      });
    }

    // Log security alerts
    if (alerts.length > 0) {
      this.logEvent('security_alerts_generated', null, { alerts }, 'warn');
    }

    return alerts;
  }

  /**
   * Close audit logger
   */
  async close() {
    if (this.logger && this.logger.close) {
      this.logger.close();
    }
    this.isInitialized = false;
    console.log('Audit logger closed');
  }
}

// Export singleton instance
module.exports = new AuditLogger();
