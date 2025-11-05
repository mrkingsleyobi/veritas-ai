import React from 'react'
import PropTypes from 'prop-types'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { setSidebarOpen, toggleSidebar } from '../store/slices/uiSlice'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import MobileMenu from '../components/dashboard/MobileMenu'

const DashboardLayout = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { sidebarOpen, mobileMenuOpen } = useSelector((state) => state.ui)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    // Close mobile menu when route changes
    if (mobileMenuOpen) {
      // dispatch(setMobileMenuOpen(false))
    }
  }, [location, mobileMenuOpen, dispatch])

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar())
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <Topbar onMenuToggle={handleToggleSidebar} />

        {/* Mobile menu */}
        <MobileMenu />

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-4 py-6">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  )
}

DashboardLayout.propTypes = {
  children: PropTypes.node
}

export default DashboardLayout