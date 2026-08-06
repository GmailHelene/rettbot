#!/usr/bin/env python3
"""
RettBot+ Status Check & Quick Fix Guide
"""
import requests

def check_railway_deployment():
    """Check if Railway deployment has the latest code"""
    print("🔍 Checking Railway Deployment Status...\n")
    
    # Test penalties endpoint (should exist after our fix)
    try:
        response = requests.get(
            "https://rettbot.com/api/penalties/lookup?offense=narkotika",
            timeout=10
        )
        if response.status_code == 200:
            print("✅ Penalties endpoint exists - Railway deployment updated")
            return True
        elif response.status_code == 404:
            print("⏳ Penalties endpoint not found - Railway still deploying or needs manual trigger")
            return False
        else:
            print(f"⚠️ Penalties endpoint returned {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error checking penalties endpoint: {e}")
        return False

def check_openai_status():
    """Check if OpenAI API key is configured"""
    print("\n🤖 Checking OpenAI API Configuration...\n")
    
    test_data = {
        "query": "test quick query",
        "case_type": "criminal"
    }
    
    try:
        response = requests.post(
            "https://rettbot.com/api/legal/research",
            json=test_data,
            timeout=15
        )
        
        if response.status_code == 200:
            print("✅ OpenAI API key is configured and working!")
            return True
        elif "AI engine unavailable" in response.text:
            print("❌ OpenAI API key is NOT configured in Railway")
            print("   Error:", response.json().get('error', 'Unknown error'))
            return False
        else:
            print(f"⚠️ Unexpected response: {response.status_code}")
            print(f"   Response: {response.text[:100]}...")
            return False
            
    except Exception as e:
        print(f"❌ Error checking OpenAI: {e}")
        return False

def main():
    print("🚀 RettBot+ Status Check\n")
    print("=" * 50)
    
    railway_ok = check_railway_deployment() 
    openai_ok = check_openai_status()
    
    print("\n" + "=" * 50)
    print("📊 SUMMARY:\n")
    
    if railway_ok and openai_ok:
        print("🎉 ALL SYSTEMS GO!")
        print("   ✅ Railway deployment: Updated")
        print("   ✅ OpenAI API: Configured") 
        print("   🚀 RettBot+ is fully functional!")
        
    elif railway_ok and not openai_ok:
        print("🔧 NEEDS OPENAI API KEY:")
        print("   ✅ Railway deployment: Updated")
        print("   ❌ OpenAI API: Not configured")
        print("\n📋 TO FIX:")
        print("   1. Go to https://railway.app")
        print("   2. Open your 'rettbot' project") 
        print("   3. Go to Variables tab")
        print("   4. Add: OPENAI_API_KEY = sk-your-openai-key")
        print("   5. Railway will auto-redeploy")
        print("   6. Test again in 2-3 minutes")
        
    elif not railway_ok and not openai_ok:
        print("⏳ RAILWAY DEPLOYMENT IN PROGRESS:")
        print("   ⏳ Railway deployment: Still updating")
        print("   ❌ OpenAI API: Not configured")
        print("\n📋 TO FIX:")
        print("   1. Wait 2-3 minutes for Railway to finish deploying")
        print("   2. Then add OpenAI API key in Railway Variables")
        print("   3. Test again")
        
    elif not railway_ok and openai_ok:
        print("⏳ RAILWAY DEPLOYMENT ISSUE:")
        print("   ⏳ Railway deployment: Needs update")
        print("   ✅ OpenAI API: Configured")
        print("\n📋 TO FIX:")
        print("   1. Check Railway deployment logs")
        print("   2. May need to trigger manual redeploy")

if __name__ == "__main__":
    main()