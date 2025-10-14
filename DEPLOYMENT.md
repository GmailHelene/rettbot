# 🚀 RettBot+ Deployment Guide

Complete guide for deploying RettBot+ to **rettbot.com** on Railway.

## 📋 Prerequisites

- ✅ OpenAI API Key (already configured in `.env`)
- ✅ Railway account (free tier works)
- ✅ Domain: rettbot.com (already purchased)
- ✅ Git repository

---

## 🎯 Quick Start (Railway - Recommended)

### 1. Push Code to GitHub

```bash
cd AI-advokaten
git init
git add .
git commit -m "Initial RettBot+ deployment"
git remote add origin https://github.com/YOUR_USERNAME/rettbot.git
git push -u origin main
```

### 2. Deploy to Railway

1. **Go to [Railway.app](https://railway.app)**
2. **Click "New Project" → "Deploy from GitHub repo"**
3. **Select your repository**
4. **Railway will auto-detect and deploy**

### 3. Add Environment Variables

In Railway dashboard:

1. **Go to Variables tab**
2. **Add these variables:**

```env
OPENAI_API_KEY=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

ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO

SECRET_KEY=generate-secure-key-here
JWT_SECRET=generate-secure-jwt-secret-here

CORS_ORIGINS=https://rettbot.com,https://www.rettbot.com
```

**⚠️ Generate secure keys:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"  # For SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"  # For JWT_SECRET
```

### 4. Connect Custom Domain (rettbot.com)

#### In Railway:

1. **Go to Settings tab**
2. **Click "Generate Domain"** (you'll get something like `rettbot-production.up.railway.app`)
3. **Click "Custom Domain"**
4. **Enter: `rettbot.com` and `www.rettbot.com`**
5. **Railway will show DNS records to add**

#### In Domeneshop/Domain Provider:

Add these DNS records:

```
Type    Name    Value                           TTL
A       @       [Railway IP Address]            3600
A       www     [Railway IP Address]            3600
CNAME   @       rettbot-production.up.railway.app   3600
```

**DNS propagation takes 5-60 minutes.**

### 5. Verify Deployment

Once deployed, visit:

- 🌐 **https://rettbot.com** - Main app
- 🩺 **https://rettbot.com/api/health** - API health check

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

---

## 🏗️ Alternative: Docker Deployment (SiteGround/VPS)

If you prefer traditional hosting:

### 1. Build Docker Image

```bash
docker build -t rettbot:latest .
```

### 2. Run Container

```bash
docker run -d \
  -p 8000:8000 \
  --env-file .env \
  --name rettbot \
  rettbot:latest
```

### 3. Nginx Reverse Proxy

On your server, configure Nginx:

```nginx
server {
    listen 80;
    server_name rettbot.com www.rettbot.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Enable HTTPS with Let's Encrypt

```bash
sudo certbot --nginx -d rettbot.com -d www.rettbot.com
```

---

## 🔧 Development Setup (Local)

### 1. Install Dependencies

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Start Development Servers

**Backend:**
```bash
cd backend
python -m uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```

**Or use Docker Compose:**
```bash
docker-compose up
```

Visit:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🧪 Testing the API

### Test Evidence Analysis

```bash
curl -X POST https://rettbot.com/api/evidence/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "file_name": "police_report.pdf",
    "file_type": "application/pdf",
    "file_size": 125000,
    "description": "Initial police report",
    "case_context": "Traffic stop incident",
    "encrypted_content": "base64_encrypted_data_here"
  }'
```

### Test Legal Research

```bash
curl -X POST https://rettbot.com/api/legal/research \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Can police search my phone without a warrant?",
    "case_type": "criminal"
  }'
```

### Test Defense Strategy

```bash
curl -X POST https://rettbot.com/api/defense/strategy \
  -H "Content-Type: application/json" \
  -d '{
    "case_facts": "Stopped for traffic violation, phone searched without warrant",
    "charges": "Traffic violation, obstruction"
  }'
```

---

## 📊 Monitoring & Logs

### Railway Logs

In Railway dashboard:
1. Go to **Deployments** tab
2. Click on latest deployment
3. View **Logs** in real-time

### Health Monitoring

Set up uptime monitoring:
- [UptimeRobot](https://uptimerobot.com) (free)
- [Pingdom](https://www.pingdom.com)
- Monitor: `https://rettbot.com/api/health`

---

## 🔒 Security Checklist

Before going live:

- [ ] ✅ Change `SECRET_KEY` and `JWT_SECRET` to secure random values
- [ ] ✅ Set `DEBUG=false` in production
- [ ] ✅ Configure CORS to only allow `rettbot.com` and `www.rettbot.com`
- [ ] ✅ Enable HTTPS (Railway does this automatically)
- [ ] ✅ Never commit `.env` file to git (add to `.gitignore`)
- [ ] ✅ Rotate OpenAI API key periodically
- [ ] ✅ Set up rate limiting (TODO: implement in backend)
- [ ] ✅ Configure firewall rules
- [ ] ✅ Enable audit logging

---

## 📈 Scaling & Performance

### Railway Auto-Scaling

Railway automatically scales based on traffic. To configure:

1. **Go to Settings → Resources**
2. **Adjust CPU/Memory limits**
3. **Enable auto-scaling** (paid plans)

### Add Database (Optional)

For persistent storage:

1. **In Railway, add PostgreSQL service**
2. **Update `.env`:**
   ```env
   DATABASE_URL=${DATABASE_URL}  # Railway auto-populates
   ```
3. **Update backend code to use database**

### Add Redis Cache (Optional)

For faster responses:

1. **In Railway, add Redis service**
2. **Update `.env`:**
   ```env
   REDIS_URL=${REDIS_URL}  # Railway auto-populates
   ```

---

## 🆘 Troubleshooting

### Issue: "503 Service Unavailable"

**Solution:**
- Check Railway logs for errors
- Verify `OPENAI_API_KEY` is set correctly
- Check backend is starting (look for "✅ RettBot+ API ready!" in logs)

### Issue: "CORS Error"

**Solution:**
- Add your domain to `CORS_ORIGINS` environment variable
- Restart the service

### Issue: "OpenAI API Error"

**Solution:**
- Verify API key is valid
- Check OpenAI account has credits
- Review rate limits

### Issue: DNS Not Resolving

**Solution:**
- Wait 24-48 hours for DNS propagation
- Use `nslookup rettbot.com` to check DNS
- Clear DNS cache: `ipconfig /flushdns` (Windows)

---

## 🎉 You're Live!

Once deployed, users can:

1. **Visit https://rettbot.com**
2. **Create account** (zero-knowledge, client-side encryption)
3. **Upload evidence** (drag-drop, AI analysis)
4. **Get legal research** (Norwegian law + ECHR)
5. **Build defense strategy** (GPT-4 powered)
6. **Draft legal documents** (professional motions)
7. **Install PWA** (offline access, mobile app)

---

## 📞 Support

- **Documentation:** [GitHub Wiki](https://github.com/YOUR_USERNAME/rettbot/wiki)
- **Issues:** [GitHub Issues](https://github.com/YOUR_USERNAME/rettbot/issues)
- **Railway Support:** https://railway.app/help

---

## 🔄 Continuous Deployment

Railway automatically deploys when you push to `main`:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push origin main

# Railway automatically builds and deploys
# Check deployment status in Railway dashboard
```

---

## 💰 Cost Estimate

**Railway (Recommended):**
- Free tier: $0/month (500 hours, enough for development)
- Hobby plan: $5/month (unlimited hours)
- Pro plan: $20/month (higher limits, team features)

**OpenAI API:**
- GPT-4-turbo: ~$0.01 per request (evidence analysis)
- Estimated: $10-50/month depending on usage
- Set usage limits in OpenAI dashboard

**Domain (rettbot.com):**
- Already purchased
- Renewal: ~$10-20/year

**Total:** ~$15-70/month

---

## 🚀 Next Steps

1. ✅ **Deploy to Railway** (5 minutes)
2. ✅ **Connect rettbot.com domain** (30 minutes + DNS wait)
3. ⏳ **Complete frontend UI** (we'll do this next)
4. ⏳ **Add PWA manifest** (offline support)
5. ⏳ **Test end-to-end** (upload evidence, get AI analysis)
6. ⏳ **Launch! 🎊**

---

**Let's get rettbot.com live! 🚀**
