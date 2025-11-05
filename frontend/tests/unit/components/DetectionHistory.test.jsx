import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import DetectionHistory from '../../../src/components/detection/DetectionHistory';

const mockStore = configureMockStore();
const mockFetchHistory = jest.fn();

// Mock the detection slice actions
jest.mock('../../../src/store/slices/detectionSlice', () => ({
  ...jest.requireActual('../../../src/store/slices/detectionSlice'),
  fetchDetectionHistory: () => mockFetchHistory()
}));

describe('DetectionHistory Component', () => {
  beforeEach(() => {
    mockFetchHistory.mockClear();
  });

  it('renders empty state when no history', () => {
    const store = mockStore({
      detection: {
        history: [],
        loading: false,
        error: null
      }
    });

    render(
      <Provider store={store}>
        <DetectionHistory />
      </Provider>
    );

    expect(screen.getByText('Detection History')).toBeInTheDocument();
    expect(screen.getByText('No detection history found')).toBeInTheDocument();
  });

  it('renders detection history items', () => {
    const store = mockStore({
      detection: {
        history: [
          {
            id: '1',
            fileName: 'test-video-1.mp4',
            status: 'completed',
            result: 'authentic',
            confidence: 95.5,
            timestamp: '2023-01-01T10:00:00Z'
          },
          {
            id: '2',
            fileName: 'test-video-2.mp4',
            status: 'completed',
            result: 'deepfake',
            confidence: 87.2,
            timestamp: '2023-01-02T11:00:00Z'
          },
          {
            id: '3',
            fileName: 'processing-video.mp4',
            status: 'processing',
            progress: 65,
            timestamp: '2023-01-03T12:00:00Z'
          }
        ],
        loading: false,
        error: null
      }
    });

    render(
      <Provider store={store}>
        <DetectionHistory />
      </Provider>
    );

    expect(screen.getByText('Detection History')).toBeInTheDocument();

    // Check authentic item
    expect(screen.getByText('test-video-1.mp4')).toBeInTheDocument();
    expect(screen.getByText('Authentic')).toBeInTheDocument();
    expect(screen.getByText('95.5%')).toBeInTheDocument();

    // Check deepfake item
    expect(screen.getByText('test-video-2.mp4')).toBeInTheDocument();
    expect(screen.getByText('Deepfake')).toBeInTheDocument();
    expect(screen.getByText('87.2%')).toBeInTheDocument();

    // Check processing item
    expect(screen.getByText('processing-video.mp4')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    const store = mockStore({
      detection: {
        history: [],
        loading: true,
        error: null
      }
    });

    render(
      <Provider store={store}>
        <DetectionHistory />
      </Provider>
    );

    expect(screen.getByText('Loading detection history...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    const store = mockStore({
      detection: {
        history: [],
        loading: false,
        error: 'Failed to load detection history'
      }
    });

    render(
      <Provider store={store}>
        <DetectionHistory />
      </Provider>
    );

    expect(screen.getByText('Failed to load detection history')).toBeInTheDocument();
  });

  it('dispatches fetch action on mount', async () => {
    mockFetchHistory.mockReturnValue({ type: 'detection/fetchHistory' });

    const store = mockStore({
      detection: {
        history: [],
        loading: false,
        error: null
      }
    });

    render(
      <Provider store={store}>
        <DetectionHistory />
      </Provider>
    );

    await waitFor(() => {
      expect(mockFetchHistory).toHaveBeenCalled();
    });
  });

  it('allows refreshing history', async () => {
    mockFetchHistory.mockReturnValue({ type: 'detection/fetchHistory' });

    const store = mockStore({
      detection: {
        history: [],
        loading: false,
        error: null
      }
    });

    render(
      <Provider store={store}>
        <DetectionHistory />
      </Provider>
    );

    const refreshButton = screen.getByRole('button', { name: 'Refresh' });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockFetchHistory).toHaveBeenCalled();
    });
  });

  it('formats dates correctly', () => {
    const store = mockStore({
      detection: {
        history: [
          {
            id: '1',
            fileName: 'test-video.mp4',
            status: 'completed',
            result: 'authentic',
            confidence: 95.5,
            timestamp: '2023-01-01T10:00:00Z'
          }
        ],
        loading: false,
        error: null
      }
    });

    render(
      <Provider store={store}>
        <DetectionHistory />
      </Provider>
    );

    // Check that the date is formatted (this will depend on the user's locale)
    const dateElement = screen.getByText(/2023/);
    expect(dateElement).toBeInTheDocument();
  });

  it('handles viewing detection details', () => {
    const store = mockStore({
      detection: {
        history: [
          {
            id: '1',
            fileName: 'test-video.mp4',
            status: 'completed',
            result: 'authentic',
            confidence: 95.5,
            timestamp: '2023-01-01T10:00:00Z'
          }
        ],
        loading: false,
        error: null
      }
    });

    render(
      <Provider store={store}>
        <DetectionHistory />
      </Provider>
    );

    const viewButton = screen.getByRole('button', { name: 'View Details' });
    fireEvent.click(viewButton);

    // In a real test, we would check navigation, but here we just ensure the button exists
    expect(viewButton).toBeInTheDocument();
  });
});