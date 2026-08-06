#!/usr/bin/env python3
"""
ENDELIG TEST - Verificer at ALLE RettBot+ funksjoner fungerer efter SPA routing fix
"""
import requests
import time

def test_after_spa_fix():
    print("🎯 ENDELIG TEST - SPA ROUTING FIX")
    print("=" * 60) 
    
    # Vent på Railway deployment (lenger denne gangen)
    print("⏳ Venter på Railway deployment (60 sekunder)...")
    time.sleep(60)
    
    base_url = "https://rettbot.com"
    
    # Test 1: KRITISK - Frontend sider som før ga 404
    print("\n🚨 KRITISK TEST: Frontend SPA Routing")
    print("-" * 50)
    
    spa_routes = [
        "/penalties",        # Hovedproblemet brukeren rapporterte!
        "/legal-research", 
        "/defense-strategy",
        "/evidence-analysis", 
        "/corruption-assessment",
        "/legal-chat",
        "/trial-simulator",
        "/my-cases"
    ]
    
    for route in spa_routes:
        try:
            response = requests.get(f"{base_url}{route}")
            if response.status_code == 200:
                print(f"✅ {route}: 200 - FUNGERER!")
            else:
                print(f"❌ {route}: {response.status_code} - FEIL")
        except Exception as e:
            print(f"❌ {route}: EXCEPTION - {str(e)}")
    
    # Test 2: Penalties funksjon - det brukeren klaget på
    print("\n⚖️ SPESIFIKK PENALTIES TEST (brukerens hovedproblem)")
    print("-" * 55)
    
    penalties_data = {
        "offense": "narkotika",
        "facts": "Besittelse av små mengder"
    }
    
    try:
        response = requests.post(f"{base_url}/api/legal/penalties", 
                               json=penalties_data)
        
        if response.status_code == 200:
            data = response.json()
            print("🎉 PENALTIES API: FUNGERER PERFEKT!")
            
            if 'results' in data and data['results']:
                result = data['results'][0]
                print(f"   📋 Lov: {result.get('statute', 'MANGLER')}")
                penalty = result.get('typical_penalties', {})
                print(f"   ⚖️ Straff: {penalty.get('imprisonment', penalty)}")
                print(f"   📊 Alvorlighetsgrad: {len(result.get('severity_factors', []))} faktorer")
                print(f"   🔍 Bevis: {len(result.get('evidence_considerations', []))} hensyn")
            else:
                print("⚠️ Ingen resultater returnert")
        else:
            print(f"❌ PENALTIES API FEILET: {response.status_code}")
            print(f"   Error: {response.text[:200]}")
            
    except Exception as e:
        print(f"❌ PENALTIES API EXCEPTION: {str(e)}")
    
    # Test 3: Quick test av andre API-er
    print("\n🔧 QUICK API TEST")
    print("-" * 20)
    
    quick_tests = [
        {
            "name": "Legal Research",
            "endpoint": "/api/legal/research", 
            "data": {"query": "tyveri"}
        },
        {
            "name": "Legal Chat",
            "endpoint": "/api/chat",
            "data": {"message": "Hei"}
        }
    ]
    
    for test in quick_tests:
        try:
            response = requests.post(f"{base_url}{test['endpoint']}", 
                                   json=test['data'])
            status = "✅" if response.status_code == 200 else "❌"
            print(f"{status} {test['name']}: {response.status_code}")
        except:
            print(f"❌ {test['name']}: EXCEPTION")
    
    # Test 4: User registration 
    print("\n👤 USER REGISTRATION")
    print("-" * 20)
    
    test_user = {
        "email": f"test_{int(time.time())}@example.com",
        "password": "SecurePass123!",
        "confirm_password": "SecurePass123!"
    }
    
    try:
        response = requests.post(f"{base_url}/api/auth/register", 
                               json=test_user)
        status = "✅" if response.status_code == 200 else "❌"
        print(f"{status} Registration: {response.status_code}")
    except:
        print("❌ Registration: EXCEPTION")
    
    print("\n" + "=" * 60)
    print("🏁 ENDELIG RESULTAT")
    print("=" * 60)
    
    print("\n📱 MANUELLE INSTRUKSJONER TIL BRUKEREN:")
    print("1. Gå til: https://rettbot.com/penalties")
    print("2. Skriv 'narkotika' i søkefeltet")
    print("3. Klikk 'Søk strafferammer'")
    print("4. Du skal nå se:")
    print("   - Straffeloven § 231 (narkotika)")
    print("   - 'Inntil 6 år ved alvorlig omsetning'")
    print("   - Alvorlighetsgrad faktorer")
    print("   - Bevis considerations")
    print("\n🎯 Hvis du fortsatt ser 'Kunne ikke hente straffedata', ")
    print("   så hard-refresh siden (Ctrl+Shift+R)")

if __name__ == "__main__":
    test_after_spa_fix()