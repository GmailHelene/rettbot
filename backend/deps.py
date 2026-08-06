"""
Delte byggeklosser for RettBot+: konfig, kryptering, autentisering og AI-porten.

Ligger utenfor main.py slik at router-modulene kan importere dem uten sirkulær
import. Modulen validerer nøkler og initialiserer AI-motoren ved import (samme
oppførsel som før – kjøres tidlig fordi main importerer dette øverst).
"""

import os
import json
import logging
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

import jwt
import bcrypt
from cryptography.fernet import Fernet
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from backend.db import get_connection
from backend.security_enhancements import rate_limiter
from backend.ai_engine.claude_integration import ClaudeEngine

logger = logging.getLogger(__name__)

IS_PRODUCTION = os.getenv("ENVIRONMENT", "development").lower() == "production"

# --- Claude (Anthropic) engine (robust mot manglende nøkkel) ---
try:
    ai_engine = ClaudeEngine()
    logger.info("Claude engine initialized")
except Exception as e:  # noqa: BLE001
    ai_engine = None
    logger.warning(f"Claude engine not initialized: {e}")

# --- JWT ---
SECRET_KEY = os.getenv("JWT_SECRET")
if not SECRET_KEY:
    if IS_PRODUCTION:
        raise RuntimeError(
            "JWT_SECRET er ikke satt. Sett en fast, hemmelig verdi i Railway -> Variables. "
            "Generer med: python -c \"import secrets; print(secrets.token_urlsafe(48))\""
        )
    SECRET_KEY = secrets.token_urlsafe(32)
    logger.warning(
        "JWT_SECRET ikke satt - bruker midlertidig nøkkel (kun dev). "
        "Innlogginger blir ugyldige ved hver omstart."
    )
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 dager

# --- Kryptering (Fernet) ---
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    if IS_PRODUCTION:
        raise RuntimeError(
            "ENCRYPTION_KEY er ikke satt. Uten en fast nøkkel blir krypterte saksdata "
            "uleselige ved omstart. Sett den i Railway -> Variables. Generer med: "
            "python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
        )
    ENCRYPTION_KEY = Fernet.generate_key().decode()
    logger.warning(
        "ENCRYPTION_KEY ikke satt - genererer midlertidig nøkkel (kun dev). "
        "Krypterte data overlever IKKE en omstart."
    )
try:
    fernet = Fernet(ENCRYPTION_KEY.encode())
except Exception as exc:  # noqa: BLE001
    raise RuntimeError(
        "ENCRYPTION_KEY er ugyldig. Den må være en Fernet-nøkkel generert med "
        "Fernet.generate_key(). Feil: " + str(exc)
    )

# HTTP Bearer for JWT
security = HTTPBearer()


# --- Autentisering ---
def hash_password(password: str) -> str:
    """Hash passord med bcrypt."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    """Verifiser passord mot hash."""
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Lag et JWT access-token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def _extract_token(request: Request):
    """Hent JWT fra HttpOnly-cookie (foretrukket) eller Bearer-header (API-klienter)."""
    token = request.cookies.get("access_token")
    if token:
        return token
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return None


def get_current_user(request: Request) -> Dict[str, Any]:
    """Hent innlogget bruker fra JWT-token (HttpOnly-cookie eller Bearer-header)."""
    token = _extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, full_name FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        conn.close()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return {"id": user[0], "email": user[1], "full_name": user[2]}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")


# --- Kryptering av saksdata ---
def encrypt_data(data: dict) -> str:
    """Krypter en dict til streng (Fernet)."""
    return fernet.encrypt(json.dumps(data).encode()).decode()


def decrypt_data(encrypted_data: str) -> dict:
    """Dekrypter streng tilbake til dict."""
    return json.loads(fernet.decrypt(encrypted_data.encode()).decode())


# --- AI-porten (auth + samtykke + takst) ---
AI_RATE_LIMIT_MAX = int(os.getenv("AI_RATE_LIMIT_MAX", "30"))
AI_RATE_LIMIT_WINDOW_MIN = int(os.getenv("AI_RATE_LIMIT_WINDOW_MIN", "5"))


def _has_ai_consent(user_id: int) -> bool:
    """Har brukeren gitt eksplisitt samtykke til AI-behandling (GDPR art. 9 nr. 2 a)?"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM consents WHERE user_id = ? AND kind = ? LIMIT 1", (user_id, "ai"))
    row = cursor.fetchone()
    conn.close()
    return bool(row)


def ai_rate_limit(current_user: Dict = Depends(get_current_user)) -> Dict:
    """Auth + eksplisitt AI-samtykke + per-bruker takst. Route-dependency for AI-endepunkter."""
    if not _has_ai_consent(current_user["id"]):
        raise HTTPException(status_code=403, detail="AI-samtykke kreves før du kan bruke AI-funksjonene.")
    key = f"ai-user:{current_user['id']}"
    if not rate_limiter.is_allowed(key, max_requests=AI_RATE_LIMIT_MAX, window_minutes=AI_RATE_LIMIT_WINDOW_MIN):
        raise HTTPException(status_code=429, detail="For mange forespørsler på kort tid. Vent noen minutter før du prøver igjen.")
    return current_user


def user_rate_limit(current_user: Dict = Depends(get_current_user)) -> Dict:
    """Auth + per-bruker takst, UTEN AI-samtykke. For deterministiske endepunkter."""
    key = f"ai-user:{current_user['id']}"
    if not rate_limiter.is_allowed(key, max_requests=AI_RATE_LIMIT_MAX, window_minutes=AI_RATE_LIMIT_WINDOW_MIN):
        raise HTTPException(status_code=429, detail="For mange forespørsler på kort tid. Vent noen minutter før du prøver igjen.")
    return current_user
