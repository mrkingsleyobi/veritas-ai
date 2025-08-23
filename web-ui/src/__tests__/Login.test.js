import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Login from '../pages/Login';

// Mock useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useMediaQuery hook
jest.mock('@mui/material/useMediaQuery', () => () => false);

describe('Login', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders login form', () => {
    render(<Login />);
    
    expect(screen.getByText('VeritasAI Login')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registration page/i })).toBeInTheDocument();
  });

  test('updates email when text field changes', () => {
    render(<Login />);
    
    const emailField = screen.getByRole('textbox', { name: /email/i });
    fireEvent.change(emailField, { target: { value: 'test@example.com' } });
    
    expect(emailField.value).toBe('test@example.com');
  });

  test('updates password when text field changes', () => {
    render(<Login />);
    
    const passwordField = screen.getByLabelText(/password/i);
    fireEvent.change(passwordField, { target: { value: 'password123' } });
    
    expect(passwordField.value).toBe('password123');
  });

  test('shows loading state when form is submitted', async () => {
    render(<Login />);
    
    const emailField = screen.getByRole('textbox', { name: /email/i });
    act(() => {
      fireEvent.change(emailField, { target: { value: 'test@example.com' } });
    });
    
    const passwordField = screen.getByLabelText(/password/i);
    act(() => {
      fireEvent.change(passwordField, { target: { value: 'password123' } });
    });
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    act(() => {
      fireEvent.click(submitButton);
    });
    
    expect(screen.getByLabelText(/logging in/i)).toBeInTheDocument();
  });

  test('navigates to dashboard after successful login', async () => {
    render(<Login />);
    
    const emailField = screen.getByRole('textbox', { name: /email/i });
    act(() => {
      fireEvent.change(emailField, { target: { value: 'test@example.com' } });
    });
    
    const passwordField = screen.getByLabelText(/password/i);
    act(() => {
      fireEvent.change(passwordField, { target: { value: 'password123' } });
    });
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    act(() => {
      fireEvent.click(submitButton);
    });
    
    // Fast-forward the timer to resolve the promise
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Wait for the navigation to occur
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('navigates to register page when register button is clicked', () => {
    render(<Login />);
    
    const registerButton = screen.getByRole('button', { name: /registration page/i });
    act(() => {
      fireEvent.click(registerButton);
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});