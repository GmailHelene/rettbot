/**
 * Eskaleringsveier – hvor man klager/varsler i Norge, etter område.
 *
 * Dette er faktisk, offentlig tilgjengelig informasjon om norske klage- og
 * tilsynsorganer (ikke juridisk rådgivning). Lenkene går til de offisielle
 * nettsidene. Verifiser alltid frist og fremgangsmåte hos instansen selv.
 */

export interface EscalationBody {
  name: string;
  handles: string;
  when: string;
  url: string;
}

export interface EscalationArea {
  id: string;
  area: string;
  intro: string;
  bodies: EscalationBody[];
}

export const escalationAreas: EscalationArea[] = [
  {
    id: 'politi',
    area: 'Politiet',
    intro: 'Klager på politiet går ulike veier avhengig av om det gjelder mulig straffbart forhold eller kritikkverdig oppførsel/saksbehandling.',
    bodies: [
      {
        name: 'Spesialenheten for politisaker',
        handles: 'Etterforsker mulige straffbare handlinger begått av ansatte i politiet og påtalemyndigheten.',
        when: 'Ved mistanke om at en polititjenesteperson har gjort noe straffbart (f.eks. ulovlig maktbruk).',
        url: 'https://www.spesialenheten.no',
      },
      {
        name: 'Politiet – klage til politimesteren',
        handles: 'Klager på kritikkverdig oppførsel eller dårlig behandling som ikke er straffbart.',
        when: 'Ved dårlig oppførsel, manglende hjelp eller kritikkverdig opptreden. Kan bringes videre til Politidirektoratet.',
        url: 'https://www.politiet.no/rad/klage-pa-politiet/',
      },
      {
        name: 'Statsadvokaten / Riksadvokaten',
        handles: 'Klage på henleggelse av en anmeldelse (påtaleavgjørelse).',
        when: 'Hvis anmeldelsen din er henlagt og du vil klage på avgjørelsen.',
        url: 'https://www.riksadvokaten.no',
      },
    ],
  },
  {
    id: 'forvaltning',
    area: 'Offentlig forvaltning og vedtak',
    intro: 'Er du uenig i et vedtak fra en offentlig instans, kan du som regel klage. Klagen sendes vanligvis til den som fattet vedtaket, som sender den videre til klageinstansen.',
    bodies: [
      {
        name: 'Statsforvalteren',
        handles: 'Klageinstans for mange kommunale vedtak og statlige tjenester i fylket.',
        when: 'Ved klage på vedtak fra kommunen eller enkelte statlige tjenester.',
        url: 'https://www.statsforvalteren.no',
      },
      {
        name: 'Sivilombudet',
        handles: 'Undersøker urett og feil begått av offentlig forvaltning (etter at ordinær klagevei er brukt).',
        when: 'Når du mener forvaltningen har behandlet deg urettferdig og du har brukt vanlig klagevei.',
        url: 'https://www.sivilombudet.no',
      },
    ],
  },
  {
    id: 'personvern',
    area: 'Personvern',
    intro: 'Handler saken om hvordan noen behandler personopplysningene dine.',
    bodies: [
      {
        name: 'Datatilsynet',
        handles: 'Tilsyn og klager om personvern og behandling av personopplysninger (GDPR).',
        when: 'Ved brudd på personvern – f.eks. innsyn, sletting, ulovlig deling.',
        url: 'https://www.datatilsynet.no',
      },
    ],
  },
  {
    id: 'diskriminering',
    area: 'Diskriminering og trakassering',
    intro: 'Ved forskjellsbehandling eller trakassering på grunn av f.eks. kjønn, etnisitet, funksjonsevne, religion eller seksuell orientering.',
    bodies: [
      {
        name: 'Diskrimineringsnemnda',
        handles: 'Behandler klagesaker om diskriminering og trakassering.',
        when: 'Når du vil ha en sak om diskriminering avgjort.',
        url: 'https://www.diskrimineringsnemnda.no',
      },
      {
        name: 'Likestillings- og diskrimineringsombodet (LDO)',
        handles: 'Gratis veiledning om diskrimineringsvern.',
        when: 'Når du trenger råd før du eventuelt klager.',
        url: 'https://www.ldo.no',
      },
    ],
  },
  {
    id: 'helse',
    area: 'Helse- og omsorgstjenester',
    intro: 'Gjelder saken behandling eller tjenester i helsevesenet.',
    bodies: [
      {
        name: 'Pasient- og brukerombudet',
        handles: 'Gratis hjelp og veiledning i saker om helse- og omsorgstjenester.',
        when: 'Ved klage på behandling, eller for å forstå rettighetene dine som pasient.',
        url: 'https://www.pasientogbrukerombudet.no',
      },
      {
        name: 'Statsforvalteren (helsetilsyn)',
        handles: 'Tilsyn med helse- og omsorgstjenester.',
        when: 'Ved mistanke om svikt eller pliktbrudd i helsetjenesten.',
        url: 'https://www.statsforvalteren.no',
      },
    ],
  },
  {
    id: 'nav',
    area: 'NAV og trygd',
    intro: 'Er du uenig i en avgjørelse fra NAV, kan du klage.',
    bodies: [
      {
        name: 'NAV – klage og anke',
        handles: 'Klage på NAV-vedtak, som eventuelt går videre til NAV Klageinstans og Trygderetten.',
        when: 'Når du er uenig i et vedtak om ytelser eller tjenester fra NAV.',
        url: 'https://www.nav.no/klage',
      },
    ],
  },
  {
    id: 'menneskerettigheter',
    area: 'Menneskerettigheter',
    intro: 'Når saken handler om grunnleggende rettigheter, og norske klageveier er brukt opp.',
    bodies: [
      {
        name: 'Norges institusjon for menneskerettigheter (NIM)',
        handles: 'Fremmer og beskytter menneskerettighetene i Norge (gir ikke individuell juridisk bistand, men veiledning og informasjon).',
        when: 'For informasjon om menneskerettighetene dine.',
        url: 'https://www.nhri.no',
      },
      {
        name: 'Den europeiske menneskerettsdomstolen (EMD)',
        handles: 'Behandler klager om brudd på Den europeiske menneskerettskonvensjonen (EMK).',
        when: 'Først etter at alle nasjonale klage- og rettsmidler er brukt opp.',
        url: 'https://www.echr.coe.int',
      },
    ],
  },
  {
    id: 'rettshjelp',
    area: 'Gratis eller rimelig rettshjelp',
    intro: 'Trenger du å snakke med en ekte jurist eller advokat.',
    bodies: [
      {
        name: 'Fri rettshjelp',
        handles: 'Ordning for helt eller delvis gratis advokatbistand i visse saker, avhengig av sakstype og inntekt.',
        when: 'Ved saker som kan gi rett til fri rettshjelp (f.eks. familie, husleie, trygd, utlending).',
        url: 'https://www.frirettshjelp.no',
      },
      {
        name: 'Jussformidlingen / JURK / Juss-Buss / Jusshjelpa',
        handles: 'Studentdrevne rettshjelptiltak som gir gratis juridisk bistand.',
        when: 'Når du trenger konkret juridisk hjelp, ofte uavhengig av inntekt.',
        url: 'https://www.jussformidlingen.no',
      },
    ],
  },
];
