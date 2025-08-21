# VeritasAI Data Models

## 1. Database Schema

### 1.1 Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    api_key VARCHAR(255) UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 1.2 Content Table
```sql
CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    content_type VARCHAR(50) NOT NULL, -- 'image', 'video', 'audio'
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT,
    storage_path VARCHAR(500),
    status VARCHAR(50) DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed'
    authenticity_score DECIMAL(5,4), -- 0.0000 to 1.0000
    confidence DECIMAL(5,4), -- 0.0000 to 1.0000
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);
```

### 1.3 Analysis Results Table
```sql
CREATE TABLE analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID REFERENCES content(id),
    authenticity_score DECIMAL(5,4),
    confidence DECIMAL(5,4),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 1.4 Findings Table
```sql
CREATE TABLE findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_result_id UUID REFERENCES analysis_results(id),
    type VARCHAR(100) NOT NULL, -- 'deepfake', 'image_splicing', 'audio_synthesis', etc.
    confidence DECIMAL(5,4),
    description TEXT,
    timestamp DECIMAL(10,3), -- For video/audio, in seconds
    bounding_box JSONB, -- For spatial findings
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 1.5 Model Versions Table
```sql
CREATE TABLE model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_type VARCHAR(100) NOT NULL, -- 'image_classification', 'video_analysis', etc.
    version VARCHAR(50) NOT NULL,
    accuracy DECIMAL(5,4),
    precision DECIMAL(5,4),
    recall DECIMAL(5,4),
    f1_score DECIMAL(5,4),
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active' -- 'active', 'deprecated'
);
```

### 1.6 Usage Tracking Table
```sql
CREATE TABLE usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    content_id UUID REFERENCES content(id),
    model_version_id UUID REFERENCES model_versions(id),
    processing_time_ms INTEGER,
    tokens_used INTEGER, -- For LLM-based analysis
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 2. Redis Data Structures

### 2.1 Session Storage
```
# User sessions
session:{session_id} -> {user_id, expires_at, ip_address}

# API rate limiting
ratelimit:{user_id}:{endpoint}:{hour} -> {count}
```

### 2.2 Task Queue
```
# Analysis task queue
analysis_queue -> [{content_id, user_id, content_type, priority}, ...]

# Processing tasks
processing:{content_id} -> {started_at, worker_id}
```

### 2.3 Caching
```
# User profile cache
user:{user_id} -> {email, name, subscription_tier}

# Content metadata cache
content:{content_id} -> {status, authenticity_score, completed_at}

# Analysis report cache
report:{content_id} -> {full_report_json}
```

## 3. Object Storage Structure

### 3.1 Storage Organization
```
veritasai-storage/
├── users/
│   └── {user_id}/
│       ├── uploads/
│       │   ├── {content_id}.{extension}
│       │   └── ...
│       └── reports/
│           ├── {content_id}.pdf
│           ├── {content_id}.json
│           └── ...
├── models/
│   ├── image_classification/
│   │   ├── v1.0.0/
│   │   ├── v1.1.0/
│   │   └── ...
│   ├── video_analysis/
│   │   ├── v1.0.0/
│   │   └── ...
│   └── audio_analysis/
│       ├── v1.0.0/
│       └── ...
└── temp/
    ├── {temp_id}/
    └── ...
```

## 4. JSON Data Models

### 4.1 User Profile
```json
{
  "id": "user_123456",
  "email": "user@example.com",
  "name": "John Doe",
  "subscription_tier": "premium",
  "api_key": "vk_1234567890abcdef",
  "email_verified": true,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### 4.2 Content Metadata
```json
{
  "id": "cont_123456",
  "user_id": "user_123456",
  "content_type": "video",
  "filename": "video.mp4",
  "file_size": 1024000,
  "storage_path": "users/user_123456/uploads/cont_123456.mp4",
  "status": "completed",
  "authenticity_score": 0.85,
  "confidence": 0.92,
  "error_message": null,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:05:00Z",
  "completed_at": "2023-01-01T00:05:00Z"
}
```

### 4.3 Analysis Report
```json
{
  "id": "res_123456",
  "content_id": "cont_123456",
  "authenticity_score": 0.85,
  "confidence": 0.92,
  "findings": [
    {
      "id": "find_123456",
      "type": "deepfake",
      "confidence": 0.78,
      "description": "Facial manipulation detected",
      "timestamp": 120.5,
      "bounding_box": {
        "x": 100,
        "y": 150,
        "width": 200,
        "height": 250
      },
      "metadata": {
        "model_used": "deepfake_detector_v1.2.0",
        "features_detected": ["facial_inconsistency", "eye_blink_pattern"]
      }
    }
  ],
  "metadata": {
    "duration": 300.5,
    "resolution": "1920x1080",
    "codec": "h264",
    "bitrate": 5000000,
    "frame_rate": 30.0
  },
  "model_versions": {
    "image_classification": "v1.2.0",
    "object_detection": "v2.1.0",
    "video_analysis": "v1.0.0"
  },
  "created_at": "2023-01-01T00:05:00Z"
}
```

### 4.4 Model Performance Metrics
```json
{
  "id": "mod_123456",
  "model_type": "video_analysis",
  "version": "v1.0.0",
  "accuracy": 0.95,
  "precision": 0.93,
  "recall": 0.97,
  "f1_score": 0.95,
  "deployed_at": "2023-01-01T00:00:00Z",
  "status": "active",
  "performance_metrics": {
    "average_processing_time_ms": 15000,
    "gpu_utilization": 0.75,
    "memory_usage_mb": 2048
  }
}
```

## 5. Data Flow and Transformation

### 5.1 Ingestion Pipeline
1. Raw content uploaded to object storage
2. Metadata extracted and stored in PostgreSQL
3. Content metadata cached in Redis
4. Analysis task queued in Redis

### 5.2 Analysis Pipeline
1. Worker dequeues analysis task
2. Content retrieved from object storage
3. AI models process content and generate findings
4. Results stored in PostgreSQL
5. Findings aggregated into analysis report
6. Report cached in Redis
7. User notified via Notification Service

### 5.3 Reporting Pipeline
1. User requests analysis report
2. Report retrieved from Redis cache (if available)
3. If not cached, compiled from PostgreSQL data
4. Report cached in Redis for future requests
5. Report served to user

## 6. Data Privacy and Security

### 6.1 Data Encryption
- All data at rest encrypted with AES-256
- All data in transit encrypted with TLS 1.3
- API keys and sensitive data hashed with bcrypt

### 6.2 Data Retention
- User content retained for 30 days after analysis
- Analysis reports retained indefinitely
- Raw content automatically deleted after retention period
- Users can request data deletion at any time

### 6.3 Compliance
- GDPR compliant data handling
- CCPA compliant data processing
- SOC 2 Type II compliant infrastructure
- Regular security audits and penetration testing