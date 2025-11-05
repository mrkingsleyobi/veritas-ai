import React, { useState } from 'react';
import './AuthGuide.css';

const AuthGuide = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'api-keys', label: 'API Keys' },
    { id: 'oauth', label: 'OAuth 2.0' },
    { id: 'jwt', label: 'JWT Tokens' },
    { id: 'mfa', label: 'MFA' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="auth-content">
            <h3>Authentication Overview</h3>
            <p>
              The Veritas AI API uses token-based authentication to secure access to its endpoints.
              All API requests must include an authentication token in the Authorization header.
            </p>

            <div className="auth-methods">
              <div className="auth-method">
                <h4>API Keys</h4>
                <p>For server-to-server communication</p>
              </div>
              <div className="auth-method">
                <h4>OAuth 2.0</h4>
                <p>For user authorization flows</p>
              </div>
              <div className="auth-method">
                <h4>JWT Tokens</h4>
                <p>For stateless authentication</p>
              </div>
            </div>

            <h4>Authentication Headers</h4>
            <pre>
              <code>
{`# API Key
Authorization: Bearer YOUR_API_KEY

# JWT Token
Authorization: Bearer YOUR_JWT_TOKEN`}
              </code>
            </pre>

            <div className="security-note">
              <h4>Security Best Practices</h4>
              <ul>
                <li>Never expose API keys in client-side code</li>
                <li>Use environment variables for storing secrets</li>
                <li>Rotate API keys regularly</li>
                <li>Use HTTPS for all API requests</li>
                <li>Implement proper error handling for authentication failures</li>
              </ul>
            </div>
          </div>
        );
      case 'api-keys':
        return (
          <div className="auth-content">
            <h3>API Key Authentication</h3>
            <p>
              API keys are the simplest way to authenticate with our API. They're suitable for
              server-to-server communication and backend integrations.
            </p>

            <h4>Getting Your API Key</h4>
            <ol>
              <li>Log in to your Veritas AI dashboard</li>
              <li>Navigate to "API Keys" in the settings menu</li>
              <li>Click "Generate New Key"</li>
              <li>Give your key a descriptive name</li>
              <li>Copy the generated key and store it securely</li>
            </ol>

            <h4>Using Your API Key</h4>
            <p>Include your API key in the Authorization header of each request:</p>
            <pre>
              <code>
{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     -X POST \\
     -d '{"content": "base64_encoded_data"}' \\
     https://api.veritas-ai.com/v1/verify`}
              </code>
            </pre>

            <h4>Key Management</h4>
            <div className="key-management">
              <div className="key-action">
                <h5>Regenerate Key</h5>
                <p>Invalidate current key and generate a new one</p>
              </div>
              <div className="key-action">
                <h5>Revoke Key</h5>
                <p>Immediately invalidate a key</p>
              </div>
              <div className="key-action">
                <h5>Set Expiration</h5>
                <p>Automatically expire keys after a set period</p>
              </div>
            </div>
          </div>
        );
      case 'oauth':
        return (
          <div className="auth-content">
            <h3>OAuth 2.0 Authentication</h3>
            <p>
              OAuth 2.0 is recommended for applications that need to access the API on behalf of users.
            </p>

            <h4>OAuth Flow</h4>
            <ol>
              <li>Redirect user to authorization endpoint</li>
              <li>User grants permission</li>
              <li>User is redirected back with authorization code</li>
              <li>Exchange authorization code for access token</li>
              <li>Use access token for API requests</li>
            </ol>

            <h4>Authorization Endpoint</h4>
            <pre>
              <code>
{`GET https://auth.veritas-ai.com/oauth/authorize?
    response_type=code&
    client_id=YOUR_CLIENT_ID&
    redirect_uri=YOUR_REDIRECT_URI&
    scope=read_write&
    state=SECURE_RANDOM_STATE`}
              </code>
            </pre>

            <h4>Token Endpoint</h4>
            <pre>
              <code>
{`POST https://auth.veritas-ai.com/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=AUTHORIZATION_CODE&
client_id=YOUR_CLIENT_ID&
client_secret=YOUR_CLIENT_SECRET&
redirect_uri=YOUR_REDIRECT_URI`}
              </code>
            </pre>

            <h4>Using Access Token</h4>
            <pre>
              <code>
{`curl -H "Authorization: Bearer ACCESS_TOKEN" \\
     https://api.veritas-ai.com/v1/user/profile`}
              </code>
            </pre>
          </div>
        );
      case 'jwt':
        return (
          <div className="auth-content">
            <h3>JWT Token Authentication</h3>
            <p>
              JWT tokens provide stateless authentication for applications.
            </p>

            <h4>Token Structure</h4>
            <p>Our JWT tokens consist of three parts:</p>
            <ul>
              <li><strong>Header</strong>: Algorithm and token type</li>
              <li><strong>Payload</strong>: User information and permissions</li>
              <li><strong>Signature</strong>: Digital signature for verification</li>
            </ul>

            <h4>Obtaining a JWT Token</h4>
            <pre>
              <code>
{`POST https://api.veritas-ai.com/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}`}
              </code>
            </pre>

            <h4>Token Response</h4>
            <pre>
              <code>
{`{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}`}
              </code>
            </pre>

            <h4>Using JWT Tokens</h4>
            <pre>
              <code>
{`curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \\
     https://api.veritas-ai.com/v1/protected-resource`}
              </code>
            </pre>

            <h4>Refreshing Tokens</h4>
            <pre>
              <code>
{`POST https://api.veritas-ai.com/auth/refresh
Content-Type: application/json

{
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}`}
              </code>
            </pre>
          </div>
        );
      case 'mfa':
        return (
          <div className="auth-content">
            <h3>Multi-Factor Authentication</h3>
            <p>
              MFA adds an extra layer of security to user accounts.
            </p>

            <h4>Setting Up MFA</h4>
            <ol>
              <li>Enable MFA in your account settings</li>
              <li>Scan the QR code with your authenticator app</li>
              <li>Enter the generated code to confirm setup</li>
              <li>Save your backup codes in a secure location</li>
            </ol>

            <h4>MFA API Endpoints</h4>
            <div className="endpoint-list">
              <div className="endpoint">
                <h5>POST /api/security/mfa/setup</h5>
                <p>Initiate MFA setup for a user</p>
              </div>
              <div className="endpoint">
                <h5>POST /api/security/mfa/verify</h5>
                <p>Verify time-based one-time password</p>
              </div>
              <div className="endpoint">
                <h5>POST /api/security/mfa/backup</h5>
                <p>Verify backup code</p>
              </div>
            </div>

            <h4>Recovery Options</h4>
            <ul>
              <li>Backup codes (10 one-time use codes)</li>
              <li>Recovery email</li>
              <li>Security questions</li>
            </ul>

            <div className="security-note">
              <h4>Important Security Notes</h4>
              <ul>
                <li>Store backup codes in a secure, offline location</li>
                <li>Never share MFA codes with anyone</li>
                <li>Use an authenticator app rather than SMS when possible</li>
                <li>Enable MFA on all accounts that support it</li>
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="auth-guide">
      <div className="auth-header">
        <h2>Authentication Guide</h2>
        <p>Securely access the Veritas AI API with these authentication methods</p>
      </div>

      <div className="auth-tabs">
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

      <div className="auth-content-wrapper">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AuthGuide;