import * as Sentry from '@sentry/react';
import LogRocket from 'logrocket';
import { ENVIRONMENT_INFO, THIRD_PARTY_CONFIG } from '../config/environment';

// Global monitoring state
let isSentryInitialized = false;
let isLogRocketInitialized = false;

// Initialize Sentry with enhanced configuration
export const initSentry = () => {
  if (isSentryInitialized) {
    console.warn('Sentry already initialized');
    return;
  }

  const { sentry } = THIRD_PARTY_CONFIG;

  if (sentry.dsn) {
    Sentry.init({
      dsn: sentry.dsn,
      environment: sentry.environment,
      tracesSampleRate: sentry.tracesSampleRate,
      replaysSessionSampleRate: sentry.replaysSessionSampleRate,
      replaysOnErrorSampleRate: sentry.replaysOnErrorSampleRate,
      integrations: [
        Sentry.browserTracingIntegration({
          tracePropagationTargets: [
            'localhost',
            /^https:\/\/.*veritas-ai\.com\/api/,
            /^https:\/\/api\..*veritas-ai\.com/,
          ],
        }),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      beforeSend: (event, hint) => {
        // Filter out errors we don't want to track
        const error = hint.originalException;

        // Ignore chunk loading errors (common with ad blockers)
        if (error && error.message && error.message.includes('ChunkLoadError')) {
          return null;
        }

        // Ignore network errors we can't control
        if (error && error.code === 'NETWORK_ERROR') {
          return null;
        }

        return event;
      },
    });

    isSentryInitialized = true;
    console.log('Sentry initialized successfully');
  } else {
    console.warn('Sentry DSN not provided, skipping initialization');
  }
};

// Initialize LogRocket with enhanced configuration
export const initLogRocket = () => {
  if (isLogRocketInitialized) {
    console.warn('LogRocket already initialized');
    return;
  }

  const { logRocket } = THIRD_PARTY_CONFIG;

  if (logRocket.appId && logRocket.enabled) {
    LogRocket.init(logRocket.appId, {
      release: ENVIRONMENT_INFO.version,
      dom: {
        textSanitizer: true,
        inputSanitizer: true,
      },
      console: {
        isEnabled: {
          info: false,
          log: false,
          warn: true,
          error: true,
        },
      },
      network: {
        isEnabled: true,
        requestSanitizer: (request) => {
          // Scrub sensitive data from requests
          if (request.body && request.body.includes('password')) {
            request.body = JSON.stringify({ scrubbed: true });
          }
          return request;
        },
        responseSanitizer: (response) => {
          // Scrub sensitive data from responses
          if (response.body && response.body.includes('token')) {
            response.body = JSON.stringify({ scrubbed: true });
          }
          return response;
        },
      },
    });

    isLogRocketInitialized = true;
    console.log('LogRocket initialized successfully');
  } else {
    console.warn('LogRocket not enabled or appId not provided, skipping initialization');
  }
};

// Enhanced error boundary component
export const ErrorBoundary = ({ children, fallback }) => {
  const defaultFallback = (
    <div className="error-boundary">
      <h2>Something went wrong</h2>
      <p>We're sorry, but something went wrong. Please try refreshing the page.</p>
      <button onClick={() => window.location.reload()}>Refresh Page</button>
    </div>
  );

  return (
    <Sentry.ErrorBoundary
      fallback={fallback || defaultFallback}
      showDialog={true}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};

// Log custom events with enhanced tracking
export const logEvent = (eventName, properties = {}) => {
  // Google Analytics tracking
  if (window.gtag) {
    window.gtag('event', eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }

  // LogRocket tracking
  if (window.LogRocket && isLogRocketInitialized) {
    window.LogRocket.track(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }

  // Console logging in development
  if (ENVIRONMENT_INFO.isDevelopment) {
    console.log(`[Event] ${eventName}:`, properties);
  }
};

// Log errors with enhanced context
export const logError = (error, context = {}) => {
  // Add context to error
  const errorWithContext = {
    ...context,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    environment: ENVIRONMENT_INFO,
  };

  // Log to Sentry
  if (isSentryInitialized) {
    Sentry.captureException(error, {
      contexts: {
        errorContext: errorWithContext,
      },
      tags: {
        ...context.tags,
      },
    });
  }

  // Log to LogRocket
  if (window.LogRocket && isLogRocketInitialized) {
    window.LogRocket.log(`Error: ${error.message}`, errorWithContext);
  }

  // Console logging
  if (ENVIRONMENT_INFO.isDevelopment) {
    console.error('Error logged:', error, errorWithContext);
  }
};

// Log user actions with enhanced tracking
export const logUserAction = (action, details = {}) => {
  const userAction = {
    action,
    ...details,
    timestamp: new Date().toISOString(),
    url: window.location.href,
  };

  logEvent('user_action', userAction);

  // Log to LogRocket with user context
  if (window.LogRocket && isLogRocketInitialized) {
    window.LogRocket.track('user_action', userAction);
  }
};

// Identify user for better session tracking
export const identifyUser = (user) => {
  if (!user) return;

  // Sentry user identification
  if (isSentryInitialized) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  }

  // LogRocket user identification
  if (window.LogRocket && isLogRocketInitialized) {
    LogRocket.identify(user.id, {
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }

  // Store current user globally for easy access
  window.currentUser = user;
};

// Log page views
export const logPageView = (pageName, properties = {}) => {
  logEvent('page_view', {
    page_name: pageName,
    ...properties,
  });
};

// Log API calls
export const logApiCall = (endpoint, method, status, duration) => {
  logEvent('api_call', {
    endpoint,
    method,
    status,
    duration,
  });
};

// Log performance metrics
export const logPerformance = (metricName, value, properties = {}) => {
  logEvent('performance_metric', {
    metric_name: metricName,
    value,
    ...properties,
  });
};

// Session replay controls
export const startSessionReplay = () => {
  if (window.LogRocket && isLogRocketInitialized) {
    LogRocket.startNewSession();
  }
};

export const stopSessionReplay = () => {
  if (window.LogRocket && isLogRocketInitialized) {
    LogRocket.stop();
  }
};

// Export initialization function
export const initMonitoring = () => {
  initSentry();
  initLogRocket();

  // Log initial page view
  logPageView(window.location.pathname);

  console.log('Monitoring services initialized');
};

export default {
  initSentry,
  initLogRocket,
  initMonitoring,
  ErrorBoundary,
  logEvent,
  logError,
  logUserAction,
  identifyUser,
  logPageView,
  logApiCall,
  logPerformance,
  startSessionReplay,
  stopSessionReplay,
};