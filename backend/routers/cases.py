"""Saker, dokumenter, bevis, tidslinje og saksmappe-PDF."""

import json
import logging
import secrets
from datetime import datetime
from typing import Dict, Any, Optional, List

from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from pydantic import BaseModel, Field

from backend.db import get_connection
from backend.deps import get_current_user, encrypt_data, decrypt_data, fernet, has_active_pass

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_EVIDENCE_BYTES = 25 * 1024 * 1024  # 25 MB

class CaseCreate(BaseModel):
    title: str
    description: str
    case_type: str
    facts: Optional[str] = None
    evidence: Optional[List[str]] = None

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    facts: Optional[str] = None
    evidence: Optional[List[str]] = None

class TimelineCreate(BaseModel):
    event_date: str
    title: str
    details: Optional[str] = ""
    case_ref: Optional[str] = None

class SavedDocumentCreate(BaseModel):
    title: str
    content: str
    case_ref: Optional[str] = None

def _looks_like_text(content: bytes) -> bool:
    """Grov tekst-heuristikk: ingen null-bytes og gyldig UTF-8 i starten."""
    sample = content[:4096]
    if b"\x00" in sample:
        return False
    try:
        sample.decode("utf-8")
        return True
    except UnicodeDecodeError:
        return False

def validate_evidence_mime(content: bytes) -> str:
    """Server-side innholdssjekk via magic bytes (ikke bare filending).

    Returnerer verifisert MIME-type, eller kaster 400 for utillatte formater.
    Tillatt: PDF, vanlige bilder og ren tekst. Blokkerer bl.a. kjørbare filer.
    """
    head = content[:16]
    signatures = [
        (b"%PDF", "application/pdf"),
        (b"\x89PNG\r\n\x1a\n", "image/png"),
        (b"\xff\xd8\xff", "image/jpeg"),
        (b"GIF87a", "image/gif"),
        (b"GIF89a", "image/gif"),
        (b"II*\x00", "image/tiff"),
        (b"MM\x00*", "image/tiff"),
    ]
    for sig, mime in signatures:
        if head.startswith(sig):
            return mime
    if head.startswith(b"RIFF") and content[8:12] == b"WEBP":
        return "image/webp"
    if _looks_like_text(content):
        return "text/plain"
    raise HTTPException(
        status_code=400,
        detail="Ugyldig filformat. Tillatt: PDF, bilder (PNG/JPEG/GIF/TIFF/WEBP) og tekst.",
    )

@router.post("/api/timeline")
async def create_timeline_event(event: TimelineCreate, current_user: Dict = Depends(get_current_user)):
    if not event.event_date or not event.title:
        raise HTTPException(status_code=400, detail="Dato og tittel er påkrevd.")
    try:
        encrypted = encrypt_data({"title": event.title, "details": event.details or ""})
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO timeline_events (user_id, case_ref, event_date, encrypted_data) "
            "VALUES (?, ?, ?, ?) RETURNING id",
            (current_user["id"], event.case_ref, event.event_date, encrypted),
        )
        eid = cursor.fetchone()[0]
        conn.commit()
        conn.close()
        return {"success": True, "id": eid}
    except Exception as e:
        logger.error(f"Timeline create error: {str(e)}")
        raise HTTPException(status_code=500, detail="Kunne ikke lagre hendelsen")

@router.get("/api/timeline")
async def list_timeline_events(current_user: Dict = Depends(get_current_user)):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, case_ref, event_date, encrypted_data, created_at FROM timeline_events "
            "WHERE user_id = ? ORDER BY event_date DESC, id DESC",
            (current_user["id"],),
        )
        rows = cursor.fetchall()
        conn.close()
        events = []
        for r in rows:
            try:
                d = decrypt_data(r[3])
            except Exception:
                d = {}
            events.append({
                "id": r[0],
                "case_ref": r[1],
                "event_date": r[2],
                "title": d.get("title", ""),
                "details": d.get("details", ""),
                "created_at": str(r[4]),
            })
        return {"success": True, "events": events}
    except Exception as e:
        logger.error(f"Timeline list error: {str(e)}")
        raise HTTPException(status_code=500, detail="Kunne ikke hente tidslinjen")

@router.delete("/api/timeline/{event_id}")
async def delete_timeline_event(event_id: int, current_user: Dict = Depends(get_current_user)):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM timeline_events WHERE id = ? AND user_id = ?",
            (event_id, current_user["id"]),
        )
        conn.commit()
        conn.close()
        return {"success": True}
    except Exception as e:
        logger.error(f"Timeline delete error: {str(e)}")
        raise HTTPException(status_code=500, detail="Kunne ikke slette hendelsen")

@router.get("/api/evidence")
async def list_evidence(current_user: Dict = Depends(get_current_user)):
    """List brukerens bevis (metadata, ikke selve filinnholdet)."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, case_ref, filename, file_type, size, description, uploaded_at "
            "FROM evidence WHERE user_id = ? ORDER BY uploaded_at DESC",
            (current_user["id"],),
        )
        rows = cursor.fetchall()
        conn.close()
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
            for r in rows
        ]
        return {"success": True, "evidence": evidence}
    except Exception as e:
        logger.error(f"Evidence list error: {str(e)}")
        raise HTTPException(status_code=500, detail="Kunne ikke hente bevis")

@router.post("/api/documents")
async def save_document(doc: SavedDocumentCreate, current_user: Dict = Depends(get_current_user)):
    if not doc.title or not doc.content:
        raise HTTPException(status_code=400, detail="Tittel og innhold er påkrevd.")
    try:
        encrypted = fernet.encrypt(doc.content.encode()).decode()
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO saved_documents (user_id, case_ref, title, encrypted_content) "
            "VALUES (?, ?, ?, ?) RETURNING id",
            (current_user["id"], doc.case_ref, doc.title, encrypted),
        )
        did = cursor.fetchone()[0]
        conn.commit()
        conn.close()
        return {"success": True, "id": did}
    except Exception as e:
        logger.error(f"Save document error: {str(e)}")
        raise HTTPException(status_code=500, detail="Kunne ikke lagre dokumentet")

@router.get("/api/documents")
async def list_documents(current_user: Dict = Depends(get_current_user)):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, case_ref, title, encrypted_content, created_at FROM saved_documents "
            "WHERE user_id = ? ORDER BY created_at DESC",
            (current_user["id"],),
        )
        rows = cursor.fetchall()
        conn.close()
        docs = []
        for r in rows:
            try:
                content = fernet.decrypt(r[3].encode()).decode()
            except Exception:
                content = ""
            docs.append({
                "id": r[0],
                "case_ref": r[1],
                "title": r[2],
                "content": content,
                "created_at": str(r[4]),
            })
        return {"success": True, "documents": docs}
    except Exception as e:
        logger.error(f"List documents error: {str(e)}")
        raise HTTPException(status_code=500, detail="Kunne ikke hente dokumenter")

@router.get("/api/saksmappe/pdf")
async def download_saksmappe_pdf(
    case_ref: Optional[str] = None,
    current_user: Dict = Depends(get_current_user),
):
    """Samle brukerens tidslinje, bevis og lagrede dokumenter i én PDF-saksmappe.

    Valgfri `case_ref` avgrenser til én sak; uten den tas alt brukeren har lagret.
    """
    # Betalt funksjon: krever aktivt dagspass eller prøveperiode.
    if not has_active_pass(current_user["id"]):
        raise HTTPException(
            status_code=402,
            detail="PDF-saksmappe krever dagspass. Kjøp dagspass for 24 timer full tilgang, eller løs inn en prøvekode.",
        )

    from io import BytesIO
    from xml.sax.saxutils import escape
    from fastapi import Response

    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    except ImportError:
        logger.error("reportlab mangler - kan ikke generere PDF")
        raise HTTPException(status_code=500, detail="PDF-generering er ikke tilgjengelig på serveren.")

    def esc(value) -> str:
        return escape(str(value if value is not None else "")).replace("\n", "<br/>")

    try:
        uid = current_user["id"]
        conn = get_connection()
        cursor = conn.cursor()

        if case_ref:
            cursor.execute(
                "SELECT event_date, encrypted_data FROM timeline_events "
                "WHERE user_id = ? AND case_ref = ? ORDER BY event_date ASC, id ASC",
                (uid, case_ref),
            )
        else:
            cursor.execute(
                "SELECT event_date, encrypted_data FROM timeline_events "
                "WHERE user_id = ? ORDER BY event_date ASC, id ASC",
                (uid,),
            )
        timeline_rows = cursor.fetchall()

        if case_ref:
            cursor.execute(
                "SELECT filename, file_type, size, description, uploaded_at FROM evidence "
                "WHERE user_id = ? AND case_ref = ? ORDER BY uploaded_at ASC",
                (uid, case_ref),
            )
        else:
            cursor.execute(
                "SELECT filename, file_type, size, description, uploaded_at FROM evidence "
                "WHERE user_id = ? ORDER BY uploaded_at ASC",
                (uid,),
            )
        evidence_rows = cursor.fetchall()

        if case_ref:
            cursor.execute(
                "SELECT title, encrypted_content, created_at FROM saved_documents "
                "WHERE user_id = ? AND case_ref = ? ORDER BY created_at ASC",
                (uid, case_ref),
            )
        else:
            cursor.execute(
                "SELECT title, encrypted_content, created_at FROM saved_documents "
                "WHERE user_id = ? ORDER BY created_at ASC",
                (uid,),
            )
        document_rows = cursor.fetchall()
        conn.close()

        styles = getSampleStyleSheet()
        h1 = ParagraphStyle("rb_h1", parent=styles["Heading1"], fontSize=18, spaceAfter=4)
        h2 = ParagraphStyle(
            "rb_h2", parent=styles["Heading2"], fontSize=13, spaceBefore=16, spaceAfter=6,
            textColor=colors.HexColor("#1e4d86"),
        )
        meta = ParagraphStyle("rb_meta", parent=styles["Normal"], fontSize=9, textColor=colors.grey)
        body = ParagraphStyle("rb_body", parent=styles["Normal"], fontSize=10, leading=14)
        small = ParagraphStyle("rb_small", parent=styles["Normal"], fontSize=8, textColor=colors.grey)

        story = []
        story.append(Paragraph("Saksmappe", h1))
        story.append(Paragraph(f"Sak: {esc(case_ref)}" if case_ref else "Alle registrerte opplysninger", meta))
        story.append(Paragraph(f"Eier: {esc(current_user.get('full_name') or current_user.get('email'))}", meta))
        story.append(Paragraph(f"Generert: {datetime.utcnow().strftime('%d.%m.%Y %H:%M')} UTC", meta))
        story.append(Spacer(1, 0.4 * cm))

        # Tidslinje
        story.append(Paragraph("Tidslinje", h2))
        if timeline_rows:
            for edate, enc in timeline_rows:
                try:
                    d = decrypt_data(enc)
                except Exception:
                    d = {}
                story.append(Paragraph(f"<b>{esc(edate)}</b> &ndash; {esc(d.get('title', ''))}", body))
                if d.get("details"):
                    story.append(Paragraph(esc(d.get("details")), body))
                story.append(Spacer(1, 0.15 * cm))
        else:
            story.append(Paragraph("Ingen registrerte hendelser.", small))

        # Bevis
        story.append(Paragraph("Bevis", h2))
        if evidence_rows:
            for fn, ftype, size, desc, up in evidence_rows:
                size_txt = f" · {round((size or 0) / 1024)} kB" if size else ""
                story.append(
                    Paragraph(
                        f"<b>{esc(fn)}</b> <font size=8 color='grey'>{esc(ftype)}{size_txt} · {esc(str(up)[:19])}</font>",
                        body,
                    )
                )
                if desc:
                    story.append(Paragraph(esc(desc), body))
                story.append(Spacer(1, 0.15 * cm))
        else:
            story.append(Paragraph("Ingen registrerte bevis.", small))

        # Dokumenter
        story.append(Paragraph("Dokumenter og brev", h2))
        if document_rows:
            for title, enc, created in document_rows:
                try:
                    content = fernet.decrypt(enc.encode()).decode()
                except Exception:
                    content = ""
                story.append(
                    Paragraph(f"<b>{esc(title)}</b> <font size=8 color='grey'>({esc(str(created)[:19])})</font>", body)
                )
                if content:
                    story.append(Paragraph(esc(content), body))
                story.append(Spacer(1, 0.3 * cm))
        else:
            story.append(Paragraph("Ingen lagrede dokumenter.", small))

        story.append(Spacer(1, 0.6 * cm))
        story.append(
            Paragraph(
                "Generert av RettBot+. Dette er dine egne registrerte opplysninger og utgjør ikke "
                "juridisk rådgivning.",
                small,
            )
        )

        buf = BytesIO()
        SimpleDocTemplate(
            buf, pagesize=A4, leftMargin=2 * cm, rightMargin=2 * cm,
            topMargin=2 * cm, bottomMargin=2 * cm, title="Saksmappe",
        ).build(story)
        pdf_bytes = buf.getvalue()
        buf.close()

        safe_ref = "".join(c for c in (case_ref or "alle") if c.isalnum() or c in ("-", "_"))[:40] or "alle"
        filename = f"saksmappe_{safe_ref}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Saksmappe PDF error: {str(e)}")
        raise HTTPException(status_code=500, detail="Kunne ikke lage saksmappe-PDF")

@router.delete("/api/documents/{doc_id}")
async def delete_document(doc_id: int, current_user: Dict = Depends(get_current_user)):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM saved_documents WHERE id = ? AND user_id = ?",
            (doc_id, current_user["id"]),
        )
        conn.commit()
        conn.close()
        return {"success": True}
    except Exception as e:
        logger.error(f"Delete document error: {str(e)}")
        raise HTTPException(status_code=500, detail="Kunne ikke slette dokumentet")

@router.post("/api/cases")
async def create_case(case: CaseCreate, current_user: Dict = Depends(get_current_user)):
    """Create new case (encrypted)"""
    try:
        # Generate unique case number
        case_number = f"CASE-{datetime.utcnow().strftime('%Y%m%d')}-{secrets.token_hex(4).upper()}"
        
        # Encrypt case data
        case_data = {
            "title": case.title,
            "description": case.description,
            "case_type": case.case_type,
            "facts": case.facts,
            "evidence": case.evidence or []
        }
        encrypted_data = encrypt_data(case_data)
        
        # Save to database
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO cases (user_id, case_number, title, case_type, encrypted_data) VALUES (?, ?, ?, ?, ?) RETURNING id",
            (current_user["id"], case_number, case.title, case.case_type, encrypted_data)
        )
        case_id = cursor.fetchone()[0]
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "case_id": case_id,
            "case_number": case_number,
            "message": "Case created and encrypted successfully"
        }
    except Exception as e:
        logger.error(f"Case creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Case creation failed: {str(e)}")

@router.get("/api/cases")
async def get_user_cases(current_user: Dict = Depends(get_current_user)):
    """Get all cases for current user"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, case_number, title, case_type, created_at, updated_at FROM cases WHERE user_id = ? ORDER BY updated_at DESC",
            (current_user["id"],)
        )
        cases = cursor.fetchall()
        conn.close()

        return {
            "success": True,
            "cases": [
                {
                    "id": case[0],
                    "case_number": case[1],
                    "title": case[2],
                    "case_type": case[3],
                    "created_at": case[4],
                    "updated_at": case[5]
                }
                for case in cases
            ]
        }
    except Exception as e:
        logger.error(f"Get cases error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve cases: {str(e)}")

@router.get("/api/cases/{case_id}")
async def get_case(case_id: int, current_user: Dict = Depends(get_current_user)):
    """Get specific case (decrypted)"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT case_number, title, encrypted_data, created_at, updated_at FROM cases WHERE id = ? AND user_id = ?",
            (case_id, current_user["id"])
        )
        case = cursor.fetchone()
        conn.close()
        
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # Decrypt case data
        decrypted_data = decrypt_data(case[2])
        
        return {
            "success": True,
            "case": {
                "id": case_id,
                "case_number": case[0],
                "title": case[1],
                "created_at": case[3],
                "updated_at": case[4],
                **decrypted_data
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get case error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve case: {str(e)}")

@router.put("/api/cases/{case_id}")
async def update_case(case_id: int, case_update: CaseUpdate, current_user: Dict = Depends(get_current_user)):
    """Update case (re-encrypted)"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Get existing case
        cursor.execute(
            "SELECT encrypted_data FROM cases WHERE id = ? AND user_id = ?",
            (case_id, current_user["id"])
        )
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Case not found")
        
        # Decrypt, update, re-encrypt
        case_data = decrypt_data(existing[0])
        
        if case_update.title:
            case_data["title"] = case_update.title
        if case_update.description:
            case_data["description"] = case_update.description
        if case_update.facts:
            case_data["facts"] = case_update.facts
        if case_update.evidence:
            case_data["evidence"] = case_update.evidence
        
        encrypted_data = encrypt_data(case_data)
        
        # Update database
        cursor.execute(
            "UPDATE cases SET encrypted_data = ?, title = ?, updated_at = ? WHERE id = ?",
            (encrypted_data, case_update.title or case_data["title"], datetime.utcnow(), case_id)
        )
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "Case updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update case error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Case update failed: {str(e)}")

@router.delete("/api/cases/{case_id}")
async def delete_case(case_id: int, current_user: Dict = Depends(get_current_user)):
    """Delete case (permanent)"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Delete associated documents first
        cursor.execute("DELETE FROM documents WHERE case_id = ?", (case_id,))
        
        # Delete case
        cursor.execute(
            "DELETE FROM cases WHERE id = ? AND user_id = ?",
            (case_id, current_user["id"])
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Case not found")
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "Case deleted permanently"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete case error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Case deletion failed: {str(e)}")

@router.post("/api/evidence/upload")
async def upload_evidence_file(
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    case_ref: Optional[str] = Form(None),
    current_user: Dict = Depends(get_current_user),
):
    """
    Last opp en bevisfil.

    Innholdet krypteres server-side med Fernet (AES-128-CBC + HMAC) før det lagres
    i databasen, knyttet til den innloggede brukeren og en valgfri saksreferanse.
    """
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Filen er tom.")
        if len(content) > MAX_EVIDENCE_BYTES:
            raise HTTPException(status_code=413, detail="Filen er for stor (maks 25 MB).")

        # Server-side innholdssjekk (magic bytes), ikke bare filending fra klienten.
        verified_mime = validate_evidence_mime(content)

        encrypted = fernet.encrypt(content).decode()

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO evidence (user_id, case_ref, filename, file_type, size, description, encrypted_content) "
            "VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id",
            (current_user["id"], case_ref, file.filename, verified_mime, len(content), description, encrypted),
        )
        evidence_id = cursor.fetchone()[0]
        conn.commit()
        conn.close()

        logger.info(f"Stored encrypted evidence #{evidence_id} for user {current_user['id']}")

        return {
            "success": True,
            "file": {
                "id": evidence_id,
                "filename": file.filename,
                "size": len(content),
                "content_type": verified_mime,
                "uploaded": datetime.utcnow().isoformat(),
                "encrypted": True,
                "case_ref": case_ref,
            },
            "message": "Filen ble lastet opp og kryptert.",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
