"""
Tests for cache service.
"""
import pytest
import time
from unittest.mock import patch, MagicMock
from src.cache.cache_service import (
    cache_set, cache_get, cache_delete,
    cache_user_session, get_user_session, invalidate_user_session,
    cache_content_metadata, get_content_metadata, invalidate_content_metadata
)


@patch('src.cache.cache_service.set_cache')
@patch('src.cache.cache_service.get_cache')
@patch('src.cache.cache_service.delete_cache')
def test_cache_set_get(mock_delete_cache, mock_get_cache, mock_set_cache):
    """Test setting and getting values from cache."""
    # Mock Redis functions
    mock_set_cache.return_value = True
    mock_get_cache.return_value = '{"test": "data", "number": 42}'
    mock_delete_cache.return_value = 1
    
    key = "test_key"
    value = {"test": "data", "number": 42}
    
    # Test setting cache
    assert cache_set(key, value) == True
    
    # Test getting cache
    cached_value = cache_get(key)
    assert cached_value == value
    
    # Test deleting cache
    assert cache_delete(key) == 1


@patch('src.cache.cache_service.set_cache')
@patch('src.cache.cache_service.get_cache')
@patch('src.cache.cache_service.delete_cache')
def test_cache_user_session(mock_delete_cache, mock_get_cache, mock_set_cache):
    """Test user session caching."""
    # Mock Redis functions
    mock_set_cache.return_value = True
    mock_get_cache.return_value = '{"user_id": 123, "role": "admin", "last_access": 1234567890.0}'
    mock_delete_cache.return_value = 1
    
    user_id = 123
    session_data = {"user_id": user_id, "role": "admin", "last_access": time.time()}
    
    # Test setting user session
    assert cache_user_session(user_id, session_data) == True
    
    # Test getting user session
    cached_session = get_user_session(user_id)
    assert cached_session["user_id"] == user_id
    assert cached_session["role"] == "admin"
    
    # Test invalidating user session
    assert invalidate_user_session(user_id) == 1


@patch('src.cache.cache_service.set_cache')
@patch('src.cache.cache_service.get_cache')
@patch('src.cache.cache_service.delete_cache')
def test_cache_content_metadata(mock_delete_cache, mock_get_cache, mock_set_cache):
    """Test content metadata caching."""
    # Mock Redis functions
    mock_set_cache.return_value = True
    mock_get_cache.return_value = '{"title": "Test Content", "type": "image", "size": 1024, "uploaded_at": "2023-01-01T00:00:00Z"}'
    mock_delete_cache.return_value = 1
    
    content_id = 456
    metadata = {
        "title": "Test Content",
        "type": "image",
        "size": 1024,
        "uploaded_at": "2023-01-01T00:00:00Z"
    }
    
    # Test setting content metadata
    assert cache_content_metadata(content_id, metadata) == True
    
    # Test getting content metadata
    cached_metadata = get_content_metadata(content_id)
    assert cached_metadata["title"] == metadata["title"]
    assert cached_metadata["type"] == metadata["type"]
    
    # Test invalidating content metadata
    assert invalidate_content_metadata(content_id) == 1


@patch('src.cache.cache_service.set_cache')
@patch('src.cache.cache_service.get_cache')
@patch('src.cache.cache_service.delete_cache')
def test_cache_expiration(mock_delete_cache, mock_get_cache, mock_set_cache):
    """Test cache expiration."""
    # Mock Redis functions
    mock_set_cache.return_value = True
    mock_get_cache.return_value = '"test_value"'  # JSON serialized string
    mock_delete_cache.return_value = 1
    
    key = "test_expire_key"
    value = "test_value"
    
    # Set cache with 1 second expiration
    assert cache_set(key, value, expire=1) == True
    
    # Value should be available immediately
    assert cache_get(key) == value
    
    # Simulate expiration by changing mock behavior
    mock_get_cache.return_value = None
    
    # Value should be expired
    assert cache_get(key) is None
