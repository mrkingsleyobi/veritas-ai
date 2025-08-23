import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  useMediaQuery,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Dashboard, VerifiedUser, History, Settings, AccountCircle, HelpOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Toolbar } from '@mui/material';

const Sidebar = ({ mobileOpen, onDrawerToggle }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Verification', icon: <VerifiedUser />, path: '/verification' },
    { text: 'History', icon: <History />, path: '/history' },
    { text: 'Profile', icon: <AccountCircle />, path: '/profile' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
    { text: 'Help', icon: <HelpOutline />, path: '/help' },
  ];

  const drawerWidth = 256;

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      anchor="left"
      open={isMobile ? mobileOpen : true}
      onClose={onDrawerToggle}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          ...(isMobile && {
            position: 'absolute',
          }),
        },
      }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      aria-label="Main navigation"
    >
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.dark.main,
          }}
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
      </div>
      <Divider />
      <List component="nav" aria-label="Main navigation">
        {menuItems.map((item, index) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => {
              navigate(item.path);
              if (isMobile) onDrawerToggle();
            }}
            sx={{
              margin: '4px 8px',
              borderRadius: '0.5rem',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
            aria-label={`Go to ${item.text}`}
            component="a"
          >
            <ListItemIcon 
              aria-hidden="true"
              sx={{
                minWidth: '40px',
                color: theme.palette.dark.main,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                sx: {
                  color: theme.palette.dark.main,
                  fontWeight: 500,
                }
              }}
            />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;