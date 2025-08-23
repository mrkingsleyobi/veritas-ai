"""
Tests for deepfake detection engine.
"""
import pytest
from src.ai.deepfake.detection import DeepfakeDetectionEngine


def test_deepfake_detection_engine_initialization():
    """Test that the deepfake detection engine initializes correctly."""
    engine = DeepfakeDetectionEngine()
    assert engine is not None
    assert isinstance(engine.supported_formats, dict)
    assert "image" in engine.supported_formats
    assert "video" in engine.supported_formats


def test_detect_image_deepfake():
    """Test deepfake detection for images."""
    engine = DeepfakeDetectionEngine()
    content = b"fake image data"
    content_type = "image"
    
    result = engine.detect_deepfake(content, content_type)
    
    assert result is not None
    assert "deepfake_probability" in result
    assert "confidence" in result
    assert "indicators" in result
    assert result["content_type"] == content_type
    assert isinstance(result["deepfake_probability"], float)
    assert isinstance(result["confidence"], float)


def test_detect_video_deepfake():
    """Test deepfake detection for videos."""
    engine = DeepfakeDetectionEngine()
    content = b"fake video data"
    content_type = "video"
    
    result = engine.detect_deepfake(content, content_type)
    
    assert result is not None
    assert "deepfake_probability" in result
    assert "indicators" in result
    assert result["content_type"] == content_type


def test_detect_unsupported_content():
    """Test deepfake detection for unsupported content type."""
    engine = DeepfakeDetectionEngine()
    content = b"some data"
    content_type = "application/unknown"
    
    result = engine.detect_deepfake(content, content_type)
    
    assert result is not None
    assert result["deepfake_probability"] > 0
    assert result["confidence"] > 0
    assert len(result["indicators"]) > 0
    assert result["indicators"][0]["type"] == "unsupported_format"


def test_detect_deepfake_with_metadata():
    """Test deepfake detection with metadata."""
    engine = DeepfakeDetectionEngine()
    content = b"Test content with metadata"
    content_type = "image"
    metadata = {
        "width": 1920,
        "height": 1080,
        "exif": {
            "Software": "Test Software"
        }
    }
    
    result = engine.detect_deepfake(content, content_type, metadata)
    
    assert result is not None
    assert "indicators" in result