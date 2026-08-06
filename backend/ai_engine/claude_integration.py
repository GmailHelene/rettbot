"""
CLAUDE (ANTHROPIC) API-INTEGRASJON FOR RETTBOT+

Bruker Anthropics Claude-modeller for:
1. Bevis-analyse (Evidence Assessment)
2. Juridisk research (Legal Research)
3. Forsvarsstrategi (Defense Strategy)
4. Dokumentgenerering (Document Drafting)
5. Korrupsjonsvurdering (Corruption Assessment)

Konfigurasjon (miljøvariabler):
- ANTHROPIC_API_KEY  (påkrevd) - sett i .env lokalt og i Railway Variables i produksjon
- ANTHROPIC_MODEL    (valgfri) - standard: claude-opus-5
- ANTHROPIC_EFFORT   (valgfri) - low|medium|high|xhigh|max - standard: medium

Nøkkelen leses KUN fra miljøet. Den skal aldri hardkodes i denne fila.
"""

import os
import re
import json
import logging
from typing import List, Dict, Optional, Any
from dataclasses import dataclass

from anthropic import AsyncAnthropic

# Miljøvariabler
from dotenv import load_dotenv
load_dotenv()

# Norsk lovdatabase
from .norwegian_law_db import get_relevant_law_sections, format_law_for_ai

logger = logging.getLogger(__name__)


# ============================================================
# Datastrukturer (uendret kontrakt mot resten av backend)
# ============================================================

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
    weaknesses: List[Dict[str, str]]  # [{issue, impact, mitigation}, ...]
    alternative_defenses: List[str]
    procedural_challenges: List[str]
    motion_strategy: List[str]
    risk_assessment: Dict[str, Any]
    next_steps: List[str]


# ============================================================
# Hjelpere
# ============================================================

def _extract_json(text: str) -> dict:
    """Hent ut et JSON-objekt fra modellsvaret, robust mot kodeblokker/preamble."""
    if not text:
        raise ValueError("Tomt svar fra modellen")
    cleaned = text.strip()
    # Fjern ```json ... ``` kodeblokk hvis den finnes
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned).strip()
    # Klipp til ytterste {...} hvis modellen la til tekst rundt
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        cleaned = cleaned[start:end + 1]
    return json.loads(cleaned)


class ClaudeEngine:
    """Anthropic Claude-integrasjon for RettBot+"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError(
                "ANTHROPIC_API_KEY mangler! Sett den i .env lokalt eller "
                "i Railway Variables i produksjon."
            )
        self.client = AsyncAnthropic(api_key=self.api_key)
        self.model = os.getenv("ANTHROPIC_MODEL", "claude-opus-5")
        self.effort = os.getenv("ANTHROPIC_EFFORT", "medium")

    # -- Lavnivå-kall mot Claude ---------------------------------

    async def _message(
        self,
        system: str,
        prompt: str,
        max_tokens: int = 8000,
    ) -> str:
        """Send en melding til Claude og returner ren tekst.

        Streamer alltid for å unngå timeout ved lange svar og for å
        hente det komplette svaret via get_final_message().
        """
        async with self.client.messages.stream(
            model=self.model,
            max_tokens=max_tokens,
            system=system,
            output_config={"effort": self.effort},
            messages=[{"role": "user", "content": prompt}],
        ) as stream:
            message = await stream.get_final_message()
        return "".join(
            block.text for block in message.content if block.type == "text"
        ).strip()

    async def _message_json(
        self,
        system: str,
        prompt: str,
        max_tokens: int = 8000,
    ) -> dict:
        """Som _message, men tvinger og parser JSON-svar."""
        system_json = (
            system
            + "\n\nVIKTIG: Svar KUN med gyldig JSON-objekt. "
            "Ingen forklaring, ingen innledning, ingen markdown-kodeblokk."
        )
        text = await self._message(system_json, prompt, max_tokens=max_tokens)
        return _extract_json(text)

    # -- Bevis-analyse -------------------------------------------

    async def analyze_evidence(
        self,
        file_name: str,
        file_type: str,
        file_size: int,
        case_type: str = "criminal",
        additional_context: str = "",
    ) -> EvidenceAssessment:
        keywords = [case_type, file_type, additional_context] if additional_context else [case_type, file_type]
        relevant_laws = get_relevant_law_sections(case_type, keywords)
        law_context = format_law_for_ai(relevant_laws)

        prompt = f"""Du er en elite norsk advokat som vurderer bevis i en juridisk sak.

NORSK LOVGRUNNLAG:
{law_context}

BEVIS-INFORMASJON:
- Filnavn: {file_name}
- Type: {file_type}
- Størrelse: {file_size / 1024 / 1024:.2f} MB
- Sakstype: {case_type}
{f"- Kontekst: {additional_context}" if additional_context else ""}

OPPGAVE: Vurder dette beviset juridisk og gi en profesjonell analyse basert på norsk lov.

Analyser:
1. RELEVANS: Er dette beviset critical, high, medium, low, eller irrelevant?
2. JURIDISK VERDI: Score 0-100 på hvor verdifullt dette beviset er
3. BEVISTYPE: Hva slags bevis er dette?
4. KATEGORI: Hvor skal dette lagres? (bevis, dokumentasjon, korrespondanse, vitne)
5. BEVISKJEDE: Liste krav for chain of custody
6. POTENSIELLE PROBLEMER: Eventuelle svakheter med beviset
7. ANBEFALINGER: Hva bør brukeren gjøre med dette beviset?
8. TAGS: 3-5 automatiske tags for organisering
9. RELATERTE LOVER: Hvilke lovparagrafer er relevante?
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

        result = await self._message_json(
            "Du er en elite norsk advokat med ekspertise i bevisføring og rettsprosess.",
            prompt,
        )

        return EvidenceAssessment(
            relevance=result["relevance"],
            legal_value=result["legal_value"],
            evidence_type=result["evidence_type"],
            suggested_category=result["suggested_category"],
            chain_of_custody=result["chain_of_custody"],
            potential_issues=result["potential_issues"],
            recommendations=result["recommendations"],
            auto_tags=result["auto_tags"],
            related_laws=result["related_laws"],
            summary=result["summary"],
            confidence=result["confidence"],
        )

    # -- Juridisk research ---------------------------------------

    async def legal_research(
        self,
        question: str,
        case_context: str,
        case_type: str = "criminal",
    ) -> LegalResearch:
        keywords = question.split() + case_context.split()
        relevant_laws = get_relevant_law_sections(case_type, keywords)
        law_text = format_law_for_ai(relevant_laws)

        prompt = f"""Du er en elite norsk advokat som utfører juridisk research.

JURIDISK SPØRSMÅL:
{question}

SAKSKONTEKST:
{case_context}

SAKSTYPE: {case_type}

NORSK LOVDATABASE:
{law_text}

OPPGAVE: Gi et omfattende juridisk forskningsnotat som svarer på spørsmålet.
Bruk ALLTID den medsendte lovdatabasen som primær kilde.

Inkluder:
1. KLART SVAR basert på norsk lov
2. NORSK LOV: Spesifikke paragrafer med eksakte sitater
3. ECHR/EMK: Relevante menneskerettigheter
4. RETTSPRAKSIS: Høyesterettsdommer og prinsipper
5. PROSESSUELLE RETTIGHETER
6. ANBEFALINGER: Praktiske råd

KRITISK:
- Bruk BARE lover og dommer fra den medsendte databasen
- Hver juridisk påstand MÅ ha spesifikk kilde
- Gi eksakte paragrafhenvisninger og lovtekster

Svar i JSON format:
{{
  "answer": "Detaljert svar med spesifikke lovhenvisninger...",
  "norwegian_laws": ["Straffeprosessloven § 184: [eksakt lovtekst]", "..."],
  "echr_cases": ["EMK Art. 6: [tekst]", "..."],
  "precedents": ["Rt-2017-2043: [sammendrag]", "..."],
  "citations": ["Straffeprosessloven § 184", "EMK Art. 6", "..."],
  "confidence": 0-100,
  "recommendations": ["Spesifikk anbefaling...", "..."]
}}
"""

        result = await self._message_json(
            "Du er en elite norsk advokat med dyp kunnskap om norsk lov, EMK, og rettspraksis.",
            prompt,
        )

        return LegalResearch(
            question=question,
            answer=result["answer"],
            norwegian_laws=result["norwegian_laws"],
            echr_cases=result["echr_cases"],
            precedents=result["precedents"],
            citations=result["citations"],
            confidence=result["confidence"],
            recommendations=result["recommendations"],
        )

    # -- Forsvarsstrategi ----------------------------------------

    async def build_defense_strategy(
        self,
        case_facts: str,
        charges: str,
        evidence: List[str],
        legal_research: Optional[LegalResearch] = None,
    ) -> DefenseStrategy:
        keywords = [case_facts, charges] + evidence
        relevant_laws = get_relevant_law_sections("criminal", keywords)
        law_context = format_law_for_ai(relevant_laws)

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

NORSK LOVGRUNNLAG:
{law_context}

FAKTUM:
{case_facts}

TILTALER:
{charges}

BEVIS:
{chr(10).join(f"- {e}" for e in evidence)}

{research_context}

OPPGAVE: Bygg en omfattende forsvarsstrategi som en toppadvokat ville brukt.

Inkluder primær forsvarsteori, svakhetsanalyse av aktoratets sak, alternative
forsvarslinjer, prosedyreutfordringer, begjæringsstrategi, risikovurdering og neste steg.

Vær KREATIV, AGGRESSIV og STRATEGISK som toppadvokater.

Svar i JSON format:
{{
  "primary_theory": "...",
  "weaknesses": [
    {{"issue": "kort tittel på svakhet i aktoratets sak", "impact": "hvorfor dette svekker påtalen", "mitigation": "hvordan forsvaret utnytter/håndterer den"}}
  ],
  "alternative_defenses": ["...", "..."],
  "procedural_challenges": ["...", "..."],
  "motion_strategy": ["...", "..."],
  "risk_assessment": {{
    "conviction_risk": "Lav | Middels | Høy - med kort begrunnelse",
    "sentencing_range": "forventet strafferamme ved domfellelse",
    "plea_recommendation": "anbefaling: rettssak vs. tilståelse/forhandling, med begrunnelse"
  }},
  "next_steps": ["...", "..."]
}}
"""

        result = await self._message_json(
            "Du er en elite norsk forsvarsadvokat med erfaring fra Høyesterett og komplekse straffesaker.",
            prompt,
        )

        return DefenseStrategy(
            primary_theory=result["primary_theory"],
            weaknesses=result["weaknesses"],
            alternative_defenses=result["alternative_defenses"],
            procedural_challenges=result["procedural_challenges"],
            motion_strategy=result["motion_strategy"],
            risk_assessment=result["risk_assessment"],
            next_steps=result["next_steps"],
        )

    # -- Dokumentgenerering --------------------------------------

    async def draft_legal_document(
        self,
        document_type: str,
        case_details: Dict[str, Any],
        strategy: Optional[str] = None,
        template: Optional[str] = None,
    ) -> str:
        keywords = [document_type] + list(case_details.keys()) + list(case_details.values())
        keywords = [str(k) for k in keywords if k]
        relevant_laws = get_relevant_law_sections("legal", keywords)
        law_context = format_law_for_ai(relevant_laws)

        strategy_section = f"\nFORSVARSSTRATEGI:\n{strategy}\n" if strategy else ""
        template_section = f"\nSPESIELT TEMPLATE:\n{template}\n" if template else ""

        prompt = f"""Du er en elite norsk advokat som skriver profesjonelle juridiske dokumenter.

NORSK LOVGRUNNLAG:
{law_context}

DOKUMENTTYPE: {document_type}
{strategy_section}{template_section}
SAKSDETALJER:
- Domstol: {case_details.get('court', 'Tingrett')}
- Saksnummer: {case_details.get('case_number', '[SAKSNR]')}
- Klient: {case_details.get('client_name', '[KLIENT]')}
- Tiltaler: {case_details.get('charges', '[TILTALE]')}
- Detaljer: {case_details.get('details', 'Ikke oppgitt')}

OPPGAVE: Skriv et profesjonelt juridisk dokument for norsk domstol basert på norsk lov.

KRAV:
1. Følg norsk juridisk format
2. Bruk formelt juridisk språk
3. Siter alle relevante lover og dommer
4. Presenter argumenter overbevisende
5. Forutse og adresser motargumenter
6. Be om spesifikk kjennelse

Dokumentet skal være KOMPLETT og KLAR TIL INNLEVERING, med tittel, partsinformasjon,
saksnummer, domstol, faktum, rettslig grunnlag, argumentasjon, påstand og underskrift-seksjon.
"""

        return await self._message(
            "Du er en elite norsk advokat som skriver profesjonelle juridiske dokumenter for norske domstoler.",
            prompt,
            max_tokens=16000,
        )

    # -- Korrupsjonsvurdering ------------------------------------

    async def assess_corruption_case(
        self,
        allegations: str,
        evidence: List[str],
        institutions: List[str],
        context: str = "",
    ) -> Dict[str, Any]:
        keywords = [allegations] + evidence + institutions + ([context] if context else [])
        relevant_laws = get_relevant_law_sections("criminal", keywords)
        law_context = format_law_for_ai(relevant_laws)

        prompt = f"""Du er en ekspert på korrupsjonssaker i Norge, med erfaring fra SEFO og EMD.

NORSK LOVGRUNNLAG:
{law_context}

BESKYLDNINGER:
{allegations}

BEVIS:
{chr(10).join(f"- {e}" for e in evidence)}

INVOLVERTE INSTITUSJONER:
{chr(10).join(f"- {i}" for i in institutions)}

EKSTRA KONTEKST:
{context if context else "Ingen ekstra kontekst oppgitt."}

OPPGAVE: Analyser denne korrupsjonssaken og gi anbefalinger for eskalering basert på norsk lov.

Analyser korrupsjonsmønster, alvorlighetsgrad, bevisstyrke, eskaleringsanbefaling
(lokal politisjef, Politidirektoratet, SEFO/Spesialenheten, Riksadvokaten, Sivilombudet,
Stortingets kontroll- og konstitusjonskomite, EMD, FN Special Rapporteur), neste steg,
risikovurdering og sikkerhetstiltak.

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

        return await self._message_json(
            "Du er en ekspert på korrupsjonssaker i Norge med erfaring fra SEFO, EMD og internasjonale anti-korrupsjonsorganisasjoner.",
            prompt,
        )

    # -- Enkel oppsummering (chat/bonus-tekst) -------------------

    async def simple_summary(self, prompt: str) -> Optional[str]:
        """Kort punktvis oppsummering som ren tekst. Returnerer None ved feil."""
        try:
            return await self._message(
                "Du er en kortfattet juridisk assistent. Gi korte, konkrete punkter.",
                prompt,
                max_tokens=4000,
            )
        except Exception as exc:  # noqa: BLE001 - bevisst mild fallback
            logger.warning("simple_summary feilet: %s", exc)
            return None


# Bakoverkompatibelt alias (resten av koden brukte tidligere OpenAIEngine)
OpenAIEngine = ClaudeEngine
