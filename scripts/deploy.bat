@echo off
echo 🚀 ELEVATE Investment Group Dashboard - Deployment Setup
echo =======================================================

REM Check if .env.local exists
if not exist .env.local (
    echo ❌ .env.local file not found!
    echo Please create .env.local with your environment variables.
    echo See DEPLOYMENT.md for details.
    pause
    exit /b 1
)

echo ✅ Environment file found

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npx prisma generate

REM Push database schema
echo 🗄️ Setting up database schema...
npx prisma db push

REM Seed database
echo 🌱 Seeding database with sample data...
npm run db:seed

REM Build the application
echo 🏗️ Building application...
npm run build

echo.
echo 🎉 Deployment setup complete!
echo.
echo 📋 Test Credentials:
echo Admin: admin@elevate.com / admin123
echo Demo:  demo@elevate.com / demo123
echo.
echo 🚀 Ready to deploy to Vercel!
echo Run: vercel --prod
pause 