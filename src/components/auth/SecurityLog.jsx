import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import './AuthStyles.css';

const SecurityLog = () => {
  const { user, securityLogs } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (securityLogs) {
      setLogs(securityLogs);
      setFilteredLogs(securityLogs);
    }
  }, [securityLogs]);

  useEffect(() => {
    let result = [...logs];

    // Apply filter
    if (filter !== 'all') {
      result = result.filter(log => log.type === filter);
    }

    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredLogs(result);
  }, [logs, filter, sortOrder]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getLogTypeClass = (type) => {
    switch (type) {
      case 'login':
        return 'log-login';
      case 'logout':
        return 'log-logout';
      case 'failed_login':
        return 'log-failed';
      case 'password_change':
        return 'log-password';
      case 'mfa_enabled':
        return 'log-mfa';
      case 'mfa_disabled':
        return 'log-mfa';
      default:
        return 'log-default';
    }
  };

  const getLogTypeLabel = (type) => {
    switch (type) {
      case 'login':
        return 'Login';
      case 'logout':
        return 'Logout';
      case 'failed_login':
        return 'Failed Login';
      case 'password_change':
        return 'Password Change';
      case 'mfa_enabled':
        return 'MFA Enabled';
      case 'mfa_disabled':
        return 'MFA Disabled';
      default:
        return type;
    }
  };

  return (
    <div className="security-log-container">
      <div className="security-log-header">
        <h2>Security Activity Log</h2>
        <p>Review your account security events and activities</p>
      </div>

      <div className="security-log-controls">
        <div className="filter-controls">
          <label htmlFor="log-filter">Filter by type:</label>
          <select
            id="log-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Events</option>
            <option value="login">Logins</option>
            <option value="logout">Logouts</option>
            <option value="failed_login">Failed Logins</option>
            <option value="password_change">Password Changes</option>
            <option value="mfa_enabled">MFA Enabled</option>
            <option value="mfa_disabled">MFA Disabled</option>
          </select>
        </div>

        <div className="sort-controls">
          <label htmlFor="sort-order">Sort by:</label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="sort-select"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="security-log-list">
        {filteredLogs.length === 0 ? (
          <div className="empty-state">
            <p>No security events found</p>
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div key={index} className={`log-item ${getLogTypeClass(log.type)}`}>
              <div className="log-icon">
                {log.type === 'login' && '🔒'}
                {log.type === 'logout' && '🔓'}
                {log.type === 'failed_login' && '❌'}
                {log.type === 'password_change' && '🔑'}
                {log.type === 'mfa_enabled' && '🛡️'}
                {log.type === 'mfa_disabled' && '🛡️'}
                {log.type === 'default' && '📝'}
              </div>
              <div className="log-content">
                <div className="log-header">
                  <span className="log-type">{getLogTypeLabel(log.type)}</span>
                  <span className="log-timestamp">{formatTime(log.timestamp)}</span>
                </div>
                <div className="log-details">
                  <div className="log-ip">IP: {log.ipAddress || 'Unknown'}</div>
                  <div className="log-location">{log.location || 'Unknown location'}</div>
                  {log.userAgent && (
                    <div className="log-user-agent">Browser: {log.userAgent}</div>
                  )}
                  {log.message && (
                    <div className="log-message">{log.message}</div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="security-log-footer">
        <p>
          <strong>Security Tip:</strong> If you see any suspicious activity,
          change your password immediately and enable two-factor authentication.
        </p>
      </div>
    </div>
  );
};

export default SecurityLog;