import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { CheckCircle as CheckCircleIcon, Warning as WarningIcon } from '@mui/icons-material'

const RecentDetections = ({ detections, loading }) => {
  const { theme } = useTheme()

  return (
    <div className={`overflow-hidden shadow rounded-lg ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className={`px-4 py-5 sm:px-6 border-b ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h3 className={`text-lg leading-6 font-medium ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Recent Detections
        </h3>
        <p className={`mt-1 text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Latest deepfake detection results
        </p>
      </div>
      <div className="px-4 py-5 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : detections.length === 0 ? (
          <div className="text-center py-8">
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              No detections yet
            </p>
            <Link
              to="/app/detection"
              className={`mt-2 inline-flex items-center text-sm font-medium ${
                theme === 'dark'
                  ? 'text-indigo-400 hover:text-indigo-300'
                  : 'text-indigo-600 hover:text-indigo-500'
              }`}
            >
              Run your first detection
            </Link>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {detections.map((detection, detectionIdx) => (
                <li key={detection.id}>
                  <div className="relative pb-8">
                    {detectionIdx !== detections.length - 1 ? (
                      <span
                        className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                        }`}
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span
                          className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ${
                            theme === 'dark' ? 'ring-gray-800' : 'ring-white'
                          } ${
                            detection.result.is_fake
                              ? 'bg-red-500'
                              : 'bg-green-500'
                          }`}
                        >
                          {detection.result.is_fake ? (
                            <WarningIcon
                              className="h-5 w-5 text-white"
                              aria-hidden="true"
                            />
                          ) : (
                            <CheckCircleIcon
                              className="h-5 w-5 text-white"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {detection.media_type} analyzed
                            <span className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {' '}{detection.filename}
                            </span>
                          </p>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Confidence: {Math.round(detection.result.confidence * 100)}%
                          </p>
                        </div>
                        <div className={`text-right text-sm whitespace-nowrap ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <time dateTime={detection.created_at}>
                            {new Date(detection.created_at).toLocaleDateString()}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className={`px-4 py-4 sm:px-6 text-center ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <Link
          to="/app/detection"
          className={`text-sm font-medium ${
            theme === 'dark'
              ? 'text-indigo-400 hover:text-indigo-300'
              : 'text-indigo-600 hover:text-indigo-500'
          }`}
        >
          View all detections<span aria-hidden="true"> &rarr;</span>
        </Link>
      </div>
    </div>
  )
}

RecentDetections.propTypes = {
  detections: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired
}

export default RecentDetections