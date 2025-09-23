#!/bin/bash

# EPG Manager - VPS Deployment Script
# Ultimate News Web Media Production Pvt Ltd

set -e

echo "🚀 EPG Manager - VPS Deployment"
echo "==============================="

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Please do not run this script as root"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js
echo "📦 Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PostgreSQL
echo "🗄️  Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install postgresql postgresql-contrib -y
fi

# Install Nginx
echo "🌐 Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
fi

# Install PM2
echo "📦 Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# Install Certbot
echo "🔒 Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    sudo apt install certbot python3-certbot-nginx -y
fi

# Setup database
echo "🗄️  Setting up database..."
sudo -u postgres psql -c "CREATE DATABASE epgmanager;" || true
sudo -u postgres psql -c "CREATE USER epguser WITH PASSWORD 'epgpassword123';" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE epgmanager TO epguser;" || true

# Install application dependencies
echo "📦 Installing application dependencies..."
npm install

# Build application
echo "🔨 Building application..."
npm run build

# Create PM2 ecosystem file
echo "📝 Creating PM2 ecosystem file..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'epg-manager',
    script: 'npm',
    args: 'start',
    cwd: '$(pwd)',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://epguser:epgpassword123@localhost:5432/epgmanager',
      NEXTAUTH_URL: 'http://localhost:3000',
      NEXTAUTH_SECRET: 'your-secret-key-here',
      NEXT_PUBLIC_BASE_URL: 'http://localhost:3000'
    }
  }]
}
EOF

# Start application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/epg-manager << EOF
server {
    listen 80;
    server_name _;
    
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
sudo ln -sf /etc/nginx/sites-available/epg-manager /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "✅ Deployment completed!"
echo "🌐 Your application is now running at http://$(curl -s ifconfig.me)"
echo "📊 To view logs: pm2 logs epg-manager"
echo "🛑 To stop: pm2 stop epg-manager"
echo "🔄 To restart: pm2 restart epg-manager"
echo "📧 For support: info@itassist.co.in"
echo ""
echo "⚠️  Next steps:"
echo "1. Update environment variables in ecosystem.config.js"
echo "2. Setup SSL certificate: sudo certbot --nginx -d your-domain.com"
echo "3. Update NEXTAUTH_URL with your actual domain"
