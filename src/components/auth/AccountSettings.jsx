import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import SessionManager from './session/SessionManager';
import './AuthStyles.css';

const AccountSettings = () => {
  const { user, updatePassword, deleteAccount } = useAuth();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [activeTab, setActiveTab] = useState('password');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE MY ACCOUNT') {
      setError('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await deleteAccount();
      // User will be redirected to login page after account deletion
    } catch (err) {
      setError(err.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Account Settings</h2>
        <p>Manage your account preferences and security settings</p>
      </div>

      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Password
        </button>
        <button
          className={`tab-button ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          Active Sessions
        </button>
        <button
          className={`tab-button ${activeTab === 'delete' ? 'active' : ''}`}
          onClick={() => setActiveTab('delete')}
        >
          Delete Account
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {activeTab === 'password' && (
        <div className="settings-section">
          <h3>Change Password</h3>
          <form onSubmit={handlePasswordChange} className="auth-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordInputChange}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordInputChange}
                required
                disabled={loading}
                autoComplete="new-password"
              />
              <small className="form-hint">Must be at least 8 characters</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordInputChange}
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="settings-section">
          <h3>Active Sessions</h3>
          <SessionManager />
        </div>
      )}

      {activeTab === 'delete' && (
        <div className="settings-section">
          <h3>Delete Account</h3>
          <div className="delete-warning">
            <p><strong>Warning:</strong> This action is irreversible. All your data will be permanently deleted.</p>
            <p>Please type "DELETE MY ACCOUNT" to confirm:</p>

            <div className="form-group">
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                disabled={loading}
                placeholder="DELETE MY ACCOUNT"
              />
            </div>

            <button
              onClick={handleDeleteAccount}
              className="danger-button"
              disabled={loading || deleteConfirm !== 'DELETE MY ACCOUNT'}
            >
              {loading ? 'Deleting...' : 'Delete Account Permanently'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;