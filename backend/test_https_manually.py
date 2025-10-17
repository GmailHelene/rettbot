#!/usr/bin/env python3
"""
Test script to verify HTTPS redirect and HSTS configuration
"""

import requests
import sys
from typing import Dict


def test_https_redirect(base_url: str = "http://localhost:8000") -> None:
    """Test HTTPS redirect functionality"""
    print("=" * 70)
    print("Testing HTTPS Redirect and HSTS Configuration")
    print("=" * 70)
    
    # Test 1: HTTP should redirect to HTTPS
    print("\n1. Testing HTTP → HTTPS Redirect")
    print(f"   Request: GET {base_url}/api/health")
    try:
        response = requests.get(f"{base_url}/api/health", allow_redirects=False)
        print(f"   Status: {response.status_code}")
        if response.status_code == 307:
            print(f"   ✅ Redirect to: {response.headers.get('location', 'N/A')}")
        else:
            print(f"   ❌ Expected 307 redirect, got {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: X-Forwarded-Proto should bypass redirect
    print("\n2. Testing X-Forwarded-Proto: https")
    print(f"   Request: GET {base_url}/api/health (with X-Forwarded-Proto: https)")
    try:
        response = requests.get(
            f"{base_url}/api/health",
            headers={"X-Forwarded-Proto": "https"}
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   ✅ No redirect (correct behavior)")
        else:
            print(f"   ❌ Expected 200, got {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 3: Check HSTS header
    print("\n3. Testing HSTS Header")
    try:
        response = requests.get(
            f"{base_url}/api/health",
            headers={"X-Forwarded-Proto": "https"}
        )
        hsts = response.headers.get("Strict-Transport-Security", "Not found")
        print(f"   HSTS Header: {hsts}")
        
        if "max-age=" in hsts:
            print("   ✅ HSTS max-age present")
        if "includeSubDomains" in hsts:
            print("   ✅ includeSubDomains present")
        if "preload" in hsts:
            print("   ✅ preload directive present")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 4: Check other security headers
    print("\n4. Testing Other Security Headers")
    try:
        response = requests.get(
            f"{base_url}/api/health",
            headers={"X-Forwarded-Proto": "https"}
        )
        
        security_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Content-Security-Policy": "upgrade-insecure-requests",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "camera=()"
        }
        
        for header, expected_value in security_headers.items():
            actual = response.headers.get(header, "Not found")
            if expected_value in actual:
                print(f"   ✅ {header}: Present")
            else:
                print(f"   ❌ {header}: Missing or incorrect")
                print(f"      Expected: {expected_value}")
                print(f"      Got: {actual}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 70)
    print("Testing Complete!")
    print("=" * 70)


def main():
    """Main entry point"""
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
    test_https_redirect(base_url)


if __name__ == "__main__":
    main()
