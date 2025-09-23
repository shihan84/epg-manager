#!/bin/bash

# EPG Manager - Railway Deployment Script
# Ultimate News Web Media Production Pvt Ltd

set -e

echo "🚀 EPG Manager - Railway Deployment"
echo "==================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway..."
    railway login
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build application
echo "🔨 Building application..."
npm run build

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment completed!"
echo "🌐 Your application is now live on Railway"
echo "📧 For support: info@itassist.co.in"
