import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import './RBACStyles.css';

const RoleManager = () => {
  const { user, roles, permissions, updateRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState('');
  const [availableRoles] = useState([
    { id: 'admin', name: 'Administrator', description: 'Full access to all features' },
    { id: 'manager', name: 'Manager', description: 'Manage teams and projects' },
    { id: 'member', name: 'Member', description: 'Standard user access' },
    { id: 'viewer', name: 'Viewer', description: 'Read-only access' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user && user.role) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleRoleChange = async (e) => {
    const newRole = e.target.value;
    if (!newRole) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateRole(newRole);
      setSelectedRole(newRole);
      setSuccess('Role updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const getUserPermissions = () => {
    if (!user || !user.role) return [];
    return permissions.filter(p => p.role === user.role);
  };

  const hasPermission = (permission) => {
    const userPermissions = getUserPermissions();
    return userPermissions.some(p => p.id === permission);
  };

  return (
    <div className="rbac-container">
      <div className="rbac-card">
        <h2>Role-Based Access Control</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="role-section">
          <h3>Current Role</h3>
          <div className="current-role">
            <select
              value={selectedRole}
              onChange={handleRoleChange}
              disabled={loading}
              className="role-select"
            >
              <option value="">Select a role</option>
              {availableRoles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {loading && <div className="loading-spinner"></div>}
          </div>

          {selectedRole && (
            <div className="role-details">
              <h4>{availableRoles.find(r => r.id === selectedRole)?.name}</h4>
              <p>{availableRoles.find(r => r.id === selectedRole)?.description}</p>
            </div>
          )}
        </div>

        <div className="permissions-section">
          <h3>Your Permissions</h3>
          <div className="permissions-grid">
            {getUserPermissions().map(permission => (
              <div key={permission.id} className="permission-item">
                <div className="permission-name">{permission.name}</div>
                <div className="permission-description">{permission.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="role-info">
          <h3>Role Information</h3>
          <div className="roles-list">
            {availableRoles.map(role => (
              <div
                key={role.id}
                className={`role-item ${selectedRole === role.id ? 'active' : ''}`}
              >
                <div className="role-header">
                  <h4>{role.name}</h4>
                  {selectedRole === role.id && <span className="current-role-badge">Current</span>}
                </div>
                <p>{role.description}</p>
                <div className="role-permissions">
                  <h5>Permissions:</h5>
                  <ul>
                    {permissions
                      .filter(p => p.role === role.id)
                      .map(p => (
                        <li key={p.id}>{p.name}</li>
                      ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManager;