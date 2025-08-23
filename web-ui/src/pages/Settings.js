import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormControlLabel, 
  Switch, 
  Button,
  TextField,
  Divider,
  useMediaQuery,
  Grid
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const Settings = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Settings state
  const [settings, setSettings] = useState({
    language: 'en',
    theme: 'light',
    notifications: true,
    emailNotifications: true,
    verificationAlerts: true,
    autoRefresh: true,
    refreshInterval: 30,
    dateFormat: 'MM/DD/YYYY',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = () => {
    // In a real app, you would save these settings to a backend or localStorage
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    setSettings({
      language: 'en',
      theme: 'light',
      notifications: true,
      emailNotifications: true,
      verificationAlerts: true,
      autoRefresh: true,
      refreshInterval: 30,
      dateFormat: 'MM/DD/YYYY',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
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
            Settings
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'text.secondary',
              mb: 2
            }}
          >
            Configure your VeritasAI experience
          </Typography>
        </Box>

        <Grid container spacing={isMobile ? 2 : 3}>
          {/* General Settings Card */}
          <Grid item xs={12} lg={6}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: '0.75rem',
              }}
              role="region"
              aria-labelledby="general-settings-heading"
            >
              <CardContent>
                <Typography 
                  variant="h6" 
                  id="general-settings-heading"
                  sx={{ 
                    fontWeight: 'bold',
                    mb: 2,
                    color: theme.palette.dark.main,
                  }}
                >
                  General Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel 
                      sx={{ 
                        color: 'text.primary',
                        fontWeight: 500,
                      }}
                    >
                      Language
                    </InputLabel>
                    <Select
                      value={settings.language}
                      label="Language"
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        borderRadius: '0.5rem',
                      }}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="es">Spanish</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                      <MenuItem value="de">German</MenuItem>
                      <MenuItem value="ja">Japanese</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel 
                      sx={{ 
                        color: 'text.primary',
                        fontWeight: 500,
                      }}
                    >
                      Theme
                    </InputLabel>
                    <Select
                      value={settings.theme}
                      label="Theme"
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        borderRadius: '0.5rem',
                      }}
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="auto">System Default</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel 
                      sx={{ 
                        color: 'text.primary',
                        fontWeight: 500,
                      }}
                    >
                      Date Format
                    </InputLabel>
                    <Select
                      value={settings.dateFormat}
                      label="Date Format"
                      onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        borderRadius: '0.5rem',
                      }}
                    >
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Time Zone"
                    value={settings.timeZone}
                    onChange={(e) => handleSettingChange('timeZone', e.target.value)}
                    margin="normal"
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      borderRadius: '0.5rem',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '0.5rem',
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Notification Settings Card */}
          <Grid item xs={12} lg={6}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: '0.75rem',
                mb: isMobile ? 2 : 3,
              }}
              role="region"
              aria-labelledby="notification-settings-heading"
            >
              <CardContent>
                <Typography 
                  variant="h6" 
                  id="notification-settings-heading"
                  sx={{ 
                    fontWeight: 'bold',
                    mb: 2,
                    color: theme.palette.dark.main,
                  }}
                >
                  Notification Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications}
                        onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Enable Notifications"
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontWeight: 500,
                        color: 'text.primary',
                      }
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                        disabled={!settings.notifications}
                        color="primary"
                      />
                    }
                    label="Email Notifications"
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontWeight: 500,
                        color: 'text.primary',
                      }
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.verificationAlerts}
                        onChange={(e) => handleSettingChange('verificationAlerts', e.target.checked)}
                        disabled={!settings.notifications}
                        color="primary"
                      />
                    }
                    label="Verification Alerts"
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontWeight: 500,
                        color: 'text.primary',
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
            
            {/* Dashboard Settings Card */}
            <Card 
              sx={{ 
                borderRadius: '0.75rem',
              }}
              role="region"
              aria-labelledby="dashboard-settings-heading"
            >
              <CardContent>
                <Typography 
                  variant="h6" 
                  id="dashboard-settings-heading"
                  sx={{ 
                    fontWeight: 'bold',
                    mb: 2,
                    color: theme.palette.dark.main,
                  }}
                >
                  Dashboard Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoRefresh}
                        onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Auto-refresh Dashboard"
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontWeight: 500,
                        color: 'text.primary',
                      }
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Refresh Interval (seconds)"
                    value={settings.refreshInterval}
                    onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                    disabled={!settings.autoRefresh}
                    margin="normal"
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      borderRadius: '0.5rem',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '0.5rem',
                      },
                    }}
                    InputProps={{
                      inputProps: { min: 10, max: 300 }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mt: isMobile ? 2 : 3,
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'flex-end'
        }}>
          <Button 
            variant="outlined" 
            onClick={handleReset}
            size={isMobile ? "medium" : "large"}
            sx={{
              borderRadius: '0.5rem',
              textTransform: 'none',
              fontWeight: 'medium',
              minWidth: { xs: '100%', sm: 'auto' },
            }}
          >
            Reset to Defaults
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSave}
            size={isMobile ? "medium" : "large"}
            sx={{
              borderRadius: '0.5rem',
              textTransform: 'none',
              fontWeight: 'medium',
              minWidth: { xs: '100%', sm: 'auto' },
            }}
          >
            Save Settings
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Settings;