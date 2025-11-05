# Deployment Guide

## System Requirements

### Hardware Requirements
- **Minimum**: 4 CPU cores, 8GB RAM, 50GB storage
- **Recommended**: 8+ CPU cores, 16GB+ RAM, 100GB+ storage
- **Storage**: SSD storage recommended for database performance

### Software Requirements
- **Operating System**: Ubuntu 20.04 LTS or newer, CentOS 8 or newer
- **Node.js**: Version 16.x or newer
- **Database**: PostgreSQL 13 or newer
- **Cache**: Redis 6 or newer
- **Web Server**: Nginx or Apache
- **Process Manager**: PM2 or similar

### Network Requirements
- **Ports**: 80 (HTTP), 443 (HTTPS), 5432 (PostgreSQL)
- **Bandwidth**: 100Mbps+ recommended for high-traffic deployments
- **SSL Certificate**: Required for production deployments

## Installation Steps

### 1. Environment Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Redis
sudo apt install redis-server -y

# Install PM2 globally
sudo npm install -g pm2
```

### 2. Database Configuration

```bash
# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE veritas_ai;
CREATE USER veritas_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE veritas_ai TO veritas_user;
EOF

# Configure PostgreSQL settings
sudo nano /etc/postgresql/13/main/postgresql.conf
# Set: shared_buffers = 256MB
# Set: effective_cache_size = 1GB
```

### 3. Application Deployment

```bash
# Clone repository
git clone https://github.com/your-org/veritas-ai.git
cd veritas-ai

# Install dependencies
npm install

# Create environment configuration
cat > .env << EOF
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=veritas_ai
DB_USER=veritas_user
DB_PASSWORD=secure_password
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_here
API_RATE_LIMIT=100
EOF

# Run database migrations
npm run migrate

# Build application (if applicable)
npm run build
```

### 4. Service Configuration

```bash
# Create PM2 configuration
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'veritas-ai-api',
    script: './src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Web Server Configuration

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/veritas-ai << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/veritas-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment (development, production) | development |
| PORT | Server port | 3000 |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | veritas_ai |
| DB_USER | Database user | veritas_user |
| DB_PASSWORD | Database password |  |
| REDIS_URL | Redis connection URL | redis://localhost:6379 |
| JWT_SECRET | JWT signing secret |  |
| API_RATE_LIMIT | Requests per minute per IP | 100 |
| MAX_CONTENT_SIZE | Max content size (bytes) | 52428800 (50MB) |
| LOG_LEVEL | Logging level (debug, info, warn, error) | info |

### Performance Tuning

```bash
# Adjust system limits
echo "fs.file-max = 2097152" | sudo tee -a /etc/sysctl.conf
echo "net.core.somaxconn = 65535" | sudo tee -a /etc/sysctl.conf

# Adjust PM2 cluster settings in ecosystem.config.js
instances: 'max',  // Use all CPU cores
exec_mode: 'cluster',
max_memory_restart: '1G',
```

## Monitoring and Maintenance

### Health Checks

```bash
# API health check endpoint
curl -f https://your-domain.com/health

# Database connection check
npm run health:db

# Redis connection check
npm run health:redis
```

### Log Management

```bash
# View application logs
pm2 logs veritas-ai-api

# Rotate logs
pm2 install pm2-logrotate

# Configure log retention
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 30
```

### Backup Strategy

```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U veritas_user -h localhost veritas_ai > backup_$DATE.sql
gzip backup_$DATE.sql

# Schedule backups with cron
# 0 2 * * * /path/to/backup-script.sh
```

## Scaling Options

### Horizontal Scaling
1. Deploy multiple application instances behind a load balancer
2. Use Redis for shared session storage
3. Implement database read replicas for high-traffic scenarios

### Vertical Scaling
1. Increase server resources (CPU, RAM, storage)
2. Optimize database queries and indexes
3. Implement caching strategies

## Security Considerations

### Network Security
- Restrict database access to application servers only
- Use firewall rules to limit exposed ports
- Implement DDoS protection at the network level

### Application Security
- Keep all dependencies up to date
- Implement proper input validation and sanitization
- Use secure headers in web server configuration
- Regularly rotate secrets and API keys

### Data Security
- Encrypt sensitive data at rest
- Use TLS for all data in transit
- Implement proper access controls and audit logging
- Regular security scanning and penetration testing

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database service status: `sudo systemctl status postgresql`
   - Verify database credentials in .env file
   - Check firewall settings for database port

2. **Application Not Starting**
   - Check PM2 logs: `pm2 logs`
   - Verify environment variables are set correctly
   - Ensure all dependencies are installed: `npm install`

3. **Performance Issues**
   - Monitor system resources: `htop`, `iotop`
   - Check database query performance
   - Review application logs for errors

### Support
For deployment issues, contact support@veritas-ai.com with:
- System specifications
- Error logs
- Deployment configuration