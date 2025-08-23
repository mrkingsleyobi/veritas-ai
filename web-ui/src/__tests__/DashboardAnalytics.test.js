import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardAnalytics from '../dashboard/components/DashboardAnalytics';

// Mock the ChartComponent to simplify testing
jest.mock('../dashboard/components/ChartComponent', () => {
  return function MockChartComponent({ title }) {
    return <div data-testid="chart-component">{title}</div>;
  };
});

describe('DashboardAnalytics', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders loading state initially', () => {
    render(<DashboardAnalytics />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText(/loading analytics data/i)).toBeInTheDocument();
  });

  test('renders analytics data after loading', async () => {
    render(<DashboardAnalytics />);
    
    // Fast-forward the timer to resolve the promise
    jest.advanceTimersByTime(800);
    
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Check that summary cards are rendered
    expect(screen.getByText('1247')).toBeInTheDocument();
    expect(screen.getByText(/total verifications/i)).toBeInTheDocument();
    expect(screen.getByText('892')).toBeInTheDocument();
    expect(screen.getByText(/verified content/i)).toBeInTheDocument();
    expect(screen.getByText('355')).toBeInTheDocument();
    // Check that flagged content is rendered (using a more specific approach)
    const flaggedContentElements = screen.getAllByText(/flagged content/i);
    // The first one should be in the summary card
    expect(flaggedContentElements[0]).toBeInTheDocument();
    
    // Check that charts are rendered (using more specific selectors to avoid mock duplicates)
    expect(screen.getByText('Verification Trend', { selector: 'h6' })).toBeInTheDocument();
    expect(screen.getByText('Content Types', { selector: 'h6' })).toBeInTheDocument();
    expect(screen.getByText('Verification Rate', { selector: 'h6' })).toBeInTheDocument();
    
    // Check that recent activity is rendered
    expect(screen.getByText(/recent activity/i)).toBeInTheDocument();
  });

  test('renders error state when no data is available', () => {
    // Mock useEffect to prevent data loading
    const useEffectSpy = jest.spyOn(React, 'useEffect');
    useEffectSpy.mockImplementation(() => {}); // Do nothing for all calls
    
    // Mock useState to return null data and not loading
    const useStateSpy = jest.spyOn(React, 'useState');
    useStateSpy
      .mockImplementationOnce(() => [null, jest.fn()]) // analyticsData
      .mockImplementationOnce(() => [false, jest.fn()]); // loading
    
    render(<DashboardAnalytics />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
    
    useEffectSpy.mockRestore();
    useStateSpy.mockRestore();
  });
});