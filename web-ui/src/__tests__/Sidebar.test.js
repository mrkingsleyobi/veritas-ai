import React from 'react';
import { render, screen } from '@testing-library/react';
import Sidebar from '../components/Sidebar';

// Mock useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useMediaQuery hook
jest.mock('@mui/material/useMediaQuery', () => () => false);

// Mock MUI icons
jest.mock('@mui/icons-material', () => ({
  Dashboard: () => <div>Dashboard Icon</div>,
  VerifiedUser: () => <div>VerifiedUser Icon</div>,
  History: () => <div>History Icon</div>,
  Settings: () => <div>Settings Icon</div>,
}));

describe('Sidebar', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders sidebar with navigation items', () => {
    render(<Sidebar />);
    
    expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Verification')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  test('calls navigate when Dashboard item is clicked', () => {
    render(<Sidebar />);
    
    const dashboardItem = screen.getByText('Dashboard');
    dashboardItem.click();
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('calls navigate when Verification item is clicked', () => {
    render(<Sidebar />);
    
    const verificationItem = screen.getByText('Verification');
    verificationItem.click();
    
    expect(mockNavigate).toHaveBeenCalledWith('/verification');
  });

  test('calls navigate when History item is clicked', () => {
    render(<Sidebar />);
    
    const historyItem = screen.getByText('History');
    historyItem.click();
    
    expect(mockNavigate).toHaveBeenCalledWith('/history');
  });

  test('calls navigate when Settings item is clicked', () => {
    render(<Sidebar />);
    
    const settingsItem = screen.getByText('Settings');
    settingsItem.click();
    
    expect(mockNavigate).toHaveBeenCalledWith('/settings');
  });
});