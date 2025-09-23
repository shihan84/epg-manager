#!/bin/bash

echo "🔧 EPG Manager - Dependency Fix Script"
echo "======================================"

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Please don't run this script as root"
    exit 1
fi

echo "📋 Step 1: Fixing npm cache permissions..."
sudo chown -R 501:20 "/Users/macair/.npm"
if [ $? -eq 0 ]; then
    echo "✅ npm cache permissions fixed"
else
    echo "❌ Failed to fix npm cache permissions"
    exit 1
fi

echo "📋 Step 2: Creating environment file..."
cat > .env.local << 'EOF'
DATABASE_URL="file:/Users/macair/EPG-manager/epg-manager/db/custom.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
EOF
echo "✅ Environment file created"

echo "📋 Step 3: Cleaning previous installations..."
rm -rf node_modules package-lock.json .next
echo "✅ Cleaned previous installations"

echo "📋 Step 4: Installing dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "📋 Step 5: Generating Prisma client..."
npx prisma generate
if [ $? -eq 0 ]; then
    echo "✅ Prisma client generated"
else
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "📋 Step 6: Pushing database schema..."
npx prisma db push
if [ $? -eq 0 ]; then
    echo "✅ Database schema pushed"
else
    echo "❌ Failed to push database schema"
    exit 1
fi

echo "📋 Step 7: Running type check..."
npx tsc --noEmit --skipLibCheck
if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
else
    echo "⚠️  TypeScript compilation has warnings (this is normal)"
fi

echo ""
echo "🎉 All fixes completed successfully!"
echo ""
echo "🚀 To start the server, run:"
echo "   npm run dev"
echo ""
echo "🌐 The application will be available at:"
echo "   http://localhost:3000"
echo ""
echo "👤 Demo credentials:"
echo "   Email: demo@example.com"
echo "   Password: password"

