#!/bin/bash

# ELEVATE Investment Group Dashboard - Deployment Script
echo "🚀 ELEVATE Investment Group Dashboard - Deployment Setup"
echo "======================================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Please create .env.local with your environment variables."
    echo "See DEPLOYMENT.md for details."
    exit 1
fi

echo "✅ Environment file found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "🗄️ Setting up database schema..."
npx prisma db push

# Seed database
echo "🌱 Seeding database with sample data..."
npm run db:seed

# Build the application
echo "🏗️ Building application..."
npm run build

echo ""
echo "🎉 Deployment setup complete!"
echo ""
echo "📋 Test Credentials:"
echo "Admin: admin@elevate.com / admin123"
echo "Demo:  demo@elevate.com / demo123"
echo ""
echo "🚀 Ready to deploy to Vercel!"
echo "Run: vercel --prod" 