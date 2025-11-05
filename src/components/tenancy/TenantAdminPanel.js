import React, { useState } from 'react';
import { useTenant } from './TenantContext';
import './TenantAdminPanel.css';

const TenantAdminPanel = () => {
  const { tenants, addTenant, updateTenant, removeTenant } = useTenant();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    plan: 'free',
    role: 'member'
  });

  const handleCreateTenant = () => {
    setEditingTenant(null);
    setFormData({
      name: '',
      slug: '',
      plan: 'free',
      role: 'member'
    });
    setIsModalOpen(true);
  };

  const handleEditTenant = (tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan,
      role: tenant.role
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTenant(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingTenant) {
      // Update existing tenant
      updateTenant(editingTenant.id, {
        ...formData,
        usage: editingTenant.usage,
        limits: editingTenant.limits
      });
    } else {
      // Create new tenant
      const newTenant = {
        id: `tenant-${Date.now()}`,
        ...formData,
        usage: {
          storage: 0,
          users: 1,
          resources: 0
        },
        limits: {
          storage: formData.plan === 'free' ? 10 :
                  formData.plan === 'professional' ? 50 :
                  formData.plan === 'business' ? 200 : 500,
          users: formData.plan === 'free' ? 5 :
                 formData.plan === 'professional' ? 25 :
                 formData.plan === 'business' ? 100 : 500,
          resources: formData.plan === 'free' ? 5 :
                     formData.plan === 'professional' ? 25 :
                     formData.plan === 'business' ? 50 : 200
        }
      };
      addTenant(newTenant);
    }

    handleCloseModal();
  };

  const handleDeleteTenant = (tenantId) => {
    if (window.confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      removeTenant(tenantId);
    }
  };

  return (
    <div className="tenant-admin-panel">
      <div className="panel-header">
        <h2>Tenant Management</h2>
        <button className="create-btn" onClick={handleCreateTenant}>
          + Create Tenant
        </button>
      </div>

      <div className="tenants-grid">
        {tenants.map(tenant => (
          <div key={tenant.id} className="tenant-card">
            <div className="tenant-card-header">
              <div className="tenant-card-avatar">
                {tenant.name.charAt(0)}
              </div>
              <div className="tenant-card-info">
                <h3>{tenant.name}</h3>
                <span className={`plan-badge plan-${tenant.plan}`}>
                  {tenant.plan}
                </span>
              </div>
            </div>

            <div className="tenant-card-details">
              <div className="detail-row">
                <span className="label">Role:</span>
                <span className="value">{tenant.role}</span>
              </div>
              <div className="detail-row">
                <span className="label">Slug:</span>
                <span className="value">{tenant.slug}</span>
              </div>
              <div className="detail-row">
                <span className="label">Users:</span>
                <span className="value">{tenant.usage.users} / {tenant.limits.users}</span>
              </div>
              <div className="detail-row">
                <span className="label">Storage:</span>
                <span className="value">{tenant.usage.storage} / {tenant.limits.storage} GB</span>
              </div>
            </div>

            <div className="tenant-card-actions">
              <button
                className="edit-btn"
                onClick={() => handleEditTenant(tenant)}
              >
                Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDeleteTenant(tenant.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTenant ? 'Edit Tenant' : 'Create New Tenant'}</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="tenant-form">
              <div className="form-group">
                <label htmlFor="name">Tenant Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="slug">Slug</label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="plan">Plan</label>
                <select
                  id="plan"
                  name="plan"
                  value={formData.plan}
                  onChange={handleInputChange}
                >
                  <option value="free">Free</option>
                  <option value="professional">Professional</option>
                  <option value="business">Business</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingTenant ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantAdminPanel;