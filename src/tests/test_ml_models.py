"""
Tests for ML models and manager.
"""
import pytest
from unittest.mock import patch, MagicMock
from src.ai.ml.model import MLModel
from src.ai.ml.models.text_analysis import TextAnalysisModel
from src.ai.ml.models.image_analysis import ImageAnalysisModel
from src.ai.ml.manager import ModelManager


def test_ml_model_abstract_class():
    """Test that MLModel is an abstract class and cannot be instantiated directly."""
    with pytest.raises(TypeError):
        MLModel("test_model", "1.0.0")


def test_text_analysis_model_initialization():
    """Test that the text analysis model initializes correctly."""
    model = TextAnalysisModel()
    assert model is not None
    assert model.model_name == "bert-base-uncased"
    assert model.model_version == "1.0.0"
    assert model.is_loaded is False


def test_text_analysis_model_load():
    """Test loading the text analysis model."""
    model = TextAnalysisModel()
    result = model.load_model()
    assert result is True
    assert model.is_loaded is True


def test_text_analysis_model_predict():
    """Test making predictions with the text analysis model."""
    model = TextAnalysisModel()
    result = model.predict("This is a test sentence for analysis.")
    
    assert result is not None
    assert "text_length" in result
    assert "pattern_matches" in result
    assert "authenticity_score" in result
    assert "confidence" in result
    assert result["confidence"] > 0.0


def test_text_analysis_model_preprocess():
    """Test text preprocessing."""
    model = TextAnalysisModel()
    processed = model.preprocess_input("  This is   a TEST   sentence.  ")
    assert processed == "this is a test sentence."


def test_image_analysis_model_initialization():
    """Test that the image analysis model initializes correctly."""
    model = ImageAnalysisModel()
    assert model is not None
    assert model.model_name == "resnet50"
    assert model.model_version == "1.0.0"
    assert model.is_loaded is False


def test_image_analysis_model_load():
    """Test loading the image analysis model."""
    model = ImageAnalysisModel()
    result = model.load_model()
    assert result is True
    assert model.is_loaded is True


def test_image_analysis_model_predict():
    """Test making predictions with the image analysis model."""
    model = ImageAnalysisModel()
    test_image_data = b"fake image data for testing"
    result = model.predict(test_image_data)
    
    assert result is not None
    assert "image_size" in result
    assert "deepfake_probability" in result
    assert "authenticity_score" in result
    assert "confidence" in result
    assert result["confidence"] > 0.0


def test_model_manager_initialization():
    """Test that the model manager initializes correctly."""
    manager = ModelManager()
    assert manager is not None
    assert isinstance(manager.models, dict)
    assert isinstance(manager.active_models, dict)
    assert isinstance(manager.model_performance, dict)


def test_model_manager_register_model():
    """Test registering models with the model manager."""
    manager = ModelManager()
    model = TextAnalysisModel()
    
    result = manager.register_model("text_analysis", "1.0.0", model)
    assert result is True
    assert "text_analysis" in manager.models
    assert "1.0.0" in manager.models["text_analysis"]


def test_model_manager_set_active_model():
    """Test setting active models."""
    manager = ModelManager()
    model = TextAnalysisModel()
    
    # Register model first
    manager.register_model("text_analysis", "1.0.0", model)
    
    # Set as active
    result = manager.set_active_model("text_analysis", "1.0.0")
    assert result is True
    assert manager.active_models["text_analysis"] == "1.0.0"


def test_model_manager_get_model():
    """Test getting models from the model manager."""
    manager = ModelManager()
    model = TextAnalysisModel()
    
    # Register model
    manager.register_model("text_analysis", "1.0.0", model)
    
    # Get model
    retrieved_model = manager.get_model("text_analysis", "1.0.0")
    assert retrieved_model is not None
    assert retrieved_model == model


def test_model_manager_predict():
    """Test making predictions through the model manager."""
    manager = ModelManager()
    model = TextAnalysisModel()
    
    # Register model
    manager.register_model("text_analysis", "1.0.0", model)
    manager.set_active_model("text_analysis", "1.0.0")
    
    # Make prediction
    result = manager.predict("text_analysis", "Test text for analysis")
    
    assert result is not None
    assert "text_length" in result
    assert "authenticity_score" in result


def test_model_manager_list_models():
    """Test listing models."""
    manager = ModelManager()
    text_model = TextAnalysisModel()
    image_model = ImageAnalysisModel()
    
    # Register models
    manager.register_model("text_analysis", "1.0.0", text_model)
    manager.register_model("image_analysis", "1.0.0", image_model)
    
    # List all models
    all_models = manager.list_models()
    assert "text_analysis" in all_models
    assert "image_analysis" in all_models
    assert "1.0.0" in all_models["text_analysis"]
    assert "1.0.0" in all_models["image_analysis"]
    
    # List specific model type
    text_models = manager.list_models("text_analysis")
    assert "text_analysis" in text_models
    assert "1.0.0" in text_models["text_analysis"]