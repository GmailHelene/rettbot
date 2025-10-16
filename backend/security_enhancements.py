"""
Enhanced Security Features for RettBot Authentication
=====================================================

This module implements rate limiting and additional security measures
to protect the authentication system from brute force attacks and other
security threats.
"""

import time
import hashlib
from typing import Dict, List, Optional
from fastapi import HTTPException, Request
from datetime import datetime, timedelta

class RateLimiter:
    """Rate limiter for API endpoints"""
    
    def __init__(self):
        self.requests: Dict[str, List[float]] = {}
        self.blocked_ips: Dict[str, datetime] = {}
    
    def is_allowed(self, client_ip: str, max_requests: int = 5, window_minutes: int = 15) -> bool:
        """Check if request is allowed based on rate limits"""
        now = time.time()
        window_start = now - (window_minutes * 60)
        
        # Check if IP is temporarily blocked
        if client_ip in self.blocked_ips:
            if datetime.utcnow() < self.blocked_ips[client_ip]:
                return False
            else:
                # Unblock IP
                del self.blocked_ips[client_ip]
        
        # Initialize or clean old requests for this IP
        if client_ip not in self.requests:
            self.requests[client_ip] = []
        
        # Remove old requests outside window
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if req_time >= window_start
        ]
        
        # Check if within limit
        if len(self.requests[client_ip]) >= max_requests:
            # Block IP for increasing duration based on violations
            block_duration = min(60 * (len(self.requests[client_ip]) - max_requests + 1), 3600)  # Max 1 hour
            self.blocked_ips[client_ip] = datetime.utcnow() + timedelta(seconds=block_duration)
            return False
        
        # Add current request
        self.requests[client_ip].append(now)
        return True

class SecurityHeaders:
    """Security headers for enhanced protection"""
    
    @staticmethod
    def get_headers() -> Dict[str, str]:
        """Get security headers"""
        return {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
            "Content-Security-Policy": "default-src 'self' https:; upgrade-insecure-requests; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.openai.com;",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
        }

class PasswordStrengthValidator:
    """Validate password strength"""
    
    @staticmethod
    def validate(password: str) -> tuple[bool, List[str]]:
        """Validate password strength and return issues"""
        issues = []
        
        if len(password) < 8:
            issues.append("Password must be at least 8 characters long")
        
        if len(password) > 128:
            issues.append("Password must be less than 128 characters")
        
        if not any(c.islower() for c in password):
            issues.append("Password must contain at least one lowercase letter")
        
        if not any(c.isupper() for c in password):
            issues.append("Password must contain at least one uppercase letter")
        
        if not any(c.isdigit() for c in password):
            issues.append("Password must contain at least one number")
        
        # Check for common weak passwords
        common_passwords = [
            "password", "123456", "password123", "admin", "qwerty",
            "letmein", "welcome", "monkey", "dragon", "password1"
        ]
        
        if password.lower() in common_passwords:
            issues.append("Password is too common and easily guessed")
        
        return len(issues) == 0, issues

class SessionSecurity:
    """Enhanced session security"""
    
    def __init__(self):
        self.active_sessions: Dict[str, Dict] = {}
    
    def create_session(self, user_id: int, client_ip: str, user_agent: str) -> str:
        """Create secure session"""
        import secrets
        
        session_id = secrets.token_urlsafe(32)
        
        self.active_sessions[session_id] = {
            "user_id": user_id,
            "client_ip": client_ip,
            "user_agent": user_agent,
            "created_at": datetime.utcnow(),
            "last_activity": datetime.utcnow(),
            "suspicious_activity": 0
        }
        
        return session_id
    
    def validate_session(self, session_id: str, client_ip: str, user_agent: str) -> bool:
        """Validate session and detect suspicious activity"""
        if session_id not in self.active_sessions:
            return False
        
        session = self.active_sessions[session_id]
        
        # Check for IP changes (suspicious)
        if session["client_ip"] != client_ip:
            session["suspicious_activity"] += 1
            
        # Check for user agent changes (suspicious)
        if session["user_agent"] != user_agent:
            session["suspicious_activity"] += 1
        
        # If too much suspicious activity, invalidate session
        if session["suspicious_activity"] >= 3:
            del self.active_sessions[session_id]
            return False
        
        # Update last activity
        session["last_activity"] = datetime.utcnow()
        
        # Clean up old sessions (24 hours)
        cutoff = datetime.utcnow() - timedelta(hours=24)
        expired_sessions = [
            sid for sid, sess in self.active_sessions.items()
            if sess["last_activity"] < cutoff
        ]
        
        for expired_sid in expired_sessions:
            del self.active_sessions[expired_sid]
        
        return True
    
    def invalidate_session(self, session_id: str):
        """Invalidate specific session"""
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]
    
    def invalidate_user_sessions(self, user_id: int):
        """Invalidate all sessions for a user"""
        sessions_to_remove = [
            sid for sid, sess in self.active_sessions.items()
            if sess["user_id"] == user_id
        ]
        
        for sid in sessions_to_remove:
            del self.active_sessions[sid]

# Global instances
rate_limiter = RateLimiter()
password_validator = PasswordStrengthValidator()
session_security = SessionSecurity()

def get_client_ip(request: Request) -> str:
    """Get real client IP considering proxies"""
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    return request.client.host if request.client else "unknown"

def check_rate_limit(request: Request, max_requests: int = 5, window_minutes: int = 15):
    """Decorator to check rate limits"""
    client_ip = get_client_ip(request)
    
    if not rate_limiter.is_allowed(client_ip, max_requests, window_minutes):
        raise HTTPException(
            status_code=429,
            detail=f"Too many requests. Please try again later."
        )

def validate_password_strength(password: str) -> None:
    """Validate password strength and raise exception if weak"""
    is_valid, issues = password_validator.validate(password)
    
    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail=f"Password requirements not met: {'; '.join(issues)}"
        )