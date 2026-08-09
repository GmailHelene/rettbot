"""
Server-side SEO for SPA-en.

Vi serverer en React-SPA, og crawlere/delingsroboter ser i utgangspunktet en
tom side. Her injiserer vi per-rute <title>, meta-beskrivelse, canonical,
Open Graph/Twitter og et lite, crawlbart innholdsblokk i #root - uten
Puppeteer eller endringer i frontend-bygget. React overskriver blokken når
JavaScript kjører, så vanlige brukere merker ingenting.
"""

import os
import re
import json
import html as _html

# Umami besøksstatistikk (cookieless). Injiseres kun når UMAMI_WEBSITE_ID er satt
# i miljøet (Railway), så det er «av» som standard og krever ingen rebuild.
UMAMI_WEBSITE_ID = os.getenv("UMAMI_WEBSITE_ID", "").strip()
UMAMI_SRC = os.getenv("UMAMI_SRC", "https://cloud.umami.is/script.js").strip()

# Alternativ: Cloudflare Web Analytics (gratis, ubegrenset, cookieless).
# Sett CF_BEACON_TOKEN i miljøet. Bruk enten denne ELLER Umami, ikke begge.
CF_BEACON_TOKEN = os.getenv("CF_BEACON_TOKEN", "").strip()
from functools import lru_cache

SITE = "https://rettbot.com"

_SUFFIX = " - RettBot+"

# Felles «neste steg»-lenker vi kan gjenbruke i innholdsblokken.
_COMMON_LINKS = [
    ("Kom i gang", "/kom-i-gang"),
    ("Veivisere", "/veivisere"),
    ("Hvor klager du?", "/hvor-klager-du"),
    ("Eksempler på klage", "/eksempler"),
]

# Indekserbare, offentlige sider. Alt annet blir noindex (auth, konto,
# innloggede verktøy, ukjente ruter).
PAGES = {
    "/": {
        "title": "RettBot+ - Kjenn rettighetene dine mot politi og myndigheter",
        "description": "Forstå norsk lov, dokumentér saken din og skriv klage eller anke selv - når du står mot politi, NAV, barnevern eller forvaltningen. Gratis verktøy. Ikke en erstatning for advokat.",
        "h1": "Kjenn rettighetene dine. Stå stødig mot systemet.",
        "intro": "RettBot+ hjelper deg å forstå norsk lov, dokumentere saken din og skrive klagen selv når du står mot politi, myndigheter eller et system som ikke lytter.",
        "links": _COMMON_LINKS,
    },
    "/kom-i-gang": {
        "title": "Kom i gang" + _SUFFIX,
        "description": "Ny her? Slik kommer du i gang med RettBot+: forstå rettighetene dine, finn rett klageinstans, regn ut fristen og skriv klagen selv.",
        "h1": "Kom i gang med RettBot+",
        "intro": "En kort innføring i hvordan du bruker verktøyene til å stå stødigere i en sak mot det offentlige.",
        "links": _COMMON_LINKS,
    },
    "/veivisere": {
        "title": "Veivisere: steg for steg" + _SUFFIX,
        "description": "Steg-for-steg-veivisere for konkrete situasjoner: klage på politiet, klage på et vedtak, dokumentere en hendelse og varsling. Med sjekkliste og lenker til verktøyene du trenger.",
        "h1": "Veivisere - steg for steg gjennom en situasjon",
        "intro": "Velg situasjonen din, så tar vi deg gjennom stegene i riktig rekkefølge med lenker til rett verktøy underveis.",
        "links": [
            ("Klage på politiet", "/veivisere/klage-paa-politiet"),
            ("Klage på et vedtak", "/veivisere/anke-vedtak"),
            ("Dokumentér en hendelse", "/veivisere/dokumenter-hendelse"),
            ("Varsling", "/veivisere/varsling"),
        ],
    },
    "/veivisere/klage-paa-politiet": {
        "title": "Klage på politiet - steg for steg" + _SUFFIX,
        "description": "Slik klager du på politiet: finn ut om det er klage på oppførsel, mistanke om noe straffbart eller klage på henleggelse, finn rett instans, sjekk fristen og skriv klagen.",
        "h1": "Klage på politiet - steg for steg",
        "intro": "Det finnes flere spor, og det er lett å sende til feil sted. Denne veiviseren tar deg gjennom hvordan du klager på politiet.",
        "links": [("Hvor klager du?", "/hvor-klager-du"), ("Regn ut fristen", "/fristkalkulator"), ("Eksempler", "/eksempler")],
    },
    "/veivisere/anke-vedtak": {
        "title": "Klage på et vedtak - steg for steg" + _SUFFIX,
        "description": "Fått et avslag eller vedtak fra NAV, kommunen eller en etat du mener er feil? Slik klager du: finn klagefristen, be om innsyn og begrunnelse, og skriv klagen.",
        "h1": "Klage på et forvaltningsvedtak - steg for steg",
        "intro": "Har du fått et avslag eller vedtak fra det offentlige du mener er feil? Denne veiviseren viser hvordan du klager.",
        "links": [("Regn ut fristen", "/fristkalkulator"), ("Lag innsynskrav", "/innsynskrav"), ("Eksempler", "/eksempler")],
    },
    "/veivisere/dokumenter-hendelse": {
        "title": "Dokumentér en hendelse - steg for steg" + _SUFFIX,
        "description": "Det du dokumenterer nå er ofte viktigere enn selve klagen senere. Slik sikrer du bevis, lager en tidslinje og oppbevarer alt trygt.",
        "h1": "Dokumentér en hendelse - steg for steg",
        "intro": "Gjør det mens det er ferskt: skriv ned hva som skjedde, sikre bevisene og legg det inn i en tidslinje.",
        "links": [("Lag en tidslinje", "/tidslinje"), ("Veivisere", "/veivisere")],
    },
    "/veivisere/varsling": {
        "title": "Varsling - steg for steg" + _SUFFIX,
        "description": "Vil du varsle om kritikkverdige forhold? Slik finner du rett kanal, dokumenterer grunnlaget og tenker gjennom vern og risiko før du varsler.",
        "h1": "Varsling - steg for steg",
        "intro": "Varsling kan være alvorlig og komplekst. Denne veiviseren hjelper deg å tenke gjennom rekkefølge og risiko.",
        "links": [("Hvor varsler du?", "/hvor-klager-du"), ("Dokumentér hendelsen", "/veivisere/dokumenter-hendelse")],
    },
    "/hvor-klager-du": {
        "title": "Hvor klager du? Norske klage- og tilsynsorganer" + _SUFFIX,
        "description": "Finn rett instans for saken din: politiet, Spesialenheten, statsforvalteren, Sivilombudet, tilsyn og ombud. Oversikt over hvor og i hvilken rekkefølge du klager.",
        "h1": "Hvor klager du?",
        "intro": "En oversikt over norske klage- og tilsynsorganer, så du finner rett instans for saken din.",
        "links": _COMMON_LINKS,
    },
    "/maler": {
        "title": "Maler: klage, anke, anmeldelse og innsyn" + _SUFFIX,
        "description": "Ferdige, redigerbare maler for klage, anke, anmeldelse og innsynskrav på norsk. Fyll ut, kopier eller skriv ut - og send selv.",
        "h1": "Dokumentmaler",
        "intro": "Ferdige maler for klage, anke, anmeldelse og innsynskrav som du kan tilpasse og bruke selv.",
        "links": [("Eksempler", "/eksempler"), ("Hvor klager du?", "/hvor-klager-du"), ("Regn ut fristen", "/fristkalkulator")],
    },
    "/eksempler": {
        "title": "Eksempler: gode klager og vanlige feil" + _SUFFIX,
        "description": "Slik ser en god klage ut: anatomien i en klage, eksempelbrev for henleggelse og forvaltningsvedtak, vanlige feil og hva som ofte fungerer.",
        "h1": "Eksempler på gode klager",
        "intro": "Illustrative eksempler på hvordan en god klage er bygget opp, hvilke feil som er vanlige, og hva som ofte fungerer.",
        "links": [("Bruk en mal", "/maler"), ("Veivisere", "/veivisere"), ("Hvor klager du?", "/hvor-klager-du")],
    },
    "/fristkalkulator": {
        "title": "Fristkalkulator - klage- og ankefrist" + _SUFFIX,
        "description": "Regn ut når klage- eller ankefristen din går ut. Ikke mist muligheten fordi fristen løp ut - de fleste klagefrister er tre uker.",
        "h1": "Fristkalkulator",
        "intro": "Regn ut når klage- eller ankefristen din går ut, så du ikke mister muligheten.",
        "links": _COMMON_LINKS,
    },
    "/innsynskrav": {
        "title": "Innsynskrav - be om innsyn i egne data" + _SUFFIX,
        "description": "Lag et ferdig innsynskrav: be om innsyn i egne personopplysninger eller offentlige dokumenter, jf. forvaltningsloven og personvernregelverket.",
        "h1": "Innsynskrav-veiviser",
        "intro": "Be om innsyn i egne personopplysninger eller offentlige dokumenter med et ferdig brev.",
        "links": _COMMON_LINKS,
    },
    "/personvern": {
        "title": "Personvernerklæring" + _SUFFIX,
        "description": "Hvordan RettBot+ behandler personopplysninger: server-side kryptering, ingen AI-trening på dataene dine, og dine rettigheter etter GDPR.",
        "h1": "Personvernerklæring",
        "intro": "Hvilke opplysninger vi behandler, hvorfor, og hvilke rettigheter du har.",
        "links": _COMMON_LINKS,
    },
    "/vilkar": {
        "title": "Brukervilkår" + _SUFFIX,
        "description": "Vilkårene for å bruke RettBot+. Verktøyet gir generell, AI-generert informasjon og er ikke en erstatning for advokat.",
        "h1": "Brukervilkår",
        "intro": "Vilkårene for å bruke RettBot+.",
        "links": _COMMON_LINKS,
    },
}

_DEFAULT = {
    "title": "RettBot+ - Kjenn rettighetene dine",
    "description": "AI-assistert verktøy som hjelper deg å forstå rettighetene dine og skrive klagen selv. Ikke en erstatning for advokat.",
    "h1": "RettBot+",
    "intro": "Kjenn rettighetene dine. Stå stødig mot systemet.",
    "links": _COMMON_LINKS,
}


def _esc(value) -> str:
    return _html.escape(str(value if value is not None else ""), quote=True)


def _norm(path: str) -> str:
    if not path:
        return "/"
    if not path.startswith("/"):
        path = "/" + path
    if len(path) > 1 and path.endswith("/"):
        path = path.rstrip("/")
    return path or "/"


def _replace_tag(html: str, pattern: str, new_tag: str) -> str:
    rx = re.compile(pattern, re.I | re.S)
    if rx.search(html):
        return rx.sub(lambda _m: new_tag, html, count=1)
    # Mangler taggen? Sett den inn rett før </head>.
    return html.replace("</head>", f"    {new_tag}\n</head>", 1)


def _content_block(cfg: dict) -> str:
    items = "".join(
        f'<li><a href="{_esc(href)}">{_esc(label)}</a></li>' for label, href in cfg.get("links", [])
    )
    nav = f"<nav aria-label=\"Snarveier\"><ul>{items}</ul></nav>" if items else ""
    return (
        '<div style="max-width:820px;margin:0 auto;padding:2rem;'
        'font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a">'
        f"<h1>{_esc(cfg['h1'])}</h1>"
        f"<p>{_esc(cfg['intro'])}</p>"
        f"{nav}"
        "</div>"
    )


def render_index_html(base_html: str, path: str) -> str:
    """Injiser per-rute SEO i den bygde index.html-en."""
    p = _norm(path)
    indexable = p in PAGES
    cfg = PAGES.get(p, _DEFAULT)
    url = SITE + ("" if p == "/" else p)
    canonical = SITE + "/" if p == "/" else url

    title = cfg["title"]
    desc = cfg["description"]

    html = base_html
    html = _replace_tag(html, r"<title>.*?</title>", f"<title>{_esc(title)}</title>")
    html = _replace_tag(
        html, r'<meta\s+name="description"\s+content="[^"]*"\s*/?>',
        f'<meta name="description" content="{_esc(desc)}" />',
    )
    html = _replace_tag(
        html, r'<meta\s+name="robots"\s+content="[^"]*"\s*/?>',
        f'<meta name="robots" content="{"index, follow" if indexable else "noindex, follow"}" />',
    )
    html = _replace_tag(
        html, r'<link\s+rel="canonical"\s+href="[^"]*"\s*/?>',
        f'<link rel="canonical" href="{_esc(canonical)}" />',
    )
    html = _replace_tag(
        html, r'<meta\s+property="og:url"\s+content="[^"]*"\s*/?>',
        f'<meta property="og:url" content="{_esc(url)}" />',
    )
    html = _replace_tag(
        html, r'<meta\s+property="og:title"\s+content="[^"]*"\s*/?>',
        f'<meta property="og:title" content="{_esc(title)}" />',
    )
    html = _replace_tag(
        html, r'<meta\s+property="og:description"\s+content="[^"]*"\s*/?>',
        f'<meta property="og:description" content="{_esc(desc)}" />',
    )
    html = _replace_tag(
        html, r'<meta\s+name="twitter:title"\s+content="[^"]*"\s*/?>',
        f'<meta name="twitter:title" content="{_esc(title)}" />',
    )
    html = _replace_tag(
        html, r'<meta\s+name="twitter:description"\s+content="[^"]*"\s*/?>',
        f'<meta name="twitter:description" content="{_esc(desc)}" />',
    )

    # Strukturerte data (JSON-LD) for indekserbare sider - hjelper både Google og
    # AI-søkemotorer (Perplexity/ChatGPT) å forstå hva siden er.
    if indexable:
        graph = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": title,
            "description": desc,
            "url": url,
            "inLanguage": "nb-NO",
            "isPartOf": {"@type": "WebSite", "name": "RettBot+", "url": SITE + "/"},
            "publisher": {"@type": "Organization", "name": "Grønberg Tech Solutions"},
            "provider": {
                "@type": "LegalService",
                "name": "RettBot+",
                "areaServed": {"@type": "Country", "name": "Norway"},
            },
        }
        if p.startswith("/veivisere/"):
            graph["@type"] = ["WebPage", "HowTo"]
            graph["step"] = [{"@type": "HowToStep", "name": lbl} for lbl, _ in cfg.get("links", [])]
        script = '<script type="application/ld+json">' + json.dumps(graph, ensure_ascii=False) + "</script>"
        html = html.replace("</head>", f"    {script}\n</head>", 1)

    # Besøksstatistikk (cookieless) - injiseres kun hvis konfigurert via env.
    if UMAMI_WEBSITE_ID:
        umami = f'<script defer src="{_esc(UMAMI_SRC)}" data-website-id="{_esc(UMAMI_WEBSITE_ID)}"></script>'
        html = html.replace("</head>", f"    {umami}\n</head>", 1)
    elif CF_BEACON_TOKEN:
        cf = (
            '<script defer src="https://static.cloudflareinsights.com/beacon.min.js" '
            f"data-cf-beacon='{{\"token\": \"{_esc(CF_BEACON_TOKEN)}\"}}'></script>"
        )
        html = html.replace("</head>", f"    {cf}\n</head>", 1)

    # Crawlbart innhold som React overskriver når JS kjører.
    html = html.replace('<div id="root"></div>', f'<div id="root">{_content_block(cfg)}</div>', 1)
    return html


@lru_cache(maxsize=1)
def _load_base(index_path: str) -> str:
    """Les den bygde index.html én gang (caches - prosessen restartes ved deploy)."""
    with open(index_path, encoding="utf-8") as f:
        return f.read()


@lru_cache(maxsize=256)
def render_for_path(index_path: str, path: str) -> str:
    """Cachet per rute: leser index.html én gang og gjenbruker ferdig injisert HTML."""
    return render_index_html(_load_base(index_path), path)
