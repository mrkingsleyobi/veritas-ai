import React, { useState } from 'react';
import './WebhookDocumentation.css';

const WebhookDocumentation = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'setup', label: 'Setup Guide' },
    { id: 'events', label: 'Event Types' },
    { id: 'security', label: 'Security' },
    { id: 'testing', label: 'Testing' }
  ];

  const webhooks = [
    {
      event: 'verification.completed',
      description: 'Triggered when content verification is completed',
      payload: {
        id: 'evt_1234567890',
        object: 'event',
        api_version: '2025-01-01',
        created: 1640995200,
        data: {
          object: {
            id: 'job_1234567890',
            object: 'verification_job',
            created: 1640995200,
            status: 'completed',
            content_id: 'content_1234567890',
            result: {
              is_authentic: true,
              confidence: 0.98,
              metadata: {
                processing_time_ms: 1250
              }
            }
          }
        },
        pending_webhooks: 1,
        request: {
          id: 'req_1234567890',
          idempotency_key: 'idempotency_1234567890'
        },
        type: 'verification.completed'
      }
    },
    {
      event: 'verification.failed',
      description: 'Triggered when content verification fails',
      payload: {
        id: 'evt_1234567891',
        object: 'event',
        api_version: '2025-01-01',
        created: 1640995260,
        data: {
          object: {
            id: 'job_1234567891',
            object: 'verification_job',
            created: 1640995260,
            status: 'failed',
            content_id: 'content_1234567891',
            error: {
              code: 'CONTENT_CORRUPT',
              message: 'The content appears to be corrupted or invalid'
            }
          }
        },
        pending_webhooks: 1,
        request: {
          id: 'req_1234567891',
          idempotency_key: 'idempotency_1234567891'
        },
        type: 'verification.failed'
      }
    },
    {
      event: 'batch.completed',
      description: 'Triggered when a batch verification job is completed',
      payload: {
        id: 'evt_1234567892',
        object: 'event',
        api_version: '2025-01-01',
        created: 1640995320,
        data: {
          object: {
            id: 'batch_1234567890',
            object: 'batch_job',
            created: 1640995320,
            status: 'completed',
            total_items: 100,
            verified_items: 95,
            failed_items: 5,
            results: {
              authentic: 85,
              manipulated: 10,
              failed: 5
            }
          }
        },
        pending_webhooks: 1,
        request: {
          id: 'req_1234567892',
          idempotency_key: 'idempotency_1234567892'
        },
        type: 'batch.completed'
      }
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="webhook-content">
            <h3>Webhook Overview</h3>
            <p>
              Webhooks allow your application to receive real-time notifications when events
              occur in the Veritas AI system. Instead of polling for updates, webhooks push
              information to your application as soon as events happen.
            </p>

            <div className="webhook-benefits">
              <div className="benefit-card">
                <h4>⚡ Real-time Updates</h4>
                <p>Receive instant notifications when verification jobs complete</p>
              </div>
              <div className="benefit-card">
                <h4>🔄 Reduced Latency</h4>
                <p>Eliminate polling delays and reduce API requests</p>
              </div>
              <div className="benefit-card">
                <h4>💰 Cost Effective</h4>
                <p>Minimize API calls and reduce costs</p>
              </div>
            </div>

            <h4>How Webhooks Work</h4>
            <ol>
              <li>You configure a webhook endpoint URL in your dashboard</li>
              <li>When an event occurs, we send an HTTP POST request to your endpoint</li>
              <li>Your application processes the event data</li>
              <li>You send a 2xx response to acknowledge receipt</li>
            </ol>

            <div className="webhook-flow">
              <div className="flow-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h5>Event Occurs</h5>
                  <p>Content verification completes</p>
                </div>
              </div>
              <div className="flow-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h5>Webhook Sent</h5>
                  <p>HTTP POST to your endpoint</p>
                </div>
              </div>
              <div className="flow-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h5>Process Data</h5>
                  <p>Your application handles the event</p>
                </div>
              </div>
              <div className="flow-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h5>Acknowledge</h5>
                  <p>Return 2xx HTTP response</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'setup':
        return (
          <div className="webhook-content">
            <h3>Webhook Setup Guide</h3>
            <p>
              Configure webhooks to receive real-time notifications from the Veritas AI API.
            </p>

            <h4>Step 1: Create a Webhook Endpoint</h4>
            <p>
              Create a publicly accessible HTTPS endpoint that can receive and process webhook events.
              Your endpoint should:
            </p>
            <ul>
              <li>Be accessible via HTTPS</li>
              <li>Be able to handle HTTP POST requests</li>
              <li>Return a 2xx HTTP status code within 30 seconds</li>
              <li>Be idempotent (handle duplicate events gracefully)</li>
            </ul>

            <h4>Step 2: Configure in Dashboard</h4>
            <p>Navigate to your dashboard to configure webhook settings:</p>
            <pre>
              <code>
{`1. Go to Settings > Webhooks
2. Click "Add Webhook Endpoint"
3. Enter your endpoint URL
4. Select the events you want to receive
5. Click "Create Endpoint"`}
              </code>
            </pre>

            <h4>Step 3: API Configuration</h4>
            <p>You can also configure webhooks programmatically:</p>
            <pre>
              <code>
{`POST https://api.veritas-ai.com/v1/webhooks/endpoints
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks",
  "enabled_events": [
    "verification.completed",
    "verification.failed",
    "batch.completed"
  ],
  "description": "My verification webhook endpoint"
}`}
              </code>
            </pre>

            <h4>Step 4: Test Your Endpoint</h4>
            <p>Send a test event to verify your endpoint works correctly:</p>
            <pre>
              <code>
{`POST https://api.veritas-ai.com/v1/webhooks/endpoints/wh_12345/test
Authorization: Bearer YOUR_API_KEY`}
              </code>
            </pre>
          </div>
        );
      case 'events':
        return (
          <div className="webhook-content">
            <h3>Webhook Event Types</h3>
            <p>
              The following events can trigger webhook notifications:
            </p>

            <div className="events-list">
              {webhooks.map((webhook, index) => (
                <div key={index} className="event-card">
                  <div className="event-header">
                    <h4>{webhook.event}</h4>
                    <span className="event-description">{webhook.description}</span>
                  </div>
                  <div className="event-payload">
                    <h5>Sample Payload</h5>
                    <pre><code>{JSON.stringify(webhook.payload, null, 2)}</code></pre>
                  </div>
                  <div className="event-properties">
                    <h5>Key Properties</h5>
                    <ul>
                      <li><strong>id</strong>: Unique event identifier</li>
                      <li><strong>type</strong>: Event type</li>
                      <li><strong>created</strong>: Unix timestamp</li>
                      <li><strong>data.object</strong>: Event-specific data</li>
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="webhook-content">
            <h3>Webhook Security</h3>
            <p>
              Secure your webhook endpoints to ensure authenticity and prevent unauthorized access.
            </p>

            <h4>Signature Verification</h4>
            <p>
              Every webhook request includes a signature in the <code>Veritas-Signature</code> header.
              Verify this signature to ensure the request came from Veritas AI.
            </p>

            <pre>
              <code>
{`// Node.js example
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

app.post('/webhooks', (req, res) => {
  const signature = req.headers['veritas-signature'];
  const payload = JSON.stringify(req.body);

  if (!verifySignature(payload, signature, WEBHOOK_SECRET)) {
    return res.status(401).send('Unauthorized');
  }

  // Process webhook
  handleWebhook(req.body);
  res.status(200).send('OK');
});`}
              </code>
            </pre>

            <h4>Best Practices</h4>
            <div className="security-practices">
              <div className="practice-item">
                <h5>🔒 Use HTTPS</h5>
                <p>Always use HTTPS for webhook endpoints to encrypt data in transit</p>
              </div>
              <div className="practice-item">
                <h5>🗝️ Verify Signatures</h5>
                <p>Validate webhook signatures to ensure authenticity</p>
              </div>
              <div className="practice-item">
                <h5>🛡️ Validate Payloads</h5>
                <p>Sanitize and validate all incoming webhook data</p>
              </div>
              <div className="practice-item">
                <h5>🔁 Handle Retries</h5>
                <p>Implement idempotent processing for duplicate events</p>
              </div>
              <div className="practice-item">
                <h5>📊 Log Events</h5>
                <p>Log webhook events for debugging and monitoring</p>
              </div>
              <div className="practice-item">
                <h5>⏰ Set Timeouts</h5>
                <p>Respond within 30 seconds to prevent retries</p>
              </div>
            </div>
          </div>
        );
      case 'testing':
        return (
          <div className="webhook-content">
            <h3>Testing Webhooks</h3>
            <p>
              Test your webhook implementation to ensure proper functionality.
            </p>

            <h4>Dashboard Testing</h4>
            <p>
              Use the dashboard to send test events to your endpoint:
            </p>
            <ol>
              <li>Navigate to Settings > Webhooks</li>
              <li>Select your webhook endpoint</li>
              <li>Click "Send Test Event"</li>
              <li>Check your endpoint logs for the test event</li>
            </ol>

            <h4>Programmatic Testing</h4>
            <pre>
              <code>
{`// Send a test event
POST https://api.veritas-ai.com/v1/webhooks/endpoints/wh_12345/test
Authorization: Bearer YOUR_API_KEY

// Response
{
  "success": true,
  "message": "Test event sent successfully"
}`}
              </code>
            </pre>

            <h4>Local Development</h4>
            <p>
              For local development, use tools like ngrok to expose your localhost:
            </p>
            <pre>
              <code>
{`# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 3000

# Use the HTTPS URL provided by ngrok as your webhook endpoint`}
              </code>
            </pre>

            <h4>Testing Tools</h4>
            <div className="testing-tools">
              <div className="tool-card">
                <h5>Postman</h5>
                <p>Test webhook endpoints with custom payloads</p>
              </div>
              <div className="tool-card">
                <h5>ngrok</h5>
                <p>Expose localhost for webhook testing</p>
              </div>
              <div className="tool-card">
                <h5>RequestBin</h5>
                <p>Inspect webhook requests without backend code</p>
              </div>
            </div>

            <h4>Debugging Checklist</h4>
            <ul className="debugging-checklist">
              <li>✅ Endpoint returns 2xx status code</li>
              <li>✅ HTTPS URL is accessible</li>
              <li>✅ Signature verification implemented</li>
              <li>✅ Payload validation in place</li>
              <li>✅ Timeout handling configured</li>
              <li>✅ Logging for debugging</li>
              <li>✅ Idempotent processing</li>
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="webhook-documentation">
      <div className="webhook-header">
        <h2>Webhook Documentation</h2>
        <p>Receive real-time notifications when events occur in the Veritas AI system</p>
      </div>

      <div className="webhook-tabs">
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

      <div className="webhook-content-wrapper">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default WebhookDocumentation;