import React, { useState } from 'react';
import './EndpointExplorer.css';

const EndpointExplorer = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock endpoints data based on the routes we analyzed
  const endpoints = [
    {
      id: 'verify-content',
      method: 'POST',
      path: '/api/async/verify',
      description: 'Submit content for deepfake verification',
      category: 'Content Verification'
    },
    {
      id: 'batch-verify',
      method: 'POST',
      path: '/api/async/batch-verify',
      description: 'Submit multiple contents for verification',
      category: 'Content Verification'
    },
    {
      id: 'get-progress',
      method: 'GET',
      path: '/api/async/jobs/{jobId}/progress',
      description: 'Get verification job progress',
      category: 'Content Verification'
    },
    {
      id: 'create-tenant',
      method: 'POST',
      path: '/api/tenants',
      description: 'Create a new tenant',
      category: 'Multi-Tenancy'
    },
    {
      id: 'get-tenant',
      method: 'GET',
      path: '/api/tenants/{tenantId}',
      description: 'Get tenant information',
      category: 'Multi-Tenancy'
    },
    {
      id: 'gdpr-access',
      method: 'GET',
      path: '/api/gdpr/access',
      description: 'Process data access request',
      category: 'Compliance'
    },
    {
      id: 'soc2-log',
      method: 'POST',
      path: '/api/soc2/log',
      description: 'Log security events',
      category: 'Compliance'
    },
    {
      id: 'mfa-setup',
      method: 'POST',
      path: '/api/security/mfa/setup',
      description: 'Set up MFA for a user',
      category: 'Security'
    },
    {
      id: 'audit-logs',
      method: 'GET',
      path: '/api/audit/logs',
      description: 'Get audit logs with filtering',
      category: 'Audit'
    }
  ];

  const categories = [...new Set(endpoints.map(e => e.category))];

  const handleEndpointSelect = (endpoint) => {
    setSelectedEndpoint(endpoint);
    setResponse(null);
    // Set default request body for POST endpoints
    if (endpoint.method === 'POST') {
      setRequestBody(JSON.stringify({
        // Example based on endpoint
        content: "base64_encoded_content",
        contentType: "image"
      }, null, 2));
    } else {
      setRequestBody('');
    }
  };

  const handleTryItOut = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockResponse = {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '99',
          'X-RateLimit-Limit': '100'
        },
        body: {
          jobId: 'job_1234567890',
          status: 'pending',
          message: 'Content verification job submitted successfully'
        }
      };
      setResponse(mockResponse);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="endpoint-explorer">
      <div className="explorer-header">
        <h2>Endpoint Explorer</h2>
        <p>Try out API endpoints with example requests and responses</p>
      </div>

      <div className="explorer-content">
        <div className="endpoint-list">
          <h3>API Endpoints</h3>
          {categories.map(category => (
            <div key={category} className="category-section">
              <h4>{category}</h4>
              <ul>
                {endpoints
                  .filter(e => e.category === category)
                  .map(endpoint => (
                    <li
                      key={endpoint.id}
                      className={`endpoint-item ${selectedEndpoint?.id === endpoint.id ? 'selected' : ''}`}
                      onClick={() => handleEndpointSelect(endpoint)}
                    >
                      <span className={`method method-${endpoint.method.toLowerCase()}`}>
                        {endpoint.method}
                      </span>
                      <span className="endpoint-path">{endpoint.path}</span>
                      <p className="endpoint-description">{endpoint.description}</p>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="endpoint-detail">
          {selectedEndpoint ? (
            <>
              <div className="endpoint-info">
                <div className="endpoint-title">
                  <span className={`method method-${selectedEndpoint.method.toLowerCase()}`}>
                    {selectedEndpoint.method}
                  </span>
                  <h3>{selectedEndpoint.path}</h3>
                </div>
                <p className="endpoint-description">{selectedEndpoint.description}</p>
              </div>

              <div className="request-panel">
                <h4>Request</h4>
                <div className="request-headers">
                  <h5>Headers</h5>
                  <div className="header-item">
                    <span className="header-name">Authorization</span>
                    <span className="header-value">Bearer YOUR_API_KEY</span>
                  </div>
                  <div className="header-item">
                    <span className="header-name">Content-Type</span>
                    <span className="header-value">application/json</span>
                  </div>
                </div>

                {selectedEndpoint.method === 'POST' && (
                  <div className="request-body">
                    <h5>Body</h5>
                    <textarea
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      placeholder="Enter request body (JSON)"
                      rows={8}
                    />
                  </div>
                )}

                <button
                  className="try-it-button"
                  onClick={handleTryItOut}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Try it out'}
                </button>
              </div>

              {response && (
                <div className="response-panel">
                  <h4>Response</h4>
                  <div className="response-headers">
                    <h5>Headers</h5>
                    {Object.entries(response.headers).map(([key, value]) => (
                      <div key={key} className="header-item">
                        <span className="header-name">{key}</span>
                        <span className="header-value">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="response-body">
                    <h5>Body</h5>
                    <pre><code>{JSON.stringify(response.body, null, 2)}</code></pre>
                  </div>
                  <div className="response-status">
                    <span className="status-code">Status: {response.status}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-selection">
              <p>Select an endpoint from the list to view details and try it out</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EndpointExplorer;