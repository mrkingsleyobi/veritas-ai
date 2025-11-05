/**
 * Compliance Reporting Dashboard
 *
 * This module provides a compliance reporting dashboard for:
 * - Regulatory requirement tracking
 * - Audit trail visualization
 * - Security metrics monitoring
 * - Compliance status reporting
 */

const auditLogger = require('../logging/auditLogger');
const gdpr = require('./gdpr');
const soc2 = require('./soc2');

class ComplianceDashboard {
  constructor() {
    this.regulations = {
      gdpr: {
        name: 'GDPR',
        requirements: [
          'Data Protection by Design',
          'Right to Access',
          'Right to Erasure',
          'Data Portability',
          'Breach Notification',
          'Privacy by Default'
        ],
        status: 'compliant',
        lastAudit: null
      },
      soc2: {
        name: 'SOC 2',
        requirements: [
          'Security',
          'Availability',
          'Processing Integrity',
          'Confidentiality',
          'Privacy'
        ],
        status: 'compliant',
        lastAudit: null
      },
      hipaa: {
        name: 'HIPAA',
        requirements: [
          'Administrative Safeguards',
          'Physical Safeguards',
          'Technical Safeguards',
          'Breach Notification',
          'Privacy Rule'
        ],
        status: 'not_applicable',
        lastAudit: null
      }
    };
  }

  /**
   * Generate compliance dashboard data
   * @returns {Object} Dashboard data
   */
  async generateDashboard() {
    try {
      // Get recent audit logs
      const recentLogs = await auditLogger.getAuditLogs(
        { startDate: this._getPastDate(30) }, // Last 30 days
        50,
        0
      );

      // Get compliance metrics
      const metrics = await this._getComplianceMetrics(recentLogs.logs);

      // Get security metrics
      const securityMetrics = soc2.checkAvailability();

      // Get GDPR compliance status
      const gdprStatus = await this._getGDPRStatus();

      // Generate dashboard
      const dashboard = {
        id: this._generateId(),
        generatedAt: new Date().toISOString(),
        period: 'last_30_days',
        overview: {
          totalEvents: recentLogs.total,
          securityEvents: metrics.securityEvents,
          complianceEvents: metrics.complianceEvents,
          systemStatus: securityMetrics.status,
          complianceStatus: this._calculateOverallCompliance()
        },
        regulations: this.regulations,
        metrics: {
          ...metrics,
          security: securityMetrics
        },
        recentActivity: recentLogs.logs.slice(0, 10), // Last 10 events
        gdpr: gdprStatus,
        alerts: this._generateAlerts(recentLogs.logs)
      };

      return dashboard;
    } catch (error) {
      console.error('Dashboard generation error:', error);
      throw error;
    }
  }

  /**
   * Get compliance metrics from audit logs
   * @param {Array} logs - Audit logs
   * @returns {Object} Compliance metrics
   */
  async _getComplianceMetrics(logs) {
    const metrics = {
      securityEvents: 0,
      complianceEvents: 0,
      dataAccessEvents: 0,
      dataModificationEvents: 0,
      failedAccessAttempts: 0,
      successfulLogins: 0,
      mfaEvents: 0,
      auditLogIntegrity: 0
    };

    logs.forEach(log => {
      // Count security events
      if (log.eventType.startsWith('security_') || log.severity === 'warn' || log.severity === 'error') {
        metrics.securityEvents++;
      }

      // Count compliance events
      if (log.eventType.startsWith('compliance_') || log.eventType.startsWith('gdpr_') || log.eventType.startsWith('soc2_')) {
        metrics.complianceEvents++;
      }

      // Count data access events
      if (log.eventType === 'data_access' || log.eventType === 'data_retrieval') {
        metrics.dataAccessEvents++;
      }

      // Count data modification events
      if (log.eventType === 'data_modify' || log.eventType === 'data_delete') {
        metrics.dataModificationEvents++;
      }

      // Count failed access attempts
      if (log.eventType === 'failed_login' || log.eventType === 'access_denied') {
        metrics.failedAccessAttempts++;
      }

      // Count successful logins
      if (log.eventType === 'successful_login') {
        metrics.successfulLogins++;
      }

      // Count MFA events
      if (log.eventType.startsWith('mfa_')) {
        metrics.mfaEvents++;
      }
    });

    // Calculate audit log integrity
    const validSignatures = logs.filter(log => log.signatureValid).length;

    metrics.auditLogIntegrity = logs.length > 0 ? (validSignatures / logs.length) * 100 : 100;

    return metrics;
  }

  /**
   * Get GDPR compliance status
   * @returns {Object} GDPR status
   */
  async _getGDPRStatus() {
    // In a real implementation, this would check actual GDPR compliance status
    return {
      status: 'compliant',
      lastAssessment: new Date().toISOString(),
      requirements: {
        dataProtection: 'implemented',
        userRights: 'implemented',
        breachNotification: 'implemented',
        dataTransfer: 'implemented'
      },
      metrics: {
        dataSubjects: 0, // Would be populated with actual data
        dataRequests: 0, // Would be populated with actual data
        dataDeletions: 0 // Would be populated with actual data
      }
    };
  }

  /**
   * Calculate overall compliance status
   * @returns {string} Compliance status
   */
  _calculateOverallCompliance() {
    const regulationStatuses = Object.values(this.regulations).map(reg => reg.status);

    if (regulationStatuses.every(status => status === 'compliant')) {
      return 'compliant';
    } else if (regulationStatuses.some(status => status === 'non_compliant')) {
      return 'non_compliant';
    } else {
      return 'partially_compliant';
    }
  }

  /**
   * Generate alerts from audit logs
   * @param {Array} logs - Audit logs
   * @returns {Array} Alerts
   */
  _generateAlerts(logs) {
    const alerts = [];

    // Check for high-severity events
    const highSeverityEvents = logs.filter(log => log.severity === 'error');

    if (highSeverityEvents.length > 0) {
      alerts.push({
        type: 'high_severity_events',
        severity: 'high',
        count: highSeverityEvents.length,
        message: `${highSeverityEvents.length} high-severity events detected`,
        timestamp: new Date().toISOString()
      });
    }

    // Check for failed login attempts
    const failedLogins = logs.filter(log => log.eventType === 'failed_login');

    if (failedLogins.length > 10) {
      alerts.push({
        type: 'failed_login_attempts',
        severity: 'medium',
        count: failedLogins.length,
        message: `${failedLogins.length} failed login attempts detected`,
        timestamp: new Date().toISOString()
      });
    }

    // Check for data export events
    const dataExports = logs.filter(log => log.eventType === 'data_export');

    if (dataExports.length > 5) {
      alerts.push({
        type: 'data_exports',
        severity: 'medium',
        count: dataExports.length,
        message: `${dataExports.length} data export events detected`,
        timestamp: new Date().toISOString()
      });
    }

    return alerts;
  }

  /**
   * Get date from specified days ago
   * @param {number} days - Number of days ago
   * @returns {string} ISO date string
   */
  _getPastDate(days) {
    const date = new Date();

    date.setDate(date.getDate() - days);

    return date.toISOString();
  }

  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  _generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Update regulation status
   * @param {string} regulation - Regulation name
   * @param {string} status - New status
   * @param {Date} lastAudit - Last audit date
   */
  updateRegulationStatus(regulation, status, lastAudit = new Date()) {
    if (this.regulations[regulation]) {
      this.regulations[regulation].status = status;
      this.regulations[regulation].lastAudit = lastAudit.toISOString();
    }
  }

  /**
   * Get regulation details
   * @param {string} regulation - Regulation name
   * @returns {Object} Regulation details
   */
  getRegulationDetails(regulation) {
    return this.regulations[regulation] || null;
  }

  /**
   * Export dashboard data
   * @param {string} format - Export format
   * @returns {string} Exported data
   */
  async exportDashboard(format = 'json') {
    const dashboard = await this.generateDashboard();

    if (format === 'json') {
      return JSON.stringify(dashboard, null, 2);
    } else if (format === 'csv') {
      // Simplified CSV export
      return this._convertToCSV(dashboard);
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Convert dashboard data to CSV
   * @param {Object} dashboard - Dashboard data
   * @returns {string} CSV data
   */
  _convertToCSV(dashboard) {
    // This is a simplified CSV conversion
    // In a real implementation, you would convert the nested data structure to CSV
    return JSON.stringify(dashboard);
  }
}

// Export singleton instance
module.exports = new ComplianceDashboard();
