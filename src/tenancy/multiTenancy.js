/**
 * Multi-Tenancy Module
 *
 * This module implements multi-tenancy support including:
 * - Tenant isolation
 * - Resource management
 * - Data separation
 * - Tenant-aware routing
 */

const crypto = require('crypto');

class MultiTenancy {
  constructor() {
    this.tenants = new Map(); // In production, use database storage
    this.tenantResources = new Map(); // Resource allocation per tenant
    this.maxResourcesPerTenant = process.env.TENANT_MAX_RESOURCES || 1000;
    this.defaultResourceQuotas = {
      storage: process.env.TENANT_DEFAULT_STORAGE || '10GB',
      bandwidth: process.env.TENANT_DEFAULT_BANDWIDTH || '100GB/month',
      requests: process.env.TENANT_DEFAULT_REQUESTS || 10000,
      users: process.env.TENANT_DEFAULT_USERS || 100
    };
  }

  /**
   * Create a new tenant
   * @param {string} tenantId - Unique tenant identifier
   * @param {Object} tenantData - Tenant configuration data
   * @returns {Object} Tenant creation result
   */
  async createTenant(tenantId, tenantData) {
    try {
      // Validate tenant ID
      if (!tenantId || typeof tenantId !== 'string') {
        throw new Error('Valid tenant ID is required');
      }

      // Check if tenant already exists
      if (this.tenants.has(tenantId)) {
        throw new Error(`Tenant ${tenantId} already exists`);
      }

      // Create tenant record
      const tenant = {
        id: tenantId,
        name: tenantData.name || tenantId,
        createdAt: new Date().toISOString(),
        status: 'active',
        config: {
          ...tenantData.config,
          quotas: {
            ...this.defaultResourceQuotas,
            ...tenantData.config?.quotas
          }
        },
        metadata: tenantData.metadata || {}
      };

      // Store tenant
      this.tenants.set(tenantId, tenant);

      // Initialize resource tracking
      this.tenantResources.set(tenantId, {
        storageUsed: 0,
        bandwidthUsed: 0,
        requestsUsed: 0,
        users: 0,
        resources: []
      });

      return {
        success: true,
        tenant,
        message: 'Tenant created successfully'
      };
    } catch (error) {
      console.error('Tenant creation error:', error);
      throw error;
    }
  }

  /**
   * Get tenant information
   * @param {string} tenantId - Tenant identifier
   * @returns {Object} Tenant information
   */
  getTenant(tenantId) {
    const tenant = this.tenants.get(tenantId);

    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    return tenant;
  }

  /**
   * Update tenant configuration
   * @param {string} tenantId - Tenant identifier
   * @param {Object} updates - Configuration updates
   * @returns {Object} Update result
   */
  async updateTenant(tenantId, updates) {
    const tenant = this.getTenant(tenantId);

    // Update tenant configuration
    const updatedTenant = {
      ...tenant,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Update quotas if provided
    if (updates.config?.quotas) {
      updatedTenant.config.quotas = {
        ...tenant.config.quotas,
        ...updates.config.quotas
      };
    }

    // Store updated tenant
    this.tenants.set(tenantId, updatedTenant);

    return {
      success: true,
      tenant: updatedTenant,
      message: 'Tenant updated successfully'
    };
  }

  /**
   * Delete tenant
   * @param {string} tenantId - Tenant identifier
   * @returns {Object} Deletion result
   */
  async deleteTenant(tenantId) {
    const tenant = this.getTenant(tenantId);

    // In a real implementation, you would:
    // 1. Archive tenant data
    // 2. Notify stakeholders
    // 3. Clean up resources
    // 4. Update billing systems

    // For now, we'll just mark as deleted
    tenant.status = 'deleted';
    tenant.deletedAt = new Date().toISOString();
    this.tenants.set(tenantId, tenant);

    return {
      success: true,
      tenant,
      message: 'Tenant marked as deleted'
    };
  }

  /**
   * List all tenants
   * @param {Object} filters - Filtering options
   * @returns {Array} List of tenants
   */
  listTenants(filters = {}) {
    let tenants = Array.from(this.tenants.values());

    // Apply filters
    if (filters.status) {
      tenants = tenants.filter(tenant => tenant.status === filters.status);
    }

    if (filters.name) {
      tenants = tenants.filter(tenant =>
        tenant.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    return tenants;
  }

  /**
   * Allocate resource to tenant
   * @param {string} tenantId - Tenant identifier
   * @param {string} resourceType - Type of resource
   * @param {Object} resourceData - Resource data
   * @returns {Object} Allocation result
   */
  allocateResource(tenantId, resourceType, resourceData) {
    const tenant = this.getTenant(tenantId);
    const resources = this.tenantResources.get(tenantId);

    if (!resources) {
      throw new Error(`No resource tracking found for tenant ${tenantId}`);
    }

    // Check resource quotas
    if (!this._checkResourceQuota(tenantId, resourceType, resourceData)) {
      throw new Error(`Resource quota exceeded for ${resourceType}`);
    }

    // Create resource record
    const resourceId = crypto.randomBytes(16).toString('hex');
    const resource = {
      id: resourceId,
      type: resourceType,
      ...resourceData,
      allocatedAt: new Date().toISOString(),
      tenantId
    };

    // Track resource
    resources.resources.push(resource);
    this.tenantResources.set(tenantId, resources);

    // Update usage metrics
    this._updateResourceUsage(tenantId, resourceType, resourceData.size || 1);

    return {
      success: true,
      resource,
      message: 'Resource allocated successfully'
    };
  }

  /**
   * Check resource quota
   * @param {string} tenantId - Tenant identifier
   * @param {string} resourceType - Type of resource
   * @param {Object} resourceData - Resource data
   * @returns {boolean} Whether quota allows allocation
   */
  _checkResourceQuota(tenantId, resourceType, resourceData) {
    const tenant = this.getTenant(tenantId);
    const resources = this.tenantResources.get(tenantId);

    const quota = tenant.config.quotas[resourceType];
    const used = resources[`${resourceType}Used`] || 0;

    if (resourceType === 'storage') {
      const size = resourceData.size || 0;

      return (used + size) <= this._parseSize(quota);
    }

    if (resourceType === 'bandwidth') {
      const size = resourceData.size || 0;

      return (used + size) <= this._parseSize(quota);
    }

    if (resourceType === 'requests') {
      return (used + 1) <= quota;
    }

    if (resourceType === 'users') {
      return (used + 1) <= quota;
    }

    // Default check
    return resources.resources.length < this.maxResourcesPerTenant;
  }

  /**
   * Parse size string to bytes
   * @param {string} sizeStr - Size string (e.g., "10GB")
   * @returns {number} Size in bytes
   */
  _parseSize(sizeStr) {
    const units = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024,
      'TB': 1024 * 1024 * 1024 * 1024
    };

    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*([KMGT]?B)$/i);

    if (!match) {
      return parseInt(sizeStr);
    }

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    return value * (units[unit] || 1);
  }

  /**
   * Update resource usage metrics
   * @param {string} tenantId - Tenant identifier
   * @param {string} resourceType - Type of resource
   * @param {number} amount - Amount to add
   */
  _updateResourceUsage(tenantId, resourceType, amount) {
    const resources = this.tenantResources.get(tenantId);

    if (!resources) {
      return;
    }

    const usageKey = `${resourceType}Used`;

    resources[usageKey] = (resources[usageKey] || 0) + amount;
    this.tenantResources.set(tenantId, resources);
  }

  /**
   * Get tenant resource usage
   * @param {string} tenantId - Tenant identifier
   * @returns {Object} Resource usage metrics
   */
  getResourceUsage(tenantId) {
    const tenant = this.getTenant(tenantId);
    const resources = this.tenantResources.get(tenantId);

    if (!resources) {
      throw new Error(`No resource tracking found for tenant ${tenantId}`);
    }

    return {
      tenantId,
      quotas: tenant.config.quotas,
      usage: {
        storage: {
          used: resources.storageUsed,
          quota: this._parseSize(tenant.config.quotas.storage),
          percentage: (resources.storageUsed / this._parseSize(tenant.config.quotas.storage)) * 100
        },
        bandwidth: {
          used: resources.bandwidthUsed,
          quota: this._parseSize(tenant.config.quotas.bandwidth),
          percentage: (resources.bandwidthUsed / this._parseSize(tenant.config.quotas.bandwidth)) * 100
        },
        requests: {
          used: resources.requestsUsed,
          quota: tenant.config.quotas.requests,
          percentage: (resources.requestsUsed / tenant.config.quotas.requests) * 100
        },
        users: {
          used: resources.users,
          quota: tenant.config.quotas.users,
          percentage: (resources.users / tenant.config.quotas.users) * 100
        }
      },
      totalResources: resources.resources.length
    };
  }

  /**
   * Validate tenant access
   * @param {string} tenantId - Tenant identifier
   * @param {string} userId - User identifier
   * @returns {boolean} Whether user has access to tenant
   */
  validateTenantAccess(tenantId, userId) {
    // In a real implementation, this would check:
    // 1. User membership in tenant
    // 2. User roles and permissions
    // 3. Tenant access policies

    // For now, we'll assume access is valid
    console.log(`Validating access for user ${userId} to tenant ${tenantId}`);

    return true;
  }

  /**
   * Isolate tenant data
   * @param {string} tenantId - Tenant identifier
   * @param {Object} data - Data to isolate
   * @returns {Object} Isolated data with tenant context
   */
  isolateTenantData(tenantId, data) {
    // Add tenant context to data
    return {
      ...data,
      tenantId,
      tenantIsolated: true,
      isolatedAt: new Date().toISOString()
    };
  }

  /**
   * Route request to tenant
   * @param {string} tenantId - Tenant identifier
   * @param {Object} request - Request object
   * @returns {Object} Tenant-specific routing information
   */
  routeToTenant(tenantId, request) {
    const tenant = this.getTenant(tenantId);

    // In a real implementation, this would:
    // 1. Determine tenant-specific endpoints
    // 2. Apply tenant-specific configurations
    // 3. Route to tenant-specific resources

    return {
      tenantId,
      tenant,
      routedAt: new Date().toISOString(),
      routingInfo: {
        // Tenant-specific routing details would go here
      }
    };
  }
}

// Export singleton instance
module.exports = new MultiTenancy();
