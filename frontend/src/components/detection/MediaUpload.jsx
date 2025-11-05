import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material'

const MediaUpload = ({ onFileSelect, onAnalyze, selectedFile, loading }) => {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      onFileSelect(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      onFileSelect(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleBrowseClick = () => {
    fileInputRef.current.click()
  }

  return (
    <div>
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleBrowseClick}
      >
        <CloudUploadIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-900">
            {selectedFile ? selectedFile.name : 'Upload media for analysis'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedFile
              ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
              : 'Drag and drop or click to browse'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supports images (JPG, PNG) and videos (MP4, MOV) up to 100MB
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*"
          onChange={handleFileChange}
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          disabled={!selectedFile || loading}
          onClick={onAnalyze}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            'Analyze Media'
          )}
        </button>
      </div>
    </div>
  )
}

MediaUpload.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
  onAnalyze: PropTypes.func.isRequired,
  selectedFile: PropTypes.object,
  loading: PropTypes.bool.isRequired
}

export default MediaUpload