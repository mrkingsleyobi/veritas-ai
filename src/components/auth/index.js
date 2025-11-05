// Authentication Components Export

// Main Authentication Components
export { default as Login } from './Login';
export { default as Register } from './Register';
export { default as ForgotPassword } from './ForgotPassword';
export { default as ResetPassword } from './ResetPassword';
export { default as Profile } from './Profile';
export { default as AccountSettings } from './AccountSettings';
export { default as SecurityLog } from './SecurityLog';

// OAuth Components
export { default as GoogleLogin } from './oauth/GoogleLogin';
export { default as GitHubLogin } from './oauth/GitHubLogin';

// MFA Components
export { default as MFASetup } from './mfa/MFASetup';

// RBAC Components
export { default as RoleManager } from './rbac/RoleManager';

// Session Components
export { default as SessionManager } from './session/SessionManager';

// Auth Context and Provider
export { AuthProvider, useAuth } from './AuthContext';

// Default export of the AuthProvider
export { default as AuthContext } from './AuthContext';