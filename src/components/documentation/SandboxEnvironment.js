import React, { useState, useEffect } from 'react';
import './SandboxEnvironment.css';

const SandboxEnvironment = () => {
  const [activeTab, setActiveTab] = useState('editor');
  const [code, setCode] = useState(`// Example: Verify content authenticity
const response = await fetch('https://api.veritas-ai.com/v1/verify', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'base64_encoded_image_data',
    contentType: 'image',
    options: {
      detailedAnalysis: true
    }
  })
});

const result = await response.json();
console.log('Verification result:', result);`);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [requestHistory, setRequestHistory] = useState([]);

  const tabs = [
    { id: 'editor', label: 'Code Editor' },
    { id: 'history', label: 'Request History' },
    { id: 'docs', label: 'Documentation' }
  ];

  const examples = [
    {
      name: 'Basic Verification',
      code: `// Verify a single piece of content
const response = await fetch('https://api.veritas-ai.com/v1/verify', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'base64_encoded_content',
    contentType: 'image'
  })
});

const result = await response.json();
console.log('Authenticity:', result.isAuthentic);
console.log('Confidence:', result.confidence);`
    },
    {
      name: 'Batch Verification',
      code: `// Verify multiple pieces of content
const response = await fetch('https://api.veritas-ai.com/v1/batch-verify', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    contents: [
      { content: 'base64_data_1', contentType: 'image' },
      { content: 'base64_data_2', contentType: 'video' },
      { content: 'base64_data_3', contentType: 'audio' }
    ]
  })
});

const result = await response.json();
console.log('Batch result:', result);`
    },
    {
      name: 'Get Job Status',
      code: `// Check the status of an async verification job
const response = await fetch('https://api.veritas-ai.com/v1/jobs/job_12345/progress', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const status = await response.json();
console.log('Job status:', status);`
    }
  ];

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running code...\n');

    // Simulate API call execution
    setTimeout(() => {
      const mockResponse = {
        success: true,
        data: {
          jobId: 'job_1234567890',
          status: 'completed',
          isAuthentic: true,
          confidence: 0.98,
          metadata: {
            processingTimeMs: 1250,
            contentType: 'image'
          }
        }
      };

      const outputText = `Response Status: 200 OK
Response Headers:
  Content-Type: application/json
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 99

Response Body:
${JSON.stringify(mockResponse, null, 2)}

Execution completed successfully!`;

      setOutput(outputText);

      // Add to request history
      const newHistoryItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        endpoint: 'https://api.veritas-ai.com/v1/verify',
        method: 'POST',
        status: 200,
        responseTime: 1250
      };

      setRequestHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);
      setIsRunning(false);
    }, 2000);
  };

  const handleClearOutput = () => {
    setOutput('');
  };

  const loadExample = (exampleCode) => {
    setCode(exampleCode);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'editor':
        return (
          <div className="sandbox-editor">
            <div className="editor-header">
              <h3>Interactive Code Sandbox</h3>
              <p>Test API calls directly in your browser</p>
            </div>

            <div className="editor-toolbar">
              <div className="api-key-input">
                <label>API Key:</label>
                <input
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <div className="editor-actions">
                <button
                  className="run-button"
                  onClick={handleRunCode}
                  disabled={isRunning || !apiKey}
                >
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
                <button className="clear-button" onClick={handleClearOutput}>
                  Clear Output
                </button>
              </div>
            </div>

            <div className="editor-content">
              <div className="code-editor-section">
                <div className="editor-label">
                  <h4>Code Editor</h4>
                  <div className="example-selector">
                    <label>Load Example:</label>
                    <select onChange={(e) => loadExample(e.target.value)}>
                      <option value="">Select an example</option>
                      {examples.map((example, index) => (
                        <option key={index} value={example.code}>
                          {example.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter your JavaScript code here..."
                  rows={15}
                />
              </div>

              <div className="output-section">
                <h4>Output</h4>
                <pre className="output-console">
                  {output || '// Output will appear here after running code'}
                </pre>
              </div>
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="sandbox-history">
            <div className="history-header">
              <h3>Request History</h3>
              <p>Recent API requests made in the sandbox</p>
            </div>

            {requestHistory.length > 0 ? (
              <div className="history-list">
                {requestHistory.map((request) => (
                  <div key={request.id} className="history-item">
                    <div className="history-item-header">
                      <span className={`method method-${request.method.toLowerCase()}`}>
                        {request.method}
                      </span>
                      <span className="endpoint">{request.endpoint}</span>
                      <span className={`status status-${request.status}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="history-item-details">
                      <span className="timestamp">
                        {new Date(request.timestamp).toLocaleString()}
                      </span>
                      <span className="response-time">
                        {request.responseTime}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-history">
                <p>No requests yet. Run some code in the editor to see request history.</p>
              </div>
            )}
          </div>
        );
      case 'docs':
        return (
          <div className="sandbox-docs">
            <div className="docs-header">
              <h3>Sandbox Documentation</h3>
              <p>Guide to using the interactive API sandbox</p>
            </div>

            <div className="docs-content">
              <div className="doc-section">
                <h4>Getting Started</h4>
                <p>
                  The sandbox environment allows you to test API calls directly in your browser.
                  Enter your API key, write some code, and click "Run Code" to see the results.
                </p>
              </div>

              <div className="doc-section">
                <h4>Available Functions</h4>
                <ul>
                  <li><code>fetch()</code> - Make HTTP requests to the API</li>
                  <li><code>console.log()</code> - Output information to the console</li>
                  <li><code>JSON.stringify()</code> - Convert objects to JSON strings</li>
                  <li><code>await</code> - Wait for asynchronous operations</li>
                </ul>
              </div>

              <div className="doc-section">
                <h4>Example Usage</h4>
                <pre>
                  <code>
{`// Basic verification request
const response = await fetch('https://api.veritas-ai.com/v1/verify', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'base64_encoded_data',
    contentType: 'image'
  })
});

const result = await response.json();
console.log(result);`}
                  </code>
                </pre>
              </div>

              <div className="doc-section">
                <h4>Best Practices</h4>
                <ul>
                  <li>Always use your test API key in the sandbox</li>
                  <li>Check rate limits in the response headers</li>
                  <li>Handle errors with try/catch blocks</li>
                  <li>Review the output carefully for debugging</li>
                </ul>
              </div>

              <div className="doc-section">
                <h4>Limitations</h4>
                <ul>
                  <li>Requests are simulated for security reasons</li>
                  <li>Actual API calls require a valid API key</li>
                  <li>Some endpoints may have restricted access</li>
                  <li>Rate limits are enforced in production</li>
                </ul>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="sandbox-environment">
      <div className="sandbox-header">
        <h2>Sandbox Environment</h2>
        <p>Test API calls directly in your browser with this interactive sandbox</p>
      </div>

      <div className="sandbox-tabs">
        <ul>
          {tabs.map(tab => (
            <li
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="sandbox-content">
        {renderTabContent()}
      </div>

      <div className="sandbox-footer">
        <div className="sandbox-info">
          <h4>Ready to test in production?</h4>
          <p>
            Once you've tested your integration in the sandbox, you can use the same code
            in your production application with your live API key.
          </p>
        </div>
        <div className="sandbox-links">
          <a href="/docs/api-reference" className="docs-link">Full API Documentation</a>
          <a href="/dashboard" className="dashboard-link">API Dashboard</a>
        </div>
      </div>
    </div>
  );
};

export default SandboxEnvironment;