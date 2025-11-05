/**
 * OAuth2 Configuration for Enterprise Integrations
 *
 * This module configures OAuth2 authentication with various providers
 * including Auth0, Okta, Azure AD, and Google.
 */

const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const redis = require('redis');
const connectRedis = require('connect-redis');
const session = require('express-session');

class OAuth2Config {
  constructor() {
    this.redisClient = null;
    this.redisStore = null;
    this.isInitialized = false;
  }

  /**
   * Initialize OAuth2 configuration
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize Redis client for session storage
      this.redisClient = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0
      });

      this.redisClient.on('error', (err) => {
        console.error('Redis error:', err);
      });

      await this.redisClient.connect();

      // Initialize Redis store for sessions
      const RedisStore = connectRedis(session);

      this.redisStore = new RedisStore({
        client: this.redisClient,
        prefix: 'sessions:',
        ttl: 86400 // 24 hours
      });

      // Configure OAuth2 strategy based on provider
      this._configureStrategy();

      this.isInitialized = true;
      console.log('OAuth2 configuration initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OAuth2 configuration:', error);
      throw error;
    }
  }

  /**
   * Configure OAuth2 strategy based on provider
   */
  _configureStrategy() {
    const provider = process.env.OAUTH2_PROVIDER || 'auth0';

    let strategyConfig;

    switch (provider) {
    case 'auth0':
      strategyConfig = {
        authorizationURL: `https://${process.env.AUTH0_DOMAIN}/authorize`,
        tokenURL: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
        clientID: process.env.OAUTH2_CLIENT_ID,
        clientSecret: process.env.OAUTH2_CLIENT_SECRET,
        callbackURL: process.env.OAUTH2_REDIRECT_URI
      };
      break;

    case 'okta':
      strategyConfig = {
        authorizationURL: `https://${process.env.OKTA_DOMAIN}/oauth2/v1/authorize`,
        tokenURL: `https://${process.env.OKTA_DOMAIN}/oauth2/v1/token`,
        clientID: process.env.OAUTH2_CLIENT_ID,
        clientSecret: process.env.OAUTH2_CLIENT_SECRET,
        callbackURL: process.env.OAUTH2_REDIRECT_URI
      };
      break;

    case 'azure-ad':
      strategyConfig = {
        authorizationURL: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/authorize`,
        tokenURL: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
        clientID: process.env.OAUTH2_CLIENT_ID,
        clientSecret: process.env.OAUTH2_CLIENT_SECRET,
        callbackURL: process.env.OAUTH2_REDIRECT_URI
      };
      break;

    case 'google':
      strategyConfig = {
        authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenURL: 'https://www.googleapis.com/oauth2/v4/token',
        clientID: process.env.OAUTH2_CLIENT_ID,
        clientSecret: process.env.OAUTH2_CLIENT_SECRET,
        callbackURL: process.env.OAUTH2_REDIRECT_URI
      };
      break;

    default:
      throw new Error(`Unsupported OAuth2 provider: ${provider}`);
    }

    // Configure passport strategy
    passport.use(new OAuth2Strategy(strategyConfig,
      async(accessToken, refreshToken, profile, done) => {
        try {
          // Here you would typically look up or create the user in your database
          // For now, we'll just return the profile
          const user = {
            id: profile.id,
            provider: profile.provider,
            accessToken,
            refreshToken,
            profile
          };

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    ));

    // Serialize user for session
    passport.serializeUser((user, done) => {
      done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async(id, done) => {
      try {
        // Here you would typically fetch the user from your database
        // For now, we'll just return a mock user
        const user = {
          id
          // Add other user properties as needed
        };

        done(null, user);
      } catch (error) {
        done(error);
      }
    });
  }

  /**
   * Get session configuration
   * @returns {Object} Session configuration
   */
  getSessionConfig() {
    return {
      store: this.redisStore,
      secret: process.env.SESSION_SECRET || 'fallback_secret_key_for_development',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
      }
    };
  }

  /**
   * Get passport middleware
   * @returns {Function} Passport middleware
   */
  getPassportMiddleware() {
    return passport.initialize();
  }

  /**
   * Get passport session middleware
   * @returns {Function} Passport session middleware
   */
  getPassportSessionMiddleware() {
    return passport.session();
  }

  /**
   * Close connections
   */
  async close() {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.isInitialized = false;
      console.log('OAuth2 connections closed');
    }
  }
}

// Export singleton instance
module.exports = new OAuth2Config();
