"""
Tests for HTTPS redirect and HSTS security features
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.security_enhancements import SecurityHeaders, get_hsts_config
import os


@pytest.fixture
def client():
    """Create test client"""
    return TestClient(app)


class TestHTTPSRedirect:
    """Test HTTPS redirect middleware"""
    
    def test_http_redirects_to_https(self, client):
        """Test that HTTP requests are redirected to HTTPS"""
        # Make request with http scheme
        response = client.get("/api/health", follow_redirects=False)
        
        # Should get 307 redirect
        assert response.status_code == 307
        assert "https://" in response.headers["location"]
    
    def test_x_forwarded_proto_https_no_redirect(self, client):
        """Test that X-Forwarded-Proto: https bypasses redirect"""
        # Make request with X-Forwarded-Proto header
        response = client.get(
            "/api/health",
            headers={"X-Forwarded-Proto": "https"}
        )
        
        # Should NOT redirect
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
    
    def test_force_https_disabled(self, client, monkeypatch):
        """Test that FORCE_HTTPS=false disables redirect"""
        # Temporarily disable FORCE_HTTPS
        monkeypatch.setenv("FORCE_HTTPS", "false")
        
        # Note: This test won't work as expected because the app is already initialized
        # In production, this would need app restart
        # This is a placeholder for documentation purposes


class TestHSTSHeaders:
    """Test HSTS and other security headers"""
    
    def test_hsts_header_present(self, client):
        """Test that HSTS header is present in responses"""
        response = client.get(
            "/api/health",
            headers={"X-Forwarded-Proto": "https"}
        )
        
        assert "strict-transport-security" in response.headers
        hsts = response.headers["strict-transport-security"]
        assert "max-age=" in hsts
        assert "includeSubDomains" in hsts
    
    def test_hsts_preload_directive(self, client):
        """Test that HSTS preload directive is included by default"""
        response = client.get(
            "/api/health",
            headers={"X-Forwarded-Proto": "https"}
        )
        
        hsts = response.headers["strict-transport-security"]
        assert "preload" in hsts
    
    def test_all_security_headers_present(self, client):
        """Test that all security headers are present"""
        response = client.get(
            "/api/health",
            headers={"X-Forwarded-Proto": "https"}
        )
        
        required_headers = [
            "x-content-type-options",
            "x-frame-options",
            "x-xss-protection",
            "strict-transport-security",
            "content-security-policy",
            "referrer-policy",
            "permissions-policy"
        ]
        
        for header in required_headers:
            assert header in response.headers, f"Missing header: {header}"
    
    def test_x_content_type_options(self, client):
        """Test X-Content-Type-Options header"""
        response = client.get(
            "/api/health",
            headers={"X-Forwarded-Proto": "https"}
        )
        
        assert response.headers["x-content-type-options"] == "nosniff"
    
    def test_x_frame_options(self, client):
        """Test X-Frame-Options header"""
        response = client.get(
            "/api/health",
            headers={"X-Forwarded-Proto": "https"}
        )
        
        assert response.headers["x-frame-options"] == "DENY"
    
    def test_csp_header(self, client):
        """Test Content-Security-Policy header"""
        response = client.get(
            "/api/health",
            headers={"X-Forwarded-Proto": "https"}
        )
        
        csp = response.headers["content-security-policy"]
        assert "default-src 'self'" in csp
        assert "upgrade-insecure-requests" in csp


class TestSecurityHeadersClass:
    """Test SecurityHeaders class methods"""
    
    def test_get_headers_default(self):
        """Test get_headers with default parameters"""
        headers = SecurityHeaders.get_headers()
        
        assert "Strict-Transport-Security" in headers
        hsts = headers["Strict-Transport-Security"]
        assert "max-age=31536000" in hsts
        assert "includeSubDomains" in hsts
        assert "preload" in hsts
    
    def test_get_headers_custom_max_age(self):
        """Test get_headers with custom max-age"""
        headers = SecurityHeaders.get_headers(hsts_max_age=3600)
        
        hsts = headers["Strict-Transport-Security"]
        assert "max-age=3600" in hsts
    
    def test_get_headers_no_preload(self):
        """Test get_headers without preload directive"""
        headers = SecurityHeaders.get_headers(include_hsts_preload=False)
        
        hsts = headers["Strict-Transport-Security"]
        assert "preload" not in hsts
        assert "includeSubDomains" in hsts
    
    def test_get_headers_all_required_present(self):
        """Test that all required headers are present"""
        headers = SecurityHeaders.get_headers()
        
        required = [
            "X-Content-Type-Options",
            "X-Frame-Options",
            "X-XSS-Protection",
            "Strict-Transport-Security",
            "Content-Security-Policy",
            "Referrer-Policy",
            "Permissions-Policy"
        ]
        
        for header in required:
            assert header in headers


class TestHSTSConfig:
    """Test HSTS configuration function"""
    
    def test_get_hsts_config_defaults(self):
        """Test get_hsts_config with default values"""
        max_age, preload = get_hsts_config()
        
        assert max_age == 31536000  # 1 year
        assert preload is True
    
    def test_get_hsts_config_custom(self, monkeypatch):
        """Test get_hsts_config with custom environment variables"""
        monkeypatch.setenv("HSTS_MAX_AGE", "7200")
        monkeypatch.setenv("HSTS_PRELOAD", "false")
        
        max_age, preload = get_hsts_config()
        
        assert max_age == 7200
        assert preload is False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
