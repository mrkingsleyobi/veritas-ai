# API Endpoints Documentation

## Authentication

### POST /auth/token

Generate a JWT token for API access.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Responses:**
- `200`: Authentication successful
  ```json
  {
    "token": "string",
    "expires_in": 3600
  }
  ```
- `401`: Authentication failed
  ```json
  {
    "error": "Invalid credentials"
  }
  ```

## Content Verification

### POST /verify

Submit content for authenticity verification.

**Request Body:**
```json
{
  "content": "base64_encoded_content",
  "content_type": "image|video|document",
  "filename": "optional_filename.ext",
  "metadata": {
    "key": "value"
  }
}
```

**Responses:**
- `200`: Verification successful
  ```json
  {
    "id": "verification_12345",
    "content_id": "content_67890",
    "authentic": true,
    "confidence": 0.95,
    "details": {
      "method": "image_analysis",
      "metadata_present": true,
      "compression_artifacts": false,
      "file_size": 2048000
    },
    "metadata": {
      "timestamp": "2023-01-01T12:00:00Z",
      "content_length": 2048000
    },
    "ruv_profile": {
      "reputation": 0.85,
      "uniqueness": 0.92,
      "verification": 0.95,
      "fusion_score": 0.90
    },
    "created_at": "2023-01-01T12:00:00Z"
  }
  ```
- `400`: Invalid request
  ```json
  {
    "error": "Invalid content: type and data are required"
  }
  ```
- `401`: Authentication required
- `413`: Content too large

### GET /verify/{contentId}

Retrieve a previously generated verification result.

**Path Parameters:**
- `contentId`: Unique identifier for the content

**Responses:**
- `200`: Verification result retrieved
- `404`: Verification result not found

## RUV Profiles

### POST /profiles

Create or update a RUV profile for content.

**Request Body:**
```json
{
  "content_id": "string",
  "ruv_data": {
    "reputation": 0.85,
    "uniqueness": 0.92,
    "verification": 0.95
  }
}
```

**Responses:**
- `200`: Profile created or updated
- `400`: Invalid request

### GET /profiles/{contentId}

Retrieve the RUV profile for specific content.

**Path Parameters:**
- `contentId`: Unique identifier for the content

**Responses:**
- `200`: RUV profile retrieved
- `404`: Profile not found

## Batch Processing

### POST /batch/verify

Submit multiple content items for authenticity verification.

**Request Body:**
```json
{
  "contents": [
    {
      "id": "client_id_1",
      "content": "base64_encoded_content_1",
      "content_type": "image",
      "filename": "image1.jpg"
    },
    {
      "id": "client_id_2",
      "content": "base64_encoded_content_2",
      "content_type": "video",
      "filename": "video1.mp4"
    }
  ]
}
```

**Responses:**
- `200`: Batch verification completed
  ```json
  {
    "results": [
      {
        "content_id": "client_id_1",
        "authentic": true,
        "confidence": 0.92
      },
      {
        "content_id": "client_id_2",
        "authentic": false,
        "confidence": 0.23,
        "error": "Verification failed due to corrupted data"
      }
    ]
  }
  ```
- `400`: Invalid request

## Analytics

### GET /analytics/accuracy

Retrieve platform accuracy metrics.

**Query Parameters:**
- `start_date`: Start date for metrics (YYYY-MM-DD)
- `end_date`: End date for metrics (YYYY-MM-DD)

**Responses:**
- `200`: Accuracy metrics retrieved
  ```json
  {
    "precision": 0.95,
    "recall": 0.92,
    "f1_score": 0.93,
    "accuracy": 0.94,
    "total_verifications": 12500
  }
  ```
- `401`: Authentication required