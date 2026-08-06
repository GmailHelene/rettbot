"""Bruker og konto: profil, GDPR-eksport, sletting og AI-samtykke."""

import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse

from backend.db import get_connection
from backend.deps import get_current_user, encrypt_data, decrypt_data, fernet, _has_ai_consent

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/api/auth/me")
async def get_current_user_info(current_user: Dict = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.get("/api/user/export")
async def export_user_data(current_user: Dict = Depends(get_current_user)):
    """GDPR: last ned alle data om den innloggede brukeren som JSON (innsyn + portabilitet)."""
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id, email, full_name, created_at, last_login FROM users WHERE id = ?",
            (current_user["id"],),
        )
        u = cursor.fetchone()

        cursor.execute(
            "SELECT id, case_number, title, case_type, encrypted_data, created_at, updated_at "
            "FROM cases WHERE user_id = ?",
            (current_user["id"],),
        )
        cases = []
        for row in cursor.fetchall():
            try:
                data = decrypt_data(row[4])
            except Exception:
                data = {}
            cases.append({
                "id": row[0],
                "case_number": row[1],
                "title": row[2],
                "case_type": row[3],
                "created_at": str(row[5]),
                "updated_at": str(row[6]),
                "data": data,
            })

        cursor.execute(
            "SELECT id, case_ref, filename, file_type, size, description, uploaded_at "
            "FROM evidence WHERE user_id = ?",
            (current_user["id"],),
        )
        evidence = [
            {
                "id": r[0],
                "case_ref": r[1],
                "filename": r[2],
                "file_type": r[3],
                "size": r[4],
                "description": r[5],
                "uploaded_at": str(r[6]),
            }
            for r in cursor.fetchall()
        ]

        cursor.execute(
            "SELECT id, case_ref, event_date, encrypted_data, created_at FROM timeline_events WHERE user_id = ?",
            (current_user["id"],),
        )
        timeline = []
        for r in cursor.fetchall():
            try:
                d = decrypt_data(r[3])
            except Exception:
                d = {}
            timeline.append({
                "id": r[0],
                "case_ref": r[1],
                "event_date": r[2],
                "title": d.get("title", ""),
                "details": d.get("details", ""),
                "created_at": str(r[4]),
            })

        cursor.execute(
            "SELECT id, case_ref, title, encrypted_content, created_at FROM saved_documents WHERE user_id = ?",
            (current_user["id"],),
        )
        saved_docs = []
        for r in cursor.fetchall():
            try:
                content = fernet.decrypt(r[3].encode()).decode()
            except Exception:
                content = ""
            saved_docs.append({
                "id": r[0],
                "case_ref": r[1],
                "title": r[2],
                "content": content,
                "created_at": str(r[4]),
            })
        conn.close()

        export = {
            "exported_at": datetime.utcnow().isoformat(),
            "user": {
                "id": u[0],
                "email": u[1],
                "full_name": u[2],
                "created_at": str(u[3]),
                "last_login": str(u[4]),
            } if u else None,
            "cases": cases,
            "evidence_metadata": evidence,
            "timeline": timeline,
            "documents": saved_docs,
            "note": "Selve bevisfilene lagres kryptert og kan lastes ned enkeltvis i appen.",
        }
        return JSONResponse(
            content=export,
            headers={"Content-Disposition": "attachment; filename=rettbot-mine-data.json"},
        )
    except Exception as e:
        logger.error(f"Export error: {str(e)}")
        raise HTTPException(status_code=500, detail="Kunne ikke eksportere data")

@router.delete("/api/user/me")
async def delete_my_account(current_user: Dict = Depends(get_current_user)):
    """GDPR: slett den innloggede brukerens konto og alle tilhørende data."""
    uid = current_user["id"]
    email = current_user["email"]
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM evidence WHERE user_id = ?", (uid,))
        cursor.execute("DELETE FROM timeline_events WHERE user_id = ?", (uid,))
        cursor.execute("DELETE FROM saved_documents WHERE user_id = ?", (uid,))
        cursor.execute(
            "DELETE FROM documents WHERE case_id IN (SELECT id FROM cases WHERE user_id = ?)",
            (uid,),
        )
        cursor.execute("DELETE FROM cases WHERE user_id = ?", (uid,))
        cursor.execute("DELETE FROM password_reset_tokens WHERE email = ?", (email,))
        cursor.execute("DELETE FROM users WHERE id = ?", (uid,))
        conn.commit()
        conn.close()
        logger.info(f"Deleted account and all data for user {uid}")
        return {"success": True, "message": "Kontoen og alle tilhørende data er slettet."}
    except Exception as e:
        logger.error(f"Account deletion error: {str(e)}")
        raise HTTPException(status_code=500, detail="Kunne ikke slette kontoen")

@router.get("/api/consent/ai")
async def get_ai_consent(current_user: Dict = Depends(get_current_user)):
    """Returner om brukeren har samtykket til AI-behandling."""
    return {"consented": _has_ai_consent(current_user["id"])}

@router.post("/api/consent/ai")
async def set_ai_consent(current_user: Dict = Depends(get_current_user)):
    """Registrer eksplisitt AI-samtykke (art. 9 nr. 2 a) med tidsstempel."""
    if not _has_ai_consent(current_user["id"]):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO consents (user_id, kind) VALUES (?, ?)",
            (current_user["id"], "ai"),
        )
        conn.commit()
        conn.close()
    return {"consented": True}
