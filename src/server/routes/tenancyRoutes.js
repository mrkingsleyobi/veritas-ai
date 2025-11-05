/**
 * Multi-Tenancy Routes
 *
 * This module provides API endpoints for multi-tenancy features:
 * - Tenant management
 * - Resource allocation
 * - Usage tracking
 * - Tenant isolation
 */

const express = require('express');
const { body, validationResult, param } = require('express-validator');
const multiTenancy = require('../../tenancy/multiTenancy');
const { authenticateToken, requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/tenants
 * Create a new tenant
 */
router.post('/', [
  authenticateToken,
  requireRole(['admin']),
  body('tenantId').isString().notEmpty().withMessage('Tenant ID is required'),
  body('name').isString().notEmpty().withMessage('Tenant name is required'),
  body('config').optional().isObject(),
  body('metadata').optional().isObject()
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tenantId, name, config = {}, metadata = {} } = req.body;
    const result = await multiTenancy.createTenant(tenantId, { name, config, metadata });

    res.status(201).json({
      message: 'Tenant created successfully',
      tenant: result.tenant
    });
  } catch (error) {
    console.error('Tenant creation error:', error);
    res.status(500).json({
      error: 'Failed to create tenant',
      message: error.message
    });
  }
});

/**
 * GET /api/tenants/:tenantId
 * Get tenant information
 */
router.get('/:tenantId', [
  authenticateToken,
  param('tenantId').isString().notEmpty().withMessage('Tenant ID is required')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tenantId } = req.params;

    // Validate tenant access
    if (!multiTenancy.validateTenantAccess(tenantId, req.user.userId)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this tenant'
      });
    }

    const tenant = multiTenancy.getTenant(tenantId);

    res.json({
      message: 'Tenant retrieved successfully',
      tenant
    });
  } catch (error) {
    console.error('Tenant retrieval error:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: error.message
      });
    }
    res.status(500).json({
      error: 'Failed to retrieve tenant',
      message: error.message
    });
  }
});

/**
 * PUT /api/tenants/:tenantId
 * Update tenant configuration
 */
router.put('/:tenantId', [
  authenticateToken,
  requireRole(['admin']),
  param('tenantId').isString().notEmpty().withMessage('Tenant ID is required'),
  body('name').optional().isString().notEmpty(),
  body('config').optional().isObject(),
  body('metadata').optional().isObject()
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tenantId } = req.params;
    const updates = req.body;

    const result = await multiTenancy.updateTenant(tenantId, updates);

    res.json({
      message: 'Tenant updated successfully',
      tenant: result.tenant
    });
  } catch (error) {
    console.error('Tenant update error:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: error.message
      });
    }
    res.status(500).json({
      error: 'Failed to update tenant',
      message: error.message
    });
  }
});

/**
 * DELETE /api/tenants/:tenantId
 * Delete tenant
 */
router.delete('/:tenantId', [
  authenticateToken,
  requireRole(['admin']),
  param('tenantId').isString().notEmpty().withMessage('Tenant ID is required')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tenantId } = req.params;
    const result = await multiTenancy.deleteTenant(tenantId);

    res.json({
      message: 'Tenant deleted successfully',
      tenant: result.tenant
    });
  } catch (error) {
    console.error('Tenant deletion error:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: error.message
      });
    }
    res.status(500).json({
      error: 'Failed to delete tenant',
      message: error.message
    });
  }
});

/**
 * GET /api/tenants
 * List all tenants
 */
router.get('/', [
  authenticateToken,
  requireRole(['admin'])
], async(req, res) => {
  try {
    const { status, name } = req.query;
    const filters = {};

    if (status) {
      filters.status = status;
    }
    if (name) {
      filters.name = name;
    }

    const tenants = multiTenancy.listTenants(filters);

    res.json({
      message: 'Tenants retrieved successfully',
      tenants,
      count: tenants.length
    });
  } catch (error) {
    console.error('Tenant listing error:', error);
    res.status(500).json({
      error: 'Failed to list tenants',
      message: error.message
    });
  }
});

/**
 * POST /api/tenants/:tenantId/resources
 * Allocate resource to tenant
 */
router.post('/:tenantId/resources', [
  authenticateToken,
  requireRole(['admin']),
  param('tenantId').isString().notEmpty().withMessage('Tenant ID is required'),
  body('resourceType').isString().notEmpty().withMessage('Resource type is required'),
  body('resourceData').isObject().withMessage('Resource data is required')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tenantId } = req.params;
    const { resourceType, resourceData } = req.body;

    const result = multiTenancy.allocateResource(tenantId, resourceType, resourceData);

    res.json({
      message: 'Resource allocated successfully',
      resource: result.resource
    });
  } catch (error) {
    console.error('Resource allocation error:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: error.message
      });
    }
    if (error.message.includes('quota exceeded')) {
      return res.status(400).json({
        error: 'Quota exceeded',
        message: error.message
      });
    }
    res.status(500).json({
      error: 'Failed to allocate resource',
      message: error.message
    });
  }
});

/**
 * GET /api/tenants/:tenantId/usage
 * Get tenant resource usage
 */
router.get('/:tenantId/usage', [
  authenticateToken,
  param('tenantId').isString().notEmpty().withMessage('Tenant ID is required')
], async(req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tenantId } = req.params;

    // Validate tenant access
    if (!multiTenancy.validateTenantAccess(tenantId, req.user.userId)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this tenant'
      });
    }

    const usage = multiTenancy.getResourceUsage(tenantId);

    res.json({
      message: 'Resource usage retrieved successfully',
      usage
    });
  } catch (error) {
    console.error('Resource usage error:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: error.message
      });
    }
    res.status(500).json({
      error: 'Failed to retrieve resource usage',
      message: error.message
    });
  }
});

module.exports = router;
