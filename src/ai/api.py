"""
AI API endpoints for VeritasAI.
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
import json

from src.database import get_db
from src.models.user import User
from src.models.content import Content
from src.auth.auth import get_current_active_user
from src.ai.verification.engine import verification_engine
from src.ai.deepfake.detection import deepfake_engine
from src.ai.third_party.service import third_party_service

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


@router.post("/verify")
async def verify_content(
    content_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Verify content authenticity using AI engine."""
    # Get content from database
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.user_id == current_user.id
    ).first()
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    try:
        # In a real implementation, we would download the content from storage
        # For now, we'll simulate content verification
        content_data = b"simulated content data"
        content_type = content.content_type or "text/plain"
        
        # Extract metadata
        metadata = {
            "filename": content.filename,
            "file_size": content.file_size,
            "uploaded_at": content.uploaded_at.isoformat() if content.uploaded_at else None,
            "url": content.url
        }
        
        # Verify content
        verification_result = verification_engine.verify_content(
            content_data, content_type, metadata
        )
        
        # Update content with verification results
        content.verification_result = verification_result
        content.verification_score = verification_result.get('verification_score', 0.0)
        db.commit()
        
        return {
            "content_id": content_id,
            "verification": verification_result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error verifying content: {str(e)}"
        )


@router.post("/deepfake-detect")
async def detect_deepfake(
    content_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Detect deepfake content using AI engine."""
    # Get content from database
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.user_id == current_user.id
    ).first()
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    try:
        # Determine content type for deepfake detection
        content_type = "image" if content.content_type and "image" in content.content_type else \
                      "video" if content.content_type and "video" in content.content_type else \
                      "image"  # Default to image
        
        # In a real implementation, we would download the content from storage
        # For now, we'll simulate deepfake detection
        content_data = b"simulated content data"
        
        # Extract metadata
        metadata = {
            "filename": content.filename,
            "file_size": content.file_size,
            "content_type": content.content_type
        }
        
        # Detect deepfake
        deepfake_result = deepfake_engine.detect_deepfake(
            content_data, content_type, metadata
        )
        
        # Update content with deepfake detection results
        content.deepfake_result = deepfake_result
        content.deepfake_probability = deepfake_result.get('deepfake_probability', 0.0)
        db.commit()
        
        return {
            "content_id": content_id,
            "deepfake_detection": deepfake_result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error detecting deepfake: {str(e)}"
        )


@router.post("/analyze-text")
async def analyze_text(
    text: str,
    current_user: User = Depends(get_current_active_user)
):
    """Analyze text content for misinformation."""
    try:
        from src.ai.models.content_analysis import text_model
        
        # Analyze text
        analysis_result = text_model.analyze_text(text)
        
        return {
            "text_analysis": analysis_result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing text: {str(e)}"
        )


@router.get("/content/{content_id}/analysis")
def get_content_analysis(
    content_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get analysis results for a specific content item."""
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.user_id == current_user.id
    ).first()
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    analysis_results = {}
    
    # Add verification results if available
    if content.verification_result:
        analysis_results['verification'] = content.verification_result
    
    # Add deepfake detection results if available
    if content.deepfake_result:
        analysis_results['deepfake_detection'] = content.deepfake_result
    
    # Add basic content info
    analysis_results['content_info'] = {
        'id': content.id,
        'filename': content.filename,
        'content_type': content.content_type,
        'file_size': content.file_size,
        'verification_score': content.verification_score,
        'deepfake_probability': content.deepfake_probability,
        'uploaded_at': content.uploaded_at.isoformat() if content.uploaded_at else None,
        'status': content.status
    }
    
    return analysis_results


@router.post("/verify-claim")
async def verify_claim(
    claim: str,
    language: str = "en",
    current_user: User = Depends(get_current_active_user)
):
    """Verify a text claim using third-party fact-checking services."""
    try:
        # Perform third-party verification
        verification_result = third_party_service.verify_text_claim(claim, language)
        
        return {
            "claim": claim,
            "verification_result": verification_result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during claim verification: {str(e)}"
        )


@router.get("/third-party-status")
def get_third_party_status(
    current_user: User = Depends(get_current_active_user)
):
    """Get the status of third-party verification services."""
    try:
        status_info = third_party_service.get_service_status()
        
        return {
            "services": status_info
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving service status: {str(e)}"
        )