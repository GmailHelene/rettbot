# TODO – ting bare du (Helene) kan gjøre

Koden er ferdig og pushet. Dette er stegene som krever *deg* – kontoer,
nøkler, beslutninger og verifisering. Prioritert: 🔴 gjør nå · 🟡 før ekte
brukere · 🟢 senere/vekst.

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

- [ ] **Databehandleravtale (DPA) med Anthropic.** Sakstekst sendes til Anthropic
  for AI-behandling. Anthropic tilbyr en DPA – viktig for GDPR når du behandler
  ekte persondata.

- [ ] **Juridisk gjennomgang.** La en advokat se over AI-svarene og
  «ikke juridisk rådgivning»-linjen før ekte sensitive saker. Reduserer ansvar.

- [ ] **Brukervilkår.** Bør på plass før lansering. *(Jeg kan lage et utkast –
  du eier og godkjenner det.)*

- [ ] **Kostnadstak.** Sett en usage-grense i Anthropic-konsollen (og OpenAI hvis
  kontoen er åpen), så du ikke får en overraskelsesregning.

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
