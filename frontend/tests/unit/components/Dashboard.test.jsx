import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import DashboardPage from '../../../src/pages/dashboard/DashboardPage';

const mockStore = configureMockStore();
const store = mockStore({
  auth: {
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    },
    isAuthenticated: true
  },
  detection: {
    recentDetections: [
      {
        id: '1',
        fileName: 'test-video.mp4',
        status: 'completed',
        result: 'authentic',
        timestamp: '2023-01-01T00:00:00Z'
      }
    ],
    stats: {
      total: 10,
      authentic: 7,
      deepfake: 3
    }
  },
  compliance: {
    status: 'compliant',
    lastCheck: '2023-01-01T00:00:00Z'
  }
});

// Mock chart components to avoid canvas issues in tests
jest.mock('recharts', () => ({
  ...jest.requireActual('recharts'),
  ResponsiveContainer: ({ children }) => <div className="responsive-container">{children}</div>,
  BarChart: () => <div data-testid="bar-chart">Bar Chart</div>,
  LineChart: () => <div data-testid="line-chart">Line Chart</div>,
  PieChart: () => <div data-testid="pie-chart">Pie Chart</div>,
  Bar: () => <div>Bar</div>,
  Line: () => <div>Line</div>,
  Pie: () => <div>Pie</div>,
  XAxis: () => <div>X Axis</div>,
  YAxis: () => <div>Y Axis</div>,
  CartesianGrid: () => <div>Cartesian Grid</div>,
  Tooltip: () => <div>Tooltip</div>,
  Legend: () => <div>Legend</div>,
  Cell: () => <div>Cell</div>
}));

describe('DashboardPage', () => {
  const renderWithProviders = (component) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </Provider>
    );
  };

  it('renders dashboard components', () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome back, Test User')).toBeInTheDocument();
    expect(screen.getByText('Recent Detections')).toBeInTheDocument();
    expect(screen.getByText('Compliance Status')).toBeInTheDocument();
  });

  it('displays user statistics', () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('10')).toBeInTheDocument(); // Total detections
    expect(screen.getByText('7')).toBeInTheDocument(); // Authentic
    expect(screen.getByText('3')).toBeInTheDocument(); // Deepfake
  });

  it('renders chart components', () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('displays compliance status', () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Compliant')).toBeInTheDocument();
  });

  it('shows recent detections table', () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('test-video.mp4')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Authentic')).toBeInTheDocument();
  });
});