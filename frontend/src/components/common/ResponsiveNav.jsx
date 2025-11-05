import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const ResponsiveNav = ({
  items,
  orientation = 'horizontal',
  variant = 'default',
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close menu when resizing to larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // Variant styles
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-800 shadow-md dark:shadow-lg',
    transparent: 'bg-transparent',
    filled: 'bg-indigo-50 dark:bg-indigo-900'
  }

  // Orientation classes
  const orientationClasses = {
    horizontal: 'flex flex-col md:flex-row',
    vertical: 'flex flex-col'
  }

  // Base classes for nav items
  const baseItemClasses = `
    px-3 py-2 rounded-md text-sm font-medium
    focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400
    transition-colors duration-200 ease-in-out
    theme-transition
  `

  // Render nav items for desktop
  const renderDesktopItems = () => (
    <div className={`flex ${orientation === 'vertical' ? 'flex-col space-y-2' : 'space-x-4'}`}>
      {items.map((item, index) => (
        <Link
          key={index}
          to={item.href}
          className={`
            ${baseItemClasses}
            ${item.active
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50'
              : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }
          `}
          onClick={() => setIsOpen(false)}
        >
          {item.label}
        </Link>
      ))}
    </div>
  )

  // Render nav items for mobile
  const renderMobileItems = () => (
    <div className="pt-2 pb-3 space-y-1">
      {items.map((item, index) => (
        <Link
          key={index}
          to={item.href}
          className={`
            block pl-3 pr-4 py-2 border-l-4 text-base font-medium
            ${item.active
              ? 'border-indigo-500 text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-900/30'
              : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
            }
            theme-transition
          `}
          onClick={() => setIsOpen(false)}
        >
          {item.label}
        </Link>
      ))}
    </div>
  )

  return (
    <nav
      className={`${variantClasses[variant]} ${className} theme-transition`}
      ref={menuRef}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center">
              {renderDesktopItems()}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              onKeyDown={handleKeyDown}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:focus:ring-indigo-400 theme-transition"
              aria-expanded="false"
              aria-label="Toggle navigation menu"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden ${isOpen ? 'block' : 'hidden'} theme-transition`}
        aria-hidden={!isOpen}
      >
        {renderMobileItems()}
      </div>
    </nav>
  )
}

ResponsiveNav.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      href: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      active: PropTypes.bool
    })
  ).isRequired,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  variant: PropTypes.oneOf(['default', 'elevated', 'transparent', 'filled']),
  className: PropTypes.string
}

export default ResponsiveNav