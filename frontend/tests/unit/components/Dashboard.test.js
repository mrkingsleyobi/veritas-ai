import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import Dashboard from '../../../src/components/Dashboard/Dashboard';

// Mock the charting library
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock Redux store
const mockStore = configureStore([]);

describe('Dashboard Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        user: { name: 'Test User', email: 'test@example.com' },
        isAuthenticated: true,
      },
      analysis: {
        recentAnalyses: [
          { id: 1, fileName: 'test1.mp4', status: 'completed', result: 'authentic', timestamp: '2023-01-01T00:00:00Z' },
          { id: 2, fileName: 'test2.mp4', status: 'completed', result: 'deepfake', timestamp: '2023-01-02T00:00:00Z' },
        ],
        stats: {
          totalAnalyses: 100,
          authenticCount: 70,
          deepfakeCount: 30,
        },
      },
    });

    store.dispatch = jest.fn();
  });

  test('renders dashboard with user greeting', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/Welcome, Test User/i)).toBeInTheDocument();
  });

  test('displays recent analyses', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('test1.mp4')).toBeInTheDocument();
      expect(screen.getByText('test2.mp4')).toBeInTheDocument();
    });
  });

  test('displays statistics cards', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('100')).toBeInTheDocument(); // Total analyses
    expect(screen.getByText('70')).toBeInTheDocument();  // Authentic count
    expect(screen.getByText('30')).toBeInTheDocument();  // Deepfake count
  });

  test('renders analytics charts', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});