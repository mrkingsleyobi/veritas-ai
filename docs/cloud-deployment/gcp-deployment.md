# GCP Deployment Guide

This guide provides comprehensive instructions for deploying the Veritas AI platform on Google Cloud Platform (GCP) using various deployment options including Compute Engine, Cloud Run, Google Kubernetes Engine, and Cloud Functions.

## Prerequisites

- GCP project with appropriate permissions
- Google Cloud SDK configured
- Docker installed locally
- kubectl CLI (for GKE deployments)

## Deployment Options

### 1. Compute Engine Deployment

Deploy the platform on Google Compute Engine VMs with managed instance groups for high availability.

#### Create Compute Engine Instances

```bash
# Create network
gcloud compute networks create veritas-ai-network \
  --subnet-mode custom

# Create subnet
gcloud compute networks subnets create veritas-ai-subnet \
  --network veritas-ai-network \
  --region us-central1 \
  --range 10.0.1.0/24

# Create firewall rules
gcloud compute firewall-rules create veritas-ai-allow-http \
  --network veritas-ai-network \
  --allow tcp:80,tcp:443,tcp:3000 \
  --source-ranges 0.0.0.0/0

gcloud compute firewall-rules create veritas-ai-allow-internal \
  --network veritas-ai-network \
  --allow tcp:0-65535,udp:0-65535,icmp \
  --source-ranges 10.0.0.0/8

# Create instance template
gcloud compute instance-templates create veritas-ai-template \
  --machine-type e2-medium \
  --image-family ubuntu-2004-lts \
  --image-project ubuntu-os-cloud \
  --subnet veritas-ai-subnet \
  --tags veritas-ai \
  --metadata startup-script='#!/bin/bash
    apt-get update
    apt-get install -y docker.io
    systemctl start docker
    systemctl enable docker
    docker run -d -p 3000:3000 veritas-ai:latest'

# Create managed instance group
gcloud compute instance-groups managed create veritas-ai-mig \
  --base-instance-name veritas-ai \
  --size 3 \
  --template veritas-ai-template \
  --zones us-central1-a,us-central1-b,us-central1-c
```

#### Load Balancer Setup

```bash
# Create health check
gcloud compute health-checks create http veritas-ai-health-check \
  --port 3000 \
  --check-interval 30s

# Create backend service
gcloud compute backend-services create veritas-ai-backend \
  --protocol HTTP \
  --port-name http \
  --health-checks veritas-ai-health-check \
  --global

# Add instance group to backend service
gcloud compute backend-services add-backend veritas-ai-backend \
  --instance-group veritas-ai-mig \
  --instance-group-zone us-central1-a \
  --global

# Create URL map
gcloud compute url-maps create veritas-ai-url-map \
  --default-service veritas-ai-backend

# Create target proxy
gcloud compute target-http-proxies create veritas-ai-http-proxy \
  --url-map veritas-ai-url-map

# Create forwarding rule
gcloud compute forwarding-rules create veritas-ai-forwarding-rule \
  --global \
  --target-http-proxy veritas-ai-http-proxy \
  --ports 80
```

### 2. Cloud Run Deployment

Deploy using Google Cloud Run for fully managed serverless containers.

#### Deploy to Cloud Run

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Build and push container image
gcloud builds submit \
  --tag gcr.io/PROJECT-ID/veritas-ai \
  --timeout=1200s

# Deploy to Cloud Run
gcloud run deploy veritas-ai-service \
  --image gcr.io/PROJECT-ID/veritas-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --cpu 1 \
  --concurrency 80 \
  --max-instances 100 \
  --set-env-vars NODE_ENV=production,DB_HOST=veritas-ai-db

# Set up custom domain
gcloud run domain-mappings create \
  --service veritas-ai-service \
  --domain veritas-ai.example.com \
  --region us-central1
```

#### Cloud Run with SQL

```bash
# Deploy with Cloud SQL connection
gcloud run deploy veritas-ai-service \
  --image gcr.io/PROJECT-ID/veritas-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances PROJECT-ID:us-central1:veritas-ai-db \
  --set-env-vars NODE_ENV=production,DB_SOCKET_PATH=/cloudsql/PROJECT-ID:us-central1:veritas-ai-db
```

### 3. Google Kubernetes Engine (GKE) Deployment

Deploy on Google Kubernetes Engine.

#### GKE Cluster Setup

```bash
# Enable GKE API
gcloud services enable container.googleapis.com

# Create GKE cluster
gcloud container clusters create veritas-ai-cluster \
  --zone us-central1-a \
  --node-pool default-pool \
  --num-nodes 3 \
  --machine-type e2-medium \
  --disk-size 20GB \
  --disk-type pd-standard \
  --enable-autoscaling \
  --min-nodes 1 \
  --max-nodes 10 \
  --enable-autorepair \
  --enable-autoupgrade \
  --enable-ip-alias \
  --create-subnetwork name=veritas-ai-gke-subnet

# Get cluster credentials
gcloud container clusters get-credentials veritas-ai-cluster \
  --zone us-central1-a

# Deploy application
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

#### GKE with Anthos Config Management

```bash
# Enable Anthos API
gcloud services enable anthos.googleapis.com

# Register cluster with Anthos
gcloud container hub memberships register veritas-ai-cluster \
  --gke-cluster us-central1-a/veritas-ai-cluster \
  --enable-workload-identity

# Apply configuration
kubectl apply -f config-management/
```

### 4. Cloud Functions Deployment

Deploy using Google Cloud Functions for serverless event-driven compute.

#### Function Implementation

```javascript
// index.js
const veritasAI = require('veritas-ai');

exports.veritasAIHandler = async (req, res) => {
  try {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    const result = await veritasAI.processRequest(req.body);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

#### Deploy Cloud Function

```bash
# Enable Cloud Functions API
gcloud services enable cloudfunctions.googleapis.com

# Deploy function
gcloud functions deploy veritas-ai-function \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point veritasAIHandler \
  --memory 512MB \
  --timeout 60s \
  --set-env-vars NODE_ENV=production \
  --source .

# Get function URL
gcloud functions describe veritas-ai-function \
  --format "value(httpsTrigger.url)"
```

## Database Services

### Cloud SQL for PostgreSQL

Create a PostgreSQL database instance:

```bash
# Enable Cloud SQL API
gcloud services enable sqladmin.googleapis.com

# Create Cloud SQL instance
gcloud sql instances create veritas-ai-db \
  --database-version POSTGRES_13 \
  --tier db-n1-standard-1 \
  --region us-central1 \
  --storage-size 20 \
  --storage-type SSD \
  --backup-start-time 02:00 \
  --enable-point-in-time-recovery \
  --maintenance-window-day SUN \
  --maintenance-window-hour 2 \
  --assign-ip \
  --authorized-networks 0.0.0.0/0

# Create database
gcloud sql databases create veritas_ai \
  --instance veritas-ai-db

# Create user
gcloud sql users create veritas_user \
  --instance veritas-ai-db \
  --password secure_password

# Configure SSL
gcloud sql ssl client-certs create client-cert \
  --instance veritas-ai-db \
  --common-name veritas-ai-app
```

### Memorystore for Redis

Create a Redis instance:

```bash
# Enable Memorystore API
gcloud services enable redis.googleapis.com

# Create Redis instance
gcloud redis instances create veritas-ai-redis \
  --size 1 \
  --region us-central1 \
  --zone us-central1-a \
  --tier basic \
  --redis-version redis_6_x \
  --network veritas-ai-network

# Get connection details
gcloud redis instances describe veritas-ai-redis \
  --region us-central1
```

## Security Configuration

### Service Accounts

Create service accounts for different components:

```bash
# Create service account
gcloud iam service-accounts create veritas-ai-sa \
  --display-name "Veritas AI Service Account"

# Assign roles
gcloud projects add-iam-policy-binding PROJECT-ID \
  --member serviceAccount:veritas-ai-sa@PROJECT-ID.iam.gserviceaccount.com \
  --role roles/cloudsql.client

gcloud projects add-iam-policy-binding PROJECT-ID \
  --member serviceAccount:veritas-ai-sa@PROJECT-ID.iam.gserviceaccount.com \
  --role roles/secretmanager.secretAccessor
```

### VPC Service Controls

Set up security perimeters:

```bash
# Create access policy
gcloud access-context-manager policies create \
  --organization ORGANIZATION-ID \
  --title "Veritas AI Security Policy"

# Create access level
gcloud access-context-manager levels create veritas-ai-access-level \
  --policy POLICY-ID \
  --title "Veritas AI Access Level" \
  --basic-level-spec '{
    "conditions": [{
      "ipSubnetworks": ["10.0.0.0/8"]
    }]
  }'

# Create service perimeter
gcloud access-context-manager perimeters create veritas-ai-perimeter \
  --policy POLICY-ID \
  --title "Veritas AI Service Perimeter" \
  --resources "projects/PROJECT-NUMBER" \
  --restricted-services "storage.googleapis.com,sqladmin.googleapis.com"
```

## Monitoring and Observability

### Cloud Monitoring

Set up monitoring and alerting:

```bash
# Enable monitoring API
gcloud services enable monitoring.googleapis.com

# Create uptime check
gcloud monitoring uptime-check-configs create veritas-ai-uptime \
  --display-name "Veritas AI Uptime Check" \
  --http-check-path /health \
  --http-check-port 3000 \
  --selected-resource-type gce-instance \
  --selected-resource-labels instance_id=INSTANCE-ID,zone=us-central1-a

# Create alert policy
gcloud alpha monitoring policies create \
  --policy-from-file alert-policy.yaml
```

### Cloud Trace

Enable distributed tracing:

```bash
# Enable trace API
gcloud services enable cloudtrace.googleapis.com

# Create trace configuration
gcloud trace settings update \
  --project PROJECT-ID \
  --tracing-config '{
    "traceConfig": {
      "tracesWithinProject": true,
      "tracesToCloudTrace": true
    }
  }'
```

## Backup and Disaster Recovery

### Cloud Storage Backup

Set up automated backups to Cloud Storage:

```bash
# Create storage bucket
gsutil mb -l us-central1 gs://veritas-ai-backups

# Set lifecycle policy
gsutil lifecycle set lifecycle.json gs://veritas-ai-backups

# Create backup job
gcloud scheduler jobs create http veritas-ai-backup-job \
  --schedule "0 2 * * *" \
  --uri https://cloudfunctions.googleapis.com/v1/projects/PROJECT-ID/locations/us-central1/functions/veritas-ai-backup \
  --http-method POST \
  --oidc-service-account-email veritas-ai-sa@PROJECT-ID.iam.gserviceaccount.com
```

### Cross-Region Replication

Set up cross-region replication:

```bash
# Create multi-region bucket
gsutil mb -l multi-regional gs://veritas-ai-global-assets

# Set replication configuration
gsutil replication set on gs://veritas-ai-global-assets

# Create replicated buckets
gsutil mb -l us gs://veritas-ai-us-assets
gsutil mb -l eu gs://veritas-ai-eu-assets
```

## Cost Optimization

### Committed Use Discounts

Purchase committed use discounts for consistent workloads:

```bash
# Create committed use discount
gcloud compute commitments create veritas-ai-cud \
  --region us-central1 \
  --plan 12-month \
  --resources "VCPU=4,MEMORY=16"
```

### Preemptible Instances

Use preemptible instances for fault-tolerant workloads:

```bash
# Create instance template with preemptible instances
gcloud compute instance-templates create veritas-ai-preemptible-template \
  --machine-type e2-medium \
  --image-family ubuntu-2004-lts \
  --image-project ubuntu-os-cloud \
  --preemptible \
  --maintenance-policy TERMINATE
```

## High Availability

### Multi-Region Deployment

Deploy across multiple regions:

```bash
# Create clusters in multiple regions
gcloud container clusters create veritas-ai-cluster-us-central1 \
  --zone us-central1-a \
  --num-nodes 2

gcloud container clusters create veritas-ai-cluster-europe-west1 \
  --zone europe-west1-b \
  --num-nodes 2

# Set up multi-cluster services
gcloud container fleet multi-cluster-services enable

# Register clusters
gcloud container fleet memberships register us-central1-cluster \
  --gke-cluster us-central1-a/veritas-ai-cluster-us-central1

gcloud container fleet memberships register europe-west1-cluster \
  --gke-cluster europe-west1-b/veritas-ai-cluster-europe-west1
```

### Load Balancer with Multi-Region Backend

```bash
# Create backend services in multiple regions
gcloud compute backend-services create veritas-ai-backend-us \
  --protocol HTTP \
  --health-checks veritas-ai-health-check \
  --region us-central1

gcloud compute backend-services create veritas-ai-backend-eu \
  --protocol HTTP \
  --health-checks veritas-ai-health-check \
  --region europe-west1

# Create global load balancer with multi-region backends
gcloud compute url-maps create veritas-ai-global-url-map \
  --default-service veritas-ai-backend-us

# Add path matcher for regional routing
gcloud compute url-maps add-path-matcher veritas-ai-global-url-map \
  --default-service veritas-ai-backend-us \
  --path-matcher-name eu-path-matcher \
  --path-rules "/eu/*=veritas-ai-backend-eu"
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check Cloud SQL instance status
   gcloud sql instances describe veritas-ai-db

   # Test database connectivity
   gcloud sql connect veritas-ai-db --user=veritas_user
   ```

2. **Cloud Run Issues**
   ```bash
   # Check Cloud Run service status
   gcloud run services describe veritas-ai-service \
     --region us-central1

   # View logs
   gcloud run services logs read veritas-ai-service \
     --region us-central1
   ```

3. **GKE Deployment Issues**
   ```bash
   # Check pod status
   kubectl get pods -n veritas-ai

   # Check node status
   kubectl get nodes

   # Check cluster events
   kubectl get events --all-namespaces
   ```

4. **Performance Issues**
   ```bash
   # Check Cloud Monitoring metrics
   gcloud monitoring metrics list \
     --filter "metric.type = \"compute.googleapis.com/instance/cpu/utilization\""

   # View custom metrics
   gcloud monitoring metric-descriptors list \
     --filter "veritas-ai"
   ```

This GCP deployment guide provides comprehensive instructions for deploying the Veritas AI platform on various Google Cloud Platform services, ensuring scalability, reliability, and security.