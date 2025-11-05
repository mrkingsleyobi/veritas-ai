/**
 * Validation Middleware for Deepfake Detection Platform
 *
 * Provides input validation and sanitization for API endpoints.
 */

const { body, validationResult, check } = require('express-validator');

/**
 * Middleware to validate content verification requests
 */
const validateContent = [
  body('content')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Content is required'),
  body('content.type')
    .isIn(['image', 'video', 'document'])
    .withMessage('Content type must be image, video, or document'),
  body('content.data')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Content data is required'),
  body('options')
    .optional()
    .isObject()
    .withMessage('Options must be an object'),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

/**
 * Middleware to validate RUV profile requests
 */
const validateRUVProfile = [
  body('contentId')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Content ID is required')
    .isString()
    .withMessage('Content ID must be a string'),
  body('ruvData')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('RUV data is required')
    .isObject()
    .withMessage('RUV data must be an object'),
  body('ruvData.reputation')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Reputation must be a number between 0 and 1'),
  body('ruvData.uniqueness')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Uniqueness must be a number between 0 and 1'),
  body('ruvData.verification')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Verification must be a number between 0 and 1'),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

/**
 * Middleware to sanitize and validate user input
 */
const sanitizeInput = [
  // Sanitize strings to prevent XSS
  body('*').trim().escape(),

  // Normalize email format
  body('email').normalizeEmail(),

  // Custom sanitization for content data
  body('content.data').customSanitizer((value) => {
    // If content data is a string that looks like base64, validate it
    if (typeof value === 'string' && value.length > 0) {
      // Basic check for base64 format
      if (value.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
        return value;
      }
    }

    return value;
  })
];

module.exports = {
  validateContent,
  validateRUVProfile,
  sanitizeInput
};
