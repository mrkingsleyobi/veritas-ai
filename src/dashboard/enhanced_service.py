"""
Enhanced Dashboard Service for VeritasAI with interactive visualizations.
"""
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import json

from src.models.content import Content
from src.models.user import User
from src.dashboard.components.charts import ChartGenerator
from src.cache.redis_client import get_cache, set_cache, delete_cache
from src.dashboard.service import dashboard_service


class EnhancedDashboardService:
    """Enhanced service for generating dashboard data and interactive visualizations."""
    
    def __init__(self):
        """Initialize the enhanced dashboard service."""
        self.chart_generator = ChartGenerator()
        self.cache_prefix = "dashboard_v2"
    
    def get_enhanced_user_analytics(self, user_id: int, db_session: Session) -> Dict[str, Any]:
        """
        Get enhanced analytics data for a specific user with interactive visualizations.
        
        Args:
            user_id: ID of the user
            db_session: Database session
            
        Returns:
            Dictionary with enhanced analytics data and chart configurations
        """
        # Check cache first
        cache_key = f"{self.cache_prefix}:user_analytics:{user_id}"
        cached_data = get_cache(cache_key)
        if cached_data:
            return json.loads(cached_data)
        
        # Get basic analytics
        basic_analytics = dashboard_service.get_user_analytics(user_id, db_session)
        
        # Get user's content for enhanced analytics
        contents = db_session.query(Content).filter(
            Content.user_id == user_id
        ).all()
        
        # Generate interactive charts
        charts = {}
        
        # Content type distribution pie chart
        content_types = basic_analytics["analytics"]["content_type_distribution"]
        if content_types:
            charts["content_type_distribution"] = self.chart_generator.generate_pie_chart(
                content_types,
                "Content Type Distribution"
            )
        
        # Verification score distribution bar chart
        score_distribution = self._calculate_score_distribution(contents)
        if score_distribution:
            charts["verification_score_distribution"] = self.chart_generator.generate_bar_chart(
                [{"range": k, "count": v} for k, v in score_distribution.items()],
                "range",
                ["count"],
                "Verification Score Distribution"
            )
        
        # Deepfake probability distribution
        deepfake_distribution = self._calculate_deepfake_distribution(contents)
        if deepfake_distribution:
            charts["deepfake_probability_distribution"] = self.chart_generator.generate_bar_chart(
                [{"range": k, "count": v} for k, v in deepfake_distribution.items()],
                "range",
                ["count"],
                "Deepfake Probability Distribution"
            )
        
        # Enhanced analytics data
        enhanced_data = {
            "user_id": user_id,
            "analytics": basic_analytics["analytics"],
            "charts": charts,
            "generated_at": datetime.utcnow().isoformat()
        }
        
        # Cache the result for 5 minutes
        set_cache(cache_key, json.dumps(enhanced_data), expire=300)
        
        return enhanced_data
    
    def get_enhanced_content_trends(self, user_id: int, db_session: Session, days: int = 30) -> Dict[str, Any]:
        """
        Get enhanced content analysis trends with interactive visualizations.
        
        Args:
            user_id: ID of the user
            db_session: Database session
            days: Number of days to analyze
            
        Returns:
            Dictionary with enhanced trend data and chart configurations
        """
        # Check cache first
        cache_key = f"{self.cache_prefix}:content_trends:{user_id}:{days}"
        cached_data = get_cache(cache_key)
        if cached_data:
            return json.loads(cached_data)
        
        # Get basic trends
        basic_trends = dashboard_service.get_content_trends(user_id, db_session, days)
        
        # Generate interactive charts
        charts = {}
        
        # Content count over time
        if basic_trends["trends"]:
            charts["content_count_trend"] = self.chart_generator.generate_time_series_chart(
                basic_trends["trends"],
                "date",
                ["content_count"],
                "Content Uploads Over Time",
                "line"
            )
            
            # Verification scores over time
            charts["verification_scores_trend"] = self.chart_generator.generate_time_series_chart(
                basic_trends["trends"],
                "date",
                ["avg_verification_score"],
                "Average Verification Scores Over Time",
                "line"
            )
            
            # Deepfake probability over time
            charts["deepfake_probability_trend"] = self.chart_generator.generate_time_series_chart(
                basic_trends["trends"],
                "date",
                ["avg_deepfake_probability"],
                "Average Deepfake Probability Over Time",
                "line"
            )
        
        # Enhanced trends data
        enhanced_trends = {
            "user_id": user_id,
            "period_days": days,
            "trends": basic_trends["trends"],
            "charts": charts,
            "generated_at": datetime.utcnow().isoformat()
        }
        
        # Cache the result for 5 minutes
        set_cache(cache_key, json.dumps(enhanced_trends), expire=300)
        
        return enhanced_trends
    
    def get_enhanced_verification_summary(self, user_id: int, db_session: Session) -> Dict[str, Any]:
        """
        Get enhanced verification summary with interactive visualizations.
        
        Args:
            user_id: ID of the user
            db_session: Database session
            
        Returns:
            Dictionary with enhanced verification summary and chart configurations
        """
        # Check cache first
        cache_key = f"{self.cache_prefix}:verification_summary:{user_id}"
        cached_data = get_cache(cache_key)
        if cached_data:
            return json.loads(cached_data)
        
        # Get basic summary
        basic_summary = dashboard_service.get_verification_summary(user_id, db_session)
        
        # Generate interactive charts
        charts = {}
        
        # Verification summary pie chart
        summary_data = basic_summary["verification_summary"]
        verification_categories = {
            "Highly Authentic": summary_data["highly_authentic"],
            "Likely Authentic": summary_data["likely_authentic"],
            "Uncertain": summary_data["uncertain"],
            "Likely Misinformation": summary_data["likely_misinformation"],
            "Highly Suspect": summary_data["highly_suspect"]
        }
        
        charts["verification_summary"] = self.chart_generator.generate_pie_chart(
            verification_categories,
            "Verification Results Summary"
        )
        
        # Enhanced summary data
        enhanced_summary = {
            "user_id": user_id,
            "verification_summary": summary_data,
            "charts": charts,
            "generated_at": datetime.utcnow().isoformat()
        }
        
        # Cache the result for 5 minutes
        set_cache(cache_key, json.dumps(enhanced_summary), expire=300)
        
        return enhanced_summary
    
    def get_enhanced_third_party_stats(self, user_id: int, db_session: Session) -> Dict[str, Any]:
        """
        Get enhanced third-party verification statistics with interactive visualizations.
        
        Args:
            user_id: ID of the user
            db_session: Database session
            
        Returns:
            Dictionary with enhanced third-party stats and chart configurations
        """
        # Check cache first
        cache_key = f"{self.cache_prefix}:third_party_stats:{user_id}"
        cached_data = get_cache(cache_key)
        if cached_data:
            return json.loads(cached_data)
        
        # Get basic stats
        basic_stats = dashboard_service.get_third_party_verification_stats(user_id, db_session)
        
        # Generate interactive charts
        charts = {}
        
        # Service breakdown pie chart
        service_data = basic_stats["third_party_stats"]["service_breakdown"]
        if service_data:
            service_counts = {service: data["total"] for service, data in service_data.items()}
            charts["service_breakdown"] = self.chart_generator.generate_pie_chart(
                service_counts,
                "Third-Party Verification Services"
            )
            
            # Verification results by service
            verification_results = {}
            for service, data in service_data.items():
                verification_results[service] = {
                    "True": data["verified_true"],
                    "False": data["verified_false"],
                    "Mixed": data["verified_mixed"],
                    "Errors": data["errors"]
                }
            
            # Create stacked bar chart for verification results
            chart_data = []
            for service, results in verification_results.items():
                chart_data.append({
                    "service": service,
                    "true": results["True"],
                    "false": results["False"],
                    "mixed": results["Mixed"],
                    "errors": results["Errors"]
                })
            
            if chart_data:
                charts["verification_results_by_service"] = self.chart_generator.generate_bar_chart(
                    chart_data,
                    "service",
                    ["true", "false", "mixed", "errors"],
                    "Verification Results by Service",
                    horizontal=True
                )
        
        # Enhanced stats data
        enhanced_stats = {
            "user_id": user_id,
            "third_party_stats": basic_stats["third_party_stats"],
            "charts": charts,
            "generated_at": datetime.utcnow().isoformat()
        }
        
        # Cache the result for 5 minutes
        set_cache(cache_key, json.dumps(enhanced_stats), expire=300)
        
        return enhanced_stats
    
    def get_customizable_dashboard(
        self, 
        user_id: int, 
        db_session: Session, 
        widgets: List[str] = None
    ) -> Dict[str, Any]:
        """
        Get customizable dashboard with selected widgets.
        
        Args:
            user_id: ID of the user
            db_session: Database session
            widgets: List of widget names to include
            
        Returns:
            Dictionary with customizable dashboard data
        """
        if widgets is None:
            widgets = ["analytics", "trends", "verification", "third_party"]
        
        dashboard_data = {
            "user_id": user_id,
            "widgets": {},
            "layout": self._get_default_layout(widgets),
            "generated_at": datetime.utcnow().isoformat()
        }
        
        # Add requested widgets
        if "analytics" in widgets:
            dashboard_data["widgets"]["analytics"] = self.get_enhanced_user_analytics(user_id, db_session)
        
        if "trends" in widgets:
            dashboard_data["widgets"]["trends"] = self.get_enhanced_content_trends(user_id, db_session)
        
        if "verification" in widgets:
            dashboard_data["widgets"]["verification"] = self.get_enhanced_verification_summary(user_id, db_session)
        
        if "third_party" in widgets:
            dashboard_data["widgets"]["third_party"] = self.get_enhanced_third_party_stats(user_id, db_session)
        
        return dashboard_data
    
    def export_dashboard_data(
        self, 
        user_id: int, 
        db_session: Session, 
        export_format: str = "json"
    ) -> Dict[str, Any]:
        """
        Export dashboard data in specified format.
        
        Args:
            user_id: ID of the user
            db_session: Database session
            export_format: Format to export data (json, csv)
            
        Returns:
            Dictionary with exported data
        """
        # Get all dashboard data
        dashboard_data = self.get_customizable_dashboard(user_id, db_session)
        
        if export_format.lower() == "csv":
            # Convert to CSV format
            csv_data = self._convert_to_csv(dashboard_data)
            return {
                "format": "csv",
                "data": csv_data,
                "filename": f"veritasai_dashboard_export_{user_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        else:
            # Return JSON format
            return {
                "format": "json",
                "data": dashboard_data,
                "filename": f"veritasai_dashboard_export_{user_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
            }
    
    def _calculate_score_distribution(self, contents: List[Content]) -> Dict[str, int]:
        """
        Calculate verification score distribution.
        
        Args:
            contents: List of content items
            
        Returns:
            Dictionary with score ranges and counts
        """
        distribution = {
            "0.0-0.2": 0,
            "0.2-0.4": 0,
            "0.4-0.6": 0,
            "0.6-0.8": 0,
            "0.8-1.0": 0
        }
        
        for content in contents:
            if content.verification_score is not None:
                score = content.verification_score
                if 0.0 <= score < 0.2:
                    distribution["0.0-0.2"] += 1
                elif 0.2 <= score < 0.4:
                    distribution["0.2-0.4"] += 1
                elif 0.4 <= score < 0.6:
                    distribution["0.4-0.6"] += 1
                elif 0.6 <= score < 0.8:
                    distribution["0.6-0.8"] += 1
                elif 0.8 <= score <= 1.0:
                    distribution["0.8-1.0"] += 1
        
        return distribution
    
    def _calculate_deepfake_distribution(self, contents: List[Content]) -> Dict[str, int]:
        """
        Calculate deepfake probability distribution.
        
        Args:
            contents: List of content items
            
        Returns:
            Dictionary with probability ranges and counts
        """
        distribution = {
            "0.0-0.2": 0,
            "0.2-0.4": 0,
            "0.4-0.6": 0,
            "0.6-0.8": 0,
            "0.8-1.0": 0
        }
        
        for content in contents:
            if content.deepfake_probability is not None:
                prob = content.deepfake_probability
                if 0.0 <= prob < 0.2:
                    distribution["0.0-0.2"] += 1
                elif 0.2 <= prob < 0.4:
                    distribution["0.2-0.4"] += 1
                elif 0.4 <= prob < 0.6:
                    distribution["0.4-0.6"] += 1
                elif 0.6 <= prob < 0.8:
                    distribution["0.6-0.8"] += 1
                elif 0.8 <= prob <= 1.0:
                    distribution["0.8-1.0"] += 1
        
        return distribution
    
    def _get_default_layout(self, widgets: List[str]) -> List[Dict[str, Any]]:
        """
        Get default dashboard layout.
        
        Args:
            widgets: List of widget names
            
        Returns:
            List of layout configurations
        """
        layout = []
        row = 0
        col = 0
        
        for widget in widgets:
            layout.append({
                "widget": widget,
                "row": row,
                "col": col,
                "width": 6 if col == 0 else 6,
                "height": 4
            })
            
            col += 6
            if col >= 12:
                col = 0
                row += 1
        
        return layout
    
    def _convert_to_csv(self, dashboard_data: Dict[str, Any]) -> str:
        """
        Convert dashboard data to CSV format.
        
        Args:
            dashboard_data: Dashboard data dictionary
            
        Returns:
            CSV formatted string
        """
        # This is a simplified CSV conversion
        # In a real implementation, this would be more comprehensive
        csv_lines = ["Dashboard Export Data"]
        csv_lines.append(f"Generated At: {dashboard_data.get('generated_at', '')}")
        csv_lines.append("")
        
        # Add analytics data
        if "widgets" in dashboard_data and "analytics" in dashboard_data["widgets"]:
            analytics = dashboard_data["widgets"]["analytics"]["analytics"]
            csv_lines.append("Analytics Data:")
            for key, value in analytics.items():
                csv_lines.append(f"{key},{value}")
        
        return "\n".join(csv_lines)
    
    def clear_dashboard_cache(self, user_id: int) -> bool:
        """
        Clear cached dashboard data for a user.
        
        Args:
            user_id: ID of the user
            
        Returns:
            True if cache cleared successfully
        """
        try:
            # Delete all dashboard cache keys for this user
            cache_keys = [
                f"{self.cache_prefix}:user_analytics:{user_id}",
                f"{self.cache_prefix}:content_trends:{user_id}:*",
                f"{self.cache_prefix}:verification_summary:{user_id}",
                f"{self.cache_prefix}:third_party_stats:{user_id}"
            ]
            
            for key in cache_keys:
                delete_cache(key)
            
            return True
        except Exception:
            return False


# Global instance
enhanced_dashboard_service = EnhancedDashboardService()