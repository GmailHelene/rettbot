# Railway Deployment Checklist for RettBot+ 🚀

## ✅ Code Status
- **Backend**: All auth endpoints working with security enhancements
- **Frontend**: Built successfully with new ForgotPassword/ResetPassword pages
- **Git**: All changes committed and pushed to main branch

## 🔧 Required Environment Variables for Railway

### Critical Security Variables
```bash
# JWT Authentication (REQUIRED)
JWT_SECRET=your-super-secure-random-secret-here

# Password Reset Email (REQUIRED for forgot password)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@rettbot.com

# Frontend URL (for password reset links)
FRONTEND_URL=https://rettbot.com

# OpenAI API (for AI features)
OPENAI_API_KEY=your-openai-api-key
```

### Optional Environment Variables
```bash
# Database (SQLite used by default)
DATABASE_URL=sqlite:///./rettbot.db

# CORS Origins (auto-configured)
CORS_ORIGINS=https://your-railway-app.railway.app
```

## 📁 Static Files Setup
- ✅ Frontend built to `/frontend/dist`
- ✅ Backend serves static files from this directory
- ✅ FastAPI configured to serve React PWA

## 🛠 Railway Deployment Steps

### Option 1: Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy from current directory
railway deploy
```

### Option 2: GitHub Integration
1. Connect Railway to GitHub repo: `GmailHelene/rettbot`
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main

## ⚠️ Pre-Deployment Checklist

- [ ] Set all required environment variables in Railway
- [ ] Verify SMTP settings work (test email sending)
- [ ] Generate strong JWT_SECRET (min 32 chars)
- [ ] Update FRONTEND_URL to production domain (https://rettbot.com)
- [ ] Confirm HTTPS/SSL is enabled on Railway or via custom domain
- [ ] Test locally one more time with production build

## 🔐 HTTPS & CORS

- Enable HTTPS on your Railway service or via custom domain with SSL
- Set CORS_ORIGINS to include both apex and www:
	- `https://rettbot.com,https://www.rettbot.com`
- Ensure the frontend only uses https URLs in production

## 📦 Railway Variables (example from your Railway project)

```
OPENAI_API_KEY=sk-... (provided)
SECRET_KEY=EllmXvOd... (provided)
JWT_SECRET=U_d8IwC5... (provided)
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
ALLOWED_ORIGINS=https://rettbot.com,https://www.rettbot.com
CORS_ORIGINS=https://rettbot.com,https://www.rettbot.com
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=false
DATABASE_URL=
REDIS_URL=
FRONTEND_URL=https://rettbot.com
```

## 🎯 Current Deployment Readiness: **95%**

**What's Missing:**
- Environment variables need to be set in Railway
- SMTP credentials for password reset emails
- Final deployment trigger

**What's Ready:**
- ✅ Secure authentication system
- ✅ Password reset functionality
- ✅ Rate limiting protection
- ✅ Norwegian UI/UX
- ✅ PWA build optimized
- ✅ Code pushed to GitHub