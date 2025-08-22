"""
Streaming API endpoints for VeritasAI.
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import json
import logging
from typing import Dict, Any, Optional
import uuid

from src.database import get_db
from src.models.user import User
from src.models.content import Content
from src.auth.auth import get_current_active_user
from src.realtime.streaming.processor import streaming_processor
from src.realtime.websocket.manager import websocket_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/stream", tags=["streaming"])


@router.post("/start")
async def start_streaming(
    content_type: str,
    initial_data: Dict[str, Any],
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Start a streaming content processing session."""
    try:
        # Generate unique stream ID
        stream_id = str(uuid.uuid4())
        
        # Start stream processing
        success = await streaming_processor.start_stream_processing(
            stream_id, content_type, initial_data, user_id
        )
        
        if success:
            return {
                "stream_id": stream_id,
                "content_type": content_type,
                "status": "started",
                "message": "Stream processing started successfully"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to start stream processing"
            )
    except Exception as e:
        logger.error(f"Error starting stream: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error starting stream: {str(e)}"
        )


@router.post("/chunk/{stream_id}")
async def process_stream_chunk(
    stream_id: str,
    chunk_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Process a chunk of streaming content."""
    try:
        # Process the chunk
        success = await streaming_processor.process_stream_chunk(stream_id, chunk_data)
        
        if success:
            return {
                "stream_id": stream_id,
                "chunk_id": chunk_data.get("chunk_id"),
                "status": "processed",
                "message": "Chunk processed successfully"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to process stream chunk"
            )
    except Exception as e:
        logger.error(f"Error processing stream chunk: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing stream chunk: {str(e)}"
        )


@router.post("/stop/{stream_id}")
async def stop_streaming(
    stream_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Stop a streaming content processing session."""
    try:
        # Stop stream processing
        success = await streaming_processor.stop_stream_processing(stream_id)
        
        if success:
            return {
                "stream_id": stream_id,
                "status": "stopped",
                "message": "Stream processing stopped successfully"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to stop stream processing"
            )
    except Exception as e:
        logger.error(f"Error stopping stream: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error stopping stream: {str(e)}"
        )


@router.get("/status/{stream_id}")
async def get_stream_status(
    stream_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get the status of a streaming process."""
    try:
        status_info = streaming_processor.get_stream_status(stream_id)
        
        if status_info:
            return {
                "stream_id": stream_id,
                "status": status_info
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Stream not found"
            )
    except Exception as e:
        logger.error(f"Error getting stream status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting stream status: {str(e)}"
        )


@router.post("/live-text")
async def analyze_live_text_stream(
    text: str,
    stream_id: Optional[str] = None,
    chunk_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Analyze a chunk of live text stream."""
    try:
        # Generate IDs if not provided
        if not stream_id:
            stream_id = str(uuid.uuid4())
        if not chunk_id:
            chunk_id = str(uuid.uuid4())
        
        # Create chunk data
        chunk_data = {
            "text": text,
            "chunk_id": chunk_id,
            "timestamp": __import__('datetime').datetime.utcnow().isoformat()
        }
        
        # Process the chunk
        success = await streaming_processor.process_stream_chunk(stream_id, chunk_data)
        
        if success:
            # Get current stream status
            status_info = streaming_processor.get_stream_status(stream_id)
            
            return {
                "stream_id": stream_id,
                "chunk_id": chunk_id,
                "status": "processed",
                "stream_status": status_info,
                "message": "Text chunk processed successfully"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to process text chunk"
            )
    except Exception as e:
        logger.error(f"Error processing live text: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing live text: {str(e)}"
        )