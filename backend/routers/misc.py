"""Diverse offentlige endepunkter: helsesjekk og anonym nytte-tilbakemelding."""

import logging
import os
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from backend.db import get_connection, database_ok
from backend.security_enhancements import check_rate_limit

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/api/health")
async def health_check():
    """Detaljert helsesjekk."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "claude": bool(os.getenv("ANTHROPIC_API_KEY")),
            "api": True,
            "database": database_ok(),
            "redis": False,
        },
        "version": "1.0.0",
    }


class FeedbackRequest(BaseModel):
    """Anonym nytte-tilbakemelding fra brukeren (ingen PII forventet)."""
    tool: str = Field(..., max_length=80, description="Hvilket verktøy/side tilbakemeldingen gjelder")
    helpful: bool = Field(..., description="Opplevde brukeren det som nyttig?")
    sent_complaint: Optional[str] = Field(None, max_length=40, description="ja|nei|ikke_enda")
    comment: Optional[str] = Field(None, max_length=1000)


@router.post("/api/feedback")
async def submit_feedback(request: FeedbackRequest, req: Request):
    """Lagre anonym tilbakemelding om nytte. Ikke knyttet til bruker-ID."""
    # Lett takst mot spam (offentlig endepunkt, ingen innlogging kreves).
    check_rate_limit(req, max_requests=20, window_minutes=60)
    try:
        comment = (request.comment or "").strip()[:1000] or None
        sent = (request.sent_complaint or "").strip()[:40] or None
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO feedback (tool, helpful, sent_complaint, comment) VALUES (?, ?, ?, ?)",
            (request.tool.strip()[:80], 1 if request.helpful else 0, sent, comment),
        )
        conn.commit()
        conn.close()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Feedback save failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Kunne ikke lagre tilbakemelding")
