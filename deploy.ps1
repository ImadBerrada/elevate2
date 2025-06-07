Write-Host "🚀 ELEVATE Dashboard - Vercel Deployment Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Check if git is initialized and has remote
$gitRemote = git remote -v 2>$null
if (-not $gitRemote -or $gitRemote -notmatch "origin") {
    Write-Host "❌ Error: No git remote found. Please push your code to GitHub first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project structure verified" -ForegroundColor Green

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host "✅ Vercel CLI ready" -ForegroundColor Green

# Build the project locally to check for errors
Write-Host "🔨 Building project locally..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please fix the errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Local build successful" -ForegroundColor Green

# Push latest changes to GitHub
Write-Host "📤 Pushing latest changes to GitHub..." -ForegroundColor Yellow
git add .
git commit -m "Deploy: Latest changes with fixed total amount calculations"
if ($LASTEXITCODE -ne 0) {
    Write-Host "No changes to commit" -ForegroundColor Yellow
}

# Try main branch first, then master
git push origin main
if ($LASTEXITCODE -ne 0) {
    git push origin master
}

Write-Host "✅ Code pushed to GitHub" -ForegroundColor Green

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Cyan
vercel --prod

Write-Host ""
Write-Host "🎉 Deployment initiated!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to your Vercel dashboard: https://vercel.com/dashboard"
Write-Host "2. Find your project and click on it"
Write-Host "3. Go to Settings > Environment Variables"
Write-Host "4. Add the following environment variables:"
Write-Host "   - DATABASE_URL (your Neon database URL)" -ForegroundColor Yellow
Write-Host "   - JWT_SECRET (generate with: node -e `"console.log(require('crypto').randomBytes(64).toString('hex'))`")" -ForegroundColor Yellow
Write-Host "   - NEXT_PUBLIC_API_URL=/api" -ForegroundColor Yellow
Write-Host "   - NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. After adding environment variables, redeploy:"
Write-Host "   vercel --prod"
Write-Host ""
Write-Host "6. Set up your database:"
Write-Host "   vercel env pull .env.local"
Write-Host "   npx prisma db push"
Write-Host "   npm run db:seed"
Write-Host ""
Write-Host "📚 For detailed instructions, see DEPLOYMENT.md" -ForegroundColor Cyan 