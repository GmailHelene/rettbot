#!/usr/bin/env python3
"""
Komplett sanntidstest av ALLE RettBot+ funksjoner på rettbot.com
Tester hver funksjon med realistiske data for å bekrefte at alt fungerer
"""
import requests
import json
import time
from datetime import datetime

def test_real_website_functions():
    print("🔍 SANNTIDSTEST AV RETTBOT+ FUNKSJONER")
    print("=" * 70)
    print("🌐 Testing på: https://rettbot.com")
    print("⏰ Startet:", datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    print("=" * 70)
    
    base_url = "https://rettbot.com"
    results = {}
    
    # Test 1: Strafferammer (det du prøvde)
    print("\n📋 1. STRAFFERAMMER - Det du prøvde å bruke")
    print("-" * 50)
    
    test_cases = [
        ("narkotika", "besittelse av cannabis", "💊 Narkotikaforbrytelser"),
        ("vold", "slåss på bar", "⚔️ Voldsforbrytelser"), 
        ("tyveri", "stjal telefon", "🔓 Tyverier og ran"),
        ("bedrageri", "falske fakturaer", "💰 Bedrageri og økonomisk kriminalitet")
    ]
    
    strafferammer_ok = 0
    for offense, context, category in test_cases:
        try:
            response = requests.get(f"{base_url}/api/penalties/lookup", 
                                  params={"offense": offense, "context": context})
            if response.status_code == 200:
                data = response.json()
                if data.get('results') and len(data['results']) > 0:
                    result = data['results'][0]
                    statute = result.get('statute', 'Ikke funnet')
                    print(f"   ✅ {category}: {statute}")
                    strafferammer_ok += 1
                else:
                    print(f"   ❌ {category}: Ingen resultater")
            else:
                print(f"   ❌ {category}: HTTP {response.status_code}")
        except Exception as e:
            print(f"   ❌ {category}: Feil - {str(e)[:50]}")
    
    results["Strafferammer"] = f"✅ {strafferammer_ok}/4 fungerer" if strafferammer_ok > 0 else "❌ Fungerer ikke"
    
    # Test 2: Legal Chat 
    print("\n💬 2. LEGAL CHAT - AI Juridisk Assistent")
    print("-" * 50)
    
    chat_questions = [
        "Hva er straffen for cannabis i Norge?",
        "Kan politiet ransake telefonen min?",
        "Hvordan anmelder jeg korrupsjon?",
        "Hva er mine rettigheter ved pågripelse?"
    ]
    
    chat_ok = 0
    for i, question in enumerate(chat_questions, 1):
        try:
            response = requests.post(f"{base_url}/api/legal/chat",
                                   json={"message": question, "conversation_history": []})
            if response.status_code == 200:
                data = response.json()
                answer = data.get('response', '')
                if len(answer) > 50:  # Sjekk at vi får et ordentlig svar
                    print(f"   ✅ Spørsmål {i}: {answer[:80]}...")
                    chat_ok += 1
                else:
                    print(f"   ❌ Spørsmål {i}: Tomt/kort svar")
            else:
                print(f"   ❌ Spørsmål {i}: HTTP {response.status_code}")
        except Exception as e:
            print(f"   ❌ Spørsmål {i}: Feil - {str(e)[:50]}")
    
    results["Legal Chat"] = f"✅ {chat_ok}/4 fungerer" if chat_ok > 0 else "❌ Fungerer ikke"
    
    # Test 3: Legal Research
    print("\n📚 3. LEGAL RESEARCH - Juridisk Forskning") 
    print("-" * 50)
    
    research_queries = [
        ("Besøksforbud avvist", "criminal"),
        ("Politiets ransakingsmyndighet", "criminal"),
        ("Korrupsjon i offentlig sektor", "criminal"),
        ("Rettigheter ved avhør", "criminal")
    ]
    
    research_ok = 0
    for query, case_type in research_queries:
        try:
            response = requests.post(f"{base_url}/api/legal/research",
                                   json={"query": query, "case_type": case_type})
            if response.status_code == 200:
                data = response.json()
                answer = data.get('answer', '')
                laws = data.get('norwegian_laws', [])
                print(f"   ✅ {query}: {len(answer)} tegn svar, {len(laws)} lover")
                research_ok += 1
            else:
                print(f"   ❌ {query}: HTTP {response.status_code}")
        except Exception as e:
            print(f"   ❌ {query}: Feil - {str(e)[:50]}")
    
    results["Legal Research"] = f"✅ {research_ok}/4 fungerer" if research_ok > 0 else "❌ Fungerer ikke"
    
    # Test 4: Defense Strategy
    print("\n⚖️ 4. DEFENSE STRATEGY - Forsvarsstrategi")
    print("-" * 50)
    
    defense_cases = [
        {
            "name": "Cannabis-sak",
            "facts": "Funnet med 3 gram cannabis i lomma",
            "charges": "Narkotikalovbrudd § 231",
            "evidence": ["Politirapport", "Laboratorieanalyse"]
        },
        {
            "name": "Voldssak", 
            "facts": "Påstått slag i selvforsvar",
            "charges": "Legemsbeskadigelse § 271",
            "evidence": ["Vitner", "Legeerklæring", "Videoopptak"]
        }
    ]
    
    defense_ok = 0
    for case in defense_cases:
        try:
            response = requests.post(f"{base_url}/api/defense/strategy",
                                   json={
                                       "case_facts": case["facts"],
                                       "charges": case["charges"], 
                                       "evidence": case["evidence"]
                                   })
            if response.status_code == 200:
                data = response.json()
                strategy = data.get('strategy', '')
                theory = data.get('primary_theory', '')
                print(f"   ✅ {case['name']}: Strategi generert ({len(strategy)} tegn)")
                defense_ok += 1
            else:
                print(f"   ❌ {case['name']}: HTTP {response.status_code}")
        except Exception as e:
            print(f"   ❌ {case['name']}: Feil - {str(e)[:50]}")
    
    results["Defense Strategy"] = f"✅ {defense_ok}/2 fungerer" if defense_ok > 0 else "❌ Fungerer ikke"
    
    # Test 5: Rights Protection
    print("\n🛡️ 5. RIGHTS PROTECTION - Rettighetsbeskyttelse")
    print("-" * 50)
    
    rights_cases = [
        ("Politi nektet besøksforbud", "Politiet"),
        ("Domstol avviste anke", "Tingrett"),
        ("Nektet aktinnsyn", "Politiet"),
        ("Urettmessig pågripelse", "Politiet")
    ]
    
    rights_ok = 0
    for situation, authority in rights_cases:
        try:
            response = requests.post(f"{base_url}/api/rights/violations",
                                   json={"situation": situation, "authority": authority})
            if response.status_code == 200:
                data = response.json()
                remedies = data.get('remedies', [])
                print(f"   ✅ {situation}: {len(remedies)} rettsmidler funnet")
                rights_ok += 1
            else:
                print(f"   ❌ {situation}: HTTP {response.status_code}")
        except Exception as e:
            print(f"   ❌ {situation}: Feil - {str(e)[:50]}")
    
    results["Rights Protection"] = f"✅ {rights_ok}/4 fungerer" if rights_ok > 0 else "❌ Fungerer ikke"
    
    # Test 6: Trial Simulator
    print("\n🎭 6. TRIAL SIMULATOR - Rettssakssimulering")
    print("-" * 50)
    
    trial_cases = [
        {
            "name": "Narkotika-rettssak",
            "case_type": "narkotika",
            "facts": "Funnet med cannabis",
            "evidence": ["Politirapport", "Laboratoriebevis"],
            "defense_skill": "god",
            "prosecution_skill": "god"
        },
        {
            "name": "Vold-rettssak",
            "case_type": "vold", 
            "facts": "Slåss på bar",
            "evidence": ["Vitner", "Videoopptak"],
            "defense_skill": "elite",
            "prosecution_skill": "middels"
        }
    ]
    
    trial_ok = 0
    for case in trial_cases:
        try:
            response = requests.post(f"{base_url}/api/trial/simulate", json=case)
            if response.status_code == 200:
                data = response.json()
                simulation = data.get('simulation', {})
                outcome = simulation.get('predicted_outcome', {})
                verdict = outcome.get('verdict', 'Ukjent')
                print(f"   ✅ {case['name']}: Simulert utfall - {verdict}")
                trial_ok += 1
            else:
                print(f"   ❌ {case['name']}: HTTP {response.status_code}")
        except Exception as e:
            print(f"   ❌ {case['name']}: Feil - {str(e)[:50]}")
    
    results["Trial Simulator"] = f"✅ {trial_ok}/2 fungerer" if trial_ok > 0 else "❌ Fungerer ikke"
    
    # Test 7: Document Generator (hvis tilgjengelig)
    print("\n📄 7. DOCUMENT GENERATOR - Dokumentgenerering")
    print("-" * 50)
    
    try:
        response = requests.post(f"{base_url}/api/legal/document",
                               json={
                                   "document_type": "complaint",
                                   "case_details": {
                                       "court": "Oslo tingrett",
                                       "case_number": "TEST-2025",
                                       "client_name": "Test Klient",
                                       "charges": "Narkotikalovbrudd",
                                       "details": "Test dokument"
                                   }
                               })
        if response.status_code == 200:
            data = response.json()
            document = data.get('document', '')
            print(f"   ✅ Dokument generert: {len(document)} tegn")
            results["Document Generator"] = "✅ Fungerer"
        else:
            print(f"   ❌ HTTP {response.status_code}")
            results["Document Generator"] = "❌ Fungerer ikke"
    except Exception as e:
        print(f"   ❌ Feil: {str(e)[:50]}")
        results["Document Generator"] = "❌ Fungerer ikke"
    
    # Test 8: Corruption Assessment
    print("\n🔍 8. CORRUPTION ASSESSMENT - Korrupsjonsanalyse")
    print("-" * 50)
    
    try:
        response = requests.post(f"{base_url}/api/corruption/assess",
                               json={
                                   "allegations": "Politi henlegger alle mine saker uten etterforskning",
                                   "evidence": ["5 henleggelser", "Ingen avhør", "Ignorerte bevis"],
                                   "institutions": ["Lokalt politi", "Påtalemyndighet"]
                               })
        if response.status_code == 200:
            data = response.json()
            assessment = data.get('assessment', {})
            severity = assessment.get('severity', 'Ukjent')
            print(f"   ✅ Korrupsjonsanalyse: Alvorlighetsgrad {severity}")
            results["Corruption Assessment"] = "✅ Fungerer"
        else:
            print(f"   ❌ HTTP {response.status_code}")
            results["Corruption Assessment"] = "❌ Fungerer ikke"
    except Exception as e:
        print(f"   ❌ Feil: {str(e)[:50]}")
        results["Corruption Assessment"] = "❌ Fungerer ikke"
    
    # Sammendrag
    print("\n" + "=" * 70)
    print("📊 ENDELIG SAMMENDRAG - ALLE RETTBOT+ FUNKSJONER")
    print("=" * 70)
    
    working = 0
    total = len(results)
    
    for function_name, status in results.items():
        print(f"{status.ljust(25)} {function_name}")
        if "✅" in status:
            working += 1
    
    print("-" * 70)
    print(f"🎯 TOTALRESULTAT: {working}/{total} hovedfunksjoner fungerer")
    
    if working == total:
        print("🎉 ALLE FUNKSJONER FUNGERER PERFEKT!")
        print("🚀 RettBot+ er 100% operativ!")
    elif working >= total * 0.8:
        print("✅ De aller fleste funksjoner fungerer utmerket!")
        print("🔧 Kun mindre justeringer nødvendig")
    elif working >= total * 0.5:
        print("⚠️ Hovedfunksjonene fungerer, men noen har problemer")
        print("🛠️ Trenger noe mer arbeid")
    else:
        print("❌ Flere kritiske funksjoner har problemer")
        print("🚨 Trenger umiddelbar oppmerksomhet")
    
    print(f"⏰ Test fullført: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    return results

if __name__ == "__main__":
    test_real_website_functions()