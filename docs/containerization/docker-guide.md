# Docker Containerization Guide

This guide provides comprehensive instructions for containerizing and deploying the Veritas AI platform using Docker and Docker Compose.

## Prerequisites

- Docker 20.10 or higher
- Docker Compose 1.29 or higher
- At least 4GB RAM available

## Single Container Deployment

### Dockerfile Overview

The platform uses a multi-stage Docker build process for optimal image size and security:

```dockerfile
# Multi-stage build for AI-powered content authenticity platform
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create app directory
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of app files
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]
```

### Building the Image

To build the Docker image:

```bash
# Clone the repository
git clone https://github.com/your-org/veritas-ai.git
cd veritas-ai

# Build the Docker image
docker build -t veritas-ai:latest -f docker/Dockerfile .

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
  veritas-ai:latest
```

## Multi-Container Deployment with Docker Compose

### Docker Compose Overview

The platform includes a `docker-compose.yml` file for orchestrating multi-container deployments:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: veritas-postgres
    environment:
      POSTGRES_DB: veritas_ai
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: veritas-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    command: redis-server --appendonly yes

volumes:
  postgres_data:
  redis_data:
```

### Running with Docker Compose

To deploy the complete platform with Docker Compose:

```bash
# Clone the repository
git clone https://github.com/your-org/veritas-ai.git
cd veritas-ai

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale the application (if needed)
docker-compose up -d --scale app=3

# Stop all services
docker-compose down

# Stop all services and remove volumes
docker-compose down -v
```

### Environment Configuration

Create a `.env` file in the project root to configure environment variables:

```env
# Application settings
NODE_ENV=production
PORT=3000
API_RATE_LIMIT=100
MAX_CONTENT_SIZE=52428800

# Database configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=veritas_ai
DB_USER=postgres
DB_PASSWORD=postgres

# Redis configuration
REDIS_URL=redis://redis:6379

# Security settings
JWT_SECRET=your_secure_jwt_secret_here
SESSION_SECRET=your_secure_session_secret_here

# Logging
LOG_LEVEL=info
```

## Production Deployment Considerations

### Security Best Practices

1. **Use Non-Root User**: The Dockerfile creates and uses a non-root user for security:

```dockerfile
# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of app files
RUN chown -R nextjs:nodejs /app
USER nextjs
```

2. **Read-Only Filesystem**: Enable read-only filesystem in production:

```bash
docker run -d \
  --name veritas-ai \
  --read-only \
  --tmpfs /tmp \
  -p 3000:3000 \
  veritas-ai:latest
```

3. **Resource Limits**: Set resource limits to prevent DoS:

```bash
docker run -d \
  --name veritas-ai \
  --memory=1g \
  --cpus=1.0 \
  -p 3000:3000 \
  veritas-ai:latest
```

### Performance Optimization

1. **Multi-Stage Build**: Reduces image size by separating build and runtime environments
2. **Health Checks**: Built-in health checks for container orchestration
3. **Proper Resource Allocation**: Configured CPU and memory limits

### Monitoring and Logging

```bash
# View container logs
docker logs veritas-ai

# View real-time logs
docker logs -f veritas-ai

# Execute commands in running container
docker exec -it veritas-ai sh

# Monitor resource usage
docker stats veritas-ai
```

## Advanced Docker Configuration

### Custom Networks

Create isolated networks for enhanced security:

```bash
# Create custom networks
docker network create veritas-backend
docker network create veritas-frontend

# Run containers on specific networks
docker run -d --network veritas-backend --name postgres postgres:15-alpine
docker run -d --network veritas-backend --name redis redis:7-alpine
docker run -d --network veritas-frontend --name veritas-ai veritas-ai:latest
```

### Volume Management

```bash
# Create named volumes for persistent data
docker volume create veritas-postgres-data
docker volume create veritas-redis-data

# Use named volumes
docker run -d \
  --name postgres \
  -v veritas-postgres-data:/var/lib/postgresql/data \
  postgres:15-alpine
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check if database container is running
   docker ps | grep postgres

   # Check database logs
   docker logs veritas-postgres

   # Test database connection
   docker exec -it veritas-postgres pg_isready -U postgres
   ```

2. **Application Not Starting**
   ```bash
   # Check application logs
   docker logs veritas-ai

   # Check container status
   docker ps -a

   # Validate environment variables
   docker exec -it veritas-ai env
   ```

3. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :3000

   # Use different port mapping
   docker run -d -p 3001:3000 veritas-ai:latest
   ```

### Health Checks

```bash
# Manual health check
curl -f http://localhost:3000/health || echo "Service unhealthy"

# Docker health check status
docker ps --format "table {{.Names}}\t{{.Status}}"
```

This Docker guide provides a comprehensive approach to containerizing and deploying the Veritas AI platform, ensuring security, performance, and scalability.