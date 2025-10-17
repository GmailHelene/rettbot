# RettBot+ Security Features

This document describes the security features implemented in RettBot+ to protect user data and ensure secure communication.

## Table of Contents

1. [HTTPS Redirect](#https-redirect)
2. [HSTS (HTTP Strict Transport Security)](#hsts-http-strict-transport-security)
3. [Security Headers](#security-headers)
4. [Rate Limiting](#rate-limiting)
5. [Password Security](#password-security)
6. [Session Security](#session-security)
7. [Configuration](#configuration)

---

## HTTPS Redirect

RettBot+ automatically redirects all HTTP requests to HTTPS in production environments to ensure encrypted communication.

### How It Works

- All HTTP requests receive a `307 Temporary Redirect` to the HTTPS equivalent
- Respects `X-Forwarded-Proto` header for proxy environments (e.g., Railway, Heroku)
- Can be disabled for local development

### Configuration

```bash
# .env file
FORCE_HTTPS=true  # Enable HTTPS redirect (default: true)
```

### Testing

```bash
# Test HTTP redirect
curl -I http://localhost:8000/api/health

# Test with X-Forwarded-Proto header (simulates proxy)
curl -I -H "X-Forwarded-Proto: https" http://localhost:8000/api/health
```

---

## HSTS (HTTP Strict Transport Security)

HSTS tells browsers to always use HTTPS for future connections, preventing downgrade attacks.

### Features

- **Max-Age**: Configurable duration (default: 1 year)
- **includeSubDomains**: Applies to all subdomains
- **preload**: Eligible for browser HSTS preload lists

### Configuration

```bash
# .env file
HSTS_MAX_AGE=31536000      # 1 year in seconds (default)
HSTS_PRELOAD=true          # Include preload directive (default)
```

### HSTS Preload List

To submit your domain to the HSTS preload list:

1. Configure HSTS with at least 1 year max-age
2. Include `includeSubDomains` and `preload` directives
3. Submit to: https://hstspreload.org/

**Note**: HSTS preload is permanent and cannot be easily undone. Only enable for production domains you fully control.

---

## Security Headers

RettBot+ implements comprehensive security headers to protect against common web vulnerabilities.

### Headers Applied

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Force HTTPS connections |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME-type sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking attacks |
| `X-XSS-Protection` | `1; mode=block` | Enable browser XSS protection |
| `Content-Security-Policy` | (See CSP section) | Control resource loading |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer information |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disable unnecessary features |

### Content Security Policy (CSP)

The CSP is configured to:

- Allow only HTTPS resources
- Automatically upgrade insecure requests
- Allow specific scripts and styles for PWA functionality
- Restrict connections to trusted APIs (OpenAI)

```
default-src 'self' https:; 
upgrade-insecure-requests; 
script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
style-src 'self' 'unsafe-inline'; 
img-src 'self' data: https:; 
font-src 'self' data:; 
connect-src 'self' https://api.openai.com;
```

---

## Rate Limiting

Protects against brute force attacks and API abuse.

### Features

- **IP-based tracking**: Monitors requests per IP address
- **Automatic blocking**: Temporarily blocks IPs exceeding limits
- **Escalating timeouts**: Block duration increases with violations

### Default Limits

| Endpoint | Max Requests | Time Window | Block Duration |
|----------|--------------|-------------|----------------|
| Registration | 3 | 60 minutes | Progressive (up to 1 hour) |
| Login | 5 | 15 minutes | Progressive (up to 1 hour) |
| General API | 5 | 15 minutes | Progressive (up to 1 hour) |

### Implementation

```python
# In endpoint handler
check_rate_limit(request, max_requests=5, window_minutes=15)
```

---

## Password Security

Implements industry-standard password security practices.

### Requirements

- Minimum 8 characters
- Maximum 128 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- Not in common password list

### Hashing

- **Algorithm**: bcrypt
- **Cost factor**: 12 (configurable)
- **Salt**: Automatically generated per password

### Implementation

```python
# Validate password strength
validate_password_strength(password)

# Hash password
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
```

---

## Session Security

Protects user sessions from hijacking and unauthorized access.

### Features

- **Secure session IDs**: Cryptographically random tokens (32 bytes)
- **IP tracking**: Detects session hijacking attempts
- **User-Agent tracking**: Identifies suspicious client changes
- **Automatic expiration**: Sessions expire after 24 hours
- **Suspicious activity monitoring**: Progressive security response

### Session Validation

Sessions are validated on each request:

1. Check session exists
2. Verify IP address matches
3. Verify User-Agent matches
4. Check for excessive suspicious activity
5. Update last activity timestamp

---

## Configuration

### Environment Variables

All security features can be configured via environment variables:

```bash
# HTTPS & HSTS
FORCE_HTTPS=true               # Enable HTTPS redirect (production)
HSTS_MAX_AGE=31536000         # HSTS max-age in seconds (1 year)
HSTS_PRELOAD=true             # Include HSTS preload directive

# JWT Authentication
JWT_SECRET=your-secret-here    # Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=your-key-here       # Generate with: openssl rand -hex 32

# CORS
CORS_ORIGINS=https://rettbot.com,https://www.rettbot.com

# Environment
ENVIRONMENT=production         # production, staging, or development
```

### Development vs Production

#### Development (FORCE_HTTPS=false)

- HTTPS redirect disabled for local testing
- HSTS still applied but not enforced
- CORS allows localhost origins

#### Production (FORCE_HTTPS=true)

- Automatic HTTPS redirect
- HSTS enforced with long max-age
- CORS restricted to production domains
- Rate limiting strictly enforced

---

## Testing Security Features

### Manual Testing

```bash
# Test HTTPS redirect
curl -I http://localhost:8000/api/health

# Test security headers
curl -I -H "X-Forwarded-Proto: https" http://localhost:8000/api/health

# Test rate limiting (run multiple times quickly)
for i in {1..10}; do curl http://localhost:8000/api/health; done
```

### Automated Testing

```bash
# Run security tests
cd backend
pytest test_security.py -v

# Run specific test class
pytest test_security.py::TestHSTSHeaders -v
```

---

## Security Checklist for Deployment

Before deploying to production:

- [ ] Set `FORCE_HTTPS=true` in environment variables
- [ ] Configure `HSTS_MAX_AGE=31536000` (1 year minimum)
- [ ] Set `HSTS_PRELOAD=true` for HSTS preload list eligibility
- [ ] Generate strong `JWT_SECRET` (32+ characters)
- [ ] Generate strong `SECRET_KEY` (64+ hex characters)
- [ ] Configure `CORS_ORIGINS` with production domains only
- [ ] Verify HTTPS certificate is valid and trusted
- [ ] Test all security headers are present
- [ ] Test HTTPS redirect works correctly
- [ ] Test rate limiting prevents abuse
- [ ] Review and adjust CSP as needed

---

## Security Best Practices

### For Developers

1. **Never commit secrets**: Use `.env` files (gitignored)
2. **Rotate secrets regularly**: Update JWT_SECRET and SECRET_KEY periodically
3. **Test security features**: Run `pytest test_security.py` before deployment
4. **Monitor logs**: Watch for suspicious activity and rate limit violations
5. **Keep dependencies updated**: Regularly update security-related packages

### For Deployment

1. **Use HTTPS everywhere**: No HTTP in production
2. **Enable HSTS preload**: Submit domain to browser preload lists
3. **Configure CSP carefully**: Balance security and functionality
4. **Monitor security headers**: Use tools like securityheaders.com
5. **Regular security audits**: Review and update security measures

---

## Security Tools & Resources

### Testing Tools

- **SSL Labs**: https://www.ssllabs.com/ssltest/ - Test SSL/TLS configuration
- **Security Headers**: https://securityheaders.com/ - Test security headers
- **HSTS Preload**: https://hstspreload.org/ - Submit for HSTS preload list
- **Observatory**: https://observatory.mozilla.org/ - Comprehensive security scan

### Documentation

- **OWASP**: https://owasp.org/ - Web application security best practices
- **MDN Security**: https://developer.mozilla.org/en-US/docs/Web/Security
- **FastAPI Security**: https://fastapi.tiangolo.com/tutorial/security/

---

## Reporting Security Issues

If you discover a security vulnerability in RettBot+:

1. **DO NOT** open a public issue
2. Contact the maintainers privately
3. Provide detailed reproduction steps
4. Allow reasonable time for fixes before disclosure

---

## Changelog

### Version 1.0.0 (2025-10-17)

- ✅ Implemented HTTPS redirect middleware
- ✅ Added configurable HSTS headers
- ✅ Comprehensive security headers
- ✅ Rate limiting for authentication endpoints
- ✅ Password strength validation
- ✅ Session security with hijacking detection
- ✅ Environment-based configuration
- ✅ Automated security tests

---

**Last Updated**: October 17, 2025  
**Version**: 1.0.0  
**Status**: Production Ready
