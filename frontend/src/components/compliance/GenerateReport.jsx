import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  Gavel as GavelIcon,
  Description as DescriptionIcon,
  Event as EventIcon
} from '@mui/icons-material'

const GenerateReport = ({ onGenerate, loading }) => {
  const [reportData, setReportData] = useState({
    title: '',
    period_start: '',
    period_end: '',
    report_type: 'comprehensive'
  })

  const handleChange = (e) => {
    setReportData({
      ...reportData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onGenerate(reportData)
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Generate Compliance Report
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Create a new compliance report for your organization.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Report Title
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DescriptionIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={reportData.title}
                onChange={handleChange}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
                placeholder="Monthly Compliance Report - Q4 2023"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="period_start" className="block text-sm font-medium text-gray-700">
              Period Start
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EventIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                name="period_start"
                id="period_start"
                required
                value={reportData.period_start}
                onChange={handleChange}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="period_end" className="block text-sm font-medium text-gray-700">
              Period End
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EventIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                name="period_end"
                id="period_end"
                required
                value={reportData.period_end}
                onChange={handleChange}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="report_type" className="block text-sm font-medium text-gray-700">
              Report Type
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <GavelIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="report_type"
                name="report_type"
                required
                value={reportData.report_type}
                onChange={handleChange}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
              >
                <option value="comprehensive">Comprehensive Report</option>
                <option value="summary">Summary Report</option>
                <option value="detailed">Detailed Analysis</option>
                <option value="regulatory">Regulatory Compliance</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Report'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

GenerateReport.propTypes = {
  onGenerate: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
}

export default GenerateReport