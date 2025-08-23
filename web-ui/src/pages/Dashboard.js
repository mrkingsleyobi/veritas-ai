import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DashboardAnalytics from '../dashboard/components/DashboardAnalytics';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app, you would clear auth tokens
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header onLogout={handleLogout} />
        
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              VeritasAI Dashboard
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Advanced analytics and content verification insights
            </Typography>
          </Box>
          
          <DashboardAnalytics />
        </Container>
      </div>
    </div>
  );
};

export default Dashboard;