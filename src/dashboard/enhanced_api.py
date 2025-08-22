"""
Enhanced Dashboard API endpoints for VeritasAI with interactive visualizations.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List

from src.database import get_db
from src.models.user import User
from src.auth.auth import get_current_active_user
from src.dashboard.enhanced_service import enhanced_dashboard_service

router = APIRouter(prefix="/api/v1/dashboard/enhanced", tags=["enhanced-dashboard"])


@router.get("/analytics")
def get_enhanced_user_analytics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get enhanced analytics data with interactive visualizations."""
    try:
        enhanced_data = enhanced_dashboard_service.get_enhanced_user_analytics(
            current_user.id, db
        )
        return enhanced_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving enhanced analytics: {str(e)}"
        )


@router.get("/trends")
def get_enhanced_content_trends(
    days: int = 30,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get enhanced content analysis trends with interactive visualizations."""
    try:
        enhanced_trends = enhanced_dashboard_service.get_enhanced_content_trends(
            current_user.id, db, days
        )
        return enhanced_trends
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving enhanced trends: {str(e)}"
        )


@router.get("/verification-summary")
def get_enhanced_verification_summary(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get enhanced verification summary with interactive visualizations."""
    try:
        enhanced_summary = enhanced_dashboard_service.get_enhanced_verification_summary(
            current_user.id, db
        )
        return enhanced_summary
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving enhanced verification summary: {str(e)}"
        )


@router.get("/third-party-stats")
def get_enhanced_third_party_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get enhanced third-party verification statistics with interactive visualizations."""
    try:
        enhanced_stats = enhanced_dashboard_service.get_enhanced_third_party_stats(
            current_user.id, db
        )
        return enhanced_stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving enhanced third-party verification stats: {str(e)}"
        )


@router.get("/custom")
def get_customizable_dashboard(
    widgets: List[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get customizable dashboard with selected widgets."""
    try:
        dashboard_data = enhanced_dashboard_service.get_customizable_dashboard(
            current_user.id, db, widgets
        )
        return dashboard_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving customizable dashboard: {str(e)}"
        )


@router.get("/export")
def export_dashboard_data(
    export_format: str = "json",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Export dashboard data in specified format."""
    try:
        export_data = enhanced_dashboard_service.export_dashboard_data(
            current_user.id, db, export_format
        )
        return export_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error exporting dashboard data: {str(e)}"
        )


@router.delete("/cache")
def clear_dashboard_cache(
    current_user: User = Depends(get_current_active_user)
):
    """Clear cached dashboard data for the current user."""
    try:
        success = enhanced_dashboard_service.clear_dashboard_cache(current_user.id)
        return {
            "message": "Dashboard cache cleared successfully" if success else "Failed to clear dashboard cache",
            "success": success
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error clearing dashboard cache: {str(e)}"
        )