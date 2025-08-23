"""
Automated insights generation module for VeritasAI.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import numpy as np
import logging

logger = logging.getLogger(__name__)


class InsightsGenerator:
    """Generate automated insights from analytics data."""
    
    def __init__(self):
        """Initialize the insights generator."""
        self.insight_templates = self._load_insight_templates()
        self.generated_insights = []
    
    def generate_dashboard_insights(self, analytics_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate insights from dashboard analytics data.
        
        Args:
            analytics_data: Dictionary with dashboard analytics data
            
        Returns:
            List of generated insights
        """
        insights = []
        
        try:
            # Generate insights from different sections
            if 'analytics' in analytics_data:
                insights.extend(self._generate_content_insights(analytics_data['analytics']))
            
            if 'verification_summary' in analytics_data:
                insights.extend(self._generate_verification_insights(analytics_data['verification_summary']))
            
            if 'third_party_stats' in analytics_data:
                insights.extend(self._generate_third_party_insights(analytics_data['third_party_stats']))
            
            if 'trends' in analytics_data:
                insights.extend(self._generate_trend_insights(analytics_data['trends']))
            
            # Add timestamp and priority to insights
            for insight in insights:
                insight['generated_at'] = datetime.now().isoformat()
                if 'priority' not in insight:
                    insight['priority'] = self._calculate_insight_priority(insight)
            
            # Store generated insights
            self.generated_insights.extend(insights)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating dashboard insights: {str(e)}")
            return [{'error': f'Failed to generate insights: {str(e)}'}]
    
    def _generate_content_insights(self, analytics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate insights from content analytics.
        
        Args:
            analytics: Content analytics data
            
        Returns:
            List of content-related insights
        """
        insights = []
        
        total_content = analytics.get('total_content', 0)
        verified_content = analytics.get('verified_content', 0)
        deepfake_analyzed = analytics.get('deepfake_analyzed', 0)
        avg_verification = analytics.get('avg_verification_score', 0)
        avg_deepfake = analytics.get('avg_deepfake_probability', 0)
        
        # Insight: Content volume
        if total_content > 100:
            insights.append({
                'category': 'content_volume',
                'title': 'High Content Volume',
                'description': f'You have analyzed {total_content} pieces of content, indicating active usage of the platform.',
                'recommendation': 'Consider reviewing your most frequently analyzed content types to optimize your workflow.',
                'type': 'positive',
                'data_points': {'total_content': total_content}
            })
        
        # Insight: Verification rate
        if total_content > 0:
            verification_rate = (verified_content / total_content) * 100
            if verification_rate < 50:
                insights.append({
                    'category': 'verification_rate',
                    'title': 'Low Verification Rate',
                    'description': f'Only {verification_rate:.1f}% of your content has been verified. This may indicate a need for more consistent verification practices.',
                    'recommendation': 'Try to verify content more regularly to get better insights and maintain data quality.',
                    'type': 'improvement',
                    'data_points': {
                        'verified_content': verified_content,
                        'total_content': total_content,
                        'verification_rate': verification_rate
                    }
                })
        
        # Insight: Deepfake analysis
        if deepfake_analyzed > 0:
            deepfake_rate = (deepfake_analyzed / total_content) * 100 if total_content > 0 else 0
            if deepfake_rate > 30:
                insights.append({
                    'category': 'deepfake_analysis',
                    'title': 'High Deepfake Analysis Rate',
                    'description': f'{deepfake_rate:.1f}% of your content has deepfake analysis, suggesting you work with a lot of image/video content.',
                    'recommendation': 'Ensure you\'re using the latest deepfake detection models for optimal accuracy.',
                    'type': 'positive',
                    'data_points': {
                        'deepfake_analyzed': deepfake_analyzed,
                        'deepfake_rate': deepfake_rate
                    }
                })
        
        # Insight: Average verification score
        if avg_verification > 0:
            if avg_verification > 0.8:
                insights.append({
                    'category': 'verification_quality',
                    'title': 'High Quality Content',
                    'description': f'Your average verification score is {avg_verification:.2f}, indicating high quality content.',
                    'recommendation': 'Keep up the good work! Continue sharing reliable sources.',
                    'type': 'positive',
                    'data_points': {'avg_verification_score': avg_verification}
                })
            elif avg_verification < 0.4:
                insights.append({
                    'category': 'verification_quality',
                    'title': 'Content Quality Concern',
                    'description': f'Your average verification score is {avg_verification:.2f}, which is relatively low.',
                    'recommendation': 'Review your content sources and consider fact-checking more carefully.',
                    'type': 'warning',
                    'data_points': {'avg_verification_score': avg_verification}
                })
        
        # Insight: Content type distribution
        content_types = analytics.get('content_type_distribution', {})
        if content_types:
            most_common = max(content_types, key=content_types.get)
            if content_types[most_common] / sum(content_types.values()) > 0.7:
                insights.append({
                    'category': 'content_diversity',
                    'title': 'Content Type Focus',
                    'description': f'Most of your content ({most_common}) represents over 70% of your analysis.',
                    'recommendation': 'Consider diversifying your content types to get a more comprehensive view.',
                    'type': 'neutral',
                    'data_points': {'primary_content_type': most_common, 'distribution': content_types}
                })
        
        return insights
    
    def _generate_verification_insights(self, verification_summary: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate insights from verification summary.
        
        Args:
            verification_summary: Verification summary data
            
        Returns:
            List of verification-related insights
        """
        insights = []
        
        total_verified = verification_summary.get('total_verified', 0)
        highly_authentic = verification_summary.get('highly_authentic', 0)
        likely_authentic = verification_summary.get('likely_authentic', 0)
        uncertain = verification_summary.get('uncertain', 0)
        likely_misinformation = verification_summary.get('likely_misinformation', 0)
        highly_suspect = verification_summary.get('highly_suspect', 0)
        
        # Insight: Authentic content ratio
        if total_verified > 0:
            authentic_ratio = (highly_authentic + likely_authentic) / total_verified
            if authentic_ratio > 0.8:
                insights.append({
                    'category': 'authenticity',
                    'title': 'High Authenticity Rate',
                    'description': f'{authentic_ratio*100:.1f}% of your verified content is authentic or likely authentic.',
                    'recommendation': 'Your content curation is excellent. Continue maintaining these standards.',
                    'type': 'positive',
                    'data_points': {'authentic_ratio': authentic_ratio}
                })
            elif authentic_ratio < 0.3:
                insights.append({
                    'category': 'authenticity',
                    'title': 'Low Authenticity Concern',
                    'description': f'Only {authentic_ratio*100:.1f}% of your content is authentic, which may indicate a need for better source selection.',
                    'recommendation': 'Review your content sources and prioritize more reliable publishers.',
                    'type': 'warning',
                    'data_points': {'authentic_ratio': authentic_ratio}
                })
        
        # Insight: Misinformation detection
        if total_verified > 0:
            misinformation_ratio = (likely_misinformation + highly_suspect) / total_verified
            if misinformation_ratio > 0.2:
                insights.append({
                    'category': 'misinformation',
                    'title': 'Misinformation Detection',
                    'description': f'You\'ve identified {misinformation_ratio*100:.1f}% potential misinformation in your content.',
                    'recommendation': 'Consider sharing your findings with your network to help combat misinformation.',
                    'type': 'positive',
                    'data_points': {'misinformation_ratio': misinformation_ratio}
                })
        
        # Insight: Uncertain content
        if total_verified > 0:
            uncertain_ratio = uncertain / total_verified
            if uncertain_ratio > 0.4:
                insights.append({
                    'category': 'uncertainty',
                    'title': 'High Uncertainty Rate',
                    'description': f'{uncertain_ratio*100:.1f}% of your content falls into the uncertain category.',
                    'recommendation': 'Try to find additional sources or use more verification tools to reduce uncertainty.',
                    'type': 'improvement',
                    'data_points': {'uncertain_ratio': uncertain_ratio}
                })
        
        return insights
    
    def _generate_third_party_insights(self, third_party_stats: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate insights from third-party verification statistics.
        
        Args:
            third_party_stats: Third-party verification statistics
            
        Returns:
            List of third-party related insights
        """
        insights = []
        
        total_third_party = third_party_stats.get('total_third_party_verified', 0)
        service_breakdown = third_party_stats.get('service_breakdown', {})
        
        # Insight: Third-party usage
        if total_third_party > 0:
            insights.append({
                'category': 'third_party',
                'title': 'Third-Party Verification Active',
                'description': f'You\'ve used third-party verification services on {total_third_party} pieces of content.',
                'recommendation': 'Continue leveraging external fact-checking services for comprehensive verification.',
                'type': 'positive',
                'data_points': {'third_party_verifications': total_third_party}
            })
        
        # Insight: Service diversity
        if len(service_breakdown) > 1:
            insights.append({
                'category': 'service_diversity',
                'title': 'Multiple Verification Sources',
                'description': f'You\'re using {len(service_breakdown)} different fact-checking services, providing diverse perspectives.',
                'recommendation': 'Maintain this diversity to get well-rounded verification results.',
                'type': 'positive',
                'data_points': {'services_used': len(service_breakdown)}
            })
        elif len(service_breakdown) == 1:
            insights.append({
                'category': 'service_diversity',
                'title': 'Single Verification Source',
                'description': 'You\'re primarily using one fact-checking service.',
                'recommendation': 'Consider adding more verification sources to get multiple perspectives.',
                'type': 'improvement',
                'data_points': {'services_used': 1}
            })
        
        # Insight: Service performance
        for service, stats in service_breakdown.items():
            total = stats.get('total', 0)
            errors = stats.get('errors', 0)
            if total > 0:
                error_rate = errors / total
                if error_rate > 0.1:  # 10% error rate
                    insights.append({
                        'category': 'service_performance',
                        'title': 'Service Reliability Issue',
                        'description': f'The {service} verification service has a {error_rate*100:.1f}% error rate.',
                        'recommendation': 'Consider reducing reliance on this service or investigate connectivity issues.',
                        'type': 'warning',
                        'data_points': {'service': service, 'error_rate': error_rate}
                    })
        
        return insights
    
    def _generate_trend_insights(self, trends: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generate insights from trend data.
        
        Args:
            trends: Trend data
            
        Returns:
            List of trend-related insights
        """
        insights = []
        
        if not trends:
            return insights
        
        # Analyze recent trends (last 7 days)
        recent_trends = trends[-7:] if len(trends) >= 7 else trends
        
        if recent_trends:
            # Content volume trend
            content_counts = [t['content_count'] for t in recent_trends]
            if len(content_counts) >= 2:
                avg_recent = np.mean(content_counts[-3:])  # Last 3 days
                avg_previous = np.mean(content_counts[:-3]) if len(content_counts) > 3 else content_counts[0]
                
                if avg_recent > avg_previous * 1.5:
                    insights.append({
                        'category': 'trend_analysis',
                        'title': 'Increasing Activity',
                        'description': 'Your content analysis activity has increased significantly in the last few days.',
                        'recommendation': 'Keep up the momentum! This increased engagement is beneficial for staying informed.',
                        'type': 'positive',
                        'data_points': {'recent_average': avg_recent, 'previous_average': avg_previous}
                    })
                elif avg_recent < avg_previous * 0.5:
                    insights.append({
                        'category': 'trend_analysis',
                        'title': 'Decreasing Activity',
                        'description': 'Your content analysis activity has decreased recently.',
                        'recommendation': 'Try to maintain consistent verification habits to get the most value from the platform.',
                        'type': 'improvement',
                        'data_points': {'recent_average': avg_recent, 'previous_average': avg_previous}
                    })
        
        return insights
    
    def _calculate_insight_priority(self, insight: Dict[str, Any]) -> str:
        """
        Calculate priority for an insight based on its type and impact.
        
        Args:
            insight: Insight dictionary
            
        Returns:
            Priority level (high, medium, low)
        """
        insight_type = insight.get('type', 'neutral')
        category = insight.get('category', '')
        
        # High priority for warnings and critical improvements
        if insight_type == 'warning':
            return 'high'
        elif insight_type == 'improvement':
            return 'medium'
        elif insight_type == 'positive':
            return 'low'
        else:
            return 'medium'
    
    def _load_insight_templates(self) -> Dict[str, Any]:
        """
        Load insight templates for different scenarios.
        
        Returns:
            Dictionary with insight templates
        """
        return {
            'content_volume': {
                'high': 'You have analyzed {count} pieces of content, indicating active platform usage.',
                'low': 'Consider analyzing more content to get better insights and maintain data quality.'
            },
            'verification_rate': {
                'low': 'Only {rate}% of your content has been verified. Try to verify content more regularly.',
                'good': 'Your verification rate of {rate}% is excellent. Keep up the good work!'
            }
        }
    
    def get_personalized_recommendations(self, user_profile: Dict[str, Any], analytics_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate personalized recommendations based on user profile and analytics.
        
        Args:
            user_profile: User profile data
            analytics_data: Analytics data
            
        Returns:
            List of personalized recommendations
        """
        recommendations = []
        
        # This would be expanded based on user profile data
        # For now, we'll generate general recommendations
        recommendations.append({
            'category': 'general',
            'title': 'Platform Engagement',
            'description': 'Based on your usage patterns, we recommend exploring advanced features.',
            'recommendation': 'Check out the predictive analytics and trend analysis features to get deeper insights.',
            'type': 'suggestion',
            'priority': 'medium'
        })
        
        return recommendations
    
    def get_insight_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get history of generated insights.
        
        Args:
            limit: Maximum number of insights to return
            
        Returns:
            List of previously generated insights
        """
        return self.generated_insights[-limit:] if self.generated_insights else []
    
    def clear_insight_history(self):
        """Clear the insight history."""
        self.generated_insights.clear()


# Global instance
insights_generator = InsightsGenerator()