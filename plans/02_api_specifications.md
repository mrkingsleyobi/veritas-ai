# VeritasAI API Specifications

## 1. API Overview

The VeritasAI API provides a RESTful interface for integrating deepfake detection and content authenticity verification into applications. The API supports authentication via API keys and OAuth2, with rate limiting to ensure fair usage.

### 1.1 Base URL

```
https://api.veritasai.com/v1
```

For development and testing:
```
https://api.staging.veritasai.com/v1
```

### 1.2 Authentication

All API requests require authentication. VeritasAI supports two authentication methods:

1. **API Key**: Include in the `Authorization` header as a Bearer token:
   ```
   Authorization: Bearer YOUR_API_KEY
   ```

2. **OAuth2**: For enterprise integrations, OAuth2 with client credentials flow.

### 1.3 Rate Limiting

- Free tier: 100 requests per hour
- Premium tier: 1,000 requests per hour
- Enterprise tier: Custom limits based on agreement

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1610000000
```

## 2. Core API Endpoints

### 2.1 Authentication

#### POST /auth/login
Authenticate user credentials and obtain access token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "id": "user_123456",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2023-01-01T00:00:00Z"
}
```

### 2.2 Content Submission

#### POST /content
Submit content for analysis.

**Request:**
```json
{
  "content_url": "https://example.com/video.mp4",
  "content_type": "video",
  "callback_url": "https://yourapp.com/webhook"
}
```

Or for direct upload:
```json
{
  "content_type": "image",
  "filename": "photo.jpg"
}
```

**Response:**
```json
{
  "content_id": "cont_123456",
  "status": "queued",
  "created_at": "2023-01-01T00:00:00Z"
}
```

#### POST /content/upload
Obtain presigned URL for direct content upload.

**Request:**
```json
{
  "content_id": "cont_123456",
  "content_type": "video",
  "filename": "video.mp4"
}
```

**Response:**
```json
{
  "upload_url": "https://storage.googleapis.com/bucket/video.mp4?X-Goog-Algorithm=...",
  "expires_at": "2023-01-01T01:00:00Z"
}
```

### 2.3 Analysis Results

#### GET /content/{content_id}
Retrieve analysis results for a specific content item.

**Response:**
```json
{
  "content_id": "cont_123456",
  "status": "completed",
  "authenticity_score": 0.85,
  "confidence": 0.92,
  "findings": [
    {
      "type": "deepfake",
      "confidence": 0.78,
      "description": "Facial manipulation detected",
      "timestamp": 120.5
    }
  ],
  "report_url": "https://reports.veritasai.com/cont_123456.pdf",
  "created_at": "2023-01-01T00:00:00Z",
  "completed_at": "2023-01-01T00:05:00Z"
}
```

#### GET /content
List content submitted by the authenticated user.

**Query Parameters:**
- `limit`: Number of results (default: 10, max: 100)
- `offset`: Offset for pagination (default: 0)
- `status`: Filter by status (queued, processing, completed, failed)

**Response:**
```json
{
  "content": [
    {
      "content_id": "cont_123456",
      "status": "completed",
      "authenticity_score": 0.85,
      "content_type": "video",
      "filename": "video.mp4",
      "created_at": "2023-01-01T00:00:00Z",
      "completed_at": "2023-01-01T00:05:00Z"
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

### 2.4 Webhooks

#### POST /webhook
Webhook endpoint for receiving analysis completion notifications.

**Request:**
```json
{
  "event": "analysis.completed",
  "content_id": "cont_123456",
  "timestamp": "2023-01-01T00:05:00Z"
}
```

## 3. Data Models

### 3.1 User
```json
{
  "id": "user_123456",
  "email": "user@example.com",
  "name": "John Doe",
  "subscription_tier": "premium",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### 3.2 Content
```json
{
  "content_id": "cont_123456",
  "user_id": "user_123456",
  "content_type": "video",
  "filename": "video.mp4",
  "file_size": 1024000,
  "status": "completed",
  "authenticity_score": 0.85,
  "confidence": 0.92,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:05:00Z",
  "completed_at": "2023-01-01T00:05:00Z"
}
```

### 3.3 AnalysisResult
```json
{
  "result_id": "res_123456",
  "content_id": "cont_123456",
  "authenticity_score": 0.85,
  "confidence": 0.92,
  "findings": [
    {
      "type": "deepfake",
      "confidence": 0.78,
      "description": "Facial manipulation detected",
      "timestamp": 120.5,
      "bounding_box": {
        "x": 100,
        "y": 150,
        "width": 200,
        "height": 250
      }
    }
  ],
  "metadata": {
    "duration": 300.5,
    "resolution": "1920x1080",
    "codec": "h264"
  },
  "created_at": "2023-01-01T00:05:00Z"
}
```

## 4. Error Responses

All error responses follow this format:
```json
{
  "error": {
    "code": "invalid_request",
    "message": "The request is invalid",
    "details": [
      {
        "field": "email",
        "code": "missing_field",
        "message": "Email is required"
      }
    ]
  }
}
```

Common error codes:
- `invalid_request`: The request is malformed or missing required parameters
- `authentication_required`: Authentication credentials are missing or invalid
- `rate_limit_exceeded`: The rate limit for this endpoint has been exceeded
- `insufficient_permissions`: The authenticated user does not have permission to perform this action
- `resource_not_found`: The requested resource does not exist
- `internal_error`: An internal server error occurred

## 5. SDKs and Client Libraries

VeritasAI provides official client libraries for:
- Python
- JavaScript/Node.js
- Java
- Go
- Ruby

Each SDK handles authentication, request signing, and response parsing automatically.