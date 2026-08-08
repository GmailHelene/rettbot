"""
Enhanced Security Features for RettBot Authentication
=====================================================

This module implements rate limiting and additional security measures
to protect the authentication system from brute force attacks and other
security threats.
"""

import os
import time
import hashlib
import logging
from typing import Dict, List, Optional
from fastapi import HTTPException, Request
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

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
            "Content-Security-Policy": (
                "default-src 'self'; "
                "upgrade-insecure-requests; "
                "script-src 'self' https://cloud.umami.is; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self' data:; "
                "connect-src 'self' https://cloud.umami.is https://gateway.umami.is; "
                "object-src 'none'; "
                "base-uri 'self'; "
                "frame-ancestors 'none'; "
                "form-action 'self';"
            ),
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

class RedisRateLimiter:
    """Delt rate limiting via Redis, så grensen virker på tvers av workers/replicas.

    Bruker et fast tidsvindu (INCR + EXPIRE). Ved Redis-feil faller den tilbake til
    en in-memory limiter, slik at en Redis-utfall ikke stopper appen."""

    def __init__(self, redis_url: str):
        import redis  # importeres kun når REDIS_URL er satt
        self._redis = redis.from_url(redis_url, socket_connect_timeout=2, socket_timeout=2)
        self._redis.ping()  # feiler tidlig hvis Redis ikke er tilgjengelig
        self._fallback = RateLimiter()

    def is_allowed(self, client_ip: str, max_requests: int = 5, window_minutes: int = 15) -> bool:
        try:
            window = window_minutes * 60
            bucket = int(time.time()) // window
            key = f"rl:{client_ip}:{window_minutes}:{bucket}"
            count = self._redis.incr(key)
            if count == 1:
                self._redis.expire(key, window)
            return count <= max_requests
        except Exception:
            logger.warning("Redis utilgjengelig - faller tilbake til in-memory rate limiting")
            return self._fallback.is_allowed(client_ip, max_requests, window_minutes)


def _build_rate_limiter():
    """Redis hvis REDIS_URL er satt (delt på tvers av workers), ellers in-memory."""
    redis_url = os.getenv("REDIS_URL")
    if redis_url:
        try:
            limiter = RedisRateLimiter(redis_url)
            logger.info("Rate limiting: bruker Redis (delt)")
            return limiter
        except Exception as e:  # noqa: BLE001
            logger.warning(f"Kunne ikke koble til Redis ({e}) - bruker in-memory rate limiting")
    return RateLimiter()


# Global instances
rate_limiter = _build_rate_limiter()
password_validator = PasswordStrengthValidator()

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