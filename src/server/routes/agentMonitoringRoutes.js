/**
 * Agent Monitoring API Routes
 *
 * RESTful API endpoints for agent monitoring and observability
 */

const express = require('express');
const router = express.Router();
const { param, query, body, validationResult } = require('express-validator');

/**
 * Middleware to validate request
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * Initialize Agent Monitoring routes
 * @param {Object} agentMonitoringService - Agent Monitoring service instance
 * @returns {Router} Express router
 */
function initializeAgentMonitoringRoutes(agentMonitoringService) {
  /**
   * GET /api/agent-monitoring/dashboard
   * Get agent dashboard data
   */
  router.get('/dashboard', async (req, res) => {
    try {
      const dashboardData = await agentMonitoringService.getDashboardData();
      res.json({
        success: true,
        dashboard: dashboardData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/agent-monitoring/report
   * Generate monitoring report
   */
  router.get('/report', async (req, res) => {
    try {
      const report = await agentMonitoringService.generateReport();
      res.json({
        success: true,
        report
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/agent-monitoring/agents/:agentId/trends
   * Get agent performance trends
   */
  router.get(
    '/agents/:agentId/trends',
    [
      param('agentId').notEmpty().withMessage('Agent ID is required'),
      query('days').optional().isInt({ min: 1, max: 90 })
    ],
    validate,
    async (req, res) => {
      try {
        const { agentId } = req.params;
        const days = parseInt(req.query.days) || 7;

        const trends = await agentMonitoringService.getPerformanceTrends(agentId, days);

        res.json({
          success: true,
          trends
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  );

  /**
   * POST /api/agent-monitoring/thresholds
   * Update alert thresholds
   */
  router.post(
    '/thresholds',
    [
      body('executionTimeMs').optional().isInt({ min: 1000 }),
      body('failureRate').optional().isFloat({ min: 0, max: 1 }),
      body('memoryCount').optional().isInt({ min: 100 })
    ],
    validate,
    async (req, res) => {
      try {
        const thresholds = req.body;
        agentMonitoringService.setAlertThresholds(thresholds);

        res.json({
          success: true,
          message: 'Alert thresholds updated',
          thresholds: agentMonitoringService.alertThresholds
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  );

  /**
   * GET /api/agent-monitoring/health
   * Check monitoring service health
   */
  router.get('/health', async (req, res) => {
    try {
      res.json({
        success: true,
        status: 'healthy',
        monitoring_active: agentMonitoringService.monitoringInterval !== null,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

module.exports = initializeAgentMonitoringRoutes;
