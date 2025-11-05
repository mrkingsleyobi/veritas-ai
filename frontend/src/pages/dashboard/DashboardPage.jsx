import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTheme } from '../../contexts/ThemeContext'
import { getDetectionHistory } from '../../store/slices/detectionSlice'
import { fetchComplianceReports } from '../../store/slices/complianceSlice'
import DashboardStats from '../../components/dashboard/DashboardStats'
import RecentDetections from '../../components/dashboard/RecentDetections'
import ComplianceOverview from '../../components/dashboard/ComplianceOverview'
import ActivityFeed from '../../components/dashboard/ActivityFeed'
import PerformanceCharts from '../../components/dashboard/PerformanceCharts'
import AlertNotifications from '../../components/dashboard/AlertNotifications'
import ExportReports from '../../components/dashboard/ExportReports'

const DashboardPage = () => {
  const { theme } = useTheme()
  const dispatch = useDispatch()
  const { history, loading } = useSelector((state) => state.detection)
  const { reports } = useSelector((state) => state.compliance)

  useEffect(() => {
    dispatch(getDetectionHistory())
    dispatch(fetchComplianceReports())
  }, [dispatch])

  return (
    <div className={`p-4 md:p-6 ${theme === 'dark' ? 'dark:bg-gray-900' : ''}`}>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Dashboard
            </h1>
            <p className={`mt-1 text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Overview of your deepfake detection activity and compliance status.
            </p>
          </div>
          <ExportReports />
        </div>
      </div>

      {/* Stats Overview */}
      <DashboardStats />

      {/* Performance Charts */}
      <div className="mt-8">
        <PerformanceCharts />
      </div>

      {/* Notifications and Activity */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertNotifications />
        <ActivityFeed />
      </div>

      {/* Recent Detections and Compliance */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentDetections detections={history.slice(0, 5)} loading={loading} />
        <ComplianceOverview reports={reports.slice(0, 5)} />
      </div>
    </div>
  )
}

export default DashboardPage