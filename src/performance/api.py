"""
Performance optimization API endpoints for VeritasAI.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from src.database import get_db
from src.models.user import User
from src.auth.auth import get_current_active_user
from src.performance.caching.optimizer import caching_optimizer
from src.performance.optimization.db_optimizer import db_optimizer
from src.performance.profiling.analyzer import performance_profiler
from src.performance.monitoring.system import system_monitor

router = APIRouter(prefix="/api/v1/performance", tags=["performance"])


@router.get("/cache/stats")
def get_cache_statistics():
    """Get caching performance statistics."""
    try:
        stats = caching_optimizer.get_cache_statistics()
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving cache statistics: {str(e)}"
        )


@router.delete("/cache/stats")
def clear_cache_statistics():
    """Clear cache statistics."""
    try:
        caching_optimizer.clear_cache_statistics()
        return {"message": "Cache statistics cleared successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error clearing cache statistics: {str(e)}"
        )


@router.get("/cache/memory")
def get_cache_memory_usage():
    """Get cache memory usage estimates."""
    try:
        memory_usage = caching_optimizer.get_memory_usage_estimate()
        return memory_usage
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving cache memory usage: {str(e)}"
        )


@router.get("/db/optimization")
def get_database_optimization(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get database optimization recommendations."""
    try:
        optimization_results = db_optimizer.optimize_content_queries(db, current_user.id)
        return optimization_results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving database optimization: {str(e)}"
        )


@router.get("/db/stats")
def get_database_stats(db: Session = Depends(get_db)):
    """Get database query performance statistics."""
    try:
        stats = db_optimizer.get_query_performance_stats()
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving database statistics: {str(e)}"
        )


@router.get("/db/connections")
def get_database_connections(db: Session = Depends(get_db)):
    """Get database connection statistics."""
    try:
        stats = db_optimizer.get_database_connection_stats(db)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving database connection stats: {str(e)}"
        )


@router.get("/profiling/profiles")
def get_all_profiles():
    """Get all performance profiles."""
    try:
        profiles = performance_profiler.get_all_profiles()
        return profiles
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving performance profiles: {str(e)}"
        )


@router.get("/profiling/profile/{profile_name}")
def get_profile(profile_name: str):
    """Get a specific performance profile."""
    try:
        profile = performance_profiler.get_performance_profile(profile_name)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Profile {profile_name} not found"
            )
        return profile
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving performance profile: {str(e)}"
        )


@router.delete("/profiling/profiles")
def clear_profiles():
    """Clear all performance profiles."""
    try:
        performance_profiler.clear_profiles()
        return {"message": "Performance profiles cleared successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error clearing performance profiles: {str(e)}"
        )


@router.get("/monitoring/system")
def get_system_metrics():
    """Get current system metrics."""
    try:
        metrics = system_monitor.get_system_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving system metrics: {str(e)}"
        )


@router.get("/monitoring/process")
def get_process_metrics():
    """Get current process metrics."""
    try:
        metrics = system_monitor.get_process_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving process metrics: {str(e)}"
        )


@router.get("/monitoring/alerts")
def get_performance_alerts():
    """Get performance alerts."""
    try:
        alerts = system_monitor.get_performance_alerts()
        return alerts
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving performance alerts: {str(e)}"
        )


@router.get("/monitoring/report")
def get_resource_utilization_report():
    """Get comprehensive resource utilization report."""
    try:
        report = system_monitor.get_resource_utilization_report()
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving resource utilization report: {str(e)}"
        )


@router.get("/monitoring/history")
def get_monitoring_history(limit: int = 100):
    """Get monitoring history."""
    try:
        history = system_monitor.get_monitoring_history(limit)
        return history
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving monitoring history: {str(e)}"
        )