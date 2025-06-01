# 🚀 Deployment Guide - ELEVATE Investment Group Dashboard

## Prerequisites

1. **Neon Database Account** - [neon.tech](https://neon.tech)
2. **Vercel Account** - [vercel.com](https://vercel.com)
3. **GitHub Repository** - Your code should be pushed to GitHub

## Step 1: Set Up Neon Database

### 1.1 Create Neon Project
1. Go to [neon.tech](https://neon.tech) and sign up/login
2. Click "Create Project"
3. Choose your region (closest to your users)
4. Name your project: `elevate-dashboard`
5. Click "Create Project"

### 1.2 Get Database URL
1. In your Neon dashboard, go to "Connection Details"
2. Copy the connection string (it looks like):
   ```
   postgresql://username:password@ep-xxx.region.neon.tech/dbname?sslmode=require
   ```
3. Save this URL - you'll need it for environment variables

## Step 2: Prepare Environment Variables

Create a `.env.local` file in your project root with these variables:

```env
# Database Configuration (Neon PostgreSQL)
DATABASE_URL="your_neon_database_url_here"

# JWT Secret for Authentication (Generate a strong random string)
JWT_SECRET="your_super_secure_jwt_secret_key_here_make_it_long_and_random"

# Next.js Configuration
NEXT_PUBLIC_API_URL="/api"
NEXT_PUBLIC_APP_URL="https://your-app-name.vercel.app"

# Optional: Email Service (if using Resend)
RESEND_API_KEY="your_resend_api_key_here"
```

### Generate JWT Secret
Run this command to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Step 3: Deploy to Vercel

### 3.1 Connect GitHub Repository
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Select the `company-dashboard` folder as the root directory

### 3.2 Configure Build Settings
- **Framework Preset**: Next.js
- **Root Directory**: `company-dashboard`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3.3 Add Environment Variables
In Vercel project settings, add these environment variables:

1. `DATABASE_URL` - Your Neon database URL
2. `JWT_SECRET` - Your generated JWT secret
3. `NEXT_PUBLIC_API_URL` - `/api`
4. `NEXT_PUBLIC_APP_URL` - Your Vercel app URL (e.g., `https://your-app.vercel.app`)

### 3.4 Deploy
1. Click "Deploy"
2. Wait for the build to complete

## Step 4: Set Up Database Schema

### 4.1 Run Database Migration
After deployment, you need to set up the database schema:

1. In your Vercel project dashboard, go to "Functions" tab
2. Or run locally with your production DATABASE_URL:

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with sample data
npm run db:seed
```

### 4.2 Alternative: Use Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Run database commands
vercel env pull .env.local
npx prisma db push
npm run db:seed
```

## Step 5: Test Your Deployment

### 5.1 Access Your Application
1. Go to your Vercel app URL
2. You should see the dashboard homepage

### 5.2 Test Authentication
Use these test credentials:
- **Admin**: `admin@elevate.com` / `admin123`
- **Demo**: `demo@elevate.com` / `demo123`

### 5.3 Test Features
1. Login with test credentials
2. Navigate through different modules:
   - ELEVATE Business Network
   - Real Estate Management
   - HR Management
   - ALBARQ Dashboard
3. Test creating new contacts, activities, businesses

## Step 6: Production Optimizations

### 6.1 Environment Variables Security
- Never commit `.env.local` to Git
- Use strong, unique passwords
- Rotate JWT secrets regularly

### 6.2 Database Optimizations
- Enable connection pooling in Neon
- Set up database backups
- Monitor query performance

### 6.3 Vercel Optimizations
- Enable Edge Functions if needed
- Set up custom domain
- Configure caching headers

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check all dependencies are installed
   - Verify TypeScript compilation
   - Check environment variables

2. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check Neon database is active
   - Ensure SSL mode is enabled

3. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check API routes are working
   - Test with provided credentials

### Debug Commands

```bash
# Check Prisma connection
npx prisma db pull

# View database in browser
npx prisma studio

# Check build locally
npm run build

# Type check
npm run type-check
```

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Neon database logs
3. Test locally with production environment variables
4. Contact support with specific error messages

## Security Checklist

- [ ] Strong JWT secret generated
- [ ] Database URL secured
- [ ] Environment variables not in Git
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Database access restricted
- [ ] Regular security updates

---

**Your ELEVATE Investment Group Dashboard is now live! 🎉**

Access your dashboard at: `https://your-app-name.vercel.app` 