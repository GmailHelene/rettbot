# TODO – ting bare du (Helene) kan gjøre

Koden er ferdig og pushet. Dette er stegene som krever *deg* – kontoer,
nøkler, beslutninger og verifisering. Prioritert: 🔴 gjør nå · 🟡 før ekte
brukere · 🟢 senere/vekst.

---

## ✅ Nylig utført i koden (etter sikkerhets-/juridisk gjennomgang)

- **AI-endepunktene er lukket bak innlogging.** Ingen kan lenger bruke AI-
  funksjonene (og dermed Anthropic-regningen din) uten å være innlogget.
- **Per-bruker takst på AI-kall** (mot kostnadssprekk hvis én konto spammer).
  Kan justeres med `AI_RATE_LIMIT_MAX` (standard 30) og `AI_RATE_LIMIT_WINDOW_MIN`
  (standard 5) i Railway hvis du vil ha strammere/løsere grense.
- **`/docs`, `/redoc` og `/openapi.json` er slått av i produksjon** (var åpne API-
  kart før). Krever `ENVIRONMENT=production` i Railway.
- **«Zero-knowledge»-påstanden er fjernet** – personvern og API beskriver nå ærlig
  server-side-kryptering.
- **Rettssak-simulatoren er fjernet** (kunne gi falskt inntrykk av domsutfall).
- **Ærlighet bygget inn i AI-en:** den skal si ifra når saken er svak, fristen
  trolig er ute, eller klageveien er uttømt – i stedet for å love seier.
- **Personvern oppdatert:** egen seksjon om art. 9/10-data og om USA-overføring
  til Anthropic (SCC/DPA). Se de to advokat-/DPA-punktene under 🟡.

---

## 🔴 Gjør nå (ellers fungerer ikke live-appen riktig)

- [ ] **Ny Anthropic-nøkkel i Railway.** Du roterte nøkkelen (bra!) – den gamle
  er ugyldig. Railway → tjenesten → **Variables** → sett
  `ANTHROPIC_API_KEY = sk-ant-...` (den nye).
  **Verifiser:** åpne `https://<din-app>/api/health` → skal vise `"claude": true`.

- [ ] **Bekreft sikkerhetsnøklene i Railway:** `JWT_SECRET`, `ENCRYPTION_KEY`,
  `ENVIRONMENT=production`. ⚠️ **Endre aldri `ENCRYPTION_KEY`** etterpå – da blir
  krypterte saker uleselige.

- [ ] **PostgreSQL:** Railway → **New → Database → PostgreSQL**. Så i app-tjenesten:
  Variables → `DATABASE_URL = ${{Postgres.DATABASE_URL}}` (bytt `Postgres` med
  tjenestenavnet). **Verifiser:** `/api/health` → `"database": true`.

- [ ] **Deploy-sjekk:** Railway → Deployments → siste → Logs skal vise
  `Claude engine initialized` og `RettBot+ API ready!` (ikke feil om manglende
  nøkler). Åpne siden med **hard refresh** (Ctrl+Shift+R) pga. PWA-cache.

- [ ] **Drep den gamle OpenAI-nøkkelen.** Den lå offentlig i repoet tidligere.
  Gå til platform.openai.com → API keys → slett den. Slett også
  `OPENAI_API_KEY`-variabelen i Railway (ubrukt nå).

---

## 🟡 Før du slipper inn ekte brukere

- [ ] **E-post for passord-reset.** Uten dette sendes ingen reset-e-post.
  Sett i Railway:
  - `SMTP_USERNAME` og `SMTP_PASSWORD` (for Gmail: lag et **app-passord**, ikke
    vanlig passord)
  - `SMTP_SERVER` / `SMTP_PORT` hvis du ikke bruker Gmail (standard:
    `smtp.gmail.com` / `587`)
  - `FRONTEND_URL = https://rettbot.com` (så reset-lenken peker riktig)
  **Test:** «Glemt passord» på login → sjekk at e-post kommer.
  *(Vil du heller bruke en e-posttjeneste som Postmark/SendGrid? Si ifra, så
  kobler jeg det opp.)*

- [ ] **Koble domenet rettbot.com.** Railway → tjenesten → Settings → Domains →
  legg til `rettbot.com` og `www.rettbot.com`. Oppdater DNS hos registraren din
  (Domeneshop e.l.) med postene Railway viser.

- [ ] **Fyll inn kontakt i personvernerklæringen.** Siden `/personvern` har
  `[sett inn kontakt-e-post]`. Bestem også **hvem som er behandlingsansvarlig**
  (deg privat / enkeltpersonforetak / AS) og skriv det inn. *(Jeg kan oppdatere
  teksten når du gir meg verdiene.)*

- [ ] **Databehandleravtale (DPA) med Anthropic – signer den.** Sakstekst sendes til
  Anthropic for AI-behandling, og overføres til USA. Anthropic tilbyr en DPA med
  EU Standard Contractual Clauses (SCC). Gå til Anthropic-konsollen → **Privacy /
  Data Processing Agreement**, aksepter/signer, og ta vare på PDF-en. Personvern-
  siden viser allerede at overføringen skjer til USA og at grunnlaget er SCC/DPA –
  men teksten stemmer først når avtalen faktisk er signert.

- [ ] **DPIA (personvernkonsekvensvurdering).** Fordi appen behandler straffedoms-
  opplysninger (GDPR art. 10) og særlige kategorier (art. 9) i stor skala, kreves
  normalt en DPIA før lansering (art. 35). Datatilsynet har mal. *(Jeg kan lage et
  førsteutkast basert på hvordan appen faktisk behandler data – si ifra.)*

- [ ] **Advokatsjekk av rettslig grunnlag for art. 9/10-data.** Personvern-siden
  angir samtykke (art. 9 nr. 2 a), rettskrav (art. 9 nr. 2 f) og
  personopplysningsloven § 11 for straffedomsopplysninger. Få en advokat/personvern-
  rådgiver til å bekrefte at dette holder for din konkrete modell, og la samme
  advokat se over AI-svarene og «ikke juridisk rådgivning»-linjen.

- [ ] **Brukervilkår.** Bør på plass før lansering. *(Jeg kan lage et utkast –
  du eier og godkjenner det.)*

- [ ] **Kostnadstak.** Sett en usage-grense i Anthropic-konsollen (og OpenAI hvis
  kontoen er åpen), så du ikke får en overraskelsesregning. Appen har nå både
  innlogging og per-bruker takst på AI-kall, men et hardt tak i konsollen er
  siste skanse.

---

## 🟢 Senere / vekst

- [ ] **Lovdata Pro-lisens for rettspraksis (dommer).** Kontakt Lovdata om API-
  tilgang. Når du har det: send meg **API-dokumentasjonen**, så fyller jeg inn
  `lovdata_case_law_search` og du setter `LOVDATA_API_KEY` + `LOVDATA_API_BASE`
  i Railway. (Lovtekst er allerede koblet inn – dette gjelder kun dommer.)

- [ ] **Feilovervåking (Sentry).** Lag konto → gi meg DSN, så kobler jeg det opp.

- [ ] **Personvernvennlig analyse** for å lære hva brukerne trenger (uten
  sporing). Jeg kan sette opp når du vil.

---

## Ting jeg (Claude) tar når du gir grønt lys
- Flere funksjoner: innsynskrav-veiviser, saks-tidslinje, PDF-eksport av brev.
- Wire opp e-posttjeneste / Sentry / analyse.
- Utkast til brukervilkår.
- Fullføre Lovdata-integrasjonen når du har API-dok.
