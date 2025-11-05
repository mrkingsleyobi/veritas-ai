import React, { useState, useEffect } from 'react';

const LogRetentionManager = () => {
  const [policies, setPolicies] = useState([]);
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    description: '',
    eventType: '',
    retentionPeriod: 30,
    retentionUnit: 'days',
    archiveBeforeDelete: true,
    complianceRequirement: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState(null);
  const [storageStats, setStorageStats] = useState({});

  // Mock initial policies
  useEffect(() => {
    const mockPolicies = [
      {
        id: 1,
        name: 'Security Events',
        description: 'High-priority security-related events',
        eventType: 'SECURITY_ALERT',
        retentionPeriod: 365,
        retentionUnit: 'days',
        archiveBeforeDelete: true,
        complianceRequirement: 'SOC2',
        createdAt: '2023-01-15',
        lastModified: '2023-10-20'
      },
      {
        id: 2,
        name: 'User Authentication',
        description: 'User login and authentication events',
        eventType: 'USER_LOGIN',
        retentionPeriod: 90,
        retentionUnit: 'days',
        archiveBeforeDelete: true,
        complianceRequirement: 'GDPR',
        createdAt: '2023-03-10',
        lastModified: '2023-10-15'
      },
      {
        id: 3,
        name: 'System Operations',
        description: 'General system operation events',
        eventType: 'SYSTEM_UPDATE',
        retentionPeriod: 30,
        retentionUnit: 'days',
        archiveBeforeDelete: false,
        complianceRequirement: '',
        createdAt: '2023-05-01',
        lastModified: '2023-09-30'
      }
    ];

    const mockStorageStats = {
      totalLogs: 1250000,
      totalSize: '2.4 TB',
      archivedLogs: 875000,
      archivedSize: '1.7 TB',
      activeLogs: 375000,
      activeSize: '0.7 TB',
      projectedSavings: '$12,500/year'
    };

    setPolicies(mockPolicies);
    setStorageStats(mockStorageStats);
  }, []);

  const eventTypeOptions = [
    'All Events',
    'USER_LOGIN',
    'FILE_ACCESS',
    'DATA_MODIFICATION',
    'SYSTEM_UPDATE',
    'SECURITY_ALERT',
    'API_CALL',
    'PERMISSION_CHANGE'
  ];

  const complianceOptions = [
    '',
    'GDPR',
    'HIPAA',
    'SOC2',
    'PCI DSS',
    'ISO 27001'
  ];

  const handleCreatePolicy = () => {
    if (!newPolicy.name.trim()) return;

    const policy = {
      id: Date.now(),
      ...newPolicy,
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0]
    };

    setPolicies(prev => [...prev, policy]);
    resetForm();
  };

  const handleUpdatePolicy = () => {
    if (!newPolicy.name.trim()) return;

    setPolicies(prev =>
      prev.map(policy =>
        policy.id === editingPolicyId
          ? {
              ...policy,
              ...newPolicy,
              lastModified: new Date().toISOString().split('T')[0]
            }
          : policy
      )
    );

    resetForm();
  };

  const handleEditPolicy = (policy) => {
    setNewPolicy({
      name: policy.name,
      description: policy.description,
      eventType: policy.eventType,
      retentionPeriod: policy.retentionPeriod,
      retentionUnit: policy.retentionUnit,
      archiveBeforeDelete: policy.archiveBeforeDelete,
      complianceRequirement: policy.complianceRequirement
    });
    setEditingPolicyId(policy.id);
    setIsEditing(true);
  };

  const handleDeletePolicy = (policyId) => {
    if (window.confirm('Are you sure you want to delete this retention policy?')) {
      setPolicies(prev => prev.filter(policy => policy.id !== policyId));
    }
  };

  const resetForm = () => {
    setNewPolicy({
      name: '',
      description: '',
      eventType: '',
      retentionPeriod: 30,
      retentionUnit: 'days',
      archiveBeforeDelete: true,
      complianceRequirement: ''
    });
    setIsEditing(false);
    setEditingPolicyId(null);
  };

  const handleInputChange = (field, value) => {
    setNewPolicy(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="log-retention-manager">
      <div className="header">
        <h2>Log Retention Policy Manager</h2>
        <p>Configure and manage data retention policies for audit logs</p>
      </div>

      <div className="storage-overview">
        <h3>Storage Overview</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Total Logs</h4>
            <p className="stat-value">{storageStats.totalLogs?.toLocaleString()}</p>
            <p className="stat-size">{storageStats.totalSize}</p>
          </div>
          <div className="stat-card">
            <h4>Active Logs</h4>
            <p className="stat-value">{storageStats.activeLogs?.toLocaleString()}</p>
            <p className="stat-size">{storageStats.activeSize}</p>
          </div>
          <div className="stat-card">
            <h4>Archived Logs</h4>
            <p className="stat-value">{storageStats.archivedLogs?.toLocaleString()}</p>
            <p className="stat-size">{storageStats.archivedSize}</p>
          </div>
          <div className="stat-card">
            <h4>Annual Savings</h4>
            <p className="stat-value">{storageStats.projectedSavings}</p>
            <p className="stat-description">With current policies</p>
          </div>
        </div>
      </div>

      <div className="policy-form-section">
        <h3>{isEditing ? 'Edit Retention Policy' : 'Create New Retention Policy'}</h3>
        <div className="policy-form">
          <div className="form-row">
            <div className="form-group">
              <label>Policy Name *</label>
              <input
                type="text"
                value={newPolicy.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter policy name"
              />
            </div>

            <div className="form-group">
              <label>Event Type</label>
              <select
                value={newPolicy.eventType}
                onChange={(e) => handleInputChange('eventType', e.target.value)}
              >
                {eventTypeOptions.map(type => (
                  <option key={type} value={type === 'All Events' ? '' : type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newPolicy.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the purpose of this policy"
                rows="3"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Retention Period</label>
              <div className="retention-input">
                <input
                  type="number"
                  value={newPolicy.retentionPeriod}
                  onChange={(e) => handleInputChange('retentionPeriod', Number(e.target.value))}
                  min="1"
                />
                <select
                  value={newPolicy.retentionUnit}
                  onChange={(e) => handleInputChange('retentionUnit', e.target.value)}
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Compliance Requirement</label>
              <select
                value={newPolicy.complianceRequirement}
                onChange={(e) => handleInputChange('complianceRequirement', e.target.value)}
              >
                {complianceOptions.map(option => (
                  <option key={option} value={option}>
                    {option || 'None'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={newPolicy.archiveBeforeDelete}
                  onChange={(e) => handleInputChange('archiveBeforeDelete', e.target.checked)}
                />
                Archive logs before deletion
              </label>
              <p className="help-text">
                Archiving preserves logs in long-term storage before deletion
              </p>
            </div>
          </div>

          <div className="form-actions">
            {isEditing ? (
              <>
                <button className="primary-btn" onClick={handleUpdatePolicy}>
                  Update Policy
                </button>
                <button className="secondary-btn" onClick={resetForm}>
                  Cancel
                </button>
              </>
            ) : (
              <button className="primary-btn" onClick={handleCreatePolicy}>
                Create Policy
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="policies-list">
        <h3>Active Retention Policies</h3>
        {policies.length > 0 ? (
          <div className="policies-grid">
            {policies.map(policy => (
              <div key={policy.id} className="policy-card">
                <div className="policy-header">
                  <h4>{policy.name}</h4>
                  {policy.complianceRequirement && (
                    <span className="compliance-tag">
                      {policy.complianceRequirement}
                    </span>
                  )}
                </div>
                <div className="policy-details">
                  <p className="policy-description">{policy.description}</p>
                  <div className="policy-meta">
                    <div className="meta-item">
                      <span className="meta-label">Event Type:</span>
                      <span className="meta-value">
                        {policy.eventType || 'All Events'}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Retention:</span>
                      <span className="meta-value">
                        {policy.retentionPeriod} {policy.retentionUnit}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Archive:</span>
                      <span className="meta-value">
                        {policy.archiveBeforeDelete ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="policy-footer">
                  <span className="created-date">
                    Created: {policy.createdAt}
                  </span>
                  <div className="policy-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditPolicy(policy)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeletePolicy(policy.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-policies">
            <p>No retention policies configured</p>
            <button className="primary-btn" onClick={resetForm}>
              Create Your First Policy
            </button>
          </div>
        )}
      </div>

      <div className="retention-schedule">
        <h3>Upcoming Retention Events</h3>
        <div className="schedule-table-container">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Policy</th>
                <th>Event Type</th>
                <th>Records Affected</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2023-11-15</td>
                <td>System Operations</td>
                <td>SYSTEM_UPDATE</td>
                <td>12,500</td>
                <td>Archive</td>
              </tr>
              <tr>
                <td>2023-11-20</td>
                <td>User Authentication</td>
                <td>USER_LOGIN</td>
                <td>45,200</td>
                <td>Delete</td>
              </tr>
              <tr>
                <td>2023-12-01</td>
                <td>Security Events</td>
                <td>SECURITY_ALERT</td>
                <td>1,800</td>
                <td>Archive</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LogRetentionManager;