"""
Tests for text analysis models.
"""
import pytest
from src.ai.models.content_analysis import TextAnalysisModel, ImageAnalysisModel, CrossReferenceModel


def test_text_analysis_model_initialization():
    """Test that the text analysis model initializes correctly."""
    model = TextAnalysisModel()
    assert model is not None
    assert isinstance(model.misinformation_patterns, dict)
    assert isinstance(model.credible_patterns, dict)


def test_analyze_text():
    """Test text analysis."""
    model = TextAnalysisModel()
    text = "This is a test text for analysis. Breaking news: something shocking happened!"
    
    result = model.analyze_text(text)
    
    assert result is not None
    assert "misinformation_score" in result
    assert "credibility_score" in result
    assert "indicators" in result
    assert "word_count" in result
    assert "sentence_count" in result
    assert isinstance(result["misinformation_score"], float)
    assert isinstance(result["credibility_score"], float)


def test_analyze_short_text():
    """Test analysis of short text."""
    model = TextAnalysisModel()
    text = "Short text"
    
    result = model.analyze_text(text)
    
    assert result is not None
    assert result["word_count"] == 2
    assert result["confidence"] < 0.5


def test_image_analysis_model_initialization():
    """Test that the image analysis model initializes correctly."""
    model = ImageAnalysisModel()
    assert model is not None


def test_analyze_image_metadata():
    """Test image metadata analysis."""
    model = ImageAnalysisModel()
    metadata = {
        "exif": {
            "Software": "Adobe Photoshop",
            "Make": "Canon",
            "Model": "EOS R5"
        },
        "width": 1920,
        "height": 1080
    }
    
    result = model.analyze_image_metadata(metadata)
    
    assert result is not None
    assert "metadata_integrity" in result
    assert "editing_indicators" in result
    assert "confidence" in result
    assert len(result["editing_indicators"]) > 0


def test_cross_reference_model_initialization():
    """Test that the cross-reference model initializes correctly."""
    model = CrossReferenceModel()
    assert model is not None
    assert isinstance(model.trusted_domains, dict)


def test_check_source_credibility():
    """Test source credibility checking."""
    model = CrossReferenceModel()
    source_url = "https://www.reuters.com/article/test"
    
    result = model.check_source_credibility(source_url)
    
    assert result is not None
    assert "credibility_score" in result
    assert "trusted_source" in result
    assert "source_category" in result
    assert result["trusted_source"] == True
    assert result["source_category"] is not None


def test_check_untrusted_source():
    """Test checking an untrusted source."""
    model = CrossReferenceModel()
    source_url = "https://www.unknown-source.com/article/test"
    
    result = model.check_source_credibility(source_url)
    
    assert result is not None
    assert result["trusted_source"] == False
    assert result["credibility_score"] < 0.5