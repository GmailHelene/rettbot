# RettBot+

**Kjenn rettighetene dine. Stå stødig mot systemet.**

RettBot+ er et AI-assistert juridisk verktøy for norske privatpersoner som står i en
sak mot det offentlige – politi, NAV, barnevern eller forvaltningen. Det hjelper deg å
forstå norsk lov, dokumentere saken din og skrive klage eller anke selv.

🌐 Live: [rettbot.com](https://rettbot.com) · Leveres av Grønberg Tech Solutions

> RettBot+ er **ikke** en advokat og gir ikke individuell juridisk rådgivning. Det er et
> informasjons- og selvhjelpsverktøy. Se [personvern](frontend/src/pages/Personvern.tsx)
> og [vilkår](frontend/src/pages/Vilkar.tsx).

---

## Hva det faktisk er (ærlig beskrivelse)

En **FastAPI-monolitt** (Python) som både er API og serverer en ferdigbygd
**React/Vite-PWA**. AI-svarene kommer fra **Anthropic Claude**. Saksdata lagres
**kryptert server-side** (Fernet) i PostgreSQL.

**Det gjør IKKE:** klient-side/zero-knowledge-kryptering, Tor, blockchain, «duress mode»,
distribuert backup eller andre ting tidligere versjoner av denne README-en påsto. Data
krypteres på serveren (som har nøkkelen), og AI-tekst sendes til Anthropic i USA under
SCC/DPA. Se personvernsiden for den fulle, ærlige beskrivelsen.

## Teknologistack

| Lag | Teknologi |
|---|---|
| Backend | Python, FastAPI, uvicorn/gunicorn |
| Auth/sikkerhet | PyJWT, bcrypt, Fernet (`cryptography`), egen RateLimiter, CSP/security headers |
| AI | Anthropic Claude (`claude-opus-5`) via `AsyncAnthropic`, streaming |
| Database | PostgreSQL (prod) / SQLite (dev) via egen abstraksjon (`backend/db.py`) |
| PDF | reportlab (saksmappe) |
| Frontend | React 18 + TypeScript + Vite, Tailwind CSS, react-router-dom, lucide-react, vite-plugin-pwa |
| Drift | Docker + Railway, server-side SEO-injeksjon |

## Kom i gang (utvikling)

Krav: Python 3.12, Node 18+.

```bash
# Backend (fra repo-roten)
python -m venv .venv
.venv/Scripts/pip install -r backend/requirements.txt      # Windows-sti
ENVIRONMENT=development FORCE_HTTPS=false JWT_SECRET=dev \
  .venv/Scripts/python -m uvicorn backend.main:app --port 8000 --reload
```

```bash
# Frontend (eget terminalvindu)
cd frontend
npm install
npm run dev        # Vite på http://localhost:3000, proxier /api til :8000
```

I dev genereres JWT/ENCRYPTION-nøkler automatisk, og databasen faller tilbake til SQLite.
For å teste hele stacken slik den kjører i prod: `cd frontend && npm run build`, så
serverer backend den ferdige `frontend/dist/` direkte.

## Miljøvariabler

| Variabel | Påkrevd | Beskrivelse |
|---|---|---|
| `ANTHROPIC_API_KEY` | for AI | Claude API-nøkkel |
| `JWT_SECRET` | i prod | Signering av JWT |
| `ENCRYPTION_KEY` | i prod | Fernet-nøkkel. **Endre aldri** – da blir krypterte saker uleselige |
| `ENVIRONMENT` | ja | `development` / `production` (styrer bl.a. at `/docs` er av i prod) |
| `DATABASE_URL` | i prod | PostgreSQL. Uten den brukes SQLite (dev) |
| `FRONTEND_URL` | for e-post | Brukes i passord-reset-lenker |
| `SMTP_USERNAME` / `SMTP_PASSWORD` | for e-post | Passord-reset (Gmail: app-passord) |
| `AI_RATE_LIMIT_MAX` / `AI_RATE_LIMIT_WINDOW_MIN` | valgfri | Per-bruker takst på AI-kall (std. 30 / 5 min) |
| `ANTHROPIC_MODEL` / `ANTHROPIC_EFFORT` | valgfri | Overstyr modell/innsats |
| `LOVDATA_API_KEY` / `LOVDATA_API_BASE` | valgfri | Rettspraksis-integrasjon (ikke aktiv ennå) |

## Sikkerhet og personvern (kort)

- AI-endepunktene krever innlogging, med per-bruker rate limit mot kostnadssprekk.
- Saksdata Fernet-kryptert server-side; passord hashet med bcrypt; HTTPS.
- Ingen sporingskapsler; logger uten saksinnhold; ingen AI-trening på brukerdata.
- Behandler art. 9/10-data (sensitive/straffedom) – se `DPIA_UTKAST.md`.

## Deploy

Docker-image bygger frontend (`npm run build`) og installerer backend-avhengigheter,
og kjører via `start.py`/uvicorn på Railway. Operatør-sjekklisten (nøkler, domene, DPA,
DPIA, SMTP) ligger i [TODO_HELENE.md](TODO_HELENE.md).

## Mer dokumentasjon

- [ARKITEKTUR.md](ARKITEKTUR.md) – detaljert arkitektur, mappestruktur, datamodell og flyt
- [TODO_HELENE.md](TODO_HELENE.md) – gjenstående operatør-/juridiske oppgaver
- [DPIA_UTKAST.md](DPIA_UTKAST.md) – personvernkonsekvensvurdering (utkast)

> Merk: flere eldre `.md`-filer i repo-roten (fra en tidligere versjon) er utdaterte og
> delvis feil. ARKITEKTUR.md og denne README-en er kildene som stemmer med koden i dag.
