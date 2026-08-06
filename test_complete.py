#!/usr/bin/env python3
"""
Complete functionality test for RettBot+
"""
import requests
import json
from datetime import datetime

def test_all_functions():
    print("🔍 KOMPLETT FUNKSJONALITETSTEST FOR RETTBOT+")
    print("=" * 60)
    
    base_url = "https://rettbot.com"
    
    tests = {
        "Strafferammer": {
            "url": f"{base_url}/api/penalties/lookup",
            "method": "GET",
            "params": {"offense": "narkotika", "context": "cannabis"}
        },
        "Legal Chat": {
            "url": f"{base_url}/api/legal/chat",
            "method": "POST", 
            "json": {"message": "Hva er straffen for cannabis?", "conversation_history": []}
        },
        "Legal Research": {
            "url": f"{base_url}/api/legal/research",
            "method": "POST",
            "json": {"query": "cannabis lovbrudd", "case_type": "criminal"}
        },
        "Defense Strategy": {
            "url": f"{base_url}/api/defense/strategy", 
            "method": "POST",
            "json": {
                "case_facts": "Funnet med 3 gram cannabis",
                "charges": "Narkotikalovbrudd",
                "evidence": ["Politirapport", "Laboratorieanalyse"]
            }
        },
        "Rights Protection": {
            "url": f"{base_url}/api/rights/violations",
            "method": "POST",
            "json": {
                "situation": "Politi nektet meg besøksforbud",
                "authority": "Politiet"
            }
        },
        "Trial Simulator": {
            "url": f"{base_url}/api/trial/simulate",
            "method": "POST", 
            "json": {
                "case_type": "narkotika",
                "facts": "Funnet med cannabis",
                "evidence": ["Politirapport"],
                "defense_skill": "god",
                "prosecution_skill": "god"
            }
        }
    }
    
    results = {}
    
    for test_name, config in tests.items():
        print(f"\n🧪 Testing {test_name}...")
        
        try:
            if config["method"] == "GET":
                response = requests.get(config["url"], params=config.get("params"))
            else:
                response = requests.post(config["url"], json=config.get("json"))
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                results[test_name] = "✅ FUNGERER"
                
                # Print key info for each endpoint
                if test_name == "Strafferammer":
                    if data.get('results'):
                        print(f"   📋 Fant {len(data['results'])} strafferammer")
                elif test_name == "Legal Chat":
                    response_text = data.get('response', '')
                    print(f"   💬 Svar: {response_text[:100]}...")
                elif test_name == "Legal Research":
                    laws = data.get('norwegian_laws', [])
                    print(f"   📚 Fant {len(laws)} relevante lover")
                elif test_name == "Defense Strategy":
                    strategy = data.get('strategy', '')
                    print(f"   ⚖️ Strategi: {strategy[:100] if strategy else 'Ingen strategi'}...")
                elif test_name == "Rights Protection":
                    recommendations = data.get('recommendations', [])
                    print(f"   🛡️ Anbefalinger: {len(recommendations)} stk")
                elif test_name == "Trial Simulator":
                    verdict = data.get('simulation', {}).get('predicted_outcome', {}).get('verdict', '')
                    print(f"   ⚖️ Simulert utfall: {verdict}")
                    
            else:
                results[test_name] = f"❌ FEIL {response.status_code}"
                error_text = response.text[:200]
                print(f"   Error: {error_text}...")
                
        except Exception as e:
            results[test_name] = f"❌ EXCEPTION"
            print(f"   Exception: {str(e)[:100]}...")
    
    print("\n" + "=" * 60)
    print("📊 SAMMENDRAG AV ALLE FUNKSJONER:")
    print("=" * 60)
    
    working = 0
    total = len(results)
    
    for test_name, status in results.items():
        print(f"{status} {test_name}")
        if "✅" in status:
            working += 1
    
    print(f"\n🎯 RESULTAT: {working}/{total} funksjoner fungerer")
    
    if working == total:
        print("🎉 ALLE FUNKSJONER FUNGERER PERFEKT!")
    elif working > total // 2:
        print("✅ De fleste funksjoner fungerer!")
    else:
        print("⚠️ Flere funksjoner har problemer.")
    
    print(f"\n⏰ Test utført: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    test_all_functions()