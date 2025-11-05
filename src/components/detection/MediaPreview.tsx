import React, { useState, useEffect } from 'react';
import './MediaPreview.css';

interface MediaPreviewProps {
  file: File;
  onRemove?: () => void;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ file, onRemove }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Clean up object URL on unmount
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load preview');
  };

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  return (
    <div className="media-preview">
      <div className="preview-header">
        <span className="file-name" title={file.name}>
          {file.name}
        </span>
        {onRemove && (
          <button
            className="remove-btn"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Remove file"
          >
            ×
          </button>
        )}
      </div>

      <div className="preview-content">
        {isLoading && (
          <div className="loading-placeholder">
            <div className="spinner"></div>
            <p>Loading preview...</p>
          </div>
        )}

        {error && (
          <div className="error-placeholder">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
          </div>
        )}

        {previewUrl && isImage && !error && (
          <img
            src={previewUrl}
            alt={`Preview of ${file.name}`}
            onLoad={handleLoad}
            onError={handleError}
            className={isLoading ? 'hidden' : ''}
          />
        )}

        {previewUrl && isVideo && !error && (
          <video
            src={previewUrl}
            controls
            onLoadedData={handleLoad}
            onError={handleError}
            className={isLoading ? 'hidden' : ''}
          />
        )}

        {!isImage && !isVideo && !error && (
          <div className="file-placeholder">
            <div className="file-icon">📄</div>
            <p>File preview not available</p>
          </div>
        )}
      </div>

      <div className="file-info">
        <span className="file-type">{file.type || 'Unknown type'}</span>
        <span className="file-size">
          {(file.size / (1024 * 1024)).toFixed(2)} MB
        </span>
      </div>
    </div>
  );
};

export default MediaPreview;