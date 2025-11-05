import React, { useState } from 'react';
import './Changelog.css';

const Changelog = () => {
  const [activeVersion, setActiveVersion] = useState('v1.5.0');

  const versions = [
    {
      version: 'v1.5.0',
      date: '2025-10-15',
      status: 'latest',
      description: 'Major update with enhanced verification algorithms and new endpoints',
      changes: {
        added: [
          'New /batch-verify endpoint for processing multiple items',
          'Enhanced deepfake detection algorithm with 25% improved accuracy',
          'Webhook support for real-time notifications',
          'Multi-tenancy support for enterprise customers',
          'Rate limit headers in all API responses'
        ],
        changed: [
          'Improved response times for content verification by 40%',
          'Updated authentication to support JWT tokens',
          'Enhanced error messages with more detailed information',
          'Optimized database queries for better performance'
        ],
        fixed: [
          'Resolved issue with large file uploads timing out',
          'Fixed incorrect confidence scores in edge cases',
          'Addressed race condition in async processing',
          'Corrected documentation examples'
        ],
        deprecated: [
          '/verify/simple endpoint (use /verify instead)',
          'Old authentication method without JWT support'
        ]
      }
    },
    {
      version: 'v1.4.2',
      date: '2025-09-05',
      status: 'previous',
      description: 'Minor improvements and bug fixes',
      changes: {
        added: [
          'New /health endpoint for service status monitoring',
          'Additional metadata fields in verification results'
        ],
        changed: [
          'Reduced default timeout for verification jobs',
          'Updated SDKs with better error handling'
        ],
        fixed: [
          'Fixed memory leak in long-running processes',
          'Resolved issue with concurrent requests',
          'Corrected timezone handling in timestamps'
        ]
      }
    },
    {
      version: 'v1.4.1',
      date: '2025-08-22',
      status: 'previous',
      description: 'Bug fixes and performance improvements',
      changes: {
        added: [
          'Rate limiting information in response headers',
          'New error codes for better troubleshooting'
        ],
        fixed: [
          'Resolved authentication issues with API keys',
          'Fixed incorrect job status reporting',
          'Addressed race conditions in database operations'
        ]
      }
    },
    {
      version: 'v1.4.0',
      date: '2025-08-10',
      status: 'previous',
      description: 'Major feature release with async processing',
      changes: {
        added: [
          'Async processing support for large content verification',
          'Job progress tracking with /jobs/{id}/progress endpoint',
          'New /metrics endpoint for system monitoring',
          'Support for video and audio content verification'
        ],
        changed: [
          'Improved verification accuracy by 15%',
          'Enhanced API documentation with interactive examples',
          'Updated SDKs for all supported languages'
        ],
        deprecated: [
          'Synchronous verification endpoint (to be removed in v2.0)'
        ]
      }
    },
    {
      version: 'v1.3.5',
      date: '2025-07-18',
      status: 'previous',
      description: 'Security updates and minor enhancements',
      changes: {
        added: [
          'Enhanced security logging for compliance',
          'New audit trail functionality'
        ],
        changed: [
          'Strengthened authentication mechanisms',
          'Updated encryption for data at rest'
        ],
        fixed: [
          'Resolved vulnerability in input validation',
          'Fixed issue with malformed request handling'
        ]
      }
    }
  ];

  const renderChanges = (changes, type) => {
    if (!changes || changes.length === 0) return null;

    const typeColors = {
      added: '#28a745',
      changed: '#007bff',
      fixed: '#ffc107',
      deprecated: '#dc3545',
      removed: '#6c757d'
    };

    const typeLabels = {
      added: 'Added',
      changed: 'Changed',
      fixed: 'Fixed',
      deprecated: 'Deprecated',
      removed: 'Removed'
    };

    return (
      <div className="changelog-section">
        <h4 style={{ color: typeColors[type] }}>{typeLabels[type]}</h4>
        <ul>
          {changes.map((change, index) => (
            <li key={index}>{change}</li>
          ))}
        </ul>
      </div>
    );
  };

  const currentVersion = versions.find(v => v.version === activeVersion);

  return (
    <div className="changelog">
      <div className="changelog-header">
        <h2>API Changelog</h2>
        <p>Track changes, improvements, and updates to the Veritas AI API</p>
      </div>

      <div className="changelog-content">
        <div className="version-selector">
          <h3>Version History</h3>
          <div className="versions-list">
            {versions.map((version) => (
              <div
                key={version.version}
                className={`version-item ${activeVersion === version.version ? 'active' : ''} ${version.status}`}
                onClick={() => setActiveVersion(version.version)}
              >
                <div className="version-header">
                  <span className="version-number">{version.version}</span>
                  {version.status === 'latest' && (
                    <span className="version-status latest">Latest</span>
                  )}
                </div>
                <div className="version-date">{version.date}</div>
                <div className="version-description">{version.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="version-details">
          <div className="version-details-header">
            <h3>{currentVersion.version}</h3>
            <div className="version-meta">
              <span className="version-date">{currentVersion.date}</span>
              {currentVersion.status === 'latest' && (
                <span className="version-status latest">Latest Release</span>
              )}
            </div>
            <p className="version-overview">{currentVersion.description}</p>
          </div>

          <div className="version-changes">
            {renderChanges(currentVersion.changes.added, 'added')}
            {renderChanges(currentVersion.changes.changed, 'changed')}
            {renderChanges(currentVersion.changes.fixed, 'fixed')}
            {renderChanges(currentVersion.changes.deprecated, 'deprecated')}
            {renderChanges(currentVersion.changes.removed, 'removed')}
          </div>

          <div className="version-upgrade-notes">
            <h4>Upgrade Notes</h4>
            {currentVersion.version === 'v1.5.0' ? (
              <div>
                <p>
                  This release includes breaking changes to authentication and introduces new
                  requirements for API keys. Please review the migration guide before upgrading.
                </p>
                <div className="upgrade-steps">
                  <h5>Migration Steps:</h5>
                  <ol>
                    <li>Update your API client to use JWT tokens</li>
                    <li>Replace deprecated endpoints with new alternatives</li>
                    <li>Implement webhook handlers for real-time notifications</li>
                    <li>Update rate limit handling in your applications</li>
                    <li>Test all integrations with the new version</li>
                  </ol>
                </div>
                <div className="compatibility-notice">
                  <h5>Compatibility:</h5>
                  <p>
                    This version maintains backward compatibility with most existing integrations,
                    but applications using deprecated endpoints should migrate within 90 days.
                  </p>
                </div>
              </div>
            ) : (
              <p>
                This is a minor release with bug fixes and improvements. No migration steps are required.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="changelog-subscription">
        <h3>Stay Updated</h3>
        <p>Get notified about API changes and updates</p>
        <div className="subscription-form">
          <input type="email" placeholder="Your email address" />
          <button className="subscribe-button">Subscribe</button>
        </div>
        <div className="subscription-options">
          <label>
            <input type="checkbox" defaultChecked />
            Major releases only
          </label>
          <label>
            <input type="checkbox" />
            All updates
          </label>
        </div>
      </div>
    </div>
  );
};

export default Changelog;