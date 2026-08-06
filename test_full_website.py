#!/usr/bin/env python3
"""
GRUNDIG TEST AV ALLE RETTBOT+ FUNKSJONER
Tester registrering, pålogging og alle AI-funksjoner på rettbot.com
"""
import requests
import json
import time
from datetime import datetime

def test_user_registration_and_login():
    """Test registrering og pålogging"""
    print("👤 TESTING USER REGISTRATION & LOGIN")
    print("-" * 50)
    
    base_url = "https://rettbot.com/api"
    test_email = f"test_{int(time.time())}@test.com"
    test_password = "TestPassword123!"
    
    # Test 1: Registrering
    print("🔐 Testing user registration...")
    try:
        registration_data = {
            "email": test_email,
            "password": test_password,
            "full_name": "Test User"
        }
        
        response = requests.post(f"{base_url}/auth/register", json=registration_data)
        print(f"   Registration Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('access_token')
            user_info = data.get('user', {})
            print(f"   ✅ Registration SUCCESS!")
            print(f"   User ID: {user_info.get('id')}")
            print(f"   Email: {user_info.get('email')}")
            print(f"   Token: {token[:20]}...")
            
            # Test 2: Pålogging med samme bruker
            print("\n🔑 Testing login with registered user...")
            login_data = {
                "email": test_email,
                "password": test_password
            }
            
            login_response = requests.post(f"{base_url}/auth/login", json=login_data)
            print(f"   Login Status: {login_response.status_code}")
            
            if login_response.status_code == 200:
                login_data = login_response.json()
                print(f"   ✅ Login SUCCESS!")
                return login_data.get('access_token')
            else:
                print(f"   ❌ Login FAILED: {login_response.text[:200]}")
                return None
                
        elif response.status_code == 400 and "already registered" in response.text:
            print(f"   ⚠️ Email already exists, trying to login...")
            login_data = {
                "email": test_email,
                "password": test_password
            }
            login_response = requests.post(f"{base_url}/auth/login", json=login_data)
            if login_response.status_code == 200:
                return login_response.json().get('access_token')
            else:
                print(f"   ❌ Login also failed: {login_response.text[:200]}")
                return None
        else:
            print(f"   ❌ Registration FAILED: {response.text[:200]}")
            return None
            
    except Exception as e:
        print(f"   ❌ Registration ERROR: {str(e)[:100]}")
        return None

def test_all_api_functions(auth_token=None):
    """Test alle API-funksjoner"""
    print("\n🚀 TESTING ALL API FUNCTIONS")
    print("=" * 60)
    
    base_url = "https://rettbot.com/api"
    headers = {"Authorization": f"Bearer {auth_token}"} if auth_token else {}
    
    results = {}
    
    # Test 1: Health Check
    print("\n❤️ 1. HEALTH CHECK")
    print("-" * 30)
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            data = response.json()
            openai_configured = data.get('services', {}).get('openai', False)
            print(f"   ✅ Health: {data.get('status')}")
            print(f"   🤖 OpenAI: {'✅ Configured' if openai_configured else '❌ Not configured'}")
            results["Health Check"] = "✅ Working"
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
            results["Health Check"] = "❌ Failed"
    except Exception as e:
        print(f"   ❌ Health check error: {str(e)[:50]}")
        results["Health Check"] = "❌ Error"
    
    # Test 2: Strafferammer (det du prøvde)
    print("\n📋 2. STRAFFERAMMER - The one you tested")
    print("-" * 40)
    
    penalties_tests = [
        ("narkotika", "cannabis besittelse"),
        ("vold", "slåss på bar"),  
        ("tyveri", "stjal telefon"),
        ("bedrageri", "falske faktura")
    ]
    
    penalties_working = 0
    for offense, context in penalties_tests:
        try:
            # Test GET endpoint (what frontend uses)
            response = requests.get(f"{base_url}/penalties/lookup", 
                                  params={"offense": offense, "context": context})
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('results'):
                    statute = data['results'][0].get('statute', 'No statute')
                    print(f"   ✅ {offense}: {statute[:60]}...")
                    penalties_working += 1
                else:
                    print(f"   ⚠️ {offense}: No results returned")
            else:
                print(f"   ❌ {offense}: HTTP {response.status_code}")
                if response.text:
                    error_preview = response.text[:100].replace('\n', ' ')
                    print(f"      Error: {error_preview}...")
                    
        except Exception as e:
            print(f"   ❌ {offense}: Exception - {str(e)[:50]}")
    
    results["Strafferammer"] = f"✅ {penalties_working}/4 working" if penalties_working > 0 else "❌ Not working"
    
    # Test 3: Legal Chat
    print("\n💬 3. LEGAL CHAT")
    print("-" * 25)
    
    chat_tests = [
        "Hva er straffen for cannabis i Norge?",
        "Kan politiet ransake telefonen min uten kjennelse?"
    ]
    
    chat_working = 0
    for question in chat_tests:
        try:
            response = requests.post(f"{base_url}/legal/chat",
                                   json={"message": question, "conversation_history": []},
                                   headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                answer = data.get('response', '')
                if len(answer) > 50:
                    print(f"   ✅ Question answered: {answer[:60]}...")
                    chat_working += 1
                else:
                    print(f"   ⚠️ Short/empty answer: {answer}")
            else:
                print(f"   ❌ Chat failed: HTTP {response.status_code}")
                if response.text:
                    error_preview = response.text[:100].replace('\n', ' ')
                    print(f"      Error: {error_preview}...")
                    
        except Exception as e:
            print(f"   ❌ Chat error: {str(e)[:50]}")
    
    results["Legal Chat"] = f"✅ {chat_working}/2 working" if chat_working > 0 else "❌ Not working"
    
    # Test 4: Legal Research
    print("\n📚 4. LEGAL RESEARCH")
    print("-" * 28)
    
    try:
        response = requests.post(f"{base_url}/legal/research",
                               json={
                                   "query": "Politiets ransakingsmyndighet av mobiltelefon",
                                   "case_type": "criminal",
                                   "context": "Trafikkontroll og ransaking"
                               },
                               headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            answer = data.get('answer', '')
            laws = data.get('norwegian_laws', [])
            print(f"   ✅ Research completed: {len(answer)} chars, {len(laws)} laws")
            results["Legal Research"] = "✅ Working"
        else:
            print(f"   ❌ Research failed: HTTP {response.status_code}")
            results["Legal Research"] = "❌ Not working"
            
    except Exception as e:
        print(f"   ❌ Research error: {str(e)[:50]}")
        results["Legal Research"] = "❌ Error"
    
    # Test 5: Defense Strategy  
    print("\n⚖️ 5. DEFENSE STRATEGY")
    print("-" * 30)
    
    try:
        response = requests.post(f"{base_url}/defense/strategy",
                               json={
                                   "case_facts": "Funnet med 3 gram cannabis",
                                   "charges": "Narkotikalovbrudd § 231", 
                                   "evidence": ["Politirapport", "Laboratorieanalyse"]
                               },
                               headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            strategy = data.get('strategy', '')
            print(f"   ✅ Strategy generated: {len(strategy)} characters")
            results["Defense Strategy"] = "✅ Working"
        else:
            print(f"   ❌ Strategy failed: HTTP {response.status_code}")
            if response.text:
                error_preview = response.text[:200].replace('\n', ' ')
                print(f"      Error: {error_preview}...")
            results["Defense Strategy"] = "❌ Not working"
            
    except Exception as e:
        print(f"   ❌ Strategy error: {str(e)[:50]}")
        results["Defense Strategy"] = "❌ Error"
    
    # Test 6: Evidence Analysis
    print("\n🔍 6. EVIDENCE ANALYSIS")
    print("-" * 32)
    
    try:
        response = requests.post(f"{base_url}/evidence/analyze",
                               json={
                                   "file_name": "skade_foto.jpg",
                                   "file_type": "image/jpeg",
                                   "file_size": 2500000,
                                   "description": "Bilde av blåmerker",
                                   "case_context": "Voldssak",
                                   "encrypted_content": "dummy_encrypted_content"
                               },
                               headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            assessment = data.get('assessment', {})
            relevance = assessment.get('relevance', 'unknown')
            print(f"   ✅ Evidence analyzed: Relevance {relevance}")
            results["Evidence Analysis"] = "✅ Working"
        else:
            print(f"   ❌ Evidence analysis failed: HTTP {response.status_code}")
            if response.text:
                error_preview = response.text[:200].replace('\n', ' ')
                print(f"      Error: {error_preview}...")
            results["Evidence Analysis"] = "❌ Not working"
            
    except Exception as e:
        print(f"   ❌ Evidence analysis error: {str(e)[:50]}")
        results["Evidence Analysis"] = "❌ Error"
    
    # Wait for Railway deployment to fully complete
    print("\n⏱️ Waiting 30 seconds for Railway deployment...")
    time.sleep(30)
    
    return results

def main():
    print("🔍 FULL RETTBOT+ FUNCTIONALITY TEST")
    print("=" * 60)
    print(f"🌐 Testing: https://rettbot.com")
    print(f"⏰ Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Test user registration and login
    auth_token = test_user_registration_and_login()
    
    if auth_token:
        print(f"\n🔑 Using auth token: {auth_token[:20]}...")
    else:
        print("\n⚠️ No auth token - testing without authentication")
    
    # Test all API functions
    results = test_all_api_functions(auth_token)
    
    # Final summary
    print("\n" + "=" * 60)
    print("📊 FINAL RESULTS SUMMARY")
    print("=" * 60)
    
    working = 0
    total = len(results)
    
    for function_name, status in results.items():
        print(f"{status.ljust(25)} {function_name}")
        if "✅" in status:
            working += 1
    
    print("-" * 60)
    print(f"🎯 TOTAL: {working}/{total} functions working")
    
    if working == total:
        print("🎉 ALL FUNCTIONS WORKING PERFECTLY!")
        print("🚀 RettBot+ is 100% operational!")
    elif working >= total * 0.8:
        print("✅ Most functions working great!")
    elif working >= total * 0.5:
        print("⚠️ Some functions need attention")
    else:
        print("❌ Multiple critical issues need fixing")
    
    print(f"⏰ Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

if __name__ == "__main__":
    main()