# Azure Deployment Guide

This guide provides comprehensive instructions for deploying the Veritas AI platform on Microsoft Azure using various deployment options including Virtual Machines, Azure Container Instances, Azure Kubernetes Service, and Azure Functions.

## Prerequisites

- Azure subscription with appropriate permissions
- Azure CLI configured
- Docker installed locally
- kubectl CLI (for AKS deployments)

## Deployment Options

### 1. Virtual Machine Deployment

Deploy the platform on Azure Virtual Machines with availability sets for high availability.

#### Create Virtual Machines

```bash
# Create resource group
az group create --name veritas-ai-rg --location eastus

# Create virtual network
az network vnet create \
  --resource-group veritas-ai-rg \
  --name veritas-ai-vnet \
  --address-prefix 10.0.0.0/16 \
  --subnet-name veritas-ai-subnet \
  --subnet-prefix 10.0.1.0/24

# Create network security group
az network nsg create \
  --resource-group veritas-ai-rg \
  --name veritas-ai-nsg

# Add security rules
az network nsg rule create \
  --resource-group veritas-ai-rg \
  --nsg-name veritas-ai-nsg \
  --name http-rule \
  --priority 1000 \
  --source-address-prefixes '*' \
  --source-port-ranges '*' \
  --destination-address-prefixes '*' \
  --destination-port-ranges 80 443 3000 \
  --access Allow \
  --protocol Tcp \
  --description "Allow HTTP, HTTPS, and app port"

# Create availability set
az vm availability-set create \
  --resource-group veritas-ai-rg \
  --name veritas-ai-as \
  --platform-fault-domain-count 2 \
  --platform-update-domain-count 5

# Create virtual machines
az vm create \
  --resource-group veritas-ai-rg \
  --name veritas-ai-vm1 \
  --image UbuntuLTS \
  --size Standard_D2s_v3 \
  --availability-set veritas-ai-as \
  --vnet-name veritas-ai-vnet \
  --subnet veritas-ai-subnet \
  --nsg veritas-ai-nsg \
  --admin-username azureuser \
  --generate-ssh-keys
```

#### Deploy Application

Deploy the application using custom script extension:

```bash
# Create custom script extension
az vm extension set \
  --resource-group veritas-ai-rg \
  --vm-name veritas-ai-vm1 \
  --name customScript \
  --publisher Microsoft.Azure.Extensions \
  --version 2.0 \
  --settings '{"fileUris":["https://raw.githubusercontent.com/your-org/veritas-ai/main/scripts/deploy.sh"]}' \
  --protected-settings '{"commandToExecute":"sh deploy.sh"}'
```

### 2. Azure Container Instances (ACI) Deployment

Deploy using Azure Container Instances for serverless containers.

#### Create Container Group

```bash
# Create container group with multiple containers
az container create \
  --resource-group veritas-ai-rg \
  --name veritas-ai-container-group \
  --image veritas-ai:latest \
  --dns-name-label veritas-ai-app \
  --ports 3000 \
  --environment-variables NODE_ENV=production \
  --secure-environment-variables DB_PASSWORD=secure_password \
  --cpu 1 \
  --memory 2 \
  --restart-policy Always
```

#### Multi-Container Deployment

```yaml
# container-group.yaml
apiVersion: 2019-12-01
location: eastus
name: veritas-ai-multi-container
properties:
  containers:
  - name: veritas-ai-app
    properties:
      image: veritas-ai:latest
      ports:
      - port: 3000
      resources:
        requests:
          cpu: 1
          memoryInGB: 1.5
      environmentVariables:
      - name: NODE_ENV
        value: production
      - name: DB_HOST
        value: veritas-ai-postgres.postgres.database.azure.com
  - name: redis-cache
    properties:
      image: redis:7-alpine
      ports:
      - port: 6379
      resources:
        requests:
          cpu: 0.5
          memoryInGB: 0.5
  ipAddress:
    type: Public
    ports:
    - protocol: tcp
      port: 3000
  osType: Linux
  restartPolicy: Always
tags: null
type: Microsoft.ContainerInstance/containerGroups
```

Deploy the multi-container group:

```bash
az container create \
  --resource-group veritas-ai-rg \
  --file container-group.yaml
```

### 3. Azure Kubernetes Service (AKS) Deployment

Deploy on Azure Kubernetes Service.

#### AKS Cluster Setup

```bash
# Create AKS cluster
az aks create \
  --resource-group veritas-ai-rg \
  --name veritas-ai-aks \
  --node-count 3 \
  --enable-addons monitoring \
  --generate-ssh-keys \
  --node-vm-size Standard_D2s_v3 \
  --zones 1 2 3

# Get AKS credentials
az aks get-credentials \
  --resource-group veritas-ai-rg \
  --name veritas-ai-aks

# Deploy application
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

#### AKS with Azure CNI

```bash
# Create AKS cluster with Azure CNI networking
az aks create \
  --resource-group veritas-ai-rg \
  --name veritas-ai-aks-cni \
  --node-count 3 \
  --network-plugin azure \
  --service-cidr 10.0.0.0/16 \
  --dns-service-ip 10.0.0.10 \
  --docker-bridge-address 172.17.0.1/16 \
  --vnet-subnet-id /subscriptions/{subscription-id}/resourceGroups/veritas-ai-rg/providers/Microsoft.Network/virtualNetworks/veritas-ai-vnet/subnets/veritas-ai-subnet
```

### 4. Azure Functions Deployment

Deploy using Azure Functions for a serverless approach.

#### Function App

```javascript
// index.js
const veritasAI = require('veritas-ai');

module.exports = async function (context, req) {
    context.log('Veritas AI function processed a request.');

    try {
        const result = await veritasAI.processRequest(req.body);

        context.res = {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: result
        };
    } catch (error) {
        context.log.error('Error processing request:', error);

        context.res = {
            status: 500,
            body: { error: 'Internal server error' }
        };
    }
};
```

#### Deploy Function App

```bash
# Create function app
az functionapp create \
  --resource-group veritas-ai-rg \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name veritas-ai-function \
  --storage-account veritasai storage

# Deploy function code
func azure functionapp publish veritas-ai-function
```

## Database Services

### Azure Database for PostgreSQL

Create a PostgreSQL database instance:

```bash
# Create PostgreSQL server
az postgres server create \
  --resource-group veritas-ai-rg \
  --name veritas-ai-postgres \
  --location eastus \
  --admin-user veritas_user \
  --admin-password secure_password \
  --sku-name B_Gen5_2 \
  --version 11 \
  --storage-size 20480

# Configure firewall rule
az postgres server firewall-rule create \
  --resource-group veritas-ai-rg \
  --server veritas-ai-postgres \
  --name AllowAllAzureIps \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Create database
az postgres db create \
  --resource-group veritas-ai-rg \
  --server-name veritas-ai-postgres \
  --name veritas_ai
```

### Azure Cache for Redis

Create a Redis cache:

```bash
# Create Redis cache
az redis create \
  --resource-group veritas-ai-rg \
  --name veritas-ai-redis \
  --location eastus \
  --sku Basic \
  --vm-size C0 \
  --enable-non-ssl-port

# Get Redis connection string
az redis list-keys \
  --resource-group veritas-ai-rg \
  --name veritas-ai-redis
```

## Security Configuration

### Managed Identities

Create managed identities for secure access:

```bash
# Create user-assigned managed identity
az identity create \
  --resource-group veritas-ai-rg \
  --name veritas-ai-identity

# Assign role to managed identity
az role assignment create \
  --role "Contributor" \
  --assignee-object-id $(az identity show --resource-group veritas-ai-rg --name veritas-ai-identity --query principalId -o tsv) \
  --scope /subscriptions/{subscription-id}/resourceGroups/veritas-ai-rg
```

### Network Security Groups

```bash
# Create network security group
az network nsg create \
  --resource-group veritas-ai-rg \
  --name veritas-ai-app-nsg

# Add security rules
az network nsg rule create \
  --resource-group veritas-ai-rg \
  --nsg-name veritas-ai-app-nsg \
  --name allow-app \
  --priority 1000 \
  --source-address-prefixes '*' \
  --source-port-ranges '*' \
  --destination-address-prefixes '*' \
  --destination-port-ranges 3000 \
  --access Allow \
  --protocol Tcp \
  --description "Allow app port"
```

## Monitoring and Observability

### Azure Monitor

Set up Azure Monitor for container insights:

```bash
# Enable monitoring addon
az aks enable-addons \
  --resource-group veritas-ai-rg \
  --name veritas-ai-aks \
  --addons monitoring

# Create diagnostic settings
az monitor diagnostic-settings create \
  --name veritas-ai-diagnostics \
  --resource /subscriptions/{subscription-id}/resourceGroups/veritas-ai-rg/providers/Microsoft.ContainerService/managedClusters/veritas-ai-aks \
  --logs '[{"category": "kube-apiserver", "enabled": true}]' \
  --metrics '[{"category": "AllMetrics", "enabled": true}]' \
  --workspace /subscriptions/{subscription-id}/resourceGroups/veritas-ai-rg/providers/Microsoft.OperationalInsights/workspaces/veritas-ai-log-analytics
```

### Application Insights

Enable Application Insights:

```bash
# Create Application Insights resource
az resource create \
  --resource-group veritas-ai-rg \
  --resource-type "Microsoft.Insights/components" \
  --name veritas-ai-app-insights \
  --location eastus \
  --properties '{"Application_Type":"web"}'

# Get instrumentation key
az resource show \
  --resource-group veritas-ai-rg \
  --name veritas-ai-app-insights \
  --resource-type "Microsoft.Insights/components" \
  --query properties.InstrumentationKey
```

## Backup and Disaster Recovery

### Automated Backups

Set up automated backups with Azure Backup:

```bash
# Create recovery services vault
az backup vault create \
  --resource-group veritas-ai-rg \
  --name veritas-ai-backup-vault \
  --location eastus

# Enable backup for virtual machines
az backup protection enable-for-vm \
  --resource-group veritas-ai-rg \
  --vault-name veritas-ai-backup-vault \
  --vm veritas-ai-vm1 \
  --policy-name DefaultPolicy
```

### Geo-Redundant Storage

Enable geo-redundant storage for critical data:

```bash
# Create storage account with geo-redundancy
az storage account create \
  --resource-group veritas-ai-rg \
  --name veritasaiassets \
  --location eastus \
  --sku Standard_GRS \
  --encryption-services blob
```

## Cost Optimization

### Reserved Instances

Purchase reserved instances for consistent workloads:

```bash
# Purchase reserved VM instances
az reservations reservation-order calculate \
  --sku standard_d2s_v3 \
  --location eastus \
  --reserved-resource-type VirtualMachines \
  --billing-scope {subscription-id} \
  --term P1Y \
  --quantity 2
```

### Spot Instances

Use spot instances for fault-tolerant workloads:

```bash
# Create spot virtual machine
az vm create \
  --resource-group veritas-ai-rg \
  --name veritas-ai-spot-vm \
  --image UbuntuLTS \
  --size Standard_D2s_v3 \
  --priority Spot \
  --max-price -1 \
  --eviction-policy Deallocate
```

## High Availability

### Availability Zones

Deploy across multiple availability zones:

```bash
# Create AKS cluster with availability zones
az aks create \
  --resource-group veritas-ai-rg \
  --name veritas-ai-aks-zones \
  --node-count 3 \
  --zones 1 2 3 \
  --node-vm-size Standard_D2s_v3
```

### Traffic Manager

Set up Traffic Manager for global load balancing:

```bash
# Create Traffic Manager profile
az network traffic-manager profile create \
  --name veritas-ai-tm \
  --resource-group veritas-ai-rg \
  --routing-method Performance \
  --unique-dns-name veritas-ai-app

# Add endpoints
az network traffic-manager endpoint create \
  --name eastus-endpoint \
  --resource-group veritas-ai-rg \
  --profile-name veritas-ai-tm \
  --type azureEndpoints \
  --target-resource-id /subscriptions/{subscription-id}/resourceGroups/veritas-ai-rg/providers/Microsoft.Network/publicIPAddresses/veritas-ai-pip \
  --endpoint-status Enabled
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check PostgreSQL server status
   az postgres server show \
     --resource-group veritas-ai-rg \
     --name veritas-ai-postgres

   # Test database connectivity
   telnet veritas-ai-postgres.postgres.database.azure.com 5432
   ```

2. **Container Issues**
   ```bash
   # Check container logs
   az container logs \
     --resource-group veritas-ai-rg \
     --name veritas-ai-container-group

   # Check container events
   az container show \
     --resource-group veritas-ai-rg \
     --name veritas-ai-container-group \
     --query containers[0].instanceView.events
   ```

3. **AKS Deployment Issues**
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
   # Check Azure Monitor metrics
   az monitor metrics list \
     --resource /subscriptions/{subscription-id}/resourceGroups/veritas-ai-rg/providers/Microsoft.ContainerService/managedClusters/veritas-ai-aks \
     --metric-names cpuUsage \
     --interval PT1M
   ```

This Azure deployment guide provides comprehensive instructions for deploying the Veritas AI platform on various Azure services, ensuring scalability, reliability, and security.