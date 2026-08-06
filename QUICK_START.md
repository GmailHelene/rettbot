# 🚀 RettBot+ Quick Setup Guide

Complete setup for rettbot.com deployment with OpenAI integration.

---

## ⚡ Quick Start (5 minutes)

### 1. Install Dependencies

```powershell
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install

# Return to root
cd ..
```

### 2. Verify OpenAI API Key

Your API key is already configured in `.env`. Test it:

```powershell
cd backend
python -c "from openai import OpenAI; import os; from dotenv import load_dotenv; load_dotenv('../.env'); client = OpenAI(api_key=os.getenv('OPENAI_API_KEY')); print('✅ OpenAI connected!')"
```

### 3. Start Development Servers

**Option A: Separate terminals (recommended for development)**

Terminal 1 - Backend:
```powershell
cd backend
python -m uvicorn main:app --reload
```

Terminal 2 - Frontend:
```powershell
cd frontend
npm run dev
```

**Option B: Docker Compose (easier)**

```powershell
docker-compose up
```

### 4. Test the App

Visit:
- 🌐 Frontend: http://localhost:5173
- 🔧 Backend API: http://localhost:8000
- 📚 API Docs: http://localhost:8000/docs

### 5. Test AI Features

Go to API docs (http://localhost:8000/docs) and test:

1. **Evidence Analysis** - Try `/api/evidence/analyze`
2. **Legal Research** - Try `/api/legal/research` 
3. **Defense Strategy** - Try `/api/defense/strategy`

---

## 🌐 Deploy to rettbot.com (Railway)

### 1. Push to GitHub

```powershell
git init
git add .
git commit -m "RettBot+ v1.0 - Production ready"

# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/rettbot.git
git push -u origin main
```

### 2. Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `rettbot` repository
4. Railway will auto-detect and start building

### 3. Add Environment Variables

In Railway dashboard → **Variables** tab, add:

```env
OPENAI_API_KEY=YOUR_KEY_HERE_SET_IN_RAILWAY_VARIABLES

ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO

SECRET_KEY=GENERATE_ME
JWT_SECRET=GENERATE_ME

CORS_ORIGINS=https://rettbot.com,https://www.rettbot.com
```

**Generate secure keys:**
```powershell
# For SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# For JWT_SECRET  
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 4. Connect Domain (rettbot.com)

#### In Railway:
1. Go to **Settings** → **Domains**
2. Click **"Custom Domain"**
3. Enter `rettbot.com` and `www.rettbot.com`
4. Railway shows DNS records to add

#### In Domeneshop (your domain provider):
Add these DNS records:

```
Type    Name    Value
A       @       [Railway IP from above]
A       www     [Railway IP from above]
CNAME   @       rettbot-production.up.railway.app
```

**Wait 5-60 minutes for DNS to propagate**

### 5. Verify Deployment

Visit:
- https://rettbot.com
- https://rettbot.com/api/health

Should see:
```json
{
  "status": "healthy",
  "services": {
    "openai": true,
    "api": true
  }
}
```

---

## 🧪 Test Real AI Features

### Test Evidence Analysis

```powershell
curl -X POST https://rettbot.com/api/evidence/analyze `
  -H "Content-Type: application/json" `
  -d '{
    \"file_name\": \"police_report.pdf\",
    \"file_type\": \"application/pdf\",
    \"file_size\": 125000,
    \"description\": \"Initial police report\",
    \"case_context\": \"Traffic stop incident\",
    \"encrypted_content\": \"test\"
  }'
```

### Test Legal Research

```powershell
curl -X POST https://rettbot.com/api/legal/research `
  -H "Content-Type: application/json" `
  -d '{
    \"query\": \"Kan politiet ransake mobilen min uten kjennelse?\",
    \"case_type\": \"criminal\"
  }'
```

### Test Defense Strategy

```powershell
curl -X POST https://rettbot.com/api/defense/strategy `
  -H "Content-Type: application/json" `
  -d '{
    \"case_facts\": \"Stoppet for trafikkontroll, mobil ransaket uten kjennelse\",
    \"charges\": \"Trafikkforseelse\"
  }'
```

---

## 📊 Monitor Usage

### Check Logs (Railway)
1. Go to **Deployments** tab
2. Click latest deployment
3. View **Logs** in real-time

### Monitor OpenAI Usage
1. Go to [OpenAI Dashboard](https://platform.openai.com/usage)
2. See API call costs
3. Set usage limits to control costs

---

## 🔧 Troubleshooting

### "503 Service Unavailable"
- Check Railway logs for errors
- Verify `OPENAI_API_KEY` is set
- Check backend is starting (look for "✅ RettBot+ API ready!")

### "OpenAI API Error"
- Verify API key is valid on OpenAI dashboard
- Check account has credits
- Review rate limits

### CORS Errors
- Add your domain to `CORS_ORIGINS`
- Restart service in Railway

### DNS Not Resolving
- Wait 24-48 hours for DNS propagation
- Use `nslookup rettbot.com` to check
- Clear DNS cache: `ipconfig /flushdns`

---

## 💰 Cost Estimate

**Railway:**
- Free: $0/month (500 hours)
- Hobby: $5/month (unlimited)

**OpenAI API:**
- GPT-4-turbo: ~$0.01-0.03 per analysis
- Estimated: $10-50/month depending on usage

**Domain:**
- Renewal: ~$10-20/year (already purchased)

**Total: ~$15-70/month**

---

## ✅ Deployment Checklist

- [x] OpenAI API key configured
- [x] Backend API created with all endpoints
- [x] Frontend connected to backend
- [x] Evidence upload with AI analysis
- [ ] Deploy to Railway
- [ ] Connect rettbot.com domain
- [ ] Add environment variables
- [ ] Test production deployment
- [ ] Set up monitoring
- [ ] Configure backups

---

## 🎉 What's Working Now

✅ **Backend API** - FastAPI with all endpoints  
✅ **OpenAI Integration** - GPT-4 for evidence analysis, legal research, defense strategy  
✅ **Evidence Upload** - Drag-drop with real AI analysis  
✅ **Zero-Knowledge Architecture** - Client-side encryption  
✅ **5-Layer Encryption** - Military-grade security  
✅ **Professional Case Management** - Smart organization  
✅ **Corruption Handling** - 8-level escalation paths  

---

## 🚀 Next Steps

1. **Complete Frontend UI** - Login, dashboard, case views
2. **PWA Features** - Offline support, install prompts
3. **Distributed Backup** - IPFS, ProtonDrive integration
4. **Testing** - End-to-end tests
5. **Launch** - Go live on rettbot.com! 🎊

---

## 📞 Need Help?

Check `DEPLOYMENT.md` for detailed deployment guide.

**You're ready to deploy! 🚀**

Let's get rettbot.com live!
