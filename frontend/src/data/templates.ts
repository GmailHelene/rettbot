/**
 * Generiske dokumentmaler (klage, anke, anmeldelse, innsyn m.m.).
 *
 * Dette er nøytrale skjeletter du fyller ut selv – ikke ferdig juridisk
 * argumentasjon eller rådgivning. Tekst i [KLAMMER] bytter du ut. Sjekk alltid
 * frist og fremgangsmåte hos instansen saken gjelder.
 */

export interface DocTemplate {
  id: string;
  title: string;
  description: string;
  tips: string[];
  body: string;
}

export const templates: DocTemplate[] = [
  {
    id: 'klage-vedtak',
    title: 'Klage på vedtak',
    description: 'Generell klage på et enkeltvedtak fra en offentlig instans (kommune, NAV, Statsforvalteren m.fl.).',
    tips: [
      'Klagefristen er ofte 3 uker fra du mottok vedtaket – sjekk vedtaket ditt.',
      'Send klagen til den som fattet vedtaket; de sender den videre til klageinstansen.',
      'Vær konkret om hva du er uenig i, og hva du mener er riktig.',
    ],
    body: `[Ditt navn]
[Din adresse]
[Postnummer og sted]
[Telefon / e-post]

[Mottakers navn / instans]
[Adresse]

Sted, [dato]

KLAGE PÅ VEDTAK

Saksnummer/referanse: [saksnr]
Vedtaket er datert: [dato på vedtaket]
Jeg mottok vedtaket: [dato]

Jeg klager med dette på vedtaket som gjelder [kort hva saken gjelder].

Hva jeg klager på:
[Beskriv konkret hva i vedtaket du er uenig i.]

Begrunnelse:
[Forklar hvorfor du mener vedtaket er feil – faktiske forhold, opplysninger som
mangler eller er misforstått, eller hvorfor konklusjonen er urimelig.]

Hva jeg ber om:
[Skriv hva du ønsker – f.eks. at vedtaket omgjøres, eller at saken vurderes på nytt.]

Vedlegg:
[List opp eventuelle vedlegg – f.eks. kopi av vedtaket, dokumentasjon.]

Med vennlig hilsen
[Ditt navn]`,
  },
  {
    id: 'anke',
    title: 'Anke',
    description: 'Generelt skjelett for en anke. Fremgangsmåte og frist varierer etter sakstype – sjekk avgjørelsen du anker på.',
    tips: [
      'Ankefristen står vanligvis i avgjørelsen – ikke vent for lenge.',
      'Vær tydelig på hva du anker over og hvorfor avgjørelsen bør endres.',
    ],
    body: `[Ditt navn]
[Din adresse]
[Postnummer og sted]
[Telefon / e-post]

[Mottaker – instans/domstol]
[Adresse]

Sted, [dato]

ANKE

Sak/referanse: [saksnr]
Avgjørelsen er datert: [dato]

Jeg anker med dette over avgjørelsen i saken ovenfor.

Hva anken gjelder:
[Beskriv hvilken del av avgjørelsen du anker over.]

Begrunnelse:
[Forklar hvorfor du mener avgjørelsen er feil – faktisk og/eller rettslig.]

Hva jeg ber om:
[Skriv hva du ønsker at utfallet skal bli.]

Vedlegg:
[List opp vedlegg.]

Med vennlig hilsen
[Ditt navn]`,
  },
  {
    id: 'anmeldelse',
    title: 'Anmeldelse til politiet',
    description: 'Skjelett for å anmelde et forhold. Du kan også anmelde direkte hos politiet (oppmøte eller på nett).',
    tips: [
      'Ta med tid, sted og hva som skjedde – så konkret som mulig.',
      'Oppgi eventuelle vitner og bevis.',
    ],
    body: `[Ditt navn]
[Din adresse]
[Postnummer og sted]
[Telefon / e-post]

Politiet
[Politidistrikt]

Sted, [dato]

ANMELDELSE

Jeg ønsker å anmelde følgende forhold:

Hva skjedde:
[Beskriv hendelsen konkret.]

Tid og sted:
[Når og hvor skjedde det?]

Involverte:
[Navn/beskrivelse av involverte, hvis kjent.]

Vitner:
[Navn og kontaktinfo på eventuelle vitner.]

Bevis:
[Beskriv bilder, meldinger, dokumenter e.l. du har.]

Med vennlig hilsen
[Ditt navn]`,
  },
  {
    id: 'innsyn',
    title: 'Krav om innsyn',
    description: 'Be om innsyn i opplysninger eller dokumenter – i egne personopplysninger (personvern) eller i offentlige dokumenter.',
    tips: [
      'Du har rett til innsyn i personopplysninger om deg selv (personvern).',
      'I offentlige organers dokumenter kan du be om innsyn etter offentleglova.',
      'Du trenger ikke begrunne et innsynskrav.',
    ],
    body: `[Ditt navn]
[Din adresse]
[Postnummer og sted]
[Telefon / e-post]

[Mottaker – instans]
[Adresse]

Sted, [dato]

KRAV OM INNSYN

Jeg ber med dette om innsyn i [beskriv hva du vil ha innsyn i – f.eks. alle
personopplysninger dere har om meg, eller dokumentene i sak [saksnr]].

[Hvis personvern:] Kravet fremmes etter retten til innsyn i egne
personopplysninger.

[Hvis offentlige dokumenter:] Kravet fremmes etter offentleglova.

Jeg ber om å få innsynet oversendt til [e-post/adresse].

Med vennlig hilsen
[Ditt navn]`,
  },
  {
    id: 'klage-politiet',
    title: 'Klage på politiets oppførsel',
    description: 'For kritikkverdig oppførsel eller behandling som ikke nødvendigvis er straffbar. Straffbare forhold hører hjemme hos Spesialenheten.',
    tips: [
      'Beskriv hendelsen konkret: tid, sted, hvem og hva.',
      'Gjelder det mulig straffbart forhold, kontakt Spesialenheten for politisaker.',
    ],
    body: `[Ditt navn]
[Din adresse]
[Postnummer og sted]
[Telefon / e-post]

Politimesteren i [politidistrikt]
[Adresse]

Sted, [dato]

KLAGE PÅ POLITIETS OPPTREDEN

Jeg ønsker å klage på hvordan jeg ble behandlet av politiet.

Når og hvor:
[Dato, klokkeslett og sted.]

Hva skjedde:
[Beskriv hendelsen så konkret som mulig.]

Hvorfor jeg mener dette er kritikkverdig:
[Forklar.]

Vitner/bevis:
[Eventuelle vitner, bilder, opptak.]

Hva jeg ber om:
[F.eks. en beklagelse, en forklaring, eller at forholdet blir vurdert.]

Med vennlig hilsen
[Ditt navn]`,
  },
];
