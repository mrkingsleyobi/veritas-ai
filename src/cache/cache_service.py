"""
Cache service for VeritasAI with higher-level caching operations.
"""
import json
from typing import Any, Optional
from .redis_client import set_cache, get_cache, delete_cache


def cache_set(key: str, value: Any, expire: int = 3600) -> bool:
    """
    Set a value in cache with JSON serialization.
    
    Args:
        key: Cache key
        value: Value to cache (will be JSON serialized)
        expire: Expiration time in seconds (default 1 hour)
    
    Returns:
        bool: True if successful, False otherwise (including when Redis is unavailable)
    """
    try:
        serialized_value = json.dumps(value)
        result = set_cache(key, serialized_value, expire)
        return result if result is not False else False
    except Exception as e:
        print(f"Error serializing value for cache: {e}")
        return False


def cache_get(key: str) -> Optional[Any]:
    """
    Get a value from cache with JSON deserialization.
    
    Args:
        key: Cache key
    
    Returns:
        Deserialized value or None if not found/error
    """
    try:
        cached_value = get_cache(key)
        if cached_value is not None:
            return json.loads(cached_value)
        return None
    except Exception as e:
        print(f"Error deserializing value from cache: {e}")
        return None


def cache_delete(key: str) -> int:
    """
    Delete a value from cache.
    
    Args:
        key: Cache key
    
    Returns:
        int: Number of keys deleted (0 or 1)
    """
    try:
        return delete_cache(key)
    except Exception as e:
        print(f"Error deleting cache: {e}")
        return 0


def cache_user_session(user_id: int, session_data: dict, expire: int = 1800) -> bool:
    """
    Cache user session data.
    
    Args:
        user_id: User ID
        session_data: Session data to cache
        expire: Expiration time in seconds (default 30 minutes)
    
    Returns:
        bool: True if successful, False otherwise
    """
    key = f"user_session:{user_id}"
    return cache_set(key, session_data, expire)


def get_user_session(user_id: int) -> Optional[dict]:
    """
    Get user session data from cache.
    
    Args:
        user_id: User ID
    
    Returns:
        dict: Session data or None if not found
    """
    key = f"user_session:{user_id}"
    return cache_get(key)


def invalidate_user_session(user_id: int) -> int:
    """
    Invalidate user session in cache.
    
    Args:
        user_id: User ID
    
    Returns:
        int: Number of keys deleted (0 or 1)
    """
    key = f"user_session:{user_id}"
    return cache_delete(key)


def cache_content_metadata(content_id: int, metadata: dict, expire: int = 7200) -> bool:
    """
    Cache content metadata.
    
    Args:
        content_id: Content ID
        metadata: Metadata to cache
        expire: Expiration time in seconds (default 2 hours)
    
    Returns:
        bool: True if successful, False otherwise
    """
    key = f"content_metadata:{content_id}"
    return cache_set(key, metadata, expire)


def get_content_metadata(content_id: int) -> Optional[dict]:
    """
    Get content metadata from cache.
    
    Args:
        content_id: Content ID
    
    Returns:
        dict: Metadata or None if not found
    """
    key = f"content_metadata:{content_id}"
    return cache_get(key)


def invalidate_content_metadata(content_id: int) -> int:
    """
    Invalidate content metadata in cache.
    
    Args:
        content_id: Content ID
    
    Returns:
        int: Number of keys deleted (0 or 1)
    """
    key = f"content_metadata:{content_id}"
    return cache_delete(key)