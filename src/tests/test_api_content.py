"""
Tests for the content API endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.auth.security import create_access_token

client = TestClient(app)


def test_upload_content(db_session, test_user):
    """Test content upload."""
    # Create access token
    access_token = create_access_token(data={"sub": "test@example.com"})
    
    # Create a test file
    test_file_content = b"test file content"
    
    response = client.post(
        "/api/v1/content/upload",
        files={"file": ("test.txt", test_file_content, "text/plain")},
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["filename"] == "test.txt"
    assert data["content_type"] == "text/plain"
    assert data["file_size"] == len(test_file_content)
    assert data["status"] == "uploaded"


def test_upload_content_unauthorized():
    """Test content upload without authorization."""
    test_file_content = b"test file content"
    
    response = client.post(
        "/api/v1/content/upload",
        files={"file": ("test.txt", test_file_content, "text/plain")}
    )
    
    assert response.status_code == 401


def test_list_content(db_session, test_user, test_content):
    """Test listing user content."""
    # Create access token
    access_token = create_access_token(data={"sub": "test@example.com"})
    
    response = client.get(
        "/api/v1/content/",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == test_content.id
    assert data[0]["filename"] == test_content.filename


def test_get_content_by_id(db_session, test_user, test_content):
    """Test getting content by ID."""
    # Create access token
    access_token = create_access_token(data={"sub": "test@example.com"})
    
    response = client.get(
        f"/api/v1/content/{test_content.id}",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_content.id
    assert data["filename"] == test_content.filename


def test_get_content_not_found(db_session, test_user):
    """Test getting non-existent content."""
    # Create access token
    access_token = create_access_token(data={"sub": "test@example.com"})
    
    response = client.get(
        "/api/v1/content/999999",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    assert response.status_code == 404


def test_delete_content(db_session, test_user, test_content):
    """Test deleting content."""
    # Create access token
    access_token = create_access_token(data={"sub": "test@example.com"})
    
    response = client.delete(
        f"/api/v1/content/{test_content.id}",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    assert response.status_code == 204


def test_delete_content_not_found(db_session, test_user):
    """Test deleting non-existent content."""
    # Create access token
    access_token = create_access_token(data={"sub": "test@example.com"})
    
    response = client.delete(
        "/api/v1/content/999999",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    assert response.status_code == 404