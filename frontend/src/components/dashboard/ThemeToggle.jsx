import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { IconButton, Tooltip } from '@mui/material'
import { Brightness4 as DarkIcon, Brightness7 as LightIcon } from '@mui/icons-material'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <IconButton size="large" disabled>
        <LightIcon />
      </IconButton>
    )
  }

  return (
    <Tooltip title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
      <IconButton
        size="large"
        onClick={toggleTheme}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
      >
        {theme === 'dark' ? <LightIcon /> : <DarkIcon />}
      </IconButton>
    </Tooltip>
  )
}

export default ThemeToggle