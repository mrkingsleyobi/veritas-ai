import React from 'react';
import './ResultsDisplay.css';

interface DetectionResult {
  id: string;
  fileName: string;
  isDeepfake: boolean;
  confidence: number;
  analysisDetails: {
    visualAnomalies: number;
    temporalInconsistencies: number;
    audioVisualMismatch: number;
  };
  processingTime: number;
  timestamp: string;
}

interface ResultsDisplayProps {
  results: DetectionResult[];
  onCompare: (resultId: string) => void;
  onViewReport: (resultId: string) => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onCompare, onViewReport }) => {
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10b981'; // green
    if (confidence >= 0.5) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  return (
    <div className="results-display">
      <h3>Detection Results</h3>

      {results.length === 0 ? (
        <div className="empty-results">
          <p>No detection results available yet</p>
        </div>
      ) : (
        <div className="results-grid">
          {results.map((result) => (
            <div key={result.id} className="result-card">
              <div className="result-header">
                <h4 className="file-name" title={result.fileName}>
                  {result.fileName}
                </h4>
                <span className={`status-badge ${result.isDeepfake ? 'deepfake' : 'authentic'}`}>
                  {result.isDeepfake ? 'DEEPFAKE' : 'AUTHENTIC'}
                </span>
              </div>

              <div className="confidence-section">
                <div className="confidence-label">
                  Confidence Level
                </div>
                <div className="confidence-value">
                  <span
                    className="confidence-percent"
                    style={{ color: getConfidenceColor(result.confidence) }}
                  >
                    {formatConfidence(result.confidence)}
                  </span>
                  <div className="confidence-bar">
                    <div
                      className={`confidence-fill confidence-${getConfidenceLevel(result.confidence)}`}
                      style={{ width: `${result.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Visual Anomalies</span>
                  <span className="detail-value">{result.analysisDetails.visualAnomalies}/10</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Temporal Issues</span>
                  <span className="detail-value">{result.analysisDetails.temporalInconsistencies}/10</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Audio-Visual Mismatch</span>
                  <span className="detail-value">{result.analysisDetails.audioVisualMismatch}/10</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Processing Time</span>
                  <span className="detail-value">{result.processingTime}ms</span>
                </div>
              </div>

              <div className="result-actions">
                <button
                  className="action-btn compare-btn"
                  onClick={() => onCompare(result.id)}
                >
                  Compare
                </button>
                <button
                  className="action-btn report-btn"
                  onClick={() => onViewReport(result.id)}
                >
                  Detailed Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;