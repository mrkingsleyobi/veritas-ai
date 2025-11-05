import React, { useState } from 'react';
import './ExportResults.css';

interface ExportResultsProps {
  results: any[];
  onExport: (format: 'csv' | 'json' | 'pdf', options: ExportOptions) => void;
  onCancel: () => void;
}

interface ExportOptions {
  includeDetails: boolean;
  includeVisualizations: boolean;
  includeMetadata: boolean;
  dateFormat: 'iso' | 'utc' | 'local';
  fileName: string;
}

const ExportResults: React.FC<ExportResultsProps> = ({ results, onExport, onCancel }) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeDetails: true,
    includeVisualizations: false,
    includeMetadata: true,
    dateFormat: 'iso',
    fileName: `deepfake-results-${new Date().toISOString().split('T')[0]}`
  });

  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const handleOptionChange = (option: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const handleExport = () => {
    setIsExporting(true);
    onExport(selectedFormat, exportOptions);
    // In a real implementation, we would handle the export completion here
    // For now, we'll just simulate the process
    setTimeout(() => {
      setIsExporting(false);
    }, 1500);
  };

  const getResultSummary = () => {
    const total = results.length;
    const deepfakes = results.filter(r => r.isDeepfake).length;
    const authentic = total - deepfakes;

    return {
      total,
      deepfakes,
      authentic,
      deepfakeRate: total > 0 ? (deepfakes / total) * 100 : 0
    };
  };

  const summary = getResultSummary();

  return (
    <div className="export-results">
      <div className="export-header">
        <h2>Export Results</h2>
        <button className="close-btn" onClick={onCancel}>
          ×
        </button>
      </div>

      <div className="export-content">
        <div className="export-summary">
          <h3>Summary</h3>
          <div className="summary-stats">
            <div className="stat-card">
              <span className="stat-label">Total Files</span>
              <span className="stat-value">{summary.total}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Deepfakes</span>
              <span className="stat-value">{summary.deepfakes}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Authentic</span>
              <span className="stat-value">{summary.authentic}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Deepfake Rate</span>
              <span className="stat-value">{summary.deepfakeRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="export-format">
          <h3>Export Format</h3>
          <div className="format-options">
            {(['csv', 'json', 'pdf'] as const).map(format => (
              <label key={format} className="format-option">
                <input
                  type="radio"
                  name="format"
                  value={format}
                  checked={selectedFormat === format}
                  onChange={() => setSelectedFormat(format)}
                />
                <span className="format-label">
                  {format.toUpperCase()}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="export-options">
          <h3>Export Options</h3>
          <div className="options-grid">
            <label className="option-item">
              <input
                type="checkbox"
                checked={exportOptions.includeDetails}
                onChange={(e) => handleOptionChange('includeDetails', e.target.checked)}
              />
              <span className="option-label">Include detailed analysis</span>
            </label>

            <label className="option-item">
              <input
                type="checkbox"
                checked={exportOptions.includeVisualizations}
                onChange={(e) => handleOptionChange('includeVisualizations', e.target.checked)}
              />
              <span className="option-label">Include visualizations</span>
            </label>

            <label className="option-item">
              <input
                type="checkbox"
                checked={exportOptions.includeMetadata}
                onChange={(e) => handleOptionChange('includeMetadata', e.target.checked)}
              />
              <span className="option-label">Include metadata</span>
            </label>

            <div className="option-item">
              <label>Date Format:</label>
              <select
                value={exportOptions.dateFormat}
                onChange={(e) => handleOptionChange('dateFormat', e.target.value as any)}
                className="format-select"
              >
                <option value="iso">ISO 8601</option>
                <option value="utc">UTC</option>
                <option value="local">Local Time</option>
              </select>
            </div>

            <div className="option-item full-width">
              <label>File Name:</label>
              <input
                type="text"
                value={exportOptions.fileName}
                onChange={(e) => handleOptionChange('fileName', e.target.value)}
                className="filename-input"
              />
            </div>
          </div>
        </div>

        <div className="export-actions">
          <button className="cancel-btn" onClick={onCancel} disabled={isExporting}>
            Cancel
          </button>
          <button
            className="export-btn"
            onClick={handleExport}
            disabled={isExporting || results.length === 0}
          >
            {isExporting ? (
              <>
                <span className="spinner"></span>
                Exporting...
              </>
            ) : (
              `Export as ${selectedFormat.toUpperCase()}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportResults;