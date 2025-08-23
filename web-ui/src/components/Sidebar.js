import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  useMediaQuery 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Dashboard, VerifiedUser, History, Settings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Toolbar } from '@mui/material';

const Sidebar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Verification', icon: <VerifiedUser />, path: '/verification' },
    { text: 'History', icon: <History />, path: '/history' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  const drawerWidth = 240;

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      anchor="left"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
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
      <Toolbar />
      <Divider />
      <List component="nav" aria-label="Main navigation">
        {menuItems.map((item, index) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => navigate(item.path)}
            aria-label={`Go to ${item.text}`}
            component="a"
          >
            <ListItemIcon aria-hidden="true">{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;