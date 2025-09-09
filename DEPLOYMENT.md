# 🚀 EPG Manager Deployment Guide

This guide provides step-by-step instructions for deploying the EPG Manager system to various platforms.

## 📋 Prerequisites

Before deployment, ensure you have:
- Node.js 18+ installed
- A GitHub repository with the EPG Manager code
- Database access (SQLite, PostgreSQL, or MySQL)
- Deployment platform account (Vercel, Railway, etc.)

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Database Configuration
DATABASE_URL=your_database_connection_string

# Authentication Configuration
NEXTAUTH_URL=https://your-app-domain.com
NEXTAUTH_SECRET=your_random_secret_key

# Optional Configuration
NEXT_PUBLIC_BASE_URL=https://your-app-domain.com
```

### Generating NEXTAUTH_SECRET

```bash
# Generate a secure random secret
openssl rand -base64 32
# Or use online generator
```

## 🌟 Deployment Platforms

### 1. Vercel (Recommended)

#### Why Vercel?
- ⚡ Fastest deployment for Next.js apps
- 🌍 Global CDN and edge functions
- 📊 Built-in analytics and monitoring
- 🔧 Automatic SSL and custom domains
- 💰 Generous free tier

#### Step-by-Step Deployment

**1. Connect to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
vercel
```

**2. Configure Project**
- Connect your GitHub repository
- Select the `epg-manager` repository
- Vercel will auto-detect Next.js configuration

**3. Set Environment Variables**
In Vercel dashboard:
- Go to Project → Settings → Environment Variables
- Add the required environment variables:
  ```
  DATABASE_URL=postgresql://user:password@host:port/database
  NEXTAUTH_URL=https://your-app.vercel.app
  NEXTAUTH_SECRET=your-generated-secret
  ```

**4. Database Setup**

**Option A: Vercel Postgres (Recommended)**
- In Vercel dashboard, go to Storage
- Create a new Postgres database
- Copy the connection string to `DATABASE_URL`

**Option B: External Database**
- Use existing PostgreSQL/MySQL database
- Update `DATABASE_URL` accordingly

**5. Deploy and Test**
```bash
# Trigger deployment
vercel --prod

# Check deployment status
vercel logs
```

**6. Post-Deployment**
- Test all features in production
- Set up custom domain in Vercel settings
- Configure SSL (automatically handled)
- Set up monitoring and alerts

### 2. Railway

#### Why Railway?
- 🚀 Developer-friendly deployment
- 🗄️ Built-in database services
- 💡 Automatic environment variables
- 🔄 Continuous deployment
- 💰 Free tier available

#### Step-by-Step Deployment

**1. Create Railway Account**
- Sign up at [railway.app](https://railway.app)
- Connect your GitHub account

**2. Create New Project**
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose `epg-manager` repository

**3. Configure Service**
- Railway will auto-detect Next.js
- Verify build command: `npm run build`
- Verify start command: `npm start`

**4. Set Environment Variables**
- Railway provides database automatically
- Add additional variables:
  ```env
  NEXTAUTH_URL=${{RAILWAY_ENVIRONMENT.RAILWAY_PUBLIC_DOMAIN}}
  NEXTAUTH_SECRET=${{RAILWAY_ENVIRONMENT.NEXTAUTH_SECRET}}
  ```

**5. Deploy**
- Railway will automatically deploy on push
- Your app will be available at Railway-provided URL

### 3. Netlify

#### Why Netlify?
- 🌐 Global CDN network
- 🔄 Continuous deployment
- 🔧 Form handling and functions
- 💰 Free tier available
- 📝 Custom domain support

#### Step-by-Step Deployment

**1. Connect to Netlify**
- Sign up at [netlify.com](https://netlify.com)
- Connect your GitHub repository

**2. Configure Build Settings**
- Build command: `npm run build`
- Publish directory: `.next`
- Node version: 18 (or latest)

**3. Environment Variables**
- In Netlify dashboard → Site settings → Build & deploy → Environment
- Add environment variables:
  ```env
  DATABASE_URL=your_database_url
  NEXTAUTH_URL=https://your-app.netlify.app
  NEXTAUTH_SECRET=your_secret_key
  ```

**4. Create Netlify Functions**
Create `netlify/functions/nextjs.js`:
```javascript
const { handler } = require('./.next/serverless/entry.js')

exports.handler = handler
```

**5. Deploy**
- Netlify will automatically deploy on push
- Test API endpoints thoroughly

### 4. DigitalOcean App Platform

#### Why DigitalOcean?
- 🌊 Scalable infrastructure
- 💰 Competitive pricing
- 🗄️ Managed databases
- 📊 Monitoring and metrics
- 🌍 Global data centers

#### Step-by-Step Deployment

**1. Create App**
- Sign in to DigitalOcean Control Panel
- Go to Apps → Create App
- Connect your GitHub repository

**2. Configure App**
- Select `epg-manager` repository
- Choose build command: `npm run build`
- Choose run command: `npm start`
- Select instance size (Basic tier for start)

**3. Environment Variables**
- Add environment variables in app settings:
  ```env
  DATABASE_URL=your_database_url
  NEXTAUTH_URL=https://your-app.ondigitalocean.app
  NEXTAUTH_SECRET=your_secret_key
  ```

**4. Database Setup**
- Create DigitalOcean Managed Database
- Choose PostgreSQL or MySQL
- Get connection string and update `DATABASE_URL`

**5. Deploy**
- Click "Create Resources" and "Deploy"
- Monitor deployment progress

### 5. Self-Hosted Docker

#### Why Self-Hosted?
- 🏠 Complete control over infrastructure
- 💰 No recurring costs (after initial setup)
- 🔒 Enhanced security and privacy
- 📊 Custom monitoring and scaling

#### Step-by-Step Deployment

**1. Create Dockerfile**
```dockerfile
# Use official Node.js runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Define environment variables
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
```

**2. Create docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/epg_manager
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-secret-key
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=epg_manager
      - POSTGRES_USER=epg_user
      - POSTGRES_PASSWORD=your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

**3. Build and Run**
```bash
# Build and start services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**4. Reverse Proxy (Optional)**
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
        proxy_set_header X-Forwarded-For $proxy_addrs;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Database Setup

### SQLite (Development/Small Deployments)

**Setup:**
```bash
# SQLite is included by default
# No additional setup needed
npm run db:push    # Create database
npm run db:seed    # Add demo data
```

**Configuration:**
```env
DATABASE_URL=file:./dev.db
```

### PostgreSQL (Production)

**Setup:**
```bash
# Install PostgreSQL driver
npm install pg

# Update DATABASE_URL
DATABASE_URL=postgresql://username:password@localhost:5432/epg_manager

# Run migrations (if using Prisma)
npm run db:migrate

# Seed database
npm run db:seed
```

### MySQL (Production)

**Setup:**
```bash
# Install MySQL driver
npm install mysql2

# Update DATABASE_URL
DATABASE_URL=mysql://username:password@localhost:3306/epg_manager

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

## 📋 Post-Deployment Checklist

### 1. Testing
- [ ] Test user registration and login
- [ ] Test channel creation and management
- [ ] Test program creation and copy functionality
- [ ] Test schedule creation and validation
- [ ] Test EPG generation and download
- [ ] Test hosted EPG URLs
- [ ] Test admin panel functionality
- [ ] Test mobile responsiveness

### 2. Security
- [ ] Set up SSL/TLS certificates
- [ ] Configure environment variables properly
- [ ] Remove any demo credentials from production
- [ ] Set up proper authentication cookies
- [ ] Configure rate limiting if needed

### 3. Monitoring
- [ ] Set up application monitoring
- [ ] Configure error tracking
- [ ] Set up uptime monitoring
- [ ] Configure logging and analytics
- [ ] Set up backup procedures

### 4. Performance
- [ ] Test application performance under load
- [ ] Optimize database queries if needed
- [ ] Configure caching strategies
- [ ] Set up CDN for static assets
- [ ] Optimize images and assets

### 5. Maintenance
- [ ] Set up automated backups
- [ ] Configure database maintenance
- [ ] Set up update procedures
- [ ] Document deployment process
- [ ] Create rollback procedures

## 🚨 Troubleshooting

### Common Issues

**1. Database Connection Errors**
```bash
# Check database URL format
# Ensure database is running
# Verify network connectivity
```

**2. Authentication Issues**
```bash
# Verify NEXTAUTH_URL matches deployment URL
# Check NEXTAUTH_SECRET is properly set
# Clear browser cookies and cache
```

**3. Build Failures**
```bash
# Check Node.js version compatibility
# Verify all dependencies are installed
# Check for syntax errors in code
```

**4. API Endpoint Issues**
```bash
# Verify API routes are properly exported
# Check environment variables in API routes
# Test endpoints with curl or Postman
```

### Getting Help

- **GitHub Issues**: Create an issue in the repository
- **Documentation**: Check the main README.md file
- **Community**: Join relevant developer communities
- **Support**: Contact the development team

## 🎯 Best Practices

### Security
- Use strong, randomly generated secrets
- Keep environment variables secure
- Regularly update dependencies
- Use HTTPS in production
- Implement proper input validation

### Performance
- Optimize database queries
- Use caching where appropriate
- Optimize images and assets
- Monitor application performance
- Scale resources as needed

### Maintenance
- Regular backups of database and files
- Keep dependencies updated
- Monitor application health
- Plan for capacity scaling
- Document all procedures

---

Happy deploying! 🚀✨