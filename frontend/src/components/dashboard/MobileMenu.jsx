import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Dashboard as DashboardIcon,
  FileUpload as FileUploadIcon,
  Description as DescriptionIcon,
  Gavel as GavelIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material'

const MobileMenu = () => {
  const { mobileMenuOpen } = useSelector((state) => state.ui)

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: DashboardIcon },
    { name: 'Detection', href: '/app/detection', icon: FileUploadIcon },
    { name: 'Reports', href: '/app/reports', icon: DescriptionIcon },
    { name: 'Compliance', href: '/app/compliance', icon: GavelIcon },
    { name: 'Analytics', href: '/app/analytics', icon: AssessmentIcon },
    { name: 'Settings', href: '/app/settings', icon: SettingsIcon },
  ]

  if (!mobileMenuOpen) return null

  return (
    <div className="md:hidden">
      <div className="pt-2 pb-3 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              to={item.href}
              className="text-indigo-700 hover:bg-indigo-50 hover:text-indigo-900 group flex items-center px-3 py-2 text-base font-medium rounded-md"
            >
              <Icon className="text-indigo-600 mr-4 h-6 w-6" />
              {item.name}
            </Link>
          )
        })}
        <button className="w-full text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-base font-medium rounded-md">
          <ExitToAppIcon className="text-gray-400 mr-4 h-6 w-6" />
          Logout
        </button>
      </div>
    </div>
  )
}

export default MobileMenu