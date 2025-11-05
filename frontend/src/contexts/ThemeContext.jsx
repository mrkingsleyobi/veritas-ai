import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('system')

  // Check system preference
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // Apply theme to document
  const applyTheme = (selectedTheme) => {
    let themeToApply = selectedTheme

    // If system theme is selected, use system preference
    if (selectedTheme === 'system') {
      themeToApply = getSystemTheme()
      document.documentElement.setAttribute('data-theme', 'system')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }

    // Remove all theme classes
    document.documentElement.classList.remove('light', 'dark', 'high-contrast')

    // Add the appropriate theme class
    document.documentElement.classList.add(themeToApply)

    // Update color scheme meta tag
    const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]')
    if (colorSchemeMeta) {
      colorSchemeMeta.content = themeToApply
    } else {
      const meta = document.createElement('meta')
      meta.name = 'color-scheme'
      meta.content = themeToApply
      document.head.appendChild(meta)
    }
  }

  useEffect(() => {
    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      // Use system preference by default
      setTheme('system')
      applyTheme('system')
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (e) => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [])

  useEffect(() => {
    // Apply theme whenever theme state changes
    applyTheme(theme)

    // Save theme to localStorage
    if (theme !== 'system') {
      localStorage.setItem('theme', theme)
    } else {
      localStorage.removeItem('theme')
    }
  }, [theme])

  const setThemeMode = (newTheme) => {
    setTheme(newTheme)
  }

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const value = {
    theme,
    setThemeMode,
    toggleTheme,
    getSystemTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}