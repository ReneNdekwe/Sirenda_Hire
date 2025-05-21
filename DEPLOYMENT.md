# Sirenda Hire Deployment Guide

## Overview
This document provides step-by-step instructions for deploying the Sirenda Hire application to Microsoft Azure App Service using Docker.

## Prerequisites
- Microsoft Azure account (can start with free trial)
- Docker Hub account (already set up)
- Domain name (optional)

## Deployment Steps

### 1. Azure App Service Setup

1. **Create Azure Account**
   - Go to [Azure Portal](https://portal.azure.com)
   - Sign up for a new account or sign in to existing account
   - Start with a free trial if you're new to Azure

2. **Create App Service**
   - Click "Create a resource"
   - Search for "App Service"
   - Select "Web App"
   - Fill in the following details:
     - Subscription: Choose your subscription
     - Resource Group: Create new or select existing
     - Web App name: `sirenda-hire` (or your preferred name)
     - Publish: Docker Container
     - Operating System: Linux
     - Region: Choose closest to your users
     - Pricing tier: B1 (recommended for starting)

3. **Configure Docker Settings**
   - In your App Service, go to "Settings" > "Configuration"
   - Under "General settings":
     - Set "Stack settings" to "Docker"
     - Set "Image source" to "Docker Hub"
     - Set "Image and tag" to `ndekwe25/sirenda-hire:latest`

### 2. Environment Variables

Configure the following environment variables in Azure App Service:
- Go to "Settings" > "Configuration"
- Add the following application settings:
  ```
  NODE_ENV=production
  PORT=5000
  ```
  (Add any other environment variables your application needs)

### 3. Domain Configuration

1. **Add Custom Domain**
   - Go to your App Service
   - Click on "Custom domains"
   - Click "Add custom domain"
   - Enter your domain name
   - Follow Azure's instructions to configure DNS records

2. **SSL Certificate**
   - Azure provides free SSL certificates
   - Go to "TLS/SSL settings"
   - Click "Add TLS/SSL binding"
   - Follow the prompts to add your domain

### 4. Monitoring and Maintenance

1. **Set Up Monitoring**
   - Go to "Monitoring" in your App Service
   - Enable Application Insights
   - Set up alerts for:
     - High CPU usage
     - High memory usage
     - Failed requests

2. **Regular Maintenance**
   - Monitor application logs
   - Update Docker image when new versions are available
   - Review and update environment variables as needed

## Cost Estimation

### Basic Setup (B1 Tier)
- App Service: ~$13/month
- Domain Name: ~$10-15/year
- SSL Certificate: Free with Azure
- Total: ~$13-14/month

### Scaling Considerations
- Monitor usage and scale up if needed
- Consider upgrading to S1 tier if you need more resources
- Additional costs may apply for:
  - Increased traffic
  - Additional features
  - Backup storage

## Troubleshooting

### Common Issues
1. **Application Not Starting**
   - Check Docker logs in App Service
   - Verify environment variables
   - Check application logs

2. **Domain Not Working**
   - Verify DNS settings
   - Check SSL certificate status
   - Ensure domain is properly configured

### Support Resources
- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Docker Documentation](https://docs.docker.com/)
- Azure Support Portal

## Security Considerations

1. **Regular Updates**
   - Keep Docker image updated
   - Update dependencies regularly
   - Monitor security advisories

2. **Access Control**
   - Use Azure's built-in authentication if needed
   - Implement proper API security
   - Regular security audits

## Backup and Recovery

1. **Regular Backups**
   - Enable automatic backups in Azure
   - Store backups in multiple regions
   - Test recovery procedures

2. **Disaster Recovery**
   - Document recovery procedures
   - Maintain backup schedules
   - Test recovery regularly

## Contact

For deployment support or questions, contact:
- Technical Support: [Your Support Email]
- Azure Support: [Azure Support Portal](https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade) 