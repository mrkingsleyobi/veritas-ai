"""
Tests for dashboard service.
"""
import pytest
from unittest.mock import patch, MagicMock
from src.dashboard.service import DashboardService


def test_dashboard_service_initialization():
    """Test that the dashboard service initializes correctly."""
    service = DashboardService()
    assert service is not None


@patch('src.models.content.Content')
def test_get_user_analytics(mock_content):
    """Test getting user analytics data."""
    # Mock content data
    mock_content_instance = MagicMock()
    mock_content_instance.verification_score = 0.85
    mock_content_instance.deepfake_probability = 0.1
    mock_content_instance.content_type = "image/jpeg"
    mock_content_instance.uploaded_at = MagicMock()
    mock_content_instance.uploaded_at.date.return_value.isoformat.return_value = "2023-01-01"
    
    # Mock the query chain
    mock_query = MagicMock()
    mock_query.filter.return_value.all.return_value = [mock_content_instance]
    mock_content.query.return_value = mock_query
    
    # Mock database session
    mock_db = MagicMock()
    mock_db.query.return_value = mock_query
    
    service = DashboardService()
    result = service.get_user_analytics(1, mock_db)
    
    assert result is not None
    assert "user_id" in result
    assert "analytics" in result
    assert result["user_id"] == 1
    assert result["analytics"]["total_content"] == 1


def test_get_content_trends():
    """Test getting content trends data."""
    from datetime import datetime, timedelta
    from src.dashboard.service import DashboardService
    from unittest.mock import MagicMock
    
    # Create a mock database session
    mock_db = MagicMock()
    
    # Create a mock content instance with proper datetime
    class MockContent:
        def __init__(self, verification_score, deepfake_probability, uploaded_at):
            self.verification_score = verification_score
            self.deepfake_probability = deepfake_probability
            self.uploaded_at = uploaded_at
    
    # Create test data
    test_date = datetime.utcnow() - timedelta(days=3)
    mock_content_instance = MockContent(0.85, 0.1, test_date)
    
    # Mock the query to return our test data
    mock_query = MagicMock()
    mock_query.filter.return_value.all.return_value = [mock_content_instance]
    mock_db.query.return_value.filter.return_value.all.return_value = [mock_content_instance]
    
    service = DashboardService()
    result = service.get_content_trends(1, mock_db, 7)
    
    assert result is not None
    assert "user_id" in result
    assert "trends" in result
    assert result["user_id"] == 1
    assert result["period_days"] == 7


@patch('src.models.content.Content')
def test_get_verification_summary(mock_content):
    """Test getting verification summary."""
    # Mock content data with different verification scores
    mock_content_instance1 = MagicMock()
    mock_content_instance1.verification_score = 0.95  # Highly authentic
    
    mock_content_instance2 = MagicMock()
    mock_content_instance2.verification_score = 0.75  # Likely authentic
    
    mock_content_instance3 = MagicMock()
    mock_content_instance3.verification_score = 0.45  # Uncertain
    
    # Mock the query chain
    mock_query = MagicMock()
    mock_filter = MagicMock()
    mock_filter.all.return_value = [mock_content_instance1, mock_content_instance2, mock_content_instance3]
    mock_query.filter.return_value = mock_filter
    mock_content.query.return_value = mock_query
    
    # Mock database session
    mock_db = MagicMock()
    mock_db.query.return_value = mock_query
    
    service = DashboardService()
    result = service.get_verification_summary(1, mock_db)
    
    assert result is not None
    assert "user_id" in result
    assert "verification_summary" in result
    assert result["user_id"] == 1
    assert result["verification_summary"]["total_verified"] == 3


@patch('src.models.content.Content')
def test_get_third_party_verification_stats(mock_content):
    """Test getting third-party verification statistics."""
    # Mock content data with third-party verification results
    mock_content_instance1 = MagicMock()
    mock_content_instance1.verification_result = '{"third_party_verification": {"snopes": {"verified": true, "rating": "mostly_true"}}}'
    
    mock_content_instance2 = MagicMock()
    mock_content_instance2.verification_result = '{"third_party_verification": {"factcheck_org": {"verified": false, "rating": "false"}}}'
    
    mock_content_instance3 = MagicMock()
    mock_content_instance3.verification_result = None  # No third-party verification
    
    # Mock the query chain
    mock_query = MagicMock()
    mock_filter = MagicMock()
    mock_filter.all.return_value = [mock_content_instance1, mock_content_instance2, mock_content_instance3]
    mock_query.filter.return_value = mock_filter
    mock_content.query.return_value = mock_query
    
    # Mock database session
    mock_db = MagicMock()
    mock_db.query.return_value = mock_query
    
    service = DashboardService()
    result = service.get_third_party_verification_stats(1, mock_db)
    
    assert result is not None
    assert "user_id" in result
    assert "third_party_stats" in result
    assert result["user_id"] == 1
    assert result["third_party_stats"]["total_third_party_verified"] == 2