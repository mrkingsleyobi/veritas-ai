import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button,
  Avatar,
  Divider,
  useMediaQuery,
  Grid
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AccountCircle, Edit } from '@mui/icons-material';

const Profile = ({ currentUser }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // User profile state
  const [profile, setProfile] = useState({
    name: currentUser?.name || 'Demo User',
    email: currentUser?.email || 'user@example.com',
    organization: 'VeritasAI',
    role: 'User',
    joinDate: 'January 2024',
    phone: '',
    bio: ''
  });

  const [editMode, setEditMode] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);

  const handleEdit = () => {
    setTempProfile(profile);
    setEditMode(true);
  };

  const handleSave = () => {
    setProfile(tempProfile);
    setEditMode(false);
    // In a real app, you would save these changes to a backend
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setEditMode(false);
  };

  const handleInputChange = (field, value) => {
    setTempProfile(prev => ({
      ...prev,
      [field]: value
    }));
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
            User Profile
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'text.secondary',
              mb: 2
            }}
          >
            Manage your account information
          </Typography>
        </Box>

        <Grid container spacing={isMobile ? 2 : 3}>
          {/* Profile Header Card */}
          <Grid item xs={12}>
            <Card 
              sx={{ 
                borderRadius: '0.75rem',
              }}
              role="region"
              aria-labelledby="profile-header-heading"
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mr: 3,
                      backgroundColor: theme.palette.primary.main,
                    }}
                  >
                    <AccountCircle sx={{ width: 60, height: 60, color: 'white' }} />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant="h5" 
                      component="h2"
                      sx={{ 
                        fontWeight: 'bold',
                        color: theme.palette.dark.main,
                        mb: 0.5
                      }}
                    >
                      {profile.name}
                    </Typography>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        color: 'text.secondary',
                        mb: 0.5
                      }}
                    >
                      {profile.role} at {profile.organization}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary'
                      }}
                    >
                      Member since {profile.joinDate}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Details Card */}
          <Grid item xs={12}>
            <Card 
              sx={{ 
                borderRadius: '0.75rem',
              }}
              role="region"
              aria-labelledby="profile-details-heading"
            >
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Typography 
                    variant="h6" 
                    id="profile-details-heading"
                    sx={{ 
                      fontWeight: 'bold',
                      color: theme.palette.dark.main,
                    }}
                  >
                    Profile Details
                  </Typography>
                  {!editMode && (
                    <Button 
                      variant="outlined" 
                      startIcon={<Edit />}
                      onClick={handleEdit}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        borderRadius: '0.5rem',
                        textTransform: 'none',
                        fontWeight: 'medium',
                      }}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Box>
                
                <Divider sx={{ mb: 3 }} />

                {editMode ? (
                  <Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          value={tempProfile.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          margin="normal"
                          size={isMobile ? "small" : "medium"}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '0.5rem',
                            },
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          value={tempProfile.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          margin="normal"
                          size={isMobile ? "small" : "medium"}
                          type="email"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '0.5rem',
                            },
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Organization"
                          value={tempProfile.organization}
                          onChange={(e) => handleInputChange('organization', e.target.value)}
                          margin="normal"
                          size={isMobile ? "small" : "medium"}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '0.5rem',
                            },
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Phone"
                          value={tempProfile.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          margin="normal"
                          size={isMobile ? "small" : "medium"}
                          type="tel"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '0.5rem',
                            },
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Bio"
                          value={tempProfile.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          margin="normal"
                          size={isMobile ? "small" : "medium"}
                          multiline
                          rows={4}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '0.5rem',
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      mt: 4,
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'flex-end'
                    }}>
                      <Button 
                        variant="outlined" 
                        onClick={handleCancel}
                        size={isMobile ? "medium" : "large"}
                        sx={{
                          borderRadius: '0.5rem',
                          textTransform: 'none',
                          fontWeight: 'medium',
                          minWidth: { xs: '100%', sm: 'auto' },
                        }}
                      >
                        Cancel
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
                        Save Changes
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            color: 'text.primary',
                            mb: 0.5
                          }}
                        >
                          Full Name
                        </Typography>
                        <Typography 
                          variant="body1"
                          sx={{ 
                            color: theme.palette.dark.main,
                          }}
                        >
                          {profile.name}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            color: 'text.primary',
                            mb: 0.5
                          }}
                        >
                          Email
                        </Typography>
                        <Typography 
                          variant="body1"
                          sx={{ 
                            color: theme.palette.dark.main,
                          }}
                        >
                          {profile.email}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            color: 'text.primary',
                            mb: 0.5
                          }}
                        >
                          Organization
                        </Typography>
                        <Typography 
                          variant="body1"
                          sx={{ 
                            color: theme.palette.dark.main,
                          }}
                        >
                          {profile.organization}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            color: 'text.primary',
                            mb: 0.5
                          }}
                        >
                          Role
                        </Typography>
                        <Typography 
                          variant="body1"
                          sx={{ 
                            color: theme.palette.dark.main,
                          }}
                        >
                          {profile.role}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            color: 'text.primary',
                            mb: 0.5
                          }}
                        >
                          Member Since
                        </Typography>
                        <Typography 
                          variant="body1"
                          sx={{ 
                            color: theme.palette.dark.main,
                          }}
                        >
                          {profile.joinDate}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            color: 'text.primary',
                            mb: 0.5
                          }}
                        >
                          Phone
                        </Typography>
                        <Typography 
                          variant="body1"
                          sx={{ 
                            color: theme.palette.dark.main,
                          }}
                        >
                          {profile.phone || 'Not provided'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ mb: 2 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            color: 'text.primary',
                            mb: 0.5
                          }}
                        >
                          Bio
                        </Typography>
                        <Typography 
                          variant="body1"
                          sx={{ 
                            color: theme.palette.dark.main,
                          }}
                        >
                          {profile.bio || 'No bio provided'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Profile;