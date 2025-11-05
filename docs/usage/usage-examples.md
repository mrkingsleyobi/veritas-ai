# Usage Examples and Best Practices

## Basic Usage Examples

### 1. Simple Content Verification

```javascript
// JavaScript example for image verification
async function verifyImage(imageBuffer) {
  try {
    const response = await fetch('https://api.veritas-ai.com/v1/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: imageBuffer.toString('base64'),
        content_type: 'image',
        filename: 'suspicious_image.jpg'
      })
    });

    const result = await response.json();

    if (result.authentic) {
      console.log(`Image is authentic (confidence: ${result.confidence})`);
    } else {
      console.log(`Image may be manipulated (confidence: ${result.confidence})`);
    }

    return result;
  } catch (error) {
    console.error('Verification failed:', error);
    throw error;
  }
}
```

```python
# Python example for document verification
import requests
import base64

def verify_document(file_path):
    with open(file_path, 'rb') as f:
        content = base64.b64encode(f.read()).decode('utf-8')

    headers = {
        'Authorization': f'Bearer {os.environ["API_TOKEN"]}',
        'Content-Type': 'application/json'
    }

    data = {
        'content': content,
        'content_type': 'document',
        'filename': os.path.basename(file_path)
    }

    response = requests.post(
        'https://api.veritas-ai.com/v1/verify',
        headers=headers,
        json=data
    )

    result = response.json()

    if result['authentic']:
        print(f"Document is authentic (confidence: {result['confidence']})")
    else:
        print(f"Document may be tampered (confidence: {result['confidence']})")

    return result
```

### 2. Batch Processing

```javascript
// JavaScript example for batch verification
async function batchVerifyContent(contentItems) {
  try {
    const response = await fetch('https://api.veritas-ai.com/v1/batch/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: contentItems.map(item => ({
          id: item.id,
          content: item.buffer.toString('base64'),
          content_type: item.type,
          filename: item.filename
        }))
      })
    });

    const result = await response.json();

    // Process results
    result.results.forEach(verification => {
      if (verification.error) {
        console.error(`Verification failed for ${verification.content_id}: ${verification.error}`);
      } else {
        console.log(`${verification.content_id}: ${verification.authentic ? 'Authentic' : 'Suspicious'} (${verification.confidence})`);
      }
    });

    return result;
  } catch (error) {
    console.error('Batch verification failed:', error);
    throw error;
  }
}
```

## Advanced Usage Patterns

### 1. Integrating with Content Management Systems

```javascript
// Example integration with a CMS
class ContentVerificationCMS {
  constructor(apiToken) {
    this.apiToken = apiToken;
    this.baseUrl = 'https://api.veritas-ai.com/v1';
  }

  async verifyAndStoreContent(contentData) {
    // Step 1: Verify content authenticity
    const verification = await this.verifyContent(contentData);

    // Step 2: Update RUV profile based on verification
    if (verification.authentic) {
      await this.updateRUVProfile(contentData.id, {
        reputation: Math.min(1.0, (verification.ruv_profile?.reputation || 0.5) + 0.1),
        uniqueness: verification.ruv_profile?.uniqueness || 0.5,
        verification: Math.min(1.0, (verification.ruv_profile?.verification || 0.5) + 0.1)
      });
    }

    // Step 3: Store verification result
    await this.storeVerificationResult(contentData.id, verification);

    return verification;
  }

  async verifyContent(contentData) {
    const response = await fetch(`${this.baseUrl}/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: contentData.buffer.toString('base64'),
        content_type: contentData.type,
        filename: contentData.filename,
        metadata: contentData.metadata
      })
    });

    return await response.json();
  }

  async updateRUVProfile(contentId, ruvData) {
    const response = await fetch(`${this.baseUrl}/profiles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content_id: contentId,
        ruv_data: ruvData
      })
    });

    return await response.json();
  }
}
```

### 2. Real-time Verification with WebSockets

```javascript
// Example real-time verification system
class RealTimeVerifier {
  constructor(apiToken) {
    this.apiToken = apiToken;
    this.socket = null;
    this.verificationQueue = [];
  }

  connect() {
    this.socket = new WebSocket('wss://api.veritas-ai.com/v1/ws');

    this.socket.onopen = () => {
      console.log('Connected to real-time verification service');
      this.authenticate();
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
  }

  authenticate() {
    this.socket.send(JSON.stringify({
      type: 'authenticate',
      token: this.apiToken
    }));
  }

  async submitForVerification(contentData) {
    return new Promise((resolve, reject) => {
      const verificationId = this.generateId();

      this.verificationQueue[verificationId] = { resolve, reject };

      this.socket.send(JSON.stringify({
        type: 'verify',
        id: verificationId,
        content: contentData.buffer.toString('base64'),
        content_type: contentData.type
      }));
    });
  }

  handleMessage(message) {
    if (message.type === 'verification_result' && this.verificationQueue[message.id]) {
      const { resolve, reject } = this.verificationQueue[message.id];
      delete this.verificationQueue[message.id];

      if (message.error) {
        reject(new Error(message.error));
      } else {
        resolve(message.result);
      }
    }
  }
}
```

## Industry-Specific Examples

### 1. News Media Verification

```javascript
// Example for news media content verification
class NewsMediaVerifier {
  constructor(apiToken) {
    this.apiToken = apiToken;
    this.knownSources = new Map();
  }

  async verifyNewsContent(imageBuffer, sourceInfo) {
    // Step 1: Basic verification
    const basicVerification = await this.basicVerify(imageBuffer);

    // Step 2: Source reputation check
    const sourceProfile = await this.getSourceProfile(sourceInfo.sourceId);

    // Step 3: Contextual analysis
    const contextualScore = this.calculateContextualScore(
      basicVerification.confidence,
      sourceProfile.reputation,
      sourceProfile.history
    );

    // Step 4: Final determination
    const isCredible = contextualScore > 0.85;

    return {
      ...basicVerification,
      contextualScore,
      isCredible,
      sourceReputation: sourceProfile.reputation
    };
  }

  calculateContextualScore(algorithmicConfidence, sourceReputation, verificationHistory) {
    // Weighted scoring based on news media requirements
    return (
      (algorithmicConfidence * 0.6) +
      (sourceReputation * 0.3) +
      (verificationHistory.authenticRate * 0.1)
    );
  }
}
```

### 2. E-commerce Product Image Verification

```javascript
// Example for e-commerce platform
class EcommerceVerifier {
  constructor(apiToken) {
    this.apiToken = apiToken;
  }

  async verifyProductImage(imageBuffer, productId, sellerId) {
    // Step 1: Verify image authenticity
    const verification = await this.verifyImage(imageBuffer);

    // Step 2: Check against product database
    const duplicateCheck = await this.checkForDuplicates(imageBuffer, productId);

    // Step 3: Update seller RUV profile
    await this.updateSellerProfile(sellerId, verification.authentic, duplicateCheck.isDuplicate);

    // Step 4: Return comprehensive result
    return {
      productId,
      sellerId,
      authentic: verification.authentic && !duplicateCheck.isDuplicate,
      confidence: verification.confidence,
      isDuplicate: duplicateCheck.isDuplicate,
      duplicateOf: duplicateCheck.duplicateOf,
      verificationDetails: verification.details
    };
  }

  async updateSellerProfile(sellerId, isAuthentic, isDuplicate) {
    const currentProfile = await this.getSellerProfile(sellerId);

    const updates = {
      reputation: isAuthentic ?
        Math.min(1.0, currentProfile.reputation + 0.01) :
        Math.max(0.0, currentProfile.reputation - 0.05),
      uniqueness: isDuplicate ?
        Math.max(0.0, currentProfile.uniqueness - 0.1) :
        currentProfile.uniqueness
    };

    return await this.updateRUVProfile(`seller_${sellerId}`, updates);
  }
}
```

## Best Practices

### 1. Performance Optimization

```javascript
// Example: Efficient batch processing
class EfficientBatchProcessor {
  constructor(batchSize = 10) {
    this.batchSize = batchSize;
    this.processingQueue = [];
  }

  async addToQueue(contentItem) {
    this.processingQueue.push(contentItem);

    if (this.processingQueue.length >= this.batchSize) {
      return await this.processBatch();
    }

    // Process remaining items after a delay
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => {
        this.processBatch();
        this.batchTimeout = null;
      }, 5000); // 5 second delay
    }
  }

  async processBatch() {
    if (this.processingQueue.length === 0) return [];

    const batch = this.processingQueue.splice(0, this.batchSize);

    try {
      const response = await fetch('https://api.veritas-ai.com/v1/batch/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: batch
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Batch processing failed:', error);
      // Re-queue failed items
      this.processingQueue.unshift(...batch);
      throw error;
    }
  }
}
```

### 2. Error Handling and Retry Logic

```javascript
// Example: Robust error handling
class RobustVerifier {
  constructor(apiToken, maxRetries = 3) {
    this.apiToken = apiToken;
    this.maxRetries = maxRetries;
  }

  async verifyWithRetry(contentData, retryCount = 0) {
    try {
      const response = await fetch('https://api.veritas-ai.com/v1/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (retryCount < this.maxRetries) {
        console.warn(`Verification attempt ${retryCount + 1} failed, retrying...`);
        await this.delay(Math.pow(2, retryCount) * 1000); // Exponential backoff
        return await this.verifyWithRetry(contentData, retryCount + 1);
      } else {
        console.error('Verification failed after all retries:', error);
        throw error;
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 3. Caching Strategy

```javascript
// Example: Caching verification results
class CachedVerifier {
  constructor(apiToken, cacheTTL = 3600000) { // 1 hour default
    this.apiToken = apiToken;
    this.cache = new Map();
    this.cacheTTL = cacheTTL;
  }

  async verifyContent(contentData) {
    const cacheKey = this.generateCacheKey(contentData);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTTL) {
        console.log('Returning cached result');
        return cached.result;
      } else {
        // Remove expired cache entry
        this.cache.delete(cacheKey);
      }
    }

    // Perform verification
    const result = await this.performVerification(contentData);

    // Cache the result
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });

    return result;
  }

  generateCacheKey(contentData) {
    // Create a hash of the content for cache key
    const contentHash = require('crypto')
      .createHash('md5')
      .update(contentData.content)
      .digest('hex');

    return `${contentData.content_type}_${contentHash}`;
  }
}
```

## Security Best Practices

### 1. Secure Content Handling

```javascript
// Example: Secure content processing
class SecureVerifier {
  constructor(apiToken) {
    this.apiToken = apiToken;
    this.maxContentSize = 50 * 1024 * 1024; // 50MB limit
  }

  async verifyContentSecurely(fileBuffer, contentType) {
    // Validate content size
    if (fileBuffer.length > this.maxContentSize) {
      throw new Error('Content exceeds maximum size limit');
    }

    // Validate content type
    if (!['image', 'video', 'document'].includes(contentType)) {
      throw new Error('Unsupported content type');
    }

    // Sanitize content (example for images)
    const sanitizedBuffer = await this.sanitizeContent(fileBuffer, contentType);

    // Perform verification
    return await this.performVerification({
      content: sanitizedBuffer.toString('base64'),
      content_type: contentType
    });
  }

  async sanitizeContent(buffer, contentType) {
    // Implement content sanitization based on type
    switch (contentType) {
      case 'image':
        return await this.sanitizeImage(buffer);
      case 'document':
        return await this.sanitizeDocument(buffer);
      default:
        return buffer;
    }
  }
}
```

## Monitoring and Analytics

### 1. Usage Tracking

```javascript
// Example: Usage analytics
class AnalyticsTracker {
  constructor() {
    this.metrics = {
      totalVerifications: 0,
      successfulVerifications: 0,
      failedVerifications: 0,
      averageConfidence: 0,
      verificationTypes: {
        image: 0,
        video: 0,
        document: 0
      }
    };
  }

  trackVerification(verificationResult, contentType) {
    this.metrics.totalVerifications++;

    if (verificationResult.authentic) {
      this.metrics.successfulVerifications++;
    } else {
      this.metrics.failedVerifications++;
    }

    this.metrics.verificationTypes[contentType]++;

    // Update average confidence
    const totalConfidence = this.metrics.averageConfidence * (this.metrics.totalVerifications - 1) +
                           verificationResult.confidence;
    this.metrics.averageConfidence = totalConfidence / this.metrics.totalVerifications;
  }

  getReport() {
    return {
      ...this.metrics,
      successRate: this.metrics.successfulVerifications / this.metrics.totalVerifications,
      failureRate: this.metrics.failedVerifications / this.metrics.totalVerifications
    };
  }
}
```

These examples demonstrate various ways to integrate the Content Authenticity and Deepfake Detection API into different applications and workflows. Remember to adapt these patterns to your specific use case and requirements.