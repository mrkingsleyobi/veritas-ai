"""
Tests for the authentication API endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.auth.security import create_access_token

client = TestClient(app)


def test_register_user():
    """Test user registration."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "newpassword123"
        }
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["username"] == "newuser"
    assert "id" in data
    assert "hashed_password" not in data  # Should not be exposed


def test_register_duplicate_user(db_session, test_user):
    """Test registering a duplicate user."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",  # Same as test_user
            "username": "different_username",
            "password": "newpassword123"
        }
    )
    
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"


def test_login_user(db_session, test_user):
    """Test user login."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpassword"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials():
    """Test login with invalid credentials."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
    )
    
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_get_current_user(db_session, test_user):
    """Test getting current user with valid token."""
    # Create access token
    access_token = create_access_token(data={"sub": "test@example.com"})
    
    response = client.get(
        "/api/v1/auth/users/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"


def test_get_current_user_invalid_token():
    """Test getting current user with invalid token."""
    response = client.get(
        "/api/v1/auth/users/me",
        headers={"Authorization": "Bearer invalid_token"}
    )
    
    assert response.status_code == 401