# VeritasAI Deployment Guide

## Production Deployment

This guide covers deploying VeritasAI to a production environment.

## Prerequisites

Before deploying, ensure you have:
- A production server or cloud instance
- Domain name and SSL certificate
- PostgreSQL database
- Redis instance
- Object storage (AWS S3 or MinIO)
- Docker (optional but recommended)

## Environment Configuration

Create a production `.env` file with the following variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database
DATABASE_HOST=your-database-host
DATABASE_PORT=5432
DATABASE_NAME=veritasai
DATABASE_USER=veritasai_user
DATABASE_PASSWORD=your_secure_password

# Redis Configuration
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_DB=0

# JWT Configuration
SECRET_KEY=your_very_secure_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Object Storage Configuration
STORAGE_ENDPOINT=your-storage-endpoint
STORAGE_ACCESS_KEY=your-access-key
STORAGE_SECRET_KEY=your-secret-key
STORAGE_BUCKET_NAME=veritasai-content

# Application Configuration
DEBUG=False
```

## Database Setup

1. Create the production database:
```sql
CREATE DATABASE veritasai;
CREATE USER veritasai_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE veritasai TO veritasai_user;
```

2. Run database migrations:
```bash
alembic upgrade head
```

## Object Storage Configuration

### AWS S3

1. Create an S3 bucket named `veritasai-content`
2. Create an IAM user with S3 permissions
3. Configure CORS for the bucket:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### MinIO (Self-hosted)

1. Deploy MinIO to your server
2. Create access keys
3. Create a bucket named `veritasai-content`

## Deployment Options

### Option 1: Docker Deployment (Recommended)

1. Build the Docker image:
```bash
docker build -t veritasai:latest .
```

2. Run the container:
```bash
docker run -d \
  --name veritasai \
  -p 8000:8000 \
  --env-file .env \
  veritasai:latest
```

### Option 2: Manual Deployment

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Start the application:
```bash
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

## Reverse Proxy Configuration

### Nginx

Create an Nginx configuration file:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

For SSL, use Let's Encrypt with Certbot:
```bash
sudo certbot --nginx -d your-domain.com
```

### Apache

Create an Apache virtual host:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:8000/
    ProxyPassReverse / http://127.0.0.1:8000/
</VirtualHost>
```

## Process Management

### Using systemd

Create a systemd service file `/etc/systemd/system/veritasai.service`:

```ini
[Unit]
Description=VeritasAI Application
After=network.target

[Service]
Type=simple
User=veritasai
WorkingDirectory=/path/to/veritasai
EnvironmentFile=/path/to/veritasai/.env
ExecStart=/path/to/veritasai/venv/bin/uvicorn src.main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl enable veritasai
sudo systemctl start veritasai
```

### Using PM2

1. Install PM2:
```bash
npm install -g pm2
```

2. Create an ecosystem file `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'veritasai',
    script: 'src/main.py',
    interpreter: 'python',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

3. Start the application:
```bash
pm2 start ecosystem.config.js
```

## Monitoring and Logging

### Application Logs

Configure logging in your application:

```python
import logging
from logging.handlers import RotatingFileHandler

# Set up logging
handler = RotatingFileHandler('veritasai.log', maxBytes=10000000, backupCount=5)
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)

app.logger.addHandler(handler)
app.logger.setLevel(logging.INFO)
```

### System Monitoring

Set up monitoring with tools like:
- **Prometheus** and **Grafana** for metrics
- **Sentry** for error tracking
- **New Relic** or **Datadog** for APM

## Backup and Recovery

### Database Backup

Create a daily backup script:

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump veritasai > backups/veritasai_$DATE.sql
```

Schedule with cron:
```bash
0 2 * * * /path/to/backup.sh
```

### Object Storage Backup

For AWS S3, enable versioning and use lifecycle policies:
```bash
aws s3api put-bucket-versioning --bucket veritasai-content --versioning-configuration Status=Enabled
```

## Security Considerations

1. **Firewall**: Only expose necessary ports (80, 443)
2. **SSL/TLS**: Always use HTTPS in production
3. **Secrets Management**: Use environment variables or a secrets manager
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Input Validation**: Validate all user inputs
6. **Security Headers**: Configure appropriate HTTP security headers

## Scaling

### Horizontal Scaling

1. Use a load balancer to distribute traffic
2. Deploy multiple application instances
3. Use a shared database and Redis instance

### Vertical Scaling

1. Increase server resources (CPU, RAM)
2. Optimize database queries
3. Use database connection pooling

## Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Check database credentials
   - Verify database is running
   - Check firewall settings

2. **Object Storage Access Denied**:
   - Verify access keys
   - Check bucket permissions
   - Confirm CORS configuration

3. **Application Not Starting**:
   - Check application logs
   - Verify environment variables
   - Ensure all dependencies are installed

### Health Checks

Implement health check endpoints:
```python
@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/health/database")
def database_health_check(db: Session = Depends(get_db)):
    try:
        db.execute("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}
```

## Updates and Maintenance

### Updating the Application

1. Pull the latest code:
```bash
git pull origin main
```

2. Install new dependencies:
```bash
pip install -r requirements.txt
```

3. Run database migrations:
```bash
alembic upgrade head
```

4. Restart the application:
```bash
sudo systemctl restart veritasai
```

### Maintenance Windows

Schedule regular maintenance:
- Database optimization
- Log rotation
- Security updates
- Backup verification