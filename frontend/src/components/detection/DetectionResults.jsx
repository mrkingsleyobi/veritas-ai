import React from 'react'
import PropTypes from 'prop-types'
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material'

const DetectionResults = ({ result, onClear }) => {
  const isFake = result.result.is_fake
  const confidence = Math.round(result.result.confidence * 100)

  return (
    <div>
      <div className={`rounded-lg p-4 ${isFake ? 'bg-red-50' : 'bg-green-50'}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {isFake ? (
              <WarningIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            ) : (
              <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
            )}
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${isFake ? 'text-red-800' : 'text-green-800'}`}>
              {isFake ? 'Deepfake Detected' : 'Authentic Content'}
            </h3>
            <div className="mt-2 text-sm">
              <p className={`${isFake ? 'text-red-700' : 'text-green-700'}`}>
                Confidence: {confidence}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-900">Analysis Details</h4>
        <div className="mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h5 className="text-sm font-medium text-gray-900">File Information</h5>
          </div>
          <div className="px-4 py-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Filename</p>
                <p className="text-sm font-medium text-gray-900">{result.filename}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Media Type</p>
                <p className="text-sm font-medium text-gray-900">{result.media_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">File Size</p>
                <p className="text-sm font-medium text-gray-900">
                  {(result.file_size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Analysis Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(result.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h5 className="text-sm font-medium text-gray-900">Detection Metrics</h5>
          </div>
          <div className="px-4 py-3">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Facial Inconsistencies</span>
                  <span className="text-sm font-medium text-gray-700">
                    {Math.round(result.result.metrics.facial_inconsistencies * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${result.result.metrics.facial_inconsistencies * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Temporal Anomalies</span>
                  <span className="text-sm font-medium text-gray-700">
                    {Math.round(result.result.metrics.temporal_anomalies * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${result.result.metrics.temporal_anomalies * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Audio-Visual Sync</span>
                  <span className="text-sm font-medium text-gray-700">
                    {Math.round(result.result.metrics.audio_visual_sync * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${result.result.metrics.audio_visual_sync * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClear}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Analyze Another File
        </button>
      </div>
    </div>
  )
}

DetectionResults.propTypes = {
  result: PropTypes.object.isRequired,
  onClear: PropTypes.func.isRequired
}

export default DetectionResults