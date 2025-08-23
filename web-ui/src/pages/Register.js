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

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real app, you would make an API call here
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, password })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to dashboard on success
      alert('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
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
              id="register-heading"
            >
              Create Account
            </Typography>
            <form onSubmit={handleSubmit} aria-labelledby="register-heading">
              <TextField
                fullWidth
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                margin="normal"
                size={isMobile ? "small" : "medium"}
                aria-describedby="name-help"
                inputProps={{
                  'aria-required': 'true',
                  'aria-invalid': 'false'
                }}
              />
              
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
              
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                margin="normal"
                size={isMobile ? "small" : "medium"}
                aria-describedby="confirm-password-help"
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
                  aria-label={loading ? "Creating account" : "Register for an account"}
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </Button>
              </Box>
            </form>
            
            <Box mt={2} textAlign="center">
              <Button 
                onClick={() => navigate('/login')}
                color="primary"
                size={isMobile ? "small" : "medium"}
                aria-label="Go to login page"
              >
                Already have an account? Login
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Register;