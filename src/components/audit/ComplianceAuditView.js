import React, { useState } from 'react';

const ComplianceAuditView = () => {
  const [activeRegulation, setActiveRegulation] = useState('gdpr');
  const [complianceData, setComplianceData] = useState({});

  const regulations = {
    gdpr: {
      name: 'GDPR',
      fullName: 'General Data Protection Regulation',
      status: 'Compliant',
      lastAudit: '2023-10-15',
      nextAudit: '2024-04-15',
      requirements: 120,
      compliant: 118,
      issues: 2
    },
    hipaa: {
      name: 'HIPAA',
      fullName: 'Health Insurance Portability and Accountability Act',
      status: 'At Risk',
      lastAudit: '2023-09-22',
      nextAudit: '2024-03-22',
      requirements: 85,
      compliant: 78,
      issues: 7
    },
    soc2: {
      name: 'SOC 2',
      fullName: 'Service Organization Control 2',
      status: 'Compliant',
      lastAudit: '2023-11-01',
      nextAudit: '2024-05-01',
      requirements: 95,
      compliant: 95,
      issues: 0
    },
    pci: {
      name: 'PCI DSS',
      fullName: 'Payment Card Industry Data Security Standard',
      status: 'Compliant',
      lastAudit: '2023-08-30',
      nextAudit: '2024-02-28',
      requirements: 200,
      compliant: 200,
      issues: 0
    }
  };

  const complianceIssues = [
    {
      id: 1,
      regulation: 'GDPR',
      requirement: 'Article 17 - Right to Erasure',
      description: 'Data deletion requests not processed within required timeframe',
      severity: 'medium',
      status: 'In Progress',
      assignedTo: 'Compliance Team',
      dueDate: '2023-12-15'
    },
    {
      id: 2,
      regulation: 'HIPAA',
      requirement: '164.308(a)(1)(ii)(B) - Workforce Security',
      description: 'Insufficient access controls for PHI data',
      severity: 'high',
      status: 'Open',
      assignedTo: 'Security Team',
      dueDate: '2023-11-30'
    },
    {
      id: 3,
      regulation: 'HIPAA',
      requirement: '164.312(a)(2)(i) - Audit Controls',
      description: 'Audit logs retention period insufficient',
      severity: 'medium',
      status: 'Open',
      assignedTo: 'IT Team',
      dueDate: '2023-12-30'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Compliant': return '#4CAF50';
      case 'At Risk': return '#FF9800';
      case 'Non-Compliant': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#fbc02d';
      case 'low': return '#388e3c';
      default: return '#9e9e9e';
    }
  };

  return (
    <div className="compliance-audit-view">
      <div className="header">
        <h2>Compliance Audit Dashboard</h2>
        <p>Monitor and manage compliance with industry regulations</p>
      </div>

      <div className="regulations-overview">
        <h3>Regulatory Compliance Status</h3>
        <div className="regulations-grid">
          {Object.entries(regulations).map(([key, regulation]) => (
            <div
              key={key}
              className={`regulation-card ${activeRegulation === key ? 'active' : ''}`}
              onClick={() => setActiveRegulation(key)}
            >
              <div className="regulation-header">
                <h4>{regulation.name}</h4>
                <span
                  className="compliance-status"
                  style={{ backgroundColor: getStatusColor(regulation.status) }}
                >
                  {regulation.status}
                </span>
              </div>
              <div className="regulation-details">
                <p className="regulation-name">{regulation.fullName}</p>
                <div className="compliance-stats">
                  <div className="stat">
                    <span className="stat-value">{regulation.compliant}</span>
                    <span className="stat-label">Compliant</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{regulation.requirements}</span>
                    <span className="stat-label">Requirements</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{regulation.issues}</span>
                    <span className="stat-label">Issues</span>
                  </div>
                </div>
                <div className="audit-dates">
                  <p>Last Audit: {regulation.lastAudit}</p>
                  <p>Next Audit: {regulation.nextAudit}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="compliance-details">
        <div className="details-header">
          <h3>{regulations[activeRegulation].fullName} Compliance Details</h3>
          <div className="compliance-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(regulations[activeRegulation].compliant / regulations[activeRegulation].requirements) * 100}%`,
                  backgroundColor: getStatusColor(regulations[activeRegulation].status)
                }}
              ></div>
            </div>
            <span>
              {Math.round((regulations[activeRegulation].compliant / regulations[activeRegulation].requirements) * 100)}% Compliant
            </span>
          </div>
        </div>

        <div className="compliance-actions">
          <button className="primary-btn">Generate Compliance Report</button>
          <button className="secondary-btn">Schedule Audit</button>
          <button className="secondary-btn">View Requirements</button>
        </div>
      </div>

      <div className="issues-section">
        <h3>Open Compliance Issues</h3>
        <div className="issues-table-container">
          <table className="issues-table">
            <thead>
              <tr>
                <th>Regulation</th>
                <th>Requirement</th>
                <th>Description</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {complianceIssues
                .filter(issue => issue.regulation === regulations[activeRegulation].name)
                .map(issue => (
                  <tr key={issue.id} className={`issue-row severity-${issue.severity}`}>
                    <td>{issue.regulation}</td>
                    <td>{issue.requirement}</td>
                    <td>{issue.description}</td>
                    <td>
                      <span
                        className="severity-badge"
                        style={{ backgroundColor: getSeverityColor(issue.severity) }}
                      >
                        {issue.severity}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${issue.status.toLowerCase().replace(' ', '-')}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td>{issue.assignedTo}</td>
                    <td>{issue.dueDate}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="compliance-reports">
        <h3>Compliance Reports</h3>
        <div className="reports-grid">
          <div className="report-card">
            <h4>Quarterly Compliance Summary</h4>
            <p>Comprehensive overview of compliance status across all regulations</p>
            <div className="report-meta">
              <span>Last Generated: 2023-10-15</span>
              <button className="download-btn">Download</button>
            </div>
          </div>
          <div className="report-card">
            <h4>GDPR Compliance Assessment</h4>
            <p>Detailed analysis of GDPR requirements and compliance status</p>
            <div className="report-meta">
              <span>Last Generated: 2023-10-10</span>
              <button className="download-btn">Download</button>
            </div>
          </div>
          <div className="report-card">
            <h4>Audit Trail Report</h4>
            <p>Complete audit trail for compliance verification</p>
            <div className="report-meta">
              <span>Last Generated: 2023-11-01</span>
              <button className="download-btn">Download</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceAuditView;