import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Verification from '../pages/Verification';

// Mock useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useMediaQuery hook
jest.mock('@mui/material/useMediaQuery', () => () => false);

describe('Verification', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders verification form', () => {
    render(<Verification />);
    
    expect(screen.getByText('Content Verification')).toBeInTheDocument();
    expect(screen.getByLabelText('Content Type')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /enter text to verify/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /verify content/i })).toBeInTheDocument();
  });

  test('updates content type when selection changes', () => {
    render(<Verification />);
    
    const select = screen.getByLabelText('Content Type');
    // For Material-UI Select, we need to click it first to open the dropdown
    fireEvent.mouseDown(select);
    
    // Then click on the desired option
    const imageOption = screen.getByText('Image URL');
    fireEvent.click(imageOption);
    
    expect(screen.getByRole('textbox', { name: /enter url/i })).toBeInTheDocument();
  });

  test('updates content when text field changes', () => {
    render(<Verification />);
    
    const textField = screen.getByRole('textbox', { name: /enter text to verify/i });
    fireEvent.change(textField, { target: { value: 'Test content' } });
    
    expect(textField.value).toBe('Test content');
  });

  test('shows loading state when form is submitted', () => {
    render(<Verification />);
    
    const textField = screen.getByRole('textbox', { name: /enter text to verify/i });
    fireEvent.change(textField, { target: { value: 'Test content' } });
    
    const submitButton = screen.getByRole('button', { name: /verify content/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByLabelText(/verifying content/i)).toBeInTheDocument();
  });

  test('shows result after verification', async () => {
    render(<Verification />);
    
    const textField = screen.getByRole('textbox', { name: /enter text to verify/i });
    fireEvent.change(textField, { target: { value: 'Test content' } });
    
    const submitButton = screen.getByRole('button', { name: /verify content/i });
    fireEvent.click(submitButton);
    
    // Fast-forward the timer to resolve the promise
    jest.advanceTimersByTime(1000);
    
    // Wait for the result to appear
    expect(await screen.findByText(/Verification Result/)).toBeInTheDocument();
  });
});