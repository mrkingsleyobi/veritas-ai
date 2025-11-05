import React from 'react';
import './AnalysisReport.css';

interface AnalysisReportProps {
  reportData: {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: string;
    processingDate: string;
    processingTime: number;
    isDeepfake: boolean;
    confidence: number;
    analysisDetails: {
      visualAnomalies: {
        score: number;
        findings: Array<{
          id: string;
          description: string;
          confidence: number;
          location?: { x: number; y: number; width: number; height: number };
        }>;
      };
      temporalInconsistencies: {
        score: number;
        findings: Array<{
          id: string;
          description: string;
          confidence: number;
          timestamp?: string;
        }>;
      };
      audioVisualMismatch: {
        score: number;
        findings: Array<{
          id: string;
          description: string;
          confidence: number;
        }>;
      };
      metadataAnalysis: {
        score: number;
        findings: Array<{
          id: string;
          description: string;
          confidence: number;
        }>;
      };
    };
    recommendations: string[];
    technicalDetails: {
      modelVersion: string;
      algorithmsUsed: string[];
      processingNodes: number;
    };
  };
  onClose: () => void;
  onExport: (format: 'pdf' | 'json') => void;
}

const AnalysisReport: React.FC<AnalysisReportProps> = ({ reportData, onClose, onExport }) => {
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10b981';
    if (confidence >= 0.5) return '#f59e0b';
    return '#ef4444';
  };

  const renderFindings = (findings: any[]) => {
    if (!findings || findings.length === 0) {
      return <p className="no-findings">No significant findings detected</p>;
    }

    return (
      <ul className="findings-list">
        {findings.map((finding) => (
          <li key={finding.id} className="finding-item">
            <div className="finding-header">
              <span
                className="finding-confidence"
                style={{ color: getConfidenceColor(finding.confidence) }}
              >
                {(finding.confidence * 100).toFixed(0)}%
              </span>
              {finding.location && (
                <span className="finding-location">
                  Location: {finding.location.x}, {finding.location.y}
                </span>
              )}
              {finding.timestamp && (
                <span className="finding-timestamp">
                  Timestamp: {finding.timestamp}
                </span>
              )}
            </div>
            <p className="finding-description">{finding.description}</p>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="analysis-report">
      <div className="report-header">
        <div className="report-title">
          <h2>Detailed Analysis Report</h2>
          <p>File: {reportData.fileName}</p>
        </div>
        <div className="report-actions">
          <button className="export-btn" onClick={() => onExport('pdf')}>
            Export PDF
          </button>
          <button className="export-btn" onClick={() => onExport('json')}>
            Export JSON
          </button>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
      </div>

      <div className="report-content">
        <div className="report-summary">
          <div className="summary-card">
            <h3>File Information</h3>
            <div className="summary-details">
              <div className="detail-row">
                <span className="detail-label">File Name:</span>
                <span className="detail-value">{reportData.fileName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">File Type:</span>
                <span className="detail-value">{reportData.fileType}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">File Size:</span>
                <span className="detail-value">{reportData.fileSize}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Processing Date:</span>
                <span className="detail-value">{reportData.processingDate}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Processing Time:</span>
                <span className="detail-value">{reportData.processingTime}ms</span>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <h3>Overall Assessment</h3>
            <div className="assessment-details">
              <div className="result-indicator">
                <span className={`result-badge ${reportData.isDeepfake ? 'deepfake' : 'authentic'}`}>
                  {reportData.isDeepfake ? 'DEEPFAKE DETECTED' : 'AUTHENTIC CONTENT'}
                </span>
              </div>
              <div className="confidence-section">
                <div className="confidence-label">Confidence Level</div>
                <div className="confidence-display">
                  <span
                    className="confidence-percent"
                    style={{ color: getConfidenceColor(reportData.confidence) }}
                  >
                    {(reportData.confidence * 100).toFixed(1)}%
                  </span>
                  <div className="confidence-bar">
                    <div
                      className={`confidence-fill confidence-${getConfidenceLevel(reportData.confidence)}`}
                      style={{ width: `${reportData.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="analysis-sections">
          <div className="analysis-section">
            <h3>Visual Anomalies Analysis</h3>
            <div className="analysis-score">
              Score: <span className="score-value">{reportData.analysisDetails.visualAnomalies.score}/10</span>
            </div>
            {renderFindings(reportData.analysisDetails.visualAnomalies.findings)}
          </div>

          <div className="analysis-section">
            <h3>Temporal Inconsistencies Analysis</h3>
            <div className="analysis-score">
              Score: <span className="score-value">{reportData.analysisDetails.temporalInconsistencies.score}/10</span>
            </div>
            {renderFindings(reportData.analysisDetails.temporalInconsistencies.findings)}
          </div>

          <div className="analysis-section">
            <h3>Audio-Visual Mismatch Analysis</h3>
            <div className="analysis-score">
              Score: <span className="score-value">{reportData.analysisDetails.audioVisualMismatch.score}/10</span>
            </div>
            {renderFindings(reportData.analysisDetails.audioVisualMismatch.findings)}
          </div>

          <div className="analysis-section">
            <h3>Metadata Analysis</h3>
            <div className="analysis-score">
              Score: <span className="score-value">{reportData.analysisDetails.metadataAnalysis.score}/10</span>
            </div>
            {renderFindings(reportData.analysisDetails.metadataAnalysis.findings)}
          </div>
        </div>

        <div className="recommendations-section">
          <h3>Recommendations</h3>
          {reportData.recommendations.length > 0 ? (
            <ul className="recommendations-list">
              {reportData.recommendations.map((recommendation, index) => (
                <li key={index} className="recommendation-item">
                  {recommendation}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-recommendations">No specific recommendations at this time</p>
          )}
        </div>

        <div className="technical-details">
          <h3>Technical Information</h3>
          <div className="tech-details-grid">
            <div className="tech-detail">
              <span className="tech-label">Model Version:</span>
              <span className="tech-value">{reportData.technicalDetails.modelVersion}</span>
            </div>
            <div className="tech-detail">
              <span className="tech-label">Algorithms Used:</span>
              <span className="tech-value">
                {reportData.technicalDetails.algorithmsUsed.join(', ')}
              </span>
            </div>
            <div className="tech-detail">
              <span className="tech-label">Processing Nodes:</span>
              <span className="tech-value">{reportData.technicalDetails.processingNodes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReport;