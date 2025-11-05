import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '../../../src/pages/auth/LoginPage'

// Mock the useAuthHook
jest.mock('../../../src/hooks/useAuth', () => ({
  useAuthHook: () => ({
    login: jest.fn().mockResolvedValue({ success: true }),
    loading: false,
    error: null
  })
}))

// Mock useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

describe('LoginPage', () => {
  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
  }

  it('renders login form', () => {
    renderWithRouter(<LoginPage />)
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByText('Sign in')).toBeInTheDocument()
  })

  it('renders sign up link', () => {
    renderWithRouter(<LoginPage />)
    expect(screen.getByText('create a new account')).toBeInTheDocument()
  })

  it('allows user to fill in form fields', () => {
    renderWithRouter(<LoginPage />)

    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('shows error message when login fails', async () => {
    // Mock login to return an error
    jest.mock('../../../src/hooks/useAuth', () => ({
      useAuthHook: () => ({
        login: jest.fn().mockResolvedValue({
          success: false,
          message: 'Invalid credentials'
        }),
        loading: false,
        error: 'Invalid credentials'
      })
    }))

    renderWithRouter(<LoginPage />)

    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByText('Sign in')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })
})