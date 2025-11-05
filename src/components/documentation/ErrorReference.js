import React, { useState } from 'react';
import './ErrorReference.css';

const ErrorReference = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const errorCategories = [
    'all', 'authentication', 'authorization', 'validation', 'rate-limiting',
    'server', 'client', 'content'
  ];

  const errorCodes = [
    {
      code: 400,
      title: 'Bad Request',
      message: 'The request was unacceptable, often due to missing a required parameter.',
      category: 'validation',
      description: 'This error occurs when the request payload is malformed or missing required fields. Check your request parameters and ensure they match the API specification.',
      solution: 'Verify all required parameters are present and correctly formatted. Check the request body for syntax errors.',
      example: `{
  "error": {
    "code": "validation_error",
    "message": "content is required",
    "details": {
      "field": "content",
      "reason": "missing"
    }
  }
}`
    },
    {
      code: 401,
      title: 'Unauthorized',
      message: 'No valid API key provided.',
      category: 'authentication',
      description: 'Authentication failed due to missing, invalid, or expired credentials. This error typically occurs when the Authorization header is missing or contains an invalid token.',
      solution: 'Ensure you are including a valid API key in the Authorization header. Check that your API key has not expired or been revoked.',
      example: `{
  "error": {
    "code": "authentication_failed",
    "message": "Invalid API key",
    "details": {
      "reason": "invalid_token"
    }
  }
}`
    },
    {
      code: 403,
      title: 'Forbidden',
      message: 'The API key does not have permissions to perform the request.',
      category: 'authorization',
      description: 'Access denied due to insufficient permissions. The authenticated user or API key does not have the required permissions to access the requested resource.',
      solution: 'Verify that your API key has the necessary permissions for the requested operation. Contact support if you believe this is an error.',
      example: `{
  "error": {
    "code": "access_denied",
    "message": "Insufficient permissions",
    "details": {
      "required_permission": "content.verify",
      "current_permissions": ["read_only"]
    }
  }
}`
    },
    {
      code: 404,
      title: 'Not Found',
      message: 'The requested resource does not exist.',
      category: 'client',
      description: 'The requested endpoint or resource could not be found. This may occur when requesting a non-existent job ID or using an incorrect API path.',
      solution: 'Verify the endpoint URL and resource identifier are correct. Check the API documentation for the correct path and parameters.',
      example: `{
  "error": {
    "code": "resource_not_found",
    "message": "Job not found",
    "details": {
      "resource_type": "verification_job",
      "resource_id": "job_12345"
    }
  }
}`
    },
    {
      code: 409,
      title: 'Conflict',
      message: 'The request conflicts with another request.',
      category: 'client',
      description: 'The request could not be completed due to a conflict with the current state of the resource. This often occurs when trying to create a resource that already exists.',
      solution: 'Check if the resource already exists and modify your request accordingly. For batch operations, ensure unique identifiers.',
      example: `{
  "error": {
    "code": "resource_conflict",
    "message": "Job already exists",
    "details": {
      "conflicting_id": "job_12345"
    }
  }
}`
    },
    {
      code: 413,
      title: 'Payload Too Large',
      message: 'The request payload exceeds the maximum allowed size.',
      category: 'validation',
      description: 'The uploaded content exceeds the maximum file size limit. Different endpoints may have different size restrictions.',
      solution: 'Reduce the file size or compress the content before uploading. Check the documentation for specific size limits per endpoint.',
      example: `{
  "error": {
    "code": "payload_too_large",
    "message": "Content exceeds maximum size limit of 50MB",
    "details": {
      "max_size_bytes": 52428800,
      "actual_size_bytes": 73400320
    }
  }
}`
    },
    {
      code: 415,
      title: 'Unsupported Media Type',
      message: 'The request media type is not supported.',
      category: 'validation',
      description: 'The Content-Type header specifies a media type that is not accepted by the endpoint. The API may only accept specific formats.',
      solution: 'Set the Content-Type header to a supported media type. For JSON APIs, use "application/json".',
      example: `{
  "error": {
    "code": "unsupported_media_type",
    "message": "Content-Type 'text/plain' not supported",
    "details": {
      "supported_types": ["application/json", "multipart/form-data"]
    }
  }
}`
    },
    {
      code: 422,
      title: 'Unprocessable Entity',
      message: 'The request was well-formed but unable to be processed due to semantic errors.',
      category: 'validation',
      description: 'The request syntax is correct but contains semantic errors that prevent processing. This often occurs with validation failures in the request payload.',
      solution: 'Review the request payload for logical errors. Check field values against validation rules specified in the API documentation.',
      example: `{
  "error": {
    "code": "validation_failed",
    "message": "Content validation failed",
    "details": {
      "field": "contentType",
      "value": "invalid_type",
      "allowed_values": ["image", "video", "audio"]
    }
  }
}`
    },
    {
      code: 429,
      title: 'Too Many Requests',
      message: 'Rate limit exceeded.',
      category: 'rate-limiting',
      description: 'Too many requests have been made within the rate limit window. The API enforces rate limits to ensure fair usage.',
      solution: 'Implement exponential backoff in your client. Check rate limit headers to determine when you can retry the request.',
      example: `{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded",
    "details": {
      "limit": 100,
      "remaining": 0,
      "reset_in_seconds": 60
    }
  }
}`
    },
    {
      code: 500,
      title: 'Internal Server Error',
      message: 'An unexpected error occurred on the server.',
      category: 'server',
      description: 'An unexpected condition was encountered on the server. This error indicates a problem with the API service itself.',
      solution: 'Retry the request after a brief delay. If the problem persists, contact support with the request details and timestamp.',
      example: `{
  "error": {
    "code": "internal_error",
    "message": "An unexpected error occurred",
    "details": {
      "error_id": "err_1234567890"
    }
  }
}`
    },
    {
      code: 503,
      title: 'Service Unavailable',
      message: 'The service is temporarily unavailable.',
      category: 'server',
      description: 'The API is temporarily unable to handle the request, often due to maintenance or overload. This is a temporary condition.',
      solution: 'Implement retry logic with exponential backoff. Check the service status page for maintenance announcements.',
      example: `{
  "error": {
    "code": "service_unavailable",
    "message": "Service temporarily unavailable",
    "details": {
      "retry_after_seconds": 300
    }
  }
}`
    },
    {
      code: 504,
      title: 'Gateway Timeout',
      message: 'The server did not receive a timely response from an upstream server.',
      category: 'server',
      description: 'A timeout occurred while waiting for a response from an upstream service. This typically indicates a temporary network or service issue.',
      solution: 'Retry the request after a brief delay. If the problem persists, it may indicate a service issue that requires investigation.',
      example: `{
  "error": {
    "code": "gateway_timeout",
    "message": "Upstream service timeout",
    "details": {
      "timeout_seconds": 30
    }
  }
}`
    },
    {
      code: 'CONTENT_UNSUPPORTED',
      title: 'Content Unsupported',
      message: 'The content type or format is not supported.',
      category: 'content',
      description: 'The uploaded content is in a format that is not supported by the verification system. Different content types have specific format requirements.',
      solution: 'Ensure the content is in a supported format. Check the documentation for supported file types and encoding requirements.',
      example: `{
  "error": {
    "code": "content_unsupported",
    "message": "Unsupported image format",
    "details": {
      "content_type": "image",
      "supported_formats": ["JPEG", "PNG", "WEBP"],
      "provided_format": "BMP"
    }
  }
}`
    },
    {
      code: 'CONTENT_CORRUPT',
      title: 'Content Corrupt',
      message: 'The content appears to be corrupted or invalid.',
      category: 'content',
      description: 'The uploaded content is corrupted, truncated, or otherwise invalid. This can occur with incomplete uploads or damaged files.',
      solution: 'Verify the content integrity before uploading. Re-encode or repair the content if necessary. Retry the upload with a verified good copy.',
      example: `{
  "error": {
    "code": "content_corrupt",
    "message": "Invalid JPEG file structure",
    "details": {
      "content_type": "image",
      "error_position": 12450
    }
  }
}`
    }
  ];

  const filteredErrors = errorCodes.filter(error => {
    const matchesSearch = error.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         error.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         error.code.toString().includes(searchTerm);

    const matchesCategory = filterCategory === 'all' || error.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="error-reference">
      <div className="error-reference-header">
        <h2>Error Code Reference</h2>
        <p>Comprehensive guide to understanding and handling API errors</p>
      </div>

      <div className="error-reference-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search errors by code, title, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="category-filter">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {errorCategories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="error-reference-content">
        <div className="error-stats">
          <div className="stat-card">
            <div className="stat-value">{errorCodes.length}</div>
            <div className="stat-label">Error Codes</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{[...new Set(errorCodes.map(e => e.category))].length}</div>
            <div className="stat-label">Categories</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">99.9%</div>
            <div className="stat-label">Resolution Rate</div>
          </div>
        </div>

        <div className="error-codes-list">
          {filteredErrors.length > 0 ? (
            filteredErrors.map((error, index) => (
              <div key={index} className="error-code-card" id={`error-${error.code}`}>
                <div className="error-code-header">
                  <div className="error-code-badge" data-category={error.category}>
                    {error.code}
                  </div>
                  <div className="error-code-info">
                    <h3>{error.title}</h3>
                    <p className="error-message">{error.message}</p>
                  </div>
                </div>

                <div className="error-code-details">
                  <div className="error-section">
                    <h4>Description</h4>
                    <p>{error.description}</p>
                  </div>

                  <div className="error-section">
                    <h4>Solution</h4>
                    <p>{error.solution}</p>
                  </div>

                  <div className="error-section">
                    <h4>Example Response</h4>
                    <pre><code>{error.example}</code></pre>
                  </div>

                  <div className="error-section">
                    <h4>Category</h4>
                    <span className="category-tag" data-category={error.category}>
                      {error.category}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-errors">
              <h3>No errors found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        <div className="error-handling-best-practices">
          <h3>Best Practices for Error Handling</h3>
          <div className="practices-grid">
            <div className="practice-card">
              <h4>🔄 Implement Retry Logic</h4>
              <p>Use exponential backoff for 5xx errors and rate limit responses</p>
            </div>
            <div className="practice-card">
              <h4>📋 Log Error Details</h4>
              <p>Log error responses with timestamps for debugging</p>
            </div>
            <div className="practice-card">
              <h4>🛡️ Validate Requests</h4>
              <p>Validate data before sending to reduce 4xx errors</p>
            </div>
            <div className="practice-card">
              <h4>📊 Monitor Error Rates</h4>
              <p>Track error patterns to identify integration issues</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorReference;