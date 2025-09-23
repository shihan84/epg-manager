# Quick Deployment Guide

**EPG Manager - One-Click Deployment**  
_Ultimate News Web Media Production Pvt Ltd_

## 🚀 Quick Start

### Option 1: Vercel (Recommended - 2 minutes)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
./scripts/deploy-vercel.sh
```

### Option 2: Railway (3 minutes)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
./scripts/deploy-railway.sh
```

### Option 3: Docker (5 minutes)

```bash
# Deploy with Docker Compose
./scripts/deploy-docker.sh
```

### Option 4: VPS (10 minutes)

```bash
# Deploy to VPS
./scripts/deploy-vps.sh
```

## 📋 Prerequisites

- Node.js 18+
- Git
- Platform account (Vercel/Railway/etc.)

## 🔧 Environment Setup

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd epg-manager
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

## 🌐 Platform-Specific Quick Deploy

### Vercel

- **Free tier**: Yes
- **Database**: Vercel Postgres (free)
- **SSL**: Automatic
- **CDN**: Global

```bash
vercel --prod
```

### Railway

- **Free tier**: Yes
- **Database**: PostgreSQL (free)
- **SSL**: Automatic
- **Monitoring**: Built-in

```bash
railway up
```

### DigitalOcean App Platform

- **Free tier**: No
- **Database**: Managed PostgreSQL
- **SSL**: Automatic
- **Scaling**: Auto

### AWS EC2

- **Free tier**: Yes (12 months)
- **Database**: RDS PostgreSQL
- **SSL**: Manual setup
- **Scaling**: Manual

### Docker

- **Free tier**: Yes
- **Database**: PostgreSQL container
- **SSL**: Manual setup
- **Scaling**: Docker Swarm/K8s

## 📊 Monitoring

### Health Checks

```bash
# Application health
curl https://your-domain.com/api/health

# Database health
curl https://your-domain.com/api/health/db
```

### Logs

```bash
# Vercel
vercel logs

# Railway
railway logs

# Docker
docker-compose logs -f

# VPS
pm2 logs epg-manager
```

## 🔒 Security

### SSL Certificate

```bash
# Let's Encrypt (VPS)
sudo certbot --nginx -d your-domain.com

# Cloudflare (Recommended)
# Add domain to Cloudflare and enable SSL
```

### Environment Variables

```env
# Required
DATABASE_URL="your-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"

# Optional
REDIS_HOST="your-redis-host"
EMAIL_SERVER_HOST="smtp.gmail.com"
```

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Error**

   ```bash
   # Check database status
   sudo systemctl status postgresql

   # Test connection
   psql -h localhost -U epguser -d epgmanager
   ```

2. **Port Already in Use**

   ```bash
   # Find process using port 3000
   lsof -i :3000

   # Kill process
   kill -9 <PID>
   ```

3. **Build Errors**
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules package-lock.json
   npm install
   npm run build
   ```

## 📞 Support

- **Email**: info@itassist.co.in
- **Website**: https://itassist.co.in
- **Documentation**: See DEPLOYMENT.md

---

**Ultimate News Web Media Production Pvt Ltd**  
© 2024 All Rights Reserved
