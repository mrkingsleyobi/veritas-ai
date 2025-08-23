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
      
      // Mock data - updated to match prototype values
      const mockData = {
        totalVerifications: 12489,
        verifiedContent: 9234,
        flaggedContent: 1023,
        pendingReview: 2232,
        verificationTrend: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          datasets: [
            {
              label: 'Verifications',
              data: [850, 920, 1100, 1340, 1560, 1780, 2030, 2150],
              borderColor: theme.palette.primary.main,
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
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
                'rgba(59, 130, 246, 0.2)', // primary: '#3b82f6'
                'rgba(30, 64, 175, 0.2)',  // secondary: '#1e40af'
                'rgba(139, 92, 246, 0.2)', // accent: '#8b5cf6'
              ],
              borderColor: [
                theme.palette.primary.main,
                theme.palette.secondary.main,
                theme.palette.accent.main,
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
              data: [80, 20],
              backgroundColor: [
                'rgba(16, 185, 129, 0.2)', // green-500 equivalent
                'rgba(239, 68, 68, 0.2)',   // red-500 equivalent
              ],
              borderColor: [
                'rgb(16, 185, 129)',
                'rgb(239, 68, 68)',
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
      {/* Welcome Banner - New addition to match prototype */}
      <Card 
        sx={{ 
          mb: 3,
          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          borderRadius: '0.75rem',
        }}
      >
        <CardContent>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { md: 'center' },
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Welcome back, Alex!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Here's what's happening with your content verification today.
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              sx={{ 
                mt: { xs: 2, md: 0 },
                backgroundColor: 'white',
                color: theme.palette.primary.main,
                fontWeight: 'medium',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              <span style={{ marginRight: '8px' }}>+</span> New Analysis
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Summary Cards - Updated to match prototype styling */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              borderRadius: '0.75rem',
            }}
            role="region"
            aria-labelledby="total-verifications-heading"
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <div>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.875rem',
                      mb: 1
                    }}
                  >
                    Total Verifications
                  </Typography>
                  <Typography 
                    variant="h3" 
                    id="total-verifications-heading"
                    sx={{ 
                      fontWeight: 'bold',
                      mb: 1
                    }}
                  >
                    {analyticsData.totalVerifications.toLocaleString()}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <span style={{ 
                      color: '#10b981', // green-500
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{ marginRight: '4px' }}>↑</span>
                      <span>12.3% from last month</span>
                    </span>
                  </Box>
                </div>
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <VerifiedUser sx={{ color: theme.palette.primary.main }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              borderLeft: `4px solid ${theme.palette.secondary.main}`,
              borderRadius: '0.75rem',
            }}
            role="region"
            aria-labelledby="verified-content-heading"
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <div>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.875rem',
                      mb: 1
                    }}
                  >
                    Verified Content
                  </Typography>
                  <Typography 
                    variant="h3" 
                    id="verified-content-heading"
                    sx={{ 
                      fontWeight: 'bold',
                      mb: 1
                    }}
                  >
                    {analyticsData.verifiedContent.toLocaleString()}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <span style={{ 
                      color: '#10b981', // green-500
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{ marginRight: '4px' }}>↑</span>
                      <span>8.7% from last month</span>
                    </span>
                  </Box>
                </div>
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%',
                    backgroundColor: 'rgba(30, 64, 175, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Timeline sx={{ color: theme.palette.secondary.main }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              borderLeft: `4px solid ${theme.palette.accent.main}`,
              borderRadius: '0.75rem',
            }}
            role="region"
            aria-labelledby="flagged-content-heading"
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <div>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.875rem',
                      mb: 1
                    }}
                  >
                    Flagged Content
                  </Typography>
                  <Typography 
                    variant="h3" 
                    id="flagged-content-heading"
                    sx={{ 
                      fontWeight: 'bold',
                      mb: 1
                    }}
                  >
                    {analyticsData.flaggedContent.toLocaleString()}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <span style={{ 
                      color: '#ef4444', // red-500
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{ marginRight: '4px' }}>↑</span>
                      <span>3.2% from last month</span>
                    </span>
                  </Box>
                </div>
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Warning sx={{ color: theme.palette.accent.main }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              borderLeft: '4px solid #eab308', // yellow-500
              borderRadius: '0.75rem',
            }}
            role="region"
            aria-labelledby="pending-review-heading"
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <div>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.875rem',
                      mb: 1
                    }}
                  >
                    Pending Review
                  </Typography>
                  <Typography 
                    variant="h3" 
                    id="pending-review-heading"
                    sx={{ 
                      fontWeight: 'bold',
                      mb: 1
                    }}
                  >
                    {analyticsData.pendingReview.toLocaleString()}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <span style={{ 
                      color: 'text.secondary',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}>
                      2.1% from last month
                    </span>
                  </Box>
                </div>
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%',
                    backgroundColor: 'rgba(234, 179, 8, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Storage sx={{ color: '#eab308' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts - Updated styling to match prototype */}
      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: '0.75rem',
            }}
            role="region"
            aria-labelledby="verification-trend-heading"
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography 
                  variant="h6" 
                  id="verification-trend-heading"
                  sx={{ 
                    fontWeight: 'bold'
                  }}
                >
                Verification Trend
              </Typography>
              <Button 
                size="small" 
                sx={{ 
                  color: theme.palette.primary.main,
                  fontWeight: 'medium',
                  fontSize: '0.875rem'
                }}
              >
                View All
              </Button>
              </Box>
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
            sx={{ 
              height: '100%',
              borderRadius: '0.75rem',
            }}
            role="region"
            aria-labelledby="content-types-heading"
          >
            <CardContent>
              <Typography 
                variant="h6" 
                id="content-types-heading"
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  mb: 2
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
            sx={{ 
              height: '100%',
              borderRadius: '0.75rem',
            }}
            role="region"
            aria-labelledby="verification-rate-chart-heading"
          >
            <CardContent>
              <Typography 
                variant="h6" 
                id="verification-rate-chart-heading"
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  mb: 2
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
            sx={{ 
              height: '100%',
              borderRadius: '0.75rem',
            }}
            role="region"
            aria-labelledby="recent-activity-heading"
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography 
                  variant="h6" 
                  id="recent-activity-heading"
                  sx={{ 
                    fontWeight: 'bold'
                  }}
                >
                  Recent Activity
                </Typography>
                <Button 
                  size="small" 
                  sx={{ 
                    color: theme.palette.primary.main,
                    fontWeight: 'medium',
                    fontSize: '0.875rem'
                  }}
                >
                  View All
                </Button>
              </Box>
              
              {/* Recent Activity Table - New addition to match prototype */}
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', paddingBottom: '12px', fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)', fontWeight: 500 }}>Content</th>
                      <th style={{ textAlign: 'left', paddingBottom: '12px', fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)', fontWeight: 500 }}>Status</th>
                      <th style={{ textAlign: 'left', paddingBottom: '12px', fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)', fontWeight: 500 }}>Date</th>
                      <th style={{ textAlign: 'left', paddingBottom: '12px', fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)', fontWeight: 500 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                      <td style={{ padding: '16px 0' }}>
                        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>News Article #12345</div>
                        <div style={{ color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.75rem' }}>source.com/article-12345</div>
                      </td>
                      <td style={{ padding: '16px 0' }}>
                        <span style={{ 
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          color: 'rgb(16, 185, 129)',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          Verified
                        </span>
                      </td>
                      <td style={{ padding: '16px 0', color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.875rem' }}>2 hours ago</td>
                      <td style={{ padding: '16px 0' }}>
                        <Button size="small" sx={{ color: theme.palette.primary.main, minWidth: 0, padding: '4px' }}>
                          <span style={{ fontSize: '0.875rem' }}>👁</span>
                        </Button>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                      <td style={{ padding: '16px 0' }}>
                        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>Social Media Post #67890</div>
                        <div style={{ color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.75rem' }}>socialplatform.com/post-67890</div>
                      </td>
                      <td style={{ padding: '16px 0' }}>
                        <span style={{ 
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: 'rgb(239, 68, 68)',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          Flagged
                        </span>
                      </td>
                      <td style={{ padding: '16px 0', color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.875rem' }}>4 hours ago</td>
                      <td style={{ padding: '16px 0' }}>
                        <Button size="small" sx={{ color: theme.palette.primary.main, minWidth: 0, padding: '4px' }}>
                          <span style={{ fontSize: '0.875rem' }}>👁</span>
                        </Button>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                      <td style={{ padding: '16px 0' }}>
                        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>Blog Post #54321</div>
                        <div style={{ color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.75rem' }}>blogsite.com/post-54321</div>
                      </td>
                      <td style={{ padding: '16px 0' }}>
                        <span style={{ 
                          backgroundColor: 'rgba(234, 179, 8, 0.1)',
                          color: 'rgb(234, 179, 8)',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          Pending
                        </span>
                      </td>
                      <td style={{ padding: '16px 0', color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.875rem' }}>6 hours ago</td>
                      <td style={{ padding: '16px 0' }}>
                        <Button size="small" sx={{ color: theme.palette.primary.main, minWidth: 0, padding: '4px' }}>
                          <span style={{ fontSize: '0.875rem' }}>👁</span>
                        </Button>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                      <td style={{ padding: '16px 0' }}>
                        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>Video Content #98765</div>
                        <div style={{ color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.75rem' }}>videosite.com/video-98765</div>
                      </td>
                      <td style={{ padding: '16px 0' }}>
                        <span style={{ 
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          color: 'rgb(16, 185, 129)',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          Verified
                        </span>
                      </td>
                      <td style={{ padding: '16px 0', color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.875rem' }}>1 day ago</td>
                      <td style={{ padding: '16px 0' }}>
                        <Button size="small" sx={{ color: theme.palette.primary.main, minWidth: 0, padding: '4px' }}>
                          <span style={{ fontSize: '0.875rem' }}>👁</span>
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '16px 0' }}>
                        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>News Article #11223</div>
                        <div style={{ color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.75rem' }}>newsportal.com/article-11223</div>
                      </td>
                      <td style={{ padding: '16px 0' }}>
                        <span style={{ 
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          color: 'rgb(16, 185, 129)',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          Verified
                        </span>
                      </td>
                      <td style={{ padding: '16px 0', color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.875rem' }}>1 day ago</td>
                      <td style={{ padding: '16px 0' }}>
                        <Button size="small" sx={{ color: theme.palette.primary.main, minWidth: 0, padding: '4px' }}>
                          <span style={{ fontSize: '0.875rem' }}>👁</span>
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Box>
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
          sx={{
            borderRadius: '0.5rem',
            textTransform: 'none',
          }}
        >
          Refresh Data
        </Button>
      </Box>
    </div>
  );
};

export default DashboardAnalytics;