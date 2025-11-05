# RUV Profiles Integration Guide

## Overview

RUV (Reputation, Uniqueness, Verification) profiles enhance the accuracy of content authenticity verification by incorporating contextual trust metrics. This guide explains how to integrate RUV profiles into your applications.

## RUV Profile Components

### Reputation
Measures the credibility of content sources based on historical accuracy and user feedback.
- Range: 0.0 (unreliable) to 1.0 (highly reliable)
- Updated based on verification outcomes and user reports

### Uniqueness
Tracks content originality by comparing against previously verified content.
- Range: 0.0 (duplicate) to 1.0 (completely unique)
- Calculated using content hashing and similarity algorithms

### Verification
Historical verification success rate for content from the same source.
- Range: 0.0 (consistently fails) to 1.0 (consistently passes)
- Updated with each verification result

### Fusion Score
Combined trust score calculated from the three RUV metrics.
- Range: 0.0 (low trust) to 1.0 (high trust)
- Used to enhance algorithmic verification confidence

## Integration Patterns

### Basic Integration
1. Submit content for verification using the `/verify` endpoint
2. Receive verification result with integrated RUV profile
3. Use the `fusedConfidence` score for decision making

```javascript
// Example: Basic verification with RUV integration
const response = await fetch('https://api.veritas-ai.com/v1/verify', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: base64Content,
    content_type: 'image'
  })
});

const result = await response.json();
console.log(`Authentic: ${result.authentic}`);
console.log(`Confidence: ${result.confidence}`);
console.log(`Fused Confidence: ${result.fusedConfidence}`);

// RUV profile details
if (result.ruv_profile) {
  console.log(`Reputation: ${result.ruv_profile.reputation}`);
  console.log(`Uniqueness: ${result.ruv_profile.uniqueness}`);
  console.log(`Verification History: ${result.ruv_profile.verification}`);
}
```

### Advanced Integration
1. Create custom RUV profiles using domain-specific metrics
2. Update profiles based on user feedback and verification outcomes
3. Implement custom fusion logic for specialized use cases

```javascript
// Example: Creating a custom RUV profile
const profileResponse = await fetch('https://api.veritas-ai.com/v1/profiles', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content_id: 'user_provided_id',
    ruv_data: {
      reputation: 0.9,    // High reputation source
      uniqueness: 0.7,    // Moderately unique content
      verification: 0.85  // Good historical verification rate
    }
  })
});
```

## Best Practices

### Profile Management
1. **Regular Updates**: Update RUV profiles after each verification
2. **Historical Tracking**: Maintain verification history for trend analysis
3. **Source Categorization**: Group content by source for better reputation tracking

### Confidence Interpretation
1. **High Confidence (0.9-1.0)**: Very likely authentic
2. **Medium Confidence (0.7-0.9)**: Likely authentic with some concerns
3. **Low Confidence (0.5-0.7)**: Uncertain, requires manual review
4. **Very Low Confidence (<0.5)**: Likely manipulated or inauthentic

### Custom Fusion Logic
Implement weighted scoring based on your specific requirements:

```javascript
function calculateCustomFusedScore(verificationConfidence, ruvProfile) {
  // Custom weights based on use case
  const weights = {
    algorithmic: 0.6,  // Weight for algorithmic verification
    reputation: 0.2,   // Weight for source reputation
    uniqueness: 0.1,   // Weight for content uniqueness
    history: 0.1       // Weight for verification history
  };

  return (
    (verificationConfidence * weights.algorithmic) +
    (ruvProfile.reputation * weights.reputation) +
    (ruvProfile.uniqueness * weights.uniqueness) +
    (ruvProfile.verification * weights.history)
  );
}
```

## Error Handling

### Profile Not Found
When no RUV profile exists for content, the system uses default values:
- Reputation: 0.5 (neutral)
- Uniqueness: 0.5 (neutral)
- Verification: 0.5 (neutral)

### Profile Update Failures
Implement retry logic for profile updates:
```javascript
async function updateRUVProfileWithRetry(contentId, ruvData, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`https://api.veritas-ai.com/v1/profiles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content_id: contentId, ruv_data: ruvData })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

## Performance Considerations

### Caching
Cache RUV profiles to reduce API calls:
```javascript
const profileCache = new Map();

async function getRUVProfile(contentId) {
  if (profileCache.has(contentId)) {
    const cached = profileCache.get(contentId);
    // Check if cache is still valid (e.g., less than 1 hour old)
    if (Date.now() - cached.timestamp < 3600000) {
      return cached.profile;
    }
  }

  const response = await fetch(`https://api.veritas-ai.com/v1/profiles/${contentId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (response.ok) {
    const profile = await response.json();
    profileCache.set(contentId, {
      profile,
      timestamp: Date.now()
    });
    return profile;
  }

  return null;
}
```

### Batch Processing
Use batch endpoints for multiple content items:
```javascript
async function batchVerifyContent(contentItems) {
  const response = await fetch('https://api.veritas-ai.com/v1/batch/verify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ contents: contentItems })
  });

  return await response.json();
}
```

## Security Considerations

### Profile Integrity
1. **Access Control**: Restrict profile modification to authorized users
2. **Audit Logging**: Log all profile modifications for security review
3. **Data Validation**: Validate all RUV data before profile updates

### Privacy
1. **Data Minimization**: Only store necessary RUV metrics
2. **Anonymization**: Remove personally identifiable information from profiles
3. **Retention Policies**: Implement automated profile cleanup

## Troubleshooting

### Common Issues

1. **Profile Not Updating**
   - Check API response codes
   - Verify authentication token validity
   - Ensure required fields are provided

2. **Low Confidence Scores**
   - Review content quality before submission
   - Check RUV profile metrics for anomalies
   - Consider manual verification for edge cases

3. **API Rate Limiting**
   - Implement exponential backoff for retries
   - Use batch processing for multiple items
   - Monitor usage quotas

### Support
For integration issues, contact support@veritas-ai.com with:
- API request/response details
- Error messages
- Implementation code snippets