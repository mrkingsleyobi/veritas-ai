# Troubleshooting Guide

This guide helps you identify and resolve common issues when working with the Veritas AI Content Authenticity and Deepfake Detection platform.

## Authentication Issues

### 1. Invalid Credentials

**Symptoms**:
- 401 Unauthorized error
- "Invalid credentials" message
- Token generation fails

**Solutions**:
```bash
# Verify your credentials
echo "Check username: $VERITAS_USERNAME"
echo "Check password length: ${#VERITAS_PASSWORD}"

# Test token generation
curl -X POST "$VERITAS_API_URL/auth/token" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "'"$VERITAS_USERNAME"'",
    "password": "'"$VERITAS_PASSWORD"'"
  }'
```

**Common causes**:
- Incorrect username or password
- Expired credentials
- Account locked due to failed attempts
- Missing environment variables

### 2. Token Expiration

**Symptoms**:
- 401 error after successful initial authentication
- "Token expired" messages
- Intermittent authentication failures

**Solutions**:
```python
# Python: Implement automatic token refresh
import time

class VeritasClient:
    def __init__(self):
        self.token = None
        self.token_expiry = 0

    def get_valid_token(self):
        if time.time() > self.token_expiry - 60:  # Refresh 1 minute before expiry
            self.refresh_token()
        return self.token

    def refresh_token(self):
        # Implementation for token refresh
        response = self.auth_service.generate_token()
        self.token = response['token']
        self.token_expiry = time.time() + response['expires_in']
```

## Content Verification Issues

### 1. File Size Limits

**Symptoms**:
- 413 Payload Too Large error
- "Content exceeds maximum size limit" message
- Upload timeouts

**Solutions**:
```python
import os

def check_file_size(file_path, max_size_mb=50):
    """Check if file size is within limits"""
    file_size = os.path.getsize(file_path)
    max_size_bytes = max_size_mb * 1024 * 1024

    if file_size > max_size_bytes:
        raise ValueError(f"File size {file_size} bytes exceeds limit of {max_size_bytes} bytes")

    return file_size

# Pre-check before upload
try:
    file_size = check_file_size('large_video.mp4', max_size_mb=100)
    print(f"File size: {file_size} bytes - OK")
except ValueError as e:
    print(f"File too large: {e}")
```

### 2. Unsupported Content Types

**Symptoms**:
- 400 Bad Request error
- "Unsupported content type" message
- Processing failures

**Solutions**:
```python
import mimetypes

def validate_content_type(file_path):
    """Validate content type based on file extension"""
    supported_types = {
        '.jpg': 'image',
        '.jpeg': 'image',
        '.png': 'image',
        '.gif': 'image',
        '.mp4': 'video',
        '.avi': 'video',
        '.mov': 'video',
        '.pdf': 'document',
        '.doc': 'document',
        '.docx': 'document'
    }

    _, extension = os.path.splitext(file_path.lower())

    if extension not in supported_types:
        raise ValueError(f"Unsupported file type: {extension}")

    return supported_types[extension]

# Validate before processing
try:
    content_type = validate_content_type('content.xyz')
    print(f"Content type: {content_type}")
except ValueError as e:
    print(f"Validation error: {e}")
```

### 3. Encoding Issues

**Symptoms**:
- Corrupted content after upload
- "Invalid content" errors
- Processing failures

**Solutions**:
```python
import base64

def safe_encode_file(file_path):
    """Safely encode file content"""
    try:
        with open(file_path, 'rb') as file:
            content = file.read()

        # Check if content is valid
        if not content:
            raise ValueError("File is empty")

        # Encode content
        encoded_content = base64.b64encode(content).decode('utf-8')

        # Validate encoding
        if len(encoded_content) == 0:
            raise ValueError("Encoding failed")

        return encoded_content
    except Exception as e:
        raise ValueError(f"Failed to encode file: {str(e)}")

# Safe encoding
try:
    encoded_content = safe_encode_file('image.jpg')
    print("File encoded successfully")
except ValueError as e:
    print(f"Encoding error: {e}")
```

## Network and Connectivity Issues

### 1. Connection Timeouts

**Symptoms**:
- Request timeouts
- Connection refused errors
- Intermittent connectivity issues

**Solutions**:
```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def create_robust_session():
    """Create HTTP session with retry logic"""
    session = requests.Session()

    # Define retry strategy
    retry_strategy = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
    )

    # Mount adapter with retry strategy
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)

    return session

# Usage
session = create_robust_session()
try:
    response = session.post(url, headers=headers, json=data, timeout=30)
except requests.exceptions.Timeout:
    print("Request timed out")
except requests.exceptions.ConnectionError:
    print("Connection error")
```

### 2. SSL/TLS Issues

**Symptoms**:
- SSL certificate errors
- "Certificate verify failed" messages
- Connection security warnings

**Solutions**:
```python
import requests
import ssl
import certifi

def verify_ssl_configuration():
    """Verify SSL configuration"""
    try:
        # Test SSL connection
        response = requests.get("https://api.veritas-ai.com/v1/health",
                              verify=certifi.where())
        print("SSL connection successful")
        return True
    except requests.exceptions.SSLError as e:
        print(f"SSL error: {e}")
        return False
    except Exception as e:
        print(f"Connection error: {e}")
        return False

# For development/testing only (NOT recommended for production)
def disable_ssl_verification():
    """Disable SSL verification (development only)"""
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    session = requests.Session()
    session.verify = False
    return session
```

## Performance Issues

### 1. Slow Processing Times

**Symptoms**:
- Long response times
- Timeouts during processing
- Resource exhaustion

**Solutions**:
```python
import asyncio
import time
from concurrent.futures import ThreadPoolExecutor

class PerformanceOptimizer:
    def __init__(self, max_workers=5):
        self.executor = ThreadPoolExecutor(max_workers=max_workers)

    async def process_content_async(self, content_items):
        """Process content asynchronously"""
        loop = asyncio.get_event_loop()
        tasks = []

        for item in content_items:
            task = loop.run_in_executor(
                self.executor,
                self.process_single_item,
                item
            )
            tasks.append(task)

        results = await asyncio.gather(*tasks, return_exceptions=True)
        return results

    def process_single_item(self, item):
        """Process single content item"""
        # Implementation here
        pass

# Usage
optimizer = PerformanceOptimizer(max_workers=10)
results = asyncio.run(optimizer.process_content_async(content_items))
```

### 2. Memory Issues

**Symptoms**:
- Out of memory errors
- High memory consumption
- Application crashes

**Solutions**:
```python
import gc
import psutil

def monitor_memory_usage():
    """Monitor memory usage"""
    process = psutil.Process()
    memory_info = process.memory_info()

    print(f"RSS: {memory_info.rss / 1024 / 1024:.2f} MB")
    print(f"VMS: {memory_info.vms / 1024 / 1024:.2f} MB")

    return memory_info

def optimize_memory_usage():
    """Optimize memory usage"""
    # Clear caches
    gc.collect()

    # Clear any large objects
    # Implementation specific to your use case

# Monitor during processing
memory_before = monitor_memory_usage()
# ... processing ...
memory_after = monitor_memory_usage()

if (memory_after.rss - memory_before.rss) > 100 * 1024 * 1024:  # 100MB
    print("High memory usage detected, optimizing...")
    optimize_memory_usage()
```

## Batch Processing Issues

### 1. Batch Size Limits

**Symptoms**:
- 400 Bad Request for large batches
- "Batch too large" errors
- Partial batch processing

**Solutions**:
```python
def chunk_batch_processing(content_items, max_batch_size=50):
    """Process content in chunks to avoid batch size limits"""
    for i in range(0, len(content_items), max_batch_size):
        chunk = content_items[i:i + max_batch_size]
        print(f"Processing batch {i//max_batch_size + 1} with {len(chunk)} items")

        try:
            result = process_batch(chunk)
            yield result
        except Exception as e:
            print(f"Batch {i//max_batch_size + 1} failed: {e}")
            # Handle partial failures
            yield None

# Usage
content_items = [...]  # Large list of items
for batch_result in chunk_batch_processing(content_items):
    if batch_result:
        # Process successful batch
        pass
```

### 2. Partial Batch Failures

**Symptoms**:
- Mixed success/failure results
- Some items processed, others failed
- Inconsistent batch results

**Solutions**:
```python
def handle_partial_batch_failures(batch_result):
    """Handle partial batch failures"""
    successful_items = []
    failed_items = []

    for item_result in batch_result.get('results', []):
        if 'error' in item_result:
            failed_items.append({
                'content_id': item_result['content_id'],
                'error': item_result['error']
            })
        else:
            successful_items.append(item_result)

    print(f"Successful: {len(successful_items)}, Failed: {len(failed_items)}")

    # Retry failed items individually
    for failed_item in failed_items:
        print(f"Retrying failed item: {failed_item['content_id']}")
        # Implementation for retry logic

    return {
        'successful': successful_items,
        'failed': failed_items
    }
```

## API Rate Limiting

### 1. Rate Limit Exceeded

**Symptoms**:
- 429 Too Many Requests error
- "Rate limit exceeded" messages
- Request throttling

**Solutions**:
```python
import time
from collections import deque

class RateLimiter:
    def __init__(self, max_requests=100, time_window=60):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = deque()

    def wait_if_needed(self):
        """Wait if rate limit would be exceeded"""
        now = time.time()

        # Remove old requests
        while self.requests and self.requests[0] < now - self.time_window:
            self.requests.popleft()

        # Wait if limit exceeded
        if len(self.requests) >= self.max_requests:
            sleep_time = self.time_window - (now - self.requests[0])
            if sleep_time > 0:
                print(f"Rate limit reached, waiting {sleep_time:.2f} seconds...")
                time.sleep(sleep_time)

        self.requests.append(now)

# Usage
rate_limiter = RateLimiter(max_requests=100, time_window=60)

def api_call_with_rate_limiting():
    rate_limiter.wait_if_needed()
    # Make API call
    return make_api_call()
```

## Data and Results Issues

### 1. Inconsistent Results

**Symptoms**:
- Different results for same content
- Confidence scores vary significantly
- Unexpected verification outcomes

**Solutions**:
```python
def verify_consistent_results(content_path, num_iterations=3):
    """Verify consistency by running multiple times"""
    results = []

    for i in range(num_iterations):
        result = verify_content(content_path)
        results.append(result)
        time.sleep(1)  # Small delay between attempts

    # Check consistency
    authentic_results = [r['authentic'] for r in results]
    confidence_scores = [r['confidence'] for r in results]

    consistency = len(set(authentic_results)) == 1  # All same authenticity

    print(f"Authenticity consistent: {consistency}")
    print(f"Confidence range: {min(confidence_scores):.3f} - {max(confidence_scores):.3f}")
    print(f"Average confidence: {sum(confidence_scores)/len(confidence_scores):.3f}")

    return {
        'results': results,
        'consistent': consistency,
        'average_confidence': sum(confidence_scores)/len(confidence_scores)
    }
```

### 2. Missing Data

**Symptoms**:
- Empty or null fields in responses
- Missing RUV profile data
- Incomplete verification results

**Solutions**:
```python
def validate_api_response(response_data):
    """Validate API response data"""
    required_fields = ['authentic', 'confidence', 'content_id']

    missing_fields = []
    for field in required_fields:
        if field not in response_data or response_data[field] is None:
            missing_fields.append(field)

    if missing_fields:
        raise ValueError(f"Missing required fields: {missing_fields}")

    # Validate RUV profile
    if 'ruv_profile' in response_data:
        ruv_profile = response_data['ruv_profile']
        ruv_fields = ['reputation', 'uniqueness', 'verification', 'fusion_score']

        for field in ruv_fields:
            if field not in ruv_profile or ruv_profile[field] is None:
                print(f"Warning: Missing RUV field: {field}")

    return True

# Usage
try:
    validate_api_response(api_response)
    print("Response validation passed")
except ValueError as e:
    print(f"Validation error: {e}")
```

## Logging and Debugging

### 1. Enable Detailed Logging

```python
import logging
import json

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('veritas_debug.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger('veritas_client')

def debug_api_call(url, headers, data):
    """Make API call with detailed logging"""
    logger.debug(f"API Request: {url}")
    logger.debug(f"Headers: {json.dumps(headers, indent=2)}")
    logger.debug(f"Data: {json.dumps(data, indent=2)}")

    try:
        response = requests.post(url, headers=headers, json=data)
        logger.debug(f"Response Status: {response.status_code}")
        logger.debug(f"Response Headers: {json.dumps(dict(response.headers), indent=2)}")
        logger.debug(f"Response Body: {response.text}")

        return response
    except Exception as e:
        logger.error(f"API call failed: {e}")
        raise
```

### 2. Health Checks

```python
def perform_health_check():
    """Perform comprehensive health check"""
    health_status = {
        'api_connectivity': False,
        'authentication': False,
        'content_processing': False,
        'database': False
    }

    try:
        # Check API connectivity
        response = requests.get(f"{VERITAS_API_URL}/health", timeout=10)
        health_status['api_connectivity'] = response.status_code == 200
        print("✓ API connectivity")
    except Exception as e:
        print(f"✗ API connectivity: {e}")

    try:
        # Check authentication
        token = generate_token()
        health_status['authentication'] = token is not None
        print("✓ Authentication")
    except Exception as e:
        print(f"✗ Authentication: {e}")

    # Add more health checks as needed

    return health_status

# Run health check
health_status = perform_health_check()
print(f"Overall health: {sum(health_status.values())}/{len(health_status)} checks passed")
```

## Environment-Specific Issues

### 1. Docker/Container Issues

**Symptoms**:
- Container won't start
- Network connectivity issues in containers
- Resource constraints

**Solutions**:
```bash
# Check container logs
docker logs veritas-ai-container

# Check container resources
docker stats veritas-ai-container

# Restart container with different settings
docker run -d \
  --name veritas-ai-container \
  --memory=2g \
  --cpus=1.0 \
  -e VERITAS_API_TOKEN=$VERITAS_API_TOKEN \
  veritas-ai/client:latest
```

### 2. Cloud Deployment Issues

**Symptoms**:
- Intermittent connectivity
- Regional availability issues
- Scaling problems

**Solutions**:
```python
def implement_fallback_endpoints():
    """Implement fallback endpoints for high availability"""
    primary_endpoint = "https://api.veritas-ai.com/v1"
    fallback_endpoints = [
        "https://api-us.veritas-ai.com/v1",
        "https://api-eu.veritas-ai.com/v1",
        "https://api-apac.veritas-ai.com/v1"
    ]

    endpoints = [primary_endpoint] + fallback_endpoints

    for endpoint in endpoints:
        try:
            response = test_endpoint(endpoint)
            if response.status_code == 200:
                print(f"Using endpoint: {endpoint}")
                return endpoint
        except Exception as e:
            print(f"Endpoint {endpoint} failed: {e}")
            continue

    raise Exception("All endpoints failed")

def test_endpoint(endpoint):
    """Test endpoint connectivity"""
    return requests.get(f"{endpoint}/health", timeout=5)
```

## Support and Further Assistance

If you continue to experience issues:

1. **Check System Status**: Visit [status.veritas-ai.com](https://status.veritas-ai.com)
2. **Review Documentation**: Ensure you're following the latest API documentation
3. **Enable Debug Logging**: Use detailed logging to capture error information
4. **Contact Support**: Reach out to support@veritas-ai.com with:
   - Error messages and codes
   - Request/response details (without sensitive data)
   - Environment information
   - Steps to reproduce the issue

This troubleshooting guide covers the most common issues and solutions when working with the Veritas AI platform. Always refer to the latest documentation for specific error codes and recommended practices.