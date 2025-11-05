// DetectionAPI.ts
// Service for integrating with backend detection endpoints

export interface DetectionResult {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  isDeepfake: boolean;
  confidence: number;
  processingTime: number;
  timestamp: string;
  analysisDetails: {
    visualAnomalies: number;
    temporalInconsistencies: number;
    audioVisualMismatch: number;
    metadataAnalysis: number;
  };
  highlights?: Array<{
    id: string;
    area: { x: number; y: number; width: number; height: number };
    confidence: number;
    description: string;
  }>;
}

export interface BatchProcessingResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  results?: DetectionResult[];
  error?: string;
}

export interface DetectionConfig {
  sensitivity: 'low' | 'medium' | 'high';
  includeMetadata: boolean;
  includeVisualAnalysis: boolean;
  includeAudioAnalysis: boolean;
  batchProcessing: boolean;
  notificationEmail?: string;
}

class DetectionAPI {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = '/api/detection', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  // Upload a single file for detection
  async uploadFile(
    file: File,
    config: DetectionConfig
  ): Promise<DetectionResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('config', JSON.stringify(config));

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
      headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {},
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Upload multiple files for batch processing
  async uploadBatch(
    files: File[],
    config: DetectionConfig
  ): Promise<BatchProcessingResponse> {
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    formData.append('config', JSON.stringify(config));

    const response = await fetch(`${this.baseUrl}/batch`, {
      method: 'POST',
      body: formData,
      headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {},
    });

    if (!response.ok) {
      throw new Error(`Batch upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Check the status of a batch processing job
  async checkBatchStatus(jobId: string): Promise<BatchProcessingResponse> {
    const response = await fetch(`${this.baseUrl}/batch/${jobId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to check batch status: ${response.statusText}`);
    }

    return response.json();
  }

  // Get detailed analysis report for a specific file
  async getAnalysisReport(resultId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/report/${resultId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch report: ${response.statusText}`);
    }

    return response.json();
  }

  // Get comparison data for original vs detected content
  async getComparisonData(resultId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/compare/${resultId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch comparison data: ${response.statusText}`);
    }

    return response.json();
  }

  // Export results in specified format
  async exportResults(
    resultIds: string[],
    format: 'csv' | 'json' | 'pdf',
    options: any
  ): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/export`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        resultIds,
        format,
        options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  // Cancel a batch processing job
  async cancelBatchJob(jobId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/batch/${jobId}/cancel`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel batch job: ${response.statusText}`);
    }
  }

  // Get user profile and credits information
  async getUserProfile(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/profile`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.statusText}`);
    }

    return response.json();
  }

  // Update user preferences
  async updateUserPreferences(preferences: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/profile/preferences`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ preferences }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update preferences: ${response.statusText}`);
    }

    return response.json();
  }
}

// Create a default instance
const detectionAPI = new DetectionAPI();

export default detectionAPI;

// Export the class for custom instances
export { DetectionAPI };