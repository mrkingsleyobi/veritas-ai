# Authentication Components Documentation

This document provides detailed information about the authentication components implemented for the SaaS frontend. All components are located in the `src/components/auth/` directory.

## Table of Contents

1. [Overview](#overview)
2. [Component Structure](#component-structure)
3. [Main Authentication Components](#main-authentication-components)
4. [OAuth Integration](#oauth-integration)
5. [Multi-Factor Authentication](#multi-factor-authentication)
6. [Session Management](#session-management)
7. [Role-Based Access Control](#role-based-access-control)
8. [User Profile Management](#user-profile-management)
9. [Account Settings](#account-settings)
10. [Security Audit Logs](#security-audit-logs)
11. [Authentication Context](#authentication-context)
12. [Styling](#styling)
13. [Security Practices](#security-practices)

## Overview

The authentication system provides a complete solution for user authentication and authorization in a SaaS application. It includes:

- User registration and login with JWT
- Password reset functionality
- OAuth2 integration (Google, GitHub)
- Multi-factor authentication (MFA)
- Session management with automatic refresh
- Role-based access control (RBAC)
- User profile management
- Account settings
- Security audit logging

## Component Structure

```
src/components/auth/
├── AuthContext.jsx          # Authentication context and provider
├── AuthStyles.css           # Shared styles for all auth components
├── index.js                 # Export file for all components
├── Login.jsx                # Login page component
├── Register.jsx             # Registration page component
├── ForgotPassword.jsx       # Forgot password page
├── ResetPassword.jsx        # Password reset page
├── Profile.jsx              # User profile management
├── AccountSettings.jsx      # Account settings page
├── SecurityLog.jsx          # Security audit log display
├── mfa/
│   ├── MFASetup.jsx         # MFA setup component
│   └── MFAStyles.css        # MFA-specific styles
├── oauth/
│   ├── GoogleLogin.jsx      # Google OAuth login
│   ├── GitHubLogin.jsx      # GitHub OAuth login
│   └── OAuthStyles.css      # OAuth-specific styles
├── rbac/
│   ├── RoleManager.jsx      # Role management component
│   └── RBACStyles.css       # RBAC-specific styles
└── session/
    ├── SessionManager.jsx   # Session management component
    └── SessionStyles.css    # Session-specific styles
```

## Main Authentication Components

### Login Component

The Login component provides email/password authentication with JWT tokens.

**Features:**
- Form validation
- Loading states
- Error handling
- Automatic redirect after login
- Integration with AuthContext

**Usage:**
```jsx
import { Login } from './components/auth';

function App() {
  return (
    <AuthProvider>
      <Login />
    </AuthProvider>
  );
}
```

### Register Component

The Register component handles new user registration with form validation.

**Features:**
- First name and last name fields
- Email validation
- Password strength requirements (min 8 characters)
- Password confirmation
- Loading states
- Error handling

**Usage:**
```jsx
import { Register } from './components/auth';

function App() {
  return (
    <AuthProvider>
      <Register />
    </AuthProvider>
  );
}
```

### Forgot Password Component

The ForgotPassword component allows users to request a password reset.

**Features:**
- Email validation
- Success and error messages
- Loading states

**Usage:**
```jsx
import { ForgotPassword } from './components/auth';

function App() {
  return (
    <AuthProvider>
      <ForgotPassword />
    </AuthProvider>
  );
}
```

### Reset Password Component

The ResetPassword component allows users to set a new password using a reset token.

**Features:**
- Password strength validation
- Password confirmation
- Token parameter handling
- Success and error messages
- Automatic redirect after reset

**Usage:**
```jsx
import { ResetPassword } from './components/auth';

function App() {
  return (
    <AuthProvider>
      <ResetPassword />
    </AuthProvider>
  );
}
```

## OAuth Integration

### Google Login Component

The GoogleLogin component provides Google OAuth2 integration.

**Features:**
- Google branded button
- SVG icon
- Loading states
- Error handling

**Usage:**
```jsx
import { GoogleLogin } from './components/auth';

function App() {
  return (
    <AuthProvider>
      <GoogleLogin />
    </AuthProvider>
  );
}
```

### GitHub Login Component

The GitHubLogin component provides GitHub OAuth2 integration.

**Features:**
- GitHub branded button
- SVG icon
- Loading states
- Error handling

**Usage:**
```jsx
import { GitHubLogin } from './components/auth';

function App() {
  return (
    <AuthProvider>
      <GitHubLogin />
    </AuthProvider>
  );
}
```

## Multi-Factor Authentication

### MFA Setup Component

The MFASetup component guides users through setting up two-factor authentication.

**Features:**
- QR code generation
- Manual entry option
- 6-digit code verification
- Backup code generation
- Download and copy backup codes
- Multi-step process with clear instructions

**Usage:**
```jsx
import { MFASetup } from './components/auth';

function App() {
  return (
    <AuthProvider>
      <MFASetup />
    </AuthProvider>
  );
}
```

## Session Management

### Session Manager Component

The SessionManager component displays active user sessions and allows session management.

**Features:**
- List of active sessions
- Session details (device, location, IP, timestamps)
- Current session identification
- Logout individual sessions
- Logout all sessions
- Session refresh

**Usage:**
```jsx
import { SessionManager } from './components/auth';

function App() {
  return (
    <AuthProvider>
      <SessionManager />
    </AuthProvider>
  );
}
```

## Role-Based Access Control

### Role Manager Component

The RoleManager component allows users to view and manage their roles and permissions.

**Features:**
- Role selection dropdown
- Role details display
- Permission list based on role
- Role comparison
- Loading states

**Usage:**
```jsx
import { RoleManager } from './components/auth';

function App() {
  return (
    <AuthProvider>
      <RoleManager />
    </AuthProvider>
  );
}
```

## User Profile Management

### Profile Component

The Profile component allows users to manage their profile information.

**Features:**
- Avatar upload and preview
- First and last name editing
- Email display (non-editable)
- Phone number input
- Bio text area
- Form validation
- Success and error messages

**Usage:**
```jsx
import { Profile } from './components/auth';

function App() {
  return (
    <AuthProvider>
      <Profile />
    </AuthProvider>
  );
}
```

## Account Settings

### Account Settings Component

The AccountSettings component provides a tabbed interface for account management.

**Features:**
- Password change form
- Session management integration
- Account deletion with confirmation
- Tabbed navigation
- Form validation
- Success and error messages

**Usage:**
```jsx
import { AccountSettings } from './components/auth';

function App() {
  return (
    <AuthProvider>
      <AccountSettings />
    </AuthProvider>
  );
}
```

## Security Audit Logs

### Security Log Component

The SecurityLog component displays security-related events and activities.

**Features:**
- Filter by event type
- Sort by timestamp
- Event categorization with icons and colors
- Detailed event information
- Responsive design

**Usage:**
```jsx
import { SecurityLog } from './components/auth';

function App() {
  return (
    <AuthProvider>
      <SecurityLog />
    </AuthProvider>
  );
}
```

## Authentication Context

The AuthContext provides a complete authentication state management solution.

**Features:**
- User state management
- Token storage and retrieval
- Session handling
- Mock authentication service (replace with real API)
- Automatic localStorage synchronization
- Loading states
- Error handling

**Usage:**
```jsx
import { AuthProvider, useAuth } from './components/auth';

// Wrap your app with AuthProvider
function App() {
  return (
    <AuthProvider>
      <MyComponent />
    </AuthProvider>
  );
}

// Use the useAuth hook in components
function MyComponent() {
  const { user, login, logout } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Styling

All components use CSS modules for styling with a consistent design language:

- Responsive design for all screen sizes
- Accessible color contrast
- Clear visual hierarchy
- Consistent spacing and typography
- Loading states and animations
- Error and success messaging

## Security Practices

The authentication components implement several security best practices:

1. **Input Validation**: All forms include client-side validation
2. **Secure Storage**: Tokens are stored in localStorage with secure practices
3. **Password Requirements**: Minimum 8-character passwords
4. **Error Handling**: Generic error messages to prevent information leakage
5. **Session Management**: Automatic session refresh and expiration
6. **MFA Support**: Two-factor authentication options
7. **OAuth Integration**: Secure third-party authentication
8. **Audit Logging**: Security event tracking
9. **Rate Limiting**: Built-in delays to prevent abuse
10. **HTTPS Ready**: Components designed for secure transport

## Integration with Backend

To integrate with a real backend:

1. Replace the mockAuthService in AuthContext.jsx with real API calls
2. Update endpoints to match your backend API
3. Implement proper error handling for HTTP status codes
4. Add token refresh logic for expired JWTs
5. Implement proper logout across all sessions

## Customization

The components can be customized by:

1. Modifying the CSS files
2. Updating the mock data in AuthContext.jsx
3. Adding new authentication providers
4. Extending the role and permission system
5. Adding new security event types
6. Customizing form fields and validation rules

## Testing

All components are designed to be testable:

1. Export individual components for unit testing
2. Mock the AuthContext for component testing
3. Test form validation logic
4. Test error and success states
5. Test responsive behavior
6. Test accessibility features

## Performance

The components are optimized for performance:

1. Efficient state management with React Context
2. Lazy loading for large components
3. Optimized rendering with React.memo where appropriate
4. Efficient event handling
5. Minimal re-renders
6. Responsive image loading for avatars