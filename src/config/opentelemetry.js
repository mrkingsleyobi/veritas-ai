/**
 * OpenTelemetry Configuration for Distributed Tracing and Monitoring
 *
 * This module configures OpenTelemetry for comprehensive observability
 * including tracing, metrics, and resource detection.
 */

const opentelemetry = require('@opentelemetry/api');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { RedisInstrumentation } = require('@opentelemetry/instrumentation-redis');
const { PgInstrumentation } = require('@opentelemetry/instrumentation-pg');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

class OpenTelemetryConfig {
  constructor() {
    this.sdk = null;
    this.isInitialized = false;
  }

  /**
   * Initialize OpenTelemetry SDK
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Configure resource with service information
      const resource = resourceFromAttributes({
        [SemanticResourceAttributes.SERVICE_NAME]: 'veritas-ai-platform',
        [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
        [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'veritas-ai',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development'
      });

      // Configure trace exporter (Jaeger)
      const traceExporter = new JaegerExporter({
        endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
        username: process.env.JAEGER_USER,
        password: process.env.JAEGER_PASSWORD
      });

      // Configure metrics exporter (Prometheus)
      const metricReader = new PrometheusExporter({
        port: parseInt(process.env.PROMETHEUS_PORT) || 9464,
        endpoint: process.env.PROMETHEUS_ENDPOINT || '/metrics'
      });

      // Create SDK
      this.sdk = new NodeSDK({
        resource,
        traceExporter,
        metricReader,
        instrumentations: [
          new HttpInstrumentation(),
          new ExpressInstrumentation(),
          new RedisInstrumentation(),
          new PgInstrumentation()
        ]
      });

      // Start SDK
      await this.sdk.start();
      this.isInitialized = true;

      console.log('OpenTelemetry initialized successfully');
      console.log(`Prometheus metrics available at http://localhost:${process.env.PROMETHEUS_PORT || 9464}/metrics`);
    } catch (error) {
      console.error('Failed to initialize OpenTelemetry:', error);
      throw error;
    }
  }

  /**
   * Get tracer instance
   * @param {string} name - Tracer name
   * @returns {Tracer} OpenTelemetry tracer
   */
  getTracer(name) {
    return opentelemetry.trace.getTracer(name);
  }

  /**
   * Get meter instance
   * @param {string} name - Meter name
   * @returns {Meter} OpenTelemetry meter
   */
  getMeter(name) {
    return opentelemetry.metrics.getMeter(name);
  }

  /**
   * Close OpenTelemetry SDK
   */
  async close() {
    if (this.sdk) {
      await this.sdk.shutdown();
      this.isInitialized = false;
      console.log('OpenTelemetry SDK shutdown successfully');
    }
  }
}

// Export singleton instance
module.exports = new OpenTelemetryConfig();
