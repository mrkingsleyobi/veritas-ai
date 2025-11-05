/**
 * OAuth2 Configuration Tests
 *
 * Tests for OAuth2 configuration and Redis integration
 */

// Mock the database configuration to avoid environment dependencies
jest.mock('../../src/config/database', () => ({
  redisConfig: {
    host: 'localhost',
    port: 6379,
    password: null,
    db: 0,
    keyPrefix: 'test:',
    retryDelayOnFailover: 1000,
    maxRetriesPerRequest: 3,
    maxRetries: 10
  }
}));

// Mock Redis to avoid actual connections
const mockRedisInstance = {
  on: jest.fn(),
  quit: jest.fn().mockResolvedValue(),
  connect: jest.fn().mockResolvedValue()
};

jest.mock('ioredis', () => {
  return jest.fn(() => mockRedisInstance);
});

// Mock connect-redis
const MockRedisStore = jest.fn(() => ({}));
jest.mock('connect-redis', () => {
  return {
    RedisStore: MockRedisStore
  };
});

const oauth2Config = require('../../src/config/oauth2');

describe('OAuth2 Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset initialization state for each test
    oauth2Config.isInitialized = false;
    oauth2Config.redisClient = null;
    oauth2Config.redisStore = null;
  });

  afterEach(async () => {
    // Close connections after each test
    if (oauth2Config.isInitialized) {
      await oauth2Config.close();
    }
  });

  test('should create OAuth2Config instance', () => {
    expect(oauth2Config).toBeDefined();
    expect(oauth2Config.redisClient).toBeNull();
    expect(oauth2Config.redisStore).toBeNull();
    expect(oauth2Config.isInitialized).toBe(false);
  });

  test('should initialize OAuth2 configuration', async () => {
    // Set up environment variables for testing
    process.env.OAUTH2_PROVIDER = 'auth0';
    process.env.AUTH0_DOMAIN = 'test.auth0.com';
    process.env.OAUTH2_CLIENT_ID = 'test-client-id';
    process.env.OAUTH2_CLIENT_SECRET = 'test-client-secret';
    process.env.OAUTH2_REDIRECT_URI = 'http://localhost:3000/callback';

    await oauth2Config.initialize();

    expect(oauth2Config.isInitialized).toBe(true);
    expect(mockRedisInstance.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(oauth2Config.redisClient).not.toBeNull();
    expect(oauth2Config.redisStore).not.toBeNull();
    expect(MockRedisStore).toHaveBeenCalled();
  });

  test('should not reinitialize if already initialized', async () => {
    oauth2Config.isInitialized = true;

    await oauth2Config.initialize();

    expect(mockRedisInstance.on).not.toHaveBeenCalled();
  });

  test('should return session configuration', () => {
    const sessionConfig = oauth2Config.getSessionConfig();
    expect(sessionConfig).toHaveProperty('secret');
    expect(sessionConfig).toHaveProperty('resave');
    expect(sessionConfig).toHaveProperty('saveUninitialized');
    expect(sessionConfig).toHaveProperty('cookie');
  });

  test('should return passport middleware', () => {
    const passportMiddleware = oauth2Config.getPassportMiddleware();
    expect(passportMiddleware).toBeDefined();
  });

  test('should return passport session middleware', () => {
    const passportSessionMiddleware = oauth2Config.getPassportSessionMiddleware();
    expect(passportSessionMiddleware).toBeDefined();
  });

  test('should close connections properly', async () => {
    // First initialize
    await oauth2Config.initialize();

    // Reset the mock to track the quit call in this test
    mockRedisInstance.quit.mockClear();

    // Then close
    await oauth2Config.close();

    expect(mockRedisInstance.quit).toHaveBeenCalled();
    expect(oauth2Config.isInitialized).toBe(false);
  });
});