import React from 'react';
import { AppBar, Toolbar, Typography, Button, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const Header = ({ onLogout }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          style={{ flexGrow: 1 }}
          aria-label="VeritasAI Dashboard"
        >
          VeritasAI
        </Typography>
        {!isMobile && (
          <>
            <Button 
              color="inherit" 
              onClick={() => navigate('/')}
              aria-label="Go to dashboard"
            >
              Home
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/verification')}
              aria-label="Go to content verification"
            >
              Verification
            </Button>
            <Button 
              color="inherit" 
              onClick={onLogout}
              aria-label="Logout from application"
            >
              Logout
            </Button>
          </>
        )}
        {isMobile && (
          <Button 
            color="inherit" 
            onClick={onLogout}
            aria-label="Logout from application"
          >
            Logout
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;