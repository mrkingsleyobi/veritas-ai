"""
Cache middleware for VeritasAI.
"""
from fastapi import Request, Response
from functools import wraps
from typing import Callable, Any
from .cache_service import cache_get, cache_set
import hashlib
import json


def cache_response(expire: int = 3600):
    """
    Middleware to cache API responses.
    
    Args:
        expire: Cache expiration time in seconds (default 1 hour)
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            # Generate cache key from function name and arguments
            cache_key = f"{func.__name__}:{hashlib.sha256(str(kwargs).encode()).hexdigest()}"
            
            # Try to get cached response
            cached_response = cache_get(cache_key)
            if cached_response is not None:
                return cached_response
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            cache_set(cache_key, result, expire)
            return result
        
        return wrapper
    return decorator


class CacheMiddleware:
    """Cache middleware class for FastAPI."""
    
    def __init__(self):
        self.cache_prefix = "api_response"
    
    async def __call__(self, request: Request, call_next):
        # Generate cache key from request
        cache_key = f"{self.cache_prefix}:{request.method}:{request.url.path}"
        if request.query_params:
            cache_key += f":{hashlib.sha256(str(request.query_params).encode()).hexdigest()}"
        
        # Try to get cached response for GET requests
        if request.method == "GET":
            cached_response = cache_get(cache_key)
            if cached_response is not None:
                return Response(
                    content=json.dumps(cached_response),
                    media_type="application/json",
                    headers={"X-Cache": "HIT"}
                )
        
        # Process request
        response = await call_next(request)
        
        # Cache response for GET requests
        if request.method == "GET" and response.status_code == 200:
            # Extract response content
            response_body = [chunk async for chunk in response.body_iterator]
            response.body_iterator = iter(response_body)
            
            # Cache the response
            try:
                import json
                content = b"".join(response_body).decode()
                cache_set(cache_key, json.loads(content), 3600)  # Cache for 1 hour
            except:
                pass  # Ignore cache errors
        
        # Add cache header
        response.headers["X-Cache"] = "MISS"
        return response