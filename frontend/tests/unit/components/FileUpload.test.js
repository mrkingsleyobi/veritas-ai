import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import FileUpload from '../../../src/components/FileUpload/FileUpload';

const mockStore = configureStore([]);

describe('FileUpload Component', () => {
  let store;
  const mockUploadFile = jest.fn();

  beforeEach(() => {
    store = mockStore({
      analysis: {
        uploadProgress: 0,
        isUploading: false,
      },
    });

    store.dispatch = mockUploadFile;
  });

  test('renders file upload area', () => {
    render(
      <Provider store={store}>
        <FileUpload />
      </Provider>
    );

    expect(screen.getByText(/Drag & drop files here/i)).toBeInTheDocument();
    expect(screen.getByText(/or click to browse/i)).toBeInTheDocument();
  });

  test('handles file selection', async () => {
    render(
      <Provider store={store}>
        <FileUpload />
      </Provider>
    );

    const file = new File(['dummy content'], 'test.mp4', { type: 'video/mp4' });
    const input = screen.getByTestId('file-input');

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(mockUploadFile).toHaveBeenCalled();
    });
  });

  test('shows upload progress', () => {
    store = mockStore({
      analysis: {
        uploadProgress: 50,
        isUploading: true,
      },
    });

    render(
      <Provider store={store}>
        <FileUpload />
      </Provider>
    );

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  test('prevents non-video files', () => {
    render(
      <Provider store={store}>
        <FileUpload />
      </Provider>
    );

    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByTestId('file-input');

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    expect(screen.getByText(/Please upload video files only/i)).toBeInTheDocument();
  });
});