import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../components/Header';

// Mock useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useMediaQuery hook
jest.mock('@mui/material/useMediaQuery', () => () => false);

describe('Header', () => {
  const mockOnLogout = jest.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
    mockOnLogout.mockClear();
  });

  test('renders header with title', () => {
    render(<Header onLogout={mockOnLogout} />);
    
    expect(screen.getByText('VeritasAI')).toBeInTheDocument();
    expect(screen.getByLabelText('VeritasAI Dashboard')).toBeInTheDocument();
  });

  test('renders navigation buttons on desktop', () => {
    render(<Header onLogout={mockOnLogout} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Verification')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    
    expect(screen.getByLabelText('Go to dashboard')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to content verification')).toBeInTheDocument();
    expect(screen.getByLabelText('Logout from application')).toBeInTheDocument();
  });

  test('calls navigate when Home button is clicked', () => {
    render(<Header onLogout={mockOnLogout} />);
    
    const homeButton = screen.getByText('Home');
    homeButton.click();
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('calls navigate when Verification button is clicked', () => {
    render(<Header onLogout={mockOnLogout} />);
    
    const verificationButton = screen.getByText('Verification');
    verificationButton.click();
    
    expect(mockNavigate).toHaveBeenCalledWith('/verification');
  });

  test('calls onLogout when Logout button is clicked', () => {
    render(<Header onLogout={mockOnLogout} />);
    
    const logoutButton = screen.getByText('Logout');
    logoutButton.click();
    
    expect(mockOnLogout).toHaveBeenCalled();
  });
});