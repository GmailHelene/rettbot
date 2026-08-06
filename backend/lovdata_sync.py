"""
Hent oppdatert lovtekst fra Lovdatas GRATIS åpne API (NLOD 2.0, ingen nøkkel).

Det frie API-et er ikke et oppslags-API, men et nattlig bulk-arkiv med hele
lovverket (`gjeldende-lover.tar.bz2`). Dette skriptet laster ned arkivet, plukker
ut lovene vi bryr oss om (CURATED_LAWS i legal_sources.py), gjør HTML om til ren
tekst, og cacher det lokalt i backend/data/laws/ + en index.json med metadata
(tittel, sist endret). Da har appen korrekt, oppdatert lovtekst uten å måtte
kalle et eksternt API per forespørsel.

Kjør (fra repo-roten):

    python -m backend.lovdata_sync

Kjør på nytt ved behov for å oppdatere (arkivet oppdateres hver natt hos Lovdata).
"""

import html as _html
import io
import json
import os
import re
import sys
import tarfile
from pathlib import Path

import httpx

LAWS_URL = "https://api.lovdata.no/v1/publicData/get/gjeldende-lover.tar.bz2"
DATA_DIR = Path(__file__).parent / "data" / "laws"


def _law_id_from_url(url: str) -> str:
    # .../NL/lov/1967-02-10  ->  1967-02-10
    return url.rstrip("/").split("/lov/")[-1]


def _archive_name(law_id: str) -> str:
    """1967-02-10 -> nl/nl-19670210-000.xml ; 2018-06-15-38 -> nl/nl-20180615-038.xml"""
    parts = law_id.split("-")
    y, m, d = parts[0], parts[1], parts[2]
    num = parts[3] if len(parts) > 3 else "0"
    return f"nl/nl-{y}{m}{d}-{int(num):03d}.xml"


def _extract(field_class: str, html_doc: str) -> str:
    m = re.search(rf'<dd class="{field_class}"[^>]*>(.*?)</dd>', html_doc, re.S)
    if not m:
        return ""
    return re.sub(r"<[^>]+>", " ", m.group(1))


def _to_text(html_doc: str) -> str:
    # Fjern head/script/style, gjør tagger til mellomrom, unescape og rydd whitespace.
    body = re.sub(r"<head\b.*?</head>", " ", html_doc, flags=re.S | re.I)
    body = re.sub(r"<(script|style)\b.*?</\1>", " ", body, flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", " ", body)
    text = _html.unescape(text)
    text = re.sub(r"[ \t ]+", " ", text)
    text = re.sub(r"\n\s*\n\s*\n+", "\n\n", text)
    return text.strip()


def sync() -> int:
    # Importer her for å unngå sirkulær import ved modul-innlasting.
    from backend.legal_sources import CURATED_LAWS

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Laster ned {LAWS_URL} ...")
    try:
        resp = httpx.get(LAWS_URL, timeout=120, follow_redirects=True)
        resp.raise_for_status()
    except Exception as e:  # noqa: BLE001
        print(f"Nedlasting feilet: {e}")
        return 1

    tf = tarfile.open(fileobj=io.BytesIO(resp.content), mode="r:bz2")
    members = set(tf.getnames())
    print(f"Arkiv lastet ({len(resp.content)/1024/1024:.1f} MB, {len(members)} filer).")

    index = []
    for law in CURATED_LAWS:
        law_id = _law_id_from_url(law["url"])
        name = _archive_name(law_id)
        if name not in members:
            print(f"  [MANGLER] {law['name']} ({law_id}) -> {name}")
            continue
        raw = tf.extractfile(name).read().decode("utf-8", "replace")
        title = re.sub(r"<[^>]+>", " ", (re.search(r"<title>(.*?)</title>", raw, re.S) or [None, ""])[1]).strip()
        last_changed = _extract("lastChangeInForce", raw).strip()
        text = _to_text(raw)
        (DATA_DIR / f"{law_id}.txt").write_text(text, encoding="utf-8")
        index.append({
            "id": law_id,
            "name": law["name"],
            "title": title,
            "last_changed": last_changed,
            "chars": len(text),
        })
        print(f"  [OK] {law['name']} ({law_id}) - {len(text)} tegn, sist endret {last_changed or '?'}")

    (DATA_DIR / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nFerdig. {len(index)}/{len(CURATED_LAWS)} lover cachet i {DATA_DIR}.")
    return 0


if __name__ == "__main__":
    # Sørg for at repo-roten er på path når fila kjøres direkte.
    root = Path(__file__).resolve().parents[1]
    if str(root) not in sys.path:
        sys.path.insert(0, str(root))
    raise SystemExit(sync())
