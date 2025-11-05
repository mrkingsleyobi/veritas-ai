import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import './SessionStyles.css';

const SessionManager = () => {
  const {
    user,
    sessions,
    currentSession,
    refreshSession,
    logout,
    logoutAllSessions,
    logoutSession
  } = useAuth();

  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessions) {
      setActiveSessions(sessions.filter(session => session.isActive));
    }
  }, [sessions]);

  const handleRefresh = async () => {
    setLoading(true);
    setError('');

    try {
      await refreshSession();
    } catch (err) {
      setError(err.message || 'Failed to refresh session');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Are you sure you want to logout from all devices?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await logoutAllSessions();
    } catch (err) {
      setError(err.message || 'Failed to logout from all sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutSession = async (sessionId) => {
    setLoading(true);
    setError('');

    try {
      await logoutSession(sessionId);
    } catch (err) {
      setError(err.message || 'Failed to logout from session');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const isCurrentSession = (session) => {
    return currentSession && session.id === currentSession.id;
  };

  return (
    <div className="session-manager">
      <div className="session-header">
        <h2>Active Sessions</h2>
        <div className="session-actions">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="secondary-button"
          >
            {loading ? 'Refreshing...' : 'Refresh Sessions'}
          </button>
          <button
            onClick={handleLogoutAll}
            disabled={loading}
            className="danger-button"
          >
            Logout All Devices
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="session-list">
        {activeSessions.length === 0 ? (
          <div className="empty-state">
            <p>No active sessions found</p>
          </div>
        ) : (
          activeSessions.map(session => (
            <div
              key={session.id}
              className={`session-item ${isCurrentSession(session) ? 'current-session' : ''}`}
            >
              <div className="session-info">
                <div className="session-details">
                  <div className="session-device">
                    <strong>{session.device}</strong>
                    {isCurrentSession(session) && (
                      <span className="current-badge">Current</span>
                    )}
                  </div>
                  <div className="session-location">
                    {session.location || 'Unknown location'}
                  </div>
                  <div className="session-time">
                    Last activity: {formatTime(session.lastActive)}
                  </div>
                  <div className="session-ip">
                    IP: {session.ipAddress}
                  </div>
                </div>
                <div className="session-meta">
                  <div className="session-created">
                    Created: {formatTime(session.createdAt)}
                  </div>
                  {session.expiresAt && (
                    <div className="session-expires">
                      Expires: {formatTime(session.expiresAt)}
                    </div>
                  )}
                </div>
              </div>
              <div className="session-controls">
                {!isCurrentSession(session) && (
                  <button
                    onClick={() => handleLogoutSession(session.id)}
                    disabled={loading}
                    className="danger-button small"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="session-info">
        <p>
          <strong>Security Tip:</strong> If you see any unfamiliar sessions,
          logout immediately and change your password.
        </p>
      </div>
    </div>
  );
};

export default SessionManager;