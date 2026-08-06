#!/usr/bin/env python3
"""
Test frontend-backend communication for penalties
"""
import requests
import json

def test_frontend_backend_communication():
    print("🔍 TESTING FRONTEND-BACKEND COMMUNICATION")
    print("=" * 60)
    
    base_url = "https://rettbot.com"
    
    # Test 1: What frontend actually sends (POST to /api/legal/penalties)
    print("\n📋 1. FRONTEND REQUEST (POST /api/legal/penalties)")  
    print("-" * 50)
    
    frontend_data = {
        "offense": "narkotika",
        "facts": ""
    }
    
    try:
        response = requests.post(f"{base_url}/api/legal/penalties", 
                               json=frontend_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS!")
            print(f"Response keys: {list(data.keys())}")
            if 'results' in data:
                print(f"Results count: {len(data['results'])}")
                if data['results']:
                    print(f"First result: {data['results'][0]}")
        else:
            print("❌ FAILED!")
            print(f"Error response: {response.text[:500]}")
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
    
    # Test 2: Check CORS headers
    print("\n🌐 2. CORS HEADERS CHECK")
    print("-" * 30)
    
    try:
        # Send OPTIONS request (CORS preflight)
        options_response = requests.options(f"{base_url}/api/legal/penalties")
        print(f"OPTIONS Status: {options_response.status_code}")
        print(f"CORS Headers: {dict(options_response.headers)}")
        
        # Check specific CORS headers
        cors_headers = {
            'Access-Control-Allow-Origin': options_response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': options_response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': options_response.headers.get('Access-Control-Allow-Headers'),
        }
        
        for header, value in cors_headers.items():
            print(f"  {header}: {value}")
            
    except Exception as e:
        print(f"❌ CORS TEST FAILED: {str(e)}")
    
    # Test 3: Test with exact frontend request
    print("\n🎯 3. EXACT FRONTEND SIMULATION")
    print("-" * 35)
    
    headers = {
        'Content-Type': 'application/json',
        'Origin': 'https://rettbot.com',
        'Referer': 'https://rettbot.com/penalties'
    }
    
    try:
        response = requests.post(f"{base_url}/api/legal/penalties",
                               json=frontend_data,
                               headers=headers)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ FRONTEND REQUEST WORKS!")
            
            # Check if data matches frontend expectations
            if 'results' in data and data['results']:
                result = data['results'][0]
                print(f"Statute: {result.get('statute', 'MISSING')}")
                print(f"Typical penalties: {result.get('typical_penalties', 'MISSING')}")
                print(f"Severity factors: {len(result.get('severity_factors', []))}")
                print(f"Evidence considerations: {len(result.get('evidence_considerations', []))}")
            else:
                print("⚠️ NO RESULTS IN RESPONSE")
                
        else:
            print("❌ FRONTEND REQUEST FAILED!")
            print(f"Error: {response.text[:300]}")
            
    except Exception as e:
        print(f"❌ FRONTEND SIMULATION FAILED: {str(e)}")
    
    # Test 4: Check if frontend is getting built properly
    print("\n🏗️ 4. FRONTEND BUILD CHECK")
    print("-" * 30)
    
    try:
        # Check if main frontend loads
        response = requests.get(f"{base_url}/")
        print(f"Homepage Status: {response.status_code}")
        
        # Check if penalties page loads
        response = requests.get(f"{base_url}/penalties")
        print(f"Penalties Page Status: {response.status_code}")
        
        if response.status_code == 200:
            content = response.text
            if 'PenaltiesLookup' in content or 'strafferammer' in content.lower():
                print("✅ Penalties page loads correctly")
            else:
                print("⚠️ Penalties page may not be built correctly")
                
    except Exception as e:
        print(f"❌ FRONTEND CHECK FAILED: {str(e)}")

if __name__ == "__main__":
    test_frontend_backend_communication()