import React, { useState } from 'react';
import { useTenant } from './TenantContext';
import './AuditLogs.css';

const AuditLogs = () => {
  const { currentTenant } = useTenant();
  const [filters, setFilters] = useState({
    user: '',
    action: '',
    dateRange: '7d',
    resource: ''
  });

  const [logs] = useState([
    {
      id: 'log-1',
      timestamp: '2023-06-15T14:30:22Z',
      user: 'John Doe',
      action: 'CREATE',
      resource: 'Project',
      resourceId: 'proj-123',
      details: 'Created new project "Marketing Campaign"',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    {
      id: 'log-2',
      timestamp: '2023-06-15T13:45:17Z',
      user: 'Jane Smith',
      action: 'UPDATE',
      resource: 'User',
      resourceId: 'user-456',
      details: 'Updated user role to Admin',
      ip: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    {
      id: 'log-3',
      timestamp: '2023-06-15T12:20:05Z',
      user: 'Bob Johnson',
      action: 'DELETE',
      resource: 'File',
      resourceId: 'file-789',
      details: 'Deleted file "confidential.pdf"',
      ip: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    {
      id: 'log-4',
      timestamp: '2023-06-15T11:15:33Z',
      user: 'Alice Williams',
      action: 'LOGIN',
      resource: 'Authentication',
      resourceId: 'auth-101',
      details: 'Successful login',
      ip: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)'
    },
    {
      id: 'log-5',
      timestamp: '2023-06-15T10:05:41Z',
      user: 'John Doe',
      action: 'UPDATE',
      resource: 'Settings',
      resourceId: 'settings-202',
      details: 'Changed notification preferences',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    {
      id: 'log-6',
      timestamp: '2023-06-14T16:42:18Z',
      user: 'Jane Smith',
      action: 'CREATE',
      resource: 'Team',
      resourceId: 'team-303',
      details: 'Created new team "Design Group"',
      ip: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    {
      id: 'log-7',
      timestamp: '2023-06-14T15:30:09Z',
      user: 'Bob Johnson',
      action: 'UPDATE',
      resource: 'Billing',
      resourceId: 'billing-404',
      details: 'Updated payment method',
      ip: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    {
      id: 'log-8',
      timestamp: '2023-06-14T14:22:55Z',
      user: 'Alice Williams',
      action: 'DELETE',
      resource: 'Project',
      resourceId: 'proj-505',
      details: 'Deleted project "Old Campaign"',
      ip: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)'
    }
  ]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExport = () => {
    // In a real app, this would export the logs
    alert('Exporting audit logs...');
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionClass = (action) => {
    switch (action) {
      case 'CREATE': return 'action-create';
      case 'UPDATE': return 'action-update';
      case 'DELETE': return 'action-delete';
      case 'LOGIN': return 'action-login';
      default: return 'action-other';
    }
  };

  if (!currentTenant) {
    return <div className="audit-logs-placeholder">Select a tenant to view audit logs</div>;
  }

  return (
    <div className="audit-logs">
      <div className="panel-header">
        <h2>Audit Logs</h2>
        <button className="export-btn" onClick={handleExport}>
          Export Logs
        </button>
      </div>

      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="user">User</label>
            <input
              type="text"
              id="user"
              name="user"
              value={filters.user}
              onChange={handleFilterChange}
              placeholder="Filter by user"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="action">Action</label>
            <select
              id="action"
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="dateRange">Date Range</label>
            <select
              id="dateRange"
              name="dateRange"
              value={filters.dateRange}
              onChange={handleFilterChange}
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="resource">Resource</label>
            <input
              type="text"
              id="resource"
              name="resource"
              value={filters.resource}
              onChange={handleFilterChange}
              placeholder="Filter by resource"
            />
          </div>
        </div>

        <div className="results-info">
          Showing {logs.length} of {logs.length} logs
        </div>
      </div>

      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Details</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td className="timestamp-cell">
                  {formatTimestamp(log.timestamp)}
                </td>
                <td className="user-cell">
                  {log.user}
                </td>
                <td className="action-cell">
                  <span className={`action-badge ${getActionClass(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="resource-cell">
                  <div className="resource-info">
                    <span className="resource-type">{log.resource}</span>
                    <span className="resource-id">{log.resourceId}</span>
                  </div>
                </td>
                <td className="details-cell">
                  {log.details}
                </td>
                <td className="ip-cell">
                  {log.ip}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button className="pagination-btn" disabled>Previous</button>
        <span className="pagination-info">Page 1 of 1</span>
        <button className="pagination-btn" disabled>Next</button>
      </div>
    </div>
  );
};

export default AuditLogs;