import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const UserActivityDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [activityData, setActivityData] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [topUsers, setTopUsers] = useState([]);

  // Mock data for user activity
  useEffect(() => {
    // Generate mock activity data based on time range
    const generateActivityData = () => {
      const data = [];
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        data.push({
          date: date.toISOString().split('T')[0],
          logins: Math.floor(Math.random() * 50) + 20,
          dataAccess: Math.floor(Math.random() * 100) + 50,
          modifications: Math.floor(Math.random() * 30) + 10,
          failedAttempts: Math.floor(Math.random() * 15)
        });
      }

      return data;
    };

    // Generate mock user stats
    const generateUserStats = () => [
      { name: 'Active Users', value: 1240 },
      { name: 'New Users', value: 85 },
      { name: 'Inactive Users', value: 210 },
      { name: 'Suspended Users', value: 5 }
    ];

    // Generate mock top users
    const generateTopUsers = () => [
      { id: 'user001', name: 'John Smith', activity: 1240, risk: 'Low' },
      { id: 'user002', name: 'Sarah Johnson', activity: 980, risk: 'Medium' },
      { id: 'user003', name: 'Michael Chen', activity: 875, risk: 'Low' },
      { id: 'user004', name: 'Emily Davis', activity: 760, risk: 'High' },
      { id: 'user005', name: 'Robert Wilson', activity: 650, risk: 'Low' }
    ];

    setActivityData(generateActivityData());
    setUserStats(generateUserStats());
    setTopUsers(generateTopUsers());
  }, [timeRange]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const riskColors = {
    'Low': '#4CAF50',
    'Medium': '#FF9800',
    'High': '#F44336'
  };

  return (
    <div className="user-activity-dashboard">
      <div className="dashboard-header">
        <h2>User Activity Dashboard</h2>
        <div className="time-range-selector">
          <button
            className={timeRange === '7d' ? 'active' : ''}
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </button>
          <button
            className={timeRange === '30d' ? 'active' : ''}
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </button>
          <button
            className={timeRange === '90d' ? 'active' : ''}
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-cards">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-value">1,455</p>
            <p className="stat-description">+5% from last period</p>
          </div>
          <div className="stat-card">
            <h3>Active Sessions</h3>
            <p className="stat-value">8,420</p>
            <p className="stat-description">+12% from last period</p>
          </div>
          <div className="stat-card">
            <h3>Avg. Daily Logins</h3>
            <p className="stat-value">1,240</p>
            <p className="stat-description">+3% from last period</p>
          </div>
          <div className="stat-card">
            <h3>High Risk Users</h3>
            <p className="stat-value">23</p>
            <p className="stat-description">-2 from last period</p>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h3>User Activity Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="logins" name="User Logins" fill="#8884d8" />
              <Bar dataKey="dataAccess" name="Data Access" fill="#82ca9d" />
              <Bar dataKey="modifications" name="Data Modifications" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Failed Login Attempts</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="failedAttempts"
                name="Failed Attempts"
                stroke="#ff6b6b"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="user-distribution-section">
        <div className="chart-container">
          <h3>User Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {userStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="top-users-container">
          <h3>Top Active Users</h3>
          <div className="users-table">
            <div className="table-header">
              <div>User</div>
              <div>Activity Count</div>
              <div>Risk Level</div>
            </div>
            {topUsers.map(user => (
              <div key={user.id} className="user-row">
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-id">{user.id}</div>
                </div>
                <div className="activity-count">{user.activity}</div>
                <div className="risk-level" style={{ color: riskColors[user.risk] }}>
                  {user.risk}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivityDashboard;