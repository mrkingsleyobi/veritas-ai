import React, { useState } from 'react';
import { useTenant } from './TenantContext';
import './UserManagement.css';

const UserManagement = () => {
  const { currentTenant } = useTenant();
  const [users, setUsers] = useState([
    {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@acme.com',
      role: 'owner',
      status: 'active',
      lastActive: '2023-06-15',
      avatar: 'JD'
    },
    {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@acme.com',
      role: 'admin',
      status: 'active',
      lastActive: '2023-06-14',
      avatar: 'JS'
    },
    {
      id: 'user-3',
      name: 'Bob Johnson',
      email: 'bob@acme.com',
      role: 'member',
      status: 'pending',
      lastActive: '2023-06-10',
      avatar: 'BJ'
    },
    {
      id: 'user-4',
      name: 'Alice Williams',
      email: 'alice@acme.com',
      role: 'member',
      status: 'active',
      lastActive: '2023-06-12',
      avatar: 'AW'
    }
  ]);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  const handleInviteUser = () => {
    setIsInviteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsInviteModalOpen(false);
    setInviteEmail('');
  };

  const handleSendInvite = (e) => {
    e.preventDefault();

    // In a real app, this would send an API request
    const newUser = {
      id: `user-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'pending',
      lastActive: 'Never',
      avatar: inviteEmail.charAt(0).toUpperCase()
    };

    setUsers(prev => [...prev, newUser]);
    handleCloseModal();
  };

  const handleRoleChange = (userId, newRole) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
  };

  const handleRemoveUser = (userId) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  if (!currentTenant) {
    return <div className="user-management-placeholder">Select a tenant to manage users</div>;
  }

  return (
    <div className="user-management">
      <div className="panel-header">
        <h2>User Management</h2>
        <button className="invite-btn" onClick={handleInviteUser}>
          + Invite User
        </button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">{user.avatar}</div>
                    <span className="user-name">{user.name}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="role-select"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>
                </td>
                <td>
                  <span className={`status-badge status-${user.status}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.lastActive}</td>
                <td>
                  {user.status !== 'owner' && (
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isInviteModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invite User</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSendInvite} className="invite-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;