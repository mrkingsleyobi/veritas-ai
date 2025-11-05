// Application constants

export const APP_NAME = 'Deepfake Detection Platform'
export const APP_VERSION = '1.0.0'

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout'
  },
  DETECTION: {
    ANALYZE: '/detection/analyze',
    HISTORY: '/detection/history',
    RESULT: (id) => `/detection/${id}`
  },
  COMPLIANCE: {
    REPORTS: '/compliance/reports',
    REGULATIONS: '/compliance/regulations'
  }
}

// Media types
export const MEDIA_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video'
}

// File size limits
export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  VIDEO: 100 * 1024 * 1024  // 100MB
}

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif'],
  VIDEO: ['video/mp4', 'video/quicktime', 'video/x-msvideo']
}

// Detection result statuses
export const DETECTION_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
}

// Compliance report statuses
export const REPORT_STATUSES = {
  PENDING: 'pending',
  GENERATING: 'generating',
  COMPLETED: 'completed',
  FAILED: 'failed'
}

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  ORGANIZATION_ADMIN: 'org_admin',
  ANALYST: 'analyst',
  VIEWER: 'viewer'
}

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_PREFERENCES: 'userPreferences',
  THEME: 'theme'
}