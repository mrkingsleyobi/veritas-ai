"""
Tests for AI verification engine.
"""
import pytest
from unittest.mock import patch, MagicMock
from src.ai.verification.engine import ContentVerificationEngine


def test_content_verification_engine_initialization():
    """Test that the verification engine initializes correctly."""
    engine = ContentVerificationEngine()
    assert engine is not None
    assert isinstance(engine.supported_content_types, dict)
    assert len(engine.supported_content_types) > 0


def test_verify_text_content():
    """Test verification of text content."""
    engine = ContentVerificationEngine()
    content = b"This is a test text content for verification."
    content_type = "text/plain"
    
    result = engine.verify_content(content, content_type)
    
    assert result is not None
    assert "verification_score" in result
    assert "confidence" in result
    assert "findings" in result
    assert result["content_type"] == content_type
    assert isinstance(result["verification_score"], float)
    assert isinstance(result["confidence"], float)


def test_verify_html_content():
    """Test verification of HTML content."""
    engine = ContentVerificationEngine()
    content = b"<html><body><h1>Test</h1><p>This is HTML content.</p></body></html>"
    content_type = "text/html"
    
    result = engine.verify_content(content, content_type)
    
    assert result is not None
    assert "verification_score" in result
    assert "findings" in result
    assert result["content_type"] == content_type


def test_verify_image_content():
    """Test verification of image content."""
    engine = ContentVerificationEngine()
    content = b"fake image data"
    content_type = "image/jpeg"
    
    result = engine.verify_content(content, content_type)
    
    assert result is not None
    assert "verification_score" in result
    assert "findings" in result
    assert result["content_type"] == content_type


def test_verify_unsupported_content():
    """Test verification of unsupported content type."""
    engine = ContentVerificationEngine()
    content = b"some data"
    content_type = "application/unknown"
    
    result = engine.verify_content(content, content_type)
    
    assert result is not None
    assert result["verification_score"] < 0.5
    assert len(result["findings"]) > 0
    assert result["findings"][0]["type"] == "unsupported_content_type"


def test_verify_content_with_metadata():
    """Test verification with metadata."""
    engine = ContentVerificationEngine()
    content = b"Test content with metadata"
    content_type = "text/plain"
    metadata = {
        "author": "Test Author",
        "source": "Test Source",
        "created": "2023-01-01"
    }
    
    result = engine.verify_content(content, content_type, metadata)
    
    assert result is not None
    assert "metadata_analysis" in result
    assert result["metadata_analysis"] is not None