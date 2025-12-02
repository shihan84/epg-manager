# EPG Manager - Railway Deployment Guide

## 🚂 **Railway Deployment - Step by Step**

Railway is perfect for quick deployment with managed services. This guide will walk you through deploying your EPG Manager application on Railway.

---

## 📋 **Prerequisites**

- ✅ GitHub account (for repository)
- ✅ Railway account (free tier available)
- ✅ Your EPG Manager code ready

---

## 🎯 **Step 1: Create Railway Account**

### **1.1 Sign Up**

1. **Go to Railway**: https://railway.app
2. **Click "Start a New Project"**
3. **Sign up with**:
   - GitHub (Recommended - easiest)
   - Email
   - Google

4. **Verify your email** if using email signup

### **1.2 Install Railway CLI (Optional but Recommended)**

```bash
# Install Railway CLI globally
npm install -g @railway/cli

# Login to Railway
railway login

# Verify installation
railway --version
```

---

## 🎯 **Step 2: Prepare Your Repository**

### **2.1 Push Code to GitHub**

If your code isn't on GitHub yet:

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - EPG Manager"

# Create GitHub repository
# Go to: https://github.com/new
# Create new repository (e.g., "epg-manager")

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/epg-manager.git
git branch -M main
git push -u origin main
```

### **2.2 Verify Repository Structure**

Make sure these files exist in your repo:
- ✅ `package.json`
- ✅ `Dockerfile` (or Railway will auto-detect)
- ✅ `prisma/schema.prisma`
- ✅ `server.ts`
- ✅ `.env.example` (for reference)

---

## 🎯 **Step 3: Create New Railway Project**

### **3.1 Create Project**

1. **Login to Railway Dashboard**: https://railway.app/dashboard
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Authorize Railway** to access your GitHub (if first time)
5. **Select your repository**: `epg-manager`
6. **Click "Deploy Now"**

Railway will automatically:
- Detect it's a Next.js application
- Start building your project
- Deploy it

---

## 🎯 **Step 4: Add PostgreSQL Database**

### **4.1 Create Database Service**

1. **In Railway Dashboard**, click **"+ New"**
2. **Select "Database"**
3. **Choose "PostgreSQL"**
4. Railway will create a PostgreSQL instance

### **4.2 Get Database Connection String**

1. **Click on the PostgreSQL service**
2. **Go to "Variables" tab**
3. **Copy the `DATABASE_URL`** - it looks like:
   ```
   postgresql://postgres:PASSWORD@containers-us-west-XXX.railway.app:5432/railway
   ```

**Save this for later!** 📝

---

## 🎯 **Step 5: Add Redis Service (Optional but Recommended)**

### **5.1 Create Redis Service**

1. **Click "+ New"** in your project
2. **Select "Database"**
3. **Choose "Redis"** (if available)
   - **Note**: Railway may not have Redis in all regions
   - **Alternative**: Use Upstash Redis (free tier) or skip Redis if not critical

### **5.2 Get Redis Connection String**

If Redis is available:
1. **Click on Redis service**
2. **Go to "Variables" tab**
3. **Copy connection details**

**Alternative - Use Upstash Redis**:
1. Go to https://upstash.com
2. Create free account
3. Create Redis database
4. Get connection string

---

## 🎯 **Step 6: Configure Environment Variables**

### **6.1 Add Environment Variables**

1. **In Railway Dashboard**, click on your **application service** (not database)
2. **Go to "Variables" tab**
3. **Click "New Variable"**
4. **Add each variable**:

#### **Required Variables:**

```env
# Database (from Step 4.2)
DATABASE_URL=postgresql://postgres:PASSWORD@containers-us-west-XXX.railway.app:5432/railway

# NextAuth
NEXTAUTH_URL=https://your-app-name.up.railway.app
NEXTAUTH_SECRET=generate-strong-secret-here-min-32-chars

# Application
NEXT_PUBLIC_BASE_URL=https://your-app-name.up.railway.app

# Node Environment
NODE_ENV=production

# Redis (if using)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

### **6.2 Generate NEXTAUTH_SECRET**

```bash
# Option 1: Use Railway CLI
railway variables set NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Option 2: Generate manually
openssl rand -base64 32

# Option 3: Use online generator
# https://generate-secret.vercel.app/32
```

### **6.3 Get Your App URL**

1. **Click on your application service**
2. **Go to "Settings" tab**
3. **Find "Domains" section**
4. **Copy the Railway domain** (e.g., `your-app-name.up.railway.app`)
5. **Use this for** `NEXTAUTH_URL` and `NEXT_PUBLIC_BASE_URL`

---

## 🎯 **Step 7: Configure Railway Build Settings**

### **7.1 Update Build Configuration**

1. **Click on your application service**
2. **Go to "Settings" tab**
3. **Scroll to "Build & Deploy"**

### **7.2 Configure Build Command**

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
npm start
```

**OR if using custom server:**
```bash
NODE_ENV=production tsx server.ts
```

### **7.3 Configure Root Directory**

- **Root Directory**: `/` (leave empty or set to `/`)
- **Watch Paths**: `/**` (monitor all files)

### **7.4 Health Check (Optional)**

- **Healthcheck Path**: `/api/health`
- **Healthcheck Timeout**: 300 seconds

---

## 🎯 **Step 8: Update Next.js Configuration**

### **8.1 Update next.config.ts**

Make sure your `next.config.ts` has:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Important for Railway
  images: {
    domains: ['localhost', 'your-app-name.up.railway.app'],
  },
  compress: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
```

**Key change**: Add `output: 'standalone'` for Railway deployment.

### **8.2 Update package.json Scripts**

Ensure your `package.json` has:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "NODE_ENV=production tsx server.ts",
    "postinstall": "prisma generate"
  }
}
```

---

## 🎯 **Step 9: Handle Custom Server (Important!)**

### **9.1 Railway and Custom Servers**

Railway supports custom servers, but you need to configure it properly.

### **9.2 Option A: Use Custom Server (Recommended)**

**Update `package.json` start script:**
```json
{
  "scripts": {
    "start": "NODE_ENV=production tsx server.ts"
  }
}
```

**Make sure `server.ts` is in root directory.**

### **9.3 Option B: Use Next.js Standalone (Alternative)**

If custom server causes issues:

1. **Update `next.config.ts`**:
```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  // ... rest of config
};
```

2. **Update `package.json`**:
```json
{
  "scripts": {
    "start": "node .next/standalone/server.js"
  }
}
```

**Note**: This won't support Socket.IO. Use Option A if you need real-time features.

---

## 🎯 **Step 10: Initialize Database**

### **10.1 Run Prisma Migrations**

**Option 1: Using Railway CLI**

```bash
# Login to Railway
railway login

# Link to your project
railway link

# Run migrations
railway run npx prisma db push

# Generate Prisma client
railway run npx prisma generate
```

**Option 2: Using Railway Dashboard**

1. **Click on your application service**
2. **Go to "Deployments" tab**
3. **Click on latest deployment**
4. **Open "Shell"**
5. **Run commands**:
```bash
npx prisma generate
npx prisma db push
```

### **10.2 Seed Database (Optional)**

```bash
# Using Railway CLI
railway run npm run db:seed

# Or in Railway Shell
npm run db:seed
```

---

## 🎯 **Step 11: Configure Custom Domain (Optional)**

### **11.1 Add Custom Domain**

1. **Click on your application service**
2. **Go to "Settings" tab**
3. **Scroll to "Domains"**
4. **Click "Custom Domain"**
5. **Enter your domain**: `epg.yourdomain.com`
6. **Follow DNS instructions**:
   - Add CNAME record pointing to Railway domain
   - Wait for DNS propagation (5-30 minutes)

### **11.2 Update Environment Variables**

After adding custom domain, update:
```env
NEXTAUTH_URL=https://epg.yourdomain.com
NEXT_PUBLIC_BASE_URL=https://epg.yourdomain.com
```

---

## 🎯 **Step 12: Monitor Deployment**

### **12.1 Check Build Logs**

1. **Click on your application service**
2. **Go to "Deployments" tab**
3. **Click on latest deployment**
4. **View "Build Logs"** and **"Deploy Logs"**

### **12.2 Common Issues & Solutions**

#### **Issue: Build Fails**

**Solution:**
```bash
# Check build logs for errors
# Common fixes:
# 1. Ensure all dependencies in package.json
# 2. Check Node.js version (Railway auto-detects)
# 3. Verify build command is correct
```

#### **Issue: Database Connection Error**

**Solution:**
```bash
# Verify DATABASE_URL is correct
# Check PostgreSQL service is running
# Ensure DATABASE_URL is in environment variables
```

#### **Issue: Port Error**

**Solution:**
Railway automatically sets `PORT` environment variable. Make sure your code uses:
```typescript
const port = process.env.PORT || 3000;
```

#### **Issue: Socket.IO Not Working**

**Solution:**
- Ensure custom server (`server.ts`) is being used
- Check WebSocket connections are allowed
- Verify `NEXTAUTH_URL` matches your domain

---

## 🎯 **Step 13: Verify Deployment**

### **13.1 Test Application**

1. **Open your Railway domain**: `https://your-app-name.up.railway.app`
2. **Test features**:
   - ✅ Homepage loads
   - ✅ Sign up / Sign in works
   - ✅ Dashboard accessible
   - ✅ API endpoints work
   - ✅ EPG generation works

### **13.2 Test Health Endpoint**

```bash
curl https://your-app-name.up.railway.app/api/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "version": "1.0.0"
}
```

---

## 🎯 **Step 14: Set Up Monitoring (Optional)**

### **14.1 Railway Metrics**

Railway provides built-in metrics:
- **CPU Usage**
- **Memory Usage**
- **Network Traffic**
- **Request Count**

**Access**: Service → Metrics tab

### **14.2 Set Up Alerts**

1. **Go to Project Settings**
2. **Enable email notifications**
3. **Set up alerts for**:
   - Deployment failures
   - High resource usage
   - Service downtime

---

## 🎯 **Step 15: Production Checklist**

- [ ] Railway account created
- [ ] GitHub repository connected
- [ ] Project created on Railway
- [ ] PostgreSQL database added
- [ ] Redis added (or alternative)
- [ ] Environment variables configured
- [ ] `NEXTAUTH_SECRET` generated
- [ ] `DATABASE_URL` set correctly
- [ ] Build settings configured
- [ ] Database initialized (Prisma migrations)
- [ ] Application deployed successfully
- [ ] Health check passing
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic on Railway)
- [ ] Application tested and working

---

## 🔧 **Railway-Specific Configuration**

### **railway.toml (Optional)**

Create `railway.toml` in project root:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"

[env]
NODE_ENV = "production"
PORT = "3000"
```

### **.railwayignore (Optional)**

Create `.railwayignore` to exclude files:

```
node_modules
.next
.git
.env.local
*.log
.DS_Store
```

---

## 💰 **Railway Pricing**

### **Free Tier (Hobby)**
- **$5 credit/month** (free)
- **500 hours** of usage
- **Perfect for**: Testing, small projects

### **Pro Plan**
- **$20/month**
- **Unlimited usage**
- **Better performance**
- **Priority support**

### **Team Plan**
- **$20/user/month**
- **Team collaboration**
- **Advanced features**

**For EPG Manager**: Start with free tier, upgrade to Pro when needed.

---

## 🚀 **Quick Deploy Commands**

### **Using Railway CLI**

```bash
# 1. Login
railway login

# 2. Initialize project
railway init

# 3. Link to existing project
railway link

# 4. Add environment variables
railway variables set DATABASE_URL="your-database-url"
railway variables set NEXTAUTH_SECRET="your-secret"
railway variables set NEXTAUTH_URL="https://your-app.up.railway.app"

# 5. Deploy
railway up

# 6. Run migrations
railway run npx prisma db push

# 7. View logs
railway logs

# 8. Open in browser
railway open
```

---

## 📊 **Troubleshooting Guide**

### **Problem: Build Times Out**

**Solution:**
```bash
# Increase build timeout in Settings
# Or optimize build process
# Remove unnecessary dependencies
```

### **Problem: Memory Limit Exceeded**

**Solution:**
```bash
# Upgrade to Pro plan
# Or optimize application
# Reduce memory usage
```

### **Problem: Database Connection Refused**

**Solution:**
```bash
# Verify DATABASE_URL format
# Check PostgreSQL service is running
# Ensure variables are set correctly
```

### **Problem: Custom Server Not Starting**

**Solution:**
```bash
# Verify start command in Settings
# Check server.ts exists
# Ensure tsx is installed
# Check build logs for errors
```

---

## 🎯 **Best Practices**

### **1. Environment Variables**
- ✅ Never commit secrets
- ✅ Use Railway variables, not `.env` files
- ✅ Use different values for dev/prod

### **2. Database**
- ✅ Always backup before migrations
- ✅ Use connection pooling
- ✅ Monitor database size

### **3. Deployment**
- ✅ Test locally first
- ✅ Use staging environment
- ✅ Monitor deployment logs
- ✅ Set up rollback strategy

### **4. Performance**
- ✅ Enable caching
- ✅ Optimize images
- ✅ Use CDN for static assets
- ✅ Monitor resource usage

---

## 📞 **Support**

### **Railway Support**
- **Documentation**: https://docs.railway.app
- **Discord**: https://discord.gg/railway
- **Email**: support@railway.app

### **Application Support**
- **Email**: info@itassist.co.in
- **Website**: https://itassist.co.in

---

## 🎉 **Summary**

**Railway is perfect for EPG Manager because:**

✅ **Easy Deployment** - Connect GitHub, auto-deploy  
✅ **Managed Services** - PostgreSQL included  
✅ **Auto SSL** - HTTPS automatically  
✅ **Free Tier** - Start for free  
✅ **Simple Scaling** - Upgrade when needed  
✅ **Great DX** - Excellent developer experience  

**Follow these steps and you'll have your EPG Manager live in 15-20 minutes!** 🚀

---

**Ultimate News Web Media Production Pvt Ltd**  
© 2024 All Rights Reserved

