import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Verification from '../pages/Verification';
import Dashboard from '../pages/Dashboard';

// Extend Jest with the toHaveNoViolations matcher
expect.extend(toHaveNoViolations);

// Mock the useMediaQuery hook
jest.mock('@mui/material/useMediaQuery', () => () => false);

// Mock the ChartComponent to simplify testing
jest.mock('../dashboard/components/ChartComponent', () => {
  return function MockChartComponent({ title }) {
    return <div data-testid="chart-component">Chart: {title}</div>;
  };
});

describe('Accessibility Tests', () => {
  test('Login page should have no accessibility violations', async () => {
    const { container } = render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Register page should have no accessibility violations', async () => {
    const { container } = render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Verification page should have no accessibility violations', async () => {
    const { container } = render(
      <BrowserRouter>
        <Verification />
      </BrowserRouter>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Dashboard page should have no accessibility violations', async () => {
    const { container } = render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});