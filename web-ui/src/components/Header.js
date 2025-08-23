import React from 'react';
import { AppBar, Toolbar, Typography, Button, useMediaQuery, IconButton, Badge } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { Notifications, Menu } from '@mui/icons-material';

const Header = ({ onLogout, currentUser, onDrawerToggle }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: '#ffffff', 
        color: theme.palette.dark.main,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>
        )}
        
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          sx={{ 
            flexGrow: 1,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="VeritasAI Dashboard"
        >
          <span style={{ 
            backgroundColor: theme.palette.primary.main, 
            width: '32px', 
            height: '32px', 
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '8px',
          }}>
            {/* Shield icon placeholder */}
            <span style={{ color: 'white', fontSize: '16px' }}>🛡️</span>
          </span>
          VeritasAI
        </Typography>
        
        <IconButton 
          size="large" 
          aria-label="show notifications"
          sx={{ color: theme.palette.dark.main }}
        >
          <Badge badgeContent={3} color="primary">
            <Notifications />
          </Badge>
        </IconButton>
        
        {currentUser && (
          <IconButton 
            size="large" 
            aria-label="user profile"
            sx={{ 
              ml: 2,
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              width: '40px',
              height: '40px',
            }}
          >
            {/* User icon placeholder */}
            <span>👤</span>
          </IconButton>
        )}
        
        {!isMobile && (
          <Button 
            variant="outlined" 
            onClick={onLogout}
            sx={{ 
              ml: 2,
              color: theme.palette.dark.main,
              borderColor: theme.palette.dark.main,
              '&:hover': {
                borderColor: theme.palette.dark.main,
                backgroundColor: 'rgba(15, 23, 42, 0.04)',
              }
            }}
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