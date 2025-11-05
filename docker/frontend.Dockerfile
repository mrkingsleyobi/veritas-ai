# Multi-stage build for React frontend
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies with security audit
RUN npm ci --only=production && npm audit --audit-level high && npm cache clean --force

# Copy frontend source code
COPY frontend/ .

# Set environment variables for build
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Production stage with security enhancements
FROM nginx:alpine AS production

# Create non-root user for security
RUN delgroup nginx 2>/dev/null || true && \
    deluser nginx 2>/dev/null || true && \
    addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Copy built application to nginx
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY --chown=nginx:nginx docker/nginx.conf /etc/nginx/nginx.conf

# Set permissions for security
RUN chmod -R 755 /usr/share/nginx/html && \
    chmod 644 /etc/nginx/nginx.conf

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 8080

# Health check with multiple checks
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Security headers and configurations
# These are handled in the nginx.conf file

# Start nginx
CMD ["nginx", "-g", "daemon off;"]