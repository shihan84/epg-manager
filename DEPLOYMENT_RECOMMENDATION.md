# EPG Manager - Deployment Recommendation

## 🏆 **RECOMMENDED: Docker Compose Deployment**

### Why Docker Compose is Best for This Application

Your EPG Manager application has specific requirements that make Docker Compose the ideal deployment solution:

1. **Custom Server with Socket.IO** - Requires persistent connections
2. **Redis Dependency** - Needed for BullMQ queue system
3. **PostgreSQL Database** - Production-ready database
4. **Real-time Features** - WebSocket support
5. **File Generation** - EPG file storage

### Quick Start (5 minutes)

```bash
# 1. Clone repository
git clone <repository-url>
cd epg-manager

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# 3. Deploy
docker-compose up -d

# 4. Initialize database
docker-compose exec app npx prisma db push
docker-compose exec app npx prisma db seed

# 5. Access application
# http://localhost (via Nginx)
# http://localhost:3000 (direct)
```

### Production Deployment Steps

#### 1. Server Setup (Ubuntu 22.04 LTS)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### 2. Configure Environment Variables

Create `.env.production`:

```env
# Database (PostgreSQL in Docker)
DATABASE_URL="postgresql://epguser:epgpassword123@db:5432/epgmanager"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-strong-secret-here"

# Application
NEXT_PUBLIC_BASE_URL="https://your-domain.com"

# Redis (in Docker)
REDIS_HOST="redis"
REDIS_PORT="6379"

# Node Environment
NODE_ENV="production"
```

#### 3. Update docker-compose.yml for Production

```yaml
version: '3.8'

services:
  app:
    build: .
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql://epguser:epgpassword123@db:5432/epgmanager
      - NEXTAUTH_URL=https://your-domain.com
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXT_PUBLIC_BASE_URL=https://your-domain.com
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - NODE_ENV=production
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    networks:
      - epg-network

  db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_DB=epgmanager
      - POSTGRES_USER=epguser
      - POSTGRES_PASSWORD=epgpassword123
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - epg-network

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - epg-network

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - epg-network

volumes:
  postgres_data:
  redis_data:

networks:
  epg-network:
    driver: bridge
```

#### 4. SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot -y

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to ssl directory
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
sudo chmod 644 ssl/cert.pem
sudo chmod 600 ssl/key.pem
```

#### 5. Deploy

```bash
# Build and start
docker-compose up -d --build

# Check logs
docker-compose logs -f app

# Initialize database
docker-compose exec app npx prisma generate
docker-compose exec app npx prisma db push
```

### Monitoring & Maintenance

#### Health Checks

```bash
# Application health
curl https://your-domain.com/api/health

# Container status
docker-compose ps

# Logs
docker-compose logs -f app
docker-compose logs -f db
docker-compose logs -f redis
```

#### Database Backups

```bash
# Manual backup
docker-compose exec db pg_dump -U epguser epgmanager > backup_$(date +%Y%m%d).sql

# Automated backup (cron)
0 2 * * * cd /path/to/epg-manager && docker-compose exec -T db pg_dump -U epguser epgmanager > backups/backup_$(date +\%Y\%m\%d).sql
```

#### Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Run migrations
docker-compose exec app npx prisma db push
```

### Scaling

#### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      replicas: 3
    # ... rest of config
```

#### Load Balancing

Use Nginx as load balancer (already configured in nginx.conf)

### Cost Estimation

**DigitalOcean Droplet (Recommended)**
- **4GB RAM / 2 vCPU**: $24/month
- **8GB RAM / 4 vCPU**: $48/month (for scaling)

**AWS EC2**
- **t3.medium**: ~$30/month
- **t3.large**: ~$60/month

**Total Monthly Cost**: $24-60 (excluding domain)

---

## 🚀 **ALTERNATIVE: Railway (Quick Deploy)**

If you want a managed solution without server management:

### Steps

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub

2. **Add Services**
   - PostgreSQL database
   - Redis (if available)
   - Your application

3. **Configure Environment**
   - Add all environment variables
   - Set `NEXTAUTH_URL` to Railway domain

4. **Deploy**
   - Railway auto-deploys on push
   - Monitor in dashboard

### Railway Pros
- ✅ Zero server management
- ✅ Auto SSL
- ✅ Free tier available
- ✅ Easy scaling

### Railway Cons
- ❌ Less control
- ❌ Can be expensive at scale
- ❌ May need Redis workaround

---

## 📊 **Comparison Table**

| Feature | Docker Compose | Railway | Vercel | VPS |
|---------|---------------|---------|--------|-----|
| **Custom Server** | ✅ | ✅ | ❌ | ✅ |
| **Socket.IO** | ✅ | ✅ | ❌ | ✅ |
| **Redis Support** | ✅ | ⚠️ | ❌ | ✅ |
| **Cost** | $24-60/mo | $20-100/mo | Free-$20/mo | $24-60/mo |
| **Setup Time** | 30 min | 10 min | ❌ | 1 hour |
| **Scalability** | ✅ | ✅ | ❌ | ✅ |
| **Control** | ✅ | ⚠️ | ❌ | ✅ |
| **SSL** | Manual | Auto | Auto | Manual |

---

## 🎯 **Final Recommendation**

### For Production: **Docker Compose on VPS**
- Best performance
- Full control
- Cost-effective
- Production-ready

### For Quick Start: **Railway**
- Fastest deployment
- Zero management
- Good for MVP/testing

### Avoid: **Vercel/Serverless**
- Doesn't support your custom server
- Socket.IO won't work
- Not suitable for this app

---

## 📞 **Support**

For deployment assistance:
- **Email**: info@itassist.co.in
- **Website**: https://itassist.co.in

---

**Ultimate News Web Media Production Pvt Ltd**  
© 2024 All Rights Reserved

