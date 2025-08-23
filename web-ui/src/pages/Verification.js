import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Card, 
  CardContent, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  useMediaQuery,
  Grid,
  Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  Search, 
  CloudUpload, 
  FileCopy, 
  HourglassEmpty, 
  CheckCircle, 
  Download 
} from '@mui/icons-material';

const Verification = () => {
  const [contentType, setContentType] = useState('url');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real app, you would make an API call here
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock result
      setResult({
        isVerified: Math.random() > 0.3,
        confidence: Math.floor(Math.random() * 100),
        sources: ['Source 1', 'Source 2', 'Source 3'],
        factors: [
          { name: 'Source Credibility', status: 'Verified', confidence: Math.floor(Math.random() * 20) + 80, details: 'Analysis completed successfully' },
          { name: 'Content Consistency', status: 'Verified', confidence: Math.floor(Math.random() * 20) + 80, details: 'Analysis completed successfully' },
          { name: 'Cross-Reference Check', status: 'Verified', confidence: Math.floor(Math.random() * 20) + 80, details: 'Analysis completed successfully' },
          { name: 'Metadata Analysis', status: 'Verified', confidence: Math.floor(Math.random() * 20) + 80, details: 'Analysis completed successfully' }
        ]
      });
    } catch (error) {
      console.error('Verification error:', error);
      alert('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      component="main" 
      sx={{ 
        flexGrow: 1, 
        py: isMobile ? 2 : 3,
        px: isMobile ? 2 : 3,
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ mb: isMobile ? 2 : 4 }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1" 
            gutterBottom
            id="verification-heading"
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.dark.main,
            }}
          >
            Content Verification
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'text.secondary',
              mb: 2
            }}
          >
            Submit content for authenticity analysis
          </Typography>
        </Box>

        <Grid container spacing={isMobile ? 2 : 3}>
          {/* Input Section - Takes 2/3 width on large screens */}
          <Grid item xs={12} lg={8}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: '0.75rem',
                mb: isMobile ? 2 : 3,
              }}
              role="region"
              aria-labelledby="input-section-heading"
            >
              <CardContent>
                <Typography 
                  variant="h6" 
                  id="input-section-heading"
                  sx={{ 
                    fontWeight: 'bold',
                    mb: 2,
                    color: theme.palette.dark.main,
                  }}
                >
                  Content Input
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      mb: 1,
                      color: 'text.primary',
                    }}
                  >
                    Content URL
                  </Typography>
                  <Box sx={{ display: 'flex' }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="https://example.com/article"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '0.5rem 0 0 0.5rem',
                        },
                      }}
                    />
                    <Button 
                      variant="outlined"
                      sx={{
                        borderRadius: '0 0.5rem 0.5rem 0',
                        borderLeft: 0,
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                        '&:hover': {
                          borderColor: 'rgba(0, 0, 0, 0.23)',
                        },
                      }}
                    >
                      <FileCopy />
                    </Button>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      mb: 1,
                      color: 'text.primary',
                    }}
                  >
                    Upload Content
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: '0.5rem',
                      borderStyle: 'dashed',
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <CloudUpload sx={{ 
                      fontSize: 40, 
                      color: 'text.secondary',
                      mb: 1 
                    }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.primary',
                        mb: 1
                      }}
                    >
                      Drag & drop files here or <span style={{ color: theme.palette.primary.main }}>browse</span>
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary'
                      }}
                    >
                      Supports PDF, DOCX, TXT (Max 10MB)
                    </Typography>
                  </Paper>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      mb: 1,
                      color: 'text.primary',
                    }}
                  >
                    Content Type
                  </Typography>
                  <Grid container spacing={1}>
                    {[
                      { value: 'article', label: 'Article' },
                      { value: 'social', label: 'Social Media' },
                      { value: 'image', label: 'Image' },
                      { value: 'video', label: 'Video' }
                    ].map((type) => (
                      <Grid item xs={6} sm={3} key={type.value}>
                        <Button
                          variant={contentType === type.value ? "contained" : "outlined"}
                          fullWidth
                          size={isMobile ? "small" : "medium"}
                          onClick={() => setContentType(type.value)}
                          sx={{
                            borderRadius: '0.5rem',
                            textTransform: 'none',
                            justifyContent: 'flex-start',
                            px: 2,
                          }}
                        >
                          {type.label}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </CardContent>
            </Card>
            
            {/* Verification Controls */}
            <Card 
              sx={{ 
                borderRadius: '0.75rem',
              }}
              role="region"
              aria-labelledby="controls-section-heading"
            >
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { sm: 'center' },
                  justifyContent: 'space-between',
                  gap: 2
                }}>
                  <Box>
                    <Typography 
                      variant="h6" 
                      id="controls-section-heading"
                      sx={{ 
                        fontWeight: 'bold',
                        color: theme.palette.dark.main,
                      }}
                    >
                      Verification Controls
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary'
                      }}
                    >
                      Submit content for authenticity analysis
                    </Typography>
                  </Box>
                  <Button 
                    variant="contained"
                    color="primary"
                    size={isMobile ? "medium" : "large"}
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{
                      borderRadius: '0.5rem',
                      textTransform: 'none',
                      fontWeight: 'medium',
                      minWidth: { xs: '100%', sm: 'auto' },
                    }}
                    startIcon={loading ? <HourglassEmpty /> : <Search />}
                  >
                    {loading ? 'Verifying...' : 'Verify Content'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Results Section - Takes 1/3 width on large screens */}
          <Grid item xs={12} lg={4}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: '0.75rem',
                mb: isMobile ? 2 : 3,
              }}
              role="region"
              aria-labelledby="status-section-heading"
            >
              <CardContent>
                <Typography 
                  variant="h6" 
                  id="status-section-heading"
                  sx={{ 
                    fontWeight: 'bold',
                    mb: 2,
                    color: theme.palette.dark.main,
                  }}
                >
                  Verification Status
                </Typography>
                
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  {result ? (
                    <>
                      <Box sx={{ 
                        width: 64, 
                        height: 64, 
                        borderRadius: '50%', 
                        backgroundColor: result.isVerified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                      }}>
                        <CheckCircle sx={{ 
                          fontSize: 32, 
                          color: result.isVerified ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)' 
                        }} />
                      </Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          mb: 1,
                          color: theme.palette.dark.main,
                        }}
                      >
                        Verification {result.isVerified ? 'Complete' : 'Failed'}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary'
                        }}
                      >
                        Analysis finished successfully
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Box sx={{ 
                        width: 64, 
                        height: 64, 
                        borderRadius: '50%', 
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                      }}>
                        <HourglassEmpty sx={{ 
                          fontSize: 32, 
                          color: 'text.secondary' 
                        }} />
                      </Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          mb: 1,
                          color: theme.palette.dark.main,
                        }}
                      >
                        Not Verified
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary'
                        }}
                      >
                        Submit content to begin analysis
                      </Typography>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
            
            {/* Authenticity Score */}
            <Card 
              sx={{ 
                borderRadius: '0.75rem',
              }}
              role="region"
              aria-labelledby="score-section-heading"
            >
              <CardContent>
                <Typography 
                  variant="h6" 
                  id="score-section-heading"
                  sx={{ 
                    fontWeight: 'bold',
                    mb: 2,
                    color: theme.palette.dark.main,
                  }}
                >
                  Authenticity Score
                </Typography>
                
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  {result ? (
                    <>
                      <Box sx={{ 
                        position: 'relative',
                        width: 120,
                        height: 120,
                        margin: '0 auto',
                      }}>
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          border: '8px solid rgba(0, 0, 0, 0.08)',
                        }} />
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          border: '8px solid #10b981',
                          borderColor: result.isVerified ? '#10b981' : '#ef4444',
                          clipPath: `inset(0 0 ${100 - result.confidence}% 0)`,
                        }} />
                        <Box sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center',
                        }}>
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: theme.palette.dark.main,
                            }}
                          >
                            {result.confidence}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary'
                            }}
                          >
                            Score
                          </Typography>
                        </Box>
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          mt: 2
                        }}
                      >
                        Verification score: {result.confidence}%
                      </Typography>
                    </>
                  ) : (
                    <Box sx={{ 
                      position: 'relative',
                      width: 120,
                      height: 120,
                      margin: '0 auto',
                    }}>
                      <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        border: '8px solid rgba(0, 0, 0, 0.08)',
                      }} />
                      <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                      }}>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: theme.palette.dark.main,
                          }}
                        >
                          --
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary'
                          }}
                        >
                          Score
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Detailed Analysis */}
        <Card 
          sx={{ 
            borderRadius: '0.75rem',
            mt: isMobile ? 2 : 3,
          }}
          role="region"
          aria-labelledby="analysis-section-heading"
        >
          <CardContent>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}>
              <Typography 
                variant="h6" 
                id="analysis-section-heading"
                sx={{ 
                  fontWeight: 'bold',
                  color: theme.palette.dark.main,
                }}
              >
                Detailed Analysis
              </Typography>
              <Button 
                size="small"
                startIcon={<Download />}
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 'medium',
                }}
              >
                Export Report
              </Button>
            </Box>
            
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)', fontWeight: 500 }}>Factor</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)', fontWeight: 500 }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)', fontWeight: 500 }}>Confidence</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)', fontWeight: 500 }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {(result ? result.factors : [
                    { name: 'Source Credibility', status: 'Pending', confidence: '--', details: 'No data available' },
                    { name: 'Content Consistency', status: 'Pending', confidence: '--', details: 'No data available' },
                    { name: 'Cross-Reference Check', status: 'Pending', confidence: '--', details: 'No data available' },
                    { name: 'Metadata Analysis', status: 'Pending', confidence: '--', details: 'No data available' }
                  ]).map((factor, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                      <td style={{ padding: '16px', fontWeight: 500, fontSize: '0.875rem' }}>{factor.name}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          backgroundColor: factor.status === 'Verified' ? 'rgba(16, 185, 129, 0.1)' : factor.status === 'Pending' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(239, 68, 68, 0.1)',
                          color: factor.status === 'Verified' ? 'rgb(16, 185, 129)' : factor.status === 'Pending' ? 'rgba(0, 0, 0, 0.6)' : 'rgb(239, 68, 68)',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          {factor.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.875rem' }}>{factor.confidence}%</td>
                      <td style={{ padding: '16px', color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.875rem' }}>{factor.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Verification;