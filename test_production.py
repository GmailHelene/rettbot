#!/usr/bin/env python3
"""
Test RettBot+ Production API
"""
import requests
import json

BASE_URL = "https://rettbot.com"

def test_production_api():
    """Test the production API endpoints"""
    print(f"🚀 Testing RettBot+ Production API: {BASE_URL}")
    
    # Test evidence analysis
    evidence_data = {
        "file_name": "test_evidence.txt",
        "file_type": "text/plain",
        "file_size": 100,
        "description": "Politiet brukte unødvendig makt under pågripelsen. Jeg ble slått med batong selv om jeg ikke gjorde motstand.",
        "case_context": "Voldssak mot politiet", 
        "encrypted_content": "dGVzdA=="
    }
    
    try:
        print("\n🧪 Testing Evidence Analysis...")
        response = requests.post(
            f"{BASE_URL}/api/evidence/analyze",
            json=evidence_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            assessment = result.get('assessment', {})
            print("✅ Evidence Analysis Success!")
            print(f"  - Relevance: {assessment.get('relevance', 'N/A')}")
            print(f"  - Legal Value: {assessment.get('legal_value', 'N/A')}/100")
            print(f"  - Evidence Type: {assessment.get('evidence_type', 'N/A')}")
            print(f"  - Confidence: {assessment.get('confidence', 'N/A')}%")
            print(f"  - Related Laws: {len(assessment.get('related_laws', []))}")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def test_legal_research():
    """Test legal research endpoint"""
    print("\n🧪 Testing Legal Research...")
    try:
        research_data = {
            "query": "Politivoldsak - hvilke rettigheter har jeg?",
            "case_type": "criminal",
            "context": "Politiet brukte unødvendig makt"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/legal/research",
            json=research_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            research = result.get('research', {})
            print("✅ Legal Research Success!")
            print(f"  - Answer length: {len(research.get('answer', ''))}")
            print(f"  - Norwegian laws found: {len(research.get('norwegian_laws', []))}")
            print(f"  - Precedents found: {len(research.get('precedents', []))}")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing RettBot+ Production Deployment\n")
    
    results = []
    results.append(test_production_api())
    results.append(test_legal_research())
    
    print(f"\n📊 Test Results: {sum(results)}/{len(results)} passed")
    if all(results):
        print("🎉 Production API is working!")
    else:
        print("⚠️ Some production tests failed!")