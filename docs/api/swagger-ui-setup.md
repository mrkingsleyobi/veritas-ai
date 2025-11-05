# Interactive API Documentation (Swagger UI) Setup

This guide provides instructions for setting up interactive API documentation using Swagger UI for the Veritas AI Content Authenticity and Deepfake Detection platform.

## Prerequisites

- Node.js 12.x or higher
- npm or yarn package manager
- Web server or static file hosting capability
- OpenAPI 3.0 specification file

## Installation Options

### Option 1: Standalone Swagger UI

#### Download and Setup

```bash
# Create documentation directory
mkdir -p docs/swagger
cd docs/swagger

# Download Swagger UI
curl -L https://github.com/swagger-api/swagger-ui/archive/master.tar.gz | tar xz
mv swagger-ui-master/dist/* .
rm -rf swagger-ui-master

# Copy your OpenAPI specification
cp ../../api/openapi.yaml ./veritas-ai-api.yaml
```

#### Configure Swagger UI

Edit `index.html` to point to your API specification:

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Veritas AI API Documentation</title>
    <link rel="stylesheet" type="text/css" href="./swagger-ui.css" />
    <link rel="icon" type="image/png" href="./favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="./favicon-16x16.png" sizes="16x16" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
    </style>
</head>
<body>
<div id="swagger-ui"></div>
<script src="./swagger-ui-bundle.js"></script>
<script src="./swagger-ui-standalone-preset.js"></script>
<script>
    window.onload = function() {
        // Begin Swagger UI call region
        const ui = SwaggerUIBundle({
            url: "./veritas-ai-api.yaml",
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
            ],
            plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout",
            validatorUrl: null, // Disable online validation
        });
        // End Swagger UI call region

        window.ui = ui;
    };
</script>
</body>
</html>
```

### Option 2: npm Package Installation

#### Install Swagger UI

```bash
# Initialize package.json if needed
npm init -y

# Install Swagger UI
npm install swagger-ui-dist

# Create symlink or copy files
mkdir -p public/swagger
cp -r node_modules/swagger-ui-dist/* public/swagger/
```

### Option 3: Docker Deployment

#### Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  swagger-ui:
    image: swaggerapi/swagger-ui:v4.15.5
    container_name: veritas-ai-swagger
    ports:
      - "8080:8080"
    environment:
      - SWAGGER_JSON=/app/veritas-ai-api.yaml
    volumes:
      - ./docs/api/veritas-ai-api.yaml:/app/veritas-ai-api.yaml:ro
    restart: unless-stopped
```

Run with Docker Compose:

```bash
docker-compose up -d
```

## OpenAPI Specification Enhancement

Enhance your existing OpenAPI specification for better Swagger UI experience:

```yaml
openapi: 3.0.0
info:
  title: Content Authenticity and Deepfake Detection API
  description: |
    AI-powered platform for verifying the authenticity of digital content including images, videos, and documents.
    The platform uses advanced detection algorithms enhanced with RUV (Reputation, Uniqueness, Verification) profile fusion.

    ## Getting Started
    1. Obtain an API token from your account dashboard
    2. Use the `/auth/token` endpoint to generate a JWT token
    3. Include the token in the Authorization header for all requests
    4. Start verifying content with the `/verify` endpoint

    ## Rate Limits
    - 100 requests per minute for authenticated users
    - 10 requests per minute for unauthenticated requests
    - Exceeding limits results in 429 Too Many Requests responses

    ## Content Size Limits
    - Images: 50MB maximum
    - Videos: 500MB maximum
    - Documents: 100MB maximum
  version: 1.0.0
  contact:
    name: Veritas AI Support
    email: support@veritas-ai.com
    url: https://veritas-ai.com/support
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.veritas-ai.com/v1
    description: Production server
  - url: https://staging.api.veritas-ai.com/v1
    description: Staging server
  - url: http://localhost:3000/v1
    description: Development server

tags:
  - name: authentication
    description: Authentication and authorization endpoints
    externalDocs:
      description: Find out more about authentication
      url: https://docs.veritas-ai.com/auth
  - name: content
    description: Content verification and analysis endpoints
  - name: profiles
    description: RUV profile management endpoints
  - name: batch
    description: Batch processing endpoints
  - name: analytics
    description: Analytics and reporting endpoints

paths:
  /auth/token:
    post:
      tags:
        - authentication
      summary: Generate authentication token
      description: |
        Generate a JWT token for API access. Requires valid credentials.
        Tokens expire after 1 hour.
      operationId: generateToken
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                username:
                  type: string
                  description: User's username or email
                  example: "user@example.com"
                password:
                  type: string
                  format: password
                  description: User's password
                  example: "secure_password123"
              required:
                - username
                - password
      responses:
        '200':
          description: Authentication successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                    description: JWT token for API access
                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  expires_in:
                    type: integer
                    description: Token expiration time in seconds
                    example: 3600
              example:
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                expires_in: 3600
        '401':
          description: Authentication failed
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    description: Error message
                    example: "Invalid credentials"
              example:
                error: "Invalid credentials"
      security: []

  /verify:
    post:
      tags:
        - content
      summary: Verify content authenticity
      description: |
        Submit content for authenticity verification. Supports images, videos, and documents.
        Returns detailed analysis results with confidence scores.

        ## Supported Content Types
        - **images**: JPEG, PNG, GIF, BMP, TIFF
        - **videos**: MP4, AVI, MOV, WMV
        - **documents**: PDF, DOC, DOCX, XLS, XLSX

        ## Processing Time
        - Images: 1-5 seconds
        - Videos: 30 seconds - 5 minutes (depending on length)
        - Documents: 5-30 seconds
      operationId: verifyContent
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                content:
                  type: string
                  format: byte
                  description: Base64 encoded content data
                content_type:
                  type: string
                  enum: [image, video, document]
                  description: Type of content being verified
                filename:
                  type: string
                  description: Original filename (optional)
                  example: "suspicious_image.jpg"
                metadata:
                  type: object
                  description: Additional metadata (optional)
                  example:
                    source: "web_upload"
                    user_id: "user_123"
              required:
                - content
                - content_type
      responses:
        '200':
          description: Verification successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VerificationResult'
              example:
                id: "verification_12345"
                content_id: "content_67890"
                authentic: true
                confidence: 0.95
                details:
                  method: "image_analysis"
                  metadata_present: true
                  compression_artifacts: false
                  file_size: 2048000
                metadata:
                  timestamp: "2023-01-01T12:00:00Z"
                  content_length: 2048000
                ruv_profile:
                  reputation: 0.85
                  uniqueness: 0.92
                  verification: 0.95
                  fusion_score: 0.90
                created_at: "2023-01-01T12:00:00Z"
        '400':
          description: Invalid request
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: "Invalid content: type and data are required"
        '401':
          description: Authentication required
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: "Authentication required"
        '413':
          description: Content too large
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: "Content exceeds maximum size limit"

  /verify/{contentId}:
    get:
      tags:
        - content
      summary: Get verification result
      description: |
        Retrieve a previously generated verification result by content ID.
        Results are stored for 30 days.
      operationId: getVerificationResult
      security:
        - bearerAuth: []
      parameters:
        - name: contentId
          in: path
          required: true
          schema:
            type: string
          description: Unique identifier for the content
          example: "content_67890"
      responses:
        '200':
          description: Verification result retrieved
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VerificationResult'
        '404':
          description: Verification result not found
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: "Verification result not found"

  /profiles:
    post:
      tags:
        - profiles
      summary: Create or update RUV profile
      description: |
        Create or update a RUV (Reputation, Uniqueness, Verification) profile for content.
        Scores range from 0.0 (lowest) to 1.0 (highest).
      operationId: createOrUpdateProfile
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                content_id:
                  type: string
                  description: Unique identifier for the content
                  example: "content_67890"
                ruv_data:
                  type: object
                  properties:
                    reputation:
                      type: number
                      format: float
                      minimum: 0
                      maximum: 1
                      description: Reputation score
                      example: 0.85
                    uniqueness:
                      type: number
                      format: float
                      minimum: 0
                      maximum: 1
                      description: Uniqueness score
                      example: 0.92
                    verification:
                      type: number
                      format: float
                      minimum: 0
                      maximum: 1
                      description: Verification score
                      example: 0.95
                  required:
                    - reputation
                    - uniqueness
                    - verification
              required:
                - content_id
                - ruv_data
      responses:
        '200':
          description: Profile created or updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RUVProfile'
        '400':
          description: Invalid request
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string

  /profiles/{contentId}:
    get:
      tags:
        - profiles
      summary: Get RUV profile
      description: |
        Retrieve the RUV profile for specific content by content ID.
        Includes historical data and trend analysis.
      operationId: getProfile
      security:
        - bearerAuth: []
      parameters:
        - name: contentId
          in: path
          required: true
          schema:
            type: string
          description: Unique identifier for the content
          example: "content_67890"
      responses:
        '200':
          description: RUV profile retrieved
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RUVProfile'
        '404':
          description: Profile not found
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    example: "Profile not found"

  /batch/verify:
    post:
      tags:
        - batch
      summary: Batch verify content
      description: |
        Submit multiple content items for authenticity verification in a single request.
        Maximum 50 items per batch.

        ## Best Practices
        - Group similar content types together
        - Monitor processing time for large batches
        - Implement retry logic for failed items
      operationId: batchVerify
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                contents:
                  type: array
                  items:
                    type: object
                    properties:
                      id:
                        type: string
                        description: Client-provided identifier for the content
                        example: "client_item_001"
                      content:
                        type: string
                        format: byte
                        description: Base64 encoded content data
                      content_type:
                        type: string
                        enum: [image, video, document]
                        description: Type of content being verified
                      filename:
                        type: string
                        description: Original filename (optional)
                        example: "suspicious_image.jpg"
                      metadata:
                        type: object
                        description: Additional metadata (optional)
                    required:
                      - content
                      - content_type
              required:
                - contents
      responses:
        '200':
          description: Batch verification completed
          content:
            application/json:
              schema:
                type: object
                properties:
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/BatchVerificationResult'
        '400':
          description: Invalid request
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string

  /analytics/accuracy:
    get:
      tags:
        - analytics
      summary: Get accuracy metrics
      description: |
        Retrieve platform accuracy metrics including precision, recall, and F1-score.
        Data is aggregated and anonymized.
      operationId: getAccuracyMetrics
      security:
        - bearerAuth: []
      parameters:
        - name: start_date
          in: query
          required: false
          schema:
            type: string
            format: date
          description: Start date for metrics (YYYY-MM-DD)
          example: "2023-01-01"
        - name: end_date
          in: query
          required: false
          schema:
            type: string
            format: date
          description: End date for metrics (YYYY-MM-DD)
          example: "2023-01-31"
      responses:
        '200':
          description: Accuracy metrics retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  precision:
                    type: number
                    format: float
                    example: 0.95
                  recall:
                    type: number
                    format: float
                    example: 0.92
                  f1_score:
                    type: number
                    format: float
                    example: 0.93
                  accuracy:
                    type: number
                    format: float
                    example: 0.94
                  total_verifications:
                    type: integer
                    example: 10000
        '401':
          description: Authentication required

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        JWT token obtained from the /auth/token endpoint.
        Include in requests as: Authorization: Bearer <token>

  schemas:
    VerificationResult:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the verification result
          example: "verification_12345"
        content_id:
          type: string
          description: Unique identifier for the content
          example: "content_67890"
        authentic:
          type: boolean
          description: Whether the content is authentic
          example: true
        confidence:
          type: number
          format: float
          minimum: 0
          maximum: 1
          description: Confidence score (0-1)
          example: 0.95
        details:
          type: object
          description: Detailed analysis results
          properties:
            method:
              type: string
              description: Analysis method used
              example: "image_analysis"
            metadata_present:
              type: boolean
              description: Whether metadata was present
              example: true
            compression_artifacts:
              type: boolean
              description: Whether compression artifacts were detected
              example: false
            file_size:
              type: integer
              description: Size of the content in bytes
              example: 2048000
        metadata:
          type: object
          description: Metadata about the verification
          properties:
            timestamp:
              type: string
              format: date-time
              description: Timestamp of verification
              example: "2023-01-01T12:00:00Z"
            content_length:
              type: integer
              description: Length of content in bytes
              example: 2048000
        ruv_profile:
          $ref: '#/components/schemas/RUVProfile'
        created_at:
          type: string
          format: date-time
          description: Timestamp when the result was created
          example: "2023-01-01T12:00:00Z"

    RUVProfile:
      type: object
      properties:
        content_id:
          type: string
          description: Unique identifier for the content
          example: "content_67890"
        reputation:
          type: number
          format: float
          minimum: 0
          maximum: 1
          description: Reputation score
          example: 0.85
        uniqueness:
          type: number
          format: float
          minimum: 0
          maximum: 1
          description: Uniqueness score
          example: 0.92
        verification:
          type: number
          format: float
          minimum: 0
          maximum: 1
          description: Verification score
          example: 0.95
        fusion_score:
          type: number
          format: float
          minimum: 0
          maximum: 1
          description: Combined RUV fusion score
          example: 0.90
        history:
          type: array
          items:
            type: object
            properties:
              timestamp:
                type: string
                format: date-time
                example: "2023-01-01T12:00:00Z"
              reputation:
                type: number
                format: float
                example: 0.85
              uniqueness:
                type: number
                format: float
                example: 0.92
              verification:
                type: number
                format: float
                example: 0.95
        created_at:
          type: string
          format: date-time
          example: "2023-01-01T12:00:00Z"
        updated_at:
          type: string
          format: date-time
          example: "2023-01-01T12:00:00Z"

    BatchVerificationResult:
      type: object
      properties:
        content_id:
          type: string
          description: Client-provided identifier for the content
          example: "client_item_001"
        authentic:
          type: boolean
          description: Whether the content is authentic
          example: true
        confidence:
          type: number
          format: float
          minimum: 0
          maximum: 1
          description: Confidence score (0-1)
          example: 0.95
        error:
          type: string
          description: Error message if verification failed
          example: null

externalDocs:
  description: Find out more about Veritas AI
  url: https://veritas-ai.com/docs
```

## Customization Options

### 1. Branding and Styling

```css
/* custom.css */
.swagger-ui .topbar {
    background-color: #2c3e50;
}

.swagger-ui .topbar .download-url-wrapper .select-label {
    color: #ecf0f1;
}

.swagger-ui .btn.authorize {
    background-color: #3498db;
    border-color: #3498db;
}

.swagger-ui .btn.execute {
    background-color: #27ae60;
    border-color: #27ae60;
}
```

### 2. Configuration Options

```javascript
// Advanced Swagger UI configuration
const ui = SwaggerUIBundle({
    url: "./veritas-ai-api.yaml",
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIStandalonePreset
    ],
    plugins: [
        SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout",
    validatorUrl: null,

    // Custom configuration
    docExpansion: 'list', // Expand all operations by default
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    displayRequestDuration: true,
    filter: true, // Enable search filter

    // OAuth2 configuration (if applicable)
    oauth2RedirectUrl: window.location.origin + '/oauth2-redirect.html',

    // Custom request interceptor
    requestInterceptor: function(request) {
        request.headers['X-Client-Version'] = '1.0.0';
        return request;
    },

    // Custom response interceptor
    responseInterceptor: function(response) {
        console.log('API Response:', response);
        return response;
    }
});
```

## Integration with Existing Web Applications

### 1. React Integration

```jsx
// SwaggerUI.jsx
import React, { useEffect } from 'react';
import SwaggerUI from 'swagger-ui';

const SwaggerUIViewer = () => {
    useEffect(() => {
        SwaggerUI({
            url: '/api/veritas-ai-api.yaml',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
                SwaggerUI.presets.apis,
                SwaggerUI.StandalonePreset
            ],
            layout: 'StandaloneLayout'
        });
    }, []);

    return <div id="swagger-ui"></div>;
};

export default SwaggerUIViewer;
```

### 2. Express.js Integration

```javascript
// server.js
const express = require('express');
const path = require('path');
const app = express();

// Serve Swagger UI
app.use('/api-docs', express.static(path.join(__dirname, 'node_modules/swagger-ui-dist')));

// Serve OpenAPI specification
app.use('/api/veritas-ai-api.yaml', express.static(path.join(__dirname, 'docs/api/veritas-ai-api.yaml')));

// Custom index.html for Swagger UI
app.get('/api-docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs/swagger/index.html'));
});

app.listen(3000, () => {
    console.log('Swagger UI available at http://localhost:3000/api-docs');
});
```

## Security Considerations

### 1. API Key Protection

```javascript
// Hide sensitive information in documentation
const swaggerOptions = {
    swaggerOptions: {
        // Don't show sensitive default values
        displayOperationId: false,

        // Custom authorization handling
        onComplete: function() {
            // Hide default auth values
            document.querySelectorAll('input[type="password"]').forEach(input => {
                input.placeholder = 'Enter your API token';
            });
        }
    }
};
```

### 2. CORS Configuration

```javascript
// Ensure proper CORS for Swagger UI
app.use('/api-docs', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});
```

## Testing and Validation

### 1. Validate OpenAPI Specification

```bash
# Install swagger-cli
npm install -g swagger-cli

# Validate your OpenAPI specification
swagger-cli validate docs/api/veritas-ai-api.yaml

# Bundle and resolve references
swagger-cli bundle docs/api/veritas-ai-api.yaml -o docs/api/veritas-ai-api.bundled.yaml
```

### 2. Automated Testing

```javascript
// test-swagger.js
const SwaggerParser = require('@apidevtools/swagger-parser');

async function validateSwaggerSpec() {
    try {
        const api = await SwaggerParser.validate('docs/api/veritas-ai-api.yaml');
        console.log('API name: %s, Version: %s', api.info.title, api.info.version);
        console.log('Specification is valid');
        return true;
    } catch (err) {
        console.error('Specification validation failed:', err);
        return false;
    }
}

validateSwaggerSpec();
```

## Deployment Best Practices

### 1. Production Deployment

```nginx
# nginx configuration
server {
    listen 80;
    server_name api-docs.veritas-ai.com;

    location / {
        root /var/www/swagger;
        index index.html;
        try_files $uri $uri/ =404;
    }

    location /api/ {
        proxy_pass https://api.veritas-ai.com/v1/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}
```

### 2. CDN Integration

```html
<!-- Use CDN for better performance -->
<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui.css">
```

This Swagger UI setup guide provides comprehensive instructions for implementing interactive API documentation for the Veritas AI platform, ensuring developers have an excellent experience when exploring and testing the API.