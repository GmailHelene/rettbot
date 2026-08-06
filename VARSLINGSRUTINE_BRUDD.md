# Varslingsrutine ved brudd på personopplysningssikkerheten

**Vedlegg til [DPIA_UTKAST.md](DPIA_UTKAST.md) · RettBot+ · Grønberg Tech Solutions**
Status: utkast til intern rutine. Bør kvalitetssikres av personvernrådgiver.

Denne rutinen beskriver hva som skjer hvis personopplysninger kommer på avveie,
endres eller blir utilgjengelige uten at det skal skje (GDPR art. 33 og 34).

---

## 1. Hva regnes som et brudd?
Et brudd på personopplysningssikkerheten er brudd på **konfidensialitet** (uvedkommende
får tilgang), **integritet** (data endres/ødelegges) eller **tilgjengelighet** (data
går tapt eller blir utilgjengelig). Eksempler her: lekkasje av database, uautorisert
innlogging på en konto, tapt/kompromittert `ENCRYPTION_KEY` eller `JWT_SECRET`, e-post
med saksdata til feil mottaker, ransomware.

## 2. Roller
- **Ansvarlig (behandlingsansvarlig):** Grønberg Tech Solutions v/Helene Åsheim Grønberg.
- Kontakt: helene721@gmail.com.
- (Utpek gjerne en fast stedfortreder hvis du får medhjelpere.)

## 3. Steg for steg

**Steg 1 – Oppdage og begrense (umiddelbart).**
Stopp pågående skade: rull nøkler (`JWT_SECRET` og evt. andre – merk at `ENCRYPTION_KEY`
ikke kan endres uten å miste eksisterende krypterte data), steng berørte kontoer,
ta tjenesten offline hvis nødvendig, sikre logger.

**Steg 2 – Vurdere (så raskt som mulig).**
Noter: hva skjedde, når, hvilke data og hvor mange registrerte, og hvilken risiko det
gir for de berørte (særlig fordi appen kan inneholde art. 9/10-data → høyere risiko).

**Steg 3 – Melde til Datatilsynet innen 72 timer (art. 33).**
Med mindre bruddet **sannsynligvis ikke** medfører risiko for de registrerte, skal
det meldes til Datatilsynet **innen 72 timer** etter at du ble kjent med det.
Meldeskjema: `datatilsynet.no` → «Melde avvik/brudd». Meldingen skal inneholde:
- Hva som har skjedd (art og omfang, kategorier og omtrentlig antall registrerte/poster).
- Kontaktpunkt (deg).
- Sannsynlige konsekvenser.
- Tiltak som er/vil bli iverksatt.
Rekker du ikke alt innen 72 timer, meld det du har og ettersend resten. Er du i tvil om
det skal meldes, meld heller.

**Steg 4 – Varsle de registrerte ved høy risiko (art. 34).**
Er det sannsynlig **høy risiko** for de berørte (f.eks. sensitive saksdata på avveie),
skal de varsles **uten ugrunnet opphold**, i klart språk: hva som skjedde, sannsynlige
konsekvenser, tiltak, og hva de selv bør gjøre (f.eks. bytte passord).

**Steg 5 – Dokumentere.**
Alle brudd føres i en intern **bruddprotokoll** (se under), uavhengig av om de meldes.

**Steg 6 – Lære.**
Etter håndtering: hva var årsaken, og hvilket tiltak hindrer gjentakelse? Oppdater
DPIA og denne rutinen ved behov.

## 4. Bruddprotokoll (fyll ut per hendelse)

| Felt | Innhold |
|---|---|
| Dato/tid oppdaget | |
| Beskrivelse | |
| Kategorier data / registrerte | |
| Antall berørte (ca.) | |
| Risikovurdering | |
| Meldt Datatilsynet? (dato) | |
| Varslet registrerte? (dato) | |
| Tiltak iverksatt | |
| Rotårsak / læringspunkt | |

## 5. Rask sjekkliste
- [ ] Begrenset skaden (nøkler, kontoer, tilgang)?
- [ ] Vurdert risiko for de registrerte?
- [ ] Meldt Datatilsynet innen 72 t (hvis risiko)?
- [ ] Varslet de registrerte (hvis høy risiko)?
- [ ] Ført i bruddprotokollen?
- [ ] Iverksatt tiltak mot gjentakelse?
