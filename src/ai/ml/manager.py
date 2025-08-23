"""
ML Model Manager for VeritasAI.
"""
from typing import Dict, Any, List, Optional
import json
import logging
from datetime import datetime

from src.ai.ml.model import MLModel
from src.ai.ml.models.text_analysis import TextAnalysisModel
from src.ai.ml.models.image_analysis import ImageAnalysisModel

logger = logging.getLogger(__name__)


class ModelManager:
    """Manager for ML models with versioning and A/B testing support."""
    
    def __init__(self):
        """Initialize the model manager."""
        self.models: Dict[str, Dict[str, MLModel]] = {}
        self.active_models: Dict[str, str] = {}  # model_type -> active_version
        self.model_performance: Dict[str, List[Dict[str, Any]]] = {}
        
    def register_model(self, model_type: str, model_version: str, model: MLModel) -> bool:
        """Register a new ML model.
        
        Args:
            model_type: Type of model (e.g., 'text_analysis', 'image_analysis')
            model_version: Version of the model
            model: ML model instance
            
        Returns:
            True if model registered successfully, False otherwise
        """
        try:
            if model_type not in self.models:
                self.models[model_type] = {}
            
            self.models[model_type][model_version] = model
            logger.info(f"Registered model {model_type} v{model_version}")
            return True
        except Exception as e:
            logger.error(f"Error registering model {model_type} v{model_version}: {str(e)}")
            return False
    
    def set_active_model(self, model_type: str, model_version: str) -> bool:
        """Set the active version for a model type.
        
        Args:
            model_type: Type of model
            model_version: Version to set as active
            
        Returns:
            True if active model set successfully, False otherwise
        """
        try:
            if model_type not in self.models:
                logger.error(f"Model type {model_type} not found")
                return False
            
            if model_version not in self.models[model_type]:
                logger.error(f"Model version {model_version} not found for type {model_type}")
                return False
            
            self.active_models[model_type] = model_version
            logger.info(f"Set active model for {model_type} to v{model_version}")
            return True
        except Exception as e:
            logger.error(f"Error setting active model {model_type} v{model_version}: {str(e)}")
            return False
    
    def get_model(self, model_type: str, model_version: Optional[str] = None) -> Optional[MLModel]:
        """Get a registered ML model.
        
        Args:
            model_type: Type of model
            model_version: Specific version (if None, returns active version)
            
        Returns:
            ML model instance or None if not found
        """
        try:
            if model_type not in self.models:
                logger.error(f"Model type {model_type} not found")
                return None
            
            if model_version is None:
                # Get active version
                if model_type not in self.active_models:
                    logger.error(f"No active model set for type {model_type}")
                    return None
                model_version = self.active_models[model_type]
            
            if model_version not in self.models[model_type]:
                logger.error(f"Model version {model_version} not found for type {model_type}")
                return None
            
            return self.models[model_type][model_version]
        except Exception as e:
            logger.error(f"Error getting model {model_type} v{model_version}: {str(e)}")
            return None
    
    def get_active_model(self, model_type: str) -> Optional[MLModel]:
        """Get the active model for a specific type.
        
        Args:
            model_type: Type of model
            
        Returns:
            Active ML model instance or None if not found
        """
        return self.get_model(model_type)
    
    def list_models(self, model_type: Optional[str] = None) -> Dict[str, List[str]]:
        """List all registered models.
        
        Args:
            model_type: Specific model type to list (if None, lists all)
            
        Returns:
            Dictionary mapping model types to lists of versions
        """
        if model_type:
            if model_type in self.models:
                return {model_type: list(self.models[model_type].keys())}
            else:
                return {model_type: []}
        else:
            return {mt: list(mv.keys()) for mt, mv in self.models.items()}
    
    def load_model(self, model_type: str, model_version: Optional[str] = None) -> bool:
        """Load a specific model.
        
        Args:
            model_type: Type of model
            model_version: Specific version (if None, loads active version)
            
        Returns:
            True if model loaded successfully, False otherwise
        """
        model = self.get_model(model_type, model_version)
        if model:
            return model.load_model()
        return False
    
    def predict(self, model_type: str, input_data: Any, model_version: Optional[str] = None) -> Dict[str, Any]:
        """Make a prediction using a specific model.
        
        Args:
            model_type: Type of model
            input_data: Input data for prediction
            model_version: Specific version (if None, uses active version)
            
        Returns:
            Dictionary containing prediction results
        """
        model = self.get_model(model_type, model_version)
        if model:
            result = model.predict(input_data)
            # Track performance
            self._track_prediction(model_type, model_version or self.active_models.get(model_type, "unknown"), result)
            return result
        else:
            return {
                "error": f"Model {model_type} not found",
                "confidence": 0.0
            }
    
    def train_model(self, model_type: str, training_data: List[Any], validation_data: List[Any], 
                   model_version: Optional[str] = None) -> Dict[str, Any]:
        """Train a specific model.
        
        Args:
            model_type: Type of model
            training_data: Training data
            validation_data: Validation data
            model_version: Specific version (if None, uses active version)
            
        Returns:
            Dictionary containing training metrics
        """
        model = self.get_model(model_type, model_version)
        if model:
            result = model.train(training_data, validation_data)
            # Track training performance
            self._track_training(model_type, model_version or self.active_models.get(model_type, "unknown"), result)
            return result
        else:
            return {
                "error": f"Model {model_type} not found"
            }
    
    def _track_prediction(self, model_type: str, model_version: str, result: Dict[str, Any]):
        """Track prediction performance.
        
        Args:
            model_type: Type of model
            model_version: Version of model
            result: Prediction result
        """
        if model_type not in self.model_performance:
            self.model_performance[model_type] = []
        
        performance_record = {
            "model_version": model_version,
            "timestamp": datetime.utcnow().isoformat(),
            "result": result,
            "type": "prediction"
        }
        
        self.model_performance[model_type].append(performance_record)
        
        # Keep only last 1000 records per model type
        if len(self.model_performance[model_type]) > 1000:
            self.model_performance[model_type] = self.model_performance[model_type][-1000:]
    
    def _track_training(self, model_type: str, model_version: str, result: Dict[str, Any]):
        """Track training performance.
        
        Args:
            model_type: Type of model
            model_version: Version of model
            result: Training result
        """
        if model_type not in self.model_performance:
            self.model_performance[model_type] = []
        
        performance_record = {
            "model_version": model_version,
            "timestamp": datetime.utcnow().isoformat(),
            "result": result,
            "type": "training"
        }
        
        self.model_performance[model_type].append(performance_record)
        
        # Keep only last 1000 records per model type
        if len(self.model_performance[model_type]) > 1000:
            self.model_performance[model_type] = self.model_performance[model_type][-1000:]
    
    def get_performance_stats(self, model_type: str) -> Dict[str, Any]:
        """Get performance statistics for a model type.
        
        Args:
            model_type: Type of model
            
        Returns:
            Dictionary containing performance statistics
        """
        if model_type not in self.model_performance:
            return {"error": f"No performance data for model type {model_type}"}
        
        records = self.model_performance[model_type]
        
        # Calculate statistics
        total_predictions = len([r for r in records if r["type"] == "prediction"])
        total_trainings = len([r for r in records if r["type"] == "training"])
        
        # Get recent predictions
        recent_predictions = [r for r in records if r["type"] == "prediction"][-10:]
        
        # Get recent trainings
        recent_trainings = [r for r in records if r["type"] == "training"][-5:]
        
        return {
            "model_type": model_type,
            "total_predictions": total_predictions,
            "total_trainings": total_trainings,
            "recent_predictions": recent_predictions,
            "recent_trainings": recent_trainings,
            "timestamp": datetime.utcnow().isoformat()
        }


# Global instance
model_manager = ModelManager()


# Initialize default models
def initialize_default_models():
    """Initialize default models and register them with the model manager."""
    # Register text analysis model
    text_model = TextAnalysisModel()
    model_manager.register_model("text_analysis", "1.0.0", text_model)
    model_manager.set_active_model("text_analysis", "1.0.0")
    
    # Register image analysis model
    image_model = ImageAnalysisModel()
    model_manager.register_model("image_analysis", "1.0.0", image_model)
    model_manager.set_active_model("image_analysis", "1.0.0")


# Initialize models on import
initialize_default_models()