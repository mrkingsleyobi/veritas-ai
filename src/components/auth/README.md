# Authentication Components

This directory contains all authentication-related React components for the SaaS frontend.

## Components Overview

### Main Authentication
- `Login.jsx` - Email/password login with JWT
- `Register.jsx` - User registration with form validation
- `ForgotPassword.jsx` - Password reset request form
- `ResetPassword.jsx` - Password reset with token validation

### OAuth Integration
- `oauth/GoogleLogin.jsx` - Google OAuth2 login button
- `oauth/GitHubLogin.jsx` - GitHub OAuth2 login button

### Multi-Factor Authentication
- `mfa/MFASetup.jsx` - Two-factor authentication setup wizard

### Session Management
- `session/SessionManager.jsx` - Active session listing and management

### Role-Based Access Control
- `rbac/RoleManager.jsx` - User role and permission management

### User Management
- `Profile.jsx` - User profile editing and avatar management
- `AccountSettings.jsx` - Account settings with password change and deletion
- `SecurityLog.jsx` - Security event audit log display

### Core
- `AuthContext.jsx` - Authentication state management and context
- `AuthStyles.css` - Shared styling for all authentication components
- `index.js` - Export file for easy component importing

## Usage

Wrap your application with the AuthProvider:

```jsx
import { AuthProvider } from './components/auth';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

Use the useAuth hook in components:

```jsx
import { useAuth } from './components/auth';

function MyComponent() {
  const { user, login, logout } = useAuth();

  // Component logic
}
```

## Features

- JWT-based authentication
- Form validation and error handling
- Responsive design
- Security best practices
- Session management
- MFA support
- OAuth integration
- RBAC implementation
- Audit logging
- Account management

## Security

- Password strength requirements
- Secure token storage
- Input sanitization
- Rate limiting simulation
- Security event logging
- Session expiration handling