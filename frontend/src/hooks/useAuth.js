import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

export function useAuthHook() {
  const { currentUser, login, register, logout, token, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const result = await login(email, password)
      if (!result.success) {
        setError(result.message)
      }
      return result
    } catch (err) {
      setError('An unexpected error occurred')
      return { success: false, message: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (userData) => {
    setLoading(true)
    setError(null)
    try {
      const result = await register(userData)
      if (!result.success) {
        setError(result.message)
      }
      return result
    } catch (err) {
      setError('An unexpected error occurred')
      return { success: false, message: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  return {
    currentUser,
    isAuthenticated,
    token,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout
  }
}