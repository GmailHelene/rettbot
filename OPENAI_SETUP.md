# 🔧 RettBot+ OpenAI API Key Configuration Guide

## Problem
You're getting "Kunne ikke hente straffedata. Prøv igjen." and similar errors because the OpenAI API key is not configured in Railway.

## Solution: Add OpenAI API Key to Railway Environment

### Step 1: Get Your OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Sign in to your OpenAI account
3. Click "Create new secret key"
4. Copy the API key (starts with `sk-...`)

### Step 2: Add Environment Variable in Railway
1. Go to https://railway.app
2. Log in to your Railway account
3. Click on your `rettbot` project
4. Go to **Variables** tab
5. Click **+ New Variable**
6. Add the following:
   - **Variable Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (the `sk-...` key)
7. Click **Add**
8. Railway will automatically redeploy your app

### Step 3: Verify It Works
After Railway redeploys (takes 1-2 minutes), test your app:

1. Go to https://rettbot.com
2. Try any AI feature:
   - Evidence Analysis
   - Legal Research  
   - Defense Strategy
   - Corruption Assessment
   - Penalties Lookup

### Expected Result
Instead of "Kunne ikke hente straffedata", you should see proper AI responses with:
- Evidence analysis with confidence scores
- Legal research with Norwegian law citations
- Defense strategies with legal reasoning
- Corruption assessments with escalation paths
- Penalty information for criminal offenses

## Additional Notes

### Other Optional Environment Variables
You can also set these in Railway if needed:
- `LOG_LEVEL`: Set to `INFO` or `DEBUG`
- `FORCE_HTTPS`: Set to `true` for production (default)

### Troubleshooting
If you still get errors after setting the API key:
1. Check Railway logs in the **Deployments** tab
2. Make sure the API key is valid and has credits
3. Verify the key starts with `sk-`
4. Try redeploying manually if needed

### Security Note
Railway environment variables are secure and encrypted. Your OpenAI API key will not be visible in the code or logs.

## Current Status
✅ **Fixed Issues:**
- Added missing `/api/penalties/lookup` endpoint
- Fixed all API import errors
- Enhanced AI with Norwegian legal knowledge

⏳ **Needs Configuration:**
- OpenAI API key in Railway environment variables

Once you add the API key, all AI features will work perfectly! 🚀