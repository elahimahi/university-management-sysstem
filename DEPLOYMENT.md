# Deployment Guide - Railway.com

## 🚀 Step-by-Step Railway Deployment

### Prerequisites
- Railway.com account (free tier available)
- GitHub account with repository access
- Docker images built and ready

### Step 1: Create Railway Project

1. Go to https://railway.app/
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Connect your repository
6. Select this repository

### Step 2: Create Services

#### Backend Service (PHP)
```bash
# In Railway Dashboard:
1. New → GitHub Repo (select university-management-system)
2. Select branch: main
3. Configure Dockerfile: backend/Dockerfile
```

#### Database Service (MS SQL Server)
```bash
# In Railway Dashboard:
1. New → Database
2. Select "SQL Server"
3. Configure environment:
   - SA_PASSWORD: Generate strong password
   - MSSQL_PID: Express (free)
```

#### Frontend Service (React) - Optional for production
```bash
# For static hosting on Vercel/Netlify instead:
1. Build: npm run build
2. Deploy to Vercel: https://vercel.com/
3. Or Netlify: https://netlify.com/
```

### Step 3: Configure Environment Variables

Add these in Railway Project Settings → Variables:

```env
# Database
DB_HOST=mssql_service_name
DB_USER=sa
DB_PASSWORD=your_strong_password_here
DB_NAME=university_db
DB_PORT=1433

# API Configuration
API_PORT=80
NODE_ENV=production

# Payment Gateway (if using)
PAYMENT_GATEWAY=ssl_commerz
PAYMENT_API_KEY=your_api_key
PAYMENT_API_SECRET=your_api_secret
PAYMENT_RETURN_URL=https://your-domain.railway.app/payment-callback
PAYMENT_CANCEL_URL=https://your-domain.railway.app/payment-cancel

# Email Configuration (if implementing)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
TOKEN_EXPIRY=3600
```

### Step 4: Deploy

```bash
# Option 1: Automatic deployment on push
# Railway automatically deploys when you push to main

# Option 2: Manual deployment via CLI
railway login
railway link
railway up
```

### Step 5: Configure Custom Domain

1. Railway Dashboard → Project Settings
2. Custom Domain → Add Domain
3. Point your DNS to Railway

Example DNS configuration:
```
CNAME: yourdomain.com → your-app.railway.app
```

### Step 6: Health Checks

Railway provides health checks. Ensure endpoints respond:

```
GET /health-check.php → 200 OK
GET /api/auth/verify → 401 (not authenticated, but endpoint works)
```

### Step 7: Database Migration (First time only)

```bash
# Connect to Railway database
# Run SQL migration script:
# backend/core/mssql_database.sql

# Option 1: Using SSMS
1. Connect to: railway_host:1433
2. Credentials: sa / password
3. Run: backend/core/mssql_database.sql

# Option 2: Using Railway CLI
railway database:exec < backend/core/mssql_database.sql
```

## 📊 Monitoring

### View Logs
```bash
railway logs backend
railway logs database
```

### Check Status
```bash
railway status
```

### View Metrics
- Railway Dashboard → Deployments
- View CPU, Memory, Network usage

## 💰 Costs

Railway Pricing (as of 2026):
- **Compute**: $0.000463/hour per GB CPU
- **Memory**: $0.000128/hour per GB
- **Storage**: $0.05/month per GB
- **Network**: Free

Estimated monthly cost for small deployment: $5-20

## 🔐 Security Best Practices

1. **Environment Variables**: All sensitive data in Railway variables
2. **Database Access**: Accept connections only from backend container
3. **API Keys**: Use strong, randomly generated keys
4. **HTTPS**: Railway provides free SSL certificate
5. **Backups**: Enable database automated backups

```bash
# Backup database
railway database:backup create

# View backups
railway database:backup list
```

## 🆘 Troubleshooting

### Deployment fails
```bash
# Check logs
railway logs backend

# Rebuild and redeploy
railway up --force
```

### Database connection error
```
Error: ECONNREFUSED
Solution:
- Check database service is running
- Verify DB_HOST and DB_PORT in environment variables
- Ensure backend can reach database on same network
```

### API returns 500 errors
```bash
# Check backend logs
railway logs backend

# Verify database tables exist
# Check error log file at backend/php-errors.log
```

### Payment gateway not working
```
- Verify API credentials in environment variables
- Check payment gateway IP whitelist
- Review payment gateway documentation for HTTPS requirement
```

## 📈 Scaling

If application grows:

```bash
# Scale backend service
railway service:scale backend --replicas=2

# Add Redis cache
railway add redis

# Add CDN for static assets
# Configure CloudFlare or Railway CDN
```

## 🔄 CI/CD Integration

Railway automatically deploys on GitHub push:

1. Push to `main` branch
2. GitHub Actions workflows run tests
3. Docker image builds automatically
4. Railway deploys new container
5. Old container gradually replaced

### Deployment Pipeline:
```
git push → GitHub Actions → Docker Build → Railway Deploy
```

## 📝 Rollback

If deployment has issues:

```bash
# View deployment history
railway deployments list

# Rollback to previous version
railway deployments rollback <deployment_id>
```

## 🛡️ Production Checklist

- [ ] All environment variables configured
- [ ] Database initialized with schema
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Payment gateway tested
- [ ] Email configuration verified
- [ ] Backups enabled
- [ ] Monitoring and alerts set up
- [ ] Rate limiting configured
- [ ] CORS properly configured

## 📞 Support

Railway Support: https://docs.railway.app/
GitHub Actions: https://docs.github.com/actions/

---

**Ready for Production** ✅
