import React from 'react';
import { render, screen } from '@testing-library/react';
import ChartComponent from '../dashboard/components/ChartComponent';

// Mock Chart.js to avoid canvas rendering issues in tests
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
}));

describe('ChartComponent', () => {
  const mockData = {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Test Data',
        data: [10, 20, 30],
      },
    ],
  };

  test('renders bar chart when type is bar', () => {
    render(
      <ChartComponent 
        type="bar" 
        data={mockData} 
        title="Test Bar Chart" 
      />
    );
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByText('Test Bar Chart')).toBeInTheDocument();
  });

  test('renders line chart when type is line', () => {
    render(
      <ChartComponent 
        type="line" 
        data={mockData} 
        title="Test Line Chart" 
      />
    );
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByText('Test Line Chart')).toBeInTheDocument();
  });

  test('renders pie chart when type is pie', () => {
    render(
      <ChartComponent 
        type="pie" 
        data={mockData} 
        title="Test Pie Chart" 
      />
    );
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByText('Test Pie Chart')).toBeInTheDocument();
  });

  test('renders bar chart by default when type is not specified', () => {
    render(
      <ChartComponent 
        data={mockData} 
        title="Default Chart" 
      />
    );
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByText('Default Chart')).toBeInTheDocument();
  });
});