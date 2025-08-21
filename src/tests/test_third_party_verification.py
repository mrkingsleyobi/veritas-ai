"""
Tests for third-party verification service.
"""
import pytest
from unittest.mock import patch, MagicMock
import json
from src.ai.third_party.service import ThirdPartyVerificationService


def test_third_party_service_initialization():
    """Test that the third-party verification service initializes correctly."""
    service = ThirdPartyVerificationService()
    assert service is not None
    assert isinstance(service.services, dict)


@patch.dict('os.environ', {
    'SNOPES_API_KEY': 'test_snopes_key',
    'FACTCHECK_ORG_API_KEY': 'test_factcheck_key'
})
def test_service_configuration():
    """Test that services are properly configured from environment variables."""
    service = ThirdPartyVerificationService()
    
    # Check that services are enabled when API keys are present
    assert service.services['snopes']['enabled'] is True
    assert service.services['snopes']['api_key'] == 'test_snopes_key'
    
    assert service.services['factcheck_org']['enabled'] is True
    assert service.services['factcheck_org']['api_key'] == 'test_factcheck_key'
    
    # Check that services without API keys are disabled
    assert service.services['politifact']['enabled'] is False


def test_get_service_status():
    """Test getting service status information."""
    service = ThirdPartyVerificationService()
    status = service.get_service_status()
    
    assert 'snopes' in status
    assert 'factcheck_org' in status
    assert 'politifact' in status
    
    # Check structure of status information
    for service_name, service_info in status.items():
        assert 'enabled' in service_info
        assert 'configured' in service_info
        assert 'base_url' in service_info


@patch.dict('os.environ', {'SNOPES_API_KEY': 'test_key'})
@patch('requests.post')
def test_verify_text_claim_with_snopes(mock_post):
    """Test verifying a text claim with Snopes."""
    # Mock the API response
    mock_response = MagicMock()
    mock_response.json.return_value = {
        'verified': True,
        'rating': 'mostly_true',
        'confidence': 0.85
    }
    mock_post.return_value = mock_response
    
    service = ThirdPartyVerificationService()
    result = service.verify_text_claim("This is a test claim")
    
    assert result is not None
    assert 'claim' in result
    assert 'results' in result
    assert result['claim'] == "This is a test claim"
    
    # Check that Snopes result is included
    assert 'snopes' in result['results']
    snopes_result = result['results']['snopes']
    assert snopes_result['verified'] is True
    assert snopes_result['rating'] == 'mostly_true'


@patch.dict('os.environ', {
    'SNOPES_API_KEY': 'test_snopes_key',
    'FACTCHECK_ORG_API_KEY': 'test_factcheck_key'
})
def test_verify_text_claim_multiple_services():
    """Test verifying a text claim with multiple services."""
    service = ThirdPartyVerificationService()
    result = service.verify_text_claim("This is a test claim")
    
    assert result is not None
    assert 'claim' in result
    assert 'results' in result
    
    # Both services should be in the results (even if simulated)
    assert 'snopes' in result['results']
    assert 'factcheck_org' in result['results']


def test_verify_text_claim_no_services_configured():
    """Test verifying a text claim when no services are configured."""
    service = ThirdPartyVerificationService()
    result = service.verify_text_claim("This is a test claim")
    
    assert result is not None
    assert 'claim' in result
    assert 'results' in result
    # No services should be in results when none are configured
    assert len(result['results']) == 0


@patch.dict('os.environ', {'SNOPES_API_KEY': 'test_key'})
@patch('requests.post')
def test_verify_with_service_error_handling(mock_post):
    """Test error handling when a service fails."""
    # Mock an exception from the API call
    mock_post.side_effect = Exception("API Error")
    
    service = ThirdPartyVerificationService()
    result = service.verify_text_claim("This is a test claim")
    
    assert result is not None
    assert 'snopes' in result['results']
    snopes_result = result['results']['snopes']
    # The service should fall back to the simulated response even when the API call fails
    assert snopes_result['verified'] is True