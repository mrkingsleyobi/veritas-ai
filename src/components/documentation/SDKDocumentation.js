import React, { useState } from 'react';
import './SDKDocumentation.css';

const SDKDocumentation = () => {
  const [activeLanguage, setActiveLanguage] = useState('javascript');

  const languages = [
    { id: 'javascript', name: 'JavaScript', icon: '🟨' },
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'java', name: 'Java', icon: '☕' },
    { id: 'go', name: 'Go', icon: '🐹' },
    { id: 'curl', name: 'cURL', icon: '🌐' }
  ];

  const sdks = [
    {
      name: 'JavaScript SDK',
      description: 'Official JavaScript client for browser and Node.js environments',
      version: 'v1.2.3',
      install: 'npm install @veritas-ai/sdk',
      github: 'https://github.com/veritas-ai/javascript-sdk',
      documentation: '/docs/javascript'
    },
    {
      name: 'Python SDK',
      description: 'Official Python client for easy integration with Python applications',
      version: 'v1.1.0',
      install: 'pip install veritas-ai',
      github: 'https://github.com/veritas-ai/python-sdk',
      documentation: '/docs/python'
    },
    {
      name: 'Java SDK',
      description: 'Official Java client for enterprise Java applications',
      version: 'v1.0.5',
      install: '<dependency>...</dependency>',
      github: 'https://github.com/veritas-ai/java-sdk',
      documentation: '/docs/java'
    },
    {
      name: 'Go SDK',
      description: 'Official Go client for high-performance applications',
      version: 'v1.3.2',
      install: 'go get github.com/veritas-ai/go-sdk',
      github: 'https://github.com/veritas-ai/go-sdk',
      documentation: '/docs/go'
    }
  ];

  const renderCodeExample = () => {
    const examples = {
      javascript: `// Installation
npm install @veritas-ai/sdk

// Import and initialize
const { VeritasClient } = require('@veritas-ai/sdk');

const client = new VeritasClient({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://api.veritas-ai.com/v1'
});

// Verify content
async function verifyContent() {
  try {
    const result = await client.verifyContent({
      content: 'base64_encoded_content',
      contentType: 'image',
      options: {
        detailedAnalysis: true
      }
    });

    console.log('Verification result:', result);
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

verifyContent();`,
      python: `# Installation
pip install veritas-ai

# Import and initialize
from veritas_ai import VeritasClient

client = VeritasClient(
    api_key='YOUR_API_KEY',
    base_url='https://api.veritas-ai.com/v1'
)

# Verify content
def verify_content():
    try:
        result = client.verify_content(
            content='base64_encoded_content',
            content_type='image',
            options={'detailed_analysis': True}
        )
        print('Verification result:', result)
    except Exception as error:
        print('Verification failed:', error)

verify_content()`,
      java: `// Installation (Maven)
<dependency>
  <groupId>ai.veritas</groupId>
  <artifactId>sdk</artifactId>
  <version>1.0.5</version>
</dependency>

// Import and initialize
import ai.veritas.sdk.VeritasClient;
import ai.veritas.sdk.models.*;

VeritasClient client = new VeritasClient.Builder()
    .apiKey("YOUR_API_KEY")
    .baseUrl("https://api.veritas-ai.com/v1")
    .build();

// Verify content
public void verifyContent() {
    try {
        ContentVerificationRequest request = new ContentVerificationRequest.Builder()
            .content("base64_encoded_content")
            .contentType("image")
            .options(new VerificationOptions.Builder()
                .detailedAnalysis(true)
                .build())
            .build();

        ContentVerificationResult result = client.verifyContent(request);
        System.out.println("Verification result: " + result);
    } catch (Exception error) {
        System.err.println("Verification failed: " + error);
    }
}`,
      go: `// Installation
go get github.com/veritas-ai/go-sdk

// Import and initialize
package main

import (
    "fmt"
    "github.com/veritas-ai/go-sdk"
)

func main() {
    client := veritasai.NewClient(&veritasai.Config{
        APIKey: "YOUR_API_KEY",
        BaseURL: "https://api.veritas-ai.com/v1",
    })

    // Verify content
    verifyContent(client)
}

func verifyContent(client *veritasai.Client) {
    request := &veritasai.ContentVerificationRequest{
        Content: "base64_encoded_content",
        ContentType: "image",
        Options: &veritasai.VerificationOptions{
            DetailedAnalysis: true,
        },
    }

    result, err := client.VerifyContent(request)
    if err != nil {
        fmt.Printf("Verification failed: %v\\n", err)
        return
    }

    fmt.Printf("Verification result: %+v\\n", result)
}`,
      curl: `# Verify content
curl -X POST https://api.veritas-ai.com/v1/verify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "base64_encoded_content",
    "contentType": "image",
    "options": {
      "detailedAnalysis": true
    }
  }'

# Get verification result
curl -X GET https://api.veritas-ai.com/v1/verify/job_1234567890 \\
  -H "Authorization: Bearer YOUR_API_KEY"`
    };

    return examples[activeLanguage] || examples.javascript;
  };

  return (
    <div className="sdk-documentation">
      <div className="sdk-header">
        <h2>SDK Documentation</h2>
        <p>Official client libraries for integrating with the Veritas AI API</p>
      </div>

      <div className="sdk-sections">
        <div className="sdk-overview">
          <h3>Available SDKs</h3>
          <div className="sdk-grid">
            {sdks.map((sdk, index) => (
              <div key={index} className="sdk-card">
                <div className="sdk-card-header">
                  <h4>{sdk.name}</h4>
                  <span className="sdk-version">v{sdk.version}</span>
                </div>
                <p className="sdk-description">{sdk.description}</p>
                <div className="sdk-install">
                  <pre><code>{sdk.install}</code></pre>
                </div>
                <div className="sdk-links">
                  <a href={sdk.github} target="_blank" rel="noopener noreferrer">GitHub</a>
                  <a href={sdk.documentation} target="_blank" rel="noopener noreferrer">Documentation</a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sdk-examples">
          <h3>Code Examples</h3>
          <div className="language-tabs">
            <ul>
              {languages.map(lang => (
                <li
                  key={lang.id}
                  className={activeLanguage === lang.id ? 'active' : ''}
                  onClick={() => setActiveLanguage(lang.id)}
                >
                  <span className="lang-icon">{lang.icon}</span>
                  <span className="lang-name">{lang.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="code-example">
            <pre><code>{renderCodeExample()}</code></pre>
          </div>

          <div className="example-explanation">
            <h4>Example Breakdown</h4>
            <ol>
              <li><strong>Installation</strong> - How to install the SDK</li>
              <li><strong>Initialization</strong> - How to create a client instance</li>
              <li><strong>Authentication</strong> - How to authenticate requests</li>
              <li><strong>API Call</strong> - How to make a verification request</li>
              <li><strong>Error Handling</strong> - How to handle errors properly</li>
            </ol>
          </div>
        </div>

        <div className="sdk-features">
          <h3>SDK Features</h3>
          <div className="features-grid">
            <div className="feature-card">
              <h4>🔄 Automatic Retries</h4>
              <p>Automatic retry logic with exponential backoff for failed requests</p>
            </div>
            <div className="feature-card">
              <h4>🔒 Secure Authentication</h4>
              <p>Built-in support for API keys, JWT tokens, and OAuth 2.0</p>
            </div>
            <div className="feature-card">
              <h4>⚡ Async Support</h4>
              <p>Non-blocking operations for high-performance applications</p>
            </div>
            <div className="feature-card">
              <h4>📝 Request Validation</h4>
              <p>Client-side validation to catch errors before sending requests</p>
            </div>
            <div className="feature-card">
              <h4>📊 Response Parsing</h4>
              <p>Automatic parsing of API responses into native objects</p>
            </div>
            <div className="feature-card">
              <h4>⚙️ Configuration</h4>
              <p>Flexible configuration options for timeouts, retries, and more</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SDKDocumentation;