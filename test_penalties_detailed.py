#!/usr/bin/env python3
"""
Test penalties with correct response format
"""
import requests
import json

def test_penalties_correct():
    print("🧪 Testing Penalties Lookup (Correct Format)...")
    
    # Test GET endpoint (what frontend uses)
    url = "https://rettbot.com/api/penalties/lookup"
    params = {"offense": "narkotika", "context": "besittelse av cannabis"}
    
    try:
        response = requests.get(url, params=params)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Penalties Lookup Success!")
            print(f"Full response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            if data.get('results') and len(data['results']) > 0:
                result = data['results'][0]
                print(f"  - Statute: {result.get('statute', 'N/A')}")
                print(f"  - Description: {result.get('description', 'N/A')[:100]}...")
                print(f"  - Penalties: {result.get('typical_penalties', {})}")
            else:
                print("  - No results found in response")
            
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text[:500]}...")
            
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    return False

def test_different_offenses():
    print("\n🧪 Testing Different Offense Types...")
    
    offenses = [
        ("narkotika", "besittelse av cannabis"),
        ("vold", "slåss på bar"),
        ("tyveri", "stjal telefon"),
        ("bedrageri", "falske faktura")
    ]
    
    for offense, context in offenses:
        print(f"\n  Testing: {offense} - {context}")
        url = "https://rettbot.com/api/penalties/lookup"
        params = {"offense": offense, "context": context}
        
        try:
            response = requests.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                if data.get('results'):
                    result = data['results'][0]
                    print(f"    ✅ {result.get('statute', 'N/A')}")
                else:
                    print(f"    ⚠️ No matches for {offense}")
            else:
                print(f"    ❌ Error {response.status_code}")
        except Exception as e:
            print(f"    ❌ Exception: {e}")

if __name__ == "__main__":
    test_penalties_correct()
    test_different_offenses()