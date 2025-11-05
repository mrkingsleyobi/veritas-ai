import React, { useState } from 'react';
import { useTenant } from './TenantContext';
import './DataIsolation.css';

const DataIsolation = () => {
  const { currentTenant, tenants } = useTenant();
  const [activeView, setActiveView] = useState('overview');
  const [selectedTenant, setSelectedTenant] = useState(currentTenant?.id || null);

  const isolationStats = {
    totalTenants: tenants.length,
    isolatedDatabases: tenants.length,
    isolatedFileStorage: tenants.length,
    encryptedData: tenants.length,
    accessControl: 'Role-based',
    compliance: ['GDPR', 'HIPAA', 'SOC 2']
  };

  const tenantData = tenants.map(tenant => ({
    id: tenant.id,
    name: tenant.name,
    dataIsolation: 'Full',
    encryption: 'AES-256',
    accessControl: tenant.role,
    lastAudit: '2023-06-15',
    compliance: ['GDPR', 'SOC 2'],
    resources: tenant.usage.resources,
    storage: `${tenant.usage.storage} GB`,
    status: 'Secure'
  }));

  const isolationMetrics = [
    { name: 'Data Encryption', value: 100, status: 'success' },
    { name: 'Access Control', value: 98, status: 'success' },
    { name: 'Network Isolation', value: 100, status: 'success' },
    { name: 'Audit Logging', value: 100, status: 'success' },
    { name: 'Compliance', value: 95, status: 'warning' },
    { name: 'Backup Isolation', value: 100, status: 'success' }
  ];

  const views = [
    { id: 'overview', label: 'Overview' },
    { id: 'tenants', label: 'Per Tenant' },
    { id: 'metrics', label: 'Metrics' },
    { id: 'compliance', label: 'Compliance' }
  ];

  if (!currentTenant) {
    return <div className="isolation-placeholder">Select a tenant to view data isolation</div>;
  }

  return (
    <div className="data-isolation">
      <div className="panel-header">
        <h2>Data Isolation</h2>
        <div className="tenant-selector">
          <select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
          >
            {tenants.map(tenant => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="isolation-tabs">
        {views.map(view => (
          <button
            key={view.id}
            className={`tab ${activeView === view.id ? 'active' : ''}`}
            onClick={() => setActiveView(view.id)}
          >
            {view.label}
          </button>
        ))}
      </div>

      <div className="isolation-content">
        {activeView === 'overview' && (
          <div className="overview-section">
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-value">{isolationStats.totalTenants}</div>
                <div className="stat-label">Total Tenants</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{isolationStats.isolatedDatabases}</div>
                <div className="stat-label">Isolated Databases</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{isolationStats.isolatedFileStorage}</div>
                <div className="stat-label">Isolated File Storage</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{isolationStats.encryptedData}</div>
                <div className="stat-label">Encrypted Data Stores</div>
              </div>
            </div>

            <div className="isolation-visualization">
              <h3>Data Isolation Architecture</h3>
              <div className="architecture-diagram">
                <div className="layer application-layer">
                  <div className="layer-title">Application Layer</div>
                  <div className="components">
                    <div className="component">API Gateway</div>
                    <div className="component">Load Balancer</div>
                    <div className="component">Authentication</div>
                  </div>
                </div>

                <div className="layer isolation-layer">
                  <div className="layer-title">Tenant Isolation Layer</div>
                  <div className="components">
                    <div className="component">Request Routing</div>
                    <div className="component">Context Enforcement</div>
                    <div className="component">Access Control</div>
                  </div>
                </div>

                <div className="layer data-layer">
                  <div className="layer-title">Data Layer</div>
                  <div className="components">
                    <div className="component">Tenant A Database</div>
                    <div className="component">Tenant B Database</div>
                    <div className="component">Tenant C Database</div>
                    <div className="component">Shared Services</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="security-info">
              <h3>Security Measures</h3>
              <ul>
                <li>🔒 <strong>Physical Isolation:</strong> Separate databases and file storage for each tenant</li>
                <li>🔐 <strong>Encryption:</strong> AES-256 encryption at rest and TLS 1.3 in transit</li>
                <li>🚪 <strong>Access Control:</strong> Role-based access with least privilege principle</li>
                <li>📝 <strong>Audit Logging:</strong> Comprehensive logs for all tenant activities</li>
                <li>🛡️ <strong>Network Security:</strong> VPC isolation and firewall rules</li>
              </ul>
            </div>
          </div>
        )}

        {activeView === 'tenants' && (
          <div className="tenants-section">
            <h3>Per-Tenant Isolation</h3>
            <div className="tenants-table-container">
              <table className="tenants-table">
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Data Isolation</th>
                    <th>Encryption</th>
                    <th>Access Control</th>
                    <th>Resources</th>
                    <th>Storage</th>
                    <th>Last Audit</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tenantData.map(tenant => (
                    <tr key={tenant.id}>
                      <td className="tenant-name">{tenant.name}</td>
                      <td>{tenant.dataIsolation}</td>
                      <td>{tenant.encryption}</td>
                      <td>{tenant.accessControl}</td>
                      <td>{tenant.resources}</td>
                      <td>{tenant.storage}</td>
                      <td>{tenant.lastAudit}</td>
                      <td>
                        <span className={`status-badge status-${tenant.status.toLowerCase()}`}>
                          {tenant.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'metrics' && (
          <div className="metrics-section">
            <h3>Isolation Metrics</h3>
            <div className="metrics-grid">
              {isolationMetrics.map((metric, index) => (
                <div key={index} className="metric-card">
                  <div className="metric-header">
                    <h4>{metric.name}</h4>
                    <span className={`metric-value metric-${metric.status}`}>
                      {metric.value}%
                    </span>
                  </div>
                  <div className="metric-progress">
                    <div
                      className={`progress-bar progress-${metric.status}`}
                      style={{ width: `${metric.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="security-chart">
              <h3>Security Posture Over Time</h3>
              <div className="chart-container">
                <div className="chart-grid">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="chart-bar">
                      <div
                        className="bar-fill"
                        style={{
                          height: `${Math.floor(Math.random() * 40) + 60}%`,
                          backgroundColor: i === 11 ? '#0070f3' : '#e1e5e9'
                        }}
                      ></div>
                      <div className="bar-label">
                        {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'compliance' && (
          <div className="compliance-section">
            <h3>Compliance & Certifications</h3>
            <div className="compliance-cards">
              <div className="compliance-card">
                <div className="compliance-icon">🛡️</div>
                <h4>GDPR</h4>
                <p>General Data Protection Regulation compliance for EU data protection</p>
                <div className="compliance-status status-compliant">Compliant</div>
                <div className="compliance-date">Last audit: June 2023</div>
              </div>

              <div className="compliance-card">
                <div className="compliance-icon">🏥</div>
                <h4>HIPAA</h4>
                <p>Health Insurance Portability and Accountability Act compliance</p>
                <div className="compliance-status status-compliant">Compliant</div>
                <div className="compliance-date">Last audit: May 2023</div>
              </div>

              <div className="compliance-card">
                <div className="compliance-icon">📊</div>
                <h4>SOC 2</h4>
                <p>Service Organization Control 2 Type II compliance</p>
                <div className="compliance-status status-compliant">Compliant</div>
                <div className="compliance-date">Last audit: April 2023</div>
              </div>

              <div className="compliance-card">
                <div className="compliance-icon">🔒</div>
                <h4>ISO 27001</h4>
                <p>Information Security Management System certification</p>
                <div className="compliance-status status-pending">In Progress</div>
                <div className="compliance-date">Target: Q3 2023</div>
              </div>
            </div>

            <div className="data-handling">
              <h3>Data Handling Policies</h3>
              <div className="policy-grid">
                <div className="policy-card">
                  <h4>Data Residency</h4>
                  <p>All tenant data is stored within the geographic region selected during onboarding</p>
                </div>
                <div className="policy-card">
                  <h4>Data Retention</h4>
                  <p>Data is retained for 7 years after account deletion unless required by law</p>
                </div>
                <div className="policy-card">
                  <h4>Data Portability</h4>
                  <p>Full data export available at any time in standard formats</p>
                </div>
                <div className="policy-card">
                  <h4>Subprocessing</h4>
                  <p>Only pre-approved subprocessors are used with strict data processing agreements</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataIsolation;