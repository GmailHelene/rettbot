#!/usr/bin/env python3
"""
Test RettBot+ API endpoints
"""
import requests
import json

# Test data for evidence analysis
evidence_data = {
    "file_name": "test_evidence.txt",
    "file_type": "text/plain", 
    "file_size": 100,
    "description": "Politiet brukte unødvendig makt under pågripelsen. Jeg ble slått med batong selv om jeg ikke gjorde motstand.",
    "case_context": "Voldssak mot politiet",
    "encrypted_content": "dGVzdA=="
}

def test_evidence_analysis():
    """Test evidence analysis endpoint"""
    print("🧪 Testing Evidence Analysis...")
    try:
        response = requests.post(
            "http://localhost:8000/api/evidence/analyze",
            json=evidence_data,
            headers={"Content-Type": "application/json"},
            verify=False
        )
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print("✅ Evidence Analysis Success!")
            print(f"Relevance: {result.get('assessment', {}).get('relevance', 'N/A')}")
            print(f"Legal Value: {result.get('assessment', {}).get('legal_value', 'N/A')}")
            print(f"Confidence: {result.get('assessment', {}).get('confidence', 'N/A')}%")
            return True
        else:
            print(f"❌ Error: {response.text}")
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
            "http://localhost:8000/api/legal/research", 
            json=research_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print("✅ Legal Research Success!")
            print(f"Answer length: {len(result.get('research', {}).get('answer', ''))}")
            print(f"Norwegian laws: {len(result.get('research', {}).get('norwegian_laws', []))}")
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def test_defense_strategy():
    """Test defense strategy endpoint"""
    print("\n🧪 Testing Defense Strategy...")
    try:
        strategy_data = {
            "case_facts": "Jeg ble pågrepet av politiet som brukte unødvendig makt. Jeg gjorde ikke motstand, men ble likevel slått med batong.",
            "charges": "Vold mot offentlig tjenestemann (påstått)",
            "evidence": ["Vitneforklaring", "Medisinsk journal", "Video opptak"],
            "legal_research": None
        }
        
        response = requests.post(
            "http://localhost:8000/api/defense/strategy",
            json=strategy_data, 
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print("✅ Defense Strategy Success!")
            print(f"Primary theory length: {len(result.get('strategy', {}).get('primary_theory', ''))}")
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting RettBot+ API Tests\n")
    
    # Test all endpoints
    results = []
    results.append(test_evidence_analysis())
    results.append(test_legal_research())
    results.append(test_defense_strategy())
    
    print(f"\n📊 Test Results: {sum(results)}/{len(results)} passed")
    if all(results):
        print("🎉 All tests passed!")
    else:
        print("⚠️ Some tests failed!")