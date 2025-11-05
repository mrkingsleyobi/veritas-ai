import React from 'react'
import PropTypes from 'prop-types'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useSelector, useDispatch } from 'react-redux'
import { toggleSidebar } from '../../store/slices/uiSlice'
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon
} from '@mui/icons-material'
import { IconButton, Badge, Tooltip } from '@mui/material'
import ThemeToggle from './ThemeToggle'

const Topbar = ({ onMenuToggle }) => {
  const { currentUser } = useAuth()
  const { theme } = useTheme()
  const dispatch = useDispatch()
  const { notifications } = useSelector((state) => state.ui)

  const handleMenuToggle = () => {
    if (onMenuToggle) {
      onMenuToggle()
    } else {
      dispatch(toggleSidebar())
    }
  }

  return (
    <div className={`shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleMenuToggle}
            className="md:hidden"
          >
            <MenuIcon />
          </IconButton>
          <div className="flex-shrink-0">
            <span className={`text-lg font-semibold hidden md:block ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Deepfake Detection Platform
            </span>
          </div>
        </div>
        <div className="flex items-center">
          <ThemeToggle />
          <IconButton color="inherit" className="ml-2">
            <Badge badgeContent={notifications.length} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <div className="ml-3 flex items-center">
            <div className="text-sm text-right">
              <div className={`font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-700'
              }`}>
                {currentUser ? currentUser.name : 'Guest'}
              </div>
              <div className={`text-xs ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {currentUser ? currentUser.role : 'User'}
              </div>
            </div>
            <IconButton color="inherit" className="ml-2">
              <AccountCircleIcon />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  )
}

Topbar.propTypes = {
  onMenuToggle: PropTypes.func
}

export default Topbar