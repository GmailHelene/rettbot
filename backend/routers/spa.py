"""SPA-servering: PWA-filer, forside og catch-all (med SEO-injeksjon)."""

import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, HTMLResponse

from backend.seo import render_for_path

logger = logging.getLogger(__name__)
router = APIRouter()

_FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"


@router.get("/manifest.webmanifest")
async def serve_manifest():
    for name in ("manifest.webmanifest", "manifest.json"):
        f = _FRONTEND_DIST / name
        if f.exists():
            return FileResponse(f)
    raise HTTPException(status_code=404, detail="Manifest not found")


@router.get("/registerSW.js")
async def serve_register_sw():
    f = _FRONTEND_DIST / "registerSW.js"
    if f.exists():
        return FileResponse(f)
    raise HTTPException(status_code=404, detail="registerSW.js not found")


@router.get("/sw.js")
async def serve_sw():
    f = _FRONTEND_DIST / "sw.js"
    if f.exists():
        return FileResponse(f)
    raise HTTPException(status_code=404, detail="Service worker not found")


@router.get("/workbox-{filename}")
async def serve_workbox(filename: str):
    f = _FRONTEND_DIST / f"workbox-{filename}"
    if f.exists():
        return FileResponse(f)
    raise HTTPException(status_code=404, detail="Workbox file not found")


@router.get("/", response_class=HTMLResponse)
async def root():
    """Serve frontend index.html"""
    frontend_dist = Path(__file__).resolve().parents[2] / "frontend" / "dist"
    index_file = frontend_dist / "index.html"

    if index_file.exists():
        return HTMLResponse(content=render_for_path(str(index_file), "/"))
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

@router.get("/{path:path}", response_class=HTMLResponse, include_in_schema=False)
async def catch_all(path: str):
    """
    Catch-all route for SPA (Single Page Application) routing.
    This serves index.html for all frontend routes (e.g., /penalties, /legal-research, etc.)
    MUST be the last route defined to avoid overriding API endpoints.
    """
    # Skip API routes - they should not fall through to frontend
    if path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API endpoint not found")

    frontend_dist = Path(__file__).resolve().parents[2] / "frontend" / "dist"
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
        return HTMLResponse(content=render_for_path(str(index_file), "/" + path))
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
