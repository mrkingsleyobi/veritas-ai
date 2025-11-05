import React, { useState } from 'react';

const AuditReportGenerator = () => {
  const [reportConfig, setReportConfig] = useState({
    reportType: 'summary',
    dateRange: { start: '', end: '' },
    eventType: '',
    severity: '',
    userId: '',
    format: 'pdf',
    includeCharts: true,
    includeRawData: false,
    schedule: 'immediate'
  });
  const [generatedReports, setGeneratedReports] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  const reportTypes = [
    { value: 'summary', label: 'Summary Report', description: 'High-level overview of audit activity' },
    { value: 'detailed', label: 'Detailed Report', description: 'Comprehensive log analysis with all events' },
    { value: 'compliance', label: 'Compliance Report', description: 'Regulatory compliance status and findings' },
    { value: 'security', label: 'Security Report', description: 'Security events and threat analysis' },
    { value: 'user-activity', label: 'User Activity Report', description: 'User behavior and access patterns' }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF' },
    { value: 'csv', label: 'CSV' },
    { value: 'xlsx', label: 'Excel' },
    { value: 'json', label: 'JSON' }
  ];

  const scheduleOptions = [
    { value: 'immediate', label: 'Generate Now' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setGenerationStatus('Preparing report configuration...');

    try {
      // Simulate report generation process
      setGenerationStatus('Analyzing audit data...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      setGenerationStatus('Generating charts and visualizations...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      setGenerationStatus('Formatting report...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create mock report
      const newReport = {
        id: Date.now(),
        name: `${reportConfig.reportType.replace('-', ' ')} Report`,
        generatedAt: new Date().toISOString(),
        type: reportConfig.reportType,
        format: reportConfig.format,
        size: `${Math.floor(Math.random() * 5000) + 1000} KB`,
        pages: Math.floor(Math.random() * 50) + 10
      };

      setGeneratedReports(prev => [newReport, ...prev]);
      setGenerationStatus(`Report generated successfully: ${newReport.name}`);

      // Reset status after delay
      setTimeout(() => {
        setGenerationStatus('');
        setIsGenerating(false);
      }, 3000);
    } catch (error) {
      setGenerationStatus('Report generation failed: ' + error.message);
      setIsGenerating(false);
    }
  };

  const handleConfigChange = (field, value) => {
    setReportConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateRangeChange = (rangeType, value) => {
    setReportConfig(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [rangeType]: value
      }
    }));
  };

  const downloadReport = (reportId) => {
    const report = generatedReports.find(r => r.id === reportId);
    if (report) {
      // Simulate download
      alert(`Downloading ${report.name}.${report.format}`);
    }
  };

  const deleteReport = (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      setGeneratedReports(prev => prev.filter(r => r.id !== reportId));
    }
  };

  return (
    <div className="audit-report-generator">
      <div className="header">
        <h2>Audit Report Generator</h2>
        <p>Create customized reports for compliance, security, and operational analysis</p>
      </div>

      <div className="report-config">
        <h3>Report Configuration</h3>
        <div className="config-form">
          <div className="form-section">
            <h4>Report Type</h4>
            <div className="report-type-options">
              {reportTypes.map(type => (
                <div
                  key={type.value}
                  className={`type-option ${reportConfig.reportType === type.value ? 'selected' : ''}`}
                  onClick={() => handleConfigChange('reportType', type.value)}
                >
                  <h5>{type.label}</h5>
                  <p>{type.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h4>Filters</h4>
            <div className="filter-grid">
              <div className="filter-group">
                <label>Date Range</label>
                <div className="date-range-inputs">
                  <input
                    type="date"
                    value={reportConfig.dateRange.start}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={reportConfig.dateRange.end}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Event Type</label>
                <select
                  value={reportConfig.eventType}
                  onChange={(e) => handleConfigChange('eventType', e.target.value)}
                >
                  <option value="">All Event Types</option>
                  <option value="USER_LOGIN">User Login</option>
                  <option value="FILE_ACCESS">File Access</option>
                  <option value="DATA_MODIFICATION">Data Modification</option>
                  <option value="SYSTEM_UPDATE">System Update</option>
                  <option value="SECURITY_ALERT">Security Alert</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Severity</label>
                <select
                  value={reportConfig.severity}
                  onChange={(e) => handleConfigChange('severity', e.target.value)}
                >
                  <option value="">All Severities</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="filter-group">
                <label>User ID</label>
                <input
                  type="text"
                  value={reportConfig.userId}
                  onChange={(e) => handleConfigChange('userId', e.target.value)}
                  placeholder="Filter by user ID"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Output Options</h4>
            <div className="output-options">
              <div className="option-group">
                <label>Format:</label>
                <select
                  value={reportConfig.format}
                  onChange={(e) => handleConfigChange('format', e.target.value)}
                >
                  {formatOptions.map(format => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="option-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={reportConfig.includeCharts}
                    onChange={(e) => handleConfigChange('includeCharts', e.target.checked)}
                  />
                  Include Charts & Visualizations
                </label>
              </div>

              <div className="option-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={reportConfig.includeRawData}
                    onChange={(e) => handleConfigChange('includeRawData', e.target.checked)}
                  />
                  Include Raw Data
                </label>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Scheduling</h4>
            <div className="schedule-options">
              <div className="option-group">
                <label>Generate:</label>
                <select
                  value={reportConfig.schedule}
                  onChange={(e) => handleConfigChange('schedule', e.target.value)}
                >
                  {scheduleOptions.map(schedule => (
                    <option key={schedule.value} value={schedule.value}>
                      {schedule.label}
                    </option>
                  ))}
                </select>
              </div>

              {reportConfig.schedule !== 'immediate' && (
                <div className="option-group">
                  <label>Delivery Email:</label>
                  <input
                    type="email"
                    placeholder="recipient@example.com"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="generate-actions">
            <button
              className="generate-btn"
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating Report...' : 'Generate Report'}
            </button>

            {generationStatus && (
              <div className={`status-message ${generationStatus.includes('failed') ? 'error' : 'success'}`}>
                {generationStatus}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="generated-reports">
        <h3>Generated Reports</h3>
        {generatedReports.length > 0 ? (
          <div className="reports-list">
            {generatedReports.map(report => (
              <div key={report.id} className="report-card">
                <div className="report-header">
                  <h4>{report.name}</h4>
                  <span className="report-format">{report.format.toUpperCase()}</span>
                </div>
                <div className="report-details">
                  <div className="detail-item">
                    <span className="detail-label">Generated:</span>
                    <span className="detail-value">
                      {new Date(report.generatedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Size:</span>
                    <span className="detail-value">{report.size}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Pages:</span>
                    <span className="detail-value">{report.pages}</span>
                  </div>
                </div>
                <div className="report-actions">
                  <button
                    className="download-btn"
                    onClick={() => downloadReport(report.id)}
                  >
                    Download
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteReport(report.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-reports">
            <p>No reports generated yet</p>
            <button
              className="generate-btn"
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              Generate Your First Report
            </button>
          </div>
        )}
      </div>

      <div className="report-templates">
        <h3>Report Templates</h3>
        <div className="templates-grid">
          <div className="template-card">
            <h4>Compliance Audit Template</h4>
            <p>Pre-configured for regulatory compliance reporting</p>
            <button className="use-template-btn">Use Template</button>
          </div>
          <div className="template-card">
            <h4>Security Incident Template</h4>
            <p>Focused on security events and threat analysis</p>
            <button className="use-template-btn">Use Template</button>
          </div>
          <div className="template-card">
            <h4>User Behavior Template</h4>
            <p>Analyze user activities and access patterns</p>
            <button className="use-template-btn">Use Template</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditReportGenerator;