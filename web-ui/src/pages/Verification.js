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
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const Verification = () => {
  const [contentType, setContentType] = useState('text');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real app, you would make an API call here
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock result
      setResult({
        isVerified: Math.random() > 0.5,
        confidence: Math.floor(Math.random() * 100),
        sources: ['Source 1', 'Source 2', 'Source 3']
      });
    } catch (error) {
      console.error('Verification error:', error);
      alert('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box my={isMobile ? 2 : 4}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          gutterBottom
          id="verification-heading"
        >
          Content Verification
        </Typography>
        
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} aria-labelledby="verification-heading">
              <FormControl fullWidth margin="normal">
                <InputLabel id="content-type-label">Content Type</InputLabel>
                <Select
                  labelId="content-type-label"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  size={isMobile ? "small" : "medium"}
                  aria-describedby="content-type-help"
                >
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="image">Image URL</MenuItem>
                  <MenuItem value="video">Video URL</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                multiline
                rows={isMobile ? 3 : 4}
                variant="outlined"
                label={contentType === 'text' ? 'Enter text to verify' : 'Enter URL'}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                margin="normal"
                required
                size={isMobile ? "small" : "medium"}
                aria-describedby="content-input-help"
              />
              
              <Box mt={2}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  disabled={loading}
                  fullWidth={isMobile}
                  size={isMobile ? "medium" : "large"}
                  aria-label={loading ? "Verifying content" : "Verify content"}
                >
                  {loading ? 'Verifying...' : 'Verify Content'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
        
        {result && (
          <Card 
            style={{ marginTop: isMobile ? '16px' : '20px' }}
            role="region"
            aria-labelledby="result-heading"
          >
            <CardContent>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                gutterBottom
                id="result-heading"
              >
                Verification Result: {result.isVerified ? 'Verified' : 'Not Verified'}
              </Typography>
              <Typography 
                variant={isMobile ? "body2" : "body1"}
                aria-label={`Confidence level: ${result.confidence} percent`}
              >
                Confidence: {result.confidence}%
              </Typography>
              <Typography 
                variant={isMobile ? "body2" : "body1"}
                aria-label={`Sources: ${result.sources.join(', ')}`}
              >
                Sources: {result.sources.join(', ')}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default Verification;