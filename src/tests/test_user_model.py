"""
Tests for the user model.
"""
import pytest
from src.models.user import User


def test_user_password_hashing(db_session):
    """Test user password hashing."""
    user = User(
        email="test@example.com",
        username="testuser"
    )
    user.set_password("testpassword")
    
    # Test that password is hashed
    assert user.hashed_password is not None
    assert len(user.hashed_password) > 32  # Should include salt
    
    # Test password verification
    assert user.check_password("testpassword")
    assert not user.check_password("wrongpassword")


def test_user_creation(db_session):
    """Test user creation."""
    user = User(
        email="newuser@example.com",
        username="newuser"
    )
    user.set_password("newpassword")
    
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    # Test that user was created correctly
    assert user.id is not None
    assert user.email == "newuser@example.com"
    assert user.username == "newuser"
    assert user.is_active is True
    assert user.is_superuser is False