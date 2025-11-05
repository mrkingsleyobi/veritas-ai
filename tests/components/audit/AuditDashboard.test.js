import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuditDashboard from '../src/components/audit/AuditDashboard';

// Mock the charting libraries since they're not needed for basic rendering tests
jest.mock('recharts', () => ({
  BarChart: () => <div data-testid="bar-chart">Bar Chart</div>,
  Bar: () => <div data-testid="bar">Bar</div>,
  XAxis: () => <div data-testid="x-axis">X Axis</div>,
  YAxis: () => <div data-testid="y-axis">Y Axis</div>,
  CartesianGrid: () => <div data-testid="cartesian-grid">Cartesian Grid</div>,
  Tooltip: () => <div data-testid="tooltip">Tooltip</div>,
  Legend: () => <div data-testid="legend">Legend</div>,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: () => <div data-testid="line-chart">Line Chart</div>,
  Line: () => <div data-testid="line">Line</div>,
  PieChart: () => <div data-testid="pie-chart">Pie Chart</div>,
  Pie: () => <div data-testid="pie">Pie</div>,
  Cell: () => <div data-testid="cell">Cell</div>
}));

describe('Audit Components', () => {
  test('renders AuditDashboard component', () => {
    render(<AuditDashboard />);

    // Check that the main dashboard header is rendered
    expect(screen.getByText('Audit & Compliance Dashboard')).toBeInTheDocument();

    // Check that tabs are rendered
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    expect(screen.getByText('User Activity')).toBeInTheDocument();
    expect(screen.getByText('Security Monitor')).toBeInTheDocument();
    expect(screen.getByText('Compliance')).toBeInTheDocument();
    expect(screen.getByText('Retention')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  test('renders AuditLogViewer as default tab', () => {
    render(<AuditDashboard />);

    // Check that the audit log viewer header is rendered
    expect(screen.getByText('Audit Log Viewer')).toBeInTheDocument();
    expect(screen.getByText('Monitor and analyze system activity with advanced filtering capabilities')).toBeInTheDocument();
  });
});