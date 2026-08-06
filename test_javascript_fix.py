#!/usr/bin/env python3
"""
KRITISK TEST: Verify at JavaScript-feilen er fikset etter typical_penalties format fix
"""
import requests
import json
import time

def test_javascript_fix():
    print("🔥 KRITISK TEST - JAVASCRIPT FEIL FIX")
    print("=" * 60)
    
    # Vent på Railway deployment
    print("⏳ Venter på Railway deployment (45 sekunder)...")
    time.sleep(45)
    
    base_url = "https://rettbot.com"
    
    # Test 1: Backend data format - sjekk at typical_penalties nå er string
    print("\n🔧 1. BACKEND DATA FORMAT TEST")  
    print("-" * 40)
    
    penalties_data = {
        "offense": "narkotika",
        "facts": "Test"
    }
    
    try:
        response = requests.post(f"{base_url}/api/legal/penalties", 
                               json=penalties_data)
        
        if response.status_code == 200:
            data = response.json()
            
            if 'results' in data and data['results']:
                result = data['results'][0]
                typical_penalties = result.get('typical_penalties')
                
                print(f"✅ API Response: SUCCESS (200)")
                print(f"📋 Statute: {result.get('statute', 'MISSING')}")
                print(f"🔍 typical_penalties type: {type(typical_penalties)}")
                print(f"📝 typical_penalties value: {typical_penalties}")
                
                if isinstance(typical_penalties, str):
                    print("✅ FIKSET! typical_penalties er nå en STRING")
                    print("✅ Frontend kan nå kalle .split() uten feil")
                    
                    # Test at string kan splittes (simulate frontend)
                    if '-' in typical_penalties:
                        parts = typical_penalties.split('-')
                        print(f"   → Del 1: {parts[0].strip()}")
                        print(f"   → Del 2: {parts[1].strip()}")
                    else:
                        print(f"   → Ingen '-' å splitte på, men det er OK")
                        
                else:
                    print("❌ IKKE FIKSET! typical_penalties er fortsatt et objekt")
                    print(f"   → Type: {type(typical_penalties)}")
                    print(f"   → Data: {typical_penalties}")
            else:
                print("❌ Ingen resultater i API response")
        else:
            print(f"❌ API feilet: {response.status_code}")
            print(f"   Error: {response.text[:200]}")
            
    except Exception as e:
        print(f"❌ API Exception: {str(e)}")
    
    # Test 2: Test flere offense types
    print("\n🎯 2. ALLE OFFENSE TYPES TEST")
    print("-" * 35)
    
    offense_tests = ["narkotika", "tyveri", "vold", "bedrageri"]
    
    for offense in offense_tests:
        try:
            response = requests.post(f"{base_url}/api/legal/penalties",
                                   json={"offense": offense, "facts": ""})
            
            if response.status_code == 200:
                data = response.json()
                if 'results' in data and data['results']:
                    result = data['results'][0]
                    penalties = result.get('typical_penalties')
                    
                    if isinstance(penalties, str):
                        print(f"✅ {offense.upper()}: STRING format ✓")
                        print(f"   → {penalties[:80]}...")
                    else:
                        print(f"❌ {offense.upper()}: Fortsatt objekt format")
                else:
                    print(f"❌ {offense.upper()}: Ingen resultater")
            else:
                print(f"❌ {offense.upper()}: HTTP {response.status_code}")
                
        except Exception as e:
            print(f"❌ {offense.upper()}: Exception - {str(e)}")
    
    # Test 3: Simulator frontend .split() call
    print("\n🖥️ 3. FRONTEND SPLIT() SIMULATION")
    print("-" * 38)
    
    try:
        response = requests.post(f"{base_url}/api/legal/penalties",
                               json={"offense": "narkotika", "facts": ""})
        
        if response.status_code == 200:
            data = response.json()
            if 'results' in data and data['results']:
                result = data['results'][0]
                typical_penalties = result.get('typical_penalties')
                
                # Simulate exact frontend code
                try:
                    minimum_penalty = typical_penalties.split('-')[0].strip() if '-' in typical_penalties else 'Ingen minimum'
                    maximum_penalty = typical_penalties.split('-')[1].strip() if '-' in typical_penalties else typical_penalties
                    
                    print("✅ FRONTEND SIMULATION: SUCCESS!")
                    print(f"   → Minimum: {minimum_penalty}")
                    print(f"   → Maximum: {maximum_penalty}")
                    print("✅ Ingen JavaScript feil!")
                    
                except Exception as frontend_error:
                    print(f"❌ FRONTEND SIMULATION FAILED: {str(frontend_error)}")
                    print("❌ JavaScript feil ville fortsatt oppstå")
            
    except Exception as e:
        print(f"❌ Frontend simulation exception: {str(e)}")
    
    print("\n" + "=" * 60)
    print("🏁 JAVASCRIPT FEIL TEST RESULTAT")
    print("=" * 60)
    
    print("\n📱 INSTRUKSJONER:")
    print("1. Gå til: https://rettbot.com/penalties")
    print("2. Velg 'Narkotika' eller skriv 'narkotika'")
    print("3. Klikk 'Søk i Straffeloven'")
    print("4. Sjekk browser konsoll (F12) - ingen JavaScript feil!")
    print("5. Du skal se strafferammer uten 'u.typical_penalties.split is not a function' feil")

if __name__ == "__main__":
    test_javascript_fix()