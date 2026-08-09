"""Betaling: dagspass (Stripe engangskjøp) + prøvekode + tilgangsstatus.

Modell: gratis kjerne + et lite antall AI-kjøringer (FREE_AI_LIMIT). Deretter
enten dagspass (Stripe engangsbetaling → 24t full tilgang) eller en prøvekode
(7 dager, én gang per konto). Tilgang lagres som access_until på users-raden.
"""

import logging
import os
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from backend.db import get_connection
from backend.deps import (
    get_current_user,
    has_active_pass,
    grant_access,
    FREE_AI_LIMIT,
    DAGSPASS_HOURS,
    TRIAL_DAYS,
)

logger = logging.getLogger(__name__)
router = APIRouter()

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "").strip()
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "").strip()
DAGSPASS_PRICE_ORE = int(os.getenv("DAGSPASS_PRICE_ORE", "7900"))  # 79,00 kr
CURRENCY = os.getenv("DAGSPASS_CURRENCY", "nok")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
TRIAL_CODE = os.getenv("TRIAL_CODE", "").strip()

try:
    import stripe
    if STRIPE_SECRET_KEY:
        stripe.api_key = STRIPE_SECRET_KEY
except Exception:  # pragma: no cover
    stripe = None


class RedeemRequest(BaseModel):
    code: str


def _access_status(user_id: int) -> dict:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT access_until, ai_free_used, trial_used FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    conn.close()
    ai_free_used = (row[1] or 0) if row and row[1] is not None else 0
    trial_used = bool(row[2]) if row and len(row) > 2 and row[2] else False
    active = has_active_pass(user_id)
    return {
        "has_access": active,
        "access_until": (row[0] if row else None) if active else None,
        "ai_free_used": ai_free_used,
        "ai_free_limit": FREE_AI_LIMIT,
        "ai_free_left": max(0, FREE_AI_LIMIT - ai_free_used),
        "trial_used": trial_used,
        "price_kr": round(DAGSPASS_PRICE_ORE / 100),
        "dagspass_hours": DAGSPASS_HOURS,
        "trial_days": TRIAL_DAYS,
        "payment_configured": bool(stripe and STRIPE_SECRET_KEY),
    }


@router.get("/api/billing/status")
async def billing_status(current_user: dict = Depends(get_current_user)):
    """Brukerens tilgangsstatus: aktivt pass, gjenværende gratiskvote, pris osv."""
    return _access_status(current_user["id"])


@router.post("/api/billing/create-checkout-session")
async def create_checkout_session(current_user: dict = Depends(get_current_user)):
    """Start en Stripe Checkout-økt for dagspass. Returnerer URL til Stripes
    hostede betalingsside (appen håndterer aldri kortdata selv)."""
    if not (stripe and STRIPE_SECRET_KEY):
        raise HTTPException(status_code=503, detail="Betaling er ikke konfigurert ennå.")
    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            line_items=[{
                "quantity": 1,
                "price_data": {
                    "currency": CURRENCY,
                    "unit_amount": DAGSPASS_PRICE_ORE,
                    "product_data": {
                        "name": f"RettBot+ Dagspass ({DAGSPASS_HOURS} timer)",
                        "description": "Full tilgang til AI-verktøyene og PDF-saksmappe.",
                    },
                },
            }],
            client_reference_id=str(current_user["id"]),
            metadata={"user_id": str(current_user["id"])},
            success_url=f"{FRONTEND_URL}/dagspass/kvittering?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/dagspass?avbrutt=1",
        )
        return {"url": session.url}
    except Exception as e:
        logger.error("Stripe checkout-feil: %s: %s", type(e).__name__, e)
        raise HTTPException(status_code=502, detail="Kunne ikke starte betaling. Prøv igjen.")


@router.post("/api/billing/webhook")
async def stripe_webhook(request: Request):
    """Stripe kaller denne ved betalingshendelser. Verifiserer signatur og gir
    dagspass ved fullført betaling. Ingen auth-cookie → ikke CSRF-beskyttet."""
    if not (stripe and STRIPE_WEBHOOK_SECRET):
        raise HTTPException(status_code=503, detail="Webhook ikke konfigurert.")
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except Exception as e:
        logger.error("Stripe webhook-signatur ugyldig: %s", e)
        raise HTTPException(status_code=400, detail="Ugyldig signatur.")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        if session.get("payment_status") == "paid":
            user_id = (session.get("metadata") or {}).get("user_id") or session.get("client_reference_id")
            if user_id:
                try:
                    until = grant_access(int(user_id), timedelta(hours=DAGSPASS_HOURS))
                    logger.info("Dagspass gitt til bruker %s til %s", user_id, until.isoformat())
                except Exception as e:
                    logger.error("Klarte ikke gi dagspass til %s: %s", user_id, e)
    return {"received": True}


@router.post("/api/billing/redeem")
async def redeem_code(body: RedeemRequest, current_user: dict = Depends(get_current_user)):
    """Løs inn en prøvekode → full tilgang i TRIAL_DAYS. Én gang per konto."""
    code = (body.code or "").strip()
    if not code:
        raise HTTPException(status_code=400, detail="Skriv inn en kode.")
    if not TRIAL_CODE or code.lower() != TRIAL_CODE.lower():
        raise HTTPException(status_code=400, detail="Ugyldig kode.")

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT trial_used FROM users WHERE id = ?", (current_user["id"],))
    row = cur.fetchone()
    if row and row[0]:
        conn.close()
        raise HTTPException(status_code=409, detail="Du har allerede brukt en prøvekode.")
    cur.execute("UPDATE users SET trial_used = 1 WHERE id = ?", (current_user["id"],))
    conn.commit()
    conn.close()

    until = grant_access(current_user["id"], timedelta(days=TRIAL_DAYS))
    return {"success": True, "access_until": until.isoformat(), "days": TRIAL_DAYS}
