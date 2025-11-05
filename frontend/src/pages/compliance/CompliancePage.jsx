import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchComplianceReports, generateComplianceReport, fetchRegulations } from '../../store/slices/complianceSlice'
import ComplianceReports from '../../components/compliance/ComplianceReports'
import GenerateReport from '../../components/compliance/GenerateReport'
import RegulationsOverview from '../../components/compliance/RegulationsOverview'

const CompliancePage = () => {
  const dispatch = useDispatch()
  const { reports, regulations, loading, error } = useSelector((state) => state.compliance)
  const [activeTab, setActiveTab] = useState('reports')

  useEffect(() => {
    dispatch(fetchComplianceReports())
    dispatch(fetchRegulations())
  }, [dispatch])

  const handleGenerateReport = (reportData) => {
    dispatch(generateComplianceReport(reportData))
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Compliance Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate compliance reports and stay up to date with regulations.
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('reports')}
            className={`${
              activeTab === 'reports'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`${
              activeTab === 'generate'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Generate Report
          </button>
          <button
            onClick={() => setActiveTab('regulations')}
            className={`${
              activeTab === 'regulations'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Regulations
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'reports' && (
          <ComplianceReports reports={reports} loading={loading} />
        )}
        {activeTab === 'generate' && (
          <GenerateReport onGenerate={handleGenerateReport} loading={loading} />
        )}
        {activeTab === 'regulations' && (
          <RegulationsOverview regulations={regulations} loading={loading} />
        )}
      </div>

      {error && (
        <div className="mt-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message || 'An error occurred.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompliancePage