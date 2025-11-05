// Environment configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
const isTest = import.meta.env.MODE === 'test';

// Environment-based configuration
const config = {
  development: {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
    logRocketAppId: import.meta.env.VITE_LOGROCKET_APP_ID || '',
    debug: true,
    logLevel: 'debug'
  },
  production: {
    apiUrl: import.meta.env.VITE_API_URL || 'https://api.veritas-ai.example.com',
    sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
    logRocketAppId: import.meta.env.VITE_LOGROCKET_APP_ID || '',
    debug: false,
    logLevel: 'error'
  },
  test: {
    apiUrl: 'http://localhost:3000/api',
    sentryDsn: '',
    logRocketAppId: '',
    debug: false,
    logLevel: 'silent'
  }
};

// Get current environment configuration
const getEnvironmentConfig = () => {
  if (isDevelopment) return config.development;
  if (isProduction) return config.production;
  if (isTest) return config.test;
  return config.development; // fallback to development
};

// Current environment config
const env = getEnvironmentConfig();

// Export environment variables
export const API_BASE_URL = env.apiUrl;
export const SENTRY_DSN = env.sentryDsn;
export const LOGROCKET_APP_ID = env.logRocketAppId;
export const DEBUG_MODE = env.debug;
export const LOG_LEVEL = env.logLevel;

// Feature flags
export const FEATURE_FLAGS = {
  enableComplianceModule: import.meta.env.VITE_FEATURE_COMPLIANCE === 'true',
  enableAdvancedAnalytics: import.meta.env.VITE_FEATURE_ANALYTICS === 'true',
  enableBulkProcessing: import.meta.env.VITE_FEATURE_BULK === 'true',
  enableCollaboration: import.meta.env.VITE_FEATURE_COLLABORATION === 'true'
};

// Third-party service configuration
export const THIRD_PARTY_CONFIG = {
  sentry: {
    dsn: SENTRY_DSN,
    environment: isProduction ? 'production' : isDevelopment ? 'development' : 'test',
    tracesSampleRate: isProduction ? 1.0 : 0.1,
    replaysSessionSampleRate: isProduction ? 0.1 : 0.0,
    replaysOnErrorSampleRate: 1.0
  },
  logRocket: {
    appId: LOGROCKET_APP_ID,
    enabled: !!LOGROCKET_APP_ID && isProduction
  },
  analytics: {
    googleAnalyticsId: import.meta.env.VITE_GA_ID || '',
    enabled: !!import.meta.env.VITE_GA_ID
  }
};

// Security configuration
export const SECURITY_CONFIG = {
  tokenExpiry: import.meta.env.VITE_TOKEN_EXPIRY || '24h',
  refreshTokenExpiry: import.meta.env.VITE_REFRESH_TOKEN_EXPIRY || '7d',
  passwordMinLength: parseInt(import.meta.env.VITE_PASSWORD_MIN_LENGTH) || 8,
  enable2FA: import.meta.env.VITE_ENABLE_2FA === 'true'
};

// Performance configuration
export const PERFORMANCE_CONFIG = {
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  uploadChunkSize: parseInt(import.meta.env.VITE_UPLOAD_CHUNK_SIZE) || 1024 * 1024, // 1MB
  maxConcurrentUploads: parseInt(import.meta.env.VITE_MAX_CONCURRENT_UPLOADS) || 3
};

// UI configuration
export const UI_CONFIG = {
  theme: import.meta.env.VITE_DEFAULT_THEME || 'light',
  dateFormat: import.meta.env.VITE_DATE_FORMAT || 'YYYY-MM-DD',
  timeFormat: import.meta.env.VITE_TIME_FORMAT || 'HH:mm:ss',
  itemsPerPage: parseInt(import.meta.env.VITE_ITEMS_PER_PAGE) || 10
};

// Validation helpers
export const validateEnvironment = () => {
  const errors = [];

  if (!API_BASE_URL) {
    errors.push('API_BASE_URL is required');
  }

  if (isProduction && !SENTRY_DSN) {
    console.warn('SENTRY_DSN is recommended for production environment');
  }

  if (isProduction && !LOGROCKET_APP_ID) {
    console.warn('LOGROCKET_APP_ID is recommended for production environment');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Environment info
export const ENVIRONMENT_INFO = {
  isDevelopment,
  isProduction,
  isTest,
  nodeEnv: import.meta.env.MODE,
  version: import.meta.env.VITE_APP_VERSION || '1.0.0'
};

// Export all configuration
export default {
  API_BASE_URL,
  SENTRY_DSN,
  LOGROCKET_APP_ID,
  DEBUG_MODE,
  LOG_LEVEL,
  FEATURE_FLAGS,
  THIRD_PARTY_CONFIG,
  SECURITY_CONFIG,
  PERFORMANCE_CONFIG,
  UI_CONFIG,
  ENVIRONMENT_INFO
};