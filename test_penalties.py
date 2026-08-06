#!/usr/bin/env python3
"""
Test penalties lookup specifically
"""
import requests
import json

def test_penalties():
    print("🧪 Testing Penalties Lookup...")
    
    # Test GET endpoint (what frontend uses)
    url = "https://rettbot.com/api/penalties/lookup"
    params = {"offense": "narkotika", "context": "besittelse av cannabis"}
    
    try:
        response = requests.get(url, params=params)
        print(f"GET Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ GET Penalties Lookup Success!")
            print(f"  - Statute: {data.get('statute', 'N/A')}")
            print(f"  - Description: {data.get('description', 'N/A')[:100]}...")
            return True
        else:
            print(f"❌ GET Error: {response.status_code}")
            print(f"Response: {response.text[:500]}...")
            
    except Exception as e:
        print(f"❌ GET Exception: {e}")
    
    # Test POST endpoint
    url_post = "https://rettbot.com/api/legal/penalties"
    data = {"offense": "narkotika", "facts": "besittelse av cannabis"}
    
    try:
        response = requests.post(url_post, json=data)
        print(f"POST Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ POST Penalties Success!")
            print(f"  - Statute: {result.get('statute', 'N/A')}")
            return True
        else:
            print(f"❌ POST Error: {response.status_code}")
            print(f"Response: {response.text[:500]}...")
            
    except Exception as e:
        print(f"❌ POST Exception: {e}")
    
    return False

if __name__ == "__main__":
    test_penalties()