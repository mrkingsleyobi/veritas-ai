# Veritas AI API Reference

## API Overview

The Veritas AI Content Authenticity and Deepfake Detection API provides programmatic access to advanced content verification services. This RESTful API enables developers to integrate powerful AI-powered verification capabilities into their applications.

## Base URL

```
https://api.veritas-ai.com/v1
```

## Authentication

### API Key Authentication

All API requests require authentication using a JWT token obtained through the authentication endpoint.

```bash
# Generate token
curl -X POST "https://api.veritas-ai.com/v1/auth/token" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'

# Use token in subsequent requests
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://api.veritas-ai.com/v1/verify
```

### Security Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Rate Limits

- **Authenticated Users**: 100 requests per minute
- **Unauthenticated Requests**: 10 requests per minute
- **Batch Processing**: 10 batch requests per minute
- **Exceeding Limits**: 429 Too Many Requests response

## Content Size Limits

- **Images**: 50MB maximum
- **Videos**: 500MB maximum
- **Documents**: 100MB maximum
- **Batch Processing**: 50 items per batch

## API Endpoints

### Authentication

#### POST /auth/token

Generate authentication token for API access.

**Request:**
```http
POST /auth/token
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

**Error Responses:**
- 401 Unauthorized: Invalid credentials
- 429 Too Many Requests: Rate limit exceeded

### Content Verification

#### POST /verify

Submit content for authenticity verification.

**Request:**
```http
POST /verify
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "base64_encoded_content",
  "content_type": "image|video|document",
  "filename": "optional_filename.ext",
  "metadata": {
    "custom_field": "value"
  }
}
```

**Response (200):**
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
    "content_id": "content_67890",
    "reputation": 0.85,
    "uniqueness": 0.92,
    "verification": 0.95,
    "fusion_score": 0.90,
    "history": [
      {
        "timestamp": "2023-01-01T12:00:00Z",
        "reputation": 0.85,
        "uniqueness": 0.92,
        "verification": 0.95
      }
    ],
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-01-01T12:00:00Z"
  },
  "created_at": "2023-01-01T12:00:00Z"
}
```

**Error Responses:**
- 400 Bad Request: Invalid request data
- 401 Unauthorized: Authentication required
- 413 Payload Too Large: Content exceeds size limits
- 429 Too Many Requests: Rate limit exceeded

#### GET /verify/{contentId}

Retrieve a previously generated verification result.

**Request:**
```http
GET /verify/content_67890
Authorization: Bearer <jwt_token>
```

**Response (200):**
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
    "content_id": "content_67890",
    "reputation": 0.85,
    "uniqueness": 0.92,
    "verification": 0.95,
    "fusion_score": 0.90,
    "history": [...],
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-01-01T12:00:00Z"
  },
  "created_at": "2023-01-01T12:00:00Z"
}
```

**Error Responses:**
- 401 Unauthorized: Authentication required
- 404 Not Found: Verification result not found

### RUV Profile Management

#### POST /profiles

Create or update a RUV profile.

**Request:**
```http
POST /profiles
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content_id": "content_67890",
  "ruv_data": {
    "reputation": 0.85,
    "uniqueness": 0.92,
    "verification": 0.95
  }
}
```

**Response (200):**
```json
{
  "content_id": "content_67890",
  "reputation": 0.85,
  "uniqueness": 0.92,
  "verification": 0.95,
  "fusion_score": 0.90,
  "history": [...],
  "created_at": "2023-01-01T12:00:00Z",
  "updated_at": "2023-01-01T12:00:00Z"
}
```

**Error Responses:**
- 400 Bad Request: Invalid request data
- 401 Unauthorized: Authentication required

#### GET /profiles/{contentId}

Retrieve a RUV profile.

**Request:**
```http
GET /profiles/content_67890
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "content_id": "content_67890",
  "reputation": 0.85,
  "uniqueness": 0.92,
  "verification": 0.95,
  "fusion_score": 0.90,
  "history": [...],
  "created_at": "2023-01-01T12:00:00Z",
  "updated_at": "2023-01-01T12:00:00Z"
}
```

**Error Responses:**
- 401 Unauthorized: Authentication required
- 404 Not Found: Profile not found

### Batch Processing

#### POST /batch/verify

Submit multiple content items for verification.

**Request:**
```http
POST /batch/verify
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "contents": [
    {
      "id": "client_item_001",
      "content": "base64_encoded_content_1",
      "content_type": "image",
      "filename": "image1.jpg",
      "metadata": {
        "source": "batch_upload"
      }
    },
    {
      "id": "client_item_002",
      "content": "base64_encoded_content_2",
      "content_type": "video",
      "filename": "video1.mp4"
    }
  ]
}
```

**Response (200):**
```json
{
  "results": [
    {
      "content_id": "client_item_001",
      "authentic": true,
      "confidence": 0.95
    },
    {
      "content_id": "client_item_002",
      "authentic": false,
      "confidence": 0.30,
      "error": "Processing failed due to unsupported format"
    }
  ]
}
```

**Error Responses:**
- 400 Bad Request: Invalid request data
- 401 Unauthorized: Authentication required
- 413 Payload Too Large: Batch exceeds size limits

### Analytics

#### GET /analytics/accuracy

Retrieve platform accuracy metrics.

**Request:**
```http
GET /analytics/accuracy?start_date=2023-01-01&end_date=2023-01-31
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "precision": 0.95,
  "recall": 0.92,
  "f1_score": 0.93,
  "accuracy": 0.94,
  "total_verifications": 10000
}
```

**Error Responses:**
- 401 Unauthorized: Authentication required

## Data Models

### VerificationResult

```json
{
  "id": "string",
  "content_id": "string",
  "authentic": "boolean",
  "confidence": "number (0-1)",
  "details": {
    "method": "string",
    "metadata_present": "boolean",
    "compression_artifacts": "boolean",
    "file_size": "integer"
  },
  "metadata": {
    "timestamp": "string (ISO 8601)",
    "content_length": "integer"
  },
  "ruv_profile": "RUVProfile",
  "created_at": "string (ISO 8601)"
}
```

### RUVProfile

```json
{
  "content_id": "string",
  "reputation": "number (0-1)",
  "uniqueness": "number (0-1)",
  "verification": "number (0-1)",
  "fusion_score": "number (0-1)",
  "history": [
    {
      "timestamp": "string (ISO 8601)",
      "reputation": "number (0-1)",
      "uniqueness": "number (0-1)",
      "verification": "number (0-1)"
    }
  ],
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

### BatchVerificationResult

```json
{
  "content_id": "string",
  "authentic": "boolean",
  "confidence": "number (0-1)",
  "error": "string (optional)"
}
```

## Error Responses

### HTTP Status Codes

- **200 OK**: Successful request
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **404 Not Found**: Resource not found
- **413 Payload Too Large**: Content exceeds size limits
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error
- **503 Service Unavailable**: Service temporarily unavailable

### Error Response Format

```json
{
  "error": "Descriptive error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "specific error details"
  }
}
```

## SDK Examples

### Python

```python
import requests
import base64

class VeritasAIClient:
    def __init__(self, base_url, username, password):
        self.base_url = base_url
        self.username = username
        self.password = password
        self.token = None

    def authenticate(self):
        response = requests.post(
            f"{self.base_url}/auth/token",
            json={
                "username": self.username,
                "password": self.password
            }
        )
        if response.status_code == 200:
            self.token = response.json()["token"]
            return True
        return False

    def verify_content(self, file_path, content_type):
        with open(file_path, "rb") as f:
            content = base64.b64encode(f.read()).decode("utf-8")

        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

        response = requests.post(
            f"{self.base_url}/verify",
            headers=headers,
            json={
                "content": content,
                "content_type": content_type,
                "filename": file_path.split("/")[-1]
            }
        )

        return response.json()
```

### Java

```java
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.util.Base64;
import java.nio.file.Files;
import java.nio.file.Paths;

public class VeritasAIClient {
    private final String baseUrl;
    private final String username;
    private final String password;
    private String token;
    private final HttpClient httpClient;

    public VeritasAIClient(String baseUrl, String username, String password) {
        this.baseUrl = baseUrl;
        this.username = username;
        this.password = password;
        this.httpClient = HttpClient.newHttpClient();
    }

    public boolean authenticate() throws Exception {
        String json = String.format(
            "{\"username\":\"%s\",\"password\":\"%s\"}",
            username, password
        );

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + "/auth/token"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            // Parse token from response
            this.token = parseToken(response.body());
            return true;
        }
        return false;
    }

    public String verifyContent(String filePath, String contentType) throws Exception {
        byte[] fileContent = Files.readAllBytes(Paths.get(filePath));
        String encodedContent = Base64.getEncoder().encodeToString(fileContent);

        String json = String.format(
            "{\"content\":\"%s\",\"content_type\":\"%s\",\"filename\":\"%s\"}",
            encodedContent, contentType, Paths.get(filePath).getFileName()
        );

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + "/verify"))
            .header("Authorization", "Bearer " + token)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }
}
```

## Best Practices

### Content Preparation

1. **Encoding**: Always Base64 encode content before sending
2. **Size Limits**: Check content size before upload
3. **Metadata**: Include relevant metadata for better analysis
4. **Batching**: Use batch processing for multiple items

### Error Handling

1. **Retry Logic**: Implement exponential backoff for retries
2. **Rate Limiting**: Respect rate limits and implement queuing
3. **Authentication**: Handle token expiration and renewal
4. **Validation**: Validate responses before processing

### Security

1. **Token Management**: Store tokens securely
2. **HTTPS**: Always use HTTPS for API requests
3. **Input Validation**: Validate all input data
4. **Access Control**: Implement proper access controls

---

*This API reference provides comprehensive documentation for integrating with the Veritas AI platform. For implementation examples and advanced features, please refer to the integration guides.*