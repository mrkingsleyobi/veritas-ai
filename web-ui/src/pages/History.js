import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip, 
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  Grid
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Search, Download } from '@mui/icons-material';

const History = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Mock data for verification history
  const [historyData, setHistoryData] = useState([
    {
      id: 1,
      url: 'https://example.com/article1',
      date: '2024-01-15 14:30:22',
      status: 'verified',
      result: 'Authentic',
      contentType: 'Article',
      duration: '2.4s'
    },
    {
      id: 2,
      url: 'https://example.com/video1',
      date: '2024-01-14 09:15:45',
      status: 'verified',
      result: 'Authentic',
      contentType: 'Video',
      duration: '5.1s'
    },
    {
      id: 3,
      url: 'https://example.com/image1',
      date: '2024-01-13 16:45:12',
      status: 'flagged',
      result: 'Suspicious',
      contentType: 'Image',
      duration: '1.8s'
    },
    {
      id: 4,
      url: 'https://example.com/article2',
      date: '2024-01-12 11:22:33',
      status: 'verified',
      result: 'Authentic',
      contentType: 'Article',
      duration: '3.2s'
    },
    {
      id: 5,
      url: 'https://example.com/video2',
      date: '2024-01-11 13:55:01',
      status: 'verified',
      result: 'Authentic',
      contentType: 'Video',
      duration: '4.7s'
    },
    {
      id: 6,
      url: 'https://example.com/article3',
      date: '2024-01-10 08:44:55',
      status: 'flagged',
      result: 'Suspicious',
      contentType: 'Article',
      duration: '2.1s'
    },
    {
      id: 7,
      url: 'https://example.com/image2',
      date: '2024-01-09 17:33:44',
      status: 'verified',
      result: 'Authentic',
      contentType: 'Image',
      duration: '1.5s'
    },
    {
      id: 8,
      url: 'https://example.com/video3',
      date: '2024-01-08 12:22:33',
      status: 'verified',
      result: 'Authentic',
      contentType: 'Video',
      duration: '6.3s'
    }
  ]);

  const [filteredData, setFilteredData] = useState(historyData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');

  // Filter data based on search term and filters
  useEffect(() => {
    let result = historyData;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(item => 
        item.url.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }
    
    // Apply content type filter
    if (contentTypeFilter !== 'all') {
      result = result.filter(item => item.contentType === contentTypeFilter);
    }
    
    setFilteredData(result);
  }, [searchTerm, statusFilter, contentTypeFilter, historyData]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return '#10b981'; // green-500
      case 'flagged': return '#ef4444'; // red-500
      case 'pending': return '#f59e0b'; // yellow-500
      default: return '#6b7280'; // gray-500
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'verified': return 'rgba(16, 185, 129, 0.1)'; // green-500 with opacity
      case 'flagged': return 'rgba(239, 68, 68, 0.1)'; // red-500 with opacity
      case 'pending': return 'rgba(245, 158, 11, 0.1)'; // yellow-500 with opacity
      default: return 'rgba(107, 114, 128, 0.1)'; // gray-500 with opacity
    }
  };

  const handleExport = () => {
    // In a real app, this would export the data to a file
    alert('Export functionality would be implemented here');
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
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.dark.main,
            }}
          >
            Verification History
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'text.secondary',
              mb: 2
            }}
          >
            View and manage your content verification history
          </Typography>
        </Box>

        <Card 
          sx={{ 
            borderRadius: '0.75rem',
            mb: isMobile ? 2 : 3,
          }}
          role="region"
          aria-labelledby="history-filters-heading"
        >
          <CardContent>
            <Typography 
              variant="h6" 
              id="history-filters-heading"
              sx={{ 
                fontWeight: 'bold',
                mb: 2,
                color: theme.palette.dark.main,
              }}
            >
              Filter History
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search URLs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                  }}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '0.5rem',
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel 
                    sx={{ 
                      color: 'text.primary',
                      fontWeight: 500,
                    }}
                  >
                    Status
                  </InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{
                      borderRadius: '0.5rem',
                    }}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="verified">Verified</MenuItem>
                    <MenuItem value="flagged">Flagged</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel 
                    sx={{ 
                      color: 'text.primary',
                      fontWeight: 500,
                    }}
                  >
                    Content Type
                  </InputLabel>
                  <Select
                    value={contentTypeFilter}
                    label="Content Type"
                    onChange={(e) => setContentTypeFilter(e.target.value)}
                    sx={{
                      borderRadius: '0.5rem',
                    }}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="Article">Article</MenuItem>
                    <MenuItem value="Video">Video</MenuItem>
                    <MenuItem value="Image">Image</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Button 
                  fullWidth
                  variant="outlined" 
                  startIcon={<Download />}
                  onClick={handleExport}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    borderRadius: '0.5rem',
                    textTransform: 'none',
                    fontWeight: 'medium',
                    height: isMobile ? '36px' : '40px',
                  }}
                >
                  Export
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card 
          sx={{ 
            borderRadius: '0.75rem',
          }}
          role="region"
          aria-labelledby="history-table-heading"
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
                id="history-table-heading"
                sx={{ 
                  fontWeight: 'bold',
                  color: theme.palette.dark.main,
                }}
              >
                Verification Records
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary'
                }}
              >
                {filteredData.length} records found
              </Typography>
            </Box>
            
            <Box sx={{ overflowX: 'auto' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell 
                        sx={{ 
                          fontWeight: 500,
                          color: 'rgba(0, 0, 0, 0.6)',
                          fontSize: '0.875rem',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                        }}
                      >
                        Content
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 500,
                          color: 'rgba(0, 0, 0, 0.6)',
                          fontSize: '0.875rem',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                        }}
                      >
                        Date & Time
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 500,
                          color: 'rgba(0, 0, 0, 0.6)',
                          fontSize: '0.875rem',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 500,
                          color: 'rgba(0, 0, 0, 0.6)',
                          fontSize: '0.875rem',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                        }}
                      >
                        Result
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 500,
                          color: 'rgba(0, 0, 0, 0.6)',
                          fontSize: '0.875rem',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                        }}
                      >
                        Type
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 500,
                          color: 'rgba(0, 0, 0, 0.6)',
                          fontSize: '0.875rem',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                        }}
                      >
                        Duration
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow 
                        key={item.id} 
                        sx={{ 
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                          borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                        }}
                      >
                        <TableCell 
                          sx={{ 
                            padding: '16px 16px 16px 0',
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: theme.palette.dark.main,
                              fontWeight: 500
                            }}
                          >
                            {item.url}
                          </Typography>
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            padding: '16px',
                            color: 'rgba(0, 0, 0, 0.6)',
                            fontSize: '0.875rem'
                          }}
                        >
                          {item.date}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            padding: '16px'
                          }}
                        >
                          <span style={{ 
                            backgroundColor: getStatusBgColor(item.status),
                            color: getStatusColor(item.status),
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            padding: '16px',
                            color: theme.palette.dark.main,
                            fontWeight: 500
                          }}
                        >
                          {item.result}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            padding: '16px',
                            color: 'rgba(0, 0, 0, 0.6)',
                            fontSize: '0.875rem'
                          }}
                        >
                          {item.contentType}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            padding: '16px',
                            color: 'rgba(0, 0, 0, 0.6)',
                            fontSize: '0.875rem'
                          }}
                        >
                          {item.duration}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            
            {filteredData.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'text.secondary'
                  }}
                >
                  No verification history found matching your criteria
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default History;