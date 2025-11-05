import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Header from '../../../src/components/common/Header'
import { ThemeProvider } from '../../../src/contexts/ThemeContext'

// Mock the AuthContext
jest.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false
  })
}))

// Mock the ThemeContext
jest.mock('../../../src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    setThemeMode: jest.fn(),
    toggleTheme: jest.fn(),
    getSystemTheme: jest.fn()
  }),
  ThemeProvider: ({ children }) => <div>{children}</div>
}))

describe('Header', () => {
  const renderWithRouter = (component) => {
    return render(
      <ThemeProvider>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </ThemeProvider>
    )
  }

  it('renders the header with title', () => {
    renderWithRouter(<Header />)
    expect(screen.getByText('Deepfake Detection Platform')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    renderWithRouter(<Header />)
    // Check desktop navigation links
    const desktopNav = screen.getByRole('navigation', { hidden: false })
    expect(within(desktopNav).getByText('Home')).toBeInTheDocument()
    expect(within(desktopNav).getByText('Features')).toBeInTheDocument()
    expect(within(desktopNav).getByText('About')).toBeInTheDocument()
  })

  it('renders sign in and sign up buttons when not authenticated', () => {
    renderWithRouter(<Header />)
    // Check that sign in and sign up buttons exist (desktop and mobile versions)
    const signInButtons = screen.getAllByText('Sign in')
    const signUpButtons = screen.getAllByText('Sign up')
    expect(signInButtons).toHaveLength(2) // desktop and mobile
    expect(signUpButtons).toHaveLength(2) // desktop and mobile
  })
})