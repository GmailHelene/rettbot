/**
 * Guidede veivisere: steg-for-steg sjekklister for konkrete situasjoner.
 * Hvert steg kan lenke videre til et av verktøyene i appen, så veiviseren
 * binder sammen det som ellers ligger spredt.
 *
 * Dette er praktisk veiledning, ikke juridisk rådgivning.
 */

export interface VeiviserStep {
  title: string;
  body: string;
  link?: { label: string; to: string };
}

export interface Veiviser {
  id: string;
  title: string;
  intro: string;
  /** Emoji/kort merke vist på kortet. */
  badge: string;
  steps: VeiviserStep[];
}

export const veivisere: Veiviser[] = [
  {
    id: 'klage-paa-politiet',
    title: 'Klage på politiet',
    badge: 'Politi',
    intro:
      'Det finnes flere spor, og det er lett å sende til feil sted. Først må du vite hva du egentlig klager på.',
    steps: [
      {
        title: 'Finn ut hva slags klage dette er',
        body:
          'Er det oppførsel/tjenesteutøvelse (uhøflig, feil håndtering)? Mistanke om en straffbar handling begått av politiet? Eller uenighet i at saken din ble henlagt? De tre går til hver sin instans.',
      },
      {
        title: 'Finn rett instans',
        body:
          'Klage på oppførsel går til politimesteren i distriktet. Mistanke om straffbart forhold går til Spesialenheten for politisaker. Klage på henleggelse går til statsadvokaten.',
        link: { label: 'Se hvor du klager', to: '/hvor-klager-du' },
      },
      {
        title: 'Sjekk fristen',
        body:
          'Klage på en henleggelse har som regel tre ukers frist. Regn den ut før du gjør noe annet, så du ikke mister muligheten.',
        link: { label: 'Regn ut fristen', to: '/fristkalkulator' },
      },
      {
        title: 'Be om innsyn i saken',
        body:
          'Be om innsyn i dokumentene så du vet hva politiet faktisk har lagt til grunn. Det gir deg noe konkret å bygge klagen på.',
        link: { label: 'Lag innsynskrav', to: '/innsynskrav' },
      },
      {
        title: 'Skriv klagen',
        body:
          'Hold deg til fakta og datoer, vis til det konkrete du reagerer på, og si tydelig hva du krever. Se hvordan en god klage er bygget opp.',
        link: { label: 'Se eksempler og maler', to: '/eksempler' },
      },
      {
        title: 'Send, og ta vare på kopi',
        body:
          'Send skriftlig, og ta vare på en kopi av alt. Noter datoen du sendte. En tidslinje hjelper deg å holde oversikt hvis saken drar ut.',
        link: { label: 'Lag en tidslinje', to: '/tidslinje' },
      },
    ],
  },
  {
    id: 'anke-vedtak',
    title: 'Klage på et vedtak',
    badge: 'Forvaltning',
    intro:
      'Har du fått et avslag eller vedtak fra det offentlige (NAV, kommunen, en etat) du mener er feil? Slik klager du.',
    steps: [
      {
        title: 'Les vedtaket og finn klagefristen',
        body:
          'Vedtaket skal opplyse om klagefrist og klageinstans. Fristen er som regel tre uker fra du mottok vedtaket.',
        link: { label: 'Regn ut fristen', to: '/fristkalkulator' },
      },
      {
        title: 'Mangler begrunnelse? Be om den',
        body:
          'Forstår du ikke hvorfor vedtaket ble som det ble, kan du be om en begrunnelse. Da starter klagefristen normalt på nytt fra du får den.',
      },
      {
        title: 'Be om innsyn i saken',
        body:
          'Be om innsyn i sakens dokumenter. Ofte ligger nøkkelen til klagen i det etaten selv har skrevet.',
        link: { label: 'Lag innsynskrav', to: '/innsynskrav' },
      },
      {
        title: 'Skriv klagen',
        body:
          'Vis til vedtaket og datoen, forklar konkret hva du mener er feil (feil faktum, feil regelbruk), og be tydelig om at vedtaket omgjøres.',
        link: { label: 'Se eksempler og maler', to: '/eksempler' },
      },
      {
        title: 'Send innen fristen',
        body:
          'Klagen sendes til organet som fattet vedtaket. Opprettholder de vedtaket, sender de det videre til klageinstansen. Ta vare på kopi og send-dato.',
      },
    ],
  },
  {
    id: 'dokumenter-hendelse',
    title: 'Dokumentér en hendelse',
    badge: 'Bevis',
    intro:
      'Det du dokumenterer nå, er ofte viktigere enn selve klagen senere. Gjør det mens det er ferskt.',
    steps: [
      {
        title: 'Skriv ned mens du husker',
        body:
          'Noter hva som skjedde, når (dato og klokkeslett), hvor, hvem som var til stede, og hva som ble sagt. Skriv nøkternt - fakta, ikke følelser.',
      },
      {
        title: 'Sikre bevisene',
        body:
          'Ta vare på meldinger, e-poster, bilder, kvitteringer og navn på vitner. Ikke rediger originalene - ta kopier.',
      },
      {
        title: 'Legg det inn i en tidslinje',
        body:
          'En tidslinje gjør at du husker rekkefølgen, og gjør saken lett å forklare for en klageinstans eller advokat senere.',
        link: { label: 'Lag en tidslinje', to: '/tidslinje' },
      },
      {
        title: 'Last opp og oppbevar trygt',
        body:
          'Samle bevisene ett sted knyttet til saken din, så du har alt tilgjengelig når du trenger det.',
        link: { label: 'Last opp bevis', to: '/evidence-upload' },
      },
    ],
  },
  {
    id: 'varsling',
    title: 'Varsling',
    badge: 'Varsling',
    intro:
      'Vil du varsle om kritikkverdige forhold? Dette kan være alvorlig og komplekst. Tenk gjennom rekkefølge og risiko.',
    steps: [
      {
        title: 'Avklar hva du varsler om',
        body:
          'Gjelder det arbeidsplassen din, en offentlig etat, eller mistanke om noe straffbart? Det avgjør hvilken kanal som er riktig.',
      },
      {
        title: 'Finn rett kanal',
        body:
          'I arbeidsforhold har arbeidsgiver ofte en varslingsrutine, og du har et vern etter arbeidsmiljøloven. Ellers kan rett instans være et tilsyn, Spesialenheten eller et ombud.',
        link: { label: 'Se hvor du varsler/klager', to: '/hvor-klager-du' },
      },
      {
        title: 'Dokumentér grunnlaget',
        body:
          'Samle det konkrete du bygger varselet på. Et varsel som kan dokumenteres, står mye sterkere.',
        link: { label: 'Dokumentér hendelsen', to: '/veivisere/dokumenter-hendelse' },
      },
      {
        title: 'Vurder vern og risiko',
        body:
          'Varsling kan få konsekvenser. Tenk gjennom hvor mye du deler, av hvem, og om du bør ha noen i ryggen før du sender.',
      },
      {
        title: 'Vurder rådgivning',
        body:
          'I alvorlige eller uoversiktlige saker bør du snakke med en fagperson, tillitsvalgt eller advokat før du varsler.',
      },
    ],
  },
];

export function getVeiviser(id: string | undefined): Veiviser | undefined {
  return veivisere.find((v) => v.id === id);
}
