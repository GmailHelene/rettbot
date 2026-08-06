#!/usr/bin/env python3
"""
Test defense strategy specifically
"""
import requests
import json

def test_defense_strategy():
    print("🧪 Testing Defense Strategy...")
    
    url = "https://rettbot.com/api/defense/strategy"
    data = {
        "case_facts": "Funnet med 3 gram cannabis i lomma",
        "charges": "Narkotikalovbrudd § 231", 
        "evidence": ["Politirapport", "Laboratorieanalyse", "Vitneerklæring"]
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Defense Strategy Success!")
            
            strategy = result.get('strategy', '')
            if strategy:
                print(f"Defense strategy generated: {len(strategy)} characters")
                print(f"Strategy preview: {strategy[:200]}...")
            
            legal_theories = result.get('legal_theories', [])
            print(f"Legal theories: {len(legal_theories)} found")
            
            procedural_challenges = result.get('procedural_challenges', [])
            print(f"Procedural challenges: {len(procedural_challenges)} found")
            
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text[:500]}...")
            
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    return False

if __name__ == "__main__":
    test_defense_strategy()