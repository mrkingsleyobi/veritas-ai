// Centralized error handling utility
import { logError } from './monitoring';

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTHENTICATION_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  CLIENT: 'CLIENT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Custom error classes
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.CLIENT, code = null, details = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export class NetworkError extends AppError {
  constructor(message, status = null, url = null) {
    super(message, ERROR_TYPES.NETWORK, status, { url });
    this.name = 'NetworkError';
    this.status = status;
    this.url = url;
  }
}

export class AuthError extends AppError {
  constructor(message, code = null) {
    super(message, ERROR_TYPES.AUTH, code);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(message, field = null, value = null) {
    super(message, ERROR_TYPES.VALIDATION, null, { field, value });
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

export class ServerError extends AppError {
  constructor(message, status = 500, details = {}) {
    super(message, ERROR_TYPES.SERVER, status, details);
    this.name = 'ServerError';
    this.status = status;
  }
}

// Error handler utility
export const errorHandler = {
  // Handle API errors
  handleApiError: (error, context = {}) => {
    let appError;

    // Network error
    if (!error.response) {
      appError = new NetworkError(
        error.message || 'Network error occurred',
        null,
        context.url
      );
    }
    // HTTP error response
    else if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          appError = new ValidationError(
            data.message || 'Validation error',
            data.field,
            data.value
          );
          break;
        case 401:
        case 403:
          appError = new AuthError(
            data.message || 'Authentication error',
            status
          );
          break;
        case 404:
          appError = new AppError(
            data.message || 'Resource not found',
            ERROR_TYPES.CLIENT,
            status
          );
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          appError = new ServerError(
            data.message || 'Server error',
            status,
            { url: context.url }
          );
          break;
        default:
          appError = new AppError(
            data.message || `HTTP ${status} error`,
            ERROR_TYPES.SERVER,
            status,
            { url: context.url, ...data }
          );
      }
    }
    // Unknown error
    else {
      appError = new AppError(
        error.message || 'An unknown error occurred',
        ERROR_TYPES.UNKNOWN
      );
    }

    // Log error with context
    logError(appError, {
      ...context,
      originalError: error,
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    return appError;
  },

  // Handle form validation errors
  handleFormError: (error, formName) => {
    const validationError = new ValidationError(
      error.message || 'Form validation error',
      error.field,
      error.value
    );

    logError(validationError, {
      formName,
      field: error.field,
      value: error.value
    });

    return validationError;
  },

  // Handle authentication errors
  handleAuthError: (error, action) => {
    const authError = new AuthError(
      error.message || 'Authentication failed',
      error.code
    );

    logError(authError, {
      action,
      timestamp: new Date().toISOString()
    });

    return authError;
  },

  // Create user-friendly error messages
  getErrorMessage: (error) => {
    if (error instanceof ValidationError) {
      return error.message;
    }

    if (error instanceof AuthError) {
      if (error.code === 401) {
        return 'Your session has expired. Please log in again.';
      }
      if (error.code === 403) {
        return 'You do not have permission to perform this action.';
      }
      return error.message || 'Authentication failed.';
    }

    if (error instanceof NetworkError) {
      return 'Network connection error. Please check your internet connection and try again.';
    }

    if (error instanceof ServerError) {
      if (error.status >= 500) {
        return 'Server error. Please try again later.';
      }
      return error.message || 'An error occurred while processing your request.';
    }

    if (error instanceof AppError) {
      return error.message;
    }

    // Fallback for unknown errors
    return 'An unexpected error occurred. Please try again.';
  },

  // Format error for display
  formatError: (error) => {
    return {
      message: errorHandler.getErrorMessage(error),
      type: error.type || ERROR_TYPES.UNKNOWN,
      code: error.code,
      timestamp: error.timestamp || new Date().toISOString()
    };
  },

  // Check if error is retryable
  isRetryable: (error) => {
    if (error instanceof NetworkError) {
      return true;
    }

    if (error instanceof ServerError) {
      return error.status >= 500;
    }

    return false;
  },

  // Get error details for debugging
  getErrorDetails: (error) => {
    return {
      name: error.name,
      message: error.message,
      type: error.type,
      code: error.code,
      timestamp: error.timestamp,
      stack: error.stack,
      details: error.details
    };
  }
};

// Global error handler
export const setupGlobalErrorHandler = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;

    // Prevent default browser behavior for known app errors
    if (error instanceof AppError) {
      event.preventDefault();
    }

    logError(error, {
      context: 'Unhandled Promise Rejection',
      promise: event.promise
    });
  });

  // Handle uncaught exceptions
  window.addEventListener('error', (event) => {
    logError(event.error, {
      context: 'Uncaught JavaScript Error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
};

export default {
  ERROR_TYPES,
  AppError,
  NetworkError,
  AuthError,
  ValidationError,
  ServerError,
  errorHandler,
  setupGlobalErrorHandler
};