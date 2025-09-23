#!/bin/bash

# EPG Manager - Docker Deployment Script
# Ultimate News Web Media Production Pvt Ltd

set -e

echo "🚀 EPG Manager - Docker Deployment"
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://epguser:password@db:5432/epgmanager"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Application
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Redis
REDIS_HOST="redis"
REDIS_PORT="6379"
EOF
    echo "⚠️  Please update .env file with your actual values"
fi

# Build and start containers
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting containers..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec app npx prisma db push

echo "✅ Deployment completed!"
echo "🌐 Your application is now running at http://localhost:3000"
echo "📊 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
echo "📧 For support: info@itassist.co.in"
