"""
ML Model Base Class for VeritasAI.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import json
import logging

logger = logging.getLogger(__name__)


class MLModel(ABC):
    """Abstract base class for ML models in VeritasAI."""
    
    def __init__(self, model_name: str, model_version: str):
        """Initialize the ML model.
        
        Args:
            model_name: Name of the model
            model_version: Version of the model
        """
        self.model_name = model_name
        self.model_version = model_version
        self.is_loaded = False
        
    @abstractmethod
    def load_model(self) -> bool:
        """Load the ML model from storage.
        
        Returns:
            True if model loaded successfully, False otherwise
        """
        pass
    
    @abstractmethod
    def predict(self, input_data: Any) -> Dict[str, Any]:
        """Make a prediction using the ML model.
        
        Args:
            input_data: Input data for prediction
            
        Returns:
            Dictionary containing prediction results
        """
        pass
    
    @abstractmethod
    def train(self, training_data: List[Any], validation_data: List[Any]) -> Dict[str, Any]:
        """Train the ML model.
        
        Args:
            training_data: Training data
            validation_data: Validation data
            
        Returns:
            Dictionary containing training metrics
        """
        pass
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the model.
        
        Returns:
            Dictionary containing model information
        """
        return {
            "model_name": self.model_name,
            "model_version": self.model_version,
            "is_loaded": self.is_loaded
        }
    
    def preprocess_input(self, input_data: Any) -> Any:
        """Preprocess input data before prediction.
        
        Args:
            input_data: Raw input data
            
        Returns:
            Preprocessed input data
        """
        # Default implementation - can be overridden by subclasses
        return input_data
    
    def postprocess_output(self, output_data: Any) -> Dict[str, Any]:
        """Postprocess output data after prediction.
        
        Args:
            output_data: Raw output data from model
            
        Returns:
            Postprocessed output data
        """
        # Default implementation - can be overridden by subclasses
        if isinstance(output_data, dict):
            return output_data
        return {"result": output_data}