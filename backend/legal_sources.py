"""
Kilde-lag for RettBot+.

To ting:
1. CURATED_LAWS – kuratert oversikt over sentrale norske lover for nisjen
   (rettighetsvern/systemkritikk), med offisiell lovdata.no-lenke. Kun lovnavn +
   kort omfang + autoritativ lenke – ikke gjengivelse av lovtekst.
2. Lovdata Pro-integrasjon for RETTSPRAKSIS – et ærlig integrasjonspunkt som
   krever LOVDATA_API_KEY (+ LOVDATA_API_BASE). Uten konfigurasjon returneres
   ingenting (aldri falske treff). Selve API-kallet fylles inn når du har
   Lovdata Pro-tilgang og API-dokumentasjon.
"""

import os
import logging

logger = logging.getLogger(__name__)

# --- Kuratert lovoversikt (autoritative lenker) --------------------------------

CURATED_LAWS = [
    {
        "name": "Grunnloven",
        "scope": "Grunnleggende rettigheter og rettsstatsprinsipper.",
        "keywords": ["rettighet", "menneskerett", "ytringsfrihet", "rettferdig rettergang"],
        "url": "https://lovdata.no/dokument/NL/lov/1814-05-17",
    },
    {
        "name": "Menneskerettsloven (inkorporerer EMK)",
        "scope": "Gjør blant annet Den europeiske menneskerettskonvensjonen (EMK) til norsk lov.",
        "keywords": ["emk", "menneskerett", "privatliv", "rettferdig rettergang", "emd"],
        "url": "https://lovdata.no/dokument/NL/lov/1999-05-21-30",
    },
    {
        "name": "Forvaltningsloven",
        "scope": "Saksbehandling, enkeltvedtak, klagerett og klagefrister i offentlig forvaltning.",
        "keywords": ["klage", "vedtak", "forvaltning", "klagefrist", "innsyn i egen sak", "begrunnelse"],
        "url": "https://lovdata.no/dokument/NL/lov/1967-02-10",
    },
    {
        "name": "Offentleglova",
        "scope": "Rett til innsyn i offentlige organers dokumenter.",
        "keywords": ["innsyn", "offentlige dokumenter", "aktinnsyn"],
        "url": "https://lovdata.no/dokument/NL/lov/2006-05-19-16",
    },
    {
        "name": "Politiloven",
        "scope": "Politiets oppgaver og myndighet, blant annet bruk av makt.",
        "keywords": ["politi", "maktbruk", "pågripelse", "bortvisning", "kontroll"],
        "url": "https://lovdata.no/dokument/NL/lov/1995-08-04-53",
    },
    {
        "name": "Straffeprosessloven",
        "scope": "Behandling av straffesaker, rettigheter for mistenkte/siktede, forsvarer, ransaking og beslag.",
        "keywords": ["siktet", "mistenkt", "forsvarer", "ransaking", "beslag", "avhør", "anke"],
        "url": "https://lovdata.no/dokument/NL/lov/1981-05-22-25",
    },
    {
        "name": "Straffeloven",
        "scope": "Hva som er straffbart og strafferammer.",
        "keywords": ["straff", "strafferamme", "lovbrudd", "korrupsjon"],
        "url": "https://lovdata.no/dokument/NL/lov/2005-05-20-28",
    },
    {
        "name": "Personopplysningsloven (GDPR)",
        "scope": "Behandling av personopplysninger, innsyn, retting og sletting.",
        "keywords": ["personvern", "gdpr", "personopplysning", "innsyn", "sletting"],
        "url": "https://lovdata.no/dokument/NL/lov/2018-06-15-38",
    },
    {
        "name": "Arbeidsmiljøloven (varsling, kap. 2 A)",
        "scope": "Blant annet vern ved varsling om kritikkverdige forhold på arbeidsplassen.",
        "keywords": ["varsling", "varsler", "gjengjeldelse", "arbeidsplass"],
        "url": "https://lovdata.no/dokument/NL/lov/2005-06-17-62",
    },
    {
        "name": "Pasient- og brukerrettighetsloven",
        "scope": "Rettigheter i møte med helse- og omsorgstjenesten.",
        "keywords": ["pasient", "helse", "behandling", "klage helse"],
        "url": "https://lovdata.no/dokument/NL/lov/1999-07-02-63",
    },
]


def authoritative_laws_for(keywords) -> list:
    """Returner relevante kuraterte lover ut fra enkle nøkkelord (for grunnlag/sitat)."""
    text = " ".join(str(k) for k in keywords).lower()
    hits = [law for law in CURATED_LAWS if any(kw in text for kw in law["keywords"])]
    # Fall tilbake til de mest sentrale lovene hvis ingen treff
    return hits or [law for law in CURATED_LAWS if law["name"].startswith(("Forvaltningsloven", "Menneskerettsloven"))]


def format_sources_for_ai(laws) -> str:
    if not laws:
        return ""
    lines = ["AUTORITATIVE KILDER (lenk til disse i svaret der det passer):"]
    for law in laws:
        lines.append(f"- {law['name']}: {law['scope']} ({law['url']})")
    return "\n".join(lines)


# --- Lovdata Pro: rettspraksis (integrasjonspunkt) -----------------------------

LOVDATA_API_KEY = os.getenv("LOVDATA_API_KEY")
LOVDATA_API_BASE = os.getenv("LOVDATA_API_BASE")


def is_lovdata_configured() -> bool:
    return bool(LOVDATA_API_KEY and LOVDATA_API_BASE)


def lovdata_case_law_search(query: str, limit: int = 5) -> list:
    """
    Søk i rettspraksis via Lovdata Pro.

    Uten konfigurasjon returneres [] (aldri falske treff). Når du har Lovdata
    Pro-tilgang: sett LOVDATA_API_KEY og LOVDATA_API_BASE, og fyll inn det ekte
    API-kallet der det står markert nedenfor (krever Lovdatas API-dokumentasjon).
    """
    if not is_lovdata_configured():
        return []

    # === INTEGRASJONSPUNKT (Lovdata Pro) =====================================
    # Fyll inn ekte API-kall her når API-dokumentasjonen er tilgjengelig, f.eks.:
    #   import httpx
    #   resp = httpx.get(f"{LOVDATA_API_BASE}/...", params={"q": query, "limit": limit},
    #                    headers={"Authorization": f"Bearer {LOVDATA_API_KEY}"}, timeout=10)
    #   return [{"title": ..., "reference": ..., "summary": ..., "url": ...} for ... in resp.json()...]
    # =========================================================================
    logger.warning(
        "Lovdata er konfigurert, men API-kallet er ikke implementert ennå "
        "(mangler API-dokumentasjon). Returnerer ingen rettspraksis."
    )
    return []
