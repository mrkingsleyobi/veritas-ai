import React from 'react'
import PropTypes from 'prop-types'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import {
  Dashboard as DashboardIcon,
  FileUpload as FileUploadIcon,
  Description as DescriptionIcon,
  Gavel as GavelIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  HelpOutline as HelpIcon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material'

const Sidebar = ({ isOpen }) => {
  const { logout } = useAuth()
  const { theme } = useTheme()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: DashboardIcon },
    { name: 'Detection', href: '/app/detection', icon: FileUploadIcon },
    { name: 'Reports', href: '/app/reports', icon: DescriptionIcon },
    { name: 'Compliance', href: '/app/compliance', icon: GavelIcon },
    { name: 'Analytics', href: '/app/analytics', icon: AssessmentIcon },
    { name: 'Settings', href: '/app/settings', icon: SettingsIcon },
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <div className={`${isOpen ? 'block' : 'hidden'} md:block md:w-64 md:flex-shrink-0`}>
      <div className={`flex flex-col h-full border-r ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-center h-16 px-4 bg-indigo-600">
          <span className="text-white font-semibold text-lg">Deepfake Detection</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-indigo-900 border-indigo-500 text-indigo-300'
                        : 'bg-indigo-50 border-indigo-600 text-indigo-600'
                      : theme === 'dark'
                        ? 'border-transparent text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4`}
                >
                  <Icon
                    className={`${
                      isActive
                        ? theme === 'dark'
                          ? 'text-indigo-300'
                          : 'text-indigo-600'
                        : theme === 'dark'
                          ? 'text-gray-400 group-hover:text-gray-300'
                          : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className={`p-4 border-t ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              theme === 'dark'
                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <ExitToAppIcon className={`mr-3 h-6 w-6 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
            }`} />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired
}

export default Sidebar