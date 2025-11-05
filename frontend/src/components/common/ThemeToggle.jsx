import React, { useState, useRef, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

const ThemeToggle = () => {
  const { theme, setThemeMode, getSystemTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // Get the appropriate icon based on current theme
  const getThemeIcon = () => {
    if (theme === 'system') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6.496 2a1 1 0 00-.992 1.127l.52 4.157a1 1 0 001.984-.002l.52-4.155A1 1 0 006.496 2zm5.008 0a1 1 0 00-.992 1.127l.52 4.157a1 1 0 001.984-.002l.52-4.155a1 1 0 00-.992-1.127zM12 10a2 2 0 100-4 2 2 0 000 4zm-7 6a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm9-2a1 1 0 100 2h2a1 1 0 100-2h-2z" clipRule="evenodd" />
        </svg>
      )
    } else if (theme === 'dark') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      )
    }
  }

  // Get theme label
  const getThemeLabel = () => {
    if (theme === 'system') {
      const systemTheme = getSystemTheme()
      return `System (${systemTheme})`
    }
    return theme.charAt(0).toUpperCase() + theme.slice(1)
  }

  return (
    <div className="theme-toggle-container" ref={dropdownRef}>
      <button
        className="theme-toggle focus-ring"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-label="Toggle theme"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="theme-toggle-icon">
          {getThemeIcon()}
        </span>
      </button>

      {isOpen && (
        <div
          className="theme-dropdown theme-transition"
          role="menu"
          aria-label="Theme options"
        >
          <button
            className={`theme-option ${theme === 'light' ? 'active' : ''}`}
            onClick={() => {
              setThemeMode('light')
              setIsOpen(false)
            }}
            role="menuitem"
            aria-pressed={theme === 'light'}
          >
            <span className="theme-option-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            </span>
            Light
          </button>

          <button
            className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => {
              setThemeMode('dark')
              setIsOpen(false)
            }}
            role="menuitem"
            aria-pressed={theme === 'dark'}
          >
            <span className="theme-option-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            </span>
            Dark
          </button>

          <button
            className={`theme-option ${theme === 'system' ? 'active' : ''}`}
            onClick={() => {
              setThemeMode('system')
              setIsOpen(false)
            }}
            role="menuitem"
            aria-pressed={theme === 'system'}
          >
            <span className="theme-option-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.496 2a1 1 0 00-.992 1.127l.52 4.157a1 1 0 001.984-.002l.52-4.155A1 1 0 006.496 2zm5.008 0a1 1 0 00-.992 1.127l.52 4.157a1 1 0 001.984-.002l.52-4.155a1 1 0 00-.992-1.127zM12 10a2 2 0 100-4 2 2 0 000 4zm-7 6a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm9-2a1 1 0 100 2h2a1 1 0 100-2h-2z" clipRule="evenodd" />
              </svg>
            </span>
            System
            <span className="theme-system-badge">Auto</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default ThemeToggle