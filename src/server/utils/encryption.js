/**
 * Data Encryption Utility for Deepfake Detection Platform
 *
 * Provides encryption and decryption functionality for sensitive data.
 */

const crypto = require('crypto');

// Use environment variable for encryption key, fallback to default for development
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'fallback_encryption_key_32_bytes!';
const IV_LENGTH = 16; // For AES, this is always 16

// Ensure the key is exactly 32 bytes for AES-256
const getKey = (key) => {
  if (key.length === 32) {
    return Buffer.from(key);
  } else if (key.length > 32) {
    return Buffer.from(key.slice(0, 32));
  } else {
    // Pad the key to 32 bytes
    return Buffer.from(key.padEnd(32, '0'));
  }
};

const ENCRYPTION_KEY_BUFFER = getKey(ENCRYPTION_KEY);

/**
 * Encrypt sensitive data
 * @param {string} text - Text to encrypt
 * @returns {string} Encrypted text in format iv:encryptedData
 */
const encrypt = (text) => {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY_BUFFER, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');

    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    throw new Error('Encryption failed: ' + error.message);
  }
};

/**
 * Decrypt sensitive data
 * @param {string} text - Encrypted text in format iv:encryptedData
 * @returns {string} Decrypted text
 */
const decrypt = (text) => {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY_BUFFER, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');

    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error('Decryption failed: ' + error.message);
  }
};

/**
 * Hash sensitive data (one-way)
 * @param {string} data - Data to hash
 * @param {string} salt - Salt for hashing
 * @returns {string} Hashed data
 */
const hash = (data, salt = '') => {
  try {
    const hash = crypto.createHash('sha256');

    hash.update(data + salt);

    return hash.digest('hex');
  } catch (error) {
    throw new Error('Hashing failed: ' + error.message);
  }
};

/**
 * Generate a random salt
 * @param {number} length - Length of salt
 * @returns {string} Random salt
 */
const generateSalt = (length = 32) => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

/**
 * Generate a secure random token
 * @param {number} length - Length of token
 * @returns {string} Random token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

module.exports = {
  encrypt,
  decrypt,
  hash,
  generateSalt,
  generateToken
};
