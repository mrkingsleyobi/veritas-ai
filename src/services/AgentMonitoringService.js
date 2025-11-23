/**
 * Agent Monitoring Service
 *
 * Monitors agent health, performance, and provides observability
 */

class AgentMonitoringService {
  constructor(agentDBService, metricsCollector = null) {
    this.agentDBService = agentDBService;
    this.metricsCollector = metricsCollector;
    this.monitoringInterval = null;
    this.alertThresholds = {
      executionTimeMs: 30000, // 30 seconds
      failureRate: 0.3, // 30% failure rate
      memoryCount: 10000 // Maximum memories per agent
    };
  }

  /**
   * Start monitoring agents
   * @param {number} intervalMs - Monitoring interval in milliseconds
   */
  startMonitoring(intervalMs = 60000) {
    console.log('Starting agent monitoring...');

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
        await this.checkHealth();
      } catch (error) {
        console.error('Error in agent monitoring:', error.message);
      }
    }, intervalMs);
  }

  /**
   * Stop monitoring agents
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('Agent monitoring stopped');
    }
  }

  /**
   * Collect metrics from all active agents
   * @private
   */
  async collectMetrics() {
    const agents = await this.agentDBService.repository.getActiveAgents();

    for (const agent of agents) {
      try {
        const stats = await this.agentDBService.getAgentStatistics(agent.agent_id);

        // Record metrics
        if (this.metricsCollector) {
          await this.metricsCollector.recordAgentMetrics(agent.agent_id, {
            total_executions: stats.total_executions,
            successful_executions: stats.successful_executions,
            failed_executions: stats.failed_executions,
            average_execution_time: stats.average_execution_time,
            memory_count: stats.memory_count
          });
        }

        // Log to console
        console.log(`[Agent Metrics] ${agent.agent_name}:`, {
          executions: stats.total_executions,
          success_rate: this.calculateSuccessRate(stats),
          avg_time: `${stats.average_execution_time}ms`,
          memories: stats.memory_count
        });
      } catch (error) {
        console.error(`Error collecting metrics for agent ${agent.agent_id}:`, error.message);
      }
    }
  }

  /**
   * Check health of all active agents
   * @private
   */
  async checkHealth() {
    const agents = await this.agentDBService.repository.getActiveAgents();

    for (const agent of agents) {
      try {
        const stats = await this.agentDBService.getAgentStatistics(agent.agent_id);
        const health = this.assessHealth(stats);

        if (health.status !== 'healthy') {
          this.triggerAlert(agent, health);
        }
      } catch (error) {
        console.error(`Error checking health for agent ${agent.agent_id}:`, error.message);
      }
    }
  }

  /**
   * Assess agent health based on statistics
   * @private
   * @param {Object} stats - Agent statistics
   * @returns {Object} Health assessment
   */
  assessHealth(stats) {
    const issues = [];
    let status = 'healthy';

    // Check failure rate
    const failureRate = stats.total_executions > 0
      ? stats.failed_executions / stats.total_executions
      : 0;

    if (failureRate > this.alertThresholds.failureRate) {
      issues.push(`High failure rate: ${(failureRate * 100).toFixed(1)}%`);
      status = 'degraded';
    }

    // Check average execution time
    if (stats.average_execution_time > this.alertThresholds.executionTimeMs) {
      issues.push(`Slow execution time: ${stats.average_execution_time}ms`);
      status = status === 'degraded' ? 'unhealthy' : 'degraded';
    }

    // Check memory count
    if (stats.memory_count > this.alertThresholds.memoryCount) {
      issues.push(`Excessive memory usage: ${stats.memory_count} memories`);
      status = 'warning';
    }

    // Check last activity
    if (stats.last_active) {
      const inactiveDays = (Date.now() - new Date(stats.last_active)) / (1000 * 60 * 60 * 24);
      if (inactiveDays > 7) {
        issues.push(`Inactive for ${inactiveDays.toFixed(1)} days`);
        status = 'inactive';
      }
    }

    return {
      status,
      issues,
      metrics: {
        failure_rate: failureRate,
        execution_time: stats.average_execution_time,
        memory_count: stats.memory_count
      }
    };
  }

  /**
   * Trigger alert for unhealthy agent
   * @private
   * @param {Object} agent - Agent object
   * @param {Object} health - Health assessment
   */
  triggerAlert(agent, health) {
    console.warn(`[Agent Alert] ${agent.agent_name} (${agent.agent_id}):`, {
      status: health.status,
      issues: health.issues
    });

    // In production, you could send alerts via:
    // - Email
    // - Slack/Discord webhook
    // - PagerDuty
    // - Custom webhook
  }

  /**
   * Get real-time agent dashboard data
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboardData() {
    const agents = await this.agentDBService.repository.getActiveAgents();
    const agentData = [];

    for (const agent of agents) {
      const stats = await this.agentDBService.getAgentStatistics(agent.agent_id);
      const health = this.assessHealth(stats);

      agentData.push({
        agent_id: agent.agent_id,
        agent_name: agent.agent_name,
        agent_type: agent.agent_type,
        status: agent.status,
        health: health.status,
        statistics: stats,
        health_issues: health.issues
      });
    }

    return {
      total_agents: agents.length,
      active_agents: agents.filter(a => a.status === 'active').length,
      agents: agentData,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get agent performance trends
   * @param {string} agentId - Agent ID
   * @param {number} days - Number of days to analyze
   * @returns {Promise<Object>} Performance trends
   */
  async getPerformanceTrends(agentId, days = 7) {
    const executions = await this.agentDBService.getExecutionHistory(agentId, 1000);

    // Filter executions from last N days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentExecutions = executions.filter(
      e => new Date(e.started_at) > cutoffDate
    );

    // Group by day
    const dailyStats = {};
    for (const execution of recentExecutions) {
      const day = new Date(execution.started_at).toISOString().split('T')[0];

      if (!dailyStats[day]) {
        dailyStats[day] = {
          total: 0,
          successful: 0,
          failed: 0,
          total_time: 0
        };
      }

      dailyStats[day].total++;
      if (execution.status === 'completed') {
        dailyStats[day].successful++;
      }
      if (execution.status === 'failed') {
        dailyStats[day].failed++;
      }
      if (execution.execution_time_ms) {
        dailyStats[day].total_time += execution.execution_time_ms;
      }
    }

    // Calculate trends
    const trends = Object.entries(dailyStats).map(([day, stats]) => ({
      date: day,
      executions: stats.total,
      success_rate: stats.total > 0 ? stats.successful / stats.total : 0,
      average_time: stats.total > 0 ? stats.total_time / stats.total : 0
    }));

    return {
      agent_id: agentId,
      period_days: days,
      trends: trends.sort((a, b) => a.date.localeCompare(b.date)),
      summary: {
        total_executions: recentExecutions.length,
        overall_success_rate: this.calculateSuccessRate({
          total_executions: recentExecutions.length,
          successful_executions: recentExecutions.filter(e => e.status === 'completed').length
        })
      }
    };
  }

  /**
   * Calculate success rate
   * @private
   * @param {Object} stats - Statistics object
   * @returns {number} Success rate (0-1)
   */
  calculateSuccessRate(stats) {
    if (stats.total_executions === 0) {
      return 0;
    }
    return stats.successful_executions / stats.total_executions;
  }

  /**
   * Set alert thresholds
   * @param {Object} thresholds - New threshold values
   */
  setAlertThresholds(thresholds) {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
    console.log('Alert thresholds updated:', this.alertThresholds);
  }

  /**
   * Generate monitoring report
   * @returns {Promise<Object>} Monitoring report
   */
  async generateReport() {
    const dashboardData = await this.getDashboardData();

    const report = {
      generated_at: new Date().toISOString(),
      summary: {
        total_agents: dashboardData.total_agents,
        active_agents: dashboardData.active_agents,
        healthy_agents: dashboardData.agents.filter(a => a.health === 'healthy').length,
        degraded_agents: dashboardData.agents.filter(a => a.health === 'degraded').length,
        unhealthy_agents: dashboardData.agents.filter(a => a.health === 'unhealthy').length
      },
      agents: dashboardData.agents.map(a => ({
        name: a.agent_name,
        type: a.agent_type,
        health: a.health,
        total_executions: a.statistics.total_executions,
        success_rate: this.calculateSuccessRate(a.statistics),
        issues: a.health_issues
      })),
      recommendations: this.generateRecommendations(dashboardData.agents)
    };

    return report;
  }

  /**
   * Generate recommendations based on agent health
   * @private
   * @param {Array} agents - Array of agent data
   * @returns {Array} Array of recommendations
   */
  generateRecommendations(agents) {
    const recommendations = [];

    for (const agent of agents) {
      if (agent.health === 'unhealthy') {
        recommendations.push({
          agent: agent.agent_name,
          severity: 'high',
          recommendation: 'Consider restarting or investigating failures'
        });
      }

      if (agent.statistics.average_execution_time > this.alertThresholds.executionTimeMs) {
        recommendations.push({
          agent: agent.agent_name,
          severity: 'medium',
          recommendation: 'Optimize execution performance or increase resources'
        });
      }

      if (agent.statistics.memory_count > this.alertThresholds.memoryCount * 0.8) {
        recommendations.push({
          agent: agent.agent_name,
          severity: 'low',
          recommendation: 'Consider implementing memory cleanup strategy'
        });
      }
    }

    return recommendations;
  }
}

module.exports = AgentMonitoringService;
