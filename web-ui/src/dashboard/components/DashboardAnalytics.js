import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress, 
  Box,
  Button,
  useTheme
} from '@mui/material';
import { 
  VerifiedUser, 
  Warning, 
  Timeline, 
  Storage 
} from '@mui/icons-material';
import ChartComponent from './ChartComponent';

const DashboardAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data
      const mockData = {
        totalVerifications: 1247,
        verifiedContent: 892,
        flaggedContent: 355,
        verificationTrend: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          datasets: [
            {
              label: 'Verifications',
              data: [85, 92, 110, 134, 156, 178, 203, 215],
              borderColor: 'rgb(25, 118, 210)',
              backgroundColor: 'rgba(25, 118, 210, 0.5)',
            },
          ],
        },
        contentTypes: {
          labels: ['Text', 'Images', 'Videos'],
          datasets: [
            {
              label: 'Content Types',
              data: [45, 35, 20],
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 205, 86, 0.2)',
              ],
              borderColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)',
              ],
              borderWidth: 1,
            },
          ],
        },
        verificationRate: {
          labels: ['Verified', 'Flagged'],
          datasets: [
            {
              label: 'Verification Rate',
              data: [71, 29],
              backgroundColor: [
                'rgba(75, 192, 192, 0.2)',
                'rgba(255, 99, 132, 0.2)',
              ],
              borderColor: [
                'rgb(75, 192, 192)',
                'rgb(255, 99, 132)',
              ],
              borderWidth: 1,
            },
          ],
        },
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="400px"
        role="status"
        aria-label="Loading analytics data"
      >
        <CircularProgress aria-label="Loading analytics data" />
      </Box>
    );
  }

  if (!analyticsData) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="400px"
        role="alert"
        aria-label="No data available"
      >
        <Typography>No data available</Typography>
      </Box>
    );
  }

  return (
    <div>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ height: '100%' }}
            role="region"
            aria-labelledby="total-verifications-heading"
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <VerifiedUser 
                  sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} 
                  aria-hidden="true"
                />
                <div>
                  <Typography 
                    variant="h4" 
                    id="total-verifications-heading"
                    sx={{ 
                      fontSize: { xs: '1.75rem', sm: '2rem' },
                      fontWeight: 'bold'
                    }}
                  >
                    {analyticsData.totalVerifications}
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Total Verifications
                  </Typography>
                </div>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ height: '100%' }}
            role="region"
            aria-labelledby="verified-content-heading"
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <Timeline 
                  sx={{ fontSize: 40, color: 'success.main', mr: 2 }} 
                  aria-hidden="true"
                />
                <div>
                  <Typography 
                    variant="h4" 
                    id="verified-content-heading"
                    sx={{ 
                      fontSize: { xs: '1.75rem', sm: '2rem' },
                      fontWeight: 'bold'
                    }}
                  >
                    {analyticsData.verifiedContent}
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Verified Content
                  </Typography>
                </div>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ height: '100%' }}
            role="region"
            aria-labelledby="flagged-content-heading"
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <Warning 
                  sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} 
                  aria-hidden="true"
                />
                <div>
                  <Typography 
                    variant="h4" 
                    id="flagged-content-heading"
                    sx={{ 
                      fontSize: { xs: '1.75rem', sm: '2rem' },
                      fontWeight: 'bold'
                    }}
                  >
                    {analyticsData.flaggedContent}
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Flagged Content
                  </Typography>
                </div>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ height: '100%' }}
            role="region"
            aria-labelledby="verification-rate-heading"
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <Storage 
                  sx={{ fontSize: 40, color: 'info.main', mr: 2 }} 
                  aria-hidden="true"
                />
                <div>
                  <Typography 
                    variant="h4" 
                    id="verification-rate-heading"
                    sx={{ 
                      fontSize: { xs: '1.75rem', sm: '2rem' },
                      fontWeight: 'bold'
                    }}
                  >
                    {Math.round((analyticsData.verifiedContent / analyticsData.totalVerifications) * 100)}%
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Verification Rate
                  </Typography>
                </div>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Card 
            sx={{ height: '100%' }}
            role="region"
            aria-labelledby="verification-trend-heading"
          >
            <CardContent>
              <Typography 
                variant="h6" 
                id="verification-trend-heading"
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1.125rem', sm: '1.25rem' },
                  fontWeight: 'bold'
                }}
              >
                Verification Trend
              </Typography>
              <ChartComponent 
                type="line" 
                data={analyticsData.verificationTrend} 
                title="Verification Trend" 
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Card 
            sx={{ height: '100%' }}
            role="region"
            aria-labelledby="content-types-heading"
          >
            <CardContent>
              <Typography 
                variant="h6" 
                id="content-types-heading"
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1.125rem', sm: '1.25rem' },
                  fontWeight: 'bold'
                }}
              >
                Content Types
              </Typography>
              <ChartComponent 
                type="pie" 
                data={analyticsData.contentTypes} 
                title="Content Types" 
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ height: '100%' }}
            role="region"
            aria-labelledby="verification-rate-chart-heading"
          >
            <CardContent>
              <Typography 
                variant="h6" 
                id="verification-rate-chart-heading"
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1.125rem', sm: '1.25rem' },
                  fontWeight: 'bold'
                }}
              >
                Verification Rate
              </Typography>
              <ChartComponent 
                type="bar" 
                data={analyticsData.verificationRate} 
                title="Verification Rate" 
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ height: '100%' }}
            role="region"
            aria-labelledby="recent-activity-heading"
          >
            <CardContent>
              <Typography 
                variant="h6" 
                id="recent-activity-heading"
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1.125rem', sm: '1.25rem' },
                  fontWeight: 'bold'
                }}
              >
                Recent Activity
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                • 15 new verifications in the last hour
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                • 3 flagged content items requiring review
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                • System performance at 98% efficiency
              </Typography>
              <Typography 
                variant="body2"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                • 2 new content sources added
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={3} display="flex" justifyContent="center">
        <Button 
          variant="contained" 
          color="primary" 
          onClick={loadAnalyticsData}
          aria-label="Refresh analytics data"
        >
          Refresh Data
        </Button>
      </Box>
    </div>
  );
};

export default DashboardAnalytics;