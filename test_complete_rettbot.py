#!/usr/bin/env python3
"""
FULLSTENDIG TEST AV RETTBOT+ ETTER FRONTEND-FIX
Test alle funksjoner og verifiser at både backend og frontend fungerer
"""
import requests
import json
import time

def wait_for_deployment():
    """Vent på Railway deployment"""
    print("⏳ Venter på Railway deployment (30 sekunder)...")
    time.sleep(30)

def test_complete_rettbot():
    print("🚀 FULLSTENDIG RETTBOT+ TEST")
    print("=" * 60)
    
    base_url = "https://rettbot.com"
    
    # Test 1: Frontend side tilgjengelige
    print("\n🌐 1. FRONTEND ROUTING TEST")
    print("-" * 40)
    
    pages_to_test = [
        "/",
        "/penalties", 
        "/legal-research",
        "/defense-strategy",
        "/evidence-analysis",
        "/corruption-assessment",
        "/legal-chat",
        "/trial-simulator"
    ]
    
    for page in pages_to_test:
        try:
            response = requests.get(f"{base_url}{page}")
            status = "✅" if response.status_code == 200 else "❌"
            print(f"{status} {page}: {response.status_code}")
        except Exception as e:
            print(f"❌ {page}: FEIL - {str(e)}")
    
    # Test 2: Backend API funksjoner  
    print("\n🔧 2. BACKEND API TEST")
    print("-" * 30)
    
    api_tests = [
        {
            "name": "Penalties Lookup",
            "method": "POST",
            "endpoint": "/api/legal/penalties",
            "data": {"offense": "tyveri", "facts": ""}
        },
        {
            "name": "Legal Research", 
            "method": "POST",
            "endpoint": "/api/legal/research",
            "data": {"query": "tyveri straff"}
        },
        {
            "name": "Defense Strategy",
            "method": "POST", 
            "endpoint": "/api/legal/defense-strategy",
            "data": {"case_type": "tyveri", "facts": "First time offense"}
        },
        {
            "name": "Evidence Analysis",
            "method": "POST",
            "endpoint": "/api/legal/evidence-analysis", 
            "data": {"evidence_type": "document", "description": "Police report"}
        },
        {
            "name": "Legal Chat",
            "method": "POST",
            "endpoint": "/api/chat",
            "data": {"message": "Hva er straffen for tyveri?"}
        }
    ]
    
    for test in api_tests:
        try:
            if test["method"] == "POST":
                response = requests.post(f"{base_url}{test['endpoint']}", 
                                       json=test["data"])
            else:
                response = requests.get(f"{base_url}{test['endpoint']}")
                
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {test['name']}: SUCCESS")
                # Vis hovedresultat
                if 'results' in data and data['results']:
                    print(f"   → {len(data['results'])} resultater")
                elif 'response' in data:
                    print(f"   → Svar: {data['response'][:100]}...")
                elif 'strategy' in data:
                    print(f"   → Strategi: {data['strategy'][:100]}...")
            else:
                print(f"❌ {test['name']}: FEIL ({response.status_code})")
                print(f"   → {response.text[:200]}")
                
        except Exception as e:
            print(f"❌ {test['name']}: EXCEPTION - {str(e)}")
    
    # Test 3: Brukerregistrering
    print("\n👤 3. USER REGISTRATION TEST") 
    print("-" * 35)
    
    test_user = {
        "email": f"test_{int(time.time())}@example.com",
        "password": "SecurePass123!",
        "confirm_password": "SecurePass123!"
    }
    
    try:
        response = requests.post(f"{base_url}/api/auth/register", 
                               json=test_user)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ REGISTRERING: SUCCESS")
            print(f"   → Bruker opprettet: {data.get('message', 'OK')}")
        else:
            print(f"❌ REGISTRERING: FEIL ({response.status_code})")
            print(f"   → {response.text[:200]}")
            
    except Exception as e:
        print(f"❌ REGISTRERING: EXCEPTION - {str(e)}")
    
    # Test 4: Spesifikk penalties test (som bruker rapporterte)
    print("\n🎯 4. SPESIFIKK PENALTIES TEST")
    print("-" * 40)
    
    offense_tests = [
        "narkotika",
        "tyveri", 
        "vold",
        "korrupsjon",
        "dokumentfalsk"
    ]
    
    for offense in offense_tests:
        try:
            response = requests.post(f"{base_url}/api/legal/penalties",
                                   json={"offense": offense, "facts": ""})
            
            if response.status_code == 200:
                data = response.json()
                if 'results' in data and data['results']:
                    result = data['results'][0]
                    print(f"✅ {offense.upper()}:")
                    print(f"   → Lov: {result.get('statute', 'MANGLER')}")
                    penalty = result.get('typical_penalties', {})
                    if penalty.get('imprisonment'):
                        print(f"   → Straff: {penalty['imprisonment']}")
                    else:
                        print(f"   → Straff: {penalty}")
                else:
                    print(f"❌ {offense.upper()}: Ingen resultater")
            else:
                print(f"❌ {offense.upper()}: HTTP {response.status_code}")
                
        except Exception as e:
            print(f"❌ {offense.upper()}: {str(e)}")
    
    print("\n" + "=" * 60)
    print("🏁 TEST FULLFØRT!")
    print("=" * 60)
    
    print("\n📝 HVORDAN TESTE MANUELT:")
    print("1. Gå til https://rettbot.com/penalties")
    print("2. Skriv inn 'narkotika' eller 'tyveri'")
    print("3. Klikk 'Søk strafferammer'")
    print("4. Du skal nå se detaljerte strafferammer!")

if __name__ == "__main__":
    wait_for_deployment()
    test_complete_rettbot()