"""
Content API endpoints for VeritasAI.
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from src.database import get_db
from src.models.user import User
from src.models.content import Content
from src.schemas.content import ContentCreate, ContentCreateUrl, ContentResponse
from src.auth.auth import get_current_active_user
from src.storage.storage import get_storage_service
import uuid
import os
import requests

router = APIRouter()


@router.post("/upload", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
async def upload_content(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload a content file."""
    try:
        # Get storage service
        storage_service = get_storage_service()
        
        # Read file content
        file_content = await file.read()
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Upload to storage
        file_path = storage_service.upload_file(
            file_content, 
            unique_filename, 
            file.content_type
        )
        
        # Create content record
        db_content = Content(
            user_id=current_user.id,
            filename=file.filename,
            file_path=file_path,
            content_type=file.content_type,
            file_size=len(file_content),
            status="uploaded"
        )
        
        # Save to database
        db.add(db_content)
        db.commit()
        db.refresh(db_content)
        
        return db_content
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )


@router.post("/url", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
async def upload_content_from_url(
    content_data: ContentCreateUrl,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload content from a URL."""
    try:
        # Get storage service
        storage_service = get_storage_service()
        
        # Download content from URL
        response = requests.get(content_data.url, timeout=30)
        response.raise_for_status()
        
        # Get content type and filename
        content_type = response.headers.get("content-type", "application/octet-stream")
        filename = content_data.url.split("/")[-1] or f"content_{uuid.uuid4()}"
        
        # Generate unique filename
        file_extension = os.path.splitext(filename)[1] or ".bin"
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Upload to storage
        file_path = storage_service.upload_file(
            response.content, 
            unique_filename, 
            content_type
        )
        
        # Create content record
        db_content = Content(
            user_id=current_user.id,
            filename=filename,
            file_path=file_path,
            content_type=content_type,
            file_size=len(response.content),
            status="uploaded"
        )
        
        # Save to database
        db.add(db_content)
        db.commit()
        db.refresh(db_content)
        
        return db_content
        
    except requests.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error downloading content from URL: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing content: {str(e)}"
        )


@router.get("/{content_id}", response_model=ContentResponse)
def get_content(
    content_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get content by ID."""
    db_content = db.query(Content).filter(
        Content.id == content_id,
        Content.user_id == current_user.id
    ).first()
    
    if not db_content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    return db_content


@router.get("/", response_model=list[ContentResponse])
def list_content(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List user's content."""
    contents = db.query(Content).filter(
        Content.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return contents


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_content(
    content_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete content by ID."""
    db_content = db.query(Content).filter(
        Content.id == content_id,
        Content.user_id == current_user.id
    ).first()
    
    if not db_content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Delete from storage
    try:
        storage_service = get_storage_service()
        filename = db_content.file_path.split("/")[-1]
        storage_service.delete_file(filename)
    except Exception as e:
        # Log error but continue with database deletion
        print(f"Error deleting file from storage: {e}")
    
    # Delete from database
    db.delete(db_content)
    db.commit()
    
    return