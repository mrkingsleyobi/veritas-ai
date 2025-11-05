import React from 'react';
import './ProgressTracker.css';

interface ProgressTrackerProps {
  files: Array<{
    id: string;
    name: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    result?: any;
  }>;
  onCancel: (fileId: string) => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ files, onCancel }) => {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Queued';
      case 'processing': return 'Processing';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '🕒';
      case 'processing': return '⚡';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="progress-tracker">
      <h3>Processing Progress</h3>
      <div className="progress-list">
        {files.length === 0 ? (
          <div className="empty-state">
            <p>No files currently being processed</p>
          </div>
        ) : (
          files.map((file) => (
            <div key={file.id} className="progress-item">
              <div className="file-info">
                <span className="file-icon">{getStatusIcon(file.status)}</span>
                <div className="file-details">
                  <span className="file-name" title={file.name}>
                    {file.name}
                  </span>
                  <span className="file-status">{getStatusText(file.status)}</span>
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-bar-container">
                  <div
                    className={`progress-bar progress-bar-${file.status}`}
                    style={{ width: `${file.progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{Math.round(file.progress)}%</span>
              </div>

              {file.status === 'processing' && (
                <button
                  className="cancel-btn"
                  onClick={() => onCancel(file.id)}
                  aria-label={`Cancel processing ${file.name}`}
                >
                  Cancel
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;