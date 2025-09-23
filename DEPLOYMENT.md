# EPG Manager - Deployment Guide

**Professional Electronic Program Guide Management System**  
_Ultimate News Web Media Production Pvt Ltd_

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Platform-Specific Deployments](#platform-specific-deployments)
   - [Vercel (Recommended)](#vercel-recommended)
   - [Railway](#railway)
   - [DigitalOcean App Platform](#digitalocean-app-platform)
   - [AWS (EC2 + RDS)](#aws-ec2--rds)
   - [Google Cloud Platform](#google-cloud-platform)
   - [Docker Deployment](#docker-deployment)
   - [Self-Hosted VPS](#self-hosted-vps)
4. [Database Setup](#database-setup)
5. [Environment Variables](#environment-variables)
6. [SSL/HTTPS Configuration](#sslhttps-configuration)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **Git**: Latest version
- **Database**: PostgreSQL, MySQL, or SQLite
- **Memory**: Minimum 512MB RAM
- **Storage**: Minimum 1GB free space

### Required Accounts

- **Vercel**: [vercel.com](https://vercel.com) (Free tier available)
- **Railway**: [railway.app](https://railway.app) (Free tier available)
- **DigitalOcean**: [digitalocean.com](https://digitalocean.com)
- **AWS**: [aws.amazon.com](https://aws.amazon.com)
- **Google Cloud**: [cloud.google.com](https://cloud.google.com)

## Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd epg-manager
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create `.env.local` file:

```env
# Database
DATABASE_URL="your-database-url"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key-here"

# Application
NEXT_PUBLIC_BASE_URL="https://your-domain.com"

# Redis (Optional - for caching)
REDIS_HOST="your-redis-host"
REDIS_PORT="6379"
REDIS_PASSWORD="your-redis-password"

# Email (Optional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@your-domain.com"
```

## Platform-Specific Deployments

### Vercel (Recommended)

**Best for**: Quick deployment, automatic scaling, global CDN

#### Steps:

1. **Connect Repository**

   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all required environment variables

3. **Database Setup**
   - Use Vercel Postgres (recommended)
   - Or external database (PlanetScale, Supabase, etc.)

4. **Deploy**
   ```bash
   vercel --prod
   ```

#### Vercel Configuration (`vercel.json`):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret"
  }
}
```

### Railway

**Best for**: Full-stack applications with database

#### Steps:

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Add Database**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will provide connection string

3. **Configure Environment Variables**
   - Go to Project Settings → Variables
   - Add all required environment variables

4. **Deploy**
   - Railway automatically deploys on git push
   - Monitor deployment in dashboard

#### Railway Configuration (`railway.toml`):

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
```

### DigitalOcean App Platform

**Best for**: Production applications with managed services

#### Steps:

1. **Create App**
   - Go to DigitalOcean → Apps → Create App
   - Connect GitHub repository

2. **Configure Build Settings**

   ```yaml
   name: epg-manager
   services:
     - name: web
       source_dir: /
       github:
         repo: your-username/epg-manager
         branch: main
       run_command: npm start
       environment_slug: node-js
       instance_count: 1
       instance_size_slug: basic-xxs
       envs:
         - key: NODE_ENV
           value: production
   ```

3. **Add Database**
   - Create managed PostgreSQL database
   - Add connection string to environment variables

4. **Deploy**
   - DigitalOcean automatically builds and deploys
   - Monitor in App Platform dashboard

### AWS (EC2 + RDS)

**Best for**: Enterprise applications with full control

#### Steps:

1. **Launch EC2 Instance**

   ```bash
   # Launch Ubuntu 22.04 LTS
   # Instance type: t3.micro (free tier) or t3.small
   # Security group: Allow HTTP (80), HTTPS (443), SSH (22)
   ```

2. **Install Dependencies**

   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install Nginx
   sudo apt install nginx -y
   ```

3. **Deploy Application**

   ```bash
   # Clone repository
   git clone <repository-url>
   cd epg-manager

   # Install dependencies
   npm install

   # Build application
   npm run build

   # Start with PM2
   pm2 start npm --name "epg-manager" -- start
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx**

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Setup RDS Database**
   - Create PostgreSQL RDS instance
   - Configure security groups
   - Update DATABASE_URL

### Google Cloud Platform

**Best for**: Scalable applications with Google services

#### Steps:

1. **Create Project**

   ```bash
   gcloud projects create epg-manager-project
   gcloud config set project epg-manager-project
   ```

2. **Enable APIs**

   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable sqladmin.googleapis.com
   ```

3. **Deploy to Cloud Run**

   ```bash
   # Build and push container
   gcloud builds submit --tag gcr.io/epg-manager-project/epg-manager

   # Deploy to Cloud Run
   gcloud run deploy epg-manager \
     --image gcr.io/epg-manager-project/epg-manager \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

4. **Setup Cloud SQL**
   - Create PostgreSQL instance
   - Configure connection
   - Update environment variables

### Docker Deployment

**Best for**: Containerized deployments, Kubernetes

#### Dockerfile:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Docker Compose:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/epgmanager
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-secret
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=epgmanager
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  postgres_data:
```

#### Deploy with Docker:

```bash
# Build and run
docker-compose up -d

# Or with Docker
docker build -t epg-manager .
docker run -p 3000:3000 epg-manager
```

### Self-Hosted VPS

**Best for**: Full control, custom configurations

#### Steps:

1. **Server Setup**

   ```bash
   # Ubuntu 22.04 LTS
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib -y

   # Install Nginx
   sudo apt install nginx -y

   # Install Certbot for SSL
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. **Database Setup**

   ```bash
   sudo -u postgres psql
   CREATE DATABASE epgmanager;
   CREATE USER epguser WITH PASSWORD 'your-password';
   GRANT ALL PRIVILEGES ON DATABASE epgmanager TO epguser;
   \q
   ```

3. **Application Deployment**

   ```bash
   # Clone and setup
   git clone <repository-url>
   cd epg-manager
   npm install
   npm run build

   # Install PM2
   sudo npm install -g pm2

   # Start application
   pm2 start npm --name "epg-manager" -- start
   pm2 save
   pm2 startup
   ```

4. **Nginx Configuration**

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **SSL Certificate**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

## Database Setup

### PostgreSQL (Recommended)

```sql
-- Create database
CREATE DATABASE epgmanager;

-- Create user
CREATE USER epguser WITH PASSWORD 'your-password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE epgmanager TO epguser;

-- Connect to database
\c epgmanager;

-- Run Prisma migrations
npx prisma db push
```

### MySQL

```sql
-- Create database
CREATE DATABASE epgmanager;

-- Create user
CREATE USER 'epguser'@'%' IDENTIFIED BY 'your-password';

-- Grant privileges
GRANT ALL PRIVILEGES ON epgmanager.* TO 'epguser'@'%';
FLUSH PRIVILEGES;
```

### SQLite (Development)

```bash
# No setup required
# Database file will be created automatically
```

## Environment Variables

### Required Variables

```env
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key-here"
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
```

### Optional Variables

```env
# Redis (for caching)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# Email (for notifications)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@your-domain.com"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
```

## SSL/HTTPS Configuration

### Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Cloudflare (Recommended)

1. Add domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS encryption
4. Configure page rules

## Monitoring & Maintenance

### Health Checks

```bash
# Application health
curl https://your-domain.com/api/health

# Database health
curl https://your-domain.com/api/health/db
```

### Logs

```bash
# PM2 logs
pm2 logs epg-manager

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs
tail -f logs/app.log
```

### Backup

```bash
# Database backup
pg_dump epgmanager > backup_$(date +%Y%m%d_%H%M%S).sql

# Application backup
tar -czf epg-manager-backup_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/app
```

### Updates

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Run migrations
npx prisma db push

# Restart application
pm2 restart epg-manager
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

```bash
# Check database status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U epguser -d epgmanager

# Verify environment variables
echo $DATABASE_URL
```

#### 2. Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

#### 3. Build Errors

```bash
# Clear cache
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

#### 4. Permission Issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER /path/to/app
chmod -R 755 /path/to/app
```

### Performance Optimization

#### 1. Enable Gzip Compression

```nginx
# Nginx configuration
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

#### 2. Database Optimization

```sql
-- Add indexes
CREATE INDEX idx_channels_user_id ON channels(user_id);
CREATE INDEX idx_programs_user_id ON programs(user_id);
CREATE INDEX idx_schedules_channel_id ON schedules(channel_id);
```

#### 3. Caching

```bash
# Install Redis
sudo apt install redis-server -y

# Configure Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

## Support

For deployment assistance or technical support:

- **Email**: info@itassist.co.in
- **Website**: https://itassist.co.in
- **Documentation**: See README.md

---

**Ultimate News Web Media Production Pvt Ltd**  
© 2024 All Rights Reserved
