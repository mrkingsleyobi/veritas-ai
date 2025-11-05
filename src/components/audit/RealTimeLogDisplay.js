import React, { useState, useEffect, useRef } from 'react';

const RealTimeLogDisplay = ({ logs = [] }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamLogs, setStreamLogs] = useState([]);
  const [maxLogs, setMaxLogs] = useState(50);
  const logContainerRef = useRef(null);

  // Simulate real-time log streaming
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      // Generate a mock log entry
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        eventType: ['USER_LOGIN', 'FILE_ACCESS', 'DATA_MODIFICATION', 'SYSTEM_UPDATE', 'SECURITY_ALERT'][Math.floor(Math.random() * 5)],
        userId: `user${Math.floor(Math.random() * 100) + 1}`,
        ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        description: `Real-time event #${Math.floor(Math.random() * 1000)}`,
        severity: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
        category: ['authentication', 'data', 'system', 'security'][Math.floor(Math.random() * 4)]
      };

      setStreamLogs(prev => {
        const updated = [newLog, ...prev];
        return updated.slice(0, maxLogs);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isStreaming, maxLogs]);

  // Scroll to bottom when new logs are added
  useEffect(() => {
    if (logContainerRef.current && isStreaming) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [streamLogs, isStreaming]);

  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
    if (!isStreaming) {
      // Initialize with recent logs when starting streaming
      const recentLogs = logs.slice(0, 10).map(log => ({
        ...log,
        id: `${log.id}-stream`
      }));
      setStreamLogs(recentLogs);
    }
  };

  const clearStream = () => {
    setStreamLogs([]);
  };

  return (
    <div className="real-time-log-display">
      <div className="stream-controls">
        <h3>Real-time Log Stream</h3>
        <div className="control-buttons">
          <button
            onClick={toggleStreaming}
            className={isStreaming ? 'stop-btn' : 'start-btn'}
          >
            {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
          </button>
          <button onClick={clearStream} disabled={!isStreaming || streamLogs.length === 0}>
            Clear Stream
          </button>
          <div className="max-logs-control">
            <label>Max Logs:</label>
            <select
              value={maxLogs}
              onChange={(e) => setMaxLogs(Number(e.target.value))}
              disabled={isStreaming}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {isStreaming && (
        <div className="stream-container" ref={logContainerRef}>
          {streamLogs.length > 0 ? (
            streamLogs.map(log => (
              <div key={log.id} className={`stream-log-item severity-${log.severity}`}>
                <div className="log-header">
                  <span className="timestamp">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={`event-tag ${log.category}`}>{log.eventType}</span>
                  <span className={`severity-indicator ${log.severity}`}>{log.severity}</span>
                </div>
                <div className="log-content">
                  <span className="user-id">{log.userId}</span>
                  <span className="ip-address">{log.ipAddress}</span>
                  <span className="description">{log.description}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-stream-logs">
              Waiting for log events...
            </div>
          )}
        </div>
      )}

      {!isStreaming && (
        <div className="stream-placeholder">
          <p>Real-time log streaming is currently paused</p>
          <button onClick={toggleStreaming} className="start-btn">
            Start Streaming
          </button>
        </div>
      )}
    </div>
  );
};

export default RealTimeLogDisplay;