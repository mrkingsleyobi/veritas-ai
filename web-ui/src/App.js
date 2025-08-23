import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMediaQuery } from '@mui/material';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Verification from './pages/Verification';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import History from './pages/History';
import Help from './pages/Help';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AuthService from './services/auth';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6', // primary: '#3b82f6' from prototypes
    },
    secondary: {
      main: '#1e40af', // secondary: '#1e40af' from prototypes
    },
    accent: {
      main: '#8b5cf6', // accent: '#8b5cf6' from prototypes
    },
    dark: {
      main: '#0f172a', // dark: '#0f172a' from prototypes
    },
    light: {
      main: '#f8fafc', // light: '#f8fafc' from prototypes
    },
    background: {
      default: '#f1f5f9', // similar to bg-gray-50 from prototypes
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem', // rounded-xl from prototypes
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm from prototypes
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem', // rounded-lg from prototypes
          textTransform: 'none', // Remove uppercase transformation
        },
      },
    },
  },
});

function App() {
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Check authentication status on app load
  useEffect(() => {
    const authStatus = AuthService.isAuthenticated();
    setIsAuthenticated(authStatus);
    
    if (authStatus) {
      const user = AuthService.getCurrentUser();
      setCurrentUser(user);
    }
  }, []);

  const handleLogin = (email, password) => {
    const result = AuthService.login(email, password);
    if (result.success) {
      setIsAuthenticated(true);
      setCurrentUser(result.user);
    }
    return result;
  };

  const handleRegister = (name, email, password) => {
    const result = AuthService.register(name, email, password);
    if (result.success) {
      setIsAuthenticated(true);
      setCurrentUser(result.user);
    }
    return result;
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div 
        style={{ display: 'flex' }}
        role="main"
        aria-label="VeritasAI Application"
      >
        {isAuthenticated && <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />}
        <div style={{ flex: 1 }}>
          {isAuthenticated && <Header onLogout={handleLogout} currentUser={currentUser} onDrawerToggle={handleDrawerToggle} />}
          <main 
            style={{ padding: isMobile ? '16px' : '24px' }}
            id="main-content"
          >
            <Routes>
              <Route path="/login" element={
                isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
              } />
              <Route path="/register" element={
                isAuthenticated ? <Navigate to="/" replace /> : <Register onRegister={handleRegister} />
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/verification" element={
                <ProtectedRoute>
                  <Verification />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile currentUser={currentUser} />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } />
              <Route path="/help" element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;