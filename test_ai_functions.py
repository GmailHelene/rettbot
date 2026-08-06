#!/usr/bin/env python3
"""
Test legal chat function
"""
import requests
import json

def test_legal_chat():
    print("🧪 Testing Legal Chat...")
    
    url = "https://rettbot.com/api/legal/chat"
    data = {
        "message": "Hva er straffen for besittelse av cannabis i Norge?",
        "conversation_history": []
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Legal Chat Success!")
            print(f"Response: {result.get('response', 'No response')[:200]}...")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text[:500]}...")
            
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    return False

def test_legal_research():
    print("\n🧪 Testing Legal Research...")
    
    url = "https://rettbot.com/api/legal/research"
    data = {
        "query": "narkotikalovbrudd cannabis besittelse",
        "case_type": "criminal",
        "context": "Politiet fant 5 gram cannabis"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Legal Research Success!")
            print(f"Laws found: {len(result.get('norwegian_laws', []))}")
            print(f"Research: {result.get('research_summary', 'No summary')[:150]}...")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text[:500]}...")
            
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    return False

if __name__ == "__main__":
    test_legal_chat()
    test_legal_research()