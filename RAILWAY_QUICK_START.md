# Railway Quick Start Guide - EPG Manager

## 🚀 **5-Minute Quick Deploy**

### **Step 1: Sign Up & Create Project** (2 min)

1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign up with GitHub (recommended)
4. Click "Deploy from GitHub repo"
5. Select your `epg-manager` repository
6. Click "Deploy Now"

### **Step 2: Add Database** (1 min)

1. In Railway dashboard, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Wait for database to be created
4. Click on PostgreSQL service → **"Variables"** tab
5. **Copy `DATABASE_URL`** (save it!)

### **Step 3: Configure Environment Variables** (2 min)

1. Click on your **application service** (not database)
2. Go to **"Variables"** tab
3. Click **"New Variable"** and add:

```env
DATABASE_URL=<paste-from-step-2>
NEXTAUTH_URL=https://your-app-name.up.railway.app
NEXTAUTH_SECRET=<generate-32-char-secret>
NEXT_PUBLIC_BASE_URL=https://your-app-name.up.railway.app
NODE_ENV=production
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Get your app URL:**
- Click on application → Settings → Domains
- Copy the Railway domain

### **Step 4: Initialize Database** (1 min)

1. Click on your application service
2. Go to **"Deployments"** tab
3. Click latest deployment → **"Shell"**
4. Run:
```bash
npx prisma generate
npx prisma db push
```

### **Step 5: Verify** (1 min)

1. Open your Railway domain
2. Test the application
3. Check health: `https://your-app.up.railway.app/api/health`

## ✅ **Done! Your app is live!**

For detailed instructions, see `DEPLOYMENT_RAILWAY.md`

