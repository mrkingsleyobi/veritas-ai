import React, { useState, useRef, useCallback } from 'react';
import './FileUpload.css';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  accept = 'image/*,video/*',
  multiple = true,
  maxFiles = 10
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: FileList): File[] => {
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file type
      if (accept && !accept.split(',').some(type => file.type.match(type.replace('*', '.*')))) {
        setError(`Invalid file type: ${file.name}`);
        continue;
      }

      // Check file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        setError(`File too large: ${file.name} (max 100MB)`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length + (fileInputRef.current?.files?.length || 0) > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return [];
    }

    return validFiles;
  };

  const handleFiles = (files: FileList) => {
    setError(null);
    const validFiles = validateFiles(files);

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [onFilesSelected]);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`file-upload ${isDragActive ? 'drag-active' : ''}`}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={triggerFileInput}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onFileInputChange}
        className="file-input"
      />

      <div className="upload-content">
        <div className="upload-icon">📁</div>
        <p className="upload-text">
          {isDragActive
            ? 'Drop files here'
            : 'Drag & drop files here or click to browse'}
        </p>
        <p className="upload-hint">
          Supports images and videos (max 100MB each)
        </p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;