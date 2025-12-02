# EPG Manager - Hostinger VPS Deployment Guide

## ✅ **YES, You Can Deploy on Hostinger!**

Hostinger VPS hosting is **perfect** for your EPG Manager application because:

- ✅ **Full Root Access** - Complete server control
- ✅ **Docker Support** - Built-in Docker Manager
- ✅ **Node.js Compatible** - Can run your custom server
- ✅ **Socket.IO Support** - Persistent connections work
- ✅ **Redis & PostgreSQL** - Can install all dependencies
- ✅ **Cost-Effective** - Affordable VPS plans

---

## ⚠️ **Important: Which Hostinger Plan?**

### ✅ **VPS Hosting** - **RECOMMENDED** ✅
- **Works**: Full root access, Docker support
- **Price**: Starting from ~$4-8/month
- **Best for**: Your EPG Manager application

### ❌ **Shared Hosting** - **WON'T WORK** ❌
- **Doesn't work**: No Node.js, no Docker, no custom servers
- **Only for**: PHP/WordPress/Static sites
- **Not suitable**: For your application

### ⚠️ **Cloud Hosting** - **Check First** ⚠️
- **May work**: If it supports Node.js
- **Check**: Contact Hostinger support first

---

## 🚀 **Hostinger VPS Deployment Guide**

### **Step 1: Choose VPS Plan**

**Recommended Plans:**

| Plan | RAM | CPU | Storage | Price | Best For |
|------|-----|-----|---------|-------|----------|
| **VPS 1** | 1 GB | 1 vCore | 20 GB | ~$4/mo | Testing/Small |
| **VPS 2** | 2 GB | 2 vCores | 40 GB | ~$6/mo | **Recommended** |
| **VPS 3** | 4 GB | 3 vCores | 80 GB | ~$8/mo | Production |

**Minimum**: VPS 2 (2GB RAM) - Your app needs Redis + PostgreSQL + Node.js

---

### **Step 2: Access Your VPS**

1. **Login to Hostinger hPanel**
2. **Go to VPS Management**
3. **Get SSH Access Details**:
   - IP Address
   - Root Password (or SSH Key)
   - Port (usually 22)

4. **Connect via SSH**:
   ```bash
   ssh root@your-vps-ip
   # Enter password when prompted
   ```

---

### **Step 3: Initial Server Setup**

```bash
# Update system
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git nano

# Install Docker (if not using Hostinger Docker Manager)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

---

### **Step 4: Using Hostinger Docker Manager (Easier Option)**

Hostinger provides a **Docker Manager** that simplifies deployment:

1. **Access Docker Manager**:
   - Login to hPanel
   - Go to **VPS** → **Docker Manager**
   - Enable Docker Manager

2. **Create Docker Compose File**:
   - Use the web interface or SSH
   - Upload your `docker-compose.yml`

3. **Deploy via Web Interface**:
   - Click "Deploy" in Docker Manager
   - Monitor deployment status

---

### **Step 5: Deploy EPG Manager**

#### **Option A: Using Hostinger Docker Manager (Recommended)**

1. **Upload Files via FTP/SFTP**:
   ```bash
   # Or use Hostinger File Manager
   # Upload entire epg-manager folder to /home/your-username/
   ```

2. **SSH into VPS**:
   ```bash
   cd /home/your-username/epg-manager
   ```

3. **Create Environment File**:
   ```bash
   nano .env.production
   ```

   Add:
   ```env
   DATABASE_URL="postgresql://epguser:STRONG_PASSWORD@db:5432/epgmanager"
   NEXTAUTH_URL="https://your-domain.com"
   NEXTAUTH_SECRET="generate-strong-secret-here"
   NEXT_PUBLIC_BASE_URL="https://your-domain.com"
   REDIS_HOST="redis"
   REDIS_PORT="6379"
   NODE_ENV="production"
   ```

4. **Update docker-compose.yml for Hostinger**:
   ```yaml
   version: '3.8'

   services:
     app:
       build: .
       restart: unless-stopped
       ports:
         - "3000:3000"
       environment:
         - DATABASE_URL=postgresql://epguser:STRONG_PASSWORD@db:5432/epgmanager
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
       networks:
         - epg-network

     db:
       image: postgres:15-alpine
       restart: unless-stopped
       environment:
         - POSTGRES_DB=epgmanager
         - POSTGRES_USER=epguser
         - POSTGRES_PASSWORD=STRONG_PASSWORD
       volumes:
         - postgres_data:/var/lib/postgresql/data
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

   volumes:
     postgres_data:
     redis_data:

   networks:
     epg-network:
       driver: bridge
   ```

5. **Deploy**:
   ```bash
   # Build and start
   docker-compose up -d --build

   # Check status
   docker-compose ps

   # View logs
   docker-compose logs -f app
   ```

6. **Initialize Database**:
   ```bash
   docker-compose exec app npx prisma generate
   docker-compose exec app npx prisma db push
   ```

#### **Option B: Manual Deployment (More Control)**

1. **Clone Repository**:
   ```bash
   cd /home/your-username
   git clone <your-repo-url> epg-manager
   cd epg-manager
   ```

2. **Follow same steps as Option A** (steps 3-6)

---

### **Step 6: Configure Domain & SSL**

#### **6.1 Point Domain to VPS**

1. **Get VPS IP Address** from Hostinger panel
2. **Update DNS Records**:
   - Go to your domain registrar
   - Add **A Record**:
     - **Name**: `@` or `www`
     - **Type**: A
     - **Value**: Your VPS IP address
     - **TTL**: 3600

#### **6.2 Install SSL Certificate (Let's Encrypt)**

```bash
# Install Certbot
apt install -y certbot

# Get certificate
certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Certificates will be saved to:
# /etc/letsencrypt/live/your-domain.com/
```

#### **6.3 Install & Configure Nginx**

```bash
# Install Nginx
apt install -y nginx

# Create Nginx config
nano /etc/nginx/sites-available/epg-manager
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # WebSocket support for Socket.IO
    location /api/socketio {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # All other routes
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

Enable site:
```bash
ln -s /etc/nginx/sites-available/epg-manager /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

### **Step 7: Firewall Configuration**

```bash
# Install UFW (if not installed)
apt install -y ufw

# Allow SSH
ufw allow 22/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

---

### **Step 8: Auto-Start on Reboot**

```bash
# Create systemd service (optional, Docker Compose already has restart: unless-stopped)
# Or use PM2 for process management

# Install PM2
npm install -g pm2

# Start with PM2 (if not using Docker restart)
cd /home/your-username/epg-manager
pm2 start "docker-compose up" --name epg-manager
pm2 save
pm2 startup
```

---

## 🔧 **Hostinger-Specific Tips**

### **1. Using Hostinger File Manager**

- **Access**: hPanel → File Manager
- **Upload files**: Drag & drop
- **Edit files**: Built-in code editor
- **Permissions**: Set via File Manager

### **2. Hostinger VPS Kodee AI**

- **Access**: VPS Dashboard → Kodee AI
- **Use for**: Server management via chat
- **Helpful for**: Quick commands and troubleshooting

### **3. Resource Monitoring**

- **Check**: hPanel → VPS → Resource Usage
- **Monitor**: CPU, RAM, Disk, Bandwidth
- **Alert**: Set up email alerts for high usage

---

## 📊 **Resource Requirements**

### **Minimum (VPS 2 - 2GB RAM)**
- **App**: ~500MB
- **PostgreSQL**: ~300MB
- **Redis**: ~100MB
- **System**: ~500MB
- **Buffer**: ~600MB
- **Total**: ~2GB ✅

### **Recommended (VPS 3 - 4GB RAM)**
- **Better performance**
- **Room for growth**
- **Handles traffic spikes**

---

## 🛠️ **Troubleshooting**

### **Issue: Can't connect via SSH**

```bash
# Check if SSH is enabled in Hostinger panel
# Verify IP whitelist settings
# Try different SSH client (PuTTY, Terminal)
```

### **Issue: Docker not working**

```bash
# Check Docker service
systemctl status docker

# Restart Docker
systemctl restart docker

# Check Docker Manager in hPanel
```

### **Issue: Port 3000 not accessible**

```bash
# Check if app is running
docker-compose ps

# Check logs
docker-compose logs app

# Verify firewall
ufw status
```

### **Issue: Database connection error**

```bash
# Check database container
docker-compose ps db

# Check database logs
docker-compose logs db

# Verify DATABASE_URL in .env
```

---

## 💰 **Cost Breakdown**

### **Hostinger VPS 2 (Recommended)**
- **VPS**: ~$6/month
- **Domain**: ~$10/year (if not included)
- **SSL**: Free (Let's Encrypt)
- **Total**: ~$6-7/month

### **vs Other Options**
- **DigitalOcean**: $24/month
- **AWS EC2**: $30/month
- **Railway**: $20/month

**Hostinger is 3-4x cheaper!** ✅

---

## ✅ **Final Checklist**

- [ ] VPS plan purchased (VPS 2 or higher)
- [ ] SSH access configured
- [ ] Docker installed
- [ ] Repository cloned/uploaded
- [ ] Environment variables set
- [ ] Docker Compose configured
- [ ] Application deployed
- [ ] Database initialized
- [ ] Domain pointed to VPS
- [ ] SSL certificate installed
- [ ] Nginx configured
- [ ] Firewall configured
- [ ] Application accessible via domain

---

## 🎯 **Quick Start Commands**

```bash
# 1. Connect to VPS
ssh root@your-vps-ip

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh

# 3. Clone repository
cd /home/your-username
git clone <your-repo> epg-manager
cd epg-manager

# 4. Configure environment
nano .env.production
# Add your environment variables

# 5. Deploy
docker-compose up -d --build

# 6. Initialize database
docker-compose exec app npx prisma db push

# 7. Check status
docker-compose ps
docker-compose logs -f app
```

---

## 📞 **Support**

### **Hostinger Support**
- **24/7 Live Chat**: Available in hPanel
- **Email**: support@hostinger.com
- **Knowledge Base**: support.hostinger.com

### **Application Support**
- **Email**: info@itassist.co.in
- **Website**: https://itassist.co.in

---

## 🎉 **Summary**

**YES, Hostinger VPS is perfect for your EPG Manager!**

✅ **Compatible**: Full Docker & Node.js support  
✅ **Affordable**: $6/month vs $24+ elsewhere  
✅ **Easy**: Docker Manager simplifies deployment  
✅ **Reliable**: Good uptime and support  

**Just make sure you get VPS hosting, not shared hosting!**

---

**Ultimate News Web Media Production Pvt Ltd**  
© 2024 All Rights Reserved

