import React from 'react'
import PropTypes from 'prop-types'
import {
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material'

const DetectionReports = ({ detections, loading }) => {
  // Calculate statistics
  const totalDetections = detections.length
  const fakeDetections = detections.filter(d => d.result.is_fake).length
  const realDetections = totalDetections - fakeDetections
  const avgConfidence = detections.length > 0
    ? detections.reduce((sum, d) => sum + d.result.confidence, 0) / detections.length
    : 0

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Detection Reports
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Analytics on deepfake detection results
        </p>
      </div>
      <div className="px-4 py-5 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <DescriptionIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Detections
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {totalDetections}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                      <WarningIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Deepfakes Detected
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {fakeDetections}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <CheckCircleIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Authentic Content
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {realDetections}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900">Detection Trends</h4>
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Average Confidence Score</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {Math.round(avgConfidence * 100)}%
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${avgConfidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900">Recent Detections</h4>
              <div className="mt-2 overflow-hidden bg-white border border-gray-200 rounded-md">
                <ul className="divide-y divide-gray-200">
                  {detections.slice(0, 5).map((detection) => (
                    <li key={detection.id} className="px-4 py-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-4 w-4 rounded-full ${detection.result.is_fake ? 'bg-red-500' : 'bg-green-500'}`}></div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {detection.filename}
                            </p>
                            <p className="text-sm text-gray-500">
                              {detection.media_type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            detection.result.is_fake
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {Math.round(detection.result.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

DetectionReports.propTypes = {
  detections: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired
}

export default DetectionReports