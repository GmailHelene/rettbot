# TODO – ting bare du (Helene) kan gjøre

Oppdatert 06.08.2026. Koden er langt på vei ferdig og pushet. Dette er det som
krever *deg* – kontoer, nøkler, beslutninger og verifisering.
Prioritet: 🔴 gjør nå · 🟡 før ekte brukere · 🟢 senere/vekst.

---

## ✅ Gjort (kode + dine handlinger)

**Sikkerhet & drift**
- AI-endepunktene krever innlogging + per-bruker rate limit (mot misbruk/kostnad).
- `/docs`, `/redoc`, `/openapi.json` av i produksjon.
- Én web-worker pinnet (in-memory rate limit virker korrekt).
- Logg-gjennomgang: saksinnhold og e-post fjernet fra logger; reset-token logges aldri i prod.
- Anthropic-nøkkel, `JWT_SECRET`, `ENCRYPTION_KEY`, `ENVIRONMENT=production`, PostgreSQL og domenet rettbot.com er på plass (bekreftet via `/api/health`).

**Juridisk & personvern**
- Eksplisitt AI-samtykke (art. 9 nr. 2 a) før første AI-kall, registrert server-side.
- Personvern: art. 9/10-grunnlag, USA-overføring (SCC/DPA), ingen AI-trening, logging, lagringstid, aldersgrense.
- Behandlingsansvarlig satt: **Grønberg Tech Solutions** (ENK). Kontakt-e-post inne.
- Brukervilkår med lovvalg/verneting.
- DPIA-utkast (`DPIA_UTKAST.md`) + varslingsrutine ved brudd (`VARSLINGSRUTINE_BRUDD.md`).
- DPA: Anthropic (auto-innbakt) + Railway (signert). ✅
- «Zero-knowledge»-påstand fjernet; ærlig server-side-kryptering beskrevet.

**Produkt & innhold**
- Rettssak-simulator fjernet. «Ærlighet» + «AI-generert, sjekk kilden»-banner + «dette kan verktøyet ikke»-liste.
- Nye funksjoner: eksempler, guidede veivisere, nytte-måling, PDF-saksmappe.
- Juridisk eval-suite (`backend/evals/`) for frister/paragrafer.

**SEO**
- Server-side per-rute title/meta/OG/canonical + JSON-LD, sitemap, Google Search Console verifisert.

---

## 🔴 Gjør nå

- [ ] **Test passord-reset (Brevo).** Sjekk Railway-variablene (se tabell under) og
  legg til `FRONTEND_URL = https://rettbot.com`. Deretter: «Glemt passord» på login
  → sjekk at e-post kommer. Vanlige feil: `MAIL_PASSWORD` må være Brevos **SMTP-nøkkel**
  (ikke API-nøkkel/kontopassord), og `MAIL_DEFAULT_SENDER` må være en **verifisert avsender** i Brevo.

  | Variabel | Verdi |
  |---|---|
  | `MAIL_SERVER` | `smtp-relay.brevo.com` |
  | `MAIL_PORT` | `587` |
  | `MAIL_USE_TLS` | `true` |
  | `MAIL_USERNAME` | Brevo SMTP-login |
  | `MAIL_PASSWORD` | Brevo SMTP-nøkkel |
  | `MAIL_DEFAULT_SENDER` | verifisert avsender-e-post |
  | `FRONTEND_URL` | `https://rettbot.com` |

- [ ] **Kostnadstak i Anthropic.** `platform.claude.com/usage/limits` → sett spend-tak
  (~$25/mnd til å begynne med) + spend-alert på ~80 %.

- [ ] **Slett den gamle OpenAI-nøkkelen** (lå i repoet før) på platform.openai.com,
  og fjern `OPENAI_API_KEY` i Railway hvis den fortsatt står.

---

## 🟡 Før du slipper inn mange ekte brukere

- [ ] **Advokat/personvernrådgiver bekrefter art. 9/10-grunnlaget** og ser over
  «ikke juridisk rådgivning»-linjen. Dette er den siste juridiske ryggdekningen
  som *må* være menneske.

- [ ] **Ferdigstill DPIA.** Fyll inn resterende klammefelt i `DPIA_UTKAST.md`
  (org.nr, konklusjon om restrisiko) og la fagpersonen over kvalitetssikre den.

- [ ] **Send meg org.nr** til Grønberg Tech Solutions, så føyer jeg det inn i personvern (styrker identiteten).

- [ ] **(Valgfritt) Be Anthropic om Zero Data Retention (ZDR)** for ekstra trygghet
  rundt at input ikke lagres hos dem.

- [ ] **Backup-strategi for PostgreSQL** på Railway (slå på automatiske backups /
  point-in-time recovery). *(Jeg kan dokumentere en rutine.)*

---

## 🟢 Senere / vekst

- [ ] **Lovdata Pro-lisens for rettspraksis (dommer).** Send meg API-dok, så kobler jeg
  inn `lovdata_case_law_search` (lovtekst er allerede inne).
- [ ] **Feilovervåking (Sentry).** Lag konto → gi meg DSN.
- [ ] **Personvernvennlig analyse** (uten sporing).
- [ ] **Kjør/utvid eval-suiten.** `python -m backend.evals.run_evals` (frivillig; koster litt API).

---

## Ting jeg (Claude) tar når du gir grønt lys

**Fase 3 fra ekspertgjennomgangen (større, bevisste valg):**
- CI/CD (GitHub Actions: tsc, build, py_compile, pip-audit, npm audit). *(Startet.)*
- Fødselsnummer-scrubbing før tekst sendes til Anthropic. *(Startet.)*
- `db.py` → SQLAlchemy 2.0 + Alembic (større, egen fokusert jobb).
- Splitte `main.py` i APIRouter-moduler.
- pgvector/RAG for semantisk søk i Lovdata/rettspraksis.
- Full SSR/prerendering for enda bedre SEO.

**Annet:**
- Utvide eval-fasiten mot 50+ saker.
- Wire opp Sentry / analyse / Lovdata når du har kontoene.
- Dokumentere Railway-backup-rutine.
