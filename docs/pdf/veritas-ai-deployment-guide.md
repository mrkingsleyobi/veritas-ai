# Veritas AI Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Veritas AI Content Authenticity and Deepfake Detection platform across various environments including cloud providers, containerized deployments, and on-premises installations.

## System Requirements

### Minimum Hardware Requirements

- **CPU**: 4 cores (Intel Xeon or equivalent)
- **Memory**: 8 GB RAM
- **Storage**: 50 GB SSD storage
- **Network**: 100 Mbps network connectivity
- **Operating System**: Ubuntu 20.04 LTS or newer, CentOS 8 or newer

### Recommended Hardware Requirements

- **CPU**: 8+ cores
- **Memory**: 16+ GB RAM
- **Storage**: 100+ GB SSD storage
- **Network**: 1 Gbps network connectivity
- **GPU**: NVIDIA GPU with CUDA support (optional, for enhanced performance)

### Software Dependencies

- **Node.js**: Version 16.x or newer
- **Database**: PostgreSQL 13 or newer
- **Cache**: Redis 6 or newer
- **Container Runtime**: Docker 20.10 or newer (for containerized deployments)
- **Orchestration**: Kubernetes 1.20 or newer (for Kubernetes deployments)

## Deployment Options

### 1. Containerized Deployment (Docker)

#### Prerequisites

- Docker 20.10 or higher
- Docker Compose 1.29 or higher

#### Single Container Deployment

```bash
# Pull the latest image
docker pull veritasai/platform:latest

# Run the container
docker run -d \
  --name veritas-ai \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_NAME=veritas_ai \
  -e DB_USER=veritas_user \
  -e DB_PASSWORD=secure_password \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  -e JWT_SECRET=your_jwt_secret_here \
  veritasai/platform:latest
```

#### Multi-Container Deployment (Docker Compose)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  veritas-ai:
    image: veritasai/platform:latest
    container_name: veritas-ai-app
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: veritas_ai
      DB_USER: veritas_user
      DB_PASSWORD: secure_password
      REDIS_URL: redis://redis:6379
      JWT_SECRET: your_jwt_secret_here
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    container_name: veritas-postgres
    environment:
      POSTGRES_DB: veritas_ai
      POSTGRES_USER: veritas_user
      POSTGRES_PASSWORD: secure_password
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U veritas_user"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: veritas-redis
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    command: redis-server --appendonly yes
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

Deploy with Docker Compose:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 2. Kubernetes Deployment

#### Prerequisites

- Kubernetes cluster (v1.20 or higher)
- kubectl CLI configured
- Helm 3.x (optional but recommended)

#### Namespace Setup

```bash
# Create namespace
kubectl create namespace veritas-ai

# Set default namespace
kubectl config set-context --current --namespace=veritas-ai
```

#### Deploy with Helm (Recommended)

Create a `values.yaml` file:

```yaml
# Veritas AI Helm values
app:
  name: veritas-ai
  replicaCount: 3
  image:
    repository: veritasai/platform
    tag: latest
    pullPolicy: IfNotPresent
  service:
    type: ClusterIP
    port: 80
  resources:
    limits:
      cpu: 500m
      memory: 1Gi
    requests:
      cpu: 250m
      memory: 512Mi

database:
  enabled: true
  type: postgresql
  postgresql:
    auth:
      database: veritas_ai
      username: veritas_user
      password: secure_password
    primary:
      persistence:
        size: 20Gi

redis:
  enabled: true
  architecture: standalone
  auth:
    enabled: false
  master:
    persistence:
      size: 10Gi

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: veritas-ai.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: veritas-ai-tls
      hosts:
        - veritas-ai.example.com
```

Deploy the application:

```bash
# Add Helm repository
helm repo add veritas-ai https://charts.veritas-ai.com

# Install the chart
helm install veritas-ai veritas-ai/veritas-ai \
  --namespace veritas-ai \
  --create-namespace \
  --values values.yaml

# Verify deployment
kubectl get pods -n veritas-ai
```

#### Manual Kubernetes Deployment

Create deployment manifests:

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: veritas-ai-deployment
  namespace: veritas-ai
  labels:
    app: veritas-ai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: veritas-ai
  template:
    metadata:
      labels:
        app: veritas-ai
    spec:
      containers:
      - name: veritas-ai
        image: veritasai/platform:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        envFrom:
        - secretRef:
            name: veritas-ai-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: veritas-ai-service
  namespace: veritas-ai
spec:
  selector:
    app: veritas-ai
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP
```

Deploy the manifests:

```bash
# Apply manifests
kubectl apply -f deployment.yaml

# Create secrets
kubectl create secret generic veritas-ai-secrets \
  --from-literal=DB_HOST=veritas-postgres \
  --from-literal=DB_PORT=5432 \
  --from-literal=DB_NAME=veritas_ai \
  --from-literal=DB_USER=veritas_user \
  --from-literal=DB_PASSWORD=secure_password \
  --from-literal=REDIS_URL=redis://veritas-redis:6379 \
  --from-literal=JWT_SECRET=your_jwt_secret_here

# Verify deployment
kubectl get pods -n veritas-ai
```

### 3. Cloud Provider Deployments

#### Amazon Web Services (AWS)

##### EC2 Deployment

```bash
# Launch EC2 instance
aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --count 1 \
  --instance-type t3.medium \
  --key-name my-key-pair \
  --security-group-ids sg-12345678 \
  --subnet-id subnet-12345678 \
  --user-data file://ec2-user-data.sh
```

Create `ec2-user-data.sh`:

```bash
#!/bin/bash
yum update -y
yum install -y docker git
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Clone repository and start services
git clone https://github.com/veritas-ai/deployment.git
cd deployment
docker-compose up -d
```

##### ECS Deployment

```json
{
  "family": "veritas-ai-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "veritas-ai",
      "image": "veritasai/platform:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:ssm:region:account:parameter/veritas-ai/db-password"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/veritas-ai",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Microsoft Azure

##### Azure Container Instances

```bash
# Create resource group
az group create --name veritas-ai-rg --location eastus

# Deploy container group
az container create \
  --resource-group veritas-ai-rg \
  --name veritas-ai-container-group \
  --image veritasai/platform:latest \
  --dns-name-label veritas-ai-app \
  --ports 3000 \
  --environment-variables NODE_ENV=production \
  --secure-environment-variables DB_PASSWORD=secure_password
```

##### Azure Kubernetes Service (AKS)

```bash
# Create AKS cluster
az aks create \
  --resource-group veritas-ai-rg \
  --name veritas-ai-aks \
  --node-count 3 \
  --enable-addons monitoring \
  --generate-ssh-keys

# Get credentials
az aks get-credentials \
  --resource-group veritas-ai-rg \
  --name veritas-ai-aks

# Deploy application
kubectl apply -f k8s-manifests/
```

#### Google Cloud Platform (GCP)

##### Cloud Run Deployment

```bash
# Deploy to Cloud Run
gcloud run deploy veritas-ai-service \
  --image veritasai/platform:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --cpu 1 \
  --set-env-vars NODE_ENV=production
```

##### Google Kubernetes Engine (GKE)

```bash
# Create GKE cluster
gcloud container clusters create veritas-ai-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --enable-autoscaling \
  --min-nodes 1 \
  --max-nodes 10

# Get credentials
gcloud container clusters get-credentials veritas-ai-cluster \
  --zone us-central1-a

# Deploy application
kubectl apply -f k8s-manifests/
```

## Configuration Management

### Environment Variables

Create a `.env` file for configuration:

```env
# Application settings
NODE_ENV=production
PORT=3000
API_RATE_LIMIT=100
MAX_CONTENT_SIZE=52428800

# Database configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=veritas_ai
DB_USER=veritas_user
DB_PASSWORD=secure_password
DB_SSL=false

# Redis configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0

# Security settings
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRES_IN=3600
SESSION_SECRET=your_secure_session_secret_here

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# External services
SENTRY_DSN=
NEW_RELIC_LICENSE_KEY=
```

### Secrets Management

#### Kubernetes Secrets

```bash
# Create secrets
kubectl create secret generic veritas-ai-secrets \
  --from-literal=JWT_SECRET=your_jwt_secret \
  --from-literal=DB_PASSWORD=your_db_password \
  --from-literal=SESSION_SECRET=your_session_secret

# Use secrets in deployment
envFrom:
- secretRef:
    name: veritas-ai-secrets
```

#### AWS Secrets Manager

```bash
# Store secrets in AWS Secrets Manager
aws secretsmanager create-secret \
  --name veritas-ai/config \
  --description "Veritas AI configuration" \
  --secret-string '{"JWT_SECRET":"your_secret","DB_PASSWORD":"your_password"}'
```

## Database Setup

### PostgreSQL Configuration

```sql
-- Create database and user
CREATE DATABASE veritas_ai;
CREATE USER veritas_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE veritas_ai TO veritas_user;

-- Create tables
\c veritas_ai;

CREATE TABLE verification_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id VARCHAR(255) UNIQUE NOT NULL,
    authentic BOOLEAN NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    details JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ruv_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id VARCHAR(255) UNIQUE NOT NULL,
    reputation DECIMAL(3,2) NOT NULL,
    uniqueness DECIMAL(3,2) NOT NULL,
    verification DECIMAL(3,2) NOT NULL,
    fusion_score DECIMAL(3,2) NOT NULL,
    history JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_verification_content_id ON verification_results(content_id);
CREATE INDEX idx_ruv_content_id ON ruv_profiles(content_id);
CREATE INDEX idx_verification_created_at ON verification_results(created_at);
```

### Redis Configuration

```bash
# Redis configuration file (redis.conf)
bind 0.0.0.0
port 6379
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
requirepass your_redis_password

# Performance settings
maxmemory 2gb
maxmemory-policy allkeys-lru
tcp-keepalive 300
timeout 0
```

## High Availability Configuration

### Load Balancer Setup

#### NGINX Configuration

```nginx
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

#### Kubernetes Service Configuration

```yaml
apiVersion: v1
kind: Service
metadata:
  name: veritas-ai-service
  namespace: veritas-ai
spec:
  selector:
    app: veritas-ai
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: veritas-ai-hpa
  namespace: veritas-ai
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: veritas-ai-deployment
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Monitoring and Logging

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'veritas-ai'
    static_configs:
      - targets: ['veritas-ai-service:80']
    metrics_path: '/metrics'

  - job_name: 'database'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### Health Checks

```javascript
// Health check endpoint implementation
app.get('/health', async (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // Database health check
  try {
    await database.query('SELECT 1');
    healthStatus.checks.database = { status: 'healthy' };
  } catch (error) {
    healthStatus.checks.database = { status: 'unhealthy', error: error.message };
    healthStatus.status = 'degraded';
  }

  // Redis health check
  try {
    await redis.ping();
    healthStatus.checks.redis = { status: 'healthy' };
  } catch (error) {
    healthStatus.checks.redis = { status: 'unhealthy', error: error.message };
    healthStatus.status = 'degraded';
  }

  const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});
```

## Backup and Disaster Recovery

### Database Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="veritas_ai"
DB_USER="veritas_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/veritas_ai_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/veritas_ai_$DATE.sql

# Cleanup old backups (keep last 30 days)
find $BACKUP_DIR -name "veritas_ai_*.sql.gz" -mtime +30 -delete

echo "Backup completed: veritas_ai_$DATE.sql.gz"
```

### Kubernetes Backup Configuration

```yaml
# backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: veritas-ai-backup
  namespace: veritas-ai
spec:
  schedule: "0 2 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: postgres-backup
            image: postgres:15-alpine
            command:
            - /bin/sh
            - -c
            - |
              pg_dump -h veritas-postgres -U veritas_user veritas_ai | \
              gzip > /backups/backup-$(date +%Y%m%d-%H%M%S).sql.gz
            env:
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: veritas-ai-secrets
                  key: DB_PASSWORD
            volumeMounts:
            - name: backups
              mountPath: /backups
          volumes:
          - name: backups
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
```

## Security Configuration

### Network Security

```bash
# UFW firewall configuration
ufw enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow from 10.0.0.0/8 to any port 5432
ufw allow from 10.0.0.0/8 to any port 6379
```

### SSL/TLS Configuration

```nginx
# NGINX SSL configuration
server {
    listen 443 ssl http2;
    server_name veritas-ai.example.com;

    ssl_certificate /etc/ssl/certs/veritas-ai.crt;
    ssl_certificate_key /etc/ssl/private/veritas-ai.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    location / {
        proxy_pass http://veritas-ai-backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

## Performance Optimization

### Database Optimization

```sql
-- PostgreSQL performance tuning
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';
```

### Application Optimization

```javascript
// Performance optimization settings
const config = {
  // Connection pooling
  database: {
    pool: {
      min: 2,
      max: 20,
      acquire: 30000,
      idle: 10000
    }
  },

  // Caching
  cache: {
    ttl: 3600000, // 1 hour
    maxItems: 1000
  },

  // Rate limiting
  rateLimit: {
    windowMs: 60000, // 1 minute
    max: 100 // limit each IP to 100 requests per windowMs
  },

  // Compression
  compression: {
    level: 6,
    threshold: 1024
  }
};
```

## Troubleshooting

### Common Issues and Solutions

#### Database Connection Issues

```bash
# Check database connectivity
telnet database-host 5432

# Check database logs
tail -f /var/log/postgresql/postgresql-13-main.log

# Verify database credentials
psql -h database-host -U veritas_user -d veritas_ai -c "SELECT 1;"
```

#### Container Issues

```bash
# Check container logs
docker logs veritas-ai-container

# Check container status
docker ps -a

# Restart container
docker restart veritas-ai-container
```

#### Performance Issues

```bash
# Monitor system resources
htop
iotop
nethogs

# Check application logs
tail -f /var/log/veritas-ai/app.log

# Database query performance
psql -h database-host -U veritas_user -d veritas_ai -c "EXPLAIN ANALYZE SELECT * FROM verification_results LIMIT 10;"
```

### Health Check Endpoints

```bash
# Application health check
curl -f https://veritas-ai.example.com/health

# Database health check
curl -f https://veritas-ai.example.com/health/database

# Redis health check
curl -f https://veritas-ai.example.com/health/redis
```

## Maintenance Procedures

### Regular Maintenance Tasks

```bash
#!/bin/bash
# maintenance.sh

# Database maintenance
echo "Running database maintenance..."
psql -h database-host -U veritas_user -d veritas_ai -c "VACUUM ANALYZE;"

# Log rotation
echo "Rotating logs..."
logrotate /etc/logrotate.d/veritas-ai

# Backup verification
echo "Verifying backups..."
ls -la /backups/ | grep veritas_ai

# Security updates
echo "Updating system..."
apt-get update && apt-get upgrade -y

echo "Maintenance completed successfully"
```

### Monitoring Scripts

```bash
#!/bin/bash
# monitor.sh

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "WARNING: Disk usage is ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
if [ $MEMORY_USAGE -gt 85 ]; then
    echo "WARNING: Memory usage is ${MEMORY_USAGE}%"
fi

# Check application processes
APP_PROCESSES=$(pgrep -f "veritas-ai" | wc -l)
if [ $APP_PROCESSES -lt 1 ]; then
    echo "ERROR: No application processes running"
fi
```

---

*This deployment guide provides comprehensive instructions for deploying the Veritas AI platform across various environments. For specific implementation details and advanced configurations, please refer to the platform documentation.*