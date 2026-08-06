"""Autentisering: registrering, innlogging og passord-reset."""

import hashlib
import logging
import os
import secrets
import smtplib
import uuid
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field

from backend.db import get_connection
from backend.deps import hash_password, verify_password, create_access_token
from backend.security_enhancements import validate_password_strength, check_rate_limit, get_client_ip

logger = logging.getLogger(__name__)
router = APIRouter()

# E-postkonfig (Brevo/SMTP) - MAIL_*-variabler med fallback til SMTP_*.
SMTP_SERVER = os.getenv("MAIL_SERVER") or os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("MAIL_PORT") or os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("MAIL_USERNAME") or os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("MAIL_PASSWORD") or os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("MAIL_DEFAULT_SENDER") or os.getenv("FROM_EMAIL", "noreply@rettbot.com")
MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "true").strip().lower() not in ("false", "0", "no")


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
            if MAIL_USE_TLS:
                server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            text = msg.as_string()
            server.sendmail(FROM_EMAIL, email, text)
            server.quit()
            return True
        else:
            # Kun i utvikling: logg reset-lenken lokalt. Aldri i produksjon
            # (reset-token gir tilgang til å bytte passord).
            if os.getenv("ENVIRONMENT", "development").lower() != "production":
                print(f"[dev] Password reset URL for {email}: {reset_url}")
            return True
            
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

@router.post("/api/auth/register", response_model=TokenResponse)
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

@router.post("/api/auth/login", response_model=TokenResponse)
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

@router.post("/api/auth/forgot-password")
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
