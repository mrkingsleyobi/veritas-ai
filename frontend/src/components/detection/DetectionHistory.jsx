import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { getDetectionHistory } from '../../store/slices/detectionSlice'
import { Link } from 'react-router-dom'
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Description as DescriptionIcon
} from '@mui/icons-material'

const DetectionHistory = ({ history }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    if (history.length === 0) {
      dispatch(getDetectionHistory())
    }
  }, [dispatch, history.length])

  const getStatusIcon = (isFake) => {
    return isFake ? (
      <WarningIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
    ) : (
      <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
    )
  }

  const getStatusText = (isFake) => {
    return isFake ? 'Deepfake' : 'Authentic'
  }

  const getStatusColor = (isFake) => {
    return isFake ? 'text-red-800' : 'text-green-800'
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Detection History
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Recent analysis results
        </p>
      </div>
      <div className="px-4 py-5 sm:px-6">
        {history.length === 0 ? (
          <div className="text-center py-8">
            <DescriptionIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No history</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your detection history will appear here.
            </p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {history.slice(0, 10).map((detection, detectionIdx) => (
                <li key={detection.id}>
                  <div className="relative pb-8">
                    {detectionIdx !== Math.min(history.slice(0, 10).length - 1, 9) ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-gray-100">
                          {getStatusIcon(detection.result.is_fake)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium text-gray-900">
                              {detection.filename}
                            </span>
                          </p>
                          <p className={`text-sm ${getStatusColor(detection.result.is_fake)}`}>
                            {getStatusText(detection.result.is_fake)} • {Math.round(detection.result.confidence * 100)}%
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
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
      {history.length > 0 && (
        <div className="px-4 py-4 bg-gray-50 sm:px-6 text-center border-t border-gray-200">
          <Link
            to="/app/reports"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all history<span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      )}
    </div>
  )
}

DetectionHistory.propTypes = {
  history: PropTypes.array.isRequired
}

export default DetectionHistory