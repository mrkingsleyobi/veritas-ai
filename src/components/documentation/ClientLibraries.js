import React, { useState } from 'react';
import './ClientLibraries.css';

const ClientLibraries = () => {
  const [activeLanguage, setActiveLanguage] = useState('javascript');
  const [downloadProgress, setDownloadProgress] = useState({});

  const languages = [
    {
      id: 'javascript',
      name: 'JavaScript',
      icon: '🟨',
      version: 'v1.2.3',
      downloads: '125,432',
      lastUpdated: '2025-10-15',
      size: '2.4 MB',
      compatibility: 'Node.js 12+, Browser',
      installation: 'npm install @veritas-ai/sdk',
      documentation: '/docs/javascript-sdk'
    },
    {
      id: 'python',
      name: 'Python',
      icon: '🐍',
      version: 'v1.1.0',
      downloads: '87,564',
      lastUpdated: '2025-10-10',
      size: '1.8 MB',
      compatibility: 'Python 3.7+',
      installation: 'pip install veritas-ai',
      documentation: '/docs/python-sdk'
    },
    {
      id: 'java',
      name: 'Java',
      icon: '☕',
      version: 'v1.0.5',
      downloads: '64,231',
      lastUpdated: '2025-09-28',
      size: '4.2 MB',
      compatibility: 'Java 8+',
      installation: 'Maven dependency',
      documentation: '/docs/java-sdk'
    },
    {
      id: 'go',
      name: 'Go',
      icon: '🐹',
      version: 'v1.3.2',
      downloads: '42,156',
      lastUpdated: '2025-10-05',
      size: '3.1 MB',
      compatibility: 'Go 1.16+',
      installation: 'go get github.com/veritas-ai/go-sdk',
      documentation: '/docs/go-sdk'
    },
    {
      id: 'php',
      name: 'PHP',
      icon: '🐘',
      version: 'v1.0.1',
      downloads: '18,743',
      lastUpdated: '2025-08-22',
      size: '1.2 MB',
      compatibility: 'PHP 7.4+',
      installation: 'composer require veritas-ai/sdk',
      documentation: '/docs/php-sdk'
    },
    {
      id: 'ruby',
      name: 'Ruby',
      icon: '💎',
      version: 'v0.9.8',
      downloads: '9,876',
      lastUpdated: '2025-07-15',
      size: '0.9 MB',
      compatibility: 'Ruby 2.7+',
      installation: 'gem install veritas_ai',
      documentation: '/docs/ruby-sdk'
    }
  ];

  const handleDownload = (languageId) => {
    // Simulate download progress
    setDownloadProgress(prev => ({ ...prev, [languageId]: 0 }));

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        const current = prev[languageId] || 0;
        if (current >= 100) {
          clearInterval(interval);
          // Reset after completion
          setTimeout(() => {
            setDownloadProgress(prevProgress => {
              const newProgress = { ...prevProgress };
              delete newProgress[languageId];
              return newProgress;
            });
          }, 2000);
          return prev;
        }
        return { ...prev, [languageId]: current + 10 };
      });
    }, 200);
  };

  const activeLanguageData = languages.find(lang => lang.id === activeLanguage);

  return (
    <div className="client-libraries">
      <div className="libraries-header">
        <h2>Client Libraries</h2>
        <p>Download official SDKs for your preferred programming language</p>
      </div>

      <div className="libraries-content">
        <div className="language-selector">
          <h3>Available Languages</h3>
          <div className="languages-grid">
            {languages.map((language) => (
              <div
                key={language.id}
                className={`language-card ${activeLanguage === language.id ? 'active' : ''}`}
                onClick={() => setActiveLanguage(language.id)}
              >
                <div className="language-icon">{language.icon}</div>
                <div className="language-info">
                  <h4>{language.name}</h4>
                  <div className="language-meta">
                    <span className="language-version">v{language.version}</span>
                    <span className="language-downloads">📥 {language.downloads}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="library-details">
          {activeLanguageData && (
            <div className="library-info">
              <div className="library-header">
                <div className="library-icon-name">
                  <div className="library-icon">{activeLanguageData.icon}</div>
                  <div>
                    <h3>{activeLanguageData.name} SDK</h3>
                    <p className="library-version">Version {activeLanguageData.version}</p>
                  </div>
                </div>
                <div className="library-actions">
                  <button
                    className="download-button"
                    onClick={() => handleDownload(activeLanguageData.id)}
                    disabled={downloadProgress[activeLanguageData.id] !== undefined}
                  >
                    {downloadProgress[activeLanguageData.id] !== undefined ? (
                      <div className="download-progress">
                        <div
                          className="progress-bar"
                          style={{ width: `${downloadProgress[activeLanguageData.id]}%` }}
                        ></div>
                        <span>{downloadProgress[activeLanguageData.id]}%</span>
                      </div>
                    ) : (
                      <>
                        <span className="download-icon">⬇️</span>
                        Download SDK
                      </>
                    )}
                  </button>
                  <a
                    href={activeLanguageData.documentation}
                    className="docs-button"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Documentation
                  </a>
                </div>
              </div>

              <div className="library-specs">
                <div className="spec-card">
                  <h4>Last Updated</h4>
                  <p>{activeLanguageData.lastUpdated}</p>
                </div>
                <div className="spec-card">
                  <h4>File Size</h4>
                  <p>{activeLanguageData.size}</p>
                </div>
                <div className="spec-card">
                  <h4>Compatibility</h4>
                  <p>{activeLanguageData.compatibility}</p>
                </div>
                <div className="spec-card">
                  <h4>Downloads</h4>
                  <p>{activeLanguageData.downloads}</p>
                </div>
              </div>

              <div className="installation-guide">
                <h4>Installation</h4>
                <pre><code>{activeLanguageData.installation}</code></pre>
              </div>

              <div className="library-features">
                <h4>Key Features</h4>
                <div className="features-grid">
                  <div className="feature-item">
                    <h5>🔄 Automatic Retries</h5>
                    <p>Automatic retry logic with exponential backoff</p>
                  </div>
                  <div className="feature-item">
                    <h5>🔒 Secure Authentication</h5>
                    <p>Built-in support for API keys and JWT tokens</p>
                  </div>
                  <div className="feature-item">
                    <h5>⚡ Async Support</h5>
                    <p>Non-blocking operations for high-performance apps</p>
                  </div>
                  <div className="feature-item">
                    <h5>📝 Request Validation</h5>
                    <p>Client-side validation to catch errors early</p>
                  </div>
                  <div className="feature-item">
                    <h5>📊 Response Parsing</h5>
                    <p>Automatic parsing into native objects</p>
                  </div>
                  <div className="feature-item">
                    <h5>⚙️ Configuration</h5>
                    <p>Flexible configuration options</p>
                  </div>
                </div>
              </div>

              <div className="example-usage">
                <h4>Example Usage</h4>
                <div className="code-tabs">
                  <div className="code-tab active">Basic Usage</div>
                  <div className="code-tab">Async Processing</div>
                  <div className="code-tab">Error Handling</div>
                </div>
                <pre>
                  <code>
{`// Initialize client
const client = new VeritasClient({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://api.veritas-ai.com/v1'
});

// Verify content
async function verifyContent() {
  try {
    const result = await client.verifyContent({
      content: 'base64_encoded_content',
      contentType: 'image'
    });

    console.log('Authenticity:', result.isAuthentic);
    console.log('Confidence:', result.confidence);
  } catch (error) {
    console.error('Verification failed:', error.message);
  }
}`}
                  </code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="libraries-resources">
        <h3>Additional Resources</h3>
        <div className="resources-grid">
          <div className="resource-card">
            <h4>📚 API Reference</h4>
            <p>Complete documentation for all API endpoints</p>
            <a href="/docs/api-reference" className="resource-link">View Docs</a>
          </div>
          <div className="resource-card">
            <h4>📋 Migration Guide</h4>
            <p>Upgrade from previous versions</p>
            <a href="/docs/migration" className="resource-link">View Guide</a>
          </div>
          <div className="resource-card">
            <h4>❓ Support</h4>
            <p>Get help with SDK integration</p>
            <a href="/support" className="resource-link">Get Support</a>
          </div>
          <div className="resource-card">
            <h4>🐛 Report Issues</h4>
            <p>Found a bug? Let us know</p>
            <a href="/issues" className="resource-link">Report Issue</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLibraries;