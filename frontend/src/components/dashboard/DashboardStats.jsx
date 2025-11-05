import React from 'react'
import { useSelector } from 'react-redux'
import { useTheme } from '../../contexts/ThemeContext'
import {
  Description as DescriptionIcon,
  Gavel as GavelIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'

const DashboardStats = () => {
  const { theme } = useTheme()
  const { history } = useSelector((state) => state.detection)
  const { reports } = useSelector((state) => state.compliance)

  // Calculate stats
  const totalDetections = history.length
  const fakeDetections = history.filter(d => d.result.is_fake).length
  const realDetections = totalDetections - fakeDetections
  const pendingReports = reports.filter(r => r.status === 'pending').length

  const stats = [
    {
      name: 'Total Detections',
      value: totalDetections,
      icon: DescriptionIcon,
      color: 'bg-indigo-500',
      darkBg: 'dark:bg-indigo-600',
    },
    {
      name: 'Deepfakes Detected',
      value: fakeDetections,
      icon: WarningIcon,
      color: 'bg-red-500',
      darkBg: 'dark:bg-red-600',
    },
    {
      name: 'Authentic Content',
      value: realDetections,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      darkBg: 'dark:bg-green-600',
    },
    {
      name: 'Pending Reports',
      value: pendingReports,
      icon: GavelIcon,
      color: 'bg-yellow-500',
      darkBg: 'dark:bg-yellow-600',
    },
  ]

  return (
    <div>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.name}
              className={`relative pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <dt>
                <div className={`absolute rounded-md p-3 ${item.color} ${item.darkBg}`}>
                  <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className={`ml-16 text-sm font-medium truncate ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {item.name}
                </p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className={`text-2xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.value}
                </p>
              </dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}

export default DashboardStats