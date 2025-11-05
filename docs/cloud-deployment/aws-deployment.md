# AWS Deployment Guide

This guide provides comprehensive instructions for deploying the Veritas AI platform on Amazon Web Services (AWS) using various deployment options including EC2, ECS, EKS, and Serverless.

## Prerequisites

- AWS account with appropriate permissions
- AWS CLI configured
- Docker installed locally
- kubectl CLI (for EKS deployments)

## Deployment Options

### 1. EC2 Deployment

Deploy the platform on EC2 instances with auto-scaling groups.

#### Launch Template

Create a launch template for consistent instance configuration:

```json
{
  "LaunchTemplateName": "veritas-ai-template",
  "LaunchTemplateData": {
    "ImageId": "ami-0abcdef1234567890",
    "InstanceType": "t3.medium",
    "KeyName": "your-key-pair",
    "SecurityGroupIds": ["sg-12345678"],
    "UserData": "#!/bin/bash\nyum update -y\nyum install -y docker\ngroupadd docker\nusermod -aG docker ec2-user\nsystemctl start docker\nsystemctl enable docker\ndocker run -d -p 3000:3000 veritas-ai:latest"
  }
}
```

#### Auto Scaling Group

Create an auto scaling group for high availability:

```bash
# Create auto scaling group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name veritas-ai-asg \
  --launch-template LaunchTemplateName=veritas-ai-template \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 3 \
  --vpc-zone-identifier "subnet-12345,subnet-67890" \
  --health-check-type ELB \
  --health-check-grace-period 300
```

#### Application Load Balancer

Create an ALB for traffic distribution:

```bash
# Create target group
aws elbv2 create-target-group \
  --name veritas-ai-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-12345678 \
  --health-check-path /health

# Create load balancer
aws elbv2 create-load-balancer \
  --name veritas-ai-alb \
  --subnets subnet-12345 subnet-67890 \
  --security-groups sg-12345678

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:region:account:loadbalancer/app/veritas-ai-alb/12345678 \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:region:account:targetgroup/veritas-ai-tg/12345678
```

### 2. ECS Deployment

Deploy using Amazon Elastic Container Service with Fargate for serverless containers.

#### Task Definition

Create a task definition for the application:

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
      "image": "veritas-ai:latest",
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

#### ECS Service

Create an ECS service with auto scaling:

```bash
# Create ECS service
aws ecs create-service \
  --cluster veritas-ai-cluster \
  --service-name veritas-ai-service \
  --task-definition veritas-ai-task \
  --desired-count 3 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345678],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:region:account:targetgroup/veritas-ai-tg/12345678,containerName=veritas-ai,containerPort=3000"

# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/veritas-ai-cluster/veritas-ai-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Put scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/veritas-ai-cluster/veritas-ai-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name veritas-ai-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

### 3. EKS Deployment

Deploy on Amazon Elastic Kubernetes Service.

#### EKS Cluster Setup

Create an EKS cluster:

```bash
# Create EKS cluster
aws eks create-cluster \
  --name veritas-ai-cluster \
  --role-arn arn:aws:iam::account:role/eksClusterRole \
  --resources-vpc-config subnetIds=subnet-12345,subnet-67890,securityGroupIds=sg-12345678

# Create node group
aws eks create-nodegroup \
  --cluster-name veritas-ai-cluster \
  --nodegroup-name veritas-ai-nodes \
  --subnets subnet-12345 subnet-67890 \
  --node-role arn:aws:iam::account:role/eksNodeRole \
  --scaling-config minSize=2,maxSize=10,desiredSize=3 \
  --instance-types t3.medium
```

#### Deploy Application

Use the Kubernetes manifests from the Kubernetes guide:

```bash
# Set up kubectl
aws eks update-kubeconfig --name veritas-ai-cluster

# Deploy application
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

### 4. Serverless Deployment (Lambda + API Gateway)

Deploy using AWS Lambda and API Gateway for a fully serverless approach.

#### Lambda Function

Create a Lambda function for the application:

```python
import json
import os
from veritas_ai import app

def lambda_handler(event, context):
    # Process the event and return response
    response = app.process_request(event)

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(response)
    }
```

#### API Gateway

Create an API Gateway with Lambda integration:

```bash
# Create REST API
aws apigateway create-rest-api \
  --name veritas-ai-api \
  --description "Veritas AI Content Authenticity API"

# Create Lambda permission
aws lambda add-permission \
  --function-name veritas-ai-function \
  --statement-id api-gateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn arn:aws:execute-api:region:account:api-id/*/*/*
```

## Database Services

### Amazon RDS for PostgreSQL

Create a PostgreSQL database instance:

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier veritas-ai-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username veritas_user \
  --master-user-password secure_password \
  --allocated-storage 20 \
  --storage-type gp2 \
  --storage-encrypted \
  --backup-retention-period 7 \
  --multi-az \
  --vpc-security-group-ids sg-12345678 \
  --db-subnet-group-name veritas-ai-subnet-group
```

### Amazon ElastiCache for Redis

Create a Redis cluster:

```bash
# Create ElastiCache cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id veritas-ai-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --security-group-ids sg-12345678 \
  --cache-subnet-group-name veritas-ai-subnet-group
```

## Security Configuration

### IAM Roles and Policies

Create IAM roles for different services:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "rds:Describe*",
        "rds:ListTagsForResource",
        "elasticache:Describe*",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

### Security Groups

Create security groups for different components:

```bash
# Create security group for application
aws ec2 create-security-group \
  --group-name veritas-ai-app-sg \
  --description "Security group for Veritas AI application" \
  --vpc-id vpc-12345678

# Add inbound rules
aws ec2 authorize-security-group-ingress \
  --group-id sg-12345678 \
  --protocol tcp \
  --port 3000 \
  --source-group sg-87654321
```

## Monitoring and Observability

### Amazon CloudWatch

Set up CloudWatch monitoring:

```bash
# Create CloudWatch alarm for CPU utilization
aws cloudwatch put-metric-alarm \
  --alarm-name veritas-ai-high-cpu \
  --alarm-description "Alarm when CPU exceeds 70%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 70 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=InstanceId,Value=i-1234567890abcdef0 \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:region:account:veritas-ai-alerts
```

### AWS X-Ray

Enable distributed tracing:

```bash
# Install X-Ray daemon
# In Dockerfile:
# RUN yum install -y unzip
# RUN curl https://s3.dualstack.us-east-2.amazonaws.com/aws-xray-assets.us-east-2/xray-daemon/aws-xray-daemon-linux-3.x.zip -o xray.zip
# RUN unzip xray.zip && cp xray /usr/bin/xray

# Add X-Ray sidecar container to ECS task definition
{
  "name": "xray-daemon",
  "image": "amazon/aws-xray-daemon",
  "cpu": 32,
  "memoryReservation": 256,
  "portMappings": [
    {
      "containerPort": 2000,
      "protocol": "udp"
    }
  ]
}
```

## Backup and Disaster Recovery

### Automated Backups

Set up automated backups with AWS Backup:

```bash
# Create backup plan
aws backup create-backup-plan \
  --backup-plan '{
    "BackupPlanName": "veritas-ai-backup-plan",
    "Rules": [
      {
        "RuleName": "daily-backup",
        "TargetBackupVault": "veritas-ai-vault",
        "ScheduleExpression": "cron(0 2 ? * * *)",
        "Lifecycle": {
          "DeleteAfterDays": 30
        }
      }
    ]
  }'

# Assign resources to backup plan
aws backup create-backup-selection \
  --backup-plan-id plan-1234567890abcdef \
  --backup-selection '{
    "SelectionName": "veritas-ai-selection",
    "IamRoleArn": "arn:aws:iam::account:role/service-role/AWSBackupDefaultServiceRole",
    "Resources": [
      "arn:aws:rds:region:account:db:veritas-ai-db"
    ]
  }'
```

## Cost Optimization

### Reserved Instances

Purchase reserved instances for consistent workloads:

```bash
# Purchase reserved instances
aws ec2 purchase-reserved-instances-offering \
  --reserved-instances-offering-id offering-id \
  --instance-count 2
```

### Spot Instances

Use spot instances for fault-tolerant workloads:

```bash
# Launch spot instances
aws ec2 request-spot-instances \
  --spot-price "0.05" \
  --instance-count 2 \
  --launch-specification file://spot-launch-spec.json
```

## High Availability

### Multi-AZ Deployment

Deploy across multiple availability zones:

```bash
# Create multi-AZ RDS instance
aws rds create-db-instance \
  --db-instance-identifier veritas-ai-db \
  --multi-az \
  --availability-zone us-west-2a \
  --secondary-availability-zone us-west-2b
```

### Cross-Region Replication

Set up cross-region replication for disaster recovery:

```bash
# Create read replica in another region
aws rds create-db-instance-read-replica \
  --db-instance-identifier veritas-ai-db-replica \
  --source-db-instance-identifier veritas-ai-db \
  --region us-east-1
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check RDS instance status
   aws rds describe-db-instances --db-instance-identifier veritas-ai-db

   # Test database connectivity
   nc -zv veritas-ai-db.cluster-1234567890abcdef.us-west-2.rds.amazonaws.com 5432
   ```

2. **ECS Service Issues**
   ```bash
   # Check ECS service events
   aws ecs describe-services --cluster veritas-ai-cluster --services veritas-ai-service

   # Check task logs
   aws logs get-log-events --log-group-name /ecs/veritas-ai --log-stream-name ecs/veritas-ai/container-id
   ```

3. **EKS Deployment Issues**
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
   # Check CloudWatch metrics
   aws cloudwatch get-metric-statistics \
     --namespace AWS/EC2 \
     --metric-name CPUUtilization \
     --dimensions Name=InstanceId,Value=i-1234567890abcdef0 \
     --start-time 2023-01-01T00:00:00Z \
     --end-time 2023-01-01T01:00:00Z \
     --period 300 \
     --statistics Average
   ```

This AWS deployment guide provides comprehensive instructions for deploying the Veritas AI platform on various AWS services, ensuring scalability, reliability, and security.