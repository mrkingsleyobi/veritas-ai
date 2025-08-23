"""
Tests for advanced analytics modules.
"""
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta
import numpy as np

from src.analytics.predictive.model import PredictiveAnalyticsModel
from src.analytics.trends.analyzer import TrendsAnalyzer
from src.analytics.correlation.analyzer import CorrelationAnalyzer
from src.analytics.insights.generator import InsightsGenerator


@pytest.fixture
def predictive_model():
    """Create a predictive analytics model for testing."""
    return PredictiveAnalyticsModel()


@pytest.fixture
def trends_analyzer():
    """Create a trends analyzer for testing."""
    return TrendsAnalyzer()


@pytest.fixture
def correlation_analyzer():
    """Create a correlation analyzer for testing."""
    return CorrelationAnalyzer()


@pytest.fixture
def insights_generator():
    """Create an insights generator for testing."""
    return InsightsGenerator()


def test_predictive_model_initialization(predictive_model):
    """Test that the predictive model initializes correctly."""
    assert predictive_model is not None
    assert not predictive_model.is_trained
    assert len(predictive_model.models) == 2
    assert 'linear_regression' in predictive_model.models
    assert 'random_forest' in predictive_model.models


def test_predictive_model_training(predictive_model):
    """Test predictive model training."""
    # Create mock historical data
    historical_data = [
        {
            'content_count': 10,
            'avg_verification_score': 0.8,
            'avg_deepfake_probability': 0.1,
            'third_party_verifications': 5,
            'timestamp': datetime.now().isoformat()
        },
        {
            'content_count': 15,
            'avg_verification_score': 0.75,
            'avg_deepfake_probability': 0.15,
            'third_party_verifications': 7,
            'timestamp': (datetime.now() - timedelta(days=1)).isoformat()
        },
        {
            'content_count': 12,
            'avg_verification_score': 0.85,
            'avg_deepfake_probability': 0.05,
            'third_party_verifications': 3,
            'timestamp': (datetime.now() - timedelta(days=2)).isoformat()
        }
    ]
    
    # Train model
    result = predictive_model.train_model(historical_data, 'content_count')
    
    assert 'success' in result
    assert result['success'] is True
    assert 'models_trained' in result
    assert len(result['models_trained']) == 2
    assert predictive_model.is_trained


def test_predictive_model_prediction(predictive_model):
    """Test predictive model prediction."""
    # First train the model
    historical_data = [
        {
            'content_count': 10,
            'avg_verification_score': 0.8,
            'avg_deepfake_probability': 0.1,
            'third_party_verifications': 5,
            'timestamp': datetime.now().isoformat()
        },
        {
            'content_count': 15,
            'avg_verification_score': 0.75,
            'avg_deepfake_probability': 0.15,
            'third_party_verifications': 7,
            'timestamp': (datetime.now() - timedelta(days=1)).isoformat()
        }
    ]
    
    predictive_model.train_model(historical_data, 'content_count')
    
    # Make prediction
    input_features = {
        'content_count': 12,
        'avg_verification_score': 0.82,
        'avg_deepfake_probability': 0.12,
        'third_party_verifications': 6,
        'timestamp': datetime.now().isoformat()
    }
    
    result = predictive_model.predict(input_features, 'random_forest')
    
    assert 'prediction' in result
    assert 'model_used' in result
    assert isinstance(result['prediction'], float)
    assert result['model_used'] == 'random_forest'


def test_trends_analyzer_initialization(trends_analyzer):
    """Test that the trends analyzer initializes correctly."""
    assert trends_analyzer is not None
    assert trends_analyzer.trend_patterns == {}


def test_trends_analyzer_content_trends(trends_analyzer):
    """Test content trends analysis."""
    # Create mock trend data
    trend_data = [
        {
            'date': (datetime.now() - timedelta(days=6)).date().isoformat(),
            'content_count': 5,
            'avg_verification_score': 0.8,
            'avg_deepfake_probability': 0.1
        },
        {
            'date': (datetime.now() - timedelta(days=5)).date().isoformat(),
            'content_count': 8,
            'avg_verification_score': 0.75,
            'avg_deepfake_probability': 0.15
        },
        {
            'date': (datetime.now() - timedelta(days=4)).date().isoformat(),
            'content_count': 12,
            'avg_verification_score': 0.85,
            'avg_deepfake_probability': 0.05
        },
        {
            'date': (datetime.now() - timedelta(days=3)).date().isoformat(),
            'content_count': 15,
            'avg_verification_score': 0.9,
            'avg_deepfake_probability': 0.02
        },
        {
            'date': (datetime.now() - timedelta(days=2)).date().isoformat(),
            'content_count': 18,
            'avg_verification_score': 0.88,
            'avg_deepfake_probability': 0.03
        },
        {
            'date': (datetime.now() - timedelta(days=1)).date().isoformat(),
            'content_count': 20,
            'avg_verification_score': 0.92,
            'avg_deepfake_probability': 0.01
        },
        {
            'date': datetime.now().date().isoformat(),
            'content_count': 22,
            'avg_verification_score': 0.95,
            'avg_deepfake_probability': 0.01
        }
    ]
    
    # Analyze trends
    result = trends_analyzer.analyze_content_trends(trend_data)
    
    assert 'content_trend' in result
    assert 'verification_trend' in result
    assert 'deepfake_trend' in result
    assert 'total_data_points' in result
    assert result['total_data_points'] == 7


def test_correlation_analyzer_initialization(correlation_analyzer):
    """Test that the correlation analyzer initializes correctly."""
    assert correlation_analyzer is not None
    assert correlation_analyzer.correlation_matrix == {}


def test_correlation_analyzer_metric_correlations(correlation_analyzer):
    """Test metric correlations analysis."""
    # Create mock data
    data = [
        {
            'content_count': 10,
            'avg_verification_score': 0.8,
            'avg_deepfake_probability': 0.1,
            'third_party_verifications': 5,
            'analytics': {
                'highly_authentic': 3,
                'likely_authentic': 4,
                'uncertain': 2,
                'likely_misinformation': 1,
                'highly_suspect': 0
            }
        },
        {
            'content_count': 15,
            'avg_verification_score': 0.75,
            'avg_deepfake_probability': 0.15,
            'third_party_verifications': 7,
            'analytics': {
                'highly_authentic': 4,
                'likely_authentic': 6,
                'uncertain': 3,
                'likely_misinformation': 2,
                'highly_suspect': 0
            }
        },
        {
            'content_count': 12,
            'avg_verification_score': 0.85,
            'avg_deepfake_probability': 0.05,
            'third_party_verifications': 3,
            'analytics': {
                'highly_authentic': 5,
                'likely_authentic': 4,
                'uncertain': 2,
                'likely_misinformation': 1,
                'highly_suspect': 0
            }
        }
    ]
    
    # Analyze correlations
    result = correlation_analyzer.analyze_metric_correlations(data)
    
    assert 'correlation_matrix' in result
    assert 'strong_correlations' in result
    assert 'total_data_points' in result
    assert result['total_data_points'] == 3


def test_insights_generator_initialization(insights_generator):
    """Test that the insights generator initializes correctly."""
    assert insights_generator is not None
    assert isinstance(insights_generator.generated_insights, list)
    assert len(insights_generator.generated_insights) == 0


def test_insights_generator_content_insights(insights_generator):
    """Test content insights generation."""
    # Create mock analytics data
    analytics_data = {
        'analytics': {
            'total_content': 150,
            'verified_content': 120,
            'deepfake_analyzed': 45,
            'avg_verification_score': 0.85,
            'avg_deepfake_probability': 0.12,
            'content_type_distribution': {
                'text/plain': 80,
                'image/jpeg': 50,
                'video/mp4': 20
            }
        },
        'verification_summary': {
            'total_verified': 120,
            'highly_authentic': 45,
            'likely_authentic': 50,
            'uncertain': 15,
            'likely_misinformation': 8,
            'highly_suspect': 2
        },
        'third_party_stats': {
            'total_third_party_verified': 30,
            'service_breakdown': {
                'snopes': {
                    'total': 15,
                    'verified_true': 10,
                    'verified_false': 3,
                    'verified_mixed': 2,
                    'errors': 0
                },
                'factcheck_org': {
                    'total': 15,
                    'verified_true': 8,
                    'verified_false': 5,
                    'verified_mixed': 2,
                    'errors': 1
                }
            }
        },
        'trends': [
            {
                'date': (datetime.now() - timedelta(days=2)).date().isoformat(),
                'content_count': 20,
                'avg_verification_score': 0.8,
                'avg_deepfake_probability': 0.15
            },
            {
                'date': (datetime.now() - timedelta(days=1)).date().isoformat(),
                'content_count': 25,
                'avg_verification_score': 0.85,
                'avg_deepfake_probability': 0.1
            },
            {
                'date': datetime.now().date().isoformat(),
                'content_count': 30,
                'avg_verification_score': 0.9,
                'avg_deepfake_probability': 0.05
            }
        ]
    }
    
    # Generate insights
    insights = insights_generator.generate_dashboard_insights(analytics_data)
    
    assert isinstance(insights, list)
    assert len(insights) > 0
    # Check that insights have required fields
    for insight in insights:
        assert 'category' in insight
        assert 'title' in insight
        assert 'description' in insight
        assert 'generated_at' in insight


def test_insights_generator_insight_history(insights_generator):
    """Test insight history management."""
    # Generate some insights
    mock_analytics_data = {
        'analytics': {
            'total_content': 50,
            'verified_content': 40,
            'avg_verification_score': 0.8
        },
        'verification_summary': {
            'total_verified': 40,
            'highly_authentic': 20,
            'likely_authentic': 15,
            'uncertain': 3,
            'likely_misinformation': 2,
            'highly_suspect': 0
        },
        'third_party_stats': {
            'total_third_party_verified': 10,
            'service_breakdown': {}
        },
        'trends': []
    }
    
    insights = insights_generator.generate_dashboard_insights(mock_analytics_data)
    
    # Check history
    history = insights_generator.get_insight_history()
    assert isinstance(history, list)
    assert len(history) >= len(insights)
    
    # Clear history
    insights_generator.clear_insight_history()
    cleared_history = insights_generator.get_insight_history()
    assert len(cleared_history) == 0