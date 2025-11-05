import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import {
  Gavel as GavelIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material'

const ComplianceReportsList = ({ reports, loading }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-400" />
      case 'pending':
        return <HourglassEmptyIcon className="h-4 w-4 text-yellow-400" />
      case 'failed':
        return <WarningIcon className="h-4 w-4 text-red-400" />
      default:
        return <GavelIcon className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'pending':
        return 'Pending'
      case 'failed':
        return 'Failed'
      default:
        return status
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-800 bg-green-100'
      case 'pending':
        return 'text-yellow-800 bg-yellow-100'
      case 'failed':
        return 'text-red-800 bg-red-100'
      default:
        return 'text-gray-800 bg-gray-100'
    }
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Compliance Reports
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Status of generated compliance reports
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
        ) : reports.length === 0 ? (
          <div className="text-center py-8">
            <GavelIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reports generated</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by generating your first compliance report.
            </p>
            <div className="mt-6">
              <Link
                to="/app/compliance"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Generate Report
              </Link>
            </div>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {reports.map((report, reportIdx) => (
                <li key={report.id}>
                  <div className="relative pb-8">
                    {reportIdx !== reports.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-indigo-500">
                          <GavelIcon className="h-5 w-5 text-white" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium text-gray-900">
                              {report.title}
                            </span>
                          </p>
                          <div className="mt-1 flex items-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                report.status
                              )}`}
                            >
                              {getStatusIcon(report.status)}
                              <span className="ml-1">{getStatusText(report.status)}</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={report.created_at}>
                            {new Date(report.created_at).toLocaleDateString()}
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
      {reports.length > 0 && (
        <div className="px-4 py-4 bg-gray-50 sm:px-6 text-center border-t border-gray-200">
          <Link
            to="/app/compliance"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all reports<span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      )}
    </div>
  )
}

ComplianceReportsList.propTypes = {
  reports: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired
}

export default ComplianceReportsList