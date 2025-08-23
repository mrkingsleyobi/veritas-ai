# Third-Party Verification Services

VeritasAI integrates with external fact-checking and verification services to provide comprehensive content verification capabilities.

## Supported Services

1. **Snopes** - Fact-checking service for urban legends, myths, and misinformation
2. **FactCheck.org** - Non-partisan fact-checking organization
3. **PolitiFact** - Fact-checking service focused on political claims

## Configuration

To enable third-party verification services, you need to set the corresponding API keys in your environment variables:

```bash
SNOPES_API_KEY=your_snopes_api_key
FACTCHECK_ORG_API_KEY=your_factcheck_org_api_key
POLITIFACT_API_KEY=your_politifact_api_key
```

## API Endpoints

### Verify Claim

Verify a text claim using third-party fact-checking services.

```http
POST /api/v1/ai/verify-claim
```

**Parameters:**
- `claim` (string, required): The claim to verify
- `language` (string, optional, default: "en"): Language code for the claim

**Response:**
```json
{
  "claim": "The claim text",
  "verification_result": {
    "claim": "The claim text",
    "results": {
      "snopes": {
        "verified": true,
        "rating": "mostly_true",
        "confidence": 0.85,
        "explanation": "Explanation from the fact-checker",
        "source_url": "https://www.snopes.com/fact-check-url",
        "fact_checkers": ["John Doe", "Jane Smith"],
        "last_updated": "2023-01-01T00:00:00Z"
      }
    },
    "timestamp": "2023-01-01T00:00:00Z"
  }
}
```

### Third-Party Service Status

Get the status of all third-party verification services.

```http
GET /api/v1/ai/third-party-status
```

**Response:**
```json
{
  "services": {
    "snopes": {
      "enabled": true,
      "configured": true,
      "base_url": "https://api.snopes.com/v1"
    },
    "factcheck_org": {
      "enabled": true,
      "configured": true,
      "base_url": "https://api.factcheck.org/v1"
    },
    "politifact": {
      "enabled": false,
      "configured": false,
      "base_url": "https://api.politifact.org/v1"
    }
  }
}
```

## Dashboard Integration

The dashboard includes statistics for third-party verification results:

### User Analytics
The analytics endpoint now includes a `third_party_verified` count showing how many content items have been verified using third-party services.

### Third-Party Verification Statistics
A new endpoint provides detailed statistics on third-party verification results:

```http
GET /api/v1/dashboard/third-party-stats
```

## Service Implementation

The third-party verification service is implemented in `src/ai/third_party/service.py` and provides:

1. **Service Configuration**: Automatic configuration based on environment variables
2. **Error Handling**: Graceful handling of API errors and timeouts
3. **Result Aggregation**: Combines results from multiple services
4. **Status Monitoring**: Provides service status information

## Extending Services

To add support for additional third-party services:

1. Add the service configuration to the `services` dictionary in `ThirdPartyVerificationService.__init__()`
2. Implement a `_verify_with_{service_name}()` method
3. Add the service to the `_verify_with_service()` method dispatcher
4. Update the environment variable documentation

## Security Considerations

- API keys are stored as environment variables and never hardcoded
- All external API calls are made over HTTPS
- Rate limiting should be implemented at the service level
- Error responses never expose sensitive information