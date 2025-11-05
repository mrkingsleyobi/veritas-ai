import React, { useState } from 'react';

const LogExport = ({ logs = [], onExport }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportOptions, setExportOptions] = useState({
    includeHeaders: true,
    dateRange: { start: '', end: '' },
    eventType: '',
    severity: '',
    maxRecords: 1000
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  const formatOptions = [
    { value: 'csv', label: 'CSV (Comma Separated Values)' },
    { value: 'json', label: 'JSON (JavaScript Object Notation)' },
    { value: 'pdf', label: 'PDF (Portable Document Format)' },
    { value: 'xlsx', label: 'Excel (XLSX)' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus('Preparing export...');

    try {
      // Simulate export processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, this would call an API endpoint
      setExportStatus(`Exporting ${logs.length} records as ${exportFormat.toUpperCase()}...`);

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate mock file download
      const fileName = `audit-logs-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      setExportStatus(`Export completed: ${fileName}`);

      // Simulate file download
      setTimeout(() => {
        setExportStatus('');
        setIsExporting(false);
      }, 3000);

      if (onExport) {
        onExport({ format: exportFormat, fileName, recordCount: logs.length });
      }
    } catch (error) {
      setExportStatus('Export failed: ' + error.message);
      setIsExporting(false);
    }
  };

  const handleOptionChange = (option, value) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  return (
    <div className="log-export">
      <div className="export-header">
        <h3>Export Audit Logs</h3>
        <p>Download audit logs in various formats for offline analysis</p>
      </div>

      <div className="export-form">
        <div className="form-section">
          <h4>Export Format</h4>
          <div className="format-options">
            {formatOptions.map(format => (
              <div
                key={format.value}
                className={`format-option ${exportFormat === format.value ? 'selected' : ''}`}
                onClick={() => setExportFormat(format.value)}
              >
                <div className="format-info">
                  <span className="format-name">{format.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h4>Export Options</h4>
          <div className="export-options">
            <div className="option-group">
              <label>
                <input
                  type="checkbox"
                  checked={exportOptions.includeHeaders}
                  onChange={(e) => handleOptionChange('includeHeaders', e.target.checked)}
                />
                Include Headers
              </label>
            </div>

            <div className="option-group">
              <label>Max Records:</label>
              <input
                type="number"
                value={exportOptions.maxRecords}
                onChange={(e) => handleOptionChange('maxRecords', Number(e.target.value))}
                min="1"
                max="10000"
              />
            </div>

            <div className="option-group">
              <label>Date Range:</label>
              <div className="date-range-inputs">
                <input
                  type="date"
                  value={exportOptions.dateRange.start}
                  onChange={(e) => handleOptionChange('dateRange', { ...exportOptions.dateRange, start: e.target.value })}
                />
                <span>to</span>
                <input
                  type="date"
                  value={exportOptions.dateRange.end}
                  onChange={(e) => handleOptionChange('dateRange', { ...exportOptions.dateRange, end: e.target.value })}
                />
              </div>
            </div>

            <div className="option-group">
              <label>Event Type:</label>
              <select
                value={exportOptions.eventType}
                onChange={(e) => handleOptionChange('eventType', e.target.value)}
              >
                <option value="">All Event Types</option>
                <option value="USER_LOGIN">User Login</option>
                <option value="FILE_ACCESS">File Access</option>
                <option value="DATA_MODIFICATION">Data Modification</option>
                <option value="SYSTEM_UPDATE">System Update</option>
                <option value="SECURITY_ALERT">Security Alert</option>
              </select>
            </div>

            <div className="option-group">
              <label>Severity:</label>
              <select
                value={exportOptions.severity}
                onChange={(e) => handleOptionChange('severity', e.target.value)}
              >
                <option value="">All Severities</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        <div className="export-actions">
          <button
            className="export-btn"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export Logs'}
          </button>

          {exportStatus && (
            <div className={`export-status ${exportStatus.includes('failed') ? 'error' : 'success'}`}>
              {exportStatus}
            </div>
          )}
        </div>
      </div>

      <div className="export-info">
        <h4>Export Information</h4>
        <div className="info-cards">
          <div className="info-card">
            <h5>File Size Estimate</h5>
            <p>~{Math.round(logs.length * 0.5)} KB</p>
          </div>
          <div className="info-card">
            <h5>Record Count</h5>
            <p>{logs.length} records</p>
          </div>
          <div className="info-card">
            <h5>Supported Formats</h4>
            <p>CSV, JSON, PDF, XLSX</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogExport;