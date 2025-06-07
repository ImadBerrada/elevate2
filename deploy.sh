#!/bin/bash

echo "🚀 ELEVATE Dashboard - Vercel Deployment Script"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git is initialized and has remote
if ! git remote -v | grep -q origin; then
    echo "❌ Error: No git remote found. Please push your code to GitHub first."
    exit 1
fi

echo "✅ Project structure verified"

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready"

# Build the project locally to check for errors
echo "🔨 Building project locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors before deploying."
    exit 1
fi

echo "✅ Local build successful"

# Push latest changes to GitHub
echo "📤 Pushing latest changes to GitHub..."
git add .
git commit -m "Deploy: Latest changes with fixed total amount calculations" || echo "No changes to commit"
git push origin main || git push origin master

echo "✅ Code pushed to GitHub"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment initiated!"
echo ""
echo "Next steps:"
echo "1. Go to your Vercel dashboard: https://vercel.com/dashboard"
echo "2. Find your project and click on it"
echo "3. Go to Settings > Environment Variables"
echo "4. Add the following environment variables:"
echo "   - DATABASE_URL (your Neon database URL)"
echo "   - JWT_SECRET (generate with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\")"
echo "   - NEXT_PUBLIC_API_URL=/api"
echo "   - NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app"
echo ""
echo "5. After adding environment variables, redeploy:"
echo "   vercel --prod"
echo ""
echo "6. Set up your database:"
echo "   vercel env pull .env.local"
echo "   npx prisma db push"
echo "   npm run db:seed"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md" 