# Quick Start Guide

This guide provides a fast path to get started with the Veritas AI Content Authenticity and Deepfake Detection platform. Follow these steps to quickly integrate and begin verifying digital content.

## Prerequisites

- Account with Veritas AI platform
- API access token
- Programming environment (Python, JavaScript, Java, or other supported languages)
- Sample content to verify (images, videos, documents)

## Step 1: Get Your API Credentials

1. Sign up at [veritas-ai.com](https://veritas-ai.com)
2. Navigate to Developer Portal
3. Generate API token
4. Note your API endpoint URL

```bash
# Store your credentials securely
export VERITAS_API_TOKEN="your_api_token_here"
export VERITAS_API_URL="https://api.veritas-ai.com/v1"
```

## Step 2: Install Client Libraries

### Python

```bash
pip install requests
```

### JavaScript/Node.js

```bash
npm install axios
```

### Java

Add to your `pom.xml`:

```xml
<dependency>
    <groupId>org.apache.httpcomponents</groupId>
    <artifactId>httpclient</artifactId>
    <version>4.5.14</version>
</dependency>
```

## Step 3: Simple Content Verification

### Python Example

```python
import requests
import base64

# Read and encode your content
with open('suspicious_image.jpg', 'rb') as image_file:
    encoded_image = base64.b64encode(image_file.read()).decode('utf-8')

# Prepare verification request
headers = {
    'Authorization': f'Bearer {VERITAS_API_TOKEN}',
    'Content-Type': 'application/json'
}

data = {
    'content': encoded_image,
    'content_type': 'image',
    'filename': 'suspicious_image.jpg'
}

# Send verification request
response = requests.post(
    f'{VERITAS_API_URL}/verify',
    headers=headers,
    json=data
)

# Process results
if response.status_code == 200:
    result = response.json()
    print(f"Authentic: {result['authentic']}")
    print(f"Confidence: {result['confidence']:.2f}")
    print(f"RUV Score: {result['ruv_profile']['fusion_score']:.2f}")
else:
    print(f"Error: {response.status_code} - {response.text}")
```

### JavaScript Example

```javascript
const fs = require('fs');
const axios = require('axios');

// Read and encode your content
const imageBuffer = fs.readFileSync('suspicious_image.jpg');
const encodedImage = imageBuffer.toString('base64');

// Prepare verification request
const config = {
    headers: {
        'Authorization': `Bearer ${process.env.VERITAS_API_TOKEN}`,
        'Content-Type': 'application/json'
    }
};

const data = {
    content: encodedImage,
    content_type: 'image',
    filename: 'suspicious_image.jpg'
};

// Send verification request
axios.post(`${process.env.VERITAS_API_URL}/verify`, data, config)
    .then(response => {
        const result = response.data;
        console.log(`Authentic: ${result.authentic}`);
        console.log(`Confidence: ${result.confidence.toFixed(2)}`);
        console.log(`RUV Score: ${result.ruv_profile.fusion_score.toFixed(2)}`);
    })
    .catch(error => {
        console.error('Error:', error.response?.data || error.message);
    });
```

### Java Example

```java
import java.io.File;
import java.nio.file.Files;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import com.fasterxml.jackson.databind.ObjectMapper;

public class QuickStartExample {
    private static final String API_TOKEN = System.getenv("VERITAS_API_TOKEN");
    private static final String API_URL = System.getenv("VERITAS_API_URL");

    public static void main(String[] args) throws Exception {
        // Read and encode your content
        File imageFile = new File("suspicious_image.jpg");
        byte[] fileContent = Files.readAllBytes(imageFile.toPath());
        String encodedImage = Base64.getEncoder().encodeToString(fileContent);

        // Prepare verification request
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(API_URL + "/verify");
            httpPost.setHeader("Authorization", "Bearer " + API_TOKEN);
            httpPost.setHeader("Content-Type", "application/json");

            // Prepare request data
            Map<String, Object> requestData = new HashMap<>();
            requestData.put("content", encodedImage);
            requestData.put("content_type", "image");
            requestData.put("filename", "suspicious_image.jpg");

            ObjectMapper mapper = new ObjectMapper();
            String jsonRequest = mapper.writeValueAsString(requestData);
            httpPost.setEntity(new StringEntity(jsonRequest, "UTF-8"));

            // Send verification request
            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                int statusCode = response.getStatusLine().getStatusCode();
                String responseBody = EntityUtils.toString(response.getEntity());

                if (statusCode == 200) {
                    // Process results (simplified)
                    System.out.println("Verification successful: " + responseBody);
                } else {
                    System.out.println("Error: " + statusCode + " - " + responseBody);
                }
            }
        }
    }
}
```

## Step 4: Batch Processing

Process multiple items efficiently:

```python
import requests
import base64
import os

def batch_verify_content(content_items):
    # Prepare batch request
    contents = []
    for i, item in enumerate(content_items):
        with open(item['path'], 'rb') as file:
            encoded_content = base64.b64encode(file.read()).decode('utf-8')

        contents.append({
            'id': f'item_{i}',
            'content': encoded_content,
            'content_type': item['type'],
            'filename': os.path.basename(item['path'])
        })

    # Send batch verification request
    headers = {
        'Authorization': f'Bearer {VERITAS_API_TOKEN}',
        'Content-Type': 'application/json'
    }

    data = {'contents': contents}

    response = requests.post(
        f'{VERITAS_API_URL}/batch/verify',
        headers=headers,
        json=data
    )

    return response.json()

# Usage
content_items = [
    {'path': 'image1.jpg', 'type': 'image'},
    {'path': 'video1.mp4', 'type': 'video'},
    {'path': 'document1.pdf', 'type': 'document'}
]

results = batch_verify_content(content_items)
for result in results['results']:
    if 'error' in result:
        print(f"Error for {result['content_id']}: {result['error']}")
    else:
        print(f"{result['content_id']}: Authentic={result['authentic']}, Confidence={result['confidence']:.2f}")
```

## Step 5: RUV Profile Management

Enhance verification with reputation data:

```python
import requests

def update_ruv_profile(content_id, ruv_data):
    headers = {
        'Authorization': f'Bearer {VERITAS_API_TOKEN}',
        'Content-Type': 'application/json'
    }

    data = {
        'content_id': content_id,
        'ruv_data': ruv_data
    }

    response = requests.post(
        f'{VERITAS_API_URL}/profiles',
        headers=headers,
        json=data
    )

    return response.json()

# Usage
ruv_data = {
    'reputation': 0.85,
    'uniqueness': 0.92,
    'verification': 0.95
}

profile_result = update_ruv_profile('content_12345', ruv_data)
print(f"Profile updated: {profile_result}")
```

## Step 6: Monitor Accuracy Metrics

Track platform performance:

```python
import requests
from datetime import datetime, timedelta

def get_accuracy_metrics():
    headers = {
        'Authorization': f'Bearer {VERITAS_API_TOKEN}',
        'Content-Type': 'application/json'
    }

    # Get metrics for last 30 days
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)

    params = {
        'start_date': start_date.strftime('%Y-%m-%d'),
        'end_date': end_date.strftime('%Y-%m-%d')
    }

    response = requests.get(
        f'{VERITAS_API_URL}/analytics/accuracy',
        headers=headers,
        params=params
    )

    return response.json()

# Usage
metrics = get_accuracy_metrics()
print(f"Precision: {metrics['precision']:.4f}")
print(f"Recall: {metrics['recall']:.4f}")
print(f"F1 Score: {metrics['f1_score']:.4f}")
print(f"Accuracy: {metrics['accuracy']:.4f}")
```

## Common Use Cases

### 1. News Media Verification

```python
def verify_news_content(image_path, source_info):
    # Verify content authenticity
    verification_result = verify_image(image_path)

    # Get source reputation
    source_profile = get_source_profile(source_info['source_id'])

    # Calculate contextual score
    contextual_score = (
        verification_result['confidence'] * 0.6 +
        source_profile['reputation'] * 0.3 +
        source_profile['history']['authentic_rate'] * 0.1
    )

    return {
        'authentic': verification_result['authentic'],
        'confidence': verification_result['confidence'],
        'contextual_score': contextual_score,
        'credible': contextual_score > 0.85
    }
```

### 2. E-commerce Product Verification

```python
def verify_product_image(image_path, product_id, seller_id):
    # Verify image authenticity
    verification = verify_image(image_path)

    # Check for duplicates
    duplicate_check = check_for_duplicates(image_path, product_id)

    # Update seller profile
    update_seller_profile(seller_id, verification['authentic'], duplicate_check['is_duplicate'])

    return {
        'product_id': product_id,
        'seller_id': seller_id,
        'authentic': verification['authentic'] and not duplicate_check['is_duplicate'],
        'confidence': verification['confidence'],
        'is_duplicate': duplicate_check['is_duplicate']
    }
```

## Best Practices

### 1. Error Handling

```python
import time
import requests

def verify_with_retry(content_path, content_type, max_retries=3):
    for attempt in range(max_retries):
        try:
            return verify_content(content_path, content_type)
        except requests.exceptions.RequestException as e:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # Exponential backoff
                print(f"Attempt {attempt + 1} failed, retrying in {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                raise e
```

### 2. Rate Limiting

```python
import time
from collections import deque

class RateLimiter:
    def __init__(self, max_requests=100, time_window=60):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = deque()

    def wait_if_needed(self):
        now = time.time()

        # Remove old requests
        while self.requests and self.requests[0] < now - self.time_window:
            self.requests.popleft()

        # Wait if limit exceeded
        if len(self.requests) >= self.max_requests:
            sleep_time = self.time_window - (now - self.requests[0])
            if sleep_time > 0:
                time.sleep(sleep_time)

        self.requests.append(now)

# Usage
rate_limiter = RateLimiter(max_requests=100, time_window=60)

def verify_content_safely(content_path, content_type):
    rate_limiter.wait_if_needed()
    return verify_content(content_path, content_type)
```

### 3. Caching Results

```python
import hashlib
import json
from functools import lru_cache

@lru_cache(maxsize=1000)
def cached_verify_content(content_hash, content_type):
    # Implementation would call the actual verification API
    pass

def verify_content_with_cache(content_path, content_type):
    # Create hash of content for cache key
    with open(content_path, 'rb') as f:
        content_hash = hashlib.md5(f.read()).hexdigest()

    return cached_verify_content(content_hash, content_type)
```

## Next Steps

1. **Explore Advanced Features**: Check out the full API documentation for advanced endpoints
2. **Implement Production Patterns**: Add proper error handling, logging, and monitoring
3. **Scale Your Integration**: Use batch processing and async patterns for high-volume applications
4. **Customize RUV Profiles**: Implement domain-specific reputation scoring
5. **Monitor Performance**: Use analytics endpoints to track accuracy and performance

## Support

For issues and questions:
- Documentation: [docs.veritas-ai.com](https://docs.veritas-ai.com)
- Support: support@veritas-ai.com
- API Status: [status.veritas-ai.com](https://status.veritas-ai.com)

This Quick Start Guide provides the essential steps to begin using the Veritas AI platform for content authenticity verification and deepfake detection.