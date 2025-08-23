"""
Tests for enhanced dashboard components.
"""
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime
import json

from src.dashboard.components.charts import ChartGenerator
from src.dashboard.enhanced_service import EnhancedDashboardService


@pytest.fixture
def chart_generator():
    """Create a chart generator for testing."""
    return ChartGenerator()


@pytest.fixture
def enhanced_dashboard_service():
    """Create an enhanced dashboard service for testing."""
    return EnhancedDashboardService()


def test_chart_generator_line_chart(chart_generator):
    """Test generating a line chart."""
    # Test data
    data = [
        {"date": "2023-01-01", "value": 10},
        {"date": "2023-01-02", "value": 15},
        {"date": "2023-01-03", "value": 12}
    ]
    
    # Generate chart
    chart = chart_generator.generate_time_series_chart(
        data, "date", ["value"], "Test Line Chart", "line"
    )
    
    # Assertions
    assert chart["type"] == "line"
    assert "data" in chart
    assert "options" in chart
    assert len(chart["data"]["labels"]) == 3
    assert len(chart["data"]["datasets"]) == 1
    assert chart["data"]["datasets"][0]["label"] == "Value"
    assert chart["options"]["plugins"]["title"]["text"] == "Test Line Chart"


def test_chart_generator_pie_chart(chart_generator):
    """Test generating a pie chart."""
    # Test data
    data = {
        "Category A": 30,
        "Category B": 50,
        "Category C": 20
    }
    
    # Generate chart
    chart = chart_generator.generate_pie_chart(data, "Test Pie Chart")
    
    # Assertions
    assert chart["type"] == "pie"
    assert "data" in chart
    assert "options" in chart
    assert len(chart["data"]["labels"]) == 3
    assert len(chart["data"]["datasets"]) == 1
    assert len(chart["data"]["datasets"][0]["data"]) == 3
    assert chart["options"]["plugins"]["title"]["text"] == "Test Pie Chart"


def test_chart_generator_bar_chart(chart_generator):
    """Test generating a bar chart."""
    # Test data
    data = [
        {"category": "A", "value1": 10, "value2": 5},
        {"category": "B", "value1": 15, "value2": 8},
        {"category": "C", "value1": 12, "value2": 6}
    ]
    
    # Generate chart
    chart = chart_generator.generate_bar_chart(
        data, "category", ["value1", "value2"], "Test Bar Chart"
    )
    
    # Assertions
    assert chart["type"] == "bar"
    assert "data" in chart
    assert "options" in chart
    assert len(chart["data"]["labels"]) == 3
    assert len(chart["data"]["datasets"]) == 2
    assert chart["options"]["plugins"]["title"]["text"] == "Test Bar Chart"


def test_enhanced_dashboard_service_initialization(enhanced_dashboard_service):
    """Test that the enhanced dashboard service initializes correctly."""
    assert enhanced_dashboard_service is not None
    assert enhanced_dashboard_service.chart_generator is not None
    assert enhanced_dashboard_service.cache_prefix == "dashboard_v2"


@patch('src.dashboard.enhanced_service.get_cache')
@patch('src.dashboard.enhanced_service.dashboard_service')
def test_get_enhanced_user_analytics(mock_dashboard_service, mock_get_cache, enhanced_dashboard_service):
    """Test getting enhanced user analytics."""
    # Mock cache to return None (no cached data)
    mock_get_cache.return_value = None
    
    # Mock basic analytics data
    mock_basic_analytics = {
        "user_id": 1,
        "analytics": {
            "total_content": 10,
            "verified_content": 8,
            "deepfake_analyzed": 5,
            "third_party_verified": 3,
            "avg_verification_score": 0.85,
            "avg_deepfake_probability": 0.15,
            "content_type_distribution": {
                "text": 6,
                "image": 4
            },
            "generated_at": datetime.utcnow().isoformat()
        }
    }
    mock_dashboard_service.get_user_analytics.return_value = mock_basic_analytics
    
    # Mock database session and content
    mock_db = MagicMock()
    mock_content = MagicMock()
    mock_content.verification_score = 0.9
    mock_content.deepfake_probability = 0.1
    mock_db.query.return_value.filter.return_value.all.return_value = [mock_content]
    
    # Get enhanced analytics
    result = enhanced_dashboard_service.get_enhanced_user_analytics(1, mock_db)
    
    # Assertions
    assert result["user_id"] == 1
    assert "analytics" in result
    assert "charts" in result
    assert "generated_at" in result


@patch('src.dashboard.enhanced_service.get_cache')
@patch('src.dashboard.enhanced_service.dashboard_service')
def test_get_enhanced_content_trends(mock_dashboard_service, mock_get_cache, enhanced_dashboard_service):
    """Test getting enhanced content trends."""
    # Mock cache to return None (no cached data)
    mock_get_cache.return_value = None
    
    # Mock basic trends data
    mock_basic_trends = {
        "user_id": 1,
        "period_days": 30,
        "trends": [
            {
                "date": "2023-01-01",
                "content_count": 5,
                "avg_verification_score": 0.8,
                "avg_deepfake_probability": 0.2
            }
        ],
        "generated_at": datetime.utcnow().isoformat()
    }
    mock_dashboard_service.get_content_trends.return_value = mock_basic_trends
    
    # Mock database session
    mock_db = MagicMock()
    
    # Get enhanced trends
    result = enhanced_dashboard_service.get_enhanced_content_trends(1, mock_db, 30)
    
    # Assertions
    assert result["user_id"] == 1
    assert result["period_days"] == 30
    assert "trends" in result
    assert "charts" in result
    assert "generated_at" in result


@patch('src.dashboard.enhanced_service.get_cache')
@patch('src.dashboard.enhanced_service.dashboard_service')
def test_get_enhanced_verification_summary(mock_dashboard_service, mock_get_cache, enhanced_dashboard_service):
    """Test getting enhanced verification summary."""
    # Mock cache to return None (no cached data)
    mock_get_cache.return_value = None
    
    # Mock basic summary data
    mock_basic_summary = {
        "user_id": 1,
        "verification_summary": {
            "total_verified": 10,
            "highly_authentic": 3,
            "likely_authentic": 4,
            "uncertain": 2,
            "likely_misinformation": 1,
            "highly_suspect": 0,
            "generated_at": datetime.utcnow().isoformat()
        }
    }
    mock_dashboard_service.get_verification_summary.return_value = mock_basic_summary
    
    # Mock database session
    mock_db = MagicMock()
    
    # Get enhanced summary
    result = enhanced_dashboard_service.get_enhanced_verification_summary(1, mock_db)
    
    # Assertions
    assert result["user_id"] == 1
    assert "verification_summary" in result
    assert "charts" in result
    assert "generated_at" in result


@patch('src.dashboard.enhanced_service.get_cache')
@patch('src.dashboard.enhanced_service.dashboard_service')
def test_get_enhanced_third_party_stats(mock_dashboard_service, mock_get_cache, enhanced_dashboard_service):
    """Test getting enhanced third-party stats."""
    # Mock cache to return None (no cached data)
    mock_get_cache.return_value = None
    
    # Mock basic stats data
    mock_basic_stats = {
        "user_id": 1,
        "third_party_stats": {
            "total_third_party_verified": 5,
            "service_breakdown": {
                "factcheck_org": {
                    "total": 3,
                    "verified_true": 2,
                    "verified_false": 1,
                    "verified_mixed": 0,
                    "errors": 0
                }
            },
            "generated_at": datetime.utcnow().isoformat()
        }
    }
    mock_dashboard_service.get_third_party_verification_stats.return_value = mock_basic_stats
    
    # Mock database session
    mock_db = MagicMock()
    
    # Get enhanced stats
    result = enhanced_dashboard_service.get_enhanced_third_party_stats(1, mock_db)
    
    # Assertions
    assert result["user_id"] == 1
    assert "third_party_stats" in result
    assert "charts" in result
    assert "generated_at" in result


def test_calculate_score_distribution(enhanced_dashboard_service):
    """Test calculating verification score distribution."""
    # Mock content items
    mock_contents = []
    for i in range(5):
        mock_content = MagicMock()
        mock_content.verification_score = i * 0.25  # 0.0, 0.25, 0.5, 0.75, 1.0
        mock_contents.append(mock_content)
    
    # Calculate distribution
    distribution = enhanced_dashboard_service._calculate_score_distribution(mock_contents)
    
    # Assertions
    assert "0.0-0.2" in distribution
    assert "0.2-0.4" in distribution
    assert "0.4-0.6" in distribution
    assert "0.6-0.8" in distribution
    assert "0.8-1.0" in distribution
    assert sum(distribution.values()) == 5


def test_calculate_deepfake_distribution(enhanced_dashboard_service):
    """Test calculating deepfake probability distribution."""
    # Mock content items
    mock_contents = []
    for i in range(5):
        mock_content = MagicMock()
        mock_content.deepfake_probability = i * 0.25  # 0.0, 0.25, 0.5, 0.75, 1.0
        mock_contents.append(mock_content)
    
    # Calculate distribution
    distribution = enhanced_dashboard_service._calculate_deepfake_distribution(mock_contents)
    
    # Assertions
    assert "0.0-0.2" in distribution
    assert "0.2-0.4" in distribution
    assert "0.4-0.6" in distribution
    assert "0.6-0.8" in distribution
    assert "0.8-1.0" in distribution
    assert sum(distribution.values()) == 5