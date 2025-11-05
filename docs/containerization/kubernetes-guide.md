# Kubernetes Deployment Guide

This guide provides comprehensive instructions for deploying the Veritas AI platform on Kubernetes clusters with high availability and scalability.

## Prerequisites

- Kubernetes cluster (v1.20 or higher)
- kubectl CLI configured
- Helm 3.x (optional but recommended)
- At least 3 worker nodes for HA deployment

## Kubernetes Manifests Overview

### Deployment Manifest

The platform includes Kubernetes deployment manifests for orchestrating the application:

```yaml
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
        image: veritas-ai:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        envFrom:
        - secretRef:
            name: deepfake-detection-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
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

### Ingress Configuration

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: veritas-ai-ingress
  namespace: veritas-ai
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - veritas-ai.example.com
    secretName: veritas-ai-tls
  rules:
  - host: veritas-ai.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: veritas-ai-service
            port:
              number: 80
```

### Horizontal Pod Autoscaler

```yaml
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

## Deployment Steps

### 1. Namespace Setup

```bash
# Create namespace
kubectl create namespace veritas-ai

# Set default namespace (optional)
kubectl config set-context --current --namespace=veritas-ai
```

### 2. Secrets Management

Create secrets for sensitive configuration:

```bash
# Create database secret
kubectl create secret generic deepfake-detection-secrets \
  --from-literal=DB_HOST=postgres.veritas-ai.svc.cluster.local \
  --from-literal=DB_PORT=5432 \
  --from-literal=DB_NAME=veritas_ai \
  --from-literal=DB_USER=veritas_user \
  --from-literal=DB_PASSWORD=secure_password \
  --from-literal=REDIS_URL=redis://redis.veritas-ai.svc.cluster.local:6379 \
  --from-literal=JWT_SECRET=your_jwt_secret_here \
  --namespace=veritas-ai
```

### 3. Deploy Database and Redis

Deploy PostgreSQL and Redis using Helm charts or manifests:

```bash
# Add Bitnami repository
helm repo add bitnami https://charts.bitnami.com/bitnami

# Deploy PostgreSQL
helm install postgres bitnami/postgresql \
  --namespace veritas-ai \
  --set auth.database=veritas_ai \
  --set auth.username=veritas_user \
  --set auth.password=secure_password \
  --set persistence.size=20Gi

# Deploy Redis
helm install redis bitnami/redis \
  --namespace veritas-ai \
  --set architecture=standalone \
  --set auth.enabled=false \
  --set master.persistence.size=10Gi
```

### 4. Deploy Application

Deploy the Veritas AI application:

```bash
# Apply deployment manifests
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# Verify deployment
kubectl get pods -n veritas-ai
kubectl get services -n veritas-ai
kubectl get ingress -n veritas-ai
```

## Helm Chart Deployment (Recommended)

### Creating a Helm Chart

Create a Helm chart for easier deployment and management:

```bash
# Create chart directory structure
mkdir -p charts/veritas-ai/{templates,charts}
touch charts/veritas-ai/Chart.yaml
touch charts/veritas-ai/values.yaml
```

### Chart.yaml

```yaml
apiVersion: v2
name: veritas-ai
description: Veritas AI - Content Authenticity and Deepfake Detection Platform
version: 1.0.0
appVersion: 1.0.0
type: application
```

### values.yaml

```yaml
# Default values for veritas-ai chart

# Global configuration
global:
  imageRegistry: ""
  imageRepository: veritas-ai
  imageTag: latest
  imagePullPolicy: IfNotPresent
  namespace: veritas-ai

# Application configuration
app:
  name: veritas-ai
  replicaCount: 3
  image:
    registry: ""
    repository: veritas-ai
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
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70
    targetMemoryUtilizationPercentage: 80

# Ingress configuration
ingress:
  enabled: true
  className: nginx
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: veritas-ai.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: veritas-ai-tls
      hosts:
        - veritas-ai.example.com

# Database configuration
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

# Redis configuration
redis:
  enabled: true
  architecture: standalone
  auth:
    enabled: false
  master:
    persistence:
      size: 10Gi
```

### Deployment with Helm

```bash
# Install the chart
helm install veritas-ai charts/veritas-ai \
  --namespace veritas-ai \
  --create-namespace \
  --set ingress.hosts[0].host=veritas-ai.yourdomain.com \
  --set ingress.tls[0].hosts[0]=veritas-ai.yourdomain.com \
  --set database.postgresql.auth.password=your_secure_password

# Upgrade the chart
helm upgrade veritas-ai charts/veritas-ai \
  --namespace veritas-ai \
  --set app.replicaCount=5

# Uninstall the chart
helm uninstall veritas-ai --namespace veritas-ai
```

## High Availability Configuration

### Multi-Zone Deployment

Deploy across multiple availability zones for maximum uptime:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: veritas-ai-deployment
spec:
  replicas: 6
  selector:
    matchLabels:
      app: veritas-ai
  template:
    metadata:
      labels:
        app: veritas-ai
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - veritas-ai
              topologyKey: topology.kubernetes.io/zone
```

### Pod Disruption Budget

Ensure availability during maintenance:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: veritas-ai-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: veritas-ai
```

## Monitoring and Observability

### Prometheus Metrics

Enable Prometheus metrics collection:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: veritas-ai-monitor
  namespace: veritas-ai
spec:
  selector:
    matchLabels:
      app: veritas-ai
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
```

### Health Checks

Configure comprehensive health checks:

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /api/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
  timeoutSeconds: 3
  failureThreshold: 3
```

## Security Configuration

### Network Policies

Restrict network traffic with NetworkPolicies:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: veritas-ai-netpol
spec:
  podSelector:
    matchLabels:
      app: veritas-ai
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
```

### Pod Security Standards

Implement pod security standards:

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1001
  fsGroup: 2000
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
    - ALL
```

## Backup and Disaster Recovery

### Database Backup CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
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
              pg_dump -h postgres.veritas-ai.svc.cluster.local -U veritas_user veritas_ai | \
              gzip > /backups/backup-$(date +%Y%m%d-%H%M%S).sql.gz
            env:
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: deepfake-detection-secrets
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

## Troubleshooting

### Common Issues

1. **Pods Not Starting**
   ```bash
   # Check pod status
   kubectl get pods -n veritas-ai

   # Check pod events
   kubectl describe pod <pod-name> -n veritas-ai

   # Check pod logs
   kubectl logs <pod-name> -n veritas-ai
   ```

2. **Service Not Accessible**
   ```bash
   # Check service status
   kubectl get services -n veritas-ai

   # Test service connectivity
   kubectl run debug --image=curlimages/curl -it --rm -- sh
   # Inside debug pod:
   curl http://veritas-ai-service.veritas-ai.svc.cluster.local

   # Check endpoints
   kubectl get endpoints veritas-ai-service -n veritas-ai
   ```

3. **Ingress Issues**
   ```bash
   # Check ingress status
   kubectl get ingress -n veritas-ai

   # Check ingress controller logs
   kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx

   # Test DNS resolution
   nslookup veritas-ai.example.com
   ```

4. **Resource Constraints**
   ```bash
   # Check resource usage
   kubectl top pods -n veritas-ai

   # Check HPA status
   kubectl get hpa -n veritas-ai

   # Describe HPA for details
   kubectl describe hpa veritas-ai-hpa -n veritas-ai
   ```

### Debugging Commands

```bash
# Port forward for direct access
kubectl port-forward service/veritas-ai-service 3000:80 -n veritas-ai

# Execute commands in pod
kubectl exec -it <pod-name> -n veritas-ai -- sh

# Check node resources
kubectl describe nodes

# Check all resources in namespace
kubectl get all -n veritas-ai
```

This Kubernetes deployment guide provides a comprehensive approach to deploying and managing the Veritas AI platform on Kubernetes, ensuring high availability, scalability, and security.