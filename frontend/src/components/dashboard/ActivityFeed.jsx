import React from 'react'
import { useSelector } from 'react-redux'
import { useTheme } from '../../contexts/ThemeContext'
import {
  Description as DescriptionIcon,
  Gavel as GavelIcon,
  AccountCircle as UserIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material'

const ActivityFeed = () => {
  const { theme } = useTheme()
  const { history } = useSelector((state) => state.detection)
  const { reports } = useSelector((state) => state.compliance)

  // Combine and sort activities
  const activities = [
    ...history.map(detection => ({
      id: detection.id,
      type: 'detection',
      title: `${detection.media_type} analyzed`,
      description: detection.filename,
      date: detection.created_at,
      icon: detection.result.is_fake ? WarningIcon : CheckCircleIcon,
      iconColor: detection.result.is_fake ? 'bg-red-500' : 'bg-green-500'
    })),
    ...reports.map(report => ({
      id: report.id,
      type: 'report',
      title: 'Compliance report generated',
      description: report.title,
      date: report.created_at,
      icon: GavelIcon,
      iconColor: 'bg-indigo-500'
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

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
          Recent Activity
        </h3>
        <p className={`mt-1 text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Latest actions and events
        </p>
      </div>
      <div className="px-4 py-5 sm:px-6">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <UserIcon className={`mx-auto h-12 w-12 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <h3 className={`mt-2 text-sm font-medium ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              No activity
            </h3>
            <p className={`mt-1 text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Your activity will appear here once you start using the platform.
            </p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {activities.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== activities.length - 1 ? (
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
                          } ${activity.iconColor}`}
                        >
                          <activity.icon
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
                            {activity.title}{' '}
                            <span className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {activity.description}
                            </span>
                          </p>
                        </div>
                        <div className={`text-right text-sm whitespace-nowrap ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <time dateTime={activity.date}>
                            {new Date(activity.date).toLocaleDateString()}
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
    </div>
  )
}

export default ActivityFeed