"""
RettBot+ Backend API
FastAPI REST API for et AI-assistert juridisk verktøy. Data krypteres server-side
(ikke zero-knowledge/klient-side).
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
from backend.security_enhancements import (
    check_rate_limit,
    validate_password_strength,
    SecurityHeaders,
    get_client_ip,
    rate_limiter
)
from backend.seo import render_for_path
from backend.routers.misc import router as misc_router
from backend.routers.auth import router as auth_router
from backend.routers.user import router as user_router
from backend.routers.cases import router as cases_router
from backend.routers.ai import router as ai_router
from backend.routers.spa import router as spa_router
from backend.deps import (
    IS_PRODUCTION,
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ENCRYPTION_KEY,
    fernet,
    security,
    ai_engine,
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    encrypt_data,
    decrypt_data,
    AI_RATE_LIMIT_MAX,
    AI_RATE_LIMIT_WINDOW_MIN,
    _has_ai_consent,
    ai_rate_limit,
    user_rate_limit,
)
import json

# Import AI engine
from backend.ai_engine.claude_integration import ClaudeEngine

# Load environment variables
load_dotenv()

# Configure logging. JSON i produksjon (enklere å søke i Railway-loggene),
# lesbar tekst lokalt. Styres av LOG_JSON (standard: på i prod, av i dev).
_log_json = os.getenv(
    "LOG_JSON",
    "true" if os.getenv("ENVIRONMENT", "development").lower() == "production" else "false",
).strip().lower() == "true"
_log_handler = logging.StreamHandler()
if _log_json:
    try:
        from pythonjsonlogger import jsonlogger
        _log_handler.setFormatter(jsonlogger.JsonFormatter("%(asctime)s %(name)s %(levelname)s %(message)s"))
    except Exception:
        _log_handler.setFormatter(logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s"))
else:
    _log_handler.setFormatter(logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s"))
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"), handlers=[_log_handler], force=True)
logger = logging.getLogger(__name__)

# Feilovervåking (Sentry) - dormant til SENTRY_DSN settes i miljøet (Railway).
# Personvern er kritisk her: send_default_pii=False + en before_send som dropper
# request-body, cookies og auth-headere, så saksinnlagt tekst/PII aldri havner i
# Sentry. Uten DSN importeres ikke sentry_sdk i det hele tatt.
_SENTRY_DSN = os.getenv("SENTRY_DSN", "").strip()
if _SENTRY_DSN:
    try:
        import sentry_sdk

        def _sentry_scrub(event, hint):
            req = event.get("request")
            if req:
                req.pop("data", None)
                req.pop("cookies", None)
                req.pop("query_string", None)
                headers = req.get("headers")
                if isinstance(headers, dict):
                    req["headers"] = {
                        k: v for k, v in headers.items()
                        if k.lower() not in ("authorization", "cookie", "x-csrf-token")
                    }
            event.pop("extra", None)
            return event

        sentry_sdk.init(
            dsn=_SENTRY_DSN,
            environment=os.getenv("ENVIRONMENT", "development"),
            traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.0") or 0.0),
            send_default_pii=False,
            before_send=_sentry_scrub,
        )
        logger.info("Sentry feilovervåking aktivert")
    except Exception as e:
        logger.warning(f"Sentry-init feilet (fortsetter uten): {e}")

# Initialize FastAPI app.
# Skru av interaktiv API-dokumentasjon (/docs, /redoc, /openapi.json) i produksjon
# så API-flaten ikke eksponeres offentlig.
_is_production = os.getenv("ENVIRONMENT", "development").lower() == "production"
app = FastAPI(
    title="RettBot+ API",
    description="AI-assistert juridisk verktøy for norske borgere. Data krypteres server-side (ikke zero-knowledge).",
    version="1.0.0",
    docs_url=None if _is_production else "/docs",
    redoc_url=None if _is_production else "/redoc",
    openapi_url=None if _is_production else "/openapi.json",
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


# CSRF-vern for cookie-basert auth: på muterende kall (POST/PUT/DELETE/PATCH) mot
# /api/ må X-CSRF-Token-headeren matche csrf_token-cookien. Gjelder kun når
# access_token-cookien finnes; Bearer-header-klienter er ikke utsatt for CSRF.
@app.middleware("http")
async def csrf_protect(request: Request, call_next):
    if request.method in ("POST", "PUT", "DELETE", "PATCH") and request.url.path.startswith("/api/"):
        if request.cookies.get("access_token"):
            csrf_cookie = request.cookies.get("csrf_token")
            csrf_header = request.headers.get("X-CSRF-Token")
            if not csrf_cookie or csrf_header != csrf_cookie:
                return JSONResponse(status_code=403, content={"detail": "CSRF-validering feilet"})
    return await call_next(request)



# Database - SQLite lokalt, PostgreSQL i produksjon (via DATABASE_URL). Se backend/db.py.
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

    # Password reset tokens (hashet - overlever omstart, persistent på tvers av workere)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            token_hash TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            used INTEGER NOT NULL DEFAULT 0
        )
    """)

    # Anonym nytte-tilbakemelding (ingen PII, ikke knyttet til bruker)
    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS feedback (
            id {ID_COLUMN},
            tool TEXT,
            helpful INTEGER,
            sent_complaint TEXT,
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Samtykker (f.eks. eksplisitt samtykke til AI-behandling, GDPR art. 9 nr. 2 a).
    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS consents (
            id {ID_COLUMN},
            user_id INTEGER NOT NULL,
            kind TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()
    logger.info("Database initialized successfully")

# Initialize database on startup
init_database()

# Router-moduler (main.py splittes gradvis opp i backend/routers/).
app.include_router(misc_router)
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(cases_router)
app.include_router(ai_router)

# Mount static files (frontend)
# Check if frontend/dist exists (production) or serve placeholder
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")
    logger.info(f"Mounted frontend static files from {frontend_dist}")

# ============================================
# Request/Response Models
# ============================================

# Authentication Models





# Password Reset Token Storage - lagres hashet i databasen slik at de overlever
# omstart og fungerer på tvers av flere prosesser/instanser.












# Existing Models







class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: str
    ai_configured: bool


# ============================================
# Rights Protection Module
# ============================================



# Rights Protection Database - handles rejections, violations, and appeals


# ============================================
# Penalties DB (minimal, deterministic dataset)
# ============================================


# Minimal mapping: offense keywords -> statutes and typical penalty ranges



# ============================================
# API Endpoints
# ============================================











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









# ============================================
# Saks-tidslinje (kryptert)
# ============================================











# ============================================
# Lagrede dokumenter/brev (kryptert)
# ============================================













# ============================================
# Case Management Endpoints (Encrypted)
# ============================================































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


# SPA-router inkluderes SIST: catch-all-ruten (/{path:path}) må registreres
# etter alle API-ruter, ellers fanger den opp API-kallene.
app.include_router(spa_router)


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
