"""
RettBot+ Backend API
FastAPI REST API for zero-knowledge AI legal assistant
"""

from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv
import logging
from datetime import datetime

# Import AI engine
from backend.ai_engine.openai_integration import OpenAIEngine

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="RettBot+ API",
    description="Zero-knowledge AI legal assistant for Norwegian citizens",
    version="1.0.0"
)

# CORS Configuration
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI Engine
ai_engine = OpenAIEngine()

# ============================================
# Request/Response Models
# ============================================

class EvidenceAnalysisRequest(BaseModel):
    """Request for evidence analysis"""
    file_name: str = Field(..., description="Name of the evidence file")
    file_type: str = Field(..., description="MIME type of file")
    file_size: int = Field(..., description="Size in bytes")
    description: Optional[str] = Field(None, description="User description of evidence")
    case_context: Optional[str] = Field(None, description="Context of the case")
    encrypted_content: str = Field(..., description="Base64 encrypted file content")

class LegalResearchRequest(BaseModel):
    """Request for legal research"""
    query: str = Field(..., description="Legal question to research")
    case_type: Optional[str] = Field(None, description="Type of case (criminal, civil, etc.)")
    context: Optional[str] = Field(None, description="Additional context")
    encrypted_data: Optional[str] = Field(None, description="Encrypted case data")

class DefenseStrategyRequest(BaseModel):
    """Request for defense strategy"""
    case_facts: str = Field(..., description="Facts of the case")
    charges: str = Field(..., description="Criminal charges or allegations")
    evidence: Optional[List[str]] = Field(None, description="List of evidence")
    legal_research: Optional[str] = Field(None, description="Previous research results")
    encrypted_data: Optional[str] = Field(None, description="Encrypted case data")

class LegalDocumentRequest(BaseModel):
    """Request for legal document drafting"""
    document_type: str = Field(..., description="Type of document (motion, complaint, appeal)")
    case_details: Dict[str, Any] = Field(..., description="Case information")
    strategy: Optional[str] = Field(None, description="Defense strategy to incorporate")
    template: Optional[str] = Field(None, description="Specific template to use")

class CorruptionAssessmentRequest(BaseModel):
    """Request for corruption case assessment"""
    allegations: str = Field(..., description="Corruption allegations")
    evidence: List[str] = Field(..., description="Available evidence")
    institutions: List[str] = Field(..., description="Institutions involved")
    context: Optional[str] = Field(None, description="Additional context")

class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: str
    openai_configured: bool


# ============================================
# Rights Protection Module
# ============================================

class RightsViolationQuery(BaseModel):
    """Request to check rights violations and remedies"""
    situation: str = Field(..., description="Description of rights violation or rejected application")
    authority: Optional[str] = Field(None, description="Authority that violated rights (police, court, etc.)")
    context: Optional[str] = Field(None, description="Additional context")

class AppealRequest(BaseModel):
    """Request for appeal/complaint guidance"""
    rejection_type: str = Field(..., description="Type of rejection (besøksforbud, begjæring, etc.)")
    authority: str = Field(..., description="Authority that rejected (politi, tingrett, etc.)")
    facts: str = Field(..., description="Facts of the case")
    rejection_reason: Optional[str] = Field(None, description="Stated reason for rejection")

# Rights Protection Database - handles rejections, violations, and appeals
RIGHTS_PROTECTION_DB = [
    {
        "keywords": ["besøksforbud", "kontaktforbud", "restraining order", "avvist besøksforbud"],
        "situation": "Avvist søknad om besøksforbud",
        "legal_basis": "Straffeprosessloven § 222a (besøksforbud) / Straffeloven § 266 (trusler)",
        "criteria_for_approval": [
            "Det må foreligge en konkret og reell fare for ny straffbar handling",
            "Faren må gjelde fornærmede eller dennes nærmeste",
            "Besøksforbud må være et forholdsmessig tiltak",
            "Det må være sannsynlighetsovervekt for at vilkårene er oppfylt"
        ],
        "common_rejection_reasons": [
            "Ikke konkret nok fare",
            "Mangelfull dokumentasjon av tidligere hendelser",
            "For gammel hendelse (ikke aktuell fare)",
            "Uklart om trusler er reelle eller tomme"
        ],
        "what_strengthens_case": [
            "Politianmeldelse med saksnummer",
            "Dokumenterte trusler (SMS, e-post, opptak)",
            "Vitneerklæringer",
            "Legejournaler ved fysisk vold",
            "Tidligere domfellelser av gjerningsperson",
            "Mønster av trakassering over tid"
        ],
        "appeal_process": {
            "first_step": "Klage til samme myndighet som avslo (politi/påtalemyndighet)",
            "deadline": "3 uker fra vedtak mottatt",
            "next_level": "Statsadvokatembetet (hvis politiet opprettholder avslag)",
            "final_level": "Tingrett (begjæring om domstolsprøving etter § 222a(4))"
        },
        "complaint_template": """
TIL: [Politidistrikt/Statsadvokatembetet]
KLAGE PÅ AVSLAG OM BESØKSFORBUD

Dato: [DATO]
Saksnummer: [SAKSNUMMER]

Jeg viser til vedtak datert [DATO] hvor min søknad om besøksforbud mot [NAVN] ble avslått.

KLAGEGRUNNLAG:
1. Vilkårene i straffeprosessloven § 222a er oppfylt
2. Det foreligger konkret og reell fare for ny straffbar handling
3. Følgende bevis/dokumentasjon er vedlagt:
   - [Liste opp bevis: politianmeldelser, SMS, vitneerklæringer, etc.]

FAKTUM:
[Beskriv hendelsesforløp kronologisk]

RETTSLIGE ANFØRSLER:
- Straffeprosessloven § 222a krever sannsynlighetsovervekt, ikke bevis ut over enhver rimelig tvil
- Faren må vurderes fremadrettet, ikke bare historisk
- [Eventuelle prejudikater fra lignende saker]

BEVIS:
1. Politianmeldelse - [Saksnr/dato]
2. SMS/e-post med trusler - [Dato]
3. Vitneerklæring fra [Navn]
4. [Flere bevis]

PÅSTAND:
Vedtaket oppheves og besøksforbud iverksettes i henhold til § 222a.

[Ditt navn]
[Adresse]
[Kontaktinfo]
        """,
        "additional_remedies": [
            "Søke voldsoffererstatning (Kontoret for voldsoffererstatning)",
            "Be om politibeskyttelse/økt patruljering",
            "Søke midlertidig botilbud (krisesenter)",
            "Anmelde nye hendelser umiddelbart"
        ]
    },
    {
        "keywords": ["politimishandling", "politivold", "urettmessig pågripelse", "politiovergrep"],
        "situation": "Politimishandling eller urettmessig maktbruk",
        "legal_basis": "Politiloven § 6 (maktbruk) / Straffeprosessloven § 171 (pågripelse) / EMK art. 3 (tortur/umenneskelig behandling)",
        "criteria_for_violation": [
            "Maktbruk ut over det som er nødvendig og forsvarlig",
            "Pågripelse uten lovlig grunnlag (§ 171)",
            "Umenneskelig eller nedverdigende behandling (EMK art. 3)",
            "Rasistiske eller diskriminerende motiver"
        ],
        "what_strengthens_complaint": [
            "Legedokumentasjon av skader innen 24 timer",
            "Videoopptak fra mobil/kroppskamera",
            "Vitner til hendelsen",
            "Politirapport som motsier seg selv",
            "Tidligere klager mot samme polititjenesteperson",
            "Overvåkningskamera fra området"
        ],
        "complaint_process": {
            "first_step": "Anmeldelse til Spesialenheten for politisaker (innen rimelig tid)",
            "contact": "tips@spesialenheten.no / 23 29 22 00",
            "what_they_investigate": "Straffbare forhold begått av politi/påtalemyndighet",
            "timeline": "Spesialenheten skal beslutte påtale innen rimelig tid",
            "parallel_track": "Sivilrettslig erstatningskrav (Staten v/Justisdepartementet)"
        },
        "complaint_template": """
TIL: Spesialenheten for politisaker
E-post: tips@spesialenheten.no

ANMELDELSE AV POLITIMISHANDLING

Dato: [DATO]
Anmelder: [DITT NAVN]
Fødselsnr: [FØDSELSNR]

ANMELDTE FORHOLD:
Jeg anmelder [politidistrikt/navn på tjenesteperson hvis kjent] for:
- Ulovlig maktbruk i strid med politiloven § 6
- [Eventuelt: Legemskrenkelse etter straffeloven § 271]
- [Eventuelt: Brudd på EMK art. 3]

HENDELSESFORLØP:
Dato/tid: [NØYAKTIG TIDSPUNKT]
Sted: [NØYAKTIG ADRESSE]
[Detaljert kronologisk beskrivelse]

BEVIS:
1. Legejournal fra [sykehus] - vedlagt
2. Videoopptak - vedlagt/tilgjengelig på forespørsel
3. Vitne: [Navn, kontaktinfo]
4. [Flere bevis]

Jeg ber om at forholdet etterforskes og at det tas ut tiltale hvis vilkårene er oppfylt.

[Ditt navn]
[Kontaktinfo]
        """,
        "additional_remedies": [
            "Be om innsyn i politiets rapporter (§ 242)",
            "Kontakte Sivilombudet (hvis systemisk problem)",
            "Dokumentere alt skriftlig til advokat",
            "Erstatningssøksmål mot Staten"
        ]
    },
    {
        "keywords": ["dommeravvisning", "korrupt dommer", "inhabil dommer", "feil dom"],
        "situation": "Inhabil eller korrupt dommer / feil rettsanvendelse",
        "legal_basis": "Domstolloven § 106-108 (inhabilitet) / Straffeprosessloven kap. 29 (anke)",
        "grounds_for_disqualification": [
            "Personlig interesse i sakens utfall (§ 106)",
            "Nær relasjon til part eller advokat (§ 107)",
            "Tidligere uttalt seg om saken utenfor rettsalen",
            "Partiskhet eller mistanke om det (§ 108)"
        ],
        "what_strengthens_complaint": [
            "Dokumentasjon av dommerens forbindelser til motpart",
            "Sosiale medier-poster som viser bias",
            "Tidligere saker hvor samme dommer viste samme bias",
            "Uttalelser fra dommer som viser forutinntatthet",
            "Eierinteresser eller økonomiske forbindelser"
        ],
        "remedies": {
            "during_trial": "Fremsette inhabilitetsinnsigelse umiddelbart (§ 109) - dommer avgjør selv først, kan ankes",
            "after_judgment": "Anke dommen (straffesaker: kap. 29, sivile: tvisteloven kap. 29)",
            "corrupt_judge": "Anmelde til Spesialenheten (hvis straffbart) + tilsynsutvalget for dommere",
            "appeal_deadline": "Anke: 2 uker fra dom (strafferett) / 4 uker (sivilrett)"
        },
        "appeal_template": """
TIL: [Lagmannsrett/Høyesterett]
ANKE OVER DOM

Ankende part: [DITT NAVN]
Tingrettens dom: [SAKSNUMMER, DATO]

ANKEGRUNNLAG:
1. Feil rettsanvendelse - [spesifiser paragraf]
2. Saksbehandlingsfeil - [spesifiser]
3. [Eventuelt: Inhabilitet hos dommer]

ANFØRSLER:
[Detaljert gjennomgang av hva tingretten gjorde feil]

BEVISTILBUD:
[Liste over bevis som skal fremlegges]

PÅSTAND:
Tingrettens dom oppheves. [Ny påstand].

[Navn]
[Advokatfullmakt hvis relevant]
        """,
        "additional_info": [
            "Inhabilitet kan også føre til opphevelse av dom",
            "Domstolsadministrasjonen har tilsynsansvar",
            "Kontakt advokatorganisasjon for hjelp til anke"
        ]
    },
    {
        "keywords": ["aktinnsyn nektet", "innsyn avslått", "offentlighetsloven", "nektet dokumenter"],
        "situation": "Nektet aktinnsyn eller dokumenter fra det offentlige",
        "legal_basis": "Offentlighetsloven § 3 (innsynsrett) / Straffeprosessloven § 242 (innsyn i straffesaker)",
        "your_rights": [
            "Hovedregel: Alle dokumenter er offentlige (offentlighetsloven § 3)",
            "I straffesaker: Mistenkte/siktet har rett til innsyn i sakens dokumenter (§ 242)",
            "Unntak må begrunnes konkret (ikke bare henvisning til paragraf)"
        ],
        "common_illegal_rejections": [
            "Generell henvisning til 'hensyn til etterforskningen' uten konkret begrunnelse",
            "Nekting av innsyn i egne forklaringer",
            "Påstand om 'unntatt etter fvl § 13' uten reell vurdering",
            "Forsinkelse av innsyn uten saklig grunn"
        ],
        "how_to_appeal": {
            "step_1": "Klage til organet som avslo (innen 3 uker)",
            "step_2": "Hvis opprettholdt: Klage sendes videre til overordnet organ",
            "step_3": "Sivilombudet kan klages til hvis langvarig behandling",
            "final_remedy": "Domstolsprøving (søksmål mot Staten)"
        },
        "complaint_template": """
TIL: [Politidistrikt/Departement]
KLAGE PÅ AVSLAG OM AKTINNSYN

Dato: [DATO]
Saksnummer: [SAKSNR]

Jeg viser til vedtak av [DATO] hvor min begjæring om innsyn i [spesifiser dokumenter] ble avslått.

KLAGEGRUNNLAG:
1. Avslaget er i strid med offentlighetsloven § 3 / straffeprosessloven § 242
2. Unntaksadgangen er ikke konkret begrunnet
3. Mitt behov for innsyn veier tyngre enn eventuelle hensyn

ANFØRSLER:
- Hovedregelen er offentlighet, unntak må begrunnes konkret
- [Spesifiser hvorfor begrunnelsen er mangelfull]
- Jeg har saklig behov for dokumentene til [formål]

PÅSTAND:
Innsynsbegjæringen tas til følge. Dokumentene utleveres innen [frist].

[Navn]
[Kontaktinfo]
        """
    }
]


# ============================================
# Trial Simulator Module
# ============================================

class TrialSimulationRequest(BaseModel):
    """Request to simulate a trial"""
    case_type: str = Field(..., description="Type of case: narkotika, vold, tyveri, bedrageri, etc.")
    facts: str = Field(..., description="Facts of the case")
    evidence: List[str] = Field(..., description="Available evidence")
    defense_skill: str = Field("god", description="Defense lawyer skill: dårlig, middels, god, elite")
    prosecution_skill: str = Field("god", description="Prosecution skill: dårlig, middels, god, elite")
    perspective: str = Field("defense", description="Perspective: defense or prosecution")
    include_witnesses: bool = Field(True, description="Include witness testimonies")
    include_cross_examination: bool = Field(True, description="Include cross-examination simulation")


# Trial simulation templates with skill-based strategies
TRIAL_STRATEGIES = {
    "dårlig": {
        "defense": {
            "opening": "Generisk åpningsinnlegg uten spesifikk strategi",
            "evidence_handling": "Presenterer bevis uten klar struktur eller sammenheng",
            "cross_exam": "Stiller enkle ja/nei spørsmål uten oppfølging",
            "closing": "Oppsummerer fakta uten overbevisende argumentasjon",
            "weaknesses": ["Glemmer viktige bevis", "Følger ikke opp vitner", "Ingen klar teori om saken"]
        },
        "prosecution": {
            "opening": "Leser opp siktelsen uten kontekst",
            "evidence_handling": "Presenterer bevis i tilfeldig rekkefølge",
            "cross_exam": "Spør ledende spørsmål som styrker forsvaret",
            "closing": "Gjentar kun påstander uten bevis",
            "weaknesses": ["Beviskjeden er uklar", "Motsetninger i vitneutsagn", "Svak bevisbyrde"]
        }
    },
    "middels": {
        "defense": {
            "opening": "Presenterer forsvarets teori med noe struktur",
            "evidence_handling": "Kategoriserer bevis i for/mot",
            "cross_exam": "Stiller målrettede spørsmål med delvis oppfølging",
            "closing": "Oppsummerer med fokus på rimelig tvil",
            "strengths": ["Finner noen hull i påtalemyndighetens sak", "Presenterer alternative teorier"]
        },
        "prosecution": {
            "opening": "Presenterer saken med kronologisk fremstilling",
            "evidence_handling": "Bygger beviskjede med noe logikk",
            "cross_exam": "Utfordrer troverdighet til forsvarsvitner",
            "closing": "Argumenterer for skyld basert på beviser",
            "strengths": ["Klar beviskjede", "Konsistent narrativ"]
        }
    },
    "god": {
        "defense": {
            "opening": "Skaper tvil umiddelbart med kraftfull åpning",
            "evidence_handling": "Strategisk presentasjon med timeline og sammenhenger",
            "cross_exam": "Metodisk nedbrytning av påtalens vitner",
            "closing": "Emosjonelt og logisk appellerende avslutning",
            "strengths": ["Finner prosedyrefeil", "Utfordrer beviskjeden", "Presenterer alternativ teori med bevis"]
        },
        "prosecution": {
            "opening": "Forteller en overbevisende historie med emosjonell appell",
            "evidence_handling": "Bygger ubrytelig beviskjede med kriminalteknikk",
            "cross_exam": "Avdekker løgner og motsetninger hos siktede",
            "closing": "Viser at bevisene ikke etterlater rimelig tvil",
            "strengths": ["Sterk beviskjede", "Troverdige vitner", "Kriminaltekniske bevis"]
        }
    },
    "elite": {
        "defense": {
            "opening": "Fremsetter frigjørende teori med umiddelbar kraft - 'Klienten er uskyldig fordi...'",
            "evidence_handling": "Omvender påtalens bevis til forsvarets fordel - 'Dette beviser faktisk det motsatte'",
            "cross_exam": "Ødelegger påtalens nøkkelvitner med kirurgisk presisjon",
            "closing": "Retorisk mesterlig - kombinerer følelser, logikk og jus perfekt",
            "elite_tactics": [
                "Angriper beviskjeden: 'Politiet brøt § 171 - bevisene er ulovlige'",
                "Prosedyrefeil: 'Tiltalte ble ikke lest rettigheter - alt må forkastes'",
                "Alternativ gjerningsperson: 'Bevisene peker faktisk på X, ikke klienten'",
                "Vitnetroverdighetskollaps: 'Dette vitnet har løyet 3 ganger under ed'",
                "Ekspertkritikk: 'DNA-analysen er gjort feil - vi har motekspert'"
            ],
            "strengths": ["Finner alle prosedyrefeil", "Omvender påtalens styrke til svakhet", "Skaper rimelig tvil fra ingenting"]
        },
        "prosecution": {
            "opening": "Forteller en ugjendrivelig historie støttet av vitenskap og vitner",
            "evidence_handling": "Bygger flere uavhengige beviskjeder - 'Selv uten X, har vi Y og Z'",
            "cross_exam": "Lar tiltalte avsløre seg selv gjennom velformulerte spørsmål",
            "closing": "Beviser skyld ut over enhver rimelig tvil med overveldende bevis",
            "elite_tactics": [
                "Redundante beviskjeder: DNA + vitner + video + digitale spor",
                "Forhåndsmotvirker forsvarets argumenter: 'Forsvaret vil si X, men...'",
                "Ekspertbevis: Kriminaltekniker, psykologer, leger bekrefter skyld",
                "Tilståelse eller damaging statements: 'Tiltalte sa til politiet: ...'",
                "Mønsterbevis: 'Dette er 5. gang tiltalte gjør akkurat dette'"
            ],
            "strengths": ["Ubrytelig beviskjede", "Flere uavhengige bevis", "Forhåndsmotvirker alle forsvarsmotiver"]
        }
    }
}


# ============================================
# Penalties DB (minimal, deterministic dataset)
# ============================================
class PenaltyQuery(BaseModel):
    """Request to get penalties for a given offense"""
    offense: str = Field(..., description="Free-text offense name or statute reference")
    facts: Optional[str] = Field(None, description="Short facts to help contextualize severity")


# Minimal mapping: offense keywords -> statutes and typical penalty ranges
PENALTIES_DB = [
    {
        "keywords": ["narkotika", "drug", "drugs", "narkotisk"],
        "statute": "Straffeloven § 231 (narkotika) / narkotikalovgivning",
        "description": "Besittelse, innførsel eller omsetning av narkotika.",
        "typical_penalties": {
            "fine": "Mulig for mindre mengder (bøter)",
            "imprisonment": "Inntil 6 år ved alvorlig omsetning; kortere ved besittelse",
            "notes": "Avhenger av mengde, type stoff og omhandlede omsetningsledd"
        },
        "severity_factors": ["mengde", "handlemåte", "tidligere dommer"],
        "evidence_considerations": ["vekt av stoffet", "laboratoriumsrapporter", "vitneobservasjoner", "transaksjonsdata"]
    },
    {
        "keywords": ["vold", "physical assault", "legemsbeskadigelse"],
        "statute": "Straffeloven § 271 (legemsbeskadigelse) og §§ 272-273",
        "description": "Fysisk angrep som fører til skade eller fare for skade.",
        "typical_penalties": {
            "fine": "Mulig ved mindre hendelser",
            "imprisonment": "Inntil 6 år for alvorlig vold; 1-3 år typisk for grovere tilfeller",
            "notes": "Skadens omfang og bruk av våpen øker straffutmålingen"
        },
        "severity_factors": ["skadens alvor", "bruk av våpen", "forsett eller uaktsomhet"],
        "evidence_considerations": ["legejournaler", "vitneforklaringer", "videoopptak", "fornærmedes forklaring"]
    },
    {
        "keywords": ["tyveri", "theft", "innbrudd", "klepto"],
        "statute": "Straffeloven §§ 311-316 (tyveri og innbrudd)",
        "description": "Ulovlig tilegnelse av andres eiendom.",
        "typical_penalties": {
            "fine": "Bøter vanlig for småverdier",
            "imprisonment": "Inntil 6 år ved grovt tyveri eller innbrudd",
            "notes": "Verdien av det som er stjålet og tidligere forhold påvirker straffens lengde"
        },
        "severity_factors": ["verdi", "bruk av makt", "tidligere forhold"],
        "evidence_considerations": ["kvitteringer", "overvåkingsvideo", "fingeravtrykk", "vitner"]
    },
    {
        "keywords": ["bedrageri", "fraud", "svindel"],
        "statute": "Straffeloven §§ 371-372 (bedrageri)",
        "description": "Åvilling bedrageri for økonomisk vinning.",
        "typical_penalties": {
            "fine": "Bøter typisk ved mindre beløp",
            "imprisonment": "Inntil 6 år ved grovt bedrageri",
            "notes": "Beløpets størrelse og systematisk misbruk øker straffen"
        },
        "severity_factors": ["økonomisk skade", "systematikk", "samarbeid med andre"],
        "evidence_considerations": ["banktransaksjoner", "kontrakter", "e-poster", "vitneforklaringer"]
    }
]



# ============================================
# API Endpoints
# ============================================

@app.get("/", response_model=HealthCheckResponse)
async def root():
    """Root endpoint - health check"""
    return HealthCheckResponse(
        status="online",
        timestamp=datetime.utcnow().isoformat(),
        openai_configured=bool(os.getenv("OPENAI_API_KEY"))
    )

@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "openai": bool(os.getenv("OPENAI_API_KEY")),
            "api": True,
            "database": False,  # TODO: Add database check
            "redis": False  # TODO: Add Redis check
        },
        "version": "1.0.0"
    }

@app.post("/api/evidence/analyze")
async def analyze_evidence(request: EvidenceAnalysisRequest):
    """
    Analyze uploaded evidence using AI
    
    Note: File content should be encrypted on client-side.
    Server only sees encrypted data (zero-knowledge architecture).
    """
    try:
        logger.info(f"Analyzing evidence: {request.file_name} ({request.file_type})")
        
        # In zero-knowledge mode, we work with encrypted data
        # For demo, we'll analyze based on metadata
        # In production, client would decrypt locally, send to AI, re-encrypt results
        
        assessment = await ai_engine.analyze_evidence(
            file_name=request.file_name,
            file_type=request.file_type,
            description=request.description or "",
            case_context=request.case_context or ""
        )
        
        return {
            "success": True,
            "assessment": {
                "relevance": assessment.relevance,
                "legal_value": assessment.legal_value,
                "evidence_type": assessment.evidence_type,
                "suggested_category": assessment.suggested_category,
                "chain_of_custody": assessment.chain_of_custody,
                "potential_issues": assessment.potential_issues,
                "recommendations": assessment.recommendations,
                "auto_tags": assessment.auto_tags,
                "related_laws": assessment.related_laws,
                "summary": assessment.summary,
                "confidence": assessment.confidence
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error analyzing evidence: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/legal/research")
async def legal_research(request: LegalResearchRequest):
    """
    Perform legal research using AI
    
    Searches Norwegian law, ECHR cases, precedents
    """
    try:
        logger.info(f"Legal research query: {request.query[:100]}...")
        
        research = await ai_engine.legal_research(
            query=request.query,
            case_type=request.case_type,
            context=request.context or ""
        )
        
        return {
            "success": True,
            "research": {
                "answer": research.answer,
                "norwegian_laws": research.norwegian_laws,
                "echr_cases": research.echr_cases,
                "precedents": research.precedents,
                "citations": research.citations,
                "confidence": research.confidence,
                "recommendations": research.recommendations
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in legal research: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Research failed: {str(e)}")

@app.post("/api/defense/strategy")
async def build_defense_strategy(request: DefenseStrategyRequest):
    """
    Build comprehensive defense strategy using AI
    
    Analyzes case facts, charges, evidence to create multi-layered defense
    """
    try:
        logger.info(f"Building defense strategy for charges: {request.charges[:100]}...")
        
        strategy = await ai_engine.build_defense_strategy(
            case_facts=request.case_facts,
            charges=request.charges,
            evidence=request.evidence or [],
            legal_research=request.legal_research
        )
        
        return {
            "success": True,
            "strategy": {
                "primary_theory": strategy.primary_theory,
                "weaknesses": strategy.weaknesses,
                "alternative_defenses": strategy.alternative_defenses,
                "procedural_challenges": strategy.procedural_challenges,
                "motion_strategy": strategy.motion_strategy,
                "risk_assessment": strategy.risk_assessment,
                "next_steps": strategy.next_steps
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error building defense strategy: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Strategy generation failed: {str(e)}")

@app.post("/api/legal/document")
async def draft_legal_document(request: LegalDocumentRequest):
    """
    Draft professional legal documents
    
    Generates motions, complaints, appeals, briefs
    """
    try:
        logger.info(f"Drafting {request.document_type} document")
        
        document = await ai_engine.draft_legal_document(
            document_type=request.document_type,
            case_details=request.case_details,
            strategy=request.strategy,
            template=request.template
        )
        
        return {
            "success": True,
            "document": {
                "type": request.document_type,
                "content": document,
                "metadata": {
                    "created": datetime.utcnow().isoformat(),
                    "case_number": request.case_details.get("case_number"),
                    "court": request.case_details.get("court")
                }
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error drafting document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Document drafting failed: {str(e)}")

@app.post("/api/corruption/assess")
async def assess_corruption_case(request: CorruptionAssessmentRequest):
    """
    Assess corruption case and recommend escalation path
    
    Analyzes systematic corruption patterns and suggests 8-level escalation
    """
    try:
        logger.info(f"Assessing corruption case involving: {', '.join(request.institutions)}")
        
        assessment = await ai_engine.assess_corruption_case(
            allegations=request.allegations,
            evidence=request.evidence,
            institutions=request.institutions,
            context=request.context or ""
        )
        
        return {
            "success": True,
            "assessment": assessment,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error assessing corruption case: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Corruption assessment failed: {str(e)}")


@app.post("/api/legal/penalties")
async def legal_penalties(request: PenaltyQuery):
    """
    Return likely statutes and penalty ranges for a given offense (heuristic).
    This is a deterministic helper to give users an overview of possible fines/prison ranges
    and what evidence increases/decreases the likely severity.
    """
    try:
        query = (request.offense or "").lower()
        facts = (request.facts or "")

        # Find matches by keyword
        matches = []
        for entry in PENALTIES_DB:
            for kw in entry["keywords"]:
                if kw in query:
                    matches.append(entry)
                    break

        # If no matches, try fuzzy contain of main words
        if not matches:
            for entry in PENALTIES_DB:
                for kw in entry["keywords"]:
                    if kw.split()[0] in query:
                        matches.append(entry)
                        break

        # Build response
        results = []
        for m in matches:
            item = {
                "statute": m["statute"],
                "description": m["description"],
                "typical_penalties": m["typical_penalties"],
                "severity_factors": m["severity_factors"],
                "evidence_considerations": m["evidence_considerations"]
            }

            # Basic heuristic: if facts mention "store mengder" or numbers, escalate
            if "mengde" in facts or any(c.isdigit() for c in facts):
                item["note"] = "Fakta indikerer potensielt høyere alvorlighetsgrad - mengde eller tall funnet i fakta."

            results.append(item)

        if not results:
            return {"success": True, "results": [], "message": "Ingen direkte treff i lokal DB. Vennligst prøv mer spesifikk lovtekst eller beskrivelse."}

        # Optional: Enrich with AI (non-blocking; fallback to deterministic)
        ai_summary = None
        try:
            if ai_engine and os.getenv("OPENAI_API_KEY"):
                prompt = f"Given the following offense query: '{request.offense}' and facts: '{facts}', summarize likely penalties and key evidence factors under Norwegian law in short bullet points."
                ai_summary = await ai_engine.simple_summary(prompt)
        except Exception:
            ai_summary = None

        return {
            "success": True,
            "results": results,
            "ai_summary": ai_summary,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Error computing penalties: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Penalty lookup failed: {str(e)}")


@app.post("/api/rights/violations")
async def check_rights_violations(request: RightsViolationQuery):
    """
    Check if user's rights have been violated and what remedies are available.
    Covers: rejected applications (besøksforbud), police misconduct, judicial bias, denied access to documents.
    """
    try:
        query = (request.situation or "").lower()
        authority = (request.authority or "").lower()
        context = (request.context or "")

        # Find matches by keyword
        matches = []
        for entry in RIGHTS_PROTECTION_DB:
            for kw in entry["keywords"]:
                if kw in query:
                    matches.append(entry)
                    break

        # Build response
        results = []
        for m in matches:
            item = {
                "situation": m["situation"],
                "legal_basis": m["legal_basis"],
                "what_strengthens_case": m.get("what_strengthens_case", m.get("what_strengthens_complaint", [])),
                "appeal_process": m.get("appeal_process", m.get("complaint_process", m.get("remedies", {}))),
                "additional_info": m.get("additional_remedies", m.get("additional_info", []))
            }

            # Add specific criteria if available
            if "criteria_for_approval" in m:
                item["criteria_for_approval"] = m["criteria_for_approval"]
            if "common_rejection_reasons" in m:
                item["common_rejection_reasons"] = m["common_rejection_reasons"]
            if "criteria_for_violation" in m:
                item["criteria_for_violation"] = m["criteria_for_violation"]
            if "grounds_for_disqualification" in m:
                item["grounds_for_disqualification"] = m["grounds_for_disqualification"]
            if "your_rights" in m:
                item["your_rights"] = m["your_rights"]
            if "common_illegal_rejections" in m:
                item["common_illegal_rejections"] = m["common_illegal_rejections"]
            if "how_to_appeal" in m:
                item["how_to_appeal"] = m["how_to_appeal"]

            results.append(item)

        if not results:
            # Fallback: generic rights guidance
            return {
                "success": True,
                "results": [],
                "generic_guidance": {
                    "message": "Ingen spesifikk treff i database. Generelle rettigheter:",
                    "general_rights": [
                        "Rett til klage på alle forvaltningsvedtak (forvaltningsloven)",
                        "Rett til aktinnsyn (offentlighetsloven § 3)",
                        "Rett til begrunnelse for avslag (forvaltningsloven § 25)",
                        "Anmelde politi/dommere til Spesialenheten/tilsynsutvalg",
                        "Sivilombudet kan behandle klager på offentlig forvaltning"
                    ]
                },
                "timestamp": datetime.utcnow().isoformat()
            }

        # Optional AI enrichment
        ai_guidance = None
        try:
            if ai_engine and os.getenv("OPENAI_API_KEY"):
                prompt = f"User describes: '{request.situation}' involving {request.authority}. Context: {context}. Provide brief guidance on Norwegian legal rights and remedies."
                ai_guidance = await ai_engine.simple_summary(prompt)
        except Exception:
            ai_guidance = None

        return {
            "success": True,
            "results": results,
            "ai_guidance": ai_guidance,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Error checking rights violations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Rights check failed: {str(e)}")


@app.post("/api/rights/appeal")
async def get_appeal_template(request: AppealRequest):
    """
    Get appeal/complaint template and step-by-step guidance for rejected applications or rights violations.
    """
    try:
        rejection_type = (request.rejection_type or "").lower()

        # Find matching template
        template_match = None
        for entry in RIGHTS_PROTECTION_DB:
            for kw in entry["keywords"]:
                if kw in rejection_type:
                    template_match = entry
                    break
            if template_match:
                break

        if not template_match:
            return {
                "success": True,
                "template": None,
                "message": "Ingen spesifikk klagemal funnet. Vennligst spesifiser type (besøksforbud, politimishandling, dommeravvisning, aktinnsyn)."
            }

        # Build response with template
        result = {
            "situation": template_match["situation"],
            "legal_basis": template_match["legal_basis"],
            "template": template_match.get("complaint_template", template_match.get("appeal_template", "")),
            "process": template_match.get("appeal_process", template_match.get("complaint_process", template_match.get("how_to_appeal", {}))),
            "strengthening_factors": template_match.get("what_strengthens_case", template_match.get("what_strengthens_complaint", [])),
        }

        # Add context-specific guidance
        if "criteria_for_approval" in template_match:
            result["criteria_you_must_show"] = template_match["criteria_for_approval"]
        if "common_rejection_reasons" in template_match:
            result["common_mistakes_to_avoid"] = template_match["common_rejection_reasons"]

        # AI-generated custom template based on facts
        ai_custom_template = None
        try:
            if ai_engine and os.getenv("OPENAI_API_KEY"):
                prompt = f"""Generate a professional Norwegian legal complaint/appeal based on:
Rejection type: {request.rejection_type}
Authority: {request.authority}
Facts: {request.facts}
Rejection reason: {request.rejection_reason or 'not stated'}

Use formal legal language appropriate for Norwegian courts/authorities. Include:
1. Header with recipient
2. Reference to rejection
3. Legal grounds for appeal
4. Factual basis
5. Legal arguments
6. Evidence list
7. Formal conclusion/demand
"""
                ai_custom_template = await ai_engine.simple_summary(prompt)
        except Exception:
            ai_custom_template = None

        return {
            "success": True,
            "template_info": result,
            "ai_custom_template": ai_custom_template,
            "instructions": {
                "step_1": "Fyll ut malen med dine spesifikke fakta",
                "step_2": "Legg ved all dokumentasjon (kvitteringer, politianmeldelser, etc.)",
                "step_3": f"Send til {template_match.get('appeal_process', {}).get('first_step', 'relevant myndighet')}",
                "step_4": f"Frist: {template_match.get('appeal_process', {}).get('deadline', 'sjekk spesifikk frist')}",
                "step_5": "Behold kopi av alt du sender inn"
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Error generating appeal template: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Appeal template generation failed: {str(e)}")


@app.post("/api/trial/simulate")
async def simulate_trial(request: TrialSimulationRequest):
    """
    Simulate a complete trial from both prosecution and defense perspectives.
    Tests different lawyer skill levels to see how strategy affects outcome.
    """
    try:
        # Get strategies for both sides
        defense_strategy = TRIAL_STRATEGIES.get(request.defense_skill, TRIAL_STRATEGIES["god"])
        prosecution_strategy = TRIAL_STRATEGIES.get(request.prosecution_skill, TRIAL_STRATEGIES["god"])

        # Build simulation narrative
        simulation = {
            "case_summary": {
                "type": request.case_type,
                "facts": request.facts,
                "evidence_count": len(request.evidence),
                "defense_skill": request.defense_skill,
                "prosecution_skill": request.prosecution_skill
            },
            "trial_phases": []
        }

        # Phase 1: Opening Statements
        simulation["trial_phases"].append({
            "phase": "Åpningsinnlegg",
            "defense": {
                "strategy": defense_strategy["defense"]["opening"],
                "skill_notes": defense_strategy["defense"].get("strengths", defense_strategy["defense"].get("weaknesses", []))
            },
            "prosecution": {
                "strategy": prosecution_strategy["prosecution"]["opening"],
                "skill_notes": prosecution_strategy["prosecution"].get("strengths", prosecution_strategy["prosecution"].get("weaknesses", []))
            }
        })

        # Phase 2: Evidence Presentation
        simulation["trial_phases"].append({
            "phase": "Bevisføring",
            "defense": {
                "strategy": defense_strategy["defense"]["evidence_handling"],
                "evidence_used": request.evidence if request.perspective == "defense" else ["Påtalemyndighetens bevis"]
            },
            "prosecution": {
                "strategy": prosecution_strategy["prosecution"]["evidence_handling"],
                "evidence_used": request.evidence if request.perspective == "prosecution" else ["Påtalemyndighetens bevis"]
            }
        })

        # Phase 3: Cross-Examination (if requested)
        if request.include_cross_examination:
            simulation["trial_phases"].append({
                "phase": "Kryssforhør",
                "defense": {
                    "strategy": defense_strategy["defense"]["cross_exam"],
                    "elite_tactics": defense_strategy["defense"].get("elite_tactics", [])
                },
                "prosecution": {
                    "strategy": prosecution_strategy["prosecution"]["cross_exam"],
                    "elite_tactics": prosecution_strategy["prosecution"].get("elite_tactics", [])
                }
            })

        # Phase 4: Closing Arguments
        simulation["trial_phases"].append({
            "phase": "Sluttinnlegg",
            "defense": {
                "strategy": defense_strategy["defense"]["closing"],
                "key_arguments": defense_strategy["defense"].get("strengths", [])
            },
            "prosecution": {
                "strategy": prosecution_strategy["prosecution"]["closing"],
                "key_arguments": prosecution_strategy["prosecution"].get("strengths", [])
            }
        })

        # Predict outcome based on skill levels and evidence
        outcome_prediction = predict_trial_outcome(
            request.defense_skill,
            request.prosecution_skill,
            len(request.evidence),
            request.case_type
        )

        simulation["predicted_outcome"] = outcome_prediction

        # AI-enhanced analysis (if available)
        ai_analysis = None
        try:
            if ai_engine and os.getenv("OPENAI_API_KEY"):
                prompt = f"""Analyze this trial simulation:
Case: {request.case_type}
Facts: {request.facts}
Evidence: {', '.join(request.evidence)}
Defense skill: {request.defense_skill}
Prosecution skill: {request.prosecution_skill}

Provide:
1. Most likely outcome (frifinnelse, domfellelse, delvis domfellelse)
2. Key factors that will determine the verdict
3. Critical mistakes each side should avoid
4. Best strategy for the weaker side
5. Realistic sentencing if convicted (based on Norwegian law)

Format as bullet points in Norwegian.
"""
                ai_analysis = await ai_engine.simple_summary(prompt)
        except Exception:
            ai_analysis = None

        return {
            "success": True,
            "simulation": simulation,
            "ai_expert_analysis": ai_analysis,
            "learning_points": {
                "defense": get_learning_points(request.defense_skill, "defense"),
                "prosecution": get_learning_points(request.prosecution_skill, "prosecution")
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Error simulating trial: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Trial simulation failed: {str(e)}")


def predict_trial_outcome(defense_skill: str, prosecution_skill: str, evidence_count: int, case_type: str) -> Dict[str, Any]:
    """Predict trial outcome based on lawyer skills and evidence"""
    
    skill_scores = {"dårlig": 1, "middels": 2, "god": 3, "elite": 4}
    defense_score = skill_scores.get(defense_skill, 2)
    prosecution_score = skill_scores.get(prosecution_skill, 2)
    
    # Calculate win probability
    evidence_factor = min(evidence_count / 5, 1.0)  # More evidence helps prosecution
    
    # Base probability
    if defense_score > prosecution_score + 1:
        base_prob = 0.70  # Defense heavily favored
        verdict = "Frifinnelse"
    elif defense_score > prosecution_score:
        base_prob = 0.60  # Defense slightly favored
        verdict = "Sannsynlig frifinnelse"
    elif prosecution_score > defense_score + 1:
        base_prob = 0.30  # Prosecution heavily favored
        verdict = "Domfellelse"
    elif prosecution_score > defense_score:
        base_prob = 0.40  # Prosecution slightly favored
        verdict = "Sannsynlig domfellelse"
    else:
        base_prob = 0.50  # Even match
        verdict = "Usikkert - avhenger av faktiske bevis"
    
    # Adjust for evidence
    adjusted_prob = base_prob * (1 - evidence_factor * 0.3)
    
    return {
        "verdict": verdict,
        "acquittal_probability": f"{int(adjusted_prob * 100)}%",
        "conviction_probability": f"{int((1 - adjusted_prob) * 100)}%",
        "key_factors": [
            f"Forsvarets dyktighet: {defense_skill} (score: {defense_score}/4)",
            f"Påtalemyndighetens dyktighet: {prosecution_skill} (score: {prosecution_score}/4)",
            f"Antall bevis: {evidence_count}",
            f"Bevisets styrke påvirker utfallet med {int(evidence_factor * 100)}%"
        ],
        "notes": "Dette er en simulering. Faktisk utfall avhenger av bevisenes kvalitet, ikke bare kvantitet."
    }


def get_learning_points(skill_level: str, side: str) -> List[str]:
    """Get learning points for improvement"""
    
    if skill_level == "dårlig":
        return [
            "Studer hvordan 'god' eller 'elite' advokater strukturerer saken",
            "Fokuser på beviskjeden - ikke bare liste opp fakta",
            "Lær effektive kryssforhørsteknikker",
            "Se på hvordan dine argumenter faktisk motvirkes av motparten"
        ]
    elif skill_level == "middels":
        return [
            "Utvikle mer sofistikerte strategier - se 'elite' tactics",
            "Lær å forutse motpartens argumenter og forbered motangrep",
            "Finn prosedyrefeil og tekniske svakheter i motpartens sak",
            "Bygg redundante argumenter - ikke stol på kun ett bevis"
        ]
    elif skill_level == "god":
        return [
            "Studer 'elite' tactics for å nå neste nivå",
            "Lær retoriske teknikker for mer overbevisende fremstilling",
            "Utvikle evne til å omvende motpartens styrke til svakhet",
            "Mestre alle aspekter av prosedyrerett for å finne formfeil"
        ]
    else:  # elite
        return [
            "Du er allerede på elite-nivå!",
            "Fortsett å studere nye høyesterettsdommer for presedenser",
            "Del kunnskapen din med andre advokater",
            "Skriv juridiske artikler om vellykkede strategier"
        ]


@app.post("/api/evidence/upload")
async def upload_evidence_file(
    file: UploadFile = File(...),
    description: Optional[str] = None,
    case_id: Optional[str] = None
):
    """
    Upload evidence file (encrypted on client before upload)
    
    This endpoint receives already-encrypted files.
    Actual file content analysis happens client-side in zero-knowledge mode.
    """
    try:
        logger.info(f"Receiving encrypted evidence file: {file.filename}")
        
        # Read encrypted file content
        content = await file.read()
        
        # In zero-knowledge architecture:
        # 1. Client encrypts file locally
        # 2. Uploads encrypted file here
        # 3. Server stores encrypted blob (no plaintext access)
        # 4. Client decrypts locally when needed
        
        # For now, return file metadata
        # TODO: Integrate with encrypted storage backend
        
        return {
            "success": True,
            "file": {
                "id": f"evidence_{datetime.utcnow().timestamp()}",
                "filename": file.filename,
                "size": len(content),
                "content_type": file.content_type,
                "uploaded": datetime.utcnow().isoformat(),
                "encrypted": True,
                "case_id": case_id
            },
            "message": "File uploaded successfully (encrypted)"
        }
        
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# ============================================
# Error Handlers
# ============================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# ============================================
# Startup/Shutdown Events
# ============================================

@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info("🚀 RettBot+ API starting...")
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"OpenAI configured: {bool(os.getenv('OPENAI_API_KEY'))}")
    logger.info(f"CORS origins: {cors_origins}")
    logger.info("✅ RettBot+ API ready!")

@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    logger.info("👋 RettBot+ API shutting down...")

# ============================================
# Main Entry Point
# ============================================

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=os.getenv("API_RELOAD", "true").lower() == "true",
        log_level=os.getenv("LOG_LEVEL", "info").lower()
    )
