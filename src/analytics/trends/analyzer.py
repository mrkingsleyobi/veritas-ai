"""
Trends analysis module for VeritasAI.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import numpy as np
from scipy import stats
import logging

logger = logging.getLogger(__name__)


class TrendsAnalyzer:
    """Analyze trends in content verification data."""
    
    def __init__(self):
        """Initialize the trends analyzer."""
        self.trend_patterns = {}
    
    def analyze_content_trends(self, trend_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze content verification trends over time.
        
        Args:
            trend_data: List of trend data points
            
        Returns:
            Dictionary with trend analysis results
        """
        if not trend_data:
            return {'error': 'No trend data provided'}
        
        try:
            # Extract time series data
            dates = [datetime.fromisoformat(point['date']) for point in trend_data]
            content_counts = [point['content_count'] for point in trend_data]
            verification_scores = [point['avg_verification_score'] for point in trend_data]
            deepfake_probs = [point['avg_deepfake_probability'] for point in trend_data]
            
            # Calculate trends
            content_trend = self._calculate_trend(content_counts, dates, 'content_count')
            verification_trend = self._calculate_trend(verification_scores, dates, 'verification_score')
            deepfake_trend = self._calculate_trend(deepfake_probs, dates, 'deepfake_probability')
            
            # Identify patterns
            patterns = self._identify_patterns(trend_data)
            
            # Calculate correlations
            correlations = self._calculate_correlations(trend_data)
            
            # Detect anomalies
            anomalies = self._detect_anomalies(trend_data)
            
            analysis_results = {
                'content_trend': content_trend,
                'verification_trend': verification_trend,
                'deepfake_trend': deepfake_trend,
                'patterns': patterns,
                'correlations': correlations,
                'anomalies': anomalies,
                'total_data_points': len(trend_data),
                'analysis_period': {
                    'start_date': min(dates).isoformat() if dates else None,
                    'end_date': max(dates).isoformat() if dates else None
                },
                'generated_at': datetime.now().isoformat()
            }
            
            # Store trend patterns for future reference
            self.trend_patterns = analysis_results
            
            return analysis_results
            
        except Exception as e:
            logger.error(f"Error analyzing trends: {str(e)}")
            return {'error': f'Failed to analyze trends: {str(e)}'}
    
    def _calculate_trend(self, values: List[float], dates: List[datetime], metric_name: str) -> Dict[str, Any]:
        """
        Calculate trend for a time series.
        
        Args:
            values: List of values
            dates: List of corresponding dates
            metric_name: Name of the metric
            
        Returns:
            Dictionary with trend analysis
        """
        if len(values) < 2:
            return {
                'trend_direction': 'insufficient_data',
                'slope': 0,
                'r_squared': 0,
                'average_value': np.mean(values) if values else 0,
                'metric_name': metric_name
            }
        
        # Convert dates to numeric values (days since start)
        date_nums = [(date - dates[0]).days for date in dates]
        
        # Calculate linear regression
        slope, intercept, r_value, p_value, std_err = stats.linregress(date_nums, values)
        
        # Determine trend direction
        if abs(slope) < 0.01:  # Nearly flat
            trend_direction = 'stable'
        elif slope > 0:
            trend_direction = 'increasing'
        else:
            trend_direction = 'decreasing'
        
        return {
            'trend_direction': trend_direction,
            'slope': float(slope),
            'r_squared': float(r_value ** 2),
            'p_value': float(p_value),
            'standard_error': float(std_err),
            'average_value': float(np.mean(values)),
            'min_value': float(np.min(values)),
            'max_value': float(np.max(values)),
            'metric_name': metric_name
        }
    
    def _identify_patterns(self, trend_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Identify patterns in trend data.
        
        Args:
            trend_data: List of trend data points
            
        Returns:
            List of identified patterns
        """
        patterns = []
        
        # Check for cyclical patterns (weekly patterns)
        if len(trend_data) >= 14:  # Need at least 2 weeks of data
            weekly_pattern = self._check_weekly_pattern(trend_data)
            if weekly_pattern:
                patterns.append(weekly_pattern)
        
        # Check for seasonal patterns
        seasonal_pattern = self._check_seasonal_pattern(trend_data)
        if seasonal_pattern:
            patterns.append(seasonal_pattern)
        
        # Check for growth patterns
        growth_pattern = self._check_growth_pattern(trend_data)
        if growth_pattern:
            patterns.append(growth_pattern)
        
        return patterns
    
    def _check_weekly_pattern(self, trend_data: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """
        Check for weekly patterns in data.
        
        Args:
            trend_data: List of trend data points
            
        Returns:
            Dictionary with weekly pattern or None
        """
        # Group data by day of week
        day_groups = {}
        for point in trend_data:
            date = datetime.fromisoformat(point['date'])
            day_of_week = date.weekday()
            if day_of_week not in day_groups:
                day_groups[day_of_week] = []
            day_groups[day_of_week].append(point['content_count'])
        
        # Calculate average for each day
        day_averages = {}
        for day, counts in day_groups.items():
            day_averages[day] = np.mean(counts)
        
        # Check if there's significant variation
        if day_averages:
            avg_values = list(day_averages.values())
            variation = np.std(avg_values) / np.mean(avg_values) if np.mean(avg_values) > 0 else 0
            
            if variation > 0.2:  # 20% coefficient of variation indicates pattern
                busiest_day = max(day_averages, key=day_averages.get)
                slowest_day = min(day_averages, key=day_averages.get)
                
                return {
                    'type': 'weekly_pattern',
                    'busiest_day': busiest_day,
                    'slowest_day': slowest_day,
                    'variation_coefficient': float(variation),
                    'day_averages': {str(k): float(v) for k, v in day_averages.items()}
                }
        
        return None
    
    def _check_seasonal_pattern(self, trend_data: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """
        Check for seasonal patterns in data.
        
        Args:
            trend_data: List of trend data points
            
        Returns:
            Dictionary with seasonal pattern or None
        """
        # Group data by month
        month_groups = {}
        for point in trend_data:
            date = datetime.fromisoformat(point['date'])
            month = date.month
            if month not in month_groups:
                month_groups[month] = []
            month_groups[month].append(point['content_count'])
        
        # Calculate average for each month
        month_averages = {}
        for month, counts in month_groups.items():
            month_averages[month] = np.mean(counts)
        
        # Check if there's significant variation
        if month_averages:
            avg_values = list(month_averages.values())
            variation = np.std(avg_values) / np.mean(avg_values) if np.mean(avg_values) > 0 else 0
            
            if variation > 0.3:  # 30% coefficient of variation indicates seasonal pattern
                peak_month = max(month_averages, key=month_averages.get)
                low_month = min(month_averages, key=month_averages.get)
                
                return {
                    'type': 'seasonal_pattern',
                    'peak_month': peak_month,
                    'low_month': low_month,
                    'variation_coefficient': float(variation),
                    'month_averages': {str(k): float(v) for k, v in month_averages.items()}
                }
        
        return None
    
    def _check_growth_pattern(self, trend_data: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """
        Check for growth patterns in data.
        
        Args:
            trend_data: List of trend data points
            
        Returns:
            Dictionary with growth pattern or None
        """
        if len(trend_data) < 10:
            return None
        
        # Calculate growth rate over time
        content_counts = [point['content_count'] for point in trend_data]
        dates = [datetime.fromisoformat(point['date']) for point in trend_data]
        
        # Calculate overall growth rate
        if content_counts[0] > 0:
            overall_growth = (content_counts[-1] - content_counts[0]) / content_counts[0]
            
            if overall_growth > 0.5:  # 50% growth indicates significant growth pattern
                return {
                    'type': 'growth_pattern',
                    'overall_growth_rate': float(overall_growth),
                    'start_value': content_counts[0],
                    'end_value': content_counts[-1],
                    'period_days': (dates[-1] - dates[0]).days
                }
        
        return None
    
    def _calculate_correlations(self, trend_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate correlations between different metrics.
        
        Args:
            trend_data: List of trend data points
            
        Returns:
            Dictionary with correlation analysis
        """
        if len(trend_data) < 3:
            return {'error': 'Insufficient data for correlation analysis'}
        
        # Extract metric arrays
        content_counts = np.array([point['content_count'] for point in trend_data])
        verification_scores = np.array([point['avg_verification_score'] for point in trend_data])
        deepfake_probs = np.array([point['avg_deepfake_probability'] for point in trend_data])
        
        # Calculate correlations
        try:
            corr_content_verification = np.corrcoef(content_counts, verification_scores)[0, 1]
            corr_content_deepfake = np.corrcoef(content_counts, deepfake_probs)[0, 1]
            corr_verification_deepfake = np.corrcoef(verification_scores, deepfake_probs)[0, 1]
            
            return {
                'content_vs_verification': float(corr_content_verification),
                'content_vs_deepfake': float(corr_content_deepfake),
                'verification_vs_deepfake': float(corr_verification_deepfake),
                'correlation_method': 'pearson'
            }
        except Exception as e:
            logger.error(f"Error calculating correlations: {str(e)}")
            return {'error': f'Failed to calculate correlations: {str(e)}'}
    
    def _detect_anomalies(self, trend_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Detect anomalies in trend data.
        
        Args:
            trend_data: List of trend data points
            
        Returns:
            List of detected anomalies
        """
        anomalies = []
        
        # Detect anomalies in content counts using z-score
        content_counts = [point['content_count'] for point in trend_data]
        if len(content_counts) >= 5:
            mean_count = np.mean(content_counts)
            std_count = np.std(content_counts)
            
            if std_count > 0:
                for i, point in enumerate(trend_data):
                    z_score = abs((point['content_count'] - mean_count) / std_count)
                    if z_score > 2:  # Z-score > 2 indicates anomaly
                        anomalies.append({
                            'date': point['date'],
                            'metric': 'content_count',
                            'value': point['content_count'],
                            'z_score': float(z_score),
                            'type': 'statistical_anomaly'
                        })
        
        # Detect anomalies in verification scores
        verification_scores = [point['avg_verification_score'] for point in trend_data]
        if len(verification_scores) >= 5:
            mean_score = np.mean(verification_scores)
            std_score = np.std(verification_scores)
            
            if std_score > 0:
                for i, point in enumerate(trend_data):
                    z_score = abs((point['avg_verification_score'] - mean_score) / std_score)
                    if z_score > 2:  # Z-score > 2 indicates anomaly
                        anomalies.append({
                            'date': point['date'],
                            'metric': 'verification_score',
                            'value': point['avg_verification_score'],
                            'z_score': float(z_score),
                            'type': 'statistical_anomaly'
                        })
        
        return anomalies
    
    def get_trend_patterns(self) -> Dict[str, Any]:
        """
        Get stored trend patterns.
        
        Returns:
            Dictionary with trend patterns
        """
        return self.trend_patterns
    
    def compare_trends(self, current_trends: Dict[str, Any], historical_trends: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compare current trends with historical trends.
        
        Args:
            current_trends: Current trend analysis
            historical_trends: Historical trend analysis
            
        Returns:
            Dictionary with trend comparison
        """
        comparison = {}
        
        # Compare content trends
        if 'content_trend' in current_trends and 'content_trend' in historical_trends:
            current_slope = current_trends['content_trend']['slope']
            historical_slope = historical_trends['content_trend']['slope']
            
            comparison['content_trend_change'] = {
                'current_slope': current_slope,
                'historical_slope': historical_slope,
                'slope_difference': current_slope - historical_slope,
                'percentage_change': ((current_slope - historical_slope) / historical_slope * 100) if historical_slope != 0 else 0
            }
        
        # Compare verification trends
        if 'verification_trend' in current_trends and 'verification_trend' in historical_trends:
            current_slope = current_trends['verification_trend']['slope']
            historical_slope = historical_trends['verification_trend']['slope']
            
            comparison['verification_trend_change'] = {
                'current_slope': current_slope,
                'historical_slope': historical_slope,
                'slope_difference': current_slope - historical_slope,
                'percentage_change': ((current_slope - historical_slope) / historical_slope * 100) if historical_slope != 0 else 0
            }
        
        return comparison


# Global instance
trends_analyzer = TrendsAnalyzer()