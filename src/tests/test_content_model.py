"""
Tests for the content model.
"""
import pytest
from src.models.content import Content


def test_content_creation(db_session, test_user):
    """Test content creation."""
    content = Content(
        user_id=test_user.id,
        filename="test_video.mp4",
        file_path="test/test_video.mp4",
        content_type="video/mp4",
        file_size=1024000,
        status="uploaded"
    )
    
    db_session.add(content)
    db_session.commit()
    db_session.refresh(content)
    
    # Test that content was created correctly
    assert content.id is not None
    assert content.user_id == test_user.id
    assert content.filename == "test_video.mp4"
    assert content.file_path == "test/test_video.mp4"
    assert content.content_type == "video/mp4"
    assert content.file_size == 1024000
    assert content.status == "uploaded"


def test_content_relationship(db_session, test_user, test_content):
    """Test content relationship with user."""
    # Test that content is associated with user
    assert test_content.user == test_user
    assert len(test_user.contents) == 1
    assert test_user.contents[0] == test_content