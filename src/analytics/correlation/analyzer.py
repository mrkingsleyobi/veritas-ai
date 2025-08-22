"""
Correlation analysis module for VeritasAI.
"""
from typing import Dict, Any, List, Optional
import numpy as np
from scipy import stats
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import logging

logger = logging.getLogger(__name__)


class CorrelationAnalyzer:
    """Analyze correlations between different metrics in the system."""
    
    def __init__(self):
        """Initialize the correlation analyzer."""
        self.correlation_matrix = {}
        self.pca_model = None
        self.scaler = StandardScaler()
    
    def analyze_metric_correlations(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze correlations between different metrics.
        
        Args:
            data: List of data points with various metrics
            
        Returns:
            Dictionary with correlation analysis results
        """
        if not data:
            return {'error': 'No data provided'}
        
        try:
            # Extract metrics
            metrics_data = self._extract_metrics(data)
            
            if not metrics_data:
                return {'error': 'No valid metrics found in data'}
            
            # Calculate correlation matrix
            correlation_matrix = self._calculate_correlation_matrix(metrics_data)
            
            # Identify strong correlations
            strong_correlations = self._identify_strong_correlations(correlation_matrix)
            
            # Perform PCA analysis
            pca_results = self._perform_pca_analysis(metrics_data)
            
            # Calculate partial correlations
            partial_correlations = self._calculate_partial_correlations(metrics_data)
            
            analysis_results = {
                'correlation_matrix': correlation_matrix,
                'strong_correlations': strong_correlations,
                'pca_analysis': pca_results,
                'partial_correlations': partial_correlations,
                'total_data_points': len(data),
                'analyzed_metrics': list(metrics_data.keys()),
                'generated_at': self._get_current_timestamp()
            }
            
            self.correlation_matrix = correlation_matrix
            
            return analysis_results
            
        except Exception as e:
            logger.error(f"Error analyzing correlations: {str(e)}")
            return {'error': f'Failed to analyze correlations: {str(e)}'}
    
    def _extract_metrics(self, data: List[Dict[str, Any]]) -> Dict[str, List[float]]:
        """
        Extract metrics from data points.
        
        Args:
            data: List of data points
            
        Returns:
            Dictionary with metric names and their values
        """
        metrics = {}
        
        # Define metrics to extract
        metric_fields = [
            'content_count',
            'avg_verification_score',
            'avg_deepfake_probability',
            'third_party_verifications',
            'highly_authentic',
            'likely_authentic',
            'uncertain',
            'likely_misinformation',
            'highly_suspect'
        ]
        
        # Extract values for each metric
        for field in metric_fields:
            values = []
            for point in data:
                if field in point:
                    values.append(float(point[field]))
                elif 'analytics' in point and field in point['analytics']:
                    values.append(float(point['analytics'][field]))
                elif 'verification_summary' in point and field in point['verification_summary']:
                    values.append(float(point['verification_summary'][field]))
            
            if values:
                metrics[field] = values
        
        return metrics
    
    def _calculate_correlation_matrix(self, metrics_data: Dict[str, List[float]]) -> Dict[str, Any]:
        """
        Calculate correlation matrix for metrics.
        
        Args:
            metrics_data: Dictionary with metric names and values
            
        Returns:
            Dictionary with correlation matrix
        """
        metric_names = list(metrics_data.keys())
        n_metrics = len(metric_names)
        
        # Initialize correlation matrix
        correlation_matrix = np.zeros((n_metrics, n_metrics))
        p_values = np.zeros((n_metrics, n_metrics))
        
        # Calculate correlations between all pairs
        for i in range(n_metrics):
            for j in range(n_metrics):
                if i == j:
                    correlation_matrix[i, j] = 1.0
                    p_values[i, j] = 0.0
                else:
                    # Calculate Pearson correlation
                    corr, p_val = stats.pearsonr(metrics_data[metric_names[i]], metrics_data[metric_names[j]])
                    correlation_matrix[i, j] = corr
                    p_values[i, j] = p_val
        
        # Convert to dictionary format
        correlation_dict = {}
        for i, metric1 in enumerate(metric_names):
            correlation_dict[metric1] = {}
            for j, metric2 in enumerate(metric_names):
                correlation_dict[metric1][metric2] = {
                    'correlation': float(correlation_matrix[i, j]),
                    'p_value': float(p_values[i, j])
                }
        
        return {
            'matrix': correlation_dict,
            'method': 'pearson',
            'metric_names': metric_names
        }
    
    def _identify_strong_correlations(self, correlation_matrix: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Identify strong correlations from correlation matrix.
        
        Args:
            correlation_matrix: Correlation matrix dictionary
            
        Returns:
            List of strong correlations
        """
        strong_correlations = []
        matrix = correlation_matrix['matrix']
        metric_names = correlation_matrix['metric_names']
        
        # Threshold for "strong" correlation
        strong_threshold = 0.7
        weak_threshold = 0.3
        
        for i, metric1 in enumerate(metric_names):
            for j, metric2 in enumerate(metric_names):
                if i < j:  # Avoid duplicates and self-correlations
                    corr_info = matrix[metric1][metric2]
                    correlation = corr_info['correlation']
                    p_value = corr_info['p_value']
                    
                    # Check if correlation is statistically significant (p < 0.05)
                    if p_value < 0.05:
                        if abs(correlation) >= strong_threshold:
                            strength = 'very_strong' if abs(correlation) >= 0.9 else 'strong'
                            correlation_type = 'positive' if correlation > 0 else 'negative'
                            
                            strong_correlations.append({
                                'metric1': metric1,
                                'metric2': metric2,
                                'correlation': correlation,
                                'p_value': p_value,
                                'strength': strength,
                                'type': correlation_type,
                                'interpretation': self._interpret_correlation(correlation, correlation_type)
                            })
                        elif abs(correlation) >= weak_threshold:
                            correlation_type = 'positive' if correlation > 0 else 'negative'
                            
                            strong_correlations.append({
                                'metric1': metric1,
                                'metric2': metric2,
                                'correlation': correlation,
                                'p_value': p_value,
                                'strength': 'moderate',
                                'type': correlation_type,
                                'interpretation': self._interpret_correlation(correlation, correlation_type)
                            })
        
        return strong_correlations
    
    def _interpret_correlation(self, correlation: float, correlation_type: str) -> str:
        """
        Provide interpretation of correlation value.
        
        Args:
            correlation: Correlation coefficient
            correlation_type: Type of correlation (positive/negative)
            
        Returns:
            Interpretation string
        """
        abs_corr = abs(correlation)
        
        if abs_corr >= 0.9:
            strength_desc = "very strong"
        elif abs_corr >= 0.7:
            strength_desc = "strong"
        elif abs_corr >= 0.5:
            strength_desc = "moderate"
        elif abs_corr >= 0.3:
            strength_desc = "weak"
        else:
            strength_desc = "very weak"
        
        if correlation_type == 'positive':
            return f"There is a {strength_desc} positive relationship between these metrics"
        else:
            return f"There is a {strength_desc} negative relationship between these metrics"
    
    def _perform_pca_analysis(self, metrics_data: Dict[str, List[float]]) -> Dict[str, Any]:
        """
        Perform Principal Component Analysis on metrics.
        
        Args:
            metrics_data: Dictionary with metric names and values
            
        Returns:
            Dictionary with PCA results
        """
        try:
            # Prepare data matrix
            metric_names = list(metrics_data.keys())
            data_matrix = np.array([metrics_data[name] for name in metric_names]).T
            
            # Standardize the data
            data_scaled = self.scaler.fit_transform(data_matrix)
            
            # Perform PCA
            self.pca_model = PCA()
            pca_result = self.pca_model.fit(data_scaled)
            
            # Calculate explained variance
            explained_variance_ratio = pca_result.explained_variance_ratio_
            cumulative_variance = np.cumsum(explained_variance_ratio)
            
            # Get component loadings
            components = pca_result.components_
            
            # Identify which metrics contribute most to each component
            top_contributors = []
            for i, component in enumerate(components):
                # Get absolute values and sort
                abs_component = np.abs(component)
                sorted_indices = np.argsort(abs_component)[::-1]
                
                top_metrics = [
                    {
                        'metric': metric_names[idx],
                        'contribution': float(component[idx]),
                        'absolute_contribution': float(abs_component[idx])
                    }
                    for idx in sorted_indices[:3]  # Top 3 contributors
                ]
                
                top_contributors.append({
                    'component': i + 1,
                    'explained_variance_ratio': float(explained_variance_ratio[i]),
                    'cumulative_variance': float(cumulative_variance[i]),
                    'top_contributors': top_metrics
                })
            
            return {
                'n_components': len(explained_variance_ratio),
                'explained_variance_ratios': [float(x) for x in explained_variance_ratio],
                'cumulative_variance': [float(x) for x in cumulative_variance],
                'top_contributors': top_contributors,
                'method': 'pca'
            }
            
        except Exception as e:
            logger.error(f"Error performing PCA analysis: {str(e)}")
            return {'error': f'Failed to perform PCA analysis: {str(e)}'}
    
    def _calculate_partial_correlations(self, metrics_data: Dict[str, List[float]]) -> Dict[str, Any]:
        """
        Calculate partial correlations between metrics.
        
        Args:
            metrics_data: Dictionary with metric names and values
            
        Returns:
            Dictionary with partial correlation results
        """
        # This is a simplified implementation
        # In a real system, you would implement proper partial correlation calculation
        return {
            'method': 'placeholder',
            'note': 'Partial correlation analysis would be implemented in a full version'
        }
    
    def _get_current_timestamp(self) -> str:
        """
        Get current timestamp in ISO format.
        
        Returns:
            ISO formatted timestamp string
        """
        from datetime import datetime
        return datetime.now().isoformat()
    
    def get_correlation_insights(self) -> List[Dict[str, Any]]:
        """
        Generate insights from correlation analysis.
        
        Returns:
            List of correlation insights
        """
        if not self.correlation_matrix:
            return [{'error': 'No correlation analysis performed yet'}]
        
        insights = []
        matrix = self.correlation_matrix['matrix']
        strong_correlations = self._identify_strong_correlations(self.correlation_matrix)
        
        # Generate business insights
        for corr in strong_correlations:
            if corr['strength'] in ['strong', 'very_strong']:
                insights.append({
                    'type': 'strong_correlation',
                    'metrics': [corr['metric1'], corr['metric2']],
                    'correlation': corr['correlation'],
                    'insight': f"Strong {corr['type']} correlation ({corr['correlation']:.2f}) between {corr['metric1']} and {corr['metric2']}",
                    'recommendation': self._generate_recommendation(corr)
                })
        
        # Add general insights
        insights.extend(self._generate_general_insights())
        
        return insights
    
    def _generate_recommendation(self, correlation: Dict[str, Any]) -> str:
        """
        Generate recommendation based on correlation.
        
        Args:
            correlation: Correlation information
            
        Returns:
            Recommendation string
        """
        metric1, metric2 = correlation['metric1'], correlation['metric2']
        corr_value = correlation['correlation']
        corr_type = correlation['type']
        
        if corr_type == 'positive':
            return f"Consider monitoring {metric1} and {metric2} together as they tend to move in the same direction"
        else:
            return f"Note that {metric1} and {metric2} tend to move in opposite directions, which may indicate a trade-off"
    
    def _generate_general_insights(self) -> List[Dict[str, Any]]:
        """
        Generate general insights from correlation analysis.
        
        Returns:
            List of general insights
        """
        return [
            {
                'type': 'methodology',
                'insight': "Correlation analysis helps identify relationships between different metrics",
                'recommendation': "Use these insights to understand which metrics move together and which are independent"
            },
            {
                'type': 'caution',
                'insight': "Correlation does not imply causation",
                'recommendation': "Further investigation is needed to understand the underlying reasons for observed correlations"
            }
        ]


# Global instance
correlation_analyzer = CorrelationAnalyzer()