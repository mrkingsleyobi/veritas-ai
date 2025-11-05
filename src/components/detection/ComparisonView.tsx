import React, { useState } from 'react';
import './ComparisonView.css';

interface ComparisonData {
  original: {
    id: string;
    url: string;
    name: string;
    type: 'image' | 'video';
  };
  detected: {
    id: string;
    url: string;
    name: string;
    type: 'image' | 'video';
    highlights: Array<{
      id: string;
      area: { x: number; y: number; width: number; height: number };
      confidence: number;
      description: string;
    }>;
  };
  analysis: {
    overallConfidence: number;
    visualAnomalies: number;
    temporalInconsistencies: number;
    audioVisualMismatch: number;
  };
}

interface ComparisonViewProps {
  comparisonData: ComparisonData;
  onClose: () => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ comparisonData, onClose }) => {
  const [activeTab, setActiveTab] = useState<'side-by-side' | 'overlay' | 'details'>('side-by-side');
  const [overlayOpacity, setOverlayOpacity] = useState(0.7);

  const renderMedia = (media: any, isDetected: boolean = false) => {
    if (media.type === 'image') {
      return (
        <div className="media-container">
          <img
            src={media.url}
            alt={media.name}
            className="comparison-media"
          />
          {isDetected && comparisonData.detected.highlights.map((highlight) => (
            <div
              key={highlight.id}
              className="highlight-overlay"
              style={{
                left: `${highlight.area.x}%`,
                top: `${highlight.area.y}%`,
                width: `${highlight.area.width}%`,
                height: `${highlight.area.height}%`,
                opacity: overlayOpacity,
              }}
            >
              <div className="highlight-info">
                <span className="confidence-badge">
                  {(highlight.confidence * 100).toFixed(0)}%
                </span>
                <div className="highlight-description">
                  {highlight.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="media-container">
          <video
            src={media.url}
            controls
            className="comparison-media"
          />
        </div>
      );
    }
  };

  return (
    <div className="comparison-view">
      <div className="comparison-header">
        <h2>Content Comparison</h2>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="comparison-tabs">
        <button
          className={`tab-btn ${activeTab === 'side-by-side' ? 'active' : ''}`}
          onClick={() => setActiveTab('side-by-side')}
        >
          Side by Side
        </button>
        <button
          className={`tab-btn ${activeTab === 'overlay' ? 'active' : ''}`}
          onClick={() => setActiveTab('overlay')}
        >
          Overlay
        </button>
        <button
          className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Analysis Details
        </button>
      </div>

      {activeTab === 'side-by-side' && (
        <div className="side-by-side-view">
          <div className="media-column">
            <h3>Original</h3>
            {renderMedia(comparisonData.original)}
            <p className="media-name">{comparisonData.original.name}</p>
          </div>
          <div className="media-column">
            <h3>Detected Version</h3>
            {renderMedia(comparisonData.detected, true)}
            <p className="media-name">{comparisonData.detected.name}</p>
          </div>
        </div>
      )}

      {activeTab === 'overlay' && (
        <div className="overlay-view">
          <div className="overlay-controls">
            <label>
              Highlight Opacity:
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
              />
            </label>
          </div>
          <div className="overlay-container">
            <div className="media-container">
              <img
                src={comparisonData.original.url}
                alt={comparisonData.original.name}
                className="base-media"
              />
              <img
                src={comparisonData.detected.url}
                alt={comparisonData.detected.name}
                className="overlay-media"
                style={{ opacity: overlayOpacity }}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="details-view">
          <div className="analysis-summary">
            <h3>Analysis Summary</h3>
            <div className="confidence-score">
              <div className="score-label">Overall Confidence</div>
              <div className="score-value">
                {(comparisonData.analysis.overallConfidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Visual Anomalies</div>
              <div className="metric-value">{comparisonData.analysis.visualAnomalies}/10</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Temporal Issues</div>
              <div className="metric-value">{comparisonData.analysis.temporalInconsistencies}/10</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Audio-Visual Mismatch</div>
              <div className="metric-value">{comparisonData.analysis.audioVisualMismatch}/10</div>
            </div>
          </div>

          <div className="highlights-section">
            <h4>Detected Anomalies</h4>
            <div className="highlights-list">
              {comparisonData.detected.highlights.map((highlight) => (
                <div key={highlight.id} className="highlight-item">
                  <div className="highlight-header">
                    <span className="highlight-confidence">
                      {(highlight.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <p className="highlight-description">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonView;