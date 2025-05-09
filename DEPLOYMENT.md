# Deployment Guide

This document provides detailed instructions for deploying the Sirenda Hire application in different environments.

## Prerequisites

- Docker and Docker Compose
- Node.js (v18 or later)
- PostgreSQL (v14 or later)
- Nginx (for production)
- SSL certificates (for production)

## Environment Setup

### Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/sirendahire.git
   cd sirendahire
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment files:
   ```bash
   cp .env.example .env
   cp .env.example .env.development
   ```

4. Update environment variables in `.env.development`:
   ```env
   NODE_ENV=development
   DATABASE_URL=postgresql://user:password@localhost:5432/sirendahire_dev
   PORT=3000
   ```

5. Start the development environment:
   ```bash
   npm run dev
   ```

### Production Environment

1. Set up the server:
   ```bash
   # Update system packages
   sudo apt update && sudo apt upgrade -y

   # Install required packages
   sudo apt install -y nginx postgresql docker.io docker-compose
   ```

2. Configure PostgreSQL:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE sirendahire_prod;
   CREATE USER sirendahire WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE sirendahire_prod TO sirendahire;
   ```

3. Set up SSL certificates (using Let's Encrypt):
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

4. Configure Nginx:
   ```nginx
   # /etc/nginx/sites-available/sirendahire
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl;
       server_name your-domain.com;

       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. Enable the Nginx configuration:
   ```bash
   sudo ln -s /etc/nginx/sites-available/sirendahire /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. Create production environment file:
   ```bash
   cp .env.example .env.production
   ```

7. Update production environment variables:
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://sirendahire:your_secure_password@localhost:5432/sirendahire_prod
   PORT=3000
   ```

8. Build and start the production environment:
   ```bash
   npm run build
   npm run start:prod
   ```

## Docker Deployment

### Development

1. Build and start containers:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. Run database migrations:
   ```bash
   docker-compose -f docker-compose.dev.yml exec server npm run db:migrate
   ```

### Production

1. Build and start containers:
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

2. Run database migrations:
   ```bash
   docker-compose -f docker-compose.prod.yml exec server npm run db:migrate
   ```

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment. The workflow is defined in `.github/workflows/ci-cd.yml`.

### Workflow Steps

1. Build and test:
   ```yaml
   - name: Build and Test
     run: |
       npm install
       npm run build
       npm test
   ```

2. Deploy to staging:
   ```yaml
   - name: Deploy to Staging
     if: github.ref == 'refs/heads/develop'
     run: |
       ssh user@staging-server 'cd /path/to/staging && git pull && npm install && npm run build && pm2 restart app'
   ```

3. Deploy to production:
   ```yaml
   - name: Deploy to Production
     if: github.ref == 'refs/heads/main'
     run: |
       ssh user@production-server 'cd /path/to/production && git pull && npm install && npm run build && pm2 restart app'
   ```

## Monitoring and Logging

1. Set up PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   ```

2. Configure logging:
   ```bash
   pm2 logs
   ```

3. Set up monitoring:
   ```bash
   pm2 monit
   ```

## Backup Strategy

1. Database backups:
   ```bash
   # Daily backup
   0 0 * * * pg_dump -U sirendahire -d sirendahire_prod > /backups/db_$(date +\%Y\%m\%d).sql

   # Weekly backup
   0 0 * * 0 pg_dump -U sirendahire -d sirendahire_prod > /backups/db_weekly_$(date +\%Y\%m\%d).sql
   ```

2. File backups:
   ```bash
   # Daily backup of uploads
   0 0 * * * tar -czf /backups/uploads_$(date +\%Y\%m\%d).tar.gz /path/to/uploads
   ```

## Security Considerations

1. Update environment variables:
   - Use strong passwords
   - Rotate secrets regularly
   - Use environment-specific configurations

2. Configure firewalls:
   ```bash
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

3. Regular updates:
   ```bash
   # Update system packages
   sudo apt update && sudo apt upgrade -y

   # Update Node.js dependencies
   npm update
   ```

## Troubleshooting

1. Check logs:
   ```bash
   # Application logs
   pm2 logs

   # Nginx logs
   tail -f /var/log/nginx/error.log
   tail -f /var/log/nginx/access.log

   # Database logs
   tail -f /var/log/postgresql/postgresql-14-main.log
   ```

2. Common issues:
   - Database connection issues: Check connection string and PostgreSQL service
   - Nginx configuration: Test with `nginx -t`
   - SSL certificate: Renew with `certbot renew`
   - Memory issues: Monitor with `pm2 monit`

## Rollback Procedure

1. Database rollback:
   ```bash
   # Restore from backup
   psql -U sirendahire -d sirendahire_prod < /backups/db_previous.sql
   ```

2. Application rollback:
   ```bash
   # Revert to previous version
   git checkout previous-tag
   npm install
   npm run build
   pm2 restart app
   ```

## Maintenance

1. Regular tasks:
   - Monitor disk space
   - Check for security updates
   - Review logs for errors
   - Backup verification
   - Performance monitoring

2. Scheduled maintenance:
   - Database optimization
   - Log rotation
   - Cache clearing
   - SSL certificate renewal 