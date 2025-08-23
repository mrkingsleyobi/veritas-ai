import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

// Mock the useMediaQuery hook
jest.mock('@mui/material/useMediaQuery', () => () => false);

// Mock the ChartComponent to simplify testing
jest.mock('../dashboard/components/ChartComponent', () => {
  return function MockChartComponent({ title }) {
    return <div data-testid="chart-component">Chart: {title}</div>;
  };
});

describe('Analytics Integration', () => {
  test('renders dashboard with analytics components', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    // Check that the dashboard heading is rendered
    expect(screen.getByText('VeritasAI Dashboard')).toBeInTheDocument();
    
    // Check that analytics section is rendered
    expect(screen.getByText('Advanced analytics and content verification insights')).toBeInTheDocument();
    
    // Check that loading state is rendered initially
    expect(screen.getByLabelText(/loading analytics data/i)).toBeInTheDocument();
  });
});