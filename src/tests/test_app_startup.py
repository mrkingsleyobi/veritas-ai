"""
Test app startup without external dependencies.
"""
import pytest
from unittest.mock import patch, MagicMock


def test_app_imports():
    """Test that the app can be imported without external dependencies."""
    with patch('src.storage.storage.StorageService._ensure_bucket_exists'), \
         patch('src.storage.storage.Minio'), \
         patch('src.database.create_engine'):
        from src.main import app
        assert app is not None


def test_health_check_endpoint():
    """Test that the health check endpoint works."""
    with patch('src.storage.storage.StorageService._ensure_bucket_exists'), \
         patch('src.storage.storage.Minio'), \
         patch('src.database.create_engine'), \
         patch('src.cache.redis_client.redis.Redis'):
        from src.main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        response = client.get("/health")
        assert response.status_code == 200
        assert "status" in response.json()