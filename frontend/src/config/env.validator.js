// Environment variable validation
const requiredEnvVars = [
  'VITE_API_URL'
];

const optionalEnvVars = [
  'VITE_SENTRY_DSN',
  'VITE_LOGROCKET_APP_ID',
  'VITE_GA_ID',
  'VITE_FEATURE_COMPLIANCE',
  'VITE_FEATURE_ANALYTICS',
  'VITE_FEATURE_BULK',
  'VITE_FEATURE_COLLABORATION'
];

const numericEnvVars = [
  'VITE_API_TIMEOUT',
  'VITE_PASSWORD_MIN_LENGTH',
  'VITE_UPLOAD_CHUNK_SIZE',
  'VITE_MAX_CONCURRENT_UPLOADS',
  'VITE_MAX_FILE_SIZE',
  'VITE_ITEMS_PER_PAGE'
];

const booleanEnvVars = [
  'VITE_ENABLE_2FA',
  'VITE_FEATURE_DETECTION',
  'VITE_FEATURE_COMPLIANCE',
  'VITE_FEATURE_REPORTING',
  'VITE_FEATURE_ANALYTICS',
  'VITE_FEATURE_BULK',
  'VITE_FEATURE_COLLABORATION',
  'VITE_MOCK_API',
  'VITE_DEBUG_LOGGING',
  'VITE_CONTENT_SECURITY_POLICY',
  'VITE_STRICT_TRANSPORT_SECURITY'
];

export const validateEnvironmentVariables = () => {
  const errors = [];
  const warnings = [];

  // Check required environment variables
  requiredEnvVars.forEach(varName => {
    if (!import.meta.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });

  // Validate numeric environment variables
  numericEnvVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (value && isNaN(Number(value))) {
      errors.push(`Invalid numeric value for ${varName}: ${value}`);
    }
  });

  // Validate boolean environment variables
  booleanEnvVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (value && value !== 'true' && value !== 'false') {
      errors.push(`Invalid boolean value for ${varName}: ${value} (should be 'true' or 'false')`);
    }
  });

  // Check for production-specific requirements
  if (import.meta.env.PROD) {
    if (!import.meta.env.VITE_SENTRY_DSN) {
      warnings.push('VITE_SENTRY_DSN is recommended for production environment');
    }

    if (!import.meta.env.VITE_LOGROCKET_APP_ID) {
      warnings.push('VITE_LOGROCKET_APP_ID is recommended for production environment');
    }

    // Check for secure API URL in production
    const apiURL = import.meta.env.VITE_API_URL;
    if (apiURL && !apiURL.startsWith('https://')) {
      warnings.push('VITE_API_URL should use HTTPS in production');
    }
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('Environment configuration warnings:', warnings);
  }

  // Throw error if there are validation errors
  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }

  console.log('Environment variables validated successfully');
  return { valid: true, warnings };
};

export const getEnvironmentInfo = () => {
  return {
    mode: import.meta.env.MODE,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    isTest: import.meta.env.MODE === 'test',
    apiUrl: import.meta.env.VITE_API_URL,
    hasSentry: !!import.meta.env.VITE_SENTRY_DSN,
    hasLogRocket: !!import.meta.env.VITE_LOGROCKET_APP_ID,
    featureFlags: {
      detection: import.meta.env.VITE_FEATURE_DETECTION === 'true',
      compliance: import.meta.env.VITE_FEATURE_COMPLIANCE === 'true',
      reporting: import.meta.env.VITE_FEATURE_REPORTING === 'true',
      analytics: import.meta.env.VITE_FEATURE_ANALYTICS === 'true',
      bulk: import.meta.env.VITE_FEATURE_BULK === 'true',
      collaboration: import.meta.env.VITE_FEATURE_COLLABORATION === 'true'
    }
  };
};

// Run validation on import
try {
  validateEnvironmentVariables();
} catch (error) {
  console.error('Environment validation error:', error.message);
  // In development, we might want to show this error in the UI
  if (import.meta.env.DEV) {
    alert(`Environment configuration error:\n${error.message}`);
  }
}

export default validateEnvironmentVariables;