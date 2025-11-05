import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

// Mock authentication service (to be replaced with actual API calls)
const mockAuthService = {
  // Login with email and password
  login: async (email, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (password.length < 6) {
      throw new Error('Invalid credentials');
    }

    // Return mock user data
    return {
      user: {
        id: '123',
        email: email,
        firstName: 'John',
        lastName: 'Doe',
        role: 'member',
        avatar: null
      },
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
    };
  },

  // Register new user
  register: async (userData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock validation
    if (!userData.email || !userData.password) {
      throw new Error('Email and password are required');
    }

    // Return mock user data
    return {
      user: {
        id: '124',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'member',
        avatar: null
      },
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
    };
  },

  // Forgot password
  forgotPassword: async (email) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!email) {
      throw new Error('Email is required');
    }

    return { message: 'Password reset instructions sent' };
  },

  // Reset password
  resetPassword: async (token, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!token) {
      throw new Error('Invalid reset token');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    return { message: 'Password reset successful' };
  },

  // Google login
  googleLogin: async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      user: {
        id: '125',
        email: 'user@gmail.com',
        firstName: 'Google',
        lastName: 'User',
        role: 'member',
        avatar: null
      },
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
    };
  },

  // GitHub login
  githubLogin: async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      user: {
        id: '126',
        email: 'user@github.com',
        firstName: 'GitHub',
        lastName: 'User',
        role: 'member',
        avatar: null
      },
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
    };
  },

  // Setup MFA
  setupMFA: async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik01MCA1MEg3MFY3MEg1MFoiIGZpbGw9IiMwMDAiLz48cGF0aCBkPSJNODAgNTBIMTAwVjcwSDgwWiIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik0xMTAgNTBIMTMwVjcwSDExMFoiIGZpbGw9IiMwMDAiLz48cGF0aCBkPSJNMTQwIDUwSDE2MFY3MEgxNDBaIiBmaWxsPSIjMDAwIi8+PHBhdGggZD0iTTUwIDgwSDcwVjEwMEg1MFoiIGZpbGw9IiMwMDAiLz48cGF0aCBkPSJNODAgODBIMTAwVjEwMEg4MFoiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMTEwIDgwSDEzMFYxMDBIMTEwWiIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik0xNDAgODBIMTYwVjEwMEgxNDBaIiBmaWxsPSIjMDAwIi8+PHBhdGggZD0iTTUwIDExMEg3MFYxMzBINzBaIiBmaWxsPSIjMDAwIi8+PHBhdGggZD0iTTgwIDExMEgxMDBWMTMwSDgwWiIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik0xMTAgMTEwSDEzMFYxMzBIMTEwWiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0xNDAgMTEwSDE2MFYxMzBIMTQwWiIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik01MCAxNDBINzBWMjAwSDUwWiIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik04MCAxNDBIMTAwVjIwMEg4MFoiIGZpbGw9IiMwMDAiLz48cGF0aCBkPSJNMTEwIDE0MEgxMzBWMjAwSDExMFoiIGZpbGw9IiMwMDAiLz48cGF0aCBkPSJNMTQwIDE0MEgxNjBWMjAwSDE0MFoiIGZpbGw9IiMwMDAiLz48L3N2Zz4=',
      secret: 'ABC123XYZ789'
    };
  },

  // Verify MFA
  verifyMFA: async (code) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (code !== '123456') {
      throw new Error('Invalid verification code');
    }

    return {
      backupCodes: ['ABCD-1234', 'EFGH-5678', 'IJKL-9012', 'MNOP-3456', 'QRST-7890']
    };
  },

  // Refresh session
  refreshSession: async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      token: 'new-mock-jwt-token',
      refreshToken: 'new-mock-refresh-token'
    };
  },

  // Update profile
  updateProfile: async (profileData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      user: {
        id: '123',
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        bio: profileData.bio,
        avatar: profileData.avatarPreview || null
      }
    };
  },

  // Update password
  updatePassword: async (currentPassword, newPassword) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (currentPassword !== 'current123') {
      throw new Error('Current password is incorrect');
    }

    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters');
    }

    return { message: 'Password updated successfully' };
  },

  // Delete account
  deleteAccount: async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { message: 'Account deleted successfully' };
  },

  // Update role
  updateRole: async (newRole) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { message: 'Role updated successfully' };
  },

  // Logout
  logout: async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    return { message: 'Logged out successfully' };
  },

  // Logout all sessions
  logoutAllSessions: async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { message: 'All sessions logged out successfully' };
  },

  // Logout specific session
  logoutSession: async (sessionId) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    return { message: 'Session logged out successfully' };
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [roles] = useState([
    { id: 'admin', name: 'Administrator' },
    { id: 'manager', name: 'Manager' },
    { id: 'member', name: 'Member' },
    { id: 'viewer', name: 'Viewer' }
  ]);
  const [permissions] = useState([
    { id: 'view_dashboard', name: 'View Dashboard', description: 'Access to view dashboard', role: 'member' },
    { id: 'edit_profile', name: 'Edit Profile', description: 'Ability to edit user profile', role: 'member' },
    { id: 'manage_users', name: 'Manage Users', description: 'Create, edit, and delete users', role: 'admin' },
    { id: 'manage_roles', name: 'Manage Roles', description: 'Assign and modify user roles', role: 'admin' },
    { id: 'view_reports', name: 'View Reports', description: 'Access to view system reports', role: 'manager' },
    { id: 'export_data', name: 'Export Data', description: 'Ability to export system data', role: 'manager' }
  ]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);

          // Load mock sessions and security logs
          loadMockData();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Load mock data
  const loadMockData = () => {
    // Mock sessions
    const mockSessions = [
      {
        id: '1',
        device: 'Chrome on Windows',
        ipAddress: '192.168.1.100',
        location: 'New York, NY',
        userAgent: 'Chrome 98.0.4758.102',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isActive: true
      },
      {
        id: '2',
        device: 'Safari on iPhone',
        ipAddress: '10.0.0.50',
        location: 'San Francisco, CA',
        userAgent: 'Mobile Safari 15.3',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
        isActive: true
      },
      {
        id: '3',
        device: 'Firefox on macOS',
        ipAddress: '172.16.0.25',
        location: 'London, UK',
        userAgent: 'Firefox 96.0.1',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: false
      }
    ];

    setSessions(mockSessions);

    // Mock security logs
    const mockLogs = [
      {
        id: '1',
        type: 'login',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        ipAddress: '192.168.1.100',
        location: 'New York, NY',
        userAgent: 'Chrome 98.0.4758.102',
        message: 'Successful login'
      },
      {
        id: '2',
        type: 'password_change',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        ipAddress: '192.168.1.100',
        location: 'New York, NY',
        userAgent: 'Chrome 98.0.4758.102',
        message: 'Password changed successfully'
      },
      {
        id: '3',
        type: 'failed_login',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        ipAddress: '203.0.113.45',
        location: 'Unknown',
        userAgent: 'Unknown',
        message: 'Failed login attempt - invalid credentials'
      },
      {
        id: '4',
        type: 'login',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        ipAddress: '10.0.0.50',
        location: 'San Francisco, CA',
        userAgent: 'Mobile Safari 15.3',
        message: 'Successful login'
      },
      {
        id: '5',
        type: 'mfa_enabled',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        ipAddress: '192.168.1.100',
        location: 'New York, NY',
        userAgent: 'Chrome 98.0.4758.102',
        message: 'Two-factor authentication enabled'
      }
    ];

    setSecurityLogs(mockLogs);
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await mockAuthService.login(email, password);
      setUser(response.user);
      setToken(response.token);
      setRefreshToken(response.refreshToken);
      setIsAuthenticated(true);

      // Store in localStorage
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('authUser', JSON.stringify(response.user));

      // Load mock data
      loadMockData();

      return response;
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await mockAuthService.register(userData);
      setUser(response.user);
      setToken(response.token);
      setRefreshToken(response.refreshToken);
      setIsAuthenticated(true);

      // Store in localStorage
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('authUser', JSON.stringify(response.user));

      // Load mock data
      loadMockData();

      return response;
    } catch (error) {
      throw error;
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      const response = await mockAuthService.forgotPassword(email);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (token, password) => {
    try {
      const response = await mockAuthService.resetPassword(token, password);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Google login function
  const googleLogin = async () => {
    try {
      const response = await mockAuthService.googleLogin();
      setUser(response.user);
      setToken(response.token);
      setRefreshToken(response.refreshToken);
      setIsAuthenticated(true);

      // Store in localStorage
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('authUser', JSON.stringify(response.user));

      // Load mock data
      loadMockData();

      return response;
    } catch (error) {
      throw error;
    }
  };

  // GitHub login function
  const githubLogin = async () => {
    try {
      const response = await mockAuthService.githubLogin();
      setUser(response.user);
      setToken(response.token);
      setRefreshToken(response.refreshToken);
      setIsAuthenticated(true);

      // Store in localStorage
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('authUser', JSON.stringify(response.user));

      // Load mock data
      loadMockData();

      return response;
    } catch (error) {
      throw error;
    }
  };

  // Setup MFA function
  const setupMFA = async () => {
    try {
      const response = await mockAuthService.setupMFA();
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Verify MFA function
  const verifyMFA = async (code) => {
    try {
      const response = await mockAuthService.verifyMFA(code);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Refresh session function
  const refreshSession = async () => {
    try {
      const response = await mockAuthService.refreshSession();
      setToken(response.token);
      setRefreshToken(response.refreshToken);

      // Update localStorage
      localStorage.setItem('authToken', response.token);

      return response;
    } catch (error) {
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await mockAuthService.updateProfile(profileData);
      setUser(response.user);

      // Update localStorage
      localStorage.setItem('authUser', JSON.stringify(response.user));

      return response;
    } catch (error) {
      throw error;
    }
  };

  // Update password function
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await mockAuthService.updatePassword(currentPassword, newPassword);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Delete account function
  const deleteAccount = async () => {
    try {
      const response = await mockAuthService.deleteAccount();

      // Clear auth state
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      setIsAuthenticated(false);

      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');

      return response;
    } catch (error) {
      throw error;
    }
  };

  // Update role function
  const updateRole = async (newRole) => {
    try {
      const response = await mockAuthService.updateRole(newRole);

      // Update user role
      if (user) {
        const updatedUser = { ...user, role: newRole };
        setUser(updatedUser);

        // Update localStorage
        localStorage.setItem('authUser', JSON.stringify(updatedUser));
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const response = await mockAuthService.logout();

      // Clear auth state
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      setIsAuthenticated(false);
      setSessions([]);
      setSecurityLogs([]);

      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');

      return response;
    } catch (error) {
      throw error;
    }
  };

  // Logout all sessions function
  const logoutAllSessions = async () => {
    try {
      const response = await mockAuthService.logoutAllSessions();

      // Clear auth state
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      setIsAuthenticated(false);
      setSessions([]);
      setSecurityLogs([]);

      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');

      return response;
    } catch (error) {
      throw error;
    }
  };

  // Logout specific session function
  const logoutSession = async (sessionId) => {
    try {
      const response = await mockAuthService.logoutSession(sessionId);

      // Update sessions
      setSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === sessionId
            ? { ...session, isActive: false }
            : session
        )
      );

      return response;
    } catch (error) {
      throw error;
    }
  };

  // Context value
  const value = {
    user,
    token,
    refreshToken,
    isAuthenticated,
    loading,
    sessions,
    securityLogs,
    roles,
    permissions,
    login,
    register,
    forgotPassword,
    resetPassword,
    googleLogin,
    githubLogin,
    setupMFA,
    verifyMFA,
    refreshSession,
    updateProfile,
    updatePassword,
    deleteAccount,
    updateRole,
    logout,
    logoutAllSessions,
    logoutSession
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;