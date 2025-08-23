import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Register from '../pages/Register';

// Mock useNavigate hook
const mockNavigate = jest.fn();
const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useMediaQuery hook
jest.mock('@mui/material/useMediaQuery', () => () => false);

describe('Register', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockNavigate.mockClear();
    mockAlert.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
    mockAlert.mockClear();
  });

  test('renders registration form', () => {
    render(<Register />);
    
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /full name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/password/i)).toHaveLength(2);
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login page/i })).toBeInTheDocument();
  });

  test('updates form fields when text changes', () => {
    render(<Register />);
    
    const nameField = screen.getByRole('textbox', { name: /full name/i });
    act(() => {
      fireEvent.change(nameField, { target: { value: 'John Doe' } });
    });
    expect(nameField.value).toBe('John Doe');
    
    const emailField = screen.getByRole('textbox', { name: /email/i });
    act(() => {
      fireEvent.change(emailField, { target: { value: 'test@example.com' } });
    });
    expect(emailField.value).toBe('test@example.com');
    
    const passwordFields = screen.getAllByLabelText(/password/i);
    const passwordField = passwordFields[0];
    const confirmPasswordField = passwordFields[1];
    
    act(() => {
      fireEvent.change(passwordField, { target: { value: 'password123' } });
    });
    expect(passwordField.value).toBe('password123');
    
    act(() => {
      fireEvent.change(confirmPasswordField, { target: { value: 'password123' } });
    });
    expect(confirmPasswordField.value).toBe('password123');
  });

  test('shows alert when passwords do not match', () => {
    render(<Register />);
    
    const passwordFields = screen.getAllByLabelText(/password/i);
    const passwordField = passwordFields[0];
    const confirmPasswordField = passwordFields[1];
    
    act(() => {
      fireEvent.change(passwordField, { target: { value: 'password123' } });
    });
    act(() => {
      fireEvent.change(confirmPasswordField, { target: { value: 'differentpassword' } });
    });
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    act(() => {
      fireEvent.click(submitButton);
    });
    
    expect(mockAlert).toHaveBeenCalledWith('Passwords do not match');
  });

  test('shows loading state and navigates to dashboard after successful registration', async () => {
    render(<Register />);
    
    const nameField = screen.getByRole('textbox', { name: /full name/i });
    act(() => {
      fireEvent.change(nameField, { target: { value: 'John Doe' } });
    });
    
    const emailField = screen.getByRole('textbox', { name: /email/i });
    act(() => {
      fireEvent.change(emailField, { target: { value: 'test@example.com' } });
    });
    
    const passwordFields = screen.getAllByLabelText(/password/i);
    const passwordField = passwordFields[0];
    const confirmPasswordField = passwordFields[1];
    
    act(() => {
      fireEvent.change(passwordField, { target: { value: 'password123' } });
    });
    act(() => {
      fireEvent.change(confirmPasswordField, { target: { value: 'password123' } });
    });
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    act(() => {
      fireEvent.click(submitButton);
    });
    
    expect(screen.getByLabelText(/creating account/i)).toBeInTheDocument();
    
    // Fast-forward the timer to resolve the promise
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Wait for the alert and navigation to occur
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Account created successfully!');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    }, { timeout: 1000 });
  }, 5000);

  test('navigates to login page when login button is clicked', () => {
    render(<Register />);
    
    const loginButton = screen.getByRole('button', { name: /login page/i });
    act(() => {
      fireEvent.click(loginButton);
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});