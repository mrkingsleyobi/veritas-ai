# Caching System

The VeritasAI platform uses Redis for caching to improve performance and reduce database load.

## Architecture

The caching system consists of three main components:

1. **Redis Client** (`src/cache/redis_client.py`) - Low-level Redis connection and operations
2. **Cache Service** (`src/cache/cache_service.py`) - High-level caching operations with JSON serialization
3. **Middleware** (`src/cache/middleware.py`) - FastAPI middleware for automatic response caching

## Configuration

The Redis configuration is set through environment variables:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
```

## Usage

### Basic Cache Operations

```python
from src.cache.cache_service import cache_set, cache_get, cache_delete

# Set a value in cache
cache_set("key", {"data": "value"}, expire=3600)  # Expire in 1 hour

# Get a value from cache
value = cache_get("key")

# Delete a value from cache
cache_delete("key")
```

### User Session Caching

```python
from src.cache.cache_service import cache_user_session, get_user_session

# Cache user session
session_data = {"user_id": 123, "role": "admin"}
cache_user_session(123, session_data, expire=1800)  # Expire in 30 minutes

# Get user session
session = get_user_session(123)

# Invalidate user session
invalidate_user_session(123)
```

### Content Metadata Caching

```python
from src.cache.cache_service import cache_content_metadata, get_content_metadata

# Cache content metadata
metadata = {"title": "Test Content", "type": "image"}
cache_content_metadata(456, metadata, expire=7200)  # Expire in 2 hours

# Get content metadata
metadata = get_content_metadata(456)

# Invalidate content metadata
invalidate_content_metadata(456)
```

## Health Check

The `/health` endpoint includes cache status in its response:

```json
{
  "status": "healthy",
  "services": {
    "database": "healthy",
    "cache": "healthy"
  }
}
```

## Cache Middleware

The cache middleware automatically caches GET requests for 1 hour. It adds an `X-Cache` header to indicate cache hits or misses:

- `X-Cache: HIT` - Response served from cache
- `X-Cache: MISS` - Response generated dynamically