import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import DetectionResults from '../../../src/components/detection/DetectionResults';

const mockStore = configureMockStore();

describe('DetectionResults Component', () => {
  it('renders authentic result correctly', () => {
    const store = mockStore({
      detection: {
        currentResult: {
          id: '123',
          fileName: 'test-video.mp4',
          status: 'completed',
          result: 'authentic',
          confidence: 95.5,
          details: {
            framesAnalyzed: 1200,
            anomaliesDetected: 0,
            processingTime: 45
          },
          timestamp: '2023-01-01T10:00:00Z'
        }
      }
    });

    render(
      <Provider store={store}>
        <DetectionResults />
      </Provider>
    );

    expect(screen.getByText('Detection Results')).toBeInTheDocument();
    expect(screen.getByText('test-video.mp4')).toBeInTheDocument();
    expect(screen.getByText('Authentic')).toBeInTheDocument();
    expect(screen.getByText('95.5%')).toBeInTheDocument();
    expect(screen.getByText('No anomalies detected')).toBeInTheDocument();
  });

  it('renders deepfake result correctly', () => {
    const store = mockStore({
      detection: {
        currentResult: {
          id: '124',
          fileName: 'fake-video.mp4',
          status: 'completed',
          result: 'deepfake',
          confidence: 92.3,
          details: {
            framesAnalyzed: 1200,
            anomaliesDetected: 42,
            processingTime: 48,
            anomalyLocations: ['00:01:23', '00:02:45', '00:03:12']
          },
          timestamp: '2023-01-01T11:00:00Z'
        }
      }
    });

    render(
      <Provider store={store}>
        <DetectionResults />
      </Provider>
    );

    expect(screen.getByText('Detection Results')).toBeInTheDocument();
    expect(screen.getByText('fake-video.mp4')).toBeInTheDocument();
    expect(screen.getByText('Deepfake Detected')).toBeInTheDocument();
    expect(screen.getByText('92.3%')).toBeInTheDocument();
    expect(screen.getByText('42 anomalies detected')).toBeInTheDocument();
  });

  it('renders processing state', () => {
    const store = mockStore({
      detection: {
        currentResult: {
          id: '125',
          fileName: 'processing-video.mp4',
          status: 'processing',
          progress: 65
        }
      }
    });

    render(
      <Provider store={store}>
        <DetectionResults />
      </Provider>
    );

    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
    expect(screen.getByText('processing-video.mp4')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const store = mockStore({
      detection: {
        currentResult: {
          id: '126',
          fileName: 'error-video.mp4',
          status: 'error',
          error: 'Failed to process video due to unsupported codec'
        }
      }
    });

    render(
      <Provider store={store}>
        <DetectionResults />
      </Provider>
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('error-video.mp4')).toBeInTheDocument();
    expect(screen.getByText('Failed to process video due to unsupported codec')).toBeInTheDocument();
  });

  it('renders empty state when no result', () => {
    const store = mockStore({
      detection: {
        currentResult: null
      }
    });

    render(
      <Provider store={store}>
        <DetectionResults />
      </Provider>
    );

    expect(screen.getByText('No detection results available')).toBeInTheDocument();
  });
});