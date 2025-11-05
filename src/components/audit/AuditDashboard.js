import React, { useState } from 'react';
import AuditLogViewer from './AuditLogViewer';
import UserActivityDashboard from './UserActivityDashboard';
import SecurityEventMonitor from './SecurityEventMonitor';
import ComplianceAuditView from './ComplianceAuditView';
import LogRetentionManager from './LogRetentionManager';
import AuditReportGenerator from './AuditReportGenerator';

const AuditDashboard = () => {
  const [activeTab, setActiveTab] = useState('logs');

  const tabs = [
    { id: 'logs', label: 'Audit Logs', component: AuditLogViewer },
    { id: 'activity', label: 'User Activity', component: UserActivityDashboard },
    { id: 'security', label: 'Security Monitor', component: SecurityEventMonitor },
    { id: 'compliance', label: 'Compliance', component: ComplianceAuditView },
    { id: 'retention', label: 'Retention', component: LogRetentionManager },
    { id: 'reports', label: 'Reports', component: AuditReportGenerator }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AuditLogViewer;

  return (
    <div className="audit-dashboard">
      <div className="dashboard-header">
        <h1>Audit & Compliance Dashboard</h1>
        <p>Comprehensive audit logging and monitoring for security and compliance</p>
      </div>

      <div className="dashboard-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        <ActiveComponent />
      </div>

      <div className="dashboard-footer">
        <div className="footer-stats">
          <span>Last updated: {new Date().toLocaleString()}</span>
          <span>System status: Operational</span>
        </div>
      </div>
    </div>
  );
};

export default AuditDashboard;