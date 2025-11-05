import React from 'react';
import './RateLimiting.css';

const RateLimiting = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      requestsPerMinute: 100,
      requestsPerDay: 1000,
      features: [
        'Basic content verification',
        'Standard accuracy',
        'Email support',
        '100 requests/minute'
      ],
      color: '#6c757d'
    },
    {
      name: 'Pro',
      price: '$99',
      requestsPerMinute: 1000,
      requestsPerDay: 50000,
      features: [
        'Advanced content verification',
        'High accuracy',
        'Priority support',
        '1,000 requests/minute',
        'Batch processing',
        'Webhook notifications'
      ],
      color: '#007bff',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      requestsPerMinute: 10000,
      requestsPerDay: 'Unlimited',
      features: [
        'Premium content verification',
        'Highest accuracy',
        '24/7 dedicated support',
        '10,000 requests/minute',
        'Unlimited batch processing',
        'Custom webhook integrations',
        'SLA guarantee',
        'Custom model training'
      ],
      color: '#28a745'
    }
  ];

  const headers = [
    { name: 'X-RateLimit-Limit', description: 'Request limit per time window' },
    { name: 'X-RateLimit-Remaining', description: 'Requests remaining in current window' },
    { name: 'X-RateLimit-Reset', description: 'Unix timestamp when limit resets' },
    { name: 'Retry-After', description: 'Seconds to wait before retrying (429 responses)' }
  ];

  return (
    <div className="rate-limiting">
      <div className="rate-limiting-header">
        <h2>Rate Limiting</h2>
        <p>Understand and manage API request limits to ensure optimal performance</p>
      </div>

      <div className="rate-limiting-content">
        <section className="rate-limiting-overview">
          <h3>Rate Limiting Overview</h3>
          <p>
            To ensure fair usage and optimal performance for all users, the Veritas AI API
            implements rate limiting. Rate limits are applied on a per-API-key basis and vary
            depending on your subscription plan.
          </p>

          <div className="rate-limiting-plans">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`plan-card ${plan.popular ? 'popular' : ''}`}
                style={{ borderLeftColor: plan.color }}
              >
                {plan.popular && <span className="popular-badge">Most Popular</span>}
                <div className="plan-header">
                  <h4>{plan.name}</h4>
                  <div className="plan-price">{plan.price}</div>
                </div>
                <div className="plan-limits">
                  <div className="limit">
                    <span className="limit-value">{plan.requestsPerMinute}</span>
                    <span className="limit-unit">requests/minute</span>
                  </div>
                  <div className="limit">
                    <span className="limit-value">{plan.requestsPerDay}</span>
                    <span className="limit-unit">requests/day</span>
                  </div>
                </div>
                <ul className="plan-features">
                  {plan.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="rate-limiting-headers">
          <h3>Rate Limit Headers</h3>
          <p>
            Every API response includes rate limit information in the headers. Monitor these
            headers to programmatically manage your API usage.
          </p>

          <div className="headers-table">
            <div className="header-row header-head">
              <div className="header-name">Header</div>
              <div className="header-description">Description</div>
            </div>
            {headers.map((header, index) => (
              <div key={index} className="header-row">
                <div className="header-name">{header.name}</div>
                <div className="header-description">{header.description}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rate-limiting-best-practices">
          <h3>Best Practices</h3>
          <div className="best-practices-grid">
            <div className="practice-card">
              <h4>✅ Check Headers</h4>
              <p>Always check rate limit headers in API responses to monitor your usage.</p>
            </div>
            <div className="practice-card">
              <h4>⏳ Implement Backoff</h4>
              <p>Use exponential backoff when approaching rate limits to avoid 429 errors.</p>
            </div>
            <div className="practice-card">
              <h4>🔄 Handle 429s</h4>
              <p>Properly handle 429 (Too Many Requests) responses with retry logic.</p>
            </div>
            <div className="practice-card">
              <h4>⚖️ Distribute Load</h4>
              <p>Distribute requests evenly over time rather than burst requests.</p>
            </div>
          </div>
        </section>

        <section className="rate-limiting-code-examples">
          <h3>Implementation Examples</h3>

          <div className="code-example">
            <h4>JavaScript Rate Limit Handling</h4>
            <pre>
              <code>
{`async function makeApiRequest() {
  try {
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

    // Check rate limit headers
    const limit = response.headers.get('X-RateLimit-Limit');
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');

    console.log(\`Rate limit: \${remaining}/\${limit} (resets at \${new Date(reset * 1000)})\`);

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      console.log(\`Rate limit exceeded. Retry after \${retryAfter} seconds\`);
      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return makeApiRequest();
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}`}
              </code>
            </pre>
          </div>

          <div className="code-example">
            <h4>Python Rate Limit Handling</h4>
            <pre>
              <code>
{`import time
import requests
from datetime import datetime

def make_api_request():
    url = "https://api.veritas-ai.com/v1/verify"
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    data = {
        "content": "base64_encoded_content",
        "contentType": "image"
    }

    response = requests.post(url, headers=headers, json=data)

    # Check rate limit headers
    limit = response.headers.get('X-RateLimit-Limit')
    remaining = response.headers.get('X-RateLimit-Remaining')
    reset = response.headers.get('X-RateLimit-Reset')

    print(f"Rate limit: {remaining}/{limit} (resets at {datetime.fromtimestamp(int(reset))})")

    if response.status_code == 429:
        retry_after = int(response.headers.get('Retry-After', 1))
        print(f"Rate limit exceeded. Retry after {retry_after} seconds")
        time.sleep(retry_after)
        return make_api_request()

    response.raise_for_status()
    return response.json()`}
              </code>
            </pre>
          </div>
        </section>

        <section className="rate-limiting-faq">
          <h3>Frequently Asked Questions</h3>
          <div className="faq-list">
            <div className="faq-item">
              <h4>What happens when I exceed my rate limit?</h4>
              <p>
                When you exceed your rate limit, the API will return a 429 (Too Many Requests)
                status code. The response will include a Retry-After header indicating how many
                seconds to wait before making another request.
              </p>
            </div>
            <div className="faq-item">
              <h4>Do rate limits apply to all endpoints?</h4>
              <p>
                Yes, rate limits apply to all API endpoints. However, some endpoints like
                /health or /status may have higher limits or be exempt from rate limiting.
              </p>
            </div>
            <div className="faq-item">
              <h4>Can I request a rate limit increase?</h4>
              <p>
                Enterprise customers can request custom rate limits. For other plans,
                consider upgrading to a higher tier for increased limits.
              </p>
            </div>
            <div className="faq-item">
              <h4>How are rate limits calculated?</h4>
              <p>
                Rate limits are calculated per API key per time window (minute and day).
                Each authenticated request counts toward your limit.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RateLimiting;