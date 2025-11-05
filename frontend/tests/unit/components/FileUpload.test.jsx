import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import MediaUpload from '../../../src/components/detection/MediaUpload';

const mockStore = configureMockStore();
const store = mockStore({
  detection: {
    uploadProgress: 0,
    isUploading: false,
    error: null
  }
});

// Mock the file upload functionality
const mockUploadFile = jest.fn();
jest.mock('../../../src/services/api', () => ({
  uploadMedia: (file) => mockUploadFile(file)
}));

describe('MediaUpload Component', () => {
  const renderWithProviders = (component) => {
    return render(
      <Provider store={store}>
        {component}
      </Provider>
    );
  };

  beforeEach(() => {
    mockUploadFile.mockClear();
  });

  it('renders upload area', () => {
    renderWithProviders(<MediaUpload />);

    expect(screen.getByText('Upload Media for Deepfake Detection')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop your file here, or click to select')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select File' })).toBeInTheDocument();
  });

  it('allows file selection via button', () => {
    renderWithProviders(<MediaUpload />);

    const file = new File(['dummy content'], 'test.mp4', { type: 'video/mp4' });
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });

    // Check that the file name is displayed
    expect(screen.getByText('test.mp4')).toBeInTheDocument();
  });

  it('shows file validation errors for unsupported file types', () => {
    renderWithProviders(<MediaUpload />);

    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('Invalid file type. Please upload MP4, MOV, AVI, or MKV files.')).toBeInTheDocument();
  });

  it('shows file validation errors for files that are too large', () => {
    renderWithProviders(<MediaUpload />);

    // Create a large file (1GB)
    const largeFile = new File([new ArrayBuffer(1024 * 1024 * 1024)], 'large.mp4', { type: 'video/mp4' });
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(screen.getByText('File size exceeds 500MB limit. Please upload a smaller file.')).toBeInTheDocument();
  });

  it('allows file removal', () => {
    renderWithProviders(<MediaUpload />);

    const file = new File(['dummy content'], 'test.mp4', { type: 'video/mp4' });
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('test.mp4')).toBeInTheDocument();

    const removeButton = screen.getByRole('button', { name: 'Remove' });
    fireEvent.click(removeButton);

    expect(screen.queryByText('test.mp4')).not.toBeInTheDocument();
  });

  it('submits file for upload', async () => {
    mockUploadFile.mockResolvedValue({
      data: {
        id: '123',
        status: 'processing',
        fileName: 'test.mp4'
      }
    });

    renderWithProviders(<MediaUpload />);

    const file = new File(['dummy content'], 'test.mp4', { type: 'video/mp4' });
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });

    const uploadButton = screen.getByRole('button', { name: 'Upload for Detection' });
    fireEvent.click(uploadButton);

    expect(mockUploadFile).toHaveBeenCalledWith(file);
  });
});