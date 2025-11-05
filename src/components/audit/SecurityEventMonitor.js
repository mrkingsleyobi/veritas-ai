import React, { useState, useEffect } from 'react';

const SecurityEventMonitor = () => {
  const [securityEvents, setSecurityEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [isMonitoring, setIsMonitoring] = useState(true);

  // Mock security events data
  useEffect(() => {
    const mockEvents = [
      {
        id: 1,
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        type: 'Failed Login',
        description: 'Multiple failed login attempts detected',
        severity: 'high',
        source: '192.168.1.100',
        user: 'john.doe@example.com',
        action: 'BLOCKED'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        type: 'Data Access',
        description: 'Unusual data access pattern detected',
        severity: 'medium',
        source: '10.0.0.50',
        user: 'sarah.j@example.com',
        action: 'MONITORED'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        type: 'File Modification',
        description: 'Unauthorized file modification attempt',
        severity: 'high',
        source: '172.16.0.25',
        user: 'mike.w@example.com',
        action: 'BLOCKED'
      },
      {
        id: 4,
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        type: 'System Access',
        description: 'Access from unusual geographic location',
        severity: 'medium',
        source: '203.0.113.45',
        user: 'guest@example.com',
        action: 'RESTRICTED'
      },
      {
        id: 5,
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        type: 'Privilege Escalation',
        description: 'Attempted privilege escalation detected',
        severity: 'critical',
        source: '198.51.100.12',
        user: 'admin@example.com',
        action: 'TERMINATED'
      }
    ];

    const mockAlerts = [
      {
        id: 101,
        title: 'Unusual Login Activity',
        description: '30 failed login attempts in the last 5 minutes',
        severity: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        status: 'active'
      },
      {
        id: 102,
        title: 'Data Exfiltration Attempt',
        description: 'Large data transfer to external IP detected',
        severity: 'critical',
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        status: 'investigating'
      },
      {
        id: 103,
        title: 'Suspicious File Access',
        description: 'Access to sensitive files outside business hours',
        severity: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        status: 'resolved'
      }
    ];

    setSecurityEvents(mockEvents);
    setAlerts(mockAlerts);
  }, []);

  // Simulate real-time monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // Generate a mock security event
      const eventTypes = ['Failed Login', 'Data Access', 'File Modification', 'System Access', 'Privilege Escalation'];
      const severities = ['low', 'medium', 'high', 'critical'];
      const actions = ['MONITORED', 'BLOCKED', 'RESTRICTED', 'TERMINATED', 'ALERTED'];

      const newEvent = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        description: 'New security event detected',
        severity: severities[Math.floor(Math.random() * severities.length)],
        source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        user: `user${Math.floor(Math.random() * 1000)}@example.com`,
        action: actions[Math.floor(Math.random() * actions.length)]
      };

      setSecurityEvents(prev => [newEvent, ...prev.slice(0, 19)]);
    }, 10000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const filteredEvents = severityFilter === 'all'
    ? securityEvents
    : securityEvents.filter(event => event.severity === severityFilter);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#fbc02d';
      case 'low': return '#388e3c';
      default: return '#9e9e9e';
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'critical': return 'Critical';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Unknown';
    }
  };

  return (
    <div className="security-event-monitor">
      <div className="monitor-header">
        <h2>Security Event Monitor</h2>
        <div className="monitor-controls">
          <button
            className={isMonitoring ? 'monitoring-active' : 'monitoring-inactive'}
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? 'Pause Monitoring' : 'Resume Monitoring'}
          </button>
        </div>
      </div>

      <div className="alerts-section">
        <h3>Active Security Alerts</h3>
        <div className="alerts-container">
          {alerts.filter(alert => alert.status !== 'resolved').map(alert => (
            <div key={alert.id} className={`alert-card severity-${alert.severity}`}>
              <div className="alert-header">
                <h4>{alert.title}</h4>
                <span
                  className="alert-severity"
                  style={{ backgroundColor: getSeverityColor(alert.severity) }}
                >
                  {getSeverityLabel(alert.severity)}
                </span>
              </div>
              <p className="alert-description">{alert.description}</p>
              <div className="alert-footer">
                <span className="alert-time">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
                <span className={`alert-status status-${alert.status}`}>
                  {alert.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="events-filter">
        <div className="filter-group">
          <label>Severity:</label>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="1h">Last 1 Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="events-table-container">
        <h3>Recent Security Events</h3>
        <table className="events-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Event Type</th>
              <th>Description</th>
              <th>Severity</th>
              <th>Source IP</th>
              <th>User</th>
              <th>Action Taken</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <tr key={event.id} className={`event-row severity-${event.severity}`}>
                  <td>{new Date(event.timestamp).toLocaleString()}</td>
                  <td>{event.type}</td>
                  <td>{event.description}</td>
                  <td>
                    <span
                      className="severity-badge"
                      style={{ backgroundColor: getSeverityColor(event.severity) }}
                    >
                      {getSeverityLabel(event.severity)}
                    </span>
                  </td>
                  <td>{event.source}</td>
                  <td>{event.user}</td>
                  <td>
                    <span className={`action-badge action-${event.action.toLowerCase()}`}>
                      {event.action}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-events">
                  No security events found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SecurityEventMonitor;