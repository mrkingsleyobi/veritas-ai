import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { Gavel as GavelIcon } from '@mui/icons-material'

const ComplianceOverview = ({ reports }) => {
  const { theme } = useTheme()

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return theme === 'dark'
          ? 'bg-green-900 text-green-200'
          : 'bg-green-100 text-green-800'
      case 'pending':
        return theme === 'dark'
          ? 'bg-yellow-900 text-yellow-200'
          : 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return theme === 'dark'
          ? 'bg-red-900 text-red-200'
          : 'bg-red-100 text-red-800'
      default:
        return theme === 'dark'
          ? 'bg-gray-700 text-gray-200'
          : 'bg-gray-100 text-gray-800'
    }
  }

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
          Compliance Reports
        </h3>
        <p className={`mt-1 text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Recent compliance report status
        </p>
      </div>
      <div className="px-4 py-5 sm:px-6">
        {reports.length === 0 ? (
          <div className="text-center py-8">
            <GavelIcon className={`mx-auto h-12 w-12 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <h3 className={`mt-2 text-sm font-medium ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              No reports
            </h3>
            <p className={`mt-1 text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
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
                        className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                        }`}
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ${
                          theme === 'dark' ? 'ring-gray-800' : 'ring-white'
                        } bg-indigo-500`}>
                          <GavelIcon
                            className="h-5 w-5 text-white"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            <span className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {report.title}
                            </span>{' '}
                            report
                          </p>
                          <div className="mt-1 flex items-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                report.status
                              )}`}
                            >
                              {report.status}
                            </span>
                          </div>
                        </div>
                        <div className={`text-right text-sm whitespace-nowrap ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
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
      <div className={`px-4 py-4 sm:px-6 text-center ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <Link
          to="/app/compliance"
          className={`text-sm font-medium ${
            theme === 'dark'
              ? 'text-indigo-400 hover:text-indigo-300'
              : 'text-indigo-600 hover:text-indigo-500'
          }`}
        >
          View all reports<span aria-hidden="true"> &rarr;</span>
        </Link>
      </div>
    </div>
  )
}

ComplianceOverview.propTypes = {
  reports: PropTypes.array.isRequired
}

export default ComplianceOverview