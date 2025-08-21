"""
Analysis Dashboard Components for VeritasAI.
"""
from typing import Dict, List, Any
from datetime import datetime


class DashboardService:
    """Service for generating dashboard data and visualizations."""
    
    def __init__(self):
        """Initialize the dashboard service."""
        pass
    
    def get_user_analytics(self, user_id: int, db_session) -> Dict[str, Any]:
        """
        Get analytics data for a specific user.
        
        Args:
            user_id: ID of the user
            db_session: Database session
            
        Returns:
            Dictionary with analytics data
        """
        from src.models.content import Content
        import json
        
        # Get user's content
        contents = db_session.query(Content).filter(
            Content.user_id == user_id
        ).all()
        
        # Calculate statistics
        total_content = len(contents)
        verified_content = sum(1 for c in contents if c.verification_score is not None)
        deepfake_analyzed = sum(1 for c in contents if c.deepfake_probability is not None)
        
        # Calculate average scores
        avg_verification_score = 0.0
        avg_deepfake_probability = 0.0
        
        if verified_content > 0:
            avg_verification_score = sum(
                c.verification_score for c in contents if c.verification_score is not None
            ) / verified_content
        
        if deepfake_analyzed > 0:
            avg_deepfake_probability = sum(
                c.deepfake_probability for c in contents if c.deepfake_probability is not None
            ) / deepfake_analyzed
            
        # Count third-party verifications
        third_party_verified = 0
        for content in contents:
            if content.verification_result:
                try:
                    result = json.loads(content.verification_result)
                    if 'third_party_verification' in result:
                        third_party_verified += 1
                except (json.JSONDecodeError, TypeError):
                    pass
        
        # Content type distribution
        content_types = {}
        for content in contents:
            content_type = content.content_type or "unknown"
            content_types[content_type] = content_types.get(content_type, 0) + 1
        
        return {
            "user_id": user_id,
            "analytics": {
                "total_content": total_content,
                "verified_content": verified_content,
                "deepfake_analyzed": deepfake_analyzed,
                "third_party_verified": third_party_verified,
                "avg_verification_score": round(avg_verification_score, 2),
                "avg_deepfake_probability": round(avg_deepfake_probability, 2),
                "content_type_distribution": content_types,
                "generated_at": datetime.utcnow().isoformat()
            }
        }
    
    def get_content_trends(self, user_id: int, db_session, days: int = 30) -> Dict[str, Any]:
        """
        Get content analysis trends over time.
        
        Args:
            user_id: ID of the user
            db_session: Database session
            days: Number of days to analyze
            
        Returns:
            Dictionary with trend data
        """
        from src.models.content import Content
        from datetime import datetime, timedelta
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get content within date range
        contents = db_session.query(Content).filter(
            Content.user_id == user_id,
            Content.uploaded_at >= start_date,
            Content.uploaded_at <= end_date
        ).all()
        
        # Group by date
        daily_stats = {}
        for content in contents:
            date_key = content.uploaded_at.date().isoformat()
            if date_key not in daily_stats:
                daily_stats[date_key] = {
                    "content_count": 0,
                    "total_verification_score": 0,
                    "verification_count": 0,
                    "total_deepfake_prob": 0,
                    "deepfake_count": 0
                }
            
            daily_stats[date_key]["content_count"] += 1
            
            if content.verification_score is not None:
                daily_stats[date_key]["total_verification_score"] += content.verification_score
                daily_stats[date_key]["verification_count"] += 1
            
            if content.deepfake_probability is not None:
                daily_stats[date_key]["total_deepfake_prob"] += content.deepfake_probability
                daily_stats[date_key]["deepfake_count"] += 1
        
        # Calculate averages
        trends = []
        for date, stats in daily_stats.items():
            trend_data = {
                "date": date,
                "content_count": stats["content_count"],
                "avg_verification_score": 0.0,
                "avg_deepfake_probability": 0.0
            }
            
            if stats["verification_count"] > 0:
                trend_data["avg_verification_score"] = round(
                    stats["total_verification_score"] / stats["verification_count"], 2
                )
            
            if stats["deepfake_count"] > 0:
                trend_data["avg_deepfake_probability"] = round(
                    stats["total_deepfake_prob"] / stats["deepfake_count"], 2
                )
            
            trends.append(trend_data)
        
        # Sort by date
        trends.sort(key=lambda x: x["date"])
        
        return {
            "user_id": user_id,
            "period_days": days,
            "trends": trends,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    def get_verification_summary(self, user_id: int, db_session) -> Dict[str, Any]:
        """
        Get summary of verification results.
        
        Args:
            user_id: ID of the user
            db_session: Database session
            
        Returns:
            Dictionary with verification summary
        """
        from src.models.content import Content
        
        contents = db_session.query(Content).filter(
            Content.user_id == user_id,
            Content.verification_score.isnot(None)
        ).all()
        
        # Categorize by verification score
        highly_authentic = 0
        likely_authentic = 0
        uncertain = 0
        likely_misinformation = 0
        highly_suspect = 0
        
        for content in contents:
            score = content.verification_score
            if score >= 0.9:
                highly_authentic += 1
            elif score >= 0.7:
                likely_authentic += 1
            elif score >= 0.5:
                uncertain += 1
            elif score >= 0.3:
                likely_misinformation += 1
            else:
                highly_suspect += 1
        
        return {
            "user_id": user_id,
            "verification_summary": {
                "total_verified": len(contents),
                "highly_authentic": highly_authentic,
                "likely_authentic": likely_authentic,
                "uncertain": uncertain,
                "likely_misinformation": likely_misinformation,
                "highly_suspect": highly_suspect,
                "generated_at": datetime.utcnow().isoformat()
            }
        }

    def get_third_party_verification_stats(self, user_id: int, db_session) -> Dict[str, Any]:
        """
        Get statistics for third-party verification results.
        
        Args:
            user_id: ID of the user
            db_session: Database session
            
        Returns:
            Dictionary with third-party verification statistics
        """
        from src.models.content import Content
        import json
        
        contents = db_session.query(Content).filter(
            Content.user_id == user_id
        ).all()
        
        # Count third-party verifications by service
        service_stats = {}
        total_third_party_verified = 0
        
        for content in contents:
            if content.verification_result:
                try:
                    result = json.loads(content.verification_result)
                    third_party_data = result.get('third_party_verification', {})
                    
                    if third_party_data:
                        total_third_party_verified += 1
                        # Count verifications by service
                        for service_name, service_result in third_party_data.items():
                            if service_name not in service_stats:
                                service_stats[service_name] = {
                                    'total': 0,
                                    'verified_true': 0,
                                    'verified_false': 0,
                                    'verified_mixed': 0,
                                    'errors': 0
                                }
                            
                            service_stats[service_name]['total'] += 1
                            
                            if 'error' in service_result:
                                service_stats[service_name]['errors'] += 1
                            else:
                                rating = service_result.get('rating', '').lower()
                                if rating in ['true', 'mostly_true']:
                                    service_stats[service_name]['verified_true'] += 1
                                elif rating in ['false', 'mostly_false']:
                                    service_stats[service_name]['verified_false'] += 1
                                elif rating in ['mixed', 'uncertain']:
                                    service_stats[service_name]['verified_mixed'] += 1
                except (json.JSONDecodeError, TypeError):
                    pass
        
        return {
            "user_id": user_id,
            "third_party_stats": {
                "total_third_party_verified": total_third_party_verified,
                "service_breakdown": service_stats,
                "generated_at": datetime.utcnow().isoformat()
            }
        }


# Global instance
dashboard_service = DashboardService()