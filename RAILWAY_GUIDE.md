# 🚂 Railway Deployment Guide for rettbot.com

Complete step-by-step guide to deploy RettBot+ on Railway with your rettbot.com domain.

---

## 🎯 Overview

**What you'll deploy**:
- FastAPI backend with OpenAI GPT-4 integration
- React frontend (PWA)
- Domain: rettbot.com + www.rettbot.com
- HTTPS automatically enabled
- Auto-deploy on git push

**Time**: ~15 minutes (+ DNS propagation time)

---

## 📋 Prerequisites

✅ GitHub account  
✅ Railway account (free tier works) - [Sign up here](https://railway.app)  
✅ OpenAI API key (already in your `.env`)  
✅ Domain: rettbot.com (already purchased from Domeneshop)  

---

## 🚀 Step 1: Push Code to GitHub

### 1.1 Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click **"New repository"** (green button)
3. Repository name: `rettbot` (or any name you like)
4. Keep it **Private** (recommended for your API key security)
5. **Don't** initialize with README (we already have code)
6. Click **"Create repository"**

### 1.2 Push Your Code

Open PowerShell in your `AI-advokaten` folder:

```powershell
# Initialize git (if not already)
git init

# Add all files (`.env` will be ignored thanks to .gitignore)
git add .

# Commit
git commit -m "RettBot+ v1.0 - Production ready for rettbot.com"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/rettbot.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**✅ Verify**: Go to your GitHub repository and see all files (except `.env`)

---

## 🚂 Step 2: Deploy on Railway

### 2.1 Create New Project

1. Go to [railway.app](https://railway.app)
2. Click **"Login"** (sign in with GitHub)
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. **Authorize Railway** to access your GitHub (if first time)
6. **Select your `rettbot` repository**

### 2.2 Initial Deployment

Railway will automatically:
- ✅ Detect Python (backend)
- ✅ Detect Node.js (frontend)
- ✅ Start building

**Note**: First deployment will FAIL because environment variables are missing. This is normal!

---

## 🔧 Step 3: Configure Environment Variables

### 3.1 Open Variables Tab

1. In Railway dashboard, click on your project
2. Click **"Variables"** tab
3. Click **"Raw Editor"** button

### 3.2 Add All Variables

Copy-paste this (update the SECRET keys):

```env
OPENAI_API_KEY=YOUR_KEY_HERE_SET_IN_RAILWAY_VARIABLES
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
API_HOST=0.0.0.0
API_PORT=8000
SECRET_KEY=YOUR_SECRET_KEY_HERE
JWT_SECRET=YOUR_JWT_SECRET_HERE
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=https://rettbot.com,https://www.rettbot.com
DOMAIN=rettbot.com
PROTOCOL=https
OPENTIMESTAMPS_ENABLED=true
```

### 3.3 Generate Secure Keys

In PowerShell, run these commands to generate secure keys:

```powershell
# Generate SECRET_KEY
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"

# Generate JWT_SECRET
python -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(32))"
```

**Copy the output** and replace `YOUR_SECRET_KEY_HERE` and `YOUR_JWT_SECRET_HERE` in Railway.

### 3.4 Save Variables

1. Click **"Update variables"** button
2. Railway will **automatically redeploy** with new variables

### 3.5 Wait for Deployment

Watch the **Deployments** tab. You'll see:
- 🔨 Building...
- 🚀 Deploying...
- ✅ Live! (after 2-5 minutes)

---

## 🌐 Step 4: Get Railway URL

### 4.1 Generate Public URL

1. In Railway dashboard → **Settings** tab
2. Under **"Domains"** section
3. Click **"Generate Domain"**
4. You'll get something like: `rettbot-production.up.railway.app`

### 4.2 Test the URL

Visit: `https://rettbot-production.up.railway.app/api/health`

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T...",
  "services": {
    "openai": true,
    "api": true
  },
  "version": "1.0.0"
}
```

**✅ If you see this, backend is working!**

---

## 🔗 Step 5: Connect rettbot.com Domain

### 5.1 Add Custom Domain in Railway

1. Railway dashboard → **Settings** → **Domains**
2. Click **"Custom Domain"**
3. Enter: `rettbot.com`
4. Click **"Add"**
5. Repeat for `www.rettbot.com`

Railway will show you DNS records like:

```
Type: A
Name: @
Value: 123.45.67.89 (Railway IP)

Type: A
Name: www
Value: 123.45.67.89 (Railway IP)
```

**Copy these values** - you'll need them for Domeneshop.

### 5.2 Configure DNS in Domeneshop

1. Log in to [Domeneshop.no](https://www.domeneshop.no)
2. Go to **"Mine tjenester"** → **"Domener"**
3. Click on **rettbot.com**
4. Go to **"DNS-innstillinger"** tab
5. **Delete existing A records** (if any)
6. **Add new A records**:

```
Type    Navn    Innhold                    TTL
A       @       [Railway IP from above]    3600
A       www     [Railway IP from above]    3600
```

7. Click **"Lagre"**

### 5.3 Wait for DNS Propagation

DNS takes **5-60 minutes** to propagate. Sometimes up to 24 hours.

**Check status**:
```powershell
# Check if DNS is updated
nslookup rettbot.com

# Should show Railway IP address
```

### 5.4 Verify Domain

Once DNS propagates, visit:
- https://rettbot.com
- https://rettbot.com/api/health
- https://www.rettbot.com

**✅ You should see your app with automatic HTTPS!**

---

## 🧪 Step 6: Test AI Features

### 6.1 Test Evidence Analysis

```powershell
curl -X POST https://rettbot.com/api/evidence/analyze `
  -H "Content-Type: application/json" `
  -d '{
    \"file_name\": \"bevis.jpg\",
    \"file_type\": \"image/jpeg\",
    \"file_size\": 500000,
    \"description\": \"Bilde av skade\",
    \"case_context\": \"Trafikkuhell\",
    \"encrypted_content\": \"test\"
  }'
```

### 6.2 Test Legal Research

```powershell
curl -X POST https://rettbot.com/api/legal/research `
  -H "Content-Type: application/json" `
  -d '{
    \"query\": \"Kan politiet ransake mobilen min uten kjennelse?\",
    \"case_type\": \"criminal\"
  }'
```

**✅ If you get AI responses, everything works!**

---

## 📊 Step 7: Monitor Your Deployment

### 7.1 View Logs

1. Railway dashboard → **Deployments** tab
2. Click on latest deployment
3. View **real-time logs**

Look for:
```
🚀 RettBot+ API starting...
Environment: production
OpenAI configured: True
✅ RettBot+ API ready!
```

### 7.2 Monitor Usage

**Railway**:
- Dashboard shows CPU, Memory, Network usage
- Free tier: 500 hours/month
- Hobby plan ($5): Unlimited hours

**OpenAI**:
- Go to [platform.openai.com/usage](https://platform.openai.com/usage)
- See API call costs
- Set usage limits to control spending

---

## 🔄 Step 8: Continuous Deployment

Railway automatically deploys when you push to GitHub:

```powershell
# Make changes to your code
git add .
git commit -m "Add new feature"
git push origin main

# Railway automatically:
# 1. Detects push
# 2. Builds new version
# 3. Deploys to rettbot.com
# 4. Takes ~3-5 minutes
```

**View deployment progress** in Railway dashboard → Deployments tab.

---

## 🛠️ Troubleshooting

### Issue: "503 Service Unavailable"

**Solutions**:
1. Check Railway logs for errors
2. Verify `OPENAI_API_KEY` is set correctly
3. Check backend is starting (look for "✅ RettBot+ API ready!" in logs)
4. Ensure all environment variables are set

### Issue: "OpenAI API Error"

**Solutions**:
1. Verify API key at [platform.openai.com](https://platform.openai.com)
2. Check OpenAI account has credits
3. Review rate limits (Railway logs will show error details)

### Issue: CORS Error

**Solutions**:
1. Verify `CORS_ORIGINS` includes your domain
2. Should be: `https://rettbot.com,https://www.rettbot.com`
3. Restart deployment if changed

### Issue: DNS Not Resolving

**Solutions**:
1. Wait 24-48 hours for DNS propagation
2. Use `nslookup rettbot.com` to check DNS
3. Clear DNS cache: `ipconfig /flushdns`
4. Try in incognito mode
5. Verify A records in Domeneshop are correct

### Issue: Build Failed

**Solutions**:
1. Check Railway build logs
2. Verify `requirements.txt` is correct
3. Ensure `railway.json` is in root folder
4. Try manual rebuild: Settings → Deployments → Redeploy

---

## 💰 Cost Breakdown

### Railway Hosting

**Free Tier**:
- $0/month
- 500 hours/month
- 512 MB RAM
- Good for development/testing

**Hobby Plan** (Recommended):
- $5/month
- Unlimited hours
- 512 MB RAM - 8 GB RAM
- Good for production

**Pro Plan**:
- $20/month
- Team features
- Priority support
- Higher performance

### OpenAI API Costs

**GPT-4-turbo pricing**:
- Input: $10 per 1M tokens
- Output: $30 per 1M tokens

**Estimated per request**:
- Evidence analysis: ~$0.01-0.03
- Legal research: ~$0.02-0.05
- Defense strategy: ~$0.05-0.10

**Monthly estimate** (100 users, 10 requests each):
- 1,000 requests × $0.03 avg = **~$30/month**

**Set usage limits**:
1. Go to [platform.openai.com/settings/limits](https://platform.openai.com/settings/limits)
2. Set hard limit (e.g., $50/month)
3. Get email alerts at thresholds

### Total Monthly Cost

| Scenario | Railway | OpenAI | Total |
|----------|---------|--------|-------|
| Development | $0 | $10 | $10 |
| Small (10 users) | $5 | $10 | $15 |
| Medium (100 users) | $5 | $30 | $35 |
| Large (500 users) | $20 | $100 | $120 |

---

## 📈 Scaling Strategy

### 1-10 Users
- Railway Free Tier
- Monitor usage

### 10-100 Users
- Railway Hobby ($5/month)
- Set OpenAI limits

### 100-1000 Users
- Railway Pro ($20/month)
- Consider adding database (PostgreSQL)
- Add Redis caching
- Monitor performance

### 1000+ Users
- Upgrade Railway plan
- Add CDN for frontend
- Implement rate limiting
- Consider multiple regions

---

## ✅ Post-Deployment Checklist

- [ ] rettbot.com resolves to Railway
- [ ] HTTPS is working (automatic)
- [ ] /api/health returns healthy status
- [ ] OpenAI API is working (test evidence analysis)
- [ ] Environment variables are set correctly
- [ ] Logs show "✅ RettBot+ API ready!"
- [ ] CORS allows rettbot.com
- [ ] Set OpenAI usage limits
- [ ] Enable uptime monitoring (UptimeRobot, Pingdom)
- [ ] Set up error alerting

---

## 🎉 You're Live!

**Your app is now accessible at**:
- 🌐 https://rettbot.com
- 🩺 https://rettbot.com/api/health
- 📚 https://rettbot.com/docs (API documentation)

**Users can now**:
1. Visit rettbot.com
2. Upload evidence and get AI analysis
3. Perform legal research
4. Generate defense strategies
5. Draft legal documents
6. Access world-class AI legal assistance

---

## 🔧 Maintenance

### Weekly
- Check Railway logs for errors
- Monitor OpenAI usage and costs
- Review uptime reports

### Monthly
- Update dependencies (security patches)
- Review and optimize OpenAI prompts
- Check performance metrics

### As Needed
- Scale Railway plan based on usage
- Add new features
- Update AI models (when GPT-5 releases)

---

## 📞 Support

**Railway Support**:
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Help: https://railway.app/help

**OpenAI Support**:
- Docs: https://platform.openai.com/docs
- Help: https://help.openai.com

---

## 🚀 Next Steps

1. ✅ **Deploy** - Follow this guide
2. ✅ **Test** - Verify all AI features work
3. ⏳ **Build Frontend UI** - Complete React components
4. ⏳ **Add PWA** - Offline support
5. ⏳ **Launch** - Announce rettbot.com! 🎊

---

**Need help?** Re-read relevant sections or check troubleshooting.

**🎉 Congratulations on deploying RettBot+ to rettbot.com!**
