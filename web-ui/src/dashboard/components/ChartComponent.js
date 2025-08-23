import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ChartComponent = ({ type, data, options, title }) => {

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          // Updated styling to match prototype
          font: {
            size: 12,
            family: '"Roboto", "Helvetica", "Arial", sans-serif',
          },
          color: '#0f172a', // dark color from prototype
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: false, // We'll handle titles in the parent component
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#0f172a',
          font: {
            size: 12,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        ticks: {
          color: '#0f172a',
          font: {
            size: 12,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    // Add accessibility features
    accessibility: {
      enabled: true,
    },
    ...options,
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={data} options={chartOptions} />;
      case 'line':
        // Update line chart options for better styling
        const lineOptions = {
          ...chartOptions,
          elements: {
            line: {
              borderWidth: 3,
              tension: 0.4, // Smooth curves
            },
            point: {
              radius: 4,
              hoverRadius: 6,
              backgroundColor: '#ffffff',
              borderWidth: 2,
            },
          },
          ...options,
        };
        return <Line data={data} options={lineOptions} />;
      case 'pie':
        // Update pie chart options for better styling
        const pieOptions = {
          ...chartOptions,
          plugins: {
            ...chartOptions.plugins,
            legend: {
              ...chartOptions.plugins.legend,
              position: 'right',
            },
          },
          ...options,
        };
        return <Pie data={data} options={pieOptions} />;
      default:
        return <Bar data={data} options={chartOptions} />;
    }
  };

  return (
    <div 
      style={{ height: '300px', width: '100%' }}
      role="img" 
      aria-label={`${title} chart`}
    >
      {renderChart()}
    </div>
  );
};

export default ChartComponent;