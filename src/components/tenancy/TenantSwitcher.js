import React, { useState } from 'react';
import { useTenant } from './TenantContext';
import './TenantSwitcher.css';

const TenantSwitcher = () => {
  const { currentTenant, tenants, switchTenant } = useTenant();
  const [isOpen, setIsOpen] = useState(false);

  const handleTenantSelect = (tenantId) => {
    switchTenant(tenantId);
    setIsOpen(false);
  };

  if (!currentTenant) {
    return <div className="tenant-switcher-placeholder">Loading tenants...</div>;
  }

  return (
    <div className="tenant-switcher">
      <div
        className="tenant-switcher-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="tenant-info">
          <div className="tenant-avatar">
            {currentTenant.name.charAt(0)}
          </div>
          <div className="tenant-details">
            <span className="tenant-name">{currentTenant.name}</span>
            <span className="tenant-role">{currentTenant.role}</span>
          </div>
        </div>
        <div className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>
          ▼
        </div>
      </div>

      {isOpen && (
        <div className="tenant-dropdown">
          <div className="dropdown-header">
            <h3>Select Workspace</h3>
          </div>
          <div className="tenant-list">
            {tenants.map(tenant => (
              <div
                key={tenant.id}
                className={`tenant-item ${currentTenant.id === tenant.id ? 'active' : ''}`}
                onClick={() => handleTenantSelect(tenant.id)}
              >
                <div className="tenant-item-avatar">
                  {tenant.name.charAt(0)}
                </div>
                <div className="tenant-item-details">
                  <div className="tenant-item-name">{tenant.name}</div>
                  <div className="tenant-item-plan">{tenant.plan}</div>
                </div>
                {currentTenant.id === tenant.id && (
                  <div className="tenant-item-check">✓</div>
                )}
              </div>
            ))}
          </div>
          <div className="dropdown-footer">
            <button className="create-tenant-btn">
              + Create New Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantSwitcher;