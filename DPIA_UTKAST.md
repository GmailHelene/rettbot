# DPIA – Personvernkonsekvensvurdering (FØRSTEUTKAST)

**Tjeneste:** RettBot+ (rettbot.com)
**Behandlingsansvarlig:** Grønberg Tech Solutions (org.nr 927 889 404) v/Helene Åsheim Grønberg
**Dato:** 06.08.2026
**Status:** Utkast. Må gjennomgås og ferdigstilles av behandlingsansvarlig, og bør kvalitetssikres av en personvernrådgiver/advokat før lansering til ekte brukere.

> Dette er et arbeidsdokument, ikke juridisk rådgivning. Det er skrevet for å gi
> deg et solid utgangspunkt, slik at du ikke starter fra blankt ark. Fyll inn
> feltene i klammer, og få en fagperson til å bekrefte vurderingene.

---

## 1. Hvorfor gjøres en DPIA?

RettBot+ behandler opplysninger om **straffedommer og lovovertredelser** (GDPR art. 10)
og trolig **særlige kategorier** (art. 9, f.eks. helse) som brukerne selv legger inn
om sin egen sak. Behandling av slike data i stor skala utløser normalt krav om DPIA
etter GDPR art. 35, og treffer flere av Datatilsynets kriterier (sårbare registrerte,
sensitive data, ny teknologi/AI). Derfor gjennomføres denne vurderingen før tjenesten
åpnes for ekte brukere.

## 2. Beskrivelse av behandlingen

**Hva tjenesten gjør:** RettBot+ hjelper privatpersoner å forstå rettighetene sine,
dokumentere en sak mot det offentlige (politi, NAV, barnevern, forvaltningen), og
skrive klager/anke selv. Den kombinerer oppslag i norsk lov, AI-genererte svar og
praktiske verktøy (fristkalkulator, maler, innsynskrav, tidslinje, bevisopplasting,
saksmappe-PDF).

**Kategorier registrerte:**
- Brukere (privatpersoner) som oppretter konto og legger inn saksopplysninger.
- Tredjepersoner som omtales i saksteksten brukeren legger inn (f.eks. navngitte
  tjenestepersoner, motparter).

**Kategorier personopplysninger:**
- Kontodata: e-post, navn, hashet passord (bcrypt).
- Fritt innlagt saksinnhold: saksfakta, bevisbeskrivelser, dokumenter, tidslinje.
  Kan inneholde art. 9 (helse) og art. 10 (straffedommer/lovovertredelser).
- Tekniske logger: tidspunkt, feil, hvilken funksjon som ble kalt (ikke saksinnhold).

**Dataflyt:**
1. Bruker legger inn tekst via nettleseren (HTTPS).
2. Data lagres i database (PostgreSQL), kryptert server-side med Fernet.
3. For AI-funksjoner sendes den innlagte teksten til **Anthropic (Claude API)** i USA,
   svar returneres og vises/lagres.
4. Bruker kan laste ned egne data (JSON-eksport og PDF-saksmappe) og slette kontoen.

**Formål:** Levere tjenesten brukeren ber om; hjelpe brukeren å ivareta egne
rettskrav.

## 3. Rettslig grunnlag

- Alminnelige data: avtale med brukeren, GDPR art. 6 nr. 1 b.
- Særlige kategorier (art. 9): uttrykkelig samtykke (art. 9 nr. 2 a) og nødvendig for
  å fastsette/gjøre gjeldende/forsvare rettskrav (art. 9 nr. 2 f).
- Straffedomsopplysninger (art. 10): behandles på vegne av den registrerte om egen
  sak, med grunnlag i samtykke og for egne rettskrav, jf. personopplysningsloven § 11.

> Åpent punkt: få en fagperson til å bekrefte at art. 9 nr. 2 f + poppl. § 11 er
> tilstrekkelig hjemmel for din konkrete modell.

## 4. Nødvendighet og forholdsmessighet

- **Dataminimering:** Brukeren oppfordres flere steder (personvern, AI-banner,
  vilkår) til ikke å dele mer sensitivt enn saken krever.
- **Formålsbegrensning:** Data brukes kun til å levere funksjonene; ikke til
  AI-trening (Anthropic trener som standard ikke på API-innhold), ikke til
  markedsføring, ingen sporingskapsler.
- **Lagringsbegrensning:** Data lagres så lenge kontoen er aktiv; brukeren kan
  når som helst slette konto og alle data.
- **Alternativ vurdert:** De ikke-AI-verktøyene (frist, maler, innsyn) kan brukes
  helt uten å sende sensitiv tekst til AI.

## 5. Involverte parter og overføringer

| Rolle | Part | Merknad |
|---|---|---|
| Behandlingsansvarlig | Grønberg Tech Solutions (org.nr 927 889 404) | Bestemmer formål og midler |
| Databehandler (hosting) | Railway | Drift av app og database |
| Databehandler (AI) | Anthropic | Behandler innlagt tekst for AI-svar |
| Underleverandør (DB) | PostgreSQL på Railway | Kryptert server-side |

**Tredjelandsoverføring:** Innlagt tekst til AI overføres til **USA (Anthropic)**.
Overføringsgrunnlag: EUs standard personvernbestemmelser (SCC) som del av
Anthropics databehandleravtale (DPA), som er innbakt i de kommersielle vilkårene.

> Åpne punkter: (1) signer/bekreft DPA med Anthropic. (2) inngå/bekreft
> databehandleravtale med Railway. (3) vurder om det trengs en supplerende
> vurdering (TIA) for USA-overføringen.

## 6. Risikovurdering for de registrerte

| # | Risiko | Sanns. | Konsekvens | Samlet |
|---|---|---|---|---|
| R1 | Uautorisert tilgang til sensitive saksdata (hacking, lekkasje) | Lav–Middels | Høy (art. 9/10) | Middels–Høy |
| R2 | Feil/misvisende AI-svar fører til dårlig beslutning (mistet frist, tapt sak) | Middels | Middels–Høy | Middels |
| R3 | Bruker deler mer sensitivt enn nødvendig, også om tredjepersoner | Middels | Middels | Middels |
| R4 | USA-overføring / myndighetsinnsyn hos underleverandør | Lav | Middels–Høy | Middels |
| R5 | Kostnads-/misbruk av AI (ikke personvern, men drift) | Lav | Lav | Lav |
| R6 | Manglende sletting/innsyn ved forespørsel | Lav | Middels | Lav–Middels |

## 7. Tiltak som allerede er på plass

- Server-side kryptering (Fernet) av saksdata; passord hashet med bcrypt; HTTPS.
- AI-funksjoner krever innlogging; per-bruker rate limit mot misbruk.
- Ingen sporingskapsler; logger uten saksinnhold; ingen AI-trening på dataene.
- Tydelig «AI-generert – sjekk kilden»-banner og «dette kan verktøyet ikke»-liste,
  samt AI som er instruert til å si ifra om svak sak/utløpt frist (mot R2).
- Oppfordring til dataminimering flere steder (mot R3).
- GDPR-eksport (JSON) og selvbetjent sletting av konto/alle data (mot R6).
- SCC/DPA som grunnlag for USA-overføring (mot R4).

## 8. Tiltak som bør vurderes / gjenstår

Gjennomgått 06.08.2026. Status:

- [x] **Rutine for varsling ved brudd (72-timers).** Utarbeidet – se
      [VARSLINGSRUTINE_BRUDD.md](VARSLINGSRUTINE_BRUDD.md).
- [x] **Logg-gjennomgang.** Gjennomført: fjernet saksinnhold (research-spørring,
      tiltale, institusjoner, filnavn) og e-postadresser fra loggene; reset-token
      logges aldri i produksjon. Loggene inneholder nå kun tekniske data.
- [x] **Maksimal lagringstid.** Policy angitt i personvern: bruker kan slette selv
      når som helst; kontoer inaktive > 24 mnd slettes etter varsel.
      *(Automatisk slette-jobb gjenstår å implementere – Fase 3.)*
- [x] **Aldersgrense.** Angitt i personvern/vilkår: tjenesten for voksne; under 18
      bør bruke med verge.
- [~] **Kryptering / nøkkelhåndtering.** Saksdata er Fernet-kryptert server-side.
      `ENCRYPTION_KEY` lagres kun som Railway-miljøvariabel (aldri i repo).
      Nøkkelrotasjon (MultiFernet) og kryptering av flere felt vurderes senere;
      vurdert som akseptabelt nå.
- [~] **TIA (USA-overføring).** Kort vurdering: grunnlag er SCC via Anthropics DPA,
      supplert av kryptering i transit (HTTPS), ingen AI-trening og dataminimering.
      Sjekk om Anthropic er DPF-sertifisert (forenkler overføringen). Full TIA bør
      bekreftes av fagperson.
- [x] **Signere/bekrefte DPA (Anthropic + Railway).** Anthropic: auto-innbakt i de
      kommersielle vilkårene (kopi arkivert). Railway: DPA akseptert.
- [ ] **Fagperson bekrefter rettslig grunnlag (art. 9/10).** **Din handling** –
      kan ikke erstattes av kode.

## 9. Restrisiko og konklusjon

Med tiltakene i punkt 7 vurderes restrisikoen som **lav til akseptabel**, forutsatt
at det rettslige grunnlaget for særlige kategorier (art. 9/10) bekreftes av fagperson
(gjenstående punkt i punkt 8). Behandlingen kan starte i begrenset skala, men bør ikke
markedsføres bredt mot ekte brukere før dette punktet er lukket. Restrisikoen vurderes
ikke som «høy» i art. 36-forstand, og forhåndskonsultasjon med Datatilsynet anses derfor
ikke nødvendig på nåværende tidspunkt. Vurderes restrisikoen senere som høy og ikke
reduserbar, skal Datatilsynet forhåndskonsulteres (art. 36).

**Ansvarlig for oppfølging:** Helene Åsheim Grønberg
**Neste gjennomgang:** 06.12.2026
