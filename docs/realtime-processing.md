# Real-time Processing Features

VeritasAI Phase 3 introduces real-time processing capabilities to enable live content verification and instant feedback to users.

## Overview

The real-time system provides:

1. **WebSocket Communication**: Bidirectional communication for instant updates
2. **Streaming Content Processing**: Real-time analysis of live content streams
3. **Push Notifications**: Instant alerts for verification results and system events
4. **Dashboard Updates**: Live updating of analytics and statistics

## WebSocket Architecture

### Connection Endpoints

#### Notifications Endpoint
```websocket
ws://localhost:8000/api/v1/ws/notifications
```
Connects users to receive real-time notifications about their content verification results.

#### Analysis Endpoint
```websocket
ws://localhost:8000/api/v1/ws/analysis/{content_id}
```
Connects users to receive real-time updates for specific content analysis.

#### Dashboard Endpoint
```websocket
ws://localhost:8000/api/v1/ws/dashboard
```
Connects users to receive real-time dashboard updates.

### Authentication

WebSocket connections require JWT authentication. The token should be sent in the `Authorization` header when establishing the connection:
```
Authorization: Bearer <jwt_token>
```

### Message Format

All WebSocket messages use JSON format:
```json
{
  "type": "message_type",
  "data": {...},
  "timestamp": 1234567890.123
}
```

### Message Types

#### Success Messages
```json
{
  "type": "success",
  "data": {"message": "Operation completed successfully"},
  "timestamp": 1234567890.123
}
```

#### Error Messages
```json
{
  "type": "error",
  "error": "Error description",
  "timestamp": 1234567890.123
}
```

#### Update Messages
```json
{
  "type": "update",
  "update_type": "analysis_progress",
  "data": {...},
  "timestamp": 1234567890.123
}
```

### Subscription Management

Users can subscribe to specific topics for targeted updates:

#### Subscribe to Topic
```json
{
  "type": "subscribe",
  "subscription": "user_123_notifications"
}
```

#### Unsubscribe from Topic
```json
{
  "type": "unsubscribe",
  "subscription": "user_123_notifications"
}
```

## Streaming Content Processing

### Streaming Endpoints

#### Start Streaming
```http
POST /api/v1/stream/start
```

**Parameters:**
- `content_type` (string, required): Type of content being streamed
- `initial_data` (object, required): Initial data for the stream
- `user_id` (integer, required): ID of the user initiating the stream

#### Process Stream Chunk
```http
POST /api/v1/stream/chunk/{stream_id}
```

**Parameters:**
- `stream_id` (string, required): Unique identifier for the stream
- `chunk_data` (object, required): Data chunk to process

#### Stop Streaming
```http
POST /api/v1/stream/stop/{stream_id}
```

**Parameters:**
- `stream_id` (string, required): Unique identifier for the stream

#### Get Stream Status
```http
GET /api/v1/stream/status/{stream_id}
```

**Parameters:**
- `stream_id` (string, required): Unique identifier for the stream

### Supported Content Types

1. **Text Streams**: Real-time text analysis for live content
2. **Video Streams**: Frame-by-frame analysis of live video feeds
3. **Audio Streams**: Real-time audio content verification

### Example Usage

#### JavaScript WebSocket Client
```javascript
const ws = new WebSocket('ws://localhost:8000/api/v1/ws/notifications');

ws.onopen = function(event) {
    // Send authentication token
    ws.send(JSON.stringify({
        type: "auth",
        token: "your_jwt_token"
    }));
};

ws.onmessage = function(event) {
    const message = JSON.parse(event.data);
    console.log("Received:", message);
    
    // Handle different message types
    switch(message.type) {
        case "success":
            console.log("Success:", message.data);
            break;
        case "error":
            console.error("Error:", message.error);
            break;
        case "update":
            handleUpdate(message.update_type, message.data);
            break;
    }
};

function handleUpdate(updateType, data) {
    switch(updateType) {
        case "analysis_progress":
            updateProgressBar(data.progress);
            break;
        case "verification_complete":
            showVerificationResult(data.result);
            break;
    }
}
```

#### Python Streaming Client
```python
import requests
import json

# Start streaming session
start_response = requests.post(
    "http://localhost:8000/api/v1/stream/start",
    json={
        "content_type": "text_stream",
        "initial_data": {"source": "live_feed"},
        "user_id": 123
    },
    headers={"Authorization": "Bearer your_jwt_token"}
)

stream_id = start_response.json()["stream_id"]

# Process text chunks
text_chunks = ["First chunk", "Second chunk", "Third chunk"]
for i, chunk in enumerate(text_chunks):
    chunk_response = requests.post(
        f"http://localhost:8000/api/v1/stream/chunk/{stream_id}",
        json={
            "text": chunk,
            "chunk_id": f"chunk_{i}"
        },
        headers={"Authorization": "Bearer your_jwt_token"}
    )

# Stop streaming
stop_response = requests.post(
    f"http://localhost:8000/api/v1/stream/stop/{stream_id}",
    headers={"Authorization": "Bearer your_jwt_token"}
)
```

## Performance Considerations

### Connection Limits
- Maximum concurrent WebSocket connections: 10,000
- Maximum subscriptions per user: 100
- Message size limit: 1MB

### Resource Management
- Automatic cleanup of disconnected clients
- Stream timeout after 30 minutes of inactivity
- Memory-efficient streaming processing

## Integration with Existing Systems

### Dashboard Integration
Real-time updates are automatically pushed to connected dashboard clients:
- Live verification statistics
- Real-time content trends
- Instant notification alerts

### ML Model Integration
Streaming processors leverage ML models for real-time analysis:
- Text analysis models for live content
- Image analysis models for video streams
- Performance monitoring for model accuracy

### Notification System
Real-time notifications are sent for:
- Content verification completion
- Deepfake detection results
- Third-party verification updates
- System status changes

## Security Features

### Authentication
- JWT token validation for all WebSocket connections
- User-specific subscription filtering
- Rate limiting for connection attempts

### Authorization
- Users can only subscribe to their own topics
- Admin-only access to system-wide subscriptions
- Content-based access control

## Monitoring and Debugging

### Connection Monitoring
- Active connection tracking
- Subscription monitoring
- Error rate tracking

### Performance Metrics
- Message throughput
- Latency measurements
- Stream processing times

### Debugging Tools
- WebSocket message logging
- Stream processing traces
- Performance profiling

## Future Enhancements

Planned improvements include:
- Support for additional content types (audio, mixed media)
- Advanced subscription filtering
- Distributed WebSocket clustering
- Enhanced performance monitoring
- Automated scaling for high-load scenarios