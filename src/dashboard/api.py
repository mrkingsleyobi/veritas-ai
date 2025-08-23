"""
Dashboard API endpoints for VeritasAI.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from src.database import get_db
from src.models.user import User
from src.auth.auth import get_current_active_user
from src.dashboard.service import dashboard_service

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("/analytics")
def get_user_analytics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get analytics data for the current user."""
    try:
        analytics_data = dashboard_service.get_user_analytics(
            current_user.id, db
        )
        return analytics_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving analytics: {str(e)}"
        )


@router.get("/trends")
def get_content_trends(
    days: int = 30,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get content analysis trends over time."""
    try:
        trends_data = dashboard_service.get_content_trends(
            current_user.id, db, days
        )
        return trends_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving trends: {str(e)}"
        )


@router.get("/verification-summary")
def get_verification_summary(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get summary of verification results."""
    try:
        summary_data = dashboard_service.get_verification_summary(
            current_user.id, db
        )
        return summary_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving verification summary: {str(e)}"
        )


@router.get("/third-party-stats")
def get_third_party_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get statistics for third-party verification results."""
    try:
        stats_data = dashboard_service.get_third_party_verification_stats(
            current_user.id, db
        )
        return stats_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving third-party verification stats: {str(e)}"
        )