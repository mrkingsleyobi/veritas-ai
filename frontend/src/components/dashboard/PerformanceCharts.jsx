import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import {
  Speed as SpeedIcon,
  Storage as StorageIcon,
  TrendingUp as TrendingUpIcon,
  Memory as MemoryIcon
} from '@mui/icons-material'
import { Card, CardContent, Typography, Grid, Box } from '@mui/material'

const PerformanceCharts = () => {
  const { theme } = useTheme()
  const [chartData, setChartData] = useState({
    accuracy: [],
    processing: [],
    system: [],
    compliance: []
  })

  // Mock data generation
  useEffect(() => {
    const generateMockData = () => {
      const accuracyData = []
      const processingData = []
      const systemData = []
      const complianceData = []

      for (let i = 0; i < 24; i++) {
        const hour = `${i}:00`
        accuracyData.push({
          time: hour,
          accuracy: Math.floor(Math.random() * 20) + 80,
          falsePositives: Math.floor(Math.random() * 5),
          falseNegatives: Math.floor(Math.random() * 3)
        })

        processingData.push({
          time: hour,
          volume: Math.floor(Math.random() * 500) + 100,
          avgTime: Math.floor(Math.random() * 2000) + 500,
          queueSize: Math.floor(Math.random() * 50)
        })

        systemData.push({
          time: hour,
          cpu: Math.floor(Math.random() * 30) + 50,
          memory: Math.floor(Math.random() * 40) + 40,
          disk: Math.floor(Math.random() * 50) + 20,
          network: Math.floor(Math.random() * 100)
        })
      }

      // Compliance data
      complianceData.push(
        { name: 'GDPR', value: 98, status: 'compliant' },
        { name: 'SOC2', value: 92, status: 'compliant' },
        { name: 'HIPAA', value: 87, status: 'warning' },
        { name: 'ISO 27001', value: 95, status: 'compliant' }
      )

      setChartData({
        accuracy: accuracyData,
        processing: processingData,
        system: systemData,
        compliance: complianceData
      })
    }

    generateMockData()

    // Simulate real-time updates
    const interval = setInterval(() => {
      generateMockData()
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  // Custom tooltip for dark mode
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-4 rounded shadow-lg ${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}>
          <p className="font-bold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <Grid container spacing={3}>
        {/* Detection Accuracy Chart */}
        <Grid item xs={12} md={6}>
          <Card className={theme === 'dark' ? 'dark:bg-gray-800' : ''}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon color="primary" className={theme === 'dark' ? 'text-white' : ''} />
                <Typography
                  variant="h6"
                  className={`ml-2 ${theme === 'dark' ? 'text-white' : ''}`}
                >
                  Detection Accuracy
                </Typography>
              </Box>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.accuracy}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme === 'dark' ? '#4b5563' : '#e5e7eb'}
                    />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                    />
                    <YAxis
                      domain={[75, 100]}
                      tick={{ fill: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ color: theme === 'dark' ? '#d1d5db' : '#000' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      name="Accuracy %"
                    />
                    <Line
                      type="monotone"
                      dataKey="falsePositives"
                      stroke="#ff7300"
                      name="False Positives"
                    />
                    <Line
                      type="monotone"
                      dataKey="falseNegatives"
                      stroke="#ff0000"
                      name="False Negatives"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Processing Volume Chart */}
        <Grid item xs={12} md={6}>
          <Card className={theme === 'dark' ? 'dark:bg-gray-800' : ''}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SpeedIcon color="primary" className={theme === 'dark' ? 'text-white' : ''} />
                <Typography
                  variant="h6"
                  className={`ml-2 ${theme === 'dark' ? 'text-white' : ''}`}
                >
                  Processing Volume
                </Typography>
              </Box>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.processing}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme === 'dark' ? '#4b5563' : '#e5e7eb'}
                    />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                    />
                    <YAxis
                      tick={{ fill: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ color: theme === 'dark' ? '#d1d5db' : '#000' }}
                    />
                    <Bar dataKey="volume" fill="#8884d8" name="Files Processed" />
                    <Bar dataKey="queueSize" fill="#82ca9d" name="Queue Size" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* System Performance Chart */}
        <Grid item xs={12} md={6}>
          <Card className={theme === 'dark' ? 'dark:bg-gray-800' : ''}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <MemoryIcon color="primary" className={theme === 'dark' ? 'text-white' : ''} />
                <Typography
                  variant="h6"
                  className={`ml-2 ${theme === 'dark' ? 'text-white' : ''}`}
                >
                  System Performance
                </Typography>
              </Box>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.system}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme === 'dark' ? '#4b5563' : '#e5e7eb'}
                    />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                    />
                    <YAxis
                      tick={{ fill: theme === 'dark' ? '#d1d5db' : '#6b7280' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ color: theme === 'dark' ? '#d1d5db' : '#000' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cpu"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      name="CPU %"
                    />
                    <Area
                      type="monotone"
                      dataKey="memory"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      name="Memory %"
                    />
                    <Area
                      type="monotone"
                      dataKey="disk"
                      stackId="1"
                      stroke="#ffc658"
                      fill="#ffc658"
                      name="Disk %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Compliance Status Chart */}
        <Grid item xs={12} md={6}>
          <Card className={theme === 'dark' ? 'dark:bg-gray-800' : ''}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <StorageIcon color="primary" className={theme === 'dark' ? 'text-white' : ''} />
                <Typography
                  variant="h6"
                  className={`ml-2 ${theme === 'dark' ? 'text-white' : ''}`}
                >
                  Compliance Status
                </Typography>
              </Box>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.compliance}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.compliance.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ color: theme === 'dark' ? '#d1d5db' : '#000' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}

export default PerformanceCharts