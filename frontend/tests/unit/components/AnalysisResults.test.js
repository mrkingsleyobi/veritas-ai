import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import AnalysisResults from '../../../src/components/AnalysisResults/AnalysisResults';

const mockStore = configureStore([]);

describe('AnalysisResults Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      analysis: {
        currentAnalysis: {
          id: 1,
          fileName: 'test.mp4',
          status: 'completed',
          result: 'deepfake',
          confidence: 0.95,
          details: {
            frameAnalysis: [
              { frame: 1, timestamp: 0.033, result: 'authentic', confidence: 0.85 },
              { frame: 2, timestamp: 0.067, result: 'deepfake', confidence: 0.92 },
            ],
            metadata: {
              duration: 10.5,
              fileSize: '5.2 MB',
              resolution: '1920x1080',
            },
          },
        },
      },
    });

    store.dispatch = jest.fn();
  });

  test('displays analysis results', () => {
    render(
      <Provider store={store}>
        <AnalysisResults />
      </Provider>
    );

    expect(screen.getByText('test.mp4')).toBeInTheDocument();
    expect(screen.getByText(/Deepfake Detected/i)).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  test('shows detailed frame analysis', () => {
    render(
      <Provider store={store}>
        <AnalysisResults />
      </Provider>
    );

    expect(screen.getByText('Frame 1')).toBeInTheDocument();
    expect(screen.getByText('Frame 2')).toBeInTheDocument();
  });

  test('displays file metadata', () => {
    render(
      <Provider store={store}>
        <AnalysisResults />
      </Provider>
    );

    expect(screen.getByText('10.5 seconds')).toBeInTheDocument();
    expect(screen.getByText('5.2 MB')).toBeInTheDocument();
    expect(screen.getByText('1920x1080')).toBeInTheDocument();
  });

  test('shows appropriate confidence level styling', () => {
    render(
      <Provider store={store}>
        <AnalysisResults />
      </Provider>
    );

    const confidenceElement = screen.getByText('95%');
    expect(confidenceElement).toBeInTheDocument();
  });
});