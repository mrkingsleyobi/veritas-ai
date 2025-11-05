# High Availability Setup Guide

This guide provides comprehensive instructions for setting up high availability for the Veritas AI platform across different deployment environments, ensuring maximum uptime and fault tolerance.

## High Availability Principles

### Key Concepts

1. **Redundancy**: Eliminate single points of failure
2. **Load Distribution**: Distribute traffic across multiple instances
3. **Automatic Failover**: Seamless transition during failures
4. **Geographic Distribution**: Deploy across multiple regions
5. **Health Monitoring**: Continuous system health checks

### Architecture Components

- **Load Balancers**: Distribute incoming traffic
- **Multiple Instances**: Redundant application servers
- **Database Clustering**: High availability databases
- **Caching Layers**: Distributed cache systems
- **Monitoring Systems**: Real-time health checks

## Database High Availability

### PostgreSQL High Availability

#### Master-Slave Replication

```sql
-- Create replication user
CREATE USER replicator REPLICATION LOGIN ENCRYPTED PASSWORD 'replication_password';

-- Configure master server (postgresql.conf)
wal_level = replica
max_wal_senders = 3
max_replication_slots = 3
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/archive/%f'

-- Configure slave server (postgresql.conf)
hot_standby = on

-- Recovery configuration (recovery.conf)
standby_mode = 'on'
primary_conninfo = 'host=master-host port=5432 user=replicator password=replication_password'
restore_command = 'cp /var/lib/postgresql/archive/%f %p'
```

#### Failover Configuration

```bash
# Install Patroni for PostgreSQL HA
pip install patroni[etcd]

# Patroni configuration (patroni.yml)
scope: veritas-ai-postgres
namespace: /db/
name: postgresql0

restapi:
  listen: 0.0.0.0:8008
  connect_address: 127.0.0.1:8008

etcd:
  host: etcd-host:2379

bootstrap:
  dcs:
    ttl: 30
    loop_wait: 10
    retry_timeout: 10
    maximum_lag_on_failover: 1048576
    postgresql:
      use_pg_rewind: true
      parameters:
        wal_level: replica
        hot_standby: "on"
        max_connections: 100
        max_wal_senders: 8
        wal_keep_segments: 8

  initdb:
  - encoding: UTF8
  - data-checksums

  pg_hba:
  - host replication replicator 127.0.0.1/32 md5
  - host all all 0.0.0.0/0 md5

  users:
    veritas_user:
      password: secure_password
      options:
        - createrole
        - createdb

postgresql:
  listen: 0.0.0.0:5432
  connect_address: 127.0.0.1:5432
  data_dir: /var/lib/postgresql/data
  bin_dir: /usr/lib/postgresql/13/bin
  pgpass: /tmp/pgpass
  authentication:
    replication:
      username: replicator
      password: replication_password
    superuser:
      username: postgres
      password: postgres_password
```

### Redis High Availability

#### Redis Sentinel Setup

```bash
# Redis master configuration (redis-master.conf)
port 6379
bind 0.0.0.0
protected-mode yes
daemonize no
supervised no
logfile ""
databases 16
save 900 1
save 300 10
save 60 10000
dbfilename dump.rdb
dir ./
replica-serve-stale-data yes
replica-read-only yes
repl-diskless-sync no
repl-diskless-sync-delay 5
repl-disable-tcp-nodelay no
replica-priority 100

# Redis replica configuration (redis-replica.conf)
port 6380
bind 0.0.0.0
replicaof redis-master 6379
masterauth replication_password
requirepass replication_password

# Redis Sentinel configuration (sentinel.conf)
port 26379
bind 0.0.0.0
sentinel monitor mymaster redis-master 6379 2
sentinel auth-pass mymaster replication_password
sentinel down-after-milliseconds mymaster 5000
sentinel parallel-syncs mymaster 1
sentinel failover-timeout mymaster 10000
```

#### Redis Cluster Setup

```bash
# Create cluster configuration files
# redis-7000.conf
port 7000
cluster-enabled yes
cluster-config-file nodes-7000.conf
cluster-node-timeout 5000
appendonly yes

# redis-7001.conf
port 7001
cluster-enabled yes
cluster-config-file nodes-7001.conf
cluster-node-timeout 5000
appendonly yes

# Start Redis instances
redis-server redis-7000.conf
redis-server redis-7001.conf

# Create cluster
redis-cli --cluster create 127.0.0.1:7000 127.0.0.1:7001 \
  --cluster-replicas 1
```

## Application High Availability

### Load Balancer Configuration

#### HAProxy Setup

```bash
# HAProxy configuration (haproxy.cfg)
global
    daemon
    maxconn 4096
    user haproxy
    group haproxy

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
    option httplog
    option forwardfor
    option http-server-close

frontend veritas-ai-frontend
    bind *:80
    bind *:443 ssl crt /etc/ssl/certs/veritas-ai.pem
    redirect scheme https if !{ ssl_fc }
    default_backend veritas-ai-backend
    option httplog

backend veritas-ai-backend
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200
    server app1 10.0.1.10:3000 check
    server app2 10.0.1.11:3000 check
    server app3 10.0.1.12:3000 check
```

#### NGINX Load Balancer

```nginx
# NGINX configuration
upstream veritas-ai-backend {
    least_conn;
    server 10.0.1.10:3000 weight=3 max_fails=3 fail_timeout=30s;
    server 10.0.1.11:3000 weight=3 max_fails=3 fail_timeout=30s;
    server 10.0.1.12:3000 weight=3 max_fails=3 fail_timeout=30s;
    server 10.0.2.10:3000 backup;
}

server {
    listen 80;
    server_name veritas-ai.example.com;

    location / {
        proxy_pass http://veritas-ai-backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### Health Checks Implementation

```javascript
// Health check endpoint implementation
class HealthChecker {
  constructor() {
    this.checks = {
      database: false,
      redis: false,
      diskSpace: false,
      memory: false
    };
  }

  async performHealthCheck() {
    const results = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {}
    };

    // Database health check
    try {
      await database.query('SELECT 1');
      results.checks.database = { status: 'healthy', responseTime: 5 };
    } catch (error) {
      results.checks.database = { status: 'unhealthy', error: error.message };
      results.status = 'degraded';
    }

    // Redis health check
    try {
      await redis.ping();
      results.checks.redis = { status: 'healthy', responseTime: 2 };
    } catch (error) {
      results.checks.redis = { status: 'unhealthy', error: error.message };
      results.status = 'degraded';
    }

    // System health checks
    results.checks.diskSpace = this.checkDiskSpace();
    results.checks.memory = this.checkMemory();

    return results;
  }

  checkDiskSpace() {
    const diskUsage = process.memoryUsage();
    const freeSpace = 100 - (diskUsage.heapUsed / diskUsage.heapTotal * 100);
    return {
      status: freeSpace > 10 ? 'healthy' : 'warning',
      freeSpace: `${freeSpace.toFixed(2)}%`
    };
  }

  checkMemory() {
    const memoryUsage = process.memoryUsage();
    const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    return {
      status: memoryPercent < 80 ? 'healthy' : 'warning',
      usage: `${memoryPercent.toFixed(2)}%`
    };
  }
}

// Express health check endpoint
app.get('/health', async (req, res) => {
  const healthChecker = new HealthChecker();
  const healthStatus = await healthChecker.performHealthCheck();

  const statusCode = healthStatus.status === 'healthy' ? 200 :
                    healthStatus.status === 'degraded' ? 200 : 503;

  res.status(statusCode).json(healthStatus);
});

// Readiness probe
app.get('/ready', async (req, res) => {
  // Check if application is ready to serve requests
  if (app.locals.ready) {
    res.status(200).json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready' });
  }
});
```

## Geographic Distribution

### Multi-Region Setup

#### DNS-Based Load Balancing

```bash
# Example DNS configuration for geographic load balancing
# Using Route 53 (AWS)
{
  "Comment": "Geolocation routing policy",
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "veritas-ai.example.com",
        "Type": "A",
        "SetIdentifier": "US",
        "GeoLocation": {
          "ContinentCode": "NA"
        },
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "US_LOAD_BALANCER_IP"
          }
        ]
      }
    },
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "veritas-ai.example.com",
        "Type": "A",
        "SetIdentifier": "EU",
        "GeoLocation": {
          "ContinentCode": "EU"
        },
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "EU_LOAD_BALANCER_IP"
          }
        ]
      }
    }
  ]
}
```

#### CDN Configuration

```javascript
// CDN configuration for multi-region content delivery
const cdnConfig = {
  origins: [
    {
      name: 'us-origin',
      domain: 'us.veritas-ai.example.com',
      region: 'us-east-1'
    },
    {
      name: 'eu-origin',
      domain: 'eu.veritas-ai.example.com',
      region: 'eu-west-1'
    },
    {
      name: 'apac-origin',
      domain: 'apac.veritas-ai.example.com',
      region: 'ap-southeast-1'
    }
  ],
  cacheBehaviors: [
    {
      pathPattern: '/api/*',
      targetOriginId: 'us-origin',
      forwardedValues: {
        queryString: true,
        cookies: { forward: 'all' }
      },
      minTTL: 0,
      defaultTTL: 0,
      maxTTL: 0
    },
    {
      pathPattern: '/static/*',
      targetOriginId: 'closest-origin',
      forwardedValues: {
        queryString: false,
        cookies: { forward: 'none' }
      },
      minTTL: 3600,
      defaultTTL: 86400,
      maxTTL: 31536000
    }
  ]
};
```

## Failover Mechanisms

### Automatic Failover Implementation

```javascript
// Circuit breaker pattern for failover
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}

// Database failover implementation
class DatabaseFailover {
  constructor(primaryConfig, secondaryConfig) {
    this.primary = new DatabaseClient(primaryConfig);
    this.secondary = new DatabaseClient(secondaryConfig);
    this.current = this.primary;
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 30000
    });
  }

  async query(sql, params) {
    try {
      return await this.circuitBreaker.execute(() => {
        return this.current.query(sql, params);
      });
    } catch (error) {
      // Failover to secondary database
      if (this.current === this.primary) {
        console.warn('Primary database failed, failing over to secondary');
        this.current = this.secondary;
        return await this.current.query(sql, params);
      } else {
        throw new Error('Both primary and secondary databases are unavailable');
      }
    }
  }

  async healthCheck() {
    const primaryHealthy = await this.primary.healthCheck();
    const secondaryHealthy = await this.secondary.healthCheck();

    return {
      primary: primaryHealthy,
      secondary: secondaryHealthy,
      active: this.current === this.primary ? 'primary' : 'secondary'
    };
  }
}
```

### Data Synchronization

```javascript
// Multi-master replication setup
class DataSynchronizer {
  constructor(databases) {
    this.databases = databases;
    this.syncQueue = [];
    this.syncInterval = 5000; // 5 seconds
  }

  async start() {
    setInterval(() => this.syncData(), this.syncInterval);
  }

  async syncData() {
    const changes = await this.getPendingChanges();

    for (const db of this.databases) {
      try {
        await this.applyChanges(db, changes);
      } catch (error) {
        console.error(`Failed to sync to ${db.name}:`, error);
        // Queue for retry
        this.syncQueue.push({ db, changes, timestamp: Date.now() });
      }
    }
  }

  async getPendingChanges() {
    // Get changes since last sync
    const lastSync = await this.getLastSyncTimestamp();
    return await this.database.query(
      'SELECT * FROM changes WHERE timestamp > $1 ORDER BY timestamp',
      [lastSync]
    );
  }

  async applyChanges(database, changes) {
    for (const change of changes) {
      await database.executeChange(change);
    }

    await this.updateLastSyncTimestamp();
  }
}
```

## Monitoring and Alerting

### Health Monitoring Dashboard

```yaml
# Prometheus monitoring configuration
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'veritas-ai'
    static_configs:
      - targets: ['app1:3000', 'app2:3000', 'app3:3000']
    metrics_path: '/metrics'

  - job_name: 'database'
    static_configs:
      - targets: ['postgres-master:9187', 'postgres-slave:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-master:9121', 'redis-slave:9121']

# Alert rules
groups:
  - name: veritas-ai-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.instance }}"
          description: "{{ $value }}% of requests are failing"

      - alert: HighLatency
        expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 2
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "95th percentile response time is {{ $value }} seconds"

      - alert: DatabaseDown
        expr: pg_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database is down"
          description: "PostgreSQL database is not responding"
```

### Automated Recovery

```javascript
// Automated recovery system
class AutoRecoverySystem {
  constructor() {
    this.recoveryActions = new Map();
    this.registerRecoveryActions();
  }

  registerRecoveryActions() {
    this.recoveryActions.set('database_connection_failure', async () => {
      console.log('Attempting database connection recovery...');
      // Restart database connection pool
      await database.restartConnectionPool();
      // Verify connectivity
      return await database.healthCheck();
    });

    this.recoveryActions.set('high_memory_usage', async () => {
      console.log('Performing memory cleanup...');
      // Force garbage collection
      if (global.gc) global.gc();
      // Clear application caches
      await cache.clear();
      return true;
    });

    this.recoveryActions.set('service_unresponsive', async (service) => {
      console.log(`Restarting unresponsive service: ${service}`);
      // Restart service container/process
      await processManager.restartService(service);
      return true;
    });
  }

  async handleAlert(alert) {
    const recoveryAction = this.recoveryActions.get(alert.type);
    if (recoveryAction) {
      try {
        const result = await recoveryAction(alert.details);
        console.log(`Recovery action completed for ${alert.type}:`, result);
        return result;
      } catch (error) {
        console.error(`Recovery action failed for ${alert.type}:`, error);
        // Escalate to human operators
        await this.escalateAlert(alert, error);
      }
    }
  }

  async escalateAlert(alert, error) {
    // Send notification to operations team
    await notificationService.send({
      type: 'critical_alert',
      message: `Automated recovery failed for ${alert.type}`,
      details: {
        alert: alert,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
}
```

## Testing High Availability

### Chaos Engineering

```javascript
// Chaos engineering tests
class ChaosMonkey {
  constructor(services) {
    this.services = services;
    this.chaosEnabled = process.env.CHAOS_ENABLED === 'true';
  }

  async introduceFailure() {
    if (!this.chaosEnabled) return;

    const failureTypes = [
      'network_partition',
      'database_latency',
      'service_crash',
      'disk_full'
    ];

    const randomFailure = failureTypes[Math.floor(Math.random() * failureTypes.length)];

    switch (randomFailure) {
      case 'network_partition':
        await this.simulateNetworkPartition();
        break;
      case 'database_latency':
        await this.simulateDatabaseLatency();
        break;
      case 'service_crash':
        await this.simulateServiceCrash();
        break;
      case 'disk_full':
        await this.simulateDiskFull();
        break;
    }
  }

  async simulateNetworkPartition() {
    console.log('Simulating network partition...');
    // Block network traffic to random service
    const service = this.getRandomService();
    await networkSimulator.blockTraffic(service);

    // Wait before restoring
    setTimeout(() => {
      networkSimulator.restoreTraffic(service);
    }, 30000);
  }

  async simulateDatabaseLatency() {
    console.log('Simulating database latency...');
    await databaseSimulator.injectLatency(5000); // 5 seconds delay
  }

  async simulateServiceCrash() {
    console.log('Simulating service crash...');
    const service = this.getRandomService();
    await processManager.killService(service);
  }

  getRandomService() {
    return this.services[Math.floor(Math.random() * this.services.length)];
  }
}
```

### Failover Testing

```javascript
// Failover testing suite
class FailoverTestSuite {
  constructor() {
    this.testResults = [];
  }

  async runAllTests() {
    console.log('Starting failover tests...');

    await this.testDatabaseFailover();
    await this.testLoadBalancerFailover();
    await this.testServiceRestart();
    await this.testNetworkFailure();

    this.generateReport();
  }

  async testDatabaseFailover() {
    console.log('Testing database failover...');

    const startTime = Date.now();

    // Simulate primary database failure
    await databaseSimulator.crashPrimary();

    // Wait for failover
    await this.waitForFailover();

    // Verify application continues to work
    const healthCheck = await healthChecker.check();

    const testResult = {
      name: 'Database Failover',
      passed: healthCheck.database.status === 'healthy',
      duration: Date.now() - startTime,
      details: healthCheck
    };

    this.testResults.push(testResult);
  }

  async waitForFailover() {
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max

    while (attempts < maxAttempts) {
      const healthCheck = await healthChecker.check();
      if (healthCheck.database.status === 'healthy') {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
  }

  generateReport() {
    const passedTests = this.testResults.filter(test => test.passed).length;
    const totalTests = this.testResults.length;

    console.log(`\n=== Failover Test Report ===`);
    console.log(`Passed: ${passedTests}/${totalTests}`);
    console.log(`Success Rate: ${(passedTests/totalTests*100).toFixed(2)}%`);

    this.testResults.forEach(test => {
      console.log(`\n${test.name}: ${test.passed ? 'PASSED' : 'FAILED'}`);
      console.log(`Duration: ${test.duration}ms`);
      if (!test.passed) {
        console.log(`Details: ${JSON.stringify(test.details)}`);
      }
    });
  }
}
```

## Best Practices

### 1. Design for Failure

```javascript
// Implement graceful degradation
class GracefulDegradation {
  async processRequest(request) {
    try {
      // Try primary processing
      return await this.primaryProcessing(request);
    } catch (primaryError) {
      try {
        // Fall back to degraded mode
        console.warn('Primary processing failed, using degraded mode');
        return await this.degradedProcessing(request);
      } catch (degradedError) {
        try {
          // Last resort: cached/stale data
          console.warn('Degraded processing failed, using cached data');
          return await this.cachedProcessing(request);
        } catch (cacheError) {
          // Complete failure - return error response
          throw new ServiceUnavailableError('Service temporarily unavailable');
        }
      }
    }
  }
}
```

### 2. Implement Circuit Breakers

```javascript
// Circuit breaker with exponential backoff
class AdvancedCircuitBreaker {
  constructor(options) {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttemptTime = 0;
    this.options = {
      failureThreshold: 5,
      successThreshold: 3,
      timeout: 60000,
      exponentialBackoff: true,
      ...options
    };
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        throw new CircuitBreakerOpenError('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.successCount++;

    if (this.state === 'HALF_OPEN' && this.successCount >= this.options.successThreshold) {
      this.reset();
    } else if (this.state === 'CLOSED') {
      this.failureCount = 0;
    }
  }

  onFailure() {
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = 'OPEN';
      const delay = this.options.exponentialBackoff ?
        Math.min(1000 * Math.pow(2, this.failureCount), this.options.timeout) :
        this.options.timeout;
      this.nextAttemptTime = Date.now() + delay;
    }
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttemptTime = 0;
  }
}
```

This High Availability Setup Guide provides comprehensive instructions for implementing fault-tolerant deployments of the Veritas AI platform, ensuring maximum uptime and reliability across different environments.