import React, { useState, useEffect } from 'react';
import SwaggerUI from './SwaggerUI';
import EndpointExplorer from './EndpointExplorer';
import AuthGuide from './AuthGuide';
import SDKDocumentation from './SDKDocumentation';
import RateLimiting from './RateLimiting';
import ErrorReference from './ErrorReference';
import WebhookDocumentation from './WebhookDocumentation';
import Changelog from './Changelog';
import ClientLibraries from './ClientLibraries';
import SandboxEnvironment from './SandboxEnvironment';
import './DocumentationPortal.css';

const DocumentationPortal = () => {
  const [activeTab, setActiveTab] = useState('api-reference');
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'api-reference', label: 'API Reference', icon: '📖' },
    { id: 'endpoint-explorer', label: 'Endpoint Explorer', icon: '🔍' },
    { id: 'authentication', label: 'Authentication', icon: '🔒' },
    { id: 'sdk', label: 'SDKs', icon: '💻' },
    { id: 'rate-limiting', label: 'Rate Limiting', icon: '⚡' },
    { id: 'errors', label: 'Error Codes', icon: '⚠️' },
    { id: 'webhooks', label: 'Webhooks', icon: '훅' },
    { id: 'changelog', label: 'Changelog', icon: '📝' },
    { id: 'libraries', label: 'Client Libraries', icon: '📦' },
    { id: 'sandbox', label: 'Sandbox', icon: '🏖️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'api-reference':
        return <SwaggerUI />;
      case 'endpoint-explorer':
        return <EndpointExplorer />;
      case 'authentication':
        return <AuthGuide />;
      case 'sdk':
        return <SDKDocumentation />;
      case 'rate-limiting':
        return <RateLimiting />;
      case 'errors':
        return <ErrorReference />;
      case 'webhooks':
        return <WebhookDocumentation />;
      case 'changelog':
        return <Changelog />;
      case 'libraries':
        return <ClientLibraries />;
      case 'sandbox':
        return <SandboxEnvironment />;
      default:
        return <SwaggerUI />;
    }
  };

  return (
    <div className="documentation-portal">
      <header className="documentation-header">
        <h1>Veritas AI API Documentation</h1>
        <p className="documentation-subtitle">
          Comprehensive guide to integrating with our Deepfake Detection Platform
        </p>
      </header>

      <nav className="documentation-nav">
        <ul className="nav-tabs">
          {tabs.map((tab) => (
            <li
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </li>
          ))}
        </ul>
      </nav>

      <main className="documentation-content">
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading documentation...</p>
          </div>
        ) : (
          renderTabContent()
        )}
      </main>

      <footer className="documentation-footer">
        <div className="footer-content">
          <p>© 2025 Veritas AI. All rights reserved.</p>
          <div className="footer-links">
            <a href="/terms">Terms of Service</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/support">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DocumentationPortal;