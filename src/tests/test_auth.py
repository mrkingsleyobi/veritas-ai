"""
Tests for the authentication module.
"""
import pytest
from src.auth.security import verify_password, get_password_hash, create_access_token, decode_access_token


def test_password_hashing():
    """Test password hashing and verification."""
    password = "testpassword123"
    hashed_password = get_password_hash(password)
    
    # Test that the password verifies correctly
    assert verify_password(password, hashed_password)
    
    # Test that wrong password doesn't verify
    assert not verify_password("wrongpassword", hashed_password)


def test_jwt_token_creation_and_decoding():
    """Test JWT token creation and decoding."""
    data = {"sub": "test@example.com"}
    token = create_access_token(data)
    
    # Test that token can be decoded
    decoded_data = decode_access_token(token)
    assert decoded_data is not None
    assert decoded_data.email == "test@example.com"


def test_invalid_token_decoding():
    """Test decoding an invalid token."""
    invalid_token = "invalid.token.here"
    decoded_data = decode_access_token(invalid_token)
    assert decoded_data is None