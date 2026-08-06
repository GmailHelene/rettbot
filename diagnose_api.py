#!/usr/bin/env python3
"""
Diagnose RettBot+ API Issues
"""
import requests
import json

def test_penalties_lookup():
    """Test the penalties lookup that's failing"""
    print("🧪 Testing Penalties Lookup...")
    try:
        response = requests.get(
            "https://rettbot.com/api/penalties/lookup",
            params={"offense": "narkotika", "context": "besittelse"},
            timeout=30
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def test_all_endpoints():
    """Test all main endpoints to see error patterns"""
    endpoints = [
        ("Evidence Analysis", "/api/evidence/analyze", "POST", {
            "file_name": "test.txt",
            "file_type": "text/plain", 
            "file_size": 100,
            "description": "test",
            "case_context": "test",
            "encrypted_content": "dGVzdA=="
        }),
        ("Legal Research", "/api/legal/research", "POST", {
            "query": "test",
            "case_type": "criminal"
        }),
        ("Defense Strategy", "/api/defense/strategy", "POST", {
            "case_facts": "test",
            "charges": "test",
            "evidence": ["test"]
        }),
        ("Corruption Assessment", "/api/corruption/assess", "POST", {
            "allegations": "test",
            "evidence": ["test"],
            "institutions": ["politi"]
        }),
        ("Penalties Lookup", "/api/penalties/lookup", "GET", None)
    ]
    
    print("🔍 Testing All Endpoints for Error Patterns\n")
    
    for name, url, method, data in endpoints:
        print(f"Testing {name}...")
        try:
            if method == "POST":
                response = requests.post(
                    f"https://rettbot.com{url}",
                    json=data,
                    timeout=30
                )
            else:
                response = requests.get(
                    f"https://rettbot.com{url}",
                    params={"offense": "test"} if "penalties" in url else {},
                    timeout=30
                )
            
            print(f"  Status: {response.status_code}")
            if response.status_code != 200:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                error_msg = error_data.get('error', response.text[:100])
                print(f"  Error: {error_msg}")
            print()
            
        except Exception as e:
            print(f"  Exception: {e}\n")

if __name__ == "__main__":
    test_all_endpoints()