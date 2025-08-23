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
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real app, you would make an API call here
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to dashboard on success
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        p={isMobile ? 2 : 3}
      >
        <Card sx={{ width: '100%' }}>
          <CardContent sx={{ p: isMobile ? 3 : 4 }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              component="h1" 
              align="center" 
              gutterBottom
              sx={{ mb: isMobile ? 2 : 3 }}
              id="login-heading"
            >
              VeritasAI Login
            </Typography>
            <form onSubmit={handleSubmit} aria-labelledby="login-heading">
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                margin="normal"
                size={isMobile ? "small" : "medium"}
                aria-describedby="email-help"
                inputProps={{
                  'aria-required': 'true',
                  'aria-invalid': 'false'
                }}
              />
              
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                margin="normal"
                size={isMobile ? "small" : "medium"}
                aria-describedby="password-help"
                inputProps={{
                  'aria-required': 'true',
                  'aria-invalid': 'false'
                }}
              />
              
              <Box mt={2}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  disabled={loading}
                  fullWidth
                  size={isMobile ? "medium" : "large"}
                  aria-label={loading ? "Logging in" : "Login to your account"}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Box>
            </form>
            
            <Box mt={2} textAlign="center">
              <Button 
                onClick={() => navigate('/register')}
                color="primary"
                size={isMobile ? "small" : "medium"}
                aria-label="Go to registration page"
              >
                Don't have an account? Register
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;