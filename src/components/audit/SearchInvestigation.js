import React, { useState, useEffect } from 'react';

const SearchInvestigation = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('search');
  const [advancedFilters, setAdvancedFilters] = useState({
    userId: '',
    ipAddress: '',
    eventType: '',
    dateRange: { start: '', end: '' },
    severity: ''
  });

  // Mock search results
  const mockSearchResults = [
    {
      id: 1,
      timestamp: '2023-11-05T14:30:22Z',
      eventType: 'USER_LOGIN',
      userId: 'john.doe@example.com',
      ipAddress: '192.168.1.100',
      description: 'Successful user login',
      severity: 'info'
    },
    {
      id: 2,
      timestamp: '2023-11-05T14:25:10Z',
      eventType: 'FILE_ACCESS',
      userId: 'john.doe@example.com',
      ipAddress: '192.168.1.100',
      description: 'Accessed confidential document.pdf',
      severity: 'warning'
    },
    {
      id: 3,
      timestamp: '2023-11-05T14:20:05Z',
      eventType: 'DATA_MODIFICATION',
      userId: 'sarah.j@example.com',
      ipAddress: '10.0.0.50',
      description: 'Updated customer record #12345',
      severity: 'info'
    }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim() && !hasActiveFilters()) return;

    setIsSearching(true);

    // Add to search history
    if (searchQuery.trim()) {
      setSearchHistory(prev => [
        searchQuery,
        ...prev.filter(item => item !== searchQuery)
      ].slice(0, 10));
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // In a real app, this would be an API call with search parameters
    setSearchResults(mockSearchResults);
    setIsSearching(false);

    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const hasActiveFilters = () => {
    return (
      advancedFilters.userId ||
      advancedFilters.ipAddress ||
      advancedFilters.eventType ||
      advancedFilters.dateRange.start ||
      advancedFilters.dateRange.end ||
      advancedFilters.severity
    );
  };

  const handleFilterChange = (filterName, value) => {
    if (filterName === 'dateRange') {
      setAdvancedFilters(prev => ({
        ...prev,
        dateRange: { ...prev.dateRange, ...value }
      }));
    } else {
      setAdvancedFilters(prev => ({
        ...prev,
        [filterName]: value
      }));
    }
  };

  const clearFilters = () => {
    setAdvancedFilters({
      userId: '',
      ipAddress: '',
      eventType: '',
      dateRange: { start: '', end: '' },
      severity: ''
    });
  };

  const loadFromHistory = (query) => {
    setSearchQuery(query);
  };

  const exportInvestigation = () => {
    // In a real app, this would export the search results
    alert('Investigation exported successfully!');
  };

  return (
    <div className="search-investigation">
      <div className="tabs">
        <button
          className={activeTab === 'search' ? 'active' : ''}
          onClick={() => setActiveTab('search')}
        >
          Search & Filter
        </button>
        <button
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          Search History
        </button>
        <button
          className={activeTab === 'investigation' ? 'active' : ''}
          onClick={() => setActiveTab('investigation')}
        >
          Investigation Tools
        </button>
      </div>

      {activeTab === 'search' && (
        <div className="search-tab">
          <div className="search-header">
            <h3>Search Audit Logs</h3>
            <p>Find specific events using keywords or advanced filters</p>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by user, event, IP address, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div className="advanced-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label>User ID:</label>
                <input
                  type="text"
                  value={advancedFilters.userId}
                  onChange={(e) => handleFilterChange('userId', e.target.value)}
                  placeholder="Filter by user ID"
                />
              </div>

              <div className="filter-group">
                <label>IP Address:</label>
                <input
                  type="text"
                  value={advancedFilters.ipAddress}
                  onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
                  placeholder="Filter by IP"
                />
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Event Type:</label>
                <select
                  value={advancedFilters.eventType}
                  onChange={(e) => handleFilterChange('eventType', e.target.value)}
                >
                  <option value="">All Event Types</option>
                  <option value="USER_LOGIN">User Login</option>
                  <option value="FILE_ACCESS">File Access</option>
                  <option value="DATA_MODIFICATION">Data Modification</option>
                  <option value="SYSTEM_UPDATE">System Update</option>
                  <option value="SECURITY_ALERT">Security Alert</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Severity:</label>
                <select
                  value={advancedFilters.severity}
                  onChange={(e) => handleFilterChange('severity', e.target.value)}
                >
                  <option value="">All Severities</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Date Range:</label>
                <div className="date-range">
                  <input
                    type="date"
                    value={advancedFilters.dateRange.start}
                    onChange={(e) => handleFilterChange('dateRange', { start: e.target.value })}
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={advancedFilters.dateRange.end}
                    onChange={(e) => handleFilterChange('dateRange', { end: e.target.value })}
                  />
                </div>
              </div>

              <div className="filter-actions">
                <button onClick={clearFilters}>Clear Filters</button>
                <button
                  onClick={handleSearch}
                  disabled={isSearching || (!searchQuery.trim() && !hasActiveFilters())}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="history-tab">
          <div className="history-header">
            <h3>Search History</h3>
            <p>Recently searched queries and filters</p>
          </div>

          {searchHistory.length > 0 ? (
            <div className="history-list">
              {searchHistory.map((query, index) => (
                <div
                  key={index}
                  className="history-item"
                  onClick={() => loadFromHistory(query)}
                >
                  <span className="query-text">{query}</span>
                  <button className="reuse-btn">Reuse</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-history">
              <p>No search history available</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'investigation' && (
        <div className="investigation-tab">
          <div className="investigation-header">
            <h3>Investigation Tools</h3>
            <p>Analyze and correlate audit events</p>
          </div>

          <div className="investigation-tools">
            <div className="tool-card">
              <h4>User Activity Timeline</h4>
              <p>Visualize user actions over time</p>
              <button className="tool-btn">Generate Timeline</button>
            </div>

            <div className="tool-card">
              <h4>IP Address Analysis</h4>
              <p>Track activities from specific IP addresses</p>
              <button className="tool-btn">Analyze IPs</button>
            </div>

            <div className="tool-card">
              <h4>Anomaly Detection</h4>
              <p>Identify unusual patterns and behaviors</p>
              <button className="tool-btn">Detect Anomalies</button>
            </div>

            <div className="tool-card">
              <h4>Export Investigation</h4>
              <p>Export findings for reporting</p>
              <button className="tool-btn" onClick={exportInvestigation}>Export Results</button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="investigation-results">
              <h4>Current Investigation Results</h4>
              <div className="results-summary">
                <p>Found {searchResults.length} events matching your criteria</p>
                <button onClick={exportInvestigation}>Export Findings</button>
              </div>
            </div>
          )}
        </div>
      )}

      {searchResults.length > 0 && activeTab === 'search' && (
        <div className="search-results">
          <div className="results-header">
            <h4>Search Results</h4>
            <p>Found {searchResults.length} matching events</p>
          </div>

          <div className="results-table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event Type</th>
                  <th>User ID</th>
                  <th>IP Address</th>
                  <th>Description</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map(result => (
                  <tr key={result.id} className={`result-row severity-${result.severity}`}>
                    <td>{new Date(result.timestamp).toLocaleString()}</td>
                    <td>{result.eventType}</td>
                    <td>{result.userId}</td>
                    <td>{result.ipAddress}</td>
                    <td>{result.description}</td>
                    <td>
                      <span className={`severity-badge ${result.severity}`}>
                        {result.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInvestigation;