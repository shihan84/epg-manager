#!/bin/bash

export DATABASE_URL="file:/Users/macair/EPG-manager/epg-manager/db/custom.db"
export NEXTAUTH_URL="http://localhost:3000"
export NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
export NEXT_PUBLIC_BASE_URL="http://localhost:3000"

echo "Starting EPG Manager server..."
node server.js

