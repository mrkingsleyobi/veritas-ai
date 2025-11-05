# Python Integration Examples

This guide provides comprehensive Python examples for integrating with the Veritas AI Content Authenticity and Deepfake Detection API.

## Prerequisites

- Python 3.7 or higher
- pip package manager
- requests library
- Optional: aiohttp for async operations

## Installation

```bash
# Install required packages
pip install requests aiohttp python-dotenv

# For advanced features
pip install pillow opencv-python numpy
```

## Basic Authentication

### Token Generation

```python
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class VeritasAuth:
    def __init__(self, base_url, username, password):
        self.base_url = base_url
        self.username = username
        self.password = password
        self.token = None

    def generate_token(self):
        """Generate authentication token"""
        url = f"{self.base_url}/auth/token"

        payload = {
            "username": self.username,
            "password": self.password
        }

        headers = {
            "Content-Type": "application/json"
        }

        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()

            data = response.json()
            self.token = data.get("token")
            return self.token
        except requests.exceptions.RequestException as e:
            print(f"Authentication failed: {e}")
            return None

# Usage
auth = VeritasAuth(
    base_url="https://api.veritas-ai.com/v1",
    username=os.getenv("VERITAS_USERNAME"),
    password=os.getenv("VERITAS_PASSWORD")
)

token = auth.generate_token()
if token:
    print("Authentication successful!")
```

## Content Verification

### Image Verification

```python
import base64
import requests
from pathlib import Path

class ContentVerifier:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

    def verify_image(self, image_path, filename=None):
        """Verify image authenticity"""
        try:
            # Read and encode image
            with open(image_path, "rb") as image_file:
                encoded_image = base64.b64encode(image_file.read()).decode('utf-8')

            # Prepare payload
            payload = {
                "content": encoded_image,
                "content_type": "image",
                "filename": filename or Path(image_path).name,
                "metadata": {
                    "source": "python_client",
                    "timestamp": str(int(time.time()))
                }
            }

            # Send verification request
            url = f"{self.base_url}/verify"
            response = requests.post(url, json=payload, headers=self.headers)
            response.raise_for_status()

            return response.json()
        except Exception as e:
            print(f"Verification failed: {e}")
            return None

# Usage
verifier = ContentVerifier(
    base_url="https://api.veritas-ai.com/v1",
    token=token
)

result = verifier.verify_image("path/to/suspicious_image.jpg")
if result:
    print(f"Authentic: {result['authentic']}")
    print(f"Confidence: {result['confidence']:.2f}")
    print(f"RUV Score: {result['ruv_profile']['fusion_score']:.2f}")
```

### Video Verification

```python
import base64
import requests
import time

class VideoVerifier:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

    def verify_video(self, video_path, filename=None):
        """Verify video authenticity"""
        try:
            # Read and encode video
            with open(video_path, "rb") as video_file:
                encoded_video = base64.b64encode(video_file.read()).decode('utf-8')

            # Prepare payload
            payload = {
                "content": encoded_video,
                "content_type": "video",
                "filename": filename or Path(video_path).name,
                "metadata": {
                    "source": "python_client",
                    "timestamp": str(int(time.time())),
                    "file_size": len(encoded_video)
                }
            }

            # Send verification request
            url = f"{self.base_url}/verify"
            response = requests.post(url, json=payload, headers=self.headers)
            response.raise_for_status()

            return response.json()
        except Exception as e:
            print(f"Video verification failed: {e}")
            return None

# Usage
video_verifier = VideoVerifier(
    base_url="https://api.veritas-ai.com/v1",
    token=token
)

video_result = video_verifier.verify_video("path/to/suspicious_video.mp4")
if video_result:
    print(f"Video Authentic: {video_result['authentic']}")
    print(f"Confidence: {video_result['confidence']:.2f}")
```

### Document Verification

```python
import base64
import requests
from pathlib import Path

class DocumentVerifier:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

    def verify_document(self, document_path, filename=None):
        """Verify document authenticity"""
        try:
            # Read and encode document
            with open(document_path, "rb") as doc_file:
                encoded_doc = base64.b64encode(doc_file.read()).decode('utf-8')

            # Prepare payload
            payload = {
                "content": encoded_doc,
                "content_type": "document",
                "filename": filename or Path(document_path).name,
                "metadata": {
                    "source": "python_client",
                    "document_type": self._get_document_type(document_path),
                    "timestamp": str(int(time.time()))
                }
            }

            # Send verification request
            url = f"{self.base_url}/verify"
            response = requests.post(url, json=payload, headers=self.headers)
            response.raise_for_status()

            return response.json()
        except Exception as e:
            print(f"Document verification failed: {e}")
            return None

    def _get_document_type(self, file_path):
        """Determine document type from file extension"""
        extension = Path(file_path).suffix.lower()
        doc_types = {
            '.pdf': 'pdf',
            '.doc': 'word',
            '.docx': 'word',
            '.xls': 'excel',
            '.xlsx': 'excel',
            '.ppt': 'powerpoint',
            '.pptx': 'powerpoint'
        }
        return doc_types.get(extension, 'unknown')

# Usage
doc_verifier = DocumentVerifier(
    base_url="https://api.veritas-ai.com/v1",
    token=token
)

doc_result = doc_verifier.verify_document("path/to/suspicious_document.pdf")
if doc_result:
    print(f"Document Authentic: {doc_result['authentic']}")
    print(f"Confidence: {doc_result['confidence']:.2f}")
```

## Batch Processing

### Batch Content Verification

```python
import base64
import requests
from pathlib import Path

class BatchVerifier:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

    def batch_verify(self, content_items):
        """Verify multiple content items in batch"""
        try:
            # Prepare batch payload
            contents = []
            for i, item in enumerate(content_items):
                with open(item['path'], "rb") as file:
                    encoded_content = base64.b64encode(file.read()).decode('utf-8')

                contents.append({
                    "id": f"item_{i}",
                    "content": encoded_content,
                    "content_type": item['type'],
                    "filename": item.get('filename', Path(item['path']).name),
                    "metadata": item.get('metadata', {})
                })

            payload = {
                "contents": contents
            }

            # Send batch verification request
            url = f"{self.base_url}/batch/verify"
            response = requests.post(url, json=payload, headers=self.headers)
            response.raise_for_status()

            return response.json()
        except Exception as e:
            print(f"Batch verification failed: {e}")
            return None

# Usage
batch_verifier = BatchVerifier(
    base_url="https://api.veritas-ai.com/v1",
    token=token
)

content_items = [
    {"path": "image1.jpg", "type": "image", "filename": "suspect1.jpg"},
    {"path": "video1.mp4", "type": "video", "filename": "suspect1.mp4"},
    {"path": "doc1.pdf", "type": "document", "filename": "suspect1.pdf"}
]

batch_result = batch_verifier.batch_verify(content_items)
if batch_result:
    for result in batch_result['results']:
        if 'error' in result:
            print(f"Error for {result['content_id']}: {result['error']}")
        else:
            print(f"{result['content_id']}: Authentic={result['authentic']}, Confidence={result['confidence']:.2f}")
```

## RUV Profile Management

### Create/Update RUV Profile

```python
import requests

class RUVProfileManager:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

    def create_or_update_profile(self, content_id, ruv_data):
        """Create or update RUV profile for content"""
        try:
            payload = {
                "content_id": content_id,
                "ruv_data": ruv_data
            }

            url = f"{self.base_url}/profiles"
            response = requests.post(url, json=payload, headers=self.headers)
            response.raise_for_status()

            return response.json()
        except Exception as e:
            print(f"Profile creation/update failed: {e}")
            return None

    def get_profile(self, content_id):
        """Retrieve RUV profile for content"""
        try:
            url = f"{self.base_url}/profiles/{content_id}"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()

            return response.json()
        except Exception as e:
            print(f"Profile retrieval failed: {e}")
            return None

# Usage
profile_manager = RUVProfileManager(
    base_url="https://api.veritas-ai.com/v1",
    token=token
)

# Create/update profile
ruv_data = {
    "reputation": 0.85,
    "uniqueness": 0.92,
    "verification": 0.95
}

profile_result = profile_manager.create_or_update_profile("content_12345", ruv_data)
if profile_result:
    print(f"Profile created/updated: {profile_result}")

# Retrieve profile
retrieved_profile = profile_manager.get_profile("content_12345")
if retrieved_profile:
    print(f"Retrieved profile: {retrieved_profile}")
```

## Analytics and Reporting

### Get Accuracy Metrics

```python
import requests
from datetime import datetime, timedelta

class AnalyticsClient:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

    def get_accuracy_metrics(self, start_date=None, end_date=None):
        """Get platform accuracy metrics"""
        try:
            params = {}
            if start_date:
                params['start_date'] = start_date.strftime('%Y-%m-%d')
            if end_date:
                params['end_date'] = end_date.strftime('%Y-%m-%d')

            url = f"{self.base_url}/analytics/accuracy"
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()

            return response.json()
        except Exception as e:
            print(f"Analytics retrieval failed: {e}")
            return None

# Usage
analytics = AnalyticsClient(
    base_url="https://api.veritas-ai.com/v1",
    token=token
)

# Get metrics for last 30 days
end_date = datetime.now()
start_date = end_date - timedelta(days=30)

metrics = analytics.get_accuracy_metrics(start_date, end_date)
if metrics:
    print(f"Precision: {metrics['precision']:.4f}")
    print(f"Recall: {metrics['recall']:.4f}")
    print(f"F1 Score: {metrics['f1_score']:.4f}")
    print(f"Accuracy: {metrics['accuracy']:.4f}")
    print(f"Total Verifications: {metrics['total_verifications']}")
```

## Advanced Features

### Async Processing with aiohttp

```python
import asyncio
import aiohttp
import base64
from pathlib import Path

class AsyncVerifier:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

    async def verify_content_async(self, session, content_path, content_type):
        """Asynchronously verify content"""
        try:
            # Read and encode content
            with open(content_path, "rb") as file:
                content_data = file.read()
                encoded_content = base64.b64encode(content_data).decode('utf-8')

            # Prepare payload
            payload = {
                "content": encoded_content,
                "content_type": content_type,
                "filename": Path(content_path).name
            }

            # Send verification request
            url = f"{self.base_url}/verify"
            async with session.post(url, json=payload, headers=self.headers) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    return {"error": f"HTTP {response.status}"}
        except Exception as e:
            return {"error": str(e)}

    async def batch_verify_async(self, content_items):
        """Batch verify content asynchronously"""
        async with aiohttp.ClientSession() as session:
            tasks = []
            for item in content_items:
                task = self.verify_content_async(
                    session,
                    item['path'],
                    item['type']
                )
                tasks.append(task)

            results = await asyncio.gather(*tasks)
            return results

# Usage
async def main():
    async_verifier = AsyncVerifier(
        base_url="https://api.veritas-ai.com/v1",
        token=token
    )

    content_items = [
        {"path": "image1.jpg", "type": "image"},
        {"path": "image2.jpg", "type": "image"},
        {"path": "video1.mp4", "type": "video"}
    ]

    results = await async_verifier.batch_verify_async(content_items)
    for i, result in enumerate(results):
        if 'error' in result:
            print(f"Item {i}: Error - {result['error']}")
        else:
            print(f"Item {i}: Authentic={result['authentic']}, Confidence={result['confidence']:.2f}")

# Run async verification
# asyncio.run(main())
```

### Content Processing Pipeline

```python
import os
import base64
import requests
from pathlib import Path
from typing import List, Dict, Optional

class ContentProcessingPipeline:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        self.verifier = ContentVerifier(base_url, token)
        self.profile_manager = RUVProfileManager(base_url, token)

    def process_content_directory(self, directory_path: str) -> List[Dict]:
        """Process all content files in a directory"""
        results = []

        for file_path in Path(directory_path).iterdir():
            if file_path.is_file():
                content_type = self._determine_content_type(file_path)
                if content_type:
                    print(f"Processing {file_path.name}...")
                    result = self.process_single_content(str(file_path), content_type)
                    results.append(result)

        return results

    def process_single_content(self, file_path: str, content_type: str) -> Dict:
        """Process a single content file through the full pipeline"""
        # Step 1: Verify content authenticity
        verification_result = self.verifier.verify_content(file_path, content_type)

        if not verification_result:
            return {"file": file_path, "status": "failed", "error": "Verification failed"}

        # Step 2: Update RUV profile based on verification
        content_id = verification_result.get('content_id', f"content_{int(time.time())}")

        if verification_result.get('authentic'):
            # Boost reputation for authentic content
            ruv_data = {
                "reputation": min(1.0, verification_result['ruv_profile'].get('reputation', 0.5) + 0.1),
                "uniqueness": verification_result['ruv_profile'].get('uniqueness', 0.5),
                "verification": min(1.0, verification_result['ruv_profile'].get('verification', 0.5) + 0.1)
            }
        else:
            # Reduce reputation for inauthentic content
            ruv_data = {
                "reputation": max(0.0, verification_result['ruv_profile'].get('reputation', 0.5) - 0.2),
                "uniqueness": verification_result['ruv_profile'].get('uniqueness', 0.5),
                "verification": max(0.0, verification_result['ruv_profile'].get('verification', 0.5) - 0.2)
            }

        # Step 3: Update profile
        profile_result = self.profile_manager.create_or_update_profile(content_id, ruv_data)

        return {
            "file": file_path,
            "content_id": content_id,
            "verification": verification_result,
            "profile_update": profile_result,
            "status": "completed"
        }

    def _determine_content_type(self, file_path: Path) -> Optional[str]:
        """Determine content type from file extension"""
        image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'}
        video_extensions = {'.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'}
        document_extensions = {'.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'}

        extension = file_path.suffix.lower()

        if extension in image_extensions:
            return "image"
        elif extension in video_extensions:
            return "video"
        elif extension in document_extensions:
            return "document"
        else:
            return None

# Usage
pipeline = ContentProcessingPipeline(
    base_url="https://api.veritas-ai.com/v1",
    token=token
)

# Process all content in a directory
results = pipeline.process_content_directory("path/to/content/directory")

for result in results:
    print(f"File: {result['file']}")
    if result['status'] == 'completed':
        print(f"  Authentic: {result['verification']['authentic']}")
        print(f"  Confidence: {result['verification']['confidence']:.2f}")
        print(f"  RUV Score: {result['verification']['ruv_profile']['fusion_score']:.2f}")
    else:
        print(f"  Error: {result.get('error', 'Unknown error')}")
    print()
```

## Error Handling and Retry Logic

```python
import time
import requests
from functools import wraps

def retry_on_failure(max_retries=3, delay=1, backoff=2):
    """Decorator for retrying failed operations"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            current_delay = delay

            while retries < max_retries:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    retries += 1
                    if retries >= max_retries:
                        raise e

                    print(f"Attempt {retries} failed: {e}. Retrying in {current_delay} seconds...")
                    time.sleep(current_delay)
                    current_delay *= backoff

            return None
        return wrapper
    return decorator

class RobustVerifier:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

    @retry_on_failure(max_retries=3, delay=1, backoff=2)
    def verify_with_retry(self, content_path, content_type):
        """Verify content with automatic retry on failure"""
        try:
            with open(content_path, "rb") as file:
                encoded_content = base64.b64encode(file.read()).decode('utf-8')

            payload = {
                "content": encoded_content,
                "content_type": content_type,
                "filename": Path(content_path).name
            }

            url = f"{self.base_url}/verify"
            response = requests.post(url, json=payload, headers=self.headers, timeout=30)
            response.raise_for_status()

            return response.json()
        except requests.exceptions.Timeout:
            raise Exception("Request timed out")
        except requests.exceptions.ConnectionError:
            raise Exception("Connection error")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:  # Rate limited
                raise Exception("Rate limited - wait before retrying")
            else:
                raise Exception(f"HTTP error: {e}")
        except Exception as e:
            raise Exception(f"Verification failed: {e}")

# Usage
robust_verifier = RobustVerifier(
    base_url="https://api.veritas-ai.com/v1",
    token=token
)

try:
    result = robust_verifier.verify_with_retry("suspicious_image.jpg", "image")
    if result:
        print(f"Verification successful: {result['authentic']}")
except Exception as e:
    print(f"Verification failed after retries: {e}")
```

## Configuration and Environment Management

```python
import os
from dotenv import load_dotenv
from dataclasses import dataclass

@dataclass
class VeritasConfig:
    """Configuration class for Veritas AI API"""
    base_url: str
    username: str
    password: str
    max_retries: int = 3
    timeout: int = 30
    batch_size: int = 10

    @classmethod
    def from_env(cls):
        """Create configuration from environment variables"""
        load_dotenv()

        return cls(
            base_url=os.getenv("VERITAS_BASE_URL", "https://api.veritas-ai.com/v1"),
            username=os.getenv("VERITAS_USERNAME"),
            password=os.getenv("VERITAS_PASSWORD"),
            max_retries=int(os.getenv("VERITAS_MAX_RETRIES", "3")),
            timeout=int(os.getenv("VERITAS_TIMEOUT", "30")),
            batch_size=int(os.getenv("VERITAS_BATCH_SIZE", "10"))
        )

    def validate(self):
        """Validate configuration"""
        if not self.username or not self.password:
            raise ValueError("Username and password are required")

        if not self.base_url:
            raise ValueError("Base URL is required")

# Usage
try:
    config = VeritasConfig.from_env()
    config.validate()
    print("Configuration loaded successfully")
except ValueError as e:
    print(f"Configuration error: {e}")
```

This Python integration guide provides comprehensive examples for working with the Veritas AI Content Authenticity and Deepfake Detection API, covering authentication, content verification, batch processing, RUV profile management, analytics, and advanced features.