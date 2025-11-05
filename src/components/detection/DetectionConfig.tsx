import React, { useState } from 'react';
import './DetectionConfig.css';

interface DetectionConfigProps {
  onConfigChange: (config: DetectionConfig) => void;
}

export interface DetectionConfig {
  sensitivity: 'low' | 'medium' | 'high';
  includeMetadata: boolean;
  includeVisualAnalysis: boolean;
  includeAudioAnalysis: boolean;
  batchProcessing: boolean;
  notificationEmail?: string;
}

const DetectionConfig: React.FC<DetectionConfigProps> = ({ onConfigChange }) => {
  const [config, setConfig] = useState<DetectionConfig>({
    sensitivity: 'medium',
    includeMetadata: true,
    includeVisualAnalysis: true,
    includeAudioAnalysis: true,
    batchProcessing: false,
    notificationEmail: ''
  });

  const handleConfigChange = (newConfig: Partial<DetectionConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    onConfigChange(updatedConfig);
  };

  return (
    <div className="detection-config">
      <h3>Detection Configuration</h3>

      <div className="config-section">
        <h4>Sensitivity Level</h4>
        <div className="radio-group">
          {(['low', 'medium', 'high'] as const).map((level) => (
            <label key={level} className="radio-label">
              <input
                type="radio"
                name="sensitivity"
                value={level}
                checked={config.sensitivity === level}
                onChange={() => handleConfigChange({ sensitivity: level })}
              />
              <span className="radio-text">
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="config-section">
        <h4>Analysis Options</h4>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={config.includeMetadata}
              onChange={(e) => handleConfigChange({ includeMetadata: e.target.checked })}
            />
            <span className="checkbox-text">Include Metadata Analysis</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={config.includeVisualAnalysis}
              onChange={(e) => handleConfigChange({ includeVisualAnalysis: e.target.checked })}
            />
            <span className="checkbox-text">Include Visual Analysis</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={config.includeAudioAnalysis}
              onChange={(e) => handleConfigChange({ includeAudioAnalysis: e.target.checked })}
            />
            <span className="checkbox-text">Include Audio Analysis</span>
          </label>
        </div>
      </div>

      <div className="config-section">
        <h4>Processing Options</h4>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={config.batchProcessing}
            onChange={(e) => handleConfigChange({ batchProcessing: e.target.checked })}
          />
          <span className="checkbox-text">Enable Batch Processing</span>
        </label>
      </div>

      <div className="config-section">
        <h4>Notifications</h4>
        <input
          type="email"
          placeholder="Email for notifications (optional)"
          value={config.notificationEmail || ''}
          onChange={(e) => handleConfigChange({ notificationEmail: e.target.value })}
          className="email-input"
        />
      </div>
    </div>
  );
};

export default DetectionConfig;