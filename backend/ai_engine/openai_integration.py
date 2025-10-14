"""
OPENAI API INTEGRATION FOR RETTBOT+

Integrerer GPT-4 for:
1. Bevis-analyse (Evidence Assessment)
2. Legal Research
3. Defense Strategy
4. Document Drafting

Konfigurasjon:
- Trenger kun OPENAI_API_KEY i .env
- Bruker GPT-4-turbo for beste resultater
"""

import os
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime
import json

# OpenAI
from openai import AsyncOpenAI

# Environment
from dotenv import load_dotenv
load_dotenv()


@dataclass
class EvidenceAssessment:
    """AI-vurdering av bevis"""
    relevance: str  # 'critical', 'high', 'medium', 'low', 'irrelevant'
    legal_value: int  # 0-100
    evidence_type: str
    suggested_category: str
    chain_of_custody: List[str]
    potential_issues: List[str]
    recommendations: List[str]
    auto_tags: List[str]
    related_laws: List[str]
    summary: str
    confidence: int  # 0-100


@dataclass
class LegalResearch:
    """Legal research resultater"""
    question: str
    answer: str
    norwegian_laws: List[str]
    echr_cases: List[str]
    precedents: List[str]
    citations: List[str]
    confidence: int
    recommendations: List[str]


@dataclass
class DefenseStrategy:
    """Defense strategy fra AI"""
    primary_theory: str
    weaknesses: List[str]
    alternative_defenses: List[str]
    procedural_challenges: List[str]
    motion_strategy: List[str]
    risk_assessment: Dict[str, any]
    next_steps: List[str]


class OpenAIEngine:
    """OpenAI GPT-4 Integration for RettBot+"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize OpenAI client
        
        Args:
            api_key: OpenAI API key (defaults to env OPENAI_API_KEY)
        """
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError(
                "OPENAI_API_KEY not found! "
                "Set it in .env file or pass as argument."
            )
        
        self.client = AsyncOpenAI(api_key=self.api_key)
        self.model = "gpt-4-turbo-preview"  # Best for legal reasoning
        
    async def analyze_evidence(
        self,
        file_name: str,
        file_type: str,
        file_size: int,
        case_type: str = "criminal",
        additional_context: str = ""
    ) -> EvidenceAssessment:
        """
        AI-analyse av opplastet bevis
        
        Args:
            file_name: Navn på fil
            file_type: MIME type (image/jpeg, video/mp4, etc.)
            file_size: Størrelse i bytes
            case_type: Type sak (criminal, corruption, civil, etc.)
            additional_context: Ekstra kontekst om saken
            
        Returns:
            EvidenceAssessment med AI-vurdering
        """
        
        prompt = f"""Du er en elite norsk advokat som vurderer bevis i en juridisk sak.

BEVIS-INFORMASJON:
- Filnavn: {file_name}
- Type: {file_type}
- Størrelse: {file_size / 1024 / 1024:.2f} MB
- Sakstype: {case_type}
{f"- Kontekst: {additional_context}" if additional_context else ""}

OPPGAVE: Vurder dette beviset juridisk og gi en profesjonell analyse.

Analyser:
1. RELEVANS: Er dette beviset critical, high, medium, low, eller irrelevant?
2. JURIDISK VERDI: Score 0-100 på hvor verdifullt dette beviset er
3. BEVISTYPE: Hva slags bevis er dette? (f.eks. "Fotodokumentasjon av skade", "Videobevis av hendelse")
4. KATEGORI: Hvor skal dette lagres? (bevis, dokumentasjon, korrespondanse, vitne)
5. BEVISKJEDE: Liste krav for chain of custody (oppbevaring, integritet, etc.)
6. POTENSIELLE PROBLEMER: Eventuelle svakheter med beviset (lav kvalitet, uklar dato, etc.)
7. ANBEFALINGER: Hva bør brukeren gjøre med dette beviset?
8. TAGS: 3-5 automatiske tags for organisering
9. RELATERTE LOVER: Hvilke lovparagrafer er relevante? (Straffeprosessloven § X, etc.)
10. SAMMENDRAG: 2-3 setninger oppsummering

Vær SPESIFIKK og PRAKTISK. Gi konkrete råd.

Svar i JSON format:
{{
  "relevance": "critical|high|medium|low|irrelevant",
  "legal_value": 0-100,
  "evidence_type": "...",
  "suggested_category": "bevis|dokumentasjon|korrespondanse|vitne",
  "chain_of_custody": ["...", "..."],
  "potential_issues": ["...", "..."],
  "recommendations": ["...", "..."],
  "auto_tags": ["...", "..."],
  "related_laws": ["Straffeprosessloven § X", "..."],
  "summary": "...",
  "confidence": 0-100
}}
"""
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "Du er en elite norsk advokat med ekspertise i bevisføring og rettsprosess."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,  # Litt kreativitet, men mest presisjon
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        
        return EvidenceAssessment(
            relevance=result['relevance'],
            legal_value=result['legal_value'],
            evidence_type=result['evidence_type'],
            suggested_category=result['suggested_category'],
            chain_of_custody=result['chain_of_custody'],
            potential_issues=result['potential_issues'],
            recommendations=result['recommendations'],
            auto_tags=result['auto_tags'],
            related_laws=result['related_laws'],
            summary=result['summary'],
            confidence=result['confidence']
        )
    
    async def legal_research(
        self,
        question: str,
        case_context: str,
        case_type: str = "criminal"
    ) -> LegalResearch:
        """
        Utfør juridisk research med GPT-4
        
        Args:
            question: Juridisk spørsmål
            case_context: Kontekst om saken
            case_type: Type sak
            
        Returns:
            LegalResearch med svar og kilder
        """
        
        prompt = f"""Du er en elite norsk advokat som utfører juridisk research.

JURIDISK SPØRSMÅL:
{question}

SAKSKONTEKST:
{case_context}

SAKSTYPE: {case_type}

OPPGAVE: Gi et omfattende juridisk forskningsnotat som svarer på spørsmålet.

Inkluder:
1. KLART SVAR: Direkte svar på spørsmålet
2. NORSK LOV: Relevante lover og paragrafer
   - Straffeprosessloven
   - Politiloven
   - Straffeloven
   - Andre relevante lover
3. ECHR/EMK: Relevante menneskerettigheter (Artikkel 6, 8, etc.)
4. RETTSPRAKSIS: Norske domstoler (Høyesterett, Lagmannsrett, Tingrett)
5. SITATER: Spesifikke lovtekster og dommer
6. ANBEFALINGER: Praktiske anbefalinger basert på loven

KRITISK: Hver juridisk påstand MÅ ha spesifikk kilde.
Format: [Lov § Paragraf] eller [Saksnavn, Domstol, År]

Svar i JSON format:
{{
  "answer": "Detaljert svar på spørsmålet...",
  "norwegian_laws": ["Straffeprosessloven § X: ...", "..."],
  "echr_cases": ["EMK Art. X: ...", "..."],
  "precedents": ["HR-YYYY-XXXX: ...", "..."],
  "citations": ["Straffeprosessloven § X", "HR-YYYY-XXXX", "..."],
  "confidence": 0-100,
  "recommendations": ["...", "..."]
}}
"""
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "Du er en elite norsk advokat med dyp kunnskap om norsk lov, EMK, og rettspraksis."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,  # Høy presisjon for legal research
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        
        return LegalResearch(
            question=question,
            answer=result['answer'],
            norwegian_laws=result['norwegian_laws'],
            echr_cases=result['echr_cases'],
            precedents=result['precedents'],
            citations=result['citations'],
            confidence=result['confidence'],
            recommendations=result['recommendations']
        )
    
    async def build_defense_strategy(
        self,
        case_facts: str,
        charges: str,
        evidence: List[str],
        legal_research: Optional[LegalResearch] = None
    ) -> DefenseStrategy:
        """
        Bygg forsvarsstrategi med GPT-4
        
        Args:
            case_facts: Faktum i saken
            charges: Tiltaler/anklager
            evidence: Liste over bevis
            legal_research: Tidligere research (optional)
            
        Returns:
            DefenseStrategy med omfattende strategi
        """
        
        research_context = ""
        if legal_research:
            research_context = f"""
TIDLIGERE JURIDISK RESEARCH:
{legal_research.answer}

RELEVANTE LOVER:
{chr(10).join(legal_research.norwegian_laws)}

RETTSPRAKSIS:
{chr(10).join(legal_research.precedents)}
"""
        
        prompt = f"""Du er en elite norsk forsvarsadvokat kjent for å oppnå frifinnelser i vanskelige saker.

FAKTUM:
{case_facts}

TILTALER:
{charges}

BEVIS:
{chr(10).join(f"- {e}" for e in evidence)}

{research_context}

OPPGAVE: Bygg en omfattende forsvarsstrategi som en toppadvokat ville brukt.

Inkluder:
1. PRIMÆR FORSVARSTEORI
   - Hovedargument for frifinnelse/henleggelse
   - Juridisk grunnlag (spesifikke lover)
   - Faktisk støtte

2. SVAKHETSANALYSE (Aktoratets sak)
   - Hull i påtalens sak
   - Manglende bevis
   - Prosedyrefeil
   - Troverdighetssvakheter

3. ALTERNATIVE FORSVARSLINJER
   - Fallback-posisjoner hvis primær strategi feiler
   - Formildende omstendigheter
   - Subsidiære anførsler

4. PROSEDYREUTFORDRINGER
   - Rettighetsbrudd under etterforskning
   - Ulovlig ransaking/beslag
   - Tvungne forklaringer
   - Beviskjedeproblemer

5. BEGJÆRINGSSTRATEGI
   - Begjæringer å inngi (henleggelse, bevisforkastelse, etc.)
   - Timing og rekkefølge
   - Sannsynlighet for hell

6. RISIKOVURDERING
   - Sannsynlighet for domfellelse (0-100%)
   - Anbefalt tilnærming (rettssak vs. forhandling)
   - Verste/beste/sannsynlige utfall

7. NESTE STEG
   - Konkrete handlinger å ta nå
   - Prioritert rekkefølge

Vær KREATIV, AGGRESSIV og STRATEGISK som toppadvokater.

Svar i JSON format:
{{
  "primary_theory": "...",
  "weaknesses": ["...", "..."],
  "alternative_defenses": ["...", "..."],
  "procedural_challenges": ["...", "..."],
  "motion_strategy": ["...", "..."],
  "risk_assessment": {{
    "conviction_probability": 0-100,
    "recommended_approach": "...",
    "worst_outcome": "...",
    "best_outcome": "...",
    "likely_outcome": "..."
  }},
  "next_steps": ["...", "..."]
}}
"""
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "Du er en elite norsk forsvarsadvokat med erfaring fra Høyesterett og komplekse straffesaker."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.4,  # Litt mer kreativitet for strategi
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        
        return DefenseStrategy(
            primary_theory=result['primary_theory'],
            weaknesses=result['weaknesses'],
            alternative_defenses=result['alternative_defenses'],
            procedural_challenges=result['procedural_challenges'],
            motion_strategy=result['motion_strategy'],
            risk_assessment=result['risk_assessment'],
            next_steps=result['next_steps']
        )
    
    async def draft_legal_document(
        self,
        document_type: str,
        strategy: DefenseStrategy,
        case_details: Dict[str, str]
    ) -> str:
        """
        Generer juridisk dokument
        
        Args:
            document_type: Type dokument (motion, complaint, appeal, etc.)
            strategy: Defense strategy
            case_details: Saksdetaljer (court, case_number, etc.)
            
        Returns:
            Profesjonelt formatert juridisk dokument
        """
        
        prompt = f"""Du er en elite norsk advokat som skriver profesjonelle juridiske dokumenter.

DOKUMENTTYPE: {document_type}

FORSVARSSTRATEGI:
{strategy.primary_theory}

SAKSDETALJER:
- Domstol: {case_details.get('court', 'Tingrett')}
- Saksnummer: {case_details.get('case_number', '[SAKSNR]')}
- Klient: {case_details.get('client_name', '[KLIENT]')}
- Tiltaler: {case_details.get('charges', '[TILTALE]')}

OPPGAVE: Skriv et profesjonelt juridisk dokument for norsk domstol.

KRAV:
1. Følg norsk juridisk format
2. Bruk formelt juridisk språk
3. Siter alle relevante lover og dommer
4. Presenter argumenter overbevisende
5. Forutse og adresser motargumenter
6. Be om spesifikk kjennelse

Dokumentet skal være KOMPLETT og KLAR TIL INNLEVERING.

Inkluder:
- Tittel og partsinformasjon
- Saksnummer og domstol
- Faktum-seksjon
- Rettslig grunnlag
- Argumentasjon
- Påstand
- Underskrift-seksjon
"""
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "Du er en elite norsk advokat som skriver profesjonelle juridiske dokumenter for norske domstoler."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3
        )
        
        return response.choices[0].message.content
    
    async def assess_corruption_case(
        self,
        description: str,
        evidence: List[str],
        parties_involved: List[str]
    ) -> Dict[str, any]:
        """
        Spesiell analyse for korrupsjonssaker
        
        Args:
            description: Beskrivelse av korrupsjon
            evidence: Tilgjengelige bevis
            parties_involved: Involverte parter (politi, etc.)
            
        Returns:
            Analyse med eskaleringsanbefaling
        """
        
        prompt = f"""Du er en ekspert på korrupsjonssaker i Norge, med erfaring fra SEFO og EMD.

BESKRIVELSE AV KORRUPSJON:
{description}

BEVIS:
{chr(10).join(f"- {e}" for e in evidence)}

INVOLVERTE:
{chr(10).join(f"- {p}" for p in parties_involved)}

OPPGAVE: Analyser denne korrupsjonssaken og gi anbefalinger for eskalering.

Analyser:
1. KORRUPSJONSMØNSTER: Hva slags korrupsjon er dette?
2. ALVORLIGHETSGRAD: Hvor alvorlig er dette? (lav, medium, høy, kritisk)
3. BEVISSTYRKE: Er bevisene sterke nok? (svak, medium, sterk)
4. ESKALERINGSANBEFALING: Hvor bør dette rapporteres?
   - Lokal politisjef
   - Politidirektoratet
   - SEFO (Spesialenheten)
   - Riksadvokaten
   - Sivilombudsmannet
   - Stortingets kontroll- og konstitusjonskomite
   - EMD (Europadomstolen)
   - FN Special Rapporteur
5. NESTE STEG: Konkrete handlinger
6. RISIKOVURDERING: Risiko for represalier, fare, etc.
7. SIKKERHETSTILTAK: Hva må gjøres for sikkerhet

Vær KONKRET og HANDLINGSORIENTERT.

Svar i JSON format:
{{
  "corruption_pattern": "...",
  "severity": "lav|medium|høy|kritisk",
  "evidence_strength": "svak|medium|sterk",
  "escalation_path": ["...", "..."],
  "next_steps": ["...", "..."],
  "risk_assessment": {{
    "reprisal_risk": "lav|medium|høy",
    "personal_danger": "lav|medium|høy",
    "case_complexity": "lav|medium|høy"
  }},
  "security_measures": ["...", "..."],
  "recommended_timeline": "..."
}}
"""
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "Du er en ekspert på korrupsjonssaker i Norge med erfaring fra SEFO, EMD og internasjonale anti-korrupsjonsorganisasjoner."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)


# ===== USAGE EXAMPLES =====

async def example_evidence_analysis():
    """Eksempel: Analyser opplastet bevis"""
    
    ai = OpenAIEngine()
    
    assessment = await ai.analyze_evidence(
        file_name="skade_foto.jpg",
        file_type="image/jpeg",
        file_size=2_500_000,  # 2.5 MB
        case_type="criminal",
        additional_context="Bilde av blåmerker etter påstått overfall"
    )
    
    print(f"Relevans: {assessment.relevance}")
    print(f"Juridisk verdi: {assessment.legal_value}/100")
    print(f"Type: {assessment.evidence_type}")
    print(f"Sammendrag: {assessment.summary}")
    print(f"Anbefalinger: {assessment.recommendations}")


async def example_legal_research():
    """Eksempel: Juridisk research"""
    
    ai = OpenAIEngine()
    
    research = await ai.legal_research(
        question="Kan politiet ransake mobilen min uten kjennelse ved trafikkontroll?",
        case_context="Stoppet i trafikkontroll, politiet ba om å se telefon",
        case_type="criminal"
    )
    
    print(f"Svar: {research.answer}")
    print(f"\nRelevante lover:")
    for law in research.norwegian_laws:
        print(f"  - {law}")
    print(f"\nRettspraksis:")
    for case in research.precedents:
        print(f"  - {case}")


async def example_defense_strategy():
    """Eksempel: Bygg forsvarsstrategi"""
    
    ai = OpenAIEngine()
    
    # Først: Legal research
    research = await ai.legal_research(
        question="Kan bevis fra ulovlig ransaking forkastes?",
        case_context="Politiet ransaket telefon uten kjennelse",
        case_type="criminal"
    )
    
    # Deretter: Defense strategy
    strategy = await ai.build_defense_strategy(
        case_facts="Politiet ransaket telefon uten kjennelse under trafikkontroll",
        charges="Brudd på trafikklovgivningen",
        evidence=["Telefonbevis", "Politirapport"],
        legal_research=research
    )
    
    print(f"Primær teori: {strategy.primary_theory}")
    print(f"\nSvakheter i påtalens sak:")
    for w in strategy.weaknesses:
        print(f"  - {w}")
    print(f"\nNeste steg:")
    for step in strategy.next_steps:
        print(f"  - {step}")
    print(f"\nDomfellelse sannsynlighet: {strategy.risk_assessment['conviction_probability']}%")


async def example_corruption_analysis():
    """Eksempel: Analyser korrupsjonssak"""
    
    ai = OpenAIEngine()
    
    analysis = await ai.assess_corruption_case(
        description="Politiet har konsekvent henlagt alle mine anmeldelser uten etterforskning",
        evidence=[
            "5 henleggelser på rad",
            "Ingen avhør gjennomført",
            "Bevis ignorert",
            "Interne emailer viser koordinert innsats"
        ],
        parties_involved=[
            "Lokal politi",
            "Politisjef",
            "Påtalemyndighet"
        ]
    )
    
    print(f"Korrupsjonsmønster: {analysis['corruption_pattern']}")
    print(f"Alvorlighetsgrad: {analysis['severity']}")
    print(f"Bevisstyrke: {analysis['evidence_strength']}")
    print(f"\nEskaleringsanbefaling:")
    for step in analysis['escalation_path']:
        print(f"  → {step}")
    print(f"\nNeste steg:")
    for step in analysis['next_steps']:
        print(f"  - {step}")


if __name__ == "__main__":
    import asyncio
    
    print("=" * 60)
    print("RETTBOT+ OPENAI INTEGRATION - EXAMPLES")
    print("=" * 60)
    
    # Kjør eksempler
    # asyncio.run(example_evidence_analysis())
    # asyncio.run(example_legal_research())
    # asyncio.run(example_defense_strategy())
    # asyncio.run(example_corruption_analysis())
    
    print("\n✅ OpenAI integration klar!")
    print("\nFor å bruke:")
    print("1. Sett OPENAI_API_KEY i .env fil")
    print("2. pip install openai python-dotenv")
    print("3. Import: from openai_integration import OpenAIEngine")
