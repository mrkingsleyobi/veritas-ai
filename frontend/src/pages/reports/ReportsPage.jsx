import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getDetectionHistory } from '../../store/slices/detectionSlice'
import { fetchComplianceReports } from '../../store/slices/complianceSlice'
import DetectionReports from '../../components/reports/DetectionReports'
import ComplianceReportsList from '../../components/reports/ComplianceReportsList'

const ReportsPage = () => {
  const dispatch = useDispatch()
  const { history, loading: detectionLoading } = useSelector((state) => state.detection)
  const { reports, loading: complianceLoading } = useSelector((state) => state.compliance)

  useEffect(() => {
    dispatch(getDetectionHistory())
    dispatch(fetchComplianceReports())
  }, [dispatch])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Comprehensive reports and analytics on your deepfake detection activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DetectionReports detections={history} loading={detectionLoading} />
        <ComplianceReportsList reports={reports} loading={complianceLoading} />
      </div>

      <div className="mt-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Export Reports
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Download reports in various formats for offline analysis.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    <button className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      PDF Report
                    </button>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">Download as PDF document</p>
                </div>
                <div className="mt-4 flex">
                  <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Export
                  </button>
                </div>
              </div>

              <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    <button className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      CSV Data
                    </button>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">Download raw data as CSV</p>
                </div>
                <div className="mt-4 flex">
                  <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Export
                  </button>
                </div>
              </div>

              <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    <button className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      JSON Format
                    </button>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">Download structured JSON data</p>
                </div>
                <div className="mt-4 flex">
                  <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage