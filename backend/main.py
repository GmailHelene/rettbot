"""
RettBot+ Backend API
FastAPI REST API for zero-knowledge AI legal assistant
"""

from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse, FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uvicorn
import os
from pathlib import Path
from dotenv import load_dotenv
import logging
from datetime import datetime, timedelta
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from backend.security_enhancements import (
    check_rate_limit, 
    validate_password_strength, 
    SecurityHeaders, 
    get_client_ip,
    session_security
)
import jwt
import bcrypt
import secrets
import hashlib
from cryptography.fernet import Fernet
import json
import sqlite3

# Import AI engine
from backend.ai_engine.claude_integration import ClaudeEngine

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

# Enforce HTTPS in production behind a proxy (Railway) using X-Forwarded-Proto
@app.middleware("http")
async def enforce_https_redirect(request: Request, call_next):
    try:
        # HTTPS tvinges i produksjon; av som standard lokalt (unngår redirect-loop i dev).
        _is_prod = os.getenv("ENVIRONMENT", "development").lower() == "production"
        force_https = os.getenv("FORCE_HTTPS", "true" if _is_prod else "false").lower() == "true"
        # Respect proxy headers (Railway sets X-Forwarded-Proto)
        xf_proto = request.headers.get("x-forwarded-proto") or request.url.scheme
        if force_https and xf_proto == "http":
            https_url = request.url.replace(scheme="https")
            return RedirectResponse(str(https_url), status_code=307)
    except Exception:
        # If anything goes wrong, do not block the request
        pass
    return await call_next(request)

# Initialize Claude (Anthropic) engine (robust to missing key)
try:
    ai_engine = ClaudeEngine()
    logger.info("Claude engine initialized")
except Exception as e:
    ai_engine = None
    logger.warning(f"Claude engine not initialized: {e}")

# ============================================
# Authentication & Security Setup
# ============================================

# Environment flag – styrer om manglende hemmeligheter skal feile hardt.
IS_PRODUCTION = os.getenv("ENVIRONMENT", "development").lower() == "production"

# JWT Configuration.
# I produksjon MÅ JWT_SECRET være satt og persistent. Genereres den tilfeldig
# ved hver oppstart, blir alle utstedte tokens ugyldige ved omstart/redeploy,
# og med flere workere validerer ikke tokens på tvers av prosesser.
SECRET_KEY = os.getenv("JWT_SECRET")
if not SECRET_KEY:
    if IS_PRODUCTION:
        raise RuntimeError(
            "JWT_SECRET er ikke satt. Sett en fast, hemmelig verdi i Railway → Variables. "
            "Generer med: python -c \"import secrets; print(secrets.token_urlsafe(48))\""
        )
    SECRET_KEY = secrets.token_urlsafe(32)
    logger.warning(
        "JWT_SECRET ikke satt – bruker midlertidig nøkkel (kun dev). "
        "Innlogginger blir ugyldige ved hver omstart."
    )
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Encryption key for user data.
# KRITISK: I produksjon MÅ ENCRYPTION_KEY være satt og persistent. Genereres den
# tilfeldig ved oppstart, blir ALL allerede kryptert saksdata permanent uleselig
# etter neste omstart/redeploy (Railway restarter containere rutinemessig).
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    if IS_PRODUCTION:
        raise RuntimeError(
            "ENCRYPTION_KEY er ikke satt. Uten en fast nøkkel blir krypterte saksdata "
            "uleselige ved omstart. Sett den i Railway → Variables. Generer med: "
            "python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
        )
    ENCRYPTION_KEY = Fernet.generate_key().decode()
    logger.warning(
        "ENCRYPTION_KEY ikke satt – genererer midlertidig nøkkel (kun dev). "
        "Krypterte data overlever IKKE en omstart."
    )
try:
    fernet = Fernet(ENCRYPTION_KEY.encode())
except Exception as exc:
    raise RuntimeError(
        "ENCRYPTION_KEY er ugyldig. Den må være en Fernet-nøkkel generert med "
        "Fernet.generate_key(). Feil: " + str(exc)
    )

# HTTP Bearer for JWT tokens
security = HTTPBearer()

# Database — SQLite lokalt, PostgreSQL i produksjon (via DATABASE_URL). Se backend/db.py.
from backend.db import get_connection, ID_COLUMN, SQLITE_PATH, database_ok
DB_PATH = SQLITE_PATH  # bakoverkompatibel referanse

def init_database():
    """Opprett tabeller hvis de ikke finnes (fungerer på både SQLite og Postgres)."""
    conn = get_connection()
    cursor = conn.cursor()

    # Users table
    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS users (
            id {ID_COLUMN},
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    """)

    # Cases table (encrypted)
    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS cases (
            id {ID_COLUMN},
            user_id INTEGER NOT NULL,
            case_number TEXT UNIQUE,
            title TEXT NOT NULL,
            case_type TEXT,
            encrypted_data TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # Documents table
    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS documents (
            id {ID_COLUMN},
            case_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            encrypted_content TEXT NOT NULL,
            file_type TEXT,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (case_id) REFERENCES cases (id)
        )
    """)

    # Evidence files (kryptert server-side, valgfri fri-tekst saksreferanse)
    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS evidence (
            id {ID_COLUMN},
            user_id INTEGER NOT NULL,
            case_ref TEXT,
            filename TEXT NOT NULL,
            file_type TEXT,
            size INTEGER,
            description TEXT,
            encrypted_content TEXT NOT NULL,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # Tidslinje-hendelser (kryptert server-side; event_date i klartekst for sortering)
    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS timeline_events (
            id {ID_COLUMN},
            user_id INTEGER NOT NULL,
            case_ref TEXT,
            event_date TEXT NOT NULL,
            encrypted_data TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # Lagrede dokumenter/brev (kryptert), knyttet til en sak via saksnummer
    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS saved_documents (
            id {ID_COLUMN},
            user_id INTEGER NOT NULL,
            case_ref TEXT,
            title TEXT NOT NULL,
            encrypted_content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # Password reset tokens (hashet – overlever omstart, persistent på tvers av workere)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            token_hash TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            used INTEGER NOT NULL DEFAULT 0
        )
    """)

    conn.commit()
    conn.close()
    logger.info("Database initialized successfully")

# Initialize database on startup
init_database()

# Mount static files (frontend)
# Check if frontend/dist exists (production) or serve placeholder
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")
    logger.info(f"Mounted frontend static files from {frontend_dist}")
    # Serve PWA files if present
    manifest_candidates = [frontend_dist / "manifest.webmanifest", frontend_dist / "manifest.json"]

    @app.get("/manifest.webmanifest")
    async def serve_manifest():
        for mf in manifest_candidates:
            if mf.exists():
                return FileResponse(mf)
        raise HTTPException(status_code=404, detail="Manifest not found")

    @app.get("/registerSW.js")
    async def serve_register_sw():
        f = frontend_dist / "registerSW.js"
        if f.exists():
            return FileResponse(f)
        raise HTTPException(status_code=404, detail="registerSW.js not found")

    @app.get("/sw.js")
    async def serve_sw():
        f = frontend_dist / "sw.js"
        if f.exists():
            return FileResponse(f)
        raise HTTPException(status_code=404, detail="Service worker not found")

    @app.get("/workbox-{filename}")
    async def serve_workbox(filename: str):
        f = frontend_dist / f"workbox-{filename}"
        if f.exists():
            return FileResponse(f)
        raise HTTPException(status_code=404, detail="Workbox file not found")

# ============================================
# Request/Response Models
# ============================================

# Authentication Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class CaseCreate(BaseModel):
    title: str
    description: str
    case_type: str
    facts: Optional[str] = None
    evidence: Optional[List[str]] = None

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    facts: Optional[str] = None
    evidence: Optional[List[str]] = None

# Password Reset Token Storage – lagres hashet i databasen slik at de overlever
# omstart og fungerer på tvers av flere prosesser/instanser.
def _hash_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def _store_reset_token(email: str, token: str, expires_at: datetime) -> None:
    conn = get_connection()
    cur = conn.cursor()
    # Rydd bort eventuelle tidligere tokens for denne e-posten
    cur.execute("DELETE FROM password_reset_tokens WHERE email = ?", (email,))
    cur.execute(
        "INSERT INTO password_reset_tokens (token_hash, email, expires_at, used) VALUES (?, ?, ?, 0)",
        (_hash_reset_token(token), email, expires_at.isoformat()),
    )
    conn.commit()
    conn.close()


def _get_reset_token(token: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT email, expires_at, used FROM password_reset_tokens WHERE token_hash = ?",
        (_hash_reset_token(token),),
    )
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    expires = row[1]
    if isinstance(expires, str):
        expires = datetime.fromisoformat(expires)
    return {"email": row[0], "expires_at": expires, "used": bool(row[2])}


def _delete_reset_token(token: str) -> None:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM password_reset_tokens WHERE token_hash = ?", (_hash_reset_token(token),))
    conn.commit()
    conn.close()

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetToken(BaseModel):
    token: str

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@rettbot.com")

def send_password_reset_email(email: str, reset_token: str, base_url: str = "http://localhost:5173"):
    """Send password reset email"""
    try:
        msg = MIMEMultipart()
        msg['From'] = FROM_EMAIL
        msg['To'] = email
        msg['Subject'] = "RettBot - Tilbakestill passord"
        
        # Create reset link
        reset_url = f"{base_url}/reset-password?token={reset_token}"
        
        # Email body in Norwegian
        body = f"""
Hei,

Du har bedt om å tilbakestille passordet ditt for RettBot.

Klikk på lenken nedenfor for å lage et nytt passord:
{reset_url}

Denne lenken er gyldig i 1 time.

Hvis du ikke ba om denne tilbakestillingen, kan du ignorere denne e-posten.

Med vennlig hilsen,
RettBot Team

---
Denne e-posten er automatisk generert. Ikke svar på denne e-posten.
        """
        
        msg.attach(MIMEText(body, 'plain', 'utf-8'))
        
        # Send email
        if SMTP_USERNAME and SMTP_PASSWORD:
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            text = msg.as_string()
            server.sendmail(FROM_EMAIL, email, text)
            server.quit()
            return True
        else:
            # In development, just log the reset URL
            print(f"Password reset URL for {email}: {reset_url}")
            return True
            
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

# Existing Models
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


class ChatRequest(BaseModel):
    """Simple chat request for Legal Chat UI"""
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = None

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
    ai_configured: bool


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
    },
    {
        "keywords": ["korrupt politi", "korrupsjon", "politi kontakter", "misbruk av makt", "inhabil politi", "korrupt saksbehandling"],
        "situation": "Mistanke om korrupsjon/inhabilitet hos politi eller andre offentlige tjenestemenn",
        "legal_basis": "Straffeloven §§ 387-392 (korrupsjon) / Politiloven § 28 (habilitet) / EMK art. 6 (rettferdig rettergang)",
        "signs_of_corruption": [
            "Uforklarlige avslag på åpenbart begrunnede søknader (besøksforbud, anmeldelser)",
            "Saksbehandling som avviker betydelig fra standard praksis",
            "Manglende etterforskning av alvorlige anmeldelser",
            "Unormalt tette forbindelser mellom tjenestemann og anmeldt person",
            "Rask henleggelse av saker uten reell etterforskning",
            "Nekting av innsyn i saksdokumenter uten lovlig grunn"
        ],
        "your_information_rights": {
            "basic_rights": [
                "Rett til innsyn i alle saksdokumenter (strpl § 242) - inkludert politirapporter, avhørsreferater, vurderingsnotater",
                "Rett til kopi av dine egne forklaringer og anmeldelser",
                "Rett til begrunnelse for alle vedtak og beslutninger",
                "Rett til å vite hvilke tjenestemannen som har behandlet saken"
            ],
            "advanced_access_rights": [
                "Rett til innsyn i saksbehandlernes kvalifikasjoner og habilitetsvurderinger",
                "Rett til informasjon om eventuelle interessekonflikter",
                "Rett til å se henvisning til presedenser/lignende saker",
                "Rett til dokumentasjon av beslutningsprosessen",
                "Rett til korrespondanse mellom avdelinger/instanser"
            ],
            "what_they_must_reveal": [
                "Hvem som har deltatt i saksbehandlingen",
                "Hvilket juridisk grunnlag beslutningen bygger på",
                "Hvilke faktiske forhold som er lagt til grunn",
                "Hvilke hensyn som er vektlagt",
                "Eventuelle alternative løsninger som er vurdert"
            ]
        },
        "how_to_expose_corruption": {
            "document_everything": [
                "Be om skriftlig begrunnelse for alle vedtak",
                "Logg alle kontakter: dato, navn, hva som ble sagt",
                "Be om navn og tittel på alle involverte tjenestemannen",
                "Sammenlign behandling med lignende saker (be om eksempler)",
                "Dokumenter avvik fra normal saksbehandlingstid"
            ],
            "request_specific_documents": [
                "Saksjournal - viser hvem som har gjort hva når",
                "Interne notater og vurderinger",
                "E-postkorrespondanse om saken",
                "Møtereferater hvor saken er diskutert",
                "Habilitetserklæringer fra saksbehandlere",
                "Prosedyrer og instrukser som skal følges"
            ],
            "use_freedom_of_information": [
                "Be om innsyn i politiets generelle rutiner for denne type saker",
                "Sammenlign din sak med anonymiserte lignende saker",
                "Be om statistikk: hvor mange lignende saker som innvilges/avslås",
                "Se hvilke kriterier som normalt anvendes",
                "Få tilgang til interne retningslinjer og prosedyrer"
            ]
        },
        "escalation_strategy": {
            "level_1": "Formell klage til samme organ med krav om ny saksbehandler",
            "level_2": "Klage til overordnet myndighet + krav om innsyn i alt",
            "level_3": "Anmeldelse til Spesialenheten for politisaker (korrupsjon/misbruk)",
            "level_4": "Klage til Sivilombudet (langvarig/usaklig saksbehandling)",
            "level_5": "Kontakt media + politikere (offentlig press)",
            "level_6": "Søksmål mot staten (erstatning + tvungen saksbehandling)"
        },
        "special_procedures": {
            "when_police_is_corrupt": [
                "Anmeld direkte til Spesialenheten (bypasser lokalt politi)",
                "Kontakt påtalemyndigheten direkte (statsadvokat)",
                "Be om at ny politikrets overtar saken",
                "Kontakt Kripos for alvorlige korrupsjonssaker"
            ],
            "protecting_yourself": [
                "Aldri møt alene - ta med vitne eller advokat",
                "Alle kommunikasjon skriftlig (e-post, brev)",
                "Ta opptak av samtaler (lovlig når du er part)",
                "Kopier alle dokumenter umiddelbart",
                "Lagre alt på flere steder (sky, backup, fysisk)"
            ],
            "building_your_case": [
                "Samle likebehandlingseksempler (andre som fikk medhold)",
                "Dokumenter tidslinje og sammenhenger",
                "Finn vitner til korrupt atferd",
                "Få advokat til å stille kritiske spørsmål",
                "Be journalister om å stille spørsmål til politiet"
            ]
        },
        "legal_template_corruption": """
TIL: [Spesialenheten for politisaker / Politidistrikt]
ANMELDELSE: MISBRUK AV STILLING/KORRUPSJON

Dato: [DATO]
Gjelder: [Tjenestemannens navn og stilling]

SAMMENDRAG:
Jeg anmelder [navn] for misbruk av offentlig stilling i forbindelse med behandling av min sak vedrørende [kort beskrivelse].

FAKTUM:
[Detaljert kronologisk fremstilling]

KORRUPSJONSINDIKATORER:
1. Uforklarlig avvik fra normal saksbehandling
2. [Spesifiser hva som er unormalt]
3. Mulige interessekonflikter: [beskriv forbindelser]
4. Manglende saklighet i vedtak

BEVIS:
1. E-postkorrespondanse [vedlegg 1]
2. Vedtak med mangelfull begrunnelse [vedlegg 2]
3. Sammenligning med lignende saker [vedlegg 3]
4. Vitner til korrupt atferd [liste]

ANMODNING:
1. Etterforskning av den anmeldte
2. Ny saksbehandling av min opprinnelige sak
3. Innsyn i all korrespondanse om saken
4. Vurdering av andre saker tjenestemann har behandlet

Jeg står til disposisjon for ytterligere opplysninger.

[Navn]
[Kontaktinfo]
        """,
        "children_protection_special": {
            "when_children_threatened": [
                "ØYEBLIKKELIG: Ring Barnevernet (Kommunen eller BUFetat regionkontor)",
                "Parallelt: Anmeld til politiet i ANNET distrikt enn der truende person har kontakter",
                "Kontakt Fylkesmannen (Statsforvalteren) - har tilsynsansvar med Barnevernet",
                "Ring Krisesenter for umiddelbar beskyttelse",
                "Dokumenter ALLE trusler - video, lydopptak, vitner"
            ],
            "emergency_contacts": [
                "BUFetat regionkontor: [finnes på bufdir.no]",
                "Krisesentertelefonen: 116 006",
                "Redd Barna: 116 111",
                "Barnevernsvakten (din kommune)",
                "Spesialenheten: 22 40 60 00"
            ],
            "when_system_fails": [
                "Kontakt PRESS umiddelbart - barn i fare er alltid mediesak",
                "Ring stortingsrepresentanter fra ditt fylke",
                "Kontakt barneombudet: barneombudet.no",
                "Europeiske menneskerettighetsdomstolen (EMD) - art. 3 og 8",
                "FN barnekomite - konvensjon om barnets rettigheter"
            ]
        }
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

@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve frontend index.html"""
    frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
    index_file = frontend_dist / "index.html"
    
    if index_file.exists():
        return FileResponse(index_file)
    else:
        # Fallback: Return simple HTML with API info
        return HTMLResponse(content="""
<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RettBot+ - AI Juridisk Assistent</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; }
        h1 { font-size: 3em; margin-bottom: 10px; }
        p { font-size: 1.2em; margin-bottom: 30px; }
        .api-link { background: white; color: #1e3a8a; padding: 15px 30px; text-decoration: none; border-radius: 10px; display: inline-block; font-weight: bold; }
        .api-link:hover { background: #fbbf24; }
    </style>
</head>
<body>
    <h1>⚖️ RettBot+</h1>
    <p>AI-drevet juridisk assistent for norske borgere</p>
    <a href="/api/health" class="api-link">API Health Check →</a>
</body>
</html>
        """)

# ============================================
# Authentication Helper Functions
# ============================================

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Get current user from JWT token"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        # Get user from database
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, full_name FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        conn.close()
        
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return {
            "id": user[0],
            "email": user[1],
            "full_name": user[2]
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

def encrypt_data(data: dict) -> str:
    """Encrypt dictionary data"""
    json_data = json.dumps(data)
    encrypted = fernet.encrypt(json_data.encode())
    return encrypted.decode()

def decrypt_data(encrypted_data: str) -> dict:
    """Decrypt data back to dictionary"""
    decrypted = fernet.decrypt(encrypted_data.encode())
    return json.loads(decrypted.decode())

# ============================================
# Authentication Endpoints
# ============================================

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses"""
    response = await call_next(request)
    
    # Add security headers
    headers = SecurityHeaders.get_headers()
    for key, value in headers.items():
        response.headers[key] = value
    
    return response

@app.post("/api/auth/register", response_model=TokenResponse)
async def register(user: UserRegister, req: Request):
    """Register new user"""
    # Rate limiting for registration attempts
    check_rate_limit(req, max_requests=3, window_minutes=60)
    
    # Validate password strength
    validate_password_strength(user.password)
    
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password and create user
        password_hash = hash_password(user.password)
        cursor.execute(
            "INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)",
            (user.email, password_hash, user.full_name)
        )
        conn.commit()
        
        # Get created user
        cursor.execute("SELECT id, email, full_name FROM users WHERE email = ?", (user.email,))
        new_user = cursor.fetchone()
        conn.close()
        
        # Create access token
        access_token = create_access_token(data={"sub": user.email})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": new_user[0],
                "email": new_user[1],
                "full_name": new_user[2]
            }
        }
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin, req: Request):
    """Login user"""
    # Rate limiting for login attempts (more restrictive)
    check_rate_limit(req, max_requests=5, window_minutes=15)
    
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Get user
        cursor.execute("SELECT id, email, password_hash, full_name FROM users WHERE email = ?", (credentials.email,))
        user = cursor.fetchone()
        
        if not user or not verify_password(credentials.password, user[2]):
            raise HTTPException(status_code=401, detail="Incorrect email or password")
        
        # Update last login
        cursor.execute("UPDATE users SET last_login = ? WHERE id = ?", (datetime.utcnow(), user[0]))
        conn.commit()
        conn.close()
        
        # Create access token
        access_token = create_access_token(data={"sub": credentials.email})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user[0],
                "email": user[1],
                "full_name": user[3]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@app.get("/api/auth/me")
async def get_current_user_info(current_user: Dict = Depends(get_current_user)):
    """Get current user information"""
    return current_user


@app.get("/api/user/export")
async def export_user_data(current_user: Dict = Depends(get_current_user)):
    """GDPR: last ned alle data om den innloggede brukeren som JSON (innsyn + portabilitet)."""
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id, email, full_name, created_at, last_login FROM users WHERE id = ?",
            (current_user["id"],),
        )
        u = cursor.fetchone()

        cursor.execute(
            "SELECT id, case_number, title, case_type, encrypted_data, created_at, updated_at "
            "FROM cases WHERE user_id = ?",
            (current_user["id"],),
        )
        cases = []
        for row in cursor.fetchall():
            try:
                data = decrypt_data(row[4])
            except Exception:
                data = {}
            cases.append({
                "id": row[0],
                "case_number": row[1],
                "title": row[2],
                "case_type": row[3],
                "created_at": str(row[5]),
                "updated_at": str(row[6]),
                "data": data,
            })

        cursor.execute(
            "SELECT id, case_ref, filename, file_type, size, description, uploaded_at "
            "FROM evidence WHERE user_id = ?",
            (current_user["id"],),
        )
        evidence = [
            {
                "id": r[0],
                "case_ref": r[1],
                "filename": r[2],
                "file_type": r[3],
                "size": r[4],
                "description": r[5],
                "uploaded_at": str(r[6]),
            }
            for r in cursor.fetchall()
        ]

        cursor.execute(
            "SELECT id, case_ref, event_date, encrypted_data, created_at FROM timeline_events WHERE user_id = ?",
            (current_user["id"],),
        )
        timeline = []
        for r in cursor.fetchall():
            try:
                d = decrypt_data(r[3])
            except Exception:
                d = {}
            timeline.append({
                "id": r[0],
                "case_ref": r[1],
                "event_date": r[2],
                "title": d.get("title", ""),
                "details": d.get("details", ""),
                "created_at": str(r[4]),
            })

        cursor.execute(
            "SELECT id, case_ref, title, encrypted_content, created_at FROM saved_documents WHERE user_id = ?",
            (current_user["id"],),
        )
        saved_docs = []
        for r in cursor.fetchall():
            try:
                content = fernet.decrypt(r[3].encode()).decode()
            except Exception:
                content = ""
            saved_docs.append({
                "id": r[0],
                "case_ref": r[1],
                "title": r[2],
                "content": content,
                "created_at": str(r[4]),
            })
        conn.close()

        export = {
            "exported_at": datetime.utcnow().isoformat(),
            "user": {
                "id": u[0],
                "email": u[1],
                "full_name": u[2],
                "created_at": str(u[3]),
                "last_login": str(u[4]),
            } if u else None,
            "cases": cases,
            "evidence_metadata": evidence,
            "timeline": timeline,
            "documents": saved_docs,
            "note": "Selve bevisfilene lagres kryptert og kan lastes ned enkeltvis i appen.",
        }
        return JSONResponse(
            content=export,
            headers={"Content-Disposition": "attachment; filename=rettbot-mine-data.json"},
        )
    except Exception as e:
        logger.error(f"Export error: {str(e)}")
        raise HTTPException(status_code=500, detail="Kunne ikke eksportere data")


@app.delete("/api/user/me")
async def delete_my_account(current_user: Dict = Depends(get_current_user)):
    """GDPR: slett den innloggede brukerens konto og alle tilhørende data."""
    uid = current_user["id"]
    email = current_user["email"]
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM evidence WHERE user_id = ?", (uid,))
        cursor.execute("DELETE FROM timeline_events WHERE user_id = ?", (uid,))
        cursor.execute("DELETE FROM saved_documents WHERE user_id = ?", (uid,))
        cursor.execute(
            "DELETE FROM documents WHERE case_id IN (SELECT id FROM cases WHERE user_id = ?)",
            (uid,),
        )
        cursor.execute("DELETE FROM cases WHERE user_id = ?", (uid,))
        cursor.execute("DELETE FROM password_reset_tokens WHERE email = ?", (email,))
        cursor.execute("DELETE FROM users WHERE id = ?", (uid,))
        conn.commit()
        conn.close()
        logger.info(f"Deleted account and all data for user {uid}")
        return {"success": True, "message": "Kontoen og alle tilhørende data er slettet."}
    except Exception as e:
        logger.error(f"Account deletion error: {str(e)}")
        raise HTTPException(status_code=500, detail="Kunne ikke slette kontoen")


# ============================================
# Saks-tidslinje (kryptert)
# ============================================

class TimelineCreate(BaseModel):
    event_date: str
    title: str
    details: Optional[str] = ""
    case_ref: Optional[str] = None


@app.post("/api/timeline")
async def create_timeline_event(event: TimelineCreate, current_user: Dict = Depends(get_current_user)):
    if not event.event_date or not event.title:
        raise HTTPException(status_code=400, detail="Dato og tittel er påkrevd.")
    try:
        encrypted = encrypt_data({"title": event.title, "details": event.details or ""})
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO timeline_events (user_id, case_ref, event_date, encrypted_data) "
            "VALUES (?, ?, ?, ?) RETURNING id",
            (current_user["id"], event.case_ref, event.event_date, encrypted),
        )
        eid = cursor.fetchone()[0]
        conn.commit()
        conn.close()
        return {"success": True, "id": eid}
    except Exception as e:
        logger.error(f"Timeline create error: {str(e)}")
        raise HTTPException(status_code=500, detail="Kunne ikke lagre hendelsen")


@app.get("/api/timeline")
async def list_timeline_events(current_user: Dict = Depends(get_current_user)):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, case_ref, event_date, encrypted_data, created_at FROM timeline_events "
            "WHERE user_id = ? ORDER BY event_date DESC, id DESC",
            (current_user["id"],),
        )
        rows = cursor.fetchall()
        conn.close()
        events = []
        for r in rows:
            try:
                d = decrypt_data(r[3])
            except Exception:
                d = {}
            events.append({
                "id": r[0],
                "case_ref": r[1],
                "event_date": r[2],
                "title": d.get("title", ""),
                "details": d.get("details", ""),
                "created_at": str(r[4]),
            })
        return {"success": True, "events": events}
    except Exception as e:
        logger.error(f"Timeline list error: {str(e)}")
        raise HTTPException(status_code=500, detail="Kunne ikke hente tidslinjen")


@app.delete("/api/timeline/{event_id}")
async def delete_timeline_event(event_id: int, current_user: Dict = Depends(get_current_user)):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM timeline_events WHERE id = ? AND user_id = ?",
            (event_id, current_user["id"]),
        )
        conn.commit()
        conn.close()
        return {"success": True}
    except Exception as e:
        logger.error(f"Timeline delete error: {str(e)}")
        raise HTTPException(status_code=500, detail="Kunne ikke slette hendelsen")


@app.get("/api/evidence")
async def list_evidence(current_user: Dict = Depends(get_current_user)):
    """List brukerens bevis (metadata, ikke selve filinnholdet)."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, case_ref, filename, file_type, size, description, uploaded_at "
            "FROM evidence WHERE user_id = ? ORDER BY uploaded_at DESC",
            (current_user["id"],),
        )
        rows = cursor.fetchall()
        conn.close()
        evidence = [
            {
                "id": r[0],
                "case_ref": r[1],
                "filename": r[2],
                "file_type": r[3],
                "size": r[4],
                "description": r[5],
                "uploaded_at": str(r[6]),
            }
            for r in rows
        ]
        return {"success": True, "evidence": evidence}
    except Exception as e:
        logger.error(f"Evidence list error: {str(e)}")
        raise HTTPException(status_code=500, detail="Kunne ikke hente bevis")


# ============================================
# Lagrede dokumenter/brev (kryptert)
# ============================================

class SavedDocumentCreate(BaseModel):
    title: str
    content: str
    case_ref: Optional[str] = None


@app.post("/api/documents")
async def save_document(doc: SavedDocumentCreate, current_user: Dict = Depends(get_current_user)):
    if not doc.title or not doc.content:
        raise HTTPException(status_code=400, detail="Tittel og innhold er påkrevd.")
    try:
        encrypted = fernet.encrypt(doc.content.encode()).decode()
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO saved_documents (user_id, case_ref, title, encrypted_content) "
            "VALUES (?, ?, ?, ?) RETURNING id",
            (current_user["id"], doc.case_ref, doc.title, encrypted),
        )
        did = cursor.fetchone()[0]
        conn.commit()
        conn.close()
        return {"success": True, "id": did}
    except Exception as e:
        logger.error(f"Save document error: {str(e)}")
        raise HTTPException(status_code=500, detail="Kunne ikke lagre dokumentet")


@app.get("/api/documents")
async def list_documents(current_user: Dict = Depends(get_current_user)):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, case_ref, title, encrypted_content, created_at FROM saved_documents "
            "WHERE user_id = ? ORDER BY created_at DESC",
            (current_user["id"],),
        )
        rows = cursor.fetchall()
        conn.close()
        docs = []
        for r in rows:
            try:
                content = fernet.decrypt(r[3].encode()).decode()
            except Exception:
                content = ""
            docs.append({
                "id": r[0],
                "case_ref": r[1],
                "title": r[2],
                "content": content,
                "created_at": str(r[4]),
            })
        return {"success": True, "documents": docs}
    except Exception as e:
        logger.error(f"List documents error: {str(e)}")
        raise HTTPException(status_code=500, detail="Kunne ikke hente dokumenter")


@app.delete("/api/documents/{doc_id}")
async def delete_document(doc_id: int, current_user: Dict = Depends(get_current_user)):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM saved_documents WHERE id = ? AND user_id = ?",
            (doc_id, current_user["id"]),
        )
        conn.commit()
        conn.close()
        return {"success": True}
    except Exception as e:
        logger.error(f"Delete document error: {str(e)}")
        raise HTTPException(status_code=500, detail="Kunne ikke slette dokumentet")

@app.post("/api/auth/forgot-password")
async def forgot_password(request: PasswordResetRequest, req: Request):
    """Send password reset email"""
    check_rate_limit(req, max_requests=3, window_minutes=60)  # Very restrictive
    
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (request.email,))
        user = cursor.fetchone()
        
        if not user:
            # Don't reveal if email exists or not for security
            return {"message": "If the email exists, you will receive a reset link"}
        
        # Generate secure reset token
        reset_token = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(hours=1)  # 1 hour expiry
        
        # Store reset token (hashet i databasen)
        _store_reset_token(request.email, reset_token, expires_at)
        
        # Send email
        base_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        email_sent = send_password_reset_email(request.email, reset_token, base_url)
        
        if not email_sent:
            logger.error(f"Failed to send reset email to {request.email}")
            raise HTTPException(status_code=500, detail="Failed to send reset email")
        
        logger.info(f"Password reset email sent to {request.email}")
        return {"message": "If the email exists, you will receive a reset link"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Forgot password error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        conn.close()

@app.post("/api/auth/validate-reset-token")
async def validate_reset_token(request: PasswordResetToken):
    """Validate if reset token is valid"""
    token_data = _get_reset_token(request.token)

    if not token_data:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    if token_data["used"]:
        raise HTTPException(status_code=400, detail="Reset token has already been used")

    if datetime.utcnow() > token_data["expires_at"]:
        _delete_reset_token(request.token)
        raise HTTPException(status_code=400, detail="Reset token has expired")

    return {"message": "Token is valid"}

@app.post("/api/auth/reset-password")
async def reset_password(request: PasswordResetConfirm):
    """Reset password using valid token"""
    try:
        # Validate token
        token_data = _get_reset_token(request.token)

        if not token_data:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")

        if token_data["used"]:
            raise HTTPException(status_code=400, detail="Reset token has already been used")

        if datetime.utcnow() > token_data["expires_at"]:
            _delete_reset_token(request.token)
            raise HTTPException(status_code=400, detail="Reset token has expired")

        # Validate password strength
        if len(request.new_password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

        # Update password in database
        conn = get_connection()
        cursor = conn.cursor()
        password_hash = hash_password(request.new_password)
        cursor.execute(
            "UPDATE users SET password_hash = ? WHERE email = ?",
            (password_hash, token_data["email"])
        )
        conn.commit()
        conn.close()

        # Engangstoken – slett etter bruk
        _delete_reset_token(request.token)

        logger.info(f"Password successfully reset for {token_data['email']}")
        return {"message": "Password successfully reset"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reset password error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        if 'conn' in locals():
            conn.close()

# ============================================
# Case Management Endpoints (Encrypted)
# ============================================

@app.post("/api/cases")
async def create_case(case: CaseCreate, current_user: Dict = Depends(get_current_user)):
    """Create new case (encrypted)"""
    try:
        # Generate unique case number
        case_number = f"CASE-{datetime.utcnow().strftime('%Y%m%d')}-{secrets.token_hex(4).upper()}"
        
        # Encrypt case data
        case_data = {
            "title": case.title,
            "description": case.description,
            "case_type": case.case_type,
            "facts": case.facts,
            "evidence": case.evidence or []
        }
        encrypted_data = encrypt_data(case_data)
        
        # Save to database
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO cases (user_id, case_number, title, case_type, encrypted_data) VALUES (?, ?, ?, ?, ?) RETURNING id",
            (current_user["id"], case_number, case.title, case.case_type, encrypted_data)
        )
        case_id = cursor.fetchone()[0]
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "case_id": case_id,
            "case_number": case_number,
            "message": "Case created and encrypted successfully"
        }
    except Exception as e:
        logger.error(f"Case creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Case creation failed: {str(e)}")

@app.get("/api/cases")
async def get_user_cases(current_user: Dict = Depends(get_current_user)):
    """Get all cases for current user"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, case_number, title, case_type, created_at, updated_at FROM cases WHERE user_id = ? ORDER BY updated_at DESC",
            (current_user["id"],)
        )
        cases = cursor.fetchall()
        conn.close()

        return {
            "success": True,
            "cases": [
                {
                    "id": case[0],
                    "case_number": case[1],
                    "title": case[2],
                    "case_type": case[3],
                    "created_at": case[4],
                    "updated_at": case[5]
                }
                for case in cases
            ]
        }
    except Exception as e:
        logger.error(f"Get cases error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve cases: {str(e)}")

@app.get("/api/cases/{case_id}")
async def get_case(case_id: int, current_user: Dict = Depends(get_current_user)):
    """Get specific case (decrypted)"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT case_number, title, encrypted_data, created_at, updated_at FROM cases WHERE id = ? AND user_id = ?",
            (case_id, current_user["id"])
        )
        case = cursor.fetchone()
        conn.close()
        
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # Decrypt case data
        decrypted_data = decrypt_data(case[2])
        
        return {
            "success": True,
            "case": {
                "id": case_id,
                "case_number": case[0],
                "title": case[1],
                "created_at": case[3],
                "updated_at": case[4],
                **decrypted_data
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get case error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve case: {str(e)}")

@app.put("/api/cases/{case_id}")
async def update_case(case_id: int, case_update: CaseUpdate, current_user: Dict = Depends(get_current_user)):
    """Update case (re-encrypted)"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Get existing case
        cursor.execute(
            "SELECT encrypted_data FROM cases WHERE id = ? AND user_id = ?",
            (case_id, current_user["id"])
        )
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # Decrypt, update, re-encrypt
        case_data = decrypt_data(existing[0])
        
        if case_update.title:
            case_data["title"] = case_update.title
        if case_update.description:
            case_data["description"] = case_update.description
        if case_update.facts:
            case_data["facts"] = case_update.facts
        if case_update.evidence:
            case_data["evidence"] = case_update.evidence
        
        encrypted_data = encrypt_data(case_data)
        
        # Update database
        cursor.execute(
            "UPDATE cases SET encrypted_data = ?, title = ?, updated_at = ? WHERE id = ?",
            (encrypted_data, case_update.title or case_data["title"], datetime.utcnow(), case_id)
        )
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "Case updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update case error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Case update failed: {str(e)}")

@app.delete("/api/cases/{case_id}")
async def delete_case(case_id: int, current_user: Dict = Depends(get_current_user)):
    """Delete case (permanent)"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Delete associated documents first
        cursor.execute("DELETE FROM documents WHERE case_id = ?", (case_id,))
        
        # Delete case
        cursor.execute(
            "DELETE FROM cases WHERE id = ? AND user_id = ?",
            (case_id, current_user["id"])
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Case not found")
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "Case deleted permanently"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete case error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Case deletion failed: {str(e)}")

@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "claude": bool(os.getenv("ANTHROPIC_API_KEY")),
            "api": True,
            "database": database_ok(),
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
        if not ai_engine:
            raise HTTPException(status_code=503, detail="AI engine unavailable. Set ANTHROPIC_API_KEY.")
        logger.info(f"Analyzing evidence: {request.file_name} ({request.file_type})")
        
        # In zero-knowledge mode, we work with encrypted data
        # For demo, we'll analyze based on metadata
        # In production, client would decrypt locally, send to AI, re-encrypt results
        
        # Build additional context from optional fields
        additional_context_parts = []
        if request.description:
            additional_context_parts.append(f"Beskrivelse: {request.description}")
        if request.case_context:
            additional_context_parts.append(f"Sakskontekst: {request.case_context}")
        additional_context = "\n".join(additional_context_parts)

        # Call AI engine with correct signature
        assessment = await ai_engine.analyze_evidence(
            file_name=request.file_name,
            file_type=request.file_type,
            file_size=request.file_size,
            case_type="criminal",
            additional_context=additional_context
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
        if not ai_engine:
            raise HTTPException(status_code=503, detail="AI engine unavailable. Set ANTHROPIC_API_KEY.")
        logger.info(f"Legal research query: {request.query[:100]}...")
        
        research = await ai_engine.legal_research(
            question=request.query,
            case_context=request.context or "",
            case_type=request.case_type or "criminal"
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


@app.post("/api/legal/chat")
async def legal_chat(request: ChatRequest):
    """Simple legal chat endpoint used by the frontend chat UI

    This endpoint forwards the user's message and a short conversation history to the AI engine
    and returns a concise assistant reply. It is intentionally lightweight to match the UI expectations.
    """
    try:
        logger.info(f"Legal chat message received (len={len(request.message)})")

        # Compose a compact prompt for the AI. Use conversation_history if provided to give context.
        history_text = ""
        if request.conversation_history:
            for h in request.conversation_history[-10:]:
                role = h.get("role", "user")
                content = h.get("content", "")
                history_text += f"{role}: {content}\n"

        prompt = (
            "Du er RettBot, en hjelpsom, kortfattet og nøyaktig norsk juridisk assistent. "
            "Svar tydelig på brukerens spørsmål, oppgi relevante lovhenvisninger når mulig, og hold svaret kort (2-6 setninger).\n"
            f"Kontekst:\n{history_text}\nBruker: {request.message}\nSvar:" 
        )

        # Use the ai_engine.simple_summary helper for a concise output
        ai_response = None
        if ai_engine and os.getenv("ANTHROPIC_API_KEY"):
            try:
                ai_response = await ai_engine.simple_summary(prompt)
            except Exception as e:
                logger.error(f"AI chat error: {str(e)}")
                ai_response = None

        if not ai_response:
            # Fallback deterministic reply
            ai_response = "Beklager, jeg har ikke tilgang til AI for øyeblikket. Prøv igjen senere eller still et kortere spørsmål."

        return {
            "success": True,
            "response": ai_response,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Error in legal chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@app.post("/api/defense/strategy")
async def build_defense_strategy(request: DefenseStrategyRequest):
    """
    Build comprehensive defense strategy using AI
    
    Analyzes case facts, charges, evidence to create multi-layered defense
    """
    if not ai_engine:
        raise HTTPException(status_code=503, detail="AI engine unavailable. Set ANTHROPIC_API_KEY.")
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
    if not ai_engine:
        raise HTTPException(status_code=503, detail="AI engine unavailable. Set ANTHROPIC_API_KEY.")
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
    if not ai_engine:
        raise HTTPException(status_code=503, detail="AI engine unavailable. Set ANTHROPIC_API_KEY.")
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
            # Convert typical_penalties object to string format that frontend expects
            penalties_obj = m["typical_penalties"]
            if isinstance(penalties_obj, dict):
                # Create a formatted string from the penalties object
                fine_part = penalties_obj.get("fine", "")
                imprisonment_part = penalties_obj.get("imprisonment", "")
                
                # Create range format: "fine - imprisonment" or just imprisonment if no fine
                if fine_part and imprisonment_part:
                    penalties_string = f"{fine_part} - {imprisonment_part}"
                else:
                    penalties_string = imprisonment_part or fine_part or "Ikke spesifisert"
            else:
                penalties_string = str(penalties_obj)
            
            item = {
                "statute": m["statute"],
                "description": m["description"],
                "typical_penalties": penalties_string,  # Now a string instead of object
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
            if ai_engine and os.getenv("ANTHROPIC_API_KEY"):
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


@app.get("/api/penalties/lookup")
async def penalties_lookup_get(offense: str, context: Optional[str] = None):
    """
    GET endpoint for penalty lookup (compatibility with frontend)
    """
    try:
        # Convert GET parameters to POST format
        request_data = PenaltyQuery(offense=offense, facts=context)
        
        # Call the main penalties logic
        query = offense.lower()
        facts = context or ""

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
            # Convert typical_penalties object to string format that frontend expects
            penalties_obj = m["typical_penalties"]
            if isinstance(penalties_obj, dict):
                # Create a formatted string from the penalties object
                fine_part = penalties_obj.get("fine", "")
                imprisonment_part = penalties_obj.get("imprisonment", "")
                
                # Create range format: "fine - imprisonment" or just imprisonment if no fine
                if fine_part and imprisonment_part:
                    penalties_string = f"{fine_part} - {imprisonment_part}"
                else:
                    penalties_string = imprisonment_part or fine_part or "Ikke spesifisert"
            else:
                penalties_string = str(penalties_obj)
                
            item = {
                "statute": m["statute"],
                "description": m["description"],
                "typical_penalties": penalties_string,  # Now a string instead of object
                "severity_factors": m["severity_factors"],
                "evidence_considerations": m["evidence_considerations"]
            }

            # Basic heuristic: if facts mention amounts or numbers, escalate
            if "mengde" in facts or any(c.isdigit() for c in facts):
                item["note"] = "Fakta indikerer potensielt høyere alvorlighetsgrad."

            results.append(item)

        if not results:
            return {
                "success": True, 
                "results": [], 
                "message": "Ingen direkte treff funnet. Prøv mer spesifikk beskrivelse."
            }

        return {
            "success": True,
            "results": results,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in penalties lookup: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Kunne ikke hente straffedata: {str(e)}")


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
            if ai_engine and os.getenv("ANTHROPIC_API_KEY"):
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
            if ai_engine and os.getenv("ANTHROPIC_API_KEY"):
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
            if ai_engine and os.getenv("ANTHROPIC_API_KEY"):
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


MAX_EVIDENCE_BYTES = 25 * 1024 * 1024  # 25 MB


@app.post("/api/evidence/upload")
async def upload_evidence_file(
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    case_ref: Optional[str] = Form(None),
    current_user: Dict = Depends(get_current_user),
):
    """
    Last opp en bevisfil.

    Innholdet krypteres server-side med Fernet (AES-128-CBC + HMAC) før det lagres
    i databasen, knyttet til den innloggede brukeren og en valgfri saksreferanse.
    """
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Filen er tom.")
        if len(content) > MAX_EVIDENCE_BYTES:
            raise HTTPException(status_code=413, detail="Filen er for stor (maks 25 MB).")

        encrypted = fernet.encrypt(content).decode()

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO evidence (user_id, case_ref, filename, file_type, size, description, encrypted_content) "
            "VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id",
            (current_user["id"], case_ref, file.filename, file.content_type, len(content), description, encrypted),
        )
        evidence_id = cursor.fetchone()[0]
        conn.commit()
        conn.close()

        logger.info(f"Stored encrypted evidence #{evidence_id} for user {current_user['id']}")

        return {
            "success": True,
            "file": {
                "id": evidence_id,
                "filename": file.filename,
                "size": len(content),
                "content_type": file.content_type,
                "uploaded": datetime.utcnow().isoformat(),
                "encrypted": True,
                "case_ref": case_ref,
            },
            "message": "Filen ble lastet opp og kryptert.",
        }

    except HTTPException:
        raise
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
# SPA Catch-All Route (MUST BE LAST!)
# ============================================

@app.get("/{path:path}", response_class=HTMLResponse, include_in_schema=False)
async def catch_all(path: str):
    """
    Catch-all route for SPA (Single Page Application) routing.
    This serves index.html for all frontend routes (e.g., /penalties, /legal-research, etc.)
    MUST be the last route defined to avoid overriding API endpoints.
    """
    # Skip API routes - they should not fall through to frontend
    if path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API endpoint not found")

    frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
    index_file = frontend_dist / "index.html"

    # Serve ekte statiske filer i dist-roten (robots.txt, sitemap.xml, favicon, ikoner, m.m.)
    # før vi faller tilbake til SPA index.html. Trygg mot path-traversal.
    if path and not path.endswith("/"):
        candidate = (frontend_dist / path).resolve()
        try:
            candidate.relative_to(frontend_dist.resolve())
            if candidate.is_file():
                return FileResponse(candidate)
        except (ValueError, OSError):
            pass

    if index_file.exists():
        return FileResponse(index_file)
    else:
        # Fallback for development
        return HTMLResponse(content=f"""
<!DOCTYPE html>
<html>
<head>
    <title>RettBot+ - Frontend ikke bygget</title>
</head>
<body>
    <h1>⚖️ RettBot+ API</h1>
    <p>Frontend er ikke bygget ennå.</p> 
    <p>Forsøkt rute: <code>/{path}</code></p>
    <p><a href="/api/health">API Health Check</a></p>
</body>
</html>
        """)

# ============================================
# Startup/Shutdown Events
# ============================================

@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info("🚀 RettBot+ API starting...")
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"Claude configured: {bool(os.getenv('ANTHROPIC_API_KEY'))}")
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
