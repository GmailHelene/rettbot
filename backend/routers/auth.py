"""Autentisering: registrering, innlogging og passord-reset."""

import hashlib
import logging
import os
import secrets
import smtplib
import uuid

import httpx
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any

from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr, Field

from backend.db import get_connection
from backend.deps import hash_password, verify_password, create_access_token, grant_access, SIGNUP_TRIAL_DAYS
from backend.security_enhancements import validate_password_strength, check_rate_limit, get_client_ip

logger = logging.getLogger(__name__)
router = APIRouter()

_IS_PROD = os.getenv("ENVIRONMENT", "development").lower() == "production"
_TOKEN_MAX_AGE = 60 * 60 * 24 * 7  # 7 dager


def _set_auth_cookies(response: Response, token: str) -> None:
    """Sett HttpOnly access-token-cookie + lesbar CSRF-cookie (double-submit).

    HttpOnly gjør at JavaScript (og dermed XSS) ikke kan lese tokenet. CSRF-cookien
    er lesbar og speiles i X-CSRF-Token-headeren på muterende kall (se CSRF-middleware)."""
    response.set_cookie(
        "access_token", token, max_age=_TOKEN_MAX_AGE, httponly=True,
        secure=_IS_PROD, samesite="lax", path="/",
    )
    response.set_cookie(
        "csrf_token", secrets.token_urlsafe(32), max_age=_TOKEN_MAX_AGE, httponly=False,
        secure=_IS_PROD, samesite="lax", path="/",
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("csrf_token", path="/")


@router.post("/api/auth/logout")
async def logout(response: Response):
    """Logg ut: fjern auth-cookies."""
    _clear_auth_cookies(response)
    return {"success": True}

# E-postkonfig (Brevo/SMTP) - MAIL_*-variabler med fallback til SMTP_*.
SMTP_SERVER = os.getenv("MAIL_SERVER") or os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("MAIL_PORT") or os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("MAIL_USERNAME") or os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("MAIL_PASSWORD") or os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("MAIL_DEFAULT_SENDER") or os.getenv("FROM_EMAIL", "noreply@rettbot.com")
MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "true").strip().lower() not in ("false", "0", "no")
BREVO_API_KEY = os.getenv("BREVO_API_KEY", "").strip()


def _send_email(to_email: str, subject: str, body: str) -> bool:
    """Send en e-post. Foretrekker Brevos HTTP-API (HTTPS 443), fordi Railway
    blokkerer utgående SMTP-porter (25/465/587) - da timer smtplib bare ut.
    Faller tilbake til SMTP kun hvis API-nøkkel mangler."""
    # 1) Brevo HTTP-API - anbefalt vei i produksjon.
    if BREVO_API_KEY:
        try:
            resp = httpx.post(
                "https://api.brevo.com/v3/smtp/email",
                headers={"api-key": BREVO_API_KEY, "content-type": "application/json"},
                json={
                    "sender": {"email": FROM_EMAIL},
                    "to": [{"email": to_email}],
                    "subject": subject,
                    "textContent": body,
                },
                timeout=15,
            )
            if resp.status_code < 300:
                logger.info("E-post sendt via Brevo API (%s)", resp.status_code)
                return True
            # Vanligste årsak til 400 her: avsender (MAIL_DEFAULT_SENDER) er ikke
            # en verifisert avsender i Brevo. resp.text sier det eksplisitt.
            logger.error("Brevo API avviste e-post (%s): %s", resp.status_code, resp.text[:300])
            return False
        except Exception as e:
            logger.error("Brevo API-kall feilet: %s: %s", type(e).__name__, e)
            return False
    # 2) Fallback: SMTP (kan time ut på Railway pga. blokkerte porter).
    if SMTP_USERNAME and SMTP_PASSWORD:
        try:
            msg = MIMEMultipart()
            msg["From"] = FROM_EMAIL
            msg["To"] = to_email
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "plain", "utf-8"))
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=15)
            if MAIL_USE_TLS:
                server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(FROM_EMAIL, to_email, msg.as_string())
            server.quit()
            logger.info("E-post sendt via SMTP")
            return True
        except Exception as e:
            logger.error(
                "SMTP-sending feilet via %s:%s (avsender=%s): %s: %s",
                SMTP_SERVER, SMTP_PORT, FROM_EMAIL, type(e).__name__, e,
            )
            return False
    # 3) Ingen e-postkonfig (typisk dev).
    if os.getenv("ENVIRONMENT", "development").lower() != "production":
        print(f"[dev] E-post ikke sendt (mangler BREVO_API_KEY/SMTP) til {to_email}: {subject}")
    return False


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

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetToken(BaseModel):
    token: str

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

def send_password_reset_email(email: str, reset_token: str, base_url: str = "http://localhost:5173"):
    """Send password reset email"""
    reset_url = f"{base_url}/reset-password?token={reset_token}"
    body = f"""Hei,

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
    # Dev uten e-postkonfig: logg lenken lokalt så flyten kan testes (aldri i prod).
    if not BREVO_API_KEY and not (SMTP_USERNAME and SMTP_PASSWORD):
        if os.getenv("ENVIRONMENT", "development").lower() != "production":
            print(f"[dev] Password reset URL for {email}: {reset_url}")
            return True
        return False
    return _send_email(email, "RettBot - Tilbakestill passord", body)

def send_welcome_email(email: str, full_name: str = "", base_url: str = "http://localhost:5173") -> bool:
    """Kort, ærlig velkomst-e-post til nye brukere. Best-effort: skal aldri
    blokkere registreringen (kalles inne i en egen try/except i register)."""
    fornavn = (full_name or "").strip().split(" ")[0]
    hilsen = f"Hei {fornavn}," if fornavn else "Hei,"
    body = f"""{hilsen}

Velkommen til RettBot+.

RettBot er et verktøy, ikke en advokat. Det hjelper deg å forstå din egen sak og stå litt stødigere når du står mot systemet.

Tre ting du kan starte med:
- Forstå et vedtak du har fått
- Finne ut hvilken klagefrist som gjelder
- Skrive en klage eller et innsynskrav

Én ting jeg vil være ærlig om: AI-en kan ta feil. Sjekk alltid lover, paragrafer og frister mot Lovdata før du sender noe. Verktøyet sier ifra om dette underveis.

Dataene dine er krypterte, og du kan når som helst laste ned eller slette alt under Min konto.

Kom i gang: {base_url}

Lykke til med saken din.

- RettBot+

---
Denne e-posten er automatisk generert. Ikke svar på den.
"""
    return _send_email(email, "Velkommen til RettBot+", body)


@router.post("/api/auth/register", response_model=TokenResponse)
async def register(user: UserRegister, req: Request, response: Response):
    """Register new user"""
    # Rate limiting for registration attempts
    check_rate_limit(req, max_requests=5, window_minutes=60)  # registrering: demper spam-kontoer
    
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

        # Velkomst-e-post (best-effort: skal ALDRI blokkere registreringen –
        # brukeren er allerede opprettet og skal inn uansett om e-posten feiler).
        try:
            welcome_base_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
            send_welcome_email(user.email, user.full_name or "", welcome_base_url)
        except Exception as e:
            logger.error(f"Velkomst-e-post feilet (registrering fortsetter): {e}")

        # Gratis prøveperiode automatisk (14 dager, ingen betaling/kort). Best-effort.
        try:
            if SIGNUP_TRIAL_DAYS > 0:
                grant_access(new_user[0], timedelta(days=SIGNUP_TRIAL_DAYS))
        except Exception as e:
            logger.error(f"Kunne ikke gi oppstarts-prøve (registrering fortsetter): {e}")

        # Create access token
        access_token = create_access_token(data={"sub": user.email})
        _set_auth_cookies(response, access_token)
        
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

@router.post("/api/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin, req: Request, response: Response):
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
        _set_auth_cookies(response, access_token)
        
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

@router.post("/api/auth/forgot-password")
async def forgot_password(request: PasswordResetRequest, req: Request):
    """Send password reset email"""
    check_rate_limit(req, max_requests=5, window_minutes=60)  # reset: strengt, men låser ikke ute en bruker som skriver feil e-post
    
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (request.email,))
        user = cursor.fetchone()
        
        if not user:
            # Svaret til brukeren avslører ikke om e-posten finnes (mot enumerering).
            # Men vi logger server-side, ellers er "jeg får ingen e-post" umulig å
            # feilsøke - og den desidert vanligste årsaken er nettopp at e-posten
            # ikke har en konto (da sendes det ingenting).
            logger.info("Reset forespurt for e-post uten konto - ingen e-post sendt")
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
            logger.error("Failed to send reset email")
            raise HTTPException(status_code=500, detail="Failed to send reset email")
        
        logger.info("Password reset email sent")
        return {"message": "If the email exists, you will receive a reset link"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Forgot password error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        conn.close()

@router.post("/api/auth/validate-reset-token")
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

@router.post("/api/auth/reset-password")
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

        # Engangstoken - slett etter bruk
        _delete_reset_token(request.token)

        logger.info("Password successfully reset")
        return {"message": "Password successfully reset"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reset password error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        if 'conn' in locals():
            conn.close()
