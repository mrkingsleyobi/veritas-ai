# VeritasAI API Documentation

## Overview

The VeritasAI API provides a RESTful interface for integrating deepfake detection and content authenticity verification into applications. The API supports authentication via JWT tokens and provides endpoints for user management, content upload, and analysis results.

## Authentication

All API requests (except for user registration and login) require authentication. VeritasAI uses JWT (JSON Web Tokens) for authentication.

### Register a New User

**POST** `/api/v1/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Login

**POST** `/api/v1/auth/login`

Authenticate a user and receive an access token.

**Request Body:**
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
  "token_type": "bearer"
}
```

### Get Current User

**GET** `/api/v1/auth/users/me`

Get information about the currently authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

## Content Management

### Upload Content

**POST** `/api/v1/content/upload`

Upload a content file for analysis.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: The content file to upload

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "filename": "video.mp4",
  "file_path": "veritasai-content/uuid4.mp4",
  "content_type": "video/mp4",
  "file_size": 1024000,
  "status": "uploaded",
  "authenticity_score": null,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Upload Content from URL

**POST** `/api/v1/content/url`

Upload content from a URL for analysis.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "url": "https://example.com/video.mp4"
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "filename": "video.mp4",
  "file_path": "veritasai-content/uuid4.mp4",
  "content_type": "video/mp4",
  "file_size": 1024000,
  "status": "uploaded",
  "authenticity_score": null,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Get Content by ID

**GET** `/api/v1/content/{content_id}`

Get information about a specific content item.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "filename": "video.mp4",
  "file_path": "veritasai-content/uuid4.mp4",
  "content_type": "video/mp4",
  "file_size": 1024000,
  "status": "uploaded",
  "authenticity_score": null,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### List User Content

**GET** `/api/v1/content/`

List all content items for the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `skip`: Number of items to skip (default: 0)
- `limit`: Maximum number of items to return (default: 100)

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "filename": "video.mp4",
    "file_path": "veritasai-content/uuid4.mp4",
    "content_type": "video/mp4",
    "file_size": 1024000,
    "status": "uploaded",
    "authenticity_score": null,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
]
```

### Delete Content

**DELETE** `/api/v1/content/{content_id}`

Delete a content item.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```
204 No Content
```

## Error Responses

All error responses follow this format:
```json
{
  "detail": "Error message"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `204`: No Content (successful deletion)
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error