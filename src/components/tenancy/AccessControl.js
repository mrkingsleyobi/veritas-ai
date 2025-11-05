import React, { useState } from 'react';
import { useTenant } from './TenantContext';
import './AccessControl.css';

const AccessControl = () => {
  const { currentTenant } = useTenant();
  const [activeTab, setActiveTab] = useState('roles');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const [roles, setRoles] = useState([
    {
      id: 'role-1',
      name: 'Owner',
      description: 'Full access to all resources and settings',
      permissions: [
        'manage_tenant',
        'manage_users',
        'manage_billing',
        'manage_settings',
        'view_reports',
        'manage_resources'
      ],
      userCount: 1
    },
    {
      id: 'role-2',
      name: 'Admin',
      description: 'Can manage users and resources but not billing',
      permissions: [
        'manage_users',
        'manage_resources',
        'view_reports'
      ],
      userCount: 2
    },
    {
      id: 'role-3',
      name: 'Member',
      description: 'Can view and use resources',
      permissions: [
        'view_resources',
        'use_resources'
      ],
      userCount: 5
    },
    {
      id: 'role-4',
      name: 'Viewer',
      description: 'Read-only access to resources',
      permissions: [
        'view_resources'
      ],
      userCount: 3
    }
  ]);

  const [permissions, setPermissions] = useState([
    { id: 'manage_tenant', name: 'Manage Tenant', category: 'Administration' },
    { id: 'manage_users', name: 'Manage Users', category: 'Administration' },
    { id: 'manage_billing', name: 'Manage Billing', category: 'Administration' },
    { id: 'manage_settings', name: 'Manage Settings', category: 'Administration' },
    { id: 'view_reports', name: 'View Reports', category: 'Analytics' },
    { id: 'manage_resources', name: 'Manage Resources', category: 'Resources' },
    { id: 'view_resources', name: 'View Resources', category: 'Resources' },
    { id: 'use_resources', name: 'Use Resources', category: 'Resources' },
    { id: 'create_projects', name: 'Create Projects', category: 'Projects' },
    { id: 'delete_projects', name: 'Delete Projects', category: 'Projects' },
    { id: 'manage_teams', name: 'Manage Teams', category: 'Teams' },
    { id: 'view_teams', name: 'View Teams', category: 'Teams' }
  ]);

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const tabs = [
    { id: 'roles', label: 'Roles' },
    { id: 'permissions', label: 'Permissions' },
    { id: 'policies', label: 'Policies' }
  ];

  const handleCreateRole = () => {
    setEditingRole(null);
    setNewRole({
      name: '',
      description: '',
      permissions: []
    });
    setIsRoleModalOpen(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions]
    });
    setIsRoleModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsRoleModalOpen(false);
    setEditingRole(null);
  };

  const handleRoleChange = (e) => {
    const { name, value } = e.target;
    setNewRole(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionToggle = (permissionId) => {
    setNewRole(prev => {
      const permissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId];

      return {
        ...prev,
        permissions
      };
    });
  };

  const handleSaveRole = () => {
    if (editingRole) {
      // Update existing role
      setRoles(prev =>
        prev.map(role =>
          role.id === editingRole.id
            ? {
                ...role,
                name: newRole.name,
                description: newRole.description,
                permissions: newRole.permissions
              }
            : role
        )
      );
    } else {
      // Create new role
      const role = {
        id: `role-${Date.now()}`,
        ...newRole,
        userCount: 0
      };
      setRoles(prev => [...prev, role]);
    }

    handleCloseModal();
  };

  const handleDeleteRole = (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      setRoles(prev => prev.filter(role => role.id !== roleId));
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  if (!currentTenant) {
    return <div className="access-control-placeholder">Select a tenant to manage access control</div>;
  }

  return (
    <div className="access-control">
      <div className="panel-header">
        <h2>Access Control</h2>
        <button className="create-btn" onClick={handleCreateRole}>
          + Create Role
        </button>
      </div>

      <div className="access-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="access-content">
        {activeTab === 'roles' && (
          <div className="roles-section">
            <div className="roles-grid">
              {roles.map(role => (
                <div key={role.id} className="role-card">
                  <div className="role-header">
                    <h3>{role.name}</h3>
                    <span className="user-count">{role.userCount} users</span>
                  </div>
                  <p className="role-description">{role.description}</p>
                  <div className="role-permissions">
                    <h4>Permissions:</h4>
                    <ul>
                      {role.permissions.slice(0, 3).map(permissionId => {
                        const permission = permissions.find(p => p.id === permissionId);
                        return permission ? (
                          <li key={permissionId}>{permission.name}</li>
                        ) : null;
                      })}
                      {role.permissions.length > 3 && (
                        <li>+ {role.permissions.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                  <div className="role-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditRole(role)}
                    >
                      Edit
                    </button>
                    {role.name !== 'Owner' && role.name !== 'Admin' && (
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="permissions-section">
            <div className="permissions-grid">
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                <div key={category} className="permission-category">
                  <h3>{category}</h3>
                  <div className="permission-list">
                    {categoryPermissions.map(permission => (
                      <div key={permission.id} className="permission-item">
                        <div className="permission-info">
                          <h4>{permission.name}</h4>
                          <span className="permission-id">{permission.id}</span>
                        </div>
                        <div className="permission-actions">
                          <button className="view-btn">View Details</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'policies' && (
          <div className="policies-section">
            <div className="policy-card">
              <h3>Default Access Policy</h3>
              <p>Controls default access for new users and resources</p>
              <div className="policy-settings">
                <div className="setting">
                  <label>New User Default Role</label>
                  <select>
                    <option>Member</option>
                    <option>Viewer</option>
                  </select>
                </div>
                <div className="setting">
                  <label>Resource Access</label>
                  <select>
                    <option>Private by default</option>
                    <option>Team access by default</option>
                    <option>Public read access</option>
                  </select>
                </div>
              </div>
              <button className="save-policy-btn">Save Policy</button>
            </div>

            <div className="policy-card">
              <h3>Session Policies</h3>
              <p>Controls session security and timeout settings</p>
              <div className="policy-settings">
                <div className="setting">
                  <label>Session Timeout</label>
                  <select>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>4 hours</option>
                    <option>8 hours</option>
                    <option>24 hours</option>
                  </select>
                </div>
                <div className="setting">
                  <label>Concurrent Sessions</label>
                  <select>
                    <option>Unlimited</option>
                    <option>Limit to 3</option>
                    <option>Limit to 5</option>
                    <option>Single session only</option>
                  </select>
                </div>
              </div>
              <button className="save-policy-btn">Save Policy</button>
            </div>
          </div>
        )}
      </div>

      {isRoleModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingRole ? 'Edit Role' : 'Create New Role'}</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <div className="role-form">
              <div className="form-group">
                <label htmlFor="roleName">Role Name</label>
                <input
                  type="text"
                  id="roleName"
                  name="name"
                  value={newRole.name}
                  onChange={handleRoleChange}
                  placeholder="e.g., Developer, Manager"
                />
              </div>

              <div className="form-group">
                <label htmlFor="roleDescription">Description</label>
                <textarea
                  id="roleDescription"
                  name="description"
                  value={newRole.description}
                  onChange={handleRoleChange}
                  placeholder="Describe the purpose of this role"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Permissions</label>
                <div className="permissions-selector">
                  {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                    <div key={category} className="permission-category">
                      <h4>{category}</h4>
                      {categoryPermissions.map(permission => (
                        <div key={permission.id} className="permission-checkbox">
                          <label>
                            <input
                              type="checkbox"
                              checked={newRole.permissions.includes(permission.id)}
                              onChange={() => handlePermissionToggle(permission.id)}
                            />
                            <span>{permission.name}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="button" className="save-btn" onClick={handleSaveRole}>
                  {editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessControl;