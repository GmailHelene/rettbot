# Notat til jurist/personvernrådgiver - RettBot+

**Fra:** Helene Åsheim Grønberg, Grønberg Tech Solutions (org.nr 927 889 404)
**Kontakt:** helene721@gmail.com
**Gjelder:** Rettslig grunnlag for behandling av særlige kategorier (art. 9) og straffedomsopplysninger (art. 10)
**Dato:** 07.08.2026

---

## Det jeg trenger fra deg

Jeg har bygget en tjeneste der folk legger inn sine egne saker mot politi/myndigheter og får AI-hjelp til å forstå rettighetene sine. Sakene kan inneholde helseopplysninger og opplysninger om straffbare forhold. Jeg vil ikke slippe inn mange ekte brukere før en fagperson har sagt at grunnlaget jeg har lagt til grunn holder.

Konkret: **les punkt 3 (grunnlaget jeg har valgt) og svar på spørsmålene i punkt 5.** Resten er bakgrunn. Du trenger ikke se på koden - jeg trenger en juridisk vurdering, ikke en teknisk.

---

## 1. Hva tjenesten er

RettBot+ (rettbot.com) er et verktøy, ikke en advokat. Brukeren oppretter konto, legger inn sin egen sak (fritekst, dokumenter, bevis, tidslinje), og kan bruke AI-funksjoner til ting som å forstå et vedtak, finne klagefrister, eller lage utkast til klage/innsynskrav. All AI-tekst er merket «AI-generert, kan ta feil - sjekk mot Lovdata». Tjenesten gir ingen bindende rådgivning.

Behandlingsansvarlig er Grønberg Tech Solutions (ENK). Jeg driver dette alene.

## 2. Hva som faktisk behandles

- **Konto:** e-post, navn, hashet passord.
- **Saker og bevis:** fritekst, dokumenter og filer brukeren selv legger inn. Kryptert på serveren (Fernet, applikasjonslag).
- **Særlige kategorier (art. 9):** kan forekomme fordi brukeren skriver fritt om egen sak - typisk helse.
- **Straffedomsopplysninger (art. 10):** kan forekomme - saken kan gjelde et straffbart forhold brukeren selv er involvert i.
- **Teknisk:** vanlige tjenerlogger (tidspunkt, feil, hvilken funksjon). Ingen sporing/analyse. Selve saksinnholdet logges ikke.

Alle opplysningene handler om brukeren selv, lagt inn av brukeren selv. Vi henter ikke inn data om tredjepersoner aktivt, men brukeren kan i prinsippet nevne andre i fritekst.

## 3. Rettslig grunnlag jeg har lagt til grunn (dette er det jeg vil ha bekreftet)

Ordrett fra personvernerklæringen:

- **Alminnelig behandling:** oppfyllelse av avtalen med brukeren (art. 6 nr. 1 b), og samtykke der brukeren selv legger inn sensitive opplysninger.
- **Art. 9 (særlige kategorier):** brukerens **uttrykkelige samtykke** (art. 9 nr. 2 bokstav a), OG at behandlingen er nødvendig for å fastsette, gjøre gjeldende eller forsvare rettskrav (art. 9 nr. 2 bokstav f).
- **Art. 10 (straffedomsopplysninger):** behandles på vegne av den registrerte, med grunnlag i samtykke og for å ivareta brukerens egne rettskrav, jf. **personopplysningsloven § 11**.

Brukeren gir et eksplisitt samtykke til AI-behandling før første AI-kall (registrert på server), og kan når som helst trekke det tilbake og be om sletting.

## 4. Tekniske tiltak (kort, for kontekst)

- Saksinnhold krypteres server-side (Fernet).
- Fødselsnummer og telefonnummer fjernes automatisk fra teksten før den sendes til AI-leverandør.
- AI-leverandør er **Anthropic (Claude)**, databehandler med DPA. Overføring til USA er sikret med SCC (Standard Contractual Clauses) i DPA-en. Anthropic bruker som standard ikke API-innhold til trening; vi trener ingen egen modell.
- Bruker kan eksportere alle egne data (art. 20) og slette kontoen selv.
- Aldersgrense: tjenesten er for voksne.
- DPIA er utarbeidet (vedlegg), med varslingsrutine ved brudd.

## 5. Spørsmålene jeg trenger svar på

1. **Holder art. 9 nr. 2 a (uttrykkelig samtykke) som hovedgrunnlag** for en tjeneste som denne, gitt at brukeren legger inn helseopplysninger frivillig om seg selv? Er det problematisk at samtykket er en forutsetning for å bruke tjenesten (frivillighet/maktbalanse)?

2. **Er det riktig og nødvendig å også påberope art. 9 nr. 2 f** (rettskrav) i tillegg til samtykke, eller bør jeg velge ett grunnlag? Hva er sterkest her?

3. **Art. 10 + poppl. § 11:** er min forståelse riktig - at jeg kan behandle straffedomsopplysninger den registrerte selv legger inn om egen sak, med samtykke og for brukerens egne rettskrav? Er det noe jeg mangler her?

4. **Utformingen av samtykket:** er et eksplisitt samtykke før første AI-kall (avkryssing/aktiv handling, logget) tilstrekkelig, eller bør samtykket spesifiseres mer (f.eks. eget punkt for art. 9, eget for USA-overføring)?

5. **USA-overføring:** er SCC via Anthropics DPA nok, eller bør jeg gjøre en egen transfer impact assessment (TIA) / opplyse tydeligere? Er det relevant om Anthropic er DPF-sertifisert?

6. **Ansvarsfraskrivelse:** «ikke juridisk rådgivning»-linjen - er den formulert godt nok til å stå seg, eller bør ordlyden strammes?

7. **Er det noe åpenbart jeg har oversett** som gjør at jeg IKKE bør slippe inn ekte brukere ennå?

## 6. Vedlegg

- Personvernerklæring: rettbot.com/personvern
- DPIA-utkast (`DPIA_UTKAST.md`) - restrisiko vurdert som lav/akseptabel forutsatt din bekreftelse
- Varslingsrutine ved brudd (`VARSLINGSRUTINE_BRUDD.md`)

Si ifra hvis du trenger mer. Jeg kan sende DPIA-en og databehandleravtalen som filer.
