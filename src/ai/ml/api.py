"""
ML API endpoints for VeritasAI.
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
import json

from src.database import get_db
from src.models.user import User
from src.models.content import Content
from src.auth.auth import get_current_active_user
from src.ai.ml.manager import model_manager

router = APIRouter(prefix="/api/v1/ml", tags=["ml"])


@router.post("/analyze-text")
async def analyze_text_with_ml(
    text: str,
    model_version: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Analyze text content using ML models."""
    try:
        # Use the model manager to make predictions
        result = model_manager.predict("text_analysis", text, model_version)
        
        return {
            "text": text,
            "analysis_result": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during text analysis: {str(e)}"
        )


@router.post("/analyze-image")
async def analyze_image_with_ml(
    file: UploadFile = File(...),
    model_version: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Analyze image content using ML models."""
    try:
        # Read image data
        image_data = await file.read()
        
        # Use the model manager to make predictions
        result = model_manager.predict("image_analysis", image_data, model_version)
        
        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "analysis_result": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during image analysis: {str(e)}"
        )


@router.get("/models")
def list_models(
    model_type: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """List all available ML models."""
    try:
        models = model_manager.list_models(model_type)
        active_models = model_manager.active_models
        
        return {
            "models": models,
            "active_models": active_models
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing models: {str(e)}"
        )


@router.post("/models/{model_type}/load")
def load_model(
    model_type: str,
    model_version: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Load a specific ML model."""
    try:
        success = model_manager.load_model(model_type, model_version)
        
        if success:
            return {
                "message": f"Model {model_type} v{model_version or 'active'} loaded successfully",
                "success": True
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to load model {model_type} v{model_version or 'active'}"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading model: {str(e)}"
        )


@router.get("/models/{model_type}/performance")
def get_model_performance(
    model_type: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get performance statistics for a model type."""
    try:
        stats = model_manager.get_performance_stats(model_type)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting performance stats: {str(e)}"
        )


@router.post("/train")
async def train_model(
    model_type: str,
    training_data: List[Dict[str, Any]],
    validation_data: List[Dict[str, Any]],
    model_version: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Train a specific ML model."""
    # Only allow admin users to train models
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin users can train models"
        )
    
    try:
        result = model_manager.train_model(model_type, training_data, validation_data, model_version)
        
        if "error" in result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        return {
            "model_type": model_type,
            "model_version": model_version or "active",
            "training_result": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during model training: {str(e)}"
        )