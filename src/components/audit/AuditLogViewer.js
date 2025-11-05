import React, { useState, useEffect } from 'react';
import EventCategorization from './EventCategorization';
import SearchInvestigation from './SearchInvestigation';
import RealTimeLogDisplay from './RealTimeLogDisplay';

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(20);
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    eventType: '',
    userId: '',
    ipAddress: '',
    severity: ''
  });
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  // Simulate fetching logs
  useEffect(() => {
    setLoading(true);
    // In a real app, this would be an API call
    setTimeout(() => {
      const mockLogs = Array.from({ length: 150 }, (_, i) => ({
        id: i + 1,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
        eventType: ['USER_LOGIN', 'FILE_ACCESS', 'DATA_MODIFICATION', 'SYSTEM_UPDATE', 'SECURITY_ALERT'][Math.floor(Math.random() * 5)],
        userId: `user${Math.floor(Math.random() * 100) + 1}`,
        ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        description: `User performed action #${i + 1}`,
        severity: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
        category: ['authentication', 'data', 'system', 'security'][Math.floor(Math.random() * 4)]
      }));
      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
      setLoading(false);
    }, 500);
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...logs];

    // Apply date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      result = result.filter(log =>
        new Date(log.timestamp) >= new Date(filters.dateRange.start) &&
        new Date(log.timestamp) <= new Date(filters.dateRange.end)
      );
    }

    // Apply event type filter
    if (filters.eventType) {
      result = result.filter(log => log.eventType === filters.eventType);
    }

    // Apply user ID filter
    if (filters.userId) {
      result = result.filter(log => log.userId.includes(filters.userId));
    }

    // Apply IP address filter
    if (filters.ipAddress) {
      result = result.filter(log => log.ipAddress.includes(filters.ipAddress));
    }

    // Apply severity filter
    if (filters.severity) {
      result = result.filter(log => log.severity === filters.severity);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });

    setFilteredLogs(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, logs, sortBy, sortOrder]);

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      eventType: '',
      userId: '',
      ipAddress: '',
      severity: ''
    });
  };

  return (
    <div className="audit-log-viewer">
      <div className="header">
        <h2>Audit Log Viewer</h2>
        <p>Monitor and analyze system activity with advanced filtering capabilities</p>
      </div>

      <div className="filters-section">
        <div className="filter-row">
          <SearchInvestigation
            onSearch={(query) => handleFilterChange('userId', query)}
          />
          <EventCategorization
            selectedCategory={filters.eventType}
            onCategoryChange={(category) => handleFilterChange('eventType', category)}
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>Date Range:</label>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
            />
            <span>to</span>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <label>IP Address:</label>
            <input
              type="text"
              placeholder="Filter by IP..."
              value={filters.ipAddress}
              onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Severity:</label>
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
            >
              <option value="">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>
      </div>

      <div className="results-summary">
        <p>
          Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} entries
          {filters.eventType && ` | Filtered by: ${filters.eventType}`}
        </p>
      </div>

      {loading ? (
        <div className="loading">Loading audit logs...</div>
      ) : (
        <>
          <div className="logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('timestamp')} className="sortable">
                    Timestamp {sortBy === 'timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('eventType')} className="sortable">
                    Event Type {sortBy === 'eventType' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('userId')} className="sortable">
                    User ID {sortBy === 'userId' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>IP Address</th>
                  <th>Description</th>
                  <th onClick={() => handleSort('severity')} className="sortable">
                    Severity {sortBy === 'severity' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.length > 0 ? (
                  currentLogs.map(log => (
                    <tr key={log.id} className={`log-row severity-${log.severity}`}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>
                        <span className={`event-tag ${log.category}`}>
                          {log.eventType}
                        </span>
                      </td>
                      <td>{log.userId}</td>
                      <td>{log.ipAddress}</td>
                      <td>{log.description}</td>
                      <td>
                        <span className={`severity-indicator ${log.severity}`}>
                          {log.severity}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-results">
                      No audit logs found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>

          <RealTimeLogDisplay logs={logs} />
        </>
      )}
    </div>
  );
};

export default AuditLogViewer;