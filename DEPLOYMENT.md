# 🚀 ELEVATE Investment Group Dashboard - Deployment Guide

This guide will walk you through deploying your ELEVATE Investment Group dashboard to production with a fully functional database.

## 📋 Prerequisites

- GitHub account (already set up ✅)
- Vercel account (free tier available)
- Neon account (free tier available)

## 🗄️ Step 1: Set Up Neon Database

### 1.1 Create Neon Account
1. Go to [https://console.neon.tech/signup](https://console.neon.tech/signup)
2. Sign up with your GitHub account or email: `berimad02@gmail.com`
3. Verify your email if required

### 1.2 Create Your Database Project
1. Click **"New Project"** in the Neon Console
2. Choose these settings:
   - **Project Name**: `elevate-investment-dashboard`
   - **Database Name**: `elevate_db`
   - **Region**: Choose closest to your users (e.g., US East, Europe West)
   - **PostgreSQL Version**: 16 (latest)
3. Click **"Create Project"**

### 1.3 Get Your Connection String
1. In your Neon project dashboard, click **"Connect"**
2. Copy the **Pooled Connection** string (recommended for production)
3. It will look like:
   ```
   postgresql://username:password@ep-xxx-xxx.pooled.us-east-1.neon.tech/elevate_db?sslmode=require
   ```
4. Save this connection string - you'll need it for deployment

### 1.4 Set Up Database Schema
1. In the Neon Console, go to **"SQL Editor"**
2. Run the following command to set up your database:
   ```sql
   -- This will create all the tables from your Prisma schema
   -- We'll run the actual migration after deployment
   SELECT 1; -- Placeholder query
   ```

## 🌐 Step 2: Deploy to Vercel

### 2.1 Create Vercel Account
1. Go to [https://vercel.com/signup](https://vercel.com/signup)
2. Sign up with your GitHub account
3. Authorize Vercel to access your repositories

### 2.2 Deploy Your Project
1. In Vercel dashboard, click **"New Project"**
2. Import your GitHub repository: `ImadBerrada/Elevate`
3. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (leave default)
   - **Install Command**: `npm install`

### 2.3 Add Environment Variables
In the Vercel deployment settings, add these environment variables:

```env
# Database
DATABASE_URL=your_neon_connection_string_here

# JWT Secret (generate a random 32+ character string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://your-vercel-app-url.vercel.app
```

**To generate secure secrets:**
- JWT_SECRET: Use a password generator for 32+ characters
- NEXTAUTH_SECRET: Use a password generator for 32+ characters

### 2.4 Deploy
1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be available at: `https://your-app-name.vercel.app`

## 🔧 Step 3: Database Migration

### 3.1 Run Database Migration
After successful deployment, you need to set up your database tables:

1. In your local terminal, set the production database URL:
   ```bash
   # Windows PowerShell
   $env:DATABASE_URL="your_neon_connection_string_here"
   
   # Or create a .env.production file
   echo 'DATABASE_URL="your_neon_connection_string_here"' > .env.production
   ```

2. Generate and push the database schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. Verify the tables were created in Neon Console > SQL Editor:
   ```sql
   \dt
   ```

## 🎯 Step 4: Test Your Deployment

### 4.1 Basic Functionality Test
1. Visit your deployed app: `https://your-app-name.vercel.app`
2. Test user registration:
   - Go to `/auth/register`
   - Create a test account
   - Verify you can log in

### 4.2 Business Network Features Test
1. Navigate to Business Network sections:
   - Dashboard: `/elevate/business-network/dashboard`
   - Activity: `/elevate/business-network/activity`
   - Contacts: `/elevate/business-network/contacts`
   - Business: `/elevate/business-network/business`
   - Employers: `/elevate/business-network/employers`

2. Test data creation:
   - Add a new employer
   - Create a contact
   - Add an activity
   - Verify data persists after page refresh

## 🔒 Step 5: Security & Production Setup

### 5.1 Environment Variables Security
- ✅ Never commit `.env` files to Git
- ✅ Use Vercel's environment variables dashboard
- ✅ Rotate secrets regularly
- ✅ Use different secrets for development and production

### 5.2 Database Security
- ✅ Use pooled connections for production
- ✅ Enable SSL (already configured in Neon)
- ✅ Monitor database usage in Neon Console
- ✅ Set up database backups (automatic in Neon)

### 5.3 Application Security
- ✅ JWT tokens are properly secured
- ✅ Password hashing with bcrypt
- ✅ API routes are protected with middleware
- ✅ Input validation with Zod schemas

## 📊 Step 6: Monitoring & Maintenance

### 6.1 Vercel Monitoring
- Monitor deployment logs in Vercel dashboard
- Set up error tracking
- Monitor performance metrics

### 6.2 Neon Database Monitoring
- Monitor database performance in Neon Console
- Track query performance
- Monitor storage usage
- Set up alerts for high usage

### 6.3 Regular Maintenance
- Update dependencies regularly
- Monitor for security vulnerabilities
- Backup important data
- Test functionality after updates

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```
Error: getaddrinfo ENOTFOUND
```
**Solution**: Check your DATABASE_URL environment variable

#### 2. Build Failures
```
Module not found: Can't resolve 'xyz'
```
**Solution**: Ensure all dependencies are in package.json

#### 3. Authentication Issues
```
JWT malformed
```
**Solution**: Check JWT_SECRET environment variable

#### 4. Prisma Errors
```
Environment variable not found: DATABASE_URL
```
**Solution**: Ensure DATABASE_URL is set in Vercel environment variables

### Getting Help
- Check Vercel deployment logs
- Monitor Neon database logs
- Review application logs
- Join Neon Discord for database issues
- Check Vercel documentation for deployment issues

## 🎉 Success Checklist

- [ ] Neon database created and configured
- [ ] Vercel deployment successful
- [ ] Environment variables configured
- [ ] Database schema migrated
- [ ] User registration/login working
- [ ] Business Network features functional
- [ ] Data persistence verified
- [ ] Security measures in place
- [ ] Monitoring set up

## 📞 Support

If you encounter any issues:

1. **Database Issues**: [Neon Discord](https://discord.gg/neon) or [Neon Support](https://neon.tech/docs/introduction/support)
2. **Deployment Issues**: [Vercel Support](https://vercel.com/help)
3. **Application Issues**: Check the GitHub repository issues

---

**Your ELEVATE Investment Group Dashboard is now live and ready for production use! 🚀** 