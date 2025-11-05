import React from 'react';
import { useTenant } from './TenantContext';
import './ResourceUsage.css';

const ResourceUsage = () => {
  const { currentTenant } = useTenant();

  if (!currentTenant) {
    return <div className="resource-usage-placeholder">Select a tenant to view resource usage</div>;
  }

  const { usage, limits } = currentTenant;

  const getResourcePercentage = (used, limit) => {
    return Math.min(100, Math.round((used / limit) * 100));
  };

  const getResourceColor = (percentage) => {
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'success';
  };

  const resources = [
    {
      name: 'Storage',
      icon: '💾',
      used: usage.storage,
      limit: limits.storage,
      unit: 'GB'
    },
    {
      name: 'Users',
      icon: '👥',
      used: usage.users,
      limit: limits.users,
      unit: ''
    },
    {
      name: 'Resources',
      icon: '⚙️',
      used: usage.resources,
      limit: limits.resources,
      unit: ''
    }
  ];

  return (
    <div className="resource-usage">
      <div className="panel-header">
        <h2>Resource Usage</h2>
        <div className="plan-info">
          <span className={`plan-badge plan-${currentTenant.plan}`}>
            {currentTenant.plan} Plan
          </span>
        </div>
      </div>

      <div className="resources-grid">
        {resources.map((resource, index) => {
          const percentage = getResourcePercentage(resource.used, resource.limit);
          const colorClass = getResourceColor(percentage);

          return (
            <div key={index} className="resource-card">
              <div className="resource-header">
                <span className="resource-icon">{resource.icon}</span>
                <h3 className="resource-name">{resource.name}</h3>
              </div>

              <div className="resource-stats">
                <div className="usage-text">
                  <span className="used">{resource.used}</span>
                  <span className="separator">/</span>
                  <span className="limit">{resource.limit} {resource.unit}</span>
                </div>
                <div className="percentage">{percentage}%</div>
              </div>

              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div
                    className={`progress-fill progress-${colorClass}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="resource-actions">
                {percentage >= 90 && (
                  <button className="upgrade-btn">
                    Upgrade Plan
                  </button>
                )}
                <button className="view-details-btn">
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="usage-details">
        <h3>Usage History</h3>
        <div className="usage-chart">
          <div className="chart-grid">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="chart-bar">
                <div
                  className="bar-fill"
                  style={{
                    height: `${Math.floor(Math.random() * 80) + 10}%`,
                    backgroundColor: i === 6 ? '#0070f3' : '#e1e5e9'
                  }}
                ></div>
                <div className="bar-label">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceUsage;