import React from 'react';
import { Container, Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardAnalytics from '../dashboard/components/DashboardAnalytics';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
        <DashboardAnalytics />
      </Container>
    </Box>
  );
};

export default Dashboard;