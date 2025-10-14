/**
 * CORRUPTION & SYSTEMIC ABUSE MODULE
 * 
 * Handles cases involving systematic corruption, power abuse, and institutional failure.
 * Designed for situations where normal legal channels are compromised.
 * 
 * Use cases:
 * - Police refusing to investigate certain individuals
 * - Cases systematically dismissed without proper investigation
 * - Evidence mysteriously "disappearing"
 * - Pattern of corruption across multiple cases
 * - Threats from powerful individuals always resulting in dismissal
 */

import { encryptObject, calculateHash } from '@/core/crypto/dataEncryption';
import { storeCase, storeEvidence } from '@/core/crypto/secureStorage';

export interface CorruptionCase {
  id: string;
  type: 'systematic_dismissal' | 'evidence_suppression' | 'corrupt_officials' | 'power_abuse';
  targetPerson?: string;        // Navn på person som alltid slipper unna
  officialInvolved: string[];   // Korrupte tjenestemenn involvert
  cases: RelatedCase[];         // Alle relaterte saker som ble henlagt
  pattern: CorruptionPattern;   // Mønster av korrupsjon
  evidence: Evidence[];         // Bevis på korrupsjon
  escalationPath: EscalationStep[]; // Hvordan eskalere saken
  internationalOptions: InternationalRoute[]; // Internasjonale muligheter
}

export interface RelatedCase {
  caseNumber?: string;
  date: number;
  description: string;
  dismissalReason: string;
  officialWhoHandled: string;
  evidenceSubmitted: string[];
  evidenceMissing: string[];    // Bevis som "forsvant"
  suspiciousCircumstances: string[];
}

export interface CorruptionPattern {
  type: 'same_official' | 'same_target' | 'same_excuse' | 'systematic';
  frequency: number;            // Antall ganger mønsteret gjentar seg
  timespan: {
    start: number;
    end: number;
  };
  commonFactors: string[];      // Fellestrekk på tvers av saker
  statisticalAnomaly: boolean;  // Er dette statistisk unormalt?
}

export interface Evidence {
  id: string;
  type: 'document' | 'recording' | 'witness' | 'pattern_analysis';
  description: string;
  hash: string;                 // SHA-512 hash for integrity
  timestamp: number;
  chainOfCustody: ChainEntry[];
  backupLocations: string[];    // Hvor beviset er sikkerhetskopiert
}

export interface ChainEntry {
  action: 'created' | 'copied' | 'verified' | 'shared';
  timestamp: number;
  location: string;
  hash: string;
}

export interface EscalationStep {
  level: number;
  authority: string;            // Hvilken myndighet
  description: string;
  requiredEvidence: string[];
  expectedTimeline: string;
  successRate: number;          // Estimert suksessrate basert på statistikk
  nextStepIfFails: number;      // Neste nivå hvis dette feiler
}

export interface InternationalRoute {
  organization: string;         // F.eks. EMD, FN, Transparency International
  applicability: string;        // Når dette er aktuelt
  requirements: string[];
  timeline: string;
  howToApply: string;
  precedents: string[];         // Tidligere saker som lyktes
}

/**
 * Analyser om en sak viser tegn på systematisk korrupsjon
 */
export async function analyzeCorruptionPattern(
  cases: RelatedCase[]
): Promise<CorruptionPattern | null> {
  if (cases.length < 2) return null;

  // Finn fellestrekk
  const commonOfficials = findCommonOfficials(cases);
  const commonExcuses = findCommonDismissalReasons(cases);
  const sameTarget = cases.every(c => c.description.includes('samme person'));

  // Beregn frekvens
  const timespan = {
    start: Math.min(...cases.map(c => c.date)),
    end: Math.max(...cases.map(c => c.date))
  };

  const frequency = cases.length;
  const daysSpan = (timespan.end - timespan.start) / (1000 * 60 * 60 * 24);
  const casesPerYear = (frequency / daysSpan) * 365;

  // Statistisk anomali hvis >3 saker per år med samme mønster
  const statisticalAnomaly = casesPerYear > 3;

  let type: CorruptionPattern['type'] = 'systematic';
  if (commonOfficials.length > 0) type = 'same_official';
  if (sameTarget) type = 'same_target';
  if (commonExcuses.length > 0) type = 'same_excuse';

  return {
    type,
    frequency,
    timespan,
    commonFactors: [
      ...commonOfficials.map(o => `Saksbehandler: ${o}`),
      ...commonExcuses.map(e => `Begrunnelse: ${e}`),
      ...(sameTarget ? ['Samme person slipper alltid unna'] : [])
    ],
    statisticalAnomaly
  };
}

function findCommonOfficials(cases: RelatedCase[]): string[] {
  const officialCounts = new Map<string, number>();
  
  cases.forEach(c => {
    const count = officialCounts.get(c.officialWhoHandled) || 0;
    officialCounts.set(c.officialWhoHandled, count + 1);
  });

  return Array.from(officialCounts.entries())
    .filter(([_, count]) => count >= 2)
    .map(([official]) => official);
}

function findCommonDismissalReasons(cases: RelatedCase[]): string[] {
  const reasonCounts = new Map<string, number>();
  
  cases.forEach(c => {
    const count = reasonCounts.get(c.dismissalReason) || 0;
    reasonCounts.set(c.dismissalReason, count + 1);
  });

  return Array.from(reasonCounts.entries())
    .filter(([_, count]) => count >= 2)
    .map(([reason]) => reason);
}

/**
 * Genererer eskaleringsplan når normale kanaler er kompromittert
 */
export function generateEscalationPath(
  corruptionCase: CorruptionCase
): EscalationStep[] {
  const steps: EscalationStep[] = [];

  // Nivå 1: Lokal politi / påtalemyndighet (allerede prøvd, feilet)
  steps.push({
    level: 1,
    authority: 'Lokalt politidistrikt',
    description: 'Innledende anmeldelse (allerede forsøkt, henlagt)',
    requiredEvidence: ['Anmeldelse', 'Grunnleggende bevis'],
    expectedTimeline: '2-4 uker',
    successRate: 0.05, // 5% hvis systemet er korrupt
    nextStepIfFails: 2
  });

  // Nivå 2: Spesialenhet for politisaker (SEFO)
  steps.push({
    level: 2,
    authority: 'Spesialenheten for politisaker (SEFO)',
    description: 'Klage på politiets saksbehandling og mulig tjenestefeil',
    requiredEvidence: [
      'Dokumentasjon på alle henlagte saker',
      'Bevis på mønstre',
      'Tidslinje over hendelser',
      'Navngitte tjenestemenn'
    ],
    expectedTimeline: '3-6 måneder',
    successRate: 0.30, // 30% hvis god dokumentasjon
    nextStepIfFails: 3
  });

  // Nivå 3: Riksadvokaten
  steps.push({
    level: 3,
    authority: 'Riksadvokaten',
    description: 'Begjæring om gjenopptagelse av henlagte saker',
    requiredEvidence: [
      'Alle dokumenter fra nivå 2',
      'Statistisk analyse av mønstre',
      'Nye bevis som ikke ble vurdert',
      'Juridisk analyse av feil i saksbehandling'
    ],
    expectedTimeline: '6-12 måneder',
    successRate: 0.40,
    nextStepIfFails: 4
  });

  // Nivå 4: Sivilombudsmannen
  steps.push({
    level: 4,
    authority: 'Sivilombudsmannen',
    description: 'Klage på offentlig forvaltning og mulig maktmisbruk',
    requiredEvidence: [
      'Alle tidligere klager og svar',
      'Dokumentasjon på systemsvikt',
      'Bevis på brudd på god forvaltningsskikk'
    ],
    expectedTimeline: '6-12 måneder',
    successRate: 0.35,
    nextStepIfFails: 5
  });

  // Nivå 5: Stortingets kontroll- og konstitusjonskomité
  steps.push({
    level: 5,
    authority: 'Stortingets kontroll- og konstitusjonskomité',
    description: 'Politisk behandling av systemsvikt',
    requiredEvidence: [
      'Komplett dokumentasjon fra alle nivåer',
      'Bevis på systematiske problemer',
      'Mulig mediestøtte',
      'Offentlig interesse'
    ],
    expectedTimeline: '12-24 måneder',
    successRate: 0.25,
    nextStepIfFails: 6
  });

  // Nivå 6: Den Europeiske Menneskerettsdomstol (EMD)
  steps.push({
    level: 6,
    authority: 'Den Europeiske Menneskerettsdomstol (EMD)',
    description: 'Klage på brudd på EMK (Artikkel 6: rettferdig rettergang, Artikkel 13: effektiv prøvingsrett)',
    requiredEvidence: [
      'Bevis på uttømte nasjonale rettsmidler',
      'Dokumentasjon på EMK-brudd',
      'Alle tidligere avgjørelser',
      'Juridisk analyse av menneskerettighetsbrudd'
    ],
    expectedTimeline: '3-5 år',
    successRate: 0.15, // Vanskelig, men mulig
    nextStepIfFails: 7
  });

  // Nivå 7: Internasjonal oppmerksomhet
  steps.push({
    level: 7,
    authority: 'Internasjonal oppmerksomhet (FN, NGOer, media)',
    description: 'Internasjonal press og dokumentasjon av systemsvikt',
    requiredEvidence: [
      'Komplett case-dokumentasjon',
      'Uavhengig verifisering',
      'Internasjonal juridisk støtte',
      'Mediedokumentasjon'
    ],
    expectedTimeline: 'Variabel',
    successRate: 0.20,
    nextStepIfFails: 8
  });

  // Nivå 8: Parallell sivilrettslig sak (erstatning)
  steps.push({
    level: 8,
    authority: 'Sivilrettslig søksmål',
    description: 'Erstatningssøksmål mot stat/kommune for maktmisbruk',
    requiredEvidence: [
      'Dokumentasjon på skade/tap',
      'Bevis på årsakssammenheng',
      'Juridisk grunnlag for erstatning'
    ],
    expectedTimeline: '2-5 år',
    successRate: 0.30,
    nextStepIfFails: -1 // Siste utvei
  });

  return steps;
}

/**
 * Genererer internasjonale alternativer
 */
export function generateInternationalRoutes(): InternationalRoute[] {
  return [
    {
      organization: 'Den Europeiske Menneskerettsdomstol (EMD)',
      applicability: 'Når norske rettsmidler er uttømt og det foreligger brudd på EMK',
      requirements: [
        'Alle nasjonale rettsmidler må være uttømt',
        'Klage må fremmes innen 4 måneder etter endelig avgjørelse',
        'Må være offer for påstått krenkelse',
        'Saken må gjelde EMK-rettigheter'
      ],
      timeline: '3-5 år fra klage til dom',
      howToApply: 'https://www.echr.coe.int/documents/applicants_guide_eng.pdf',
      precedents: [
        'Sagen v. Norway (dom om rettferdig rettergang)',
        'Bøe v. Norway (politiets undersøkelsesplikt)'
      ]
    },
    {
      organization: 'FNs menneskerettskomité',
      applicability: 'Når EMK ikke dekker rettighetsbrudd, eller parallelt med EMD',
      requirements: [
        'Uttømte nasjonale rettsmidler',
        'Påstått brudd på SP (Sivile og Politiske Rettigheter)',
        'Norge har akseptert individuell klagerett'
      ],
      timeline: '2-4 år',
      howToApply: 'https://www.ohchr.org/en/treaty-bodies/ccpr',
      precedents: [
        'Flere norske saker om rettssikkerhet',
        'Saker om diskriminering i straffesystem'
      ]
    },
    {
      organization: 'Transparency International Norway',
      applicability: 'Dokumentasjon og offentliggjøring av korrupsjon',
      requirements: [
        'Solid dokumentasjon',
        'Offentlig interesse',
        'Villig til å gå offentlig (eller anonymt)'
      ],
      timeline: 'Variabel - avhenger av sak',
      howToApply: 'https://transparency.no/',
      precedents: [
        'Flere avsløringer av norsk korrupsjon',
        'NAV-skandalen (systemsvikt)'
      ]
    },
    {
      organization: 'Norsk Presseforbund / Investigative journalister',
      applicability: 'Når saken har offentlig interesse',
      requirements: [
        'Dokumenterbar historie',
        'Verifiserbare fakta',
        'Offentlig interesse',
        'Beskyttelse av kilder (kan være anonym)'
      ],
      timeline: 'Variabel',
      howToApply: 'Kontakt investigative journalister (VG, NRK Brennpunkt, Dagbladet)',
      precedents: [
        'Politiskandaler avslørt av media',
        'Systemsvikt i offentlig sektor'
      ]
    },
    {
      organization: 'Amnesty International',
      applicability: 'Alvorlige menneskerettighetsbrudd',
      requirements: [
        'Dokumenterte menneskerettighetsbrudd',
        'Mangel på effektive rettsmidler',
        'Villig til internasjonalt samarbeid'
      ],
      timeline: 'Variabel',
      howToApply: 'https://www.amnesty.no/',
      precedents: [
        'Flere saker om politisk forfølgelse',
        'Diskriminering i rettssystem'
      ]
    },
    {
      organization: 'Advokatforeningen - Pro bono program',
      applicability: 'Når man mangler råd til advokat',
      requirements: [
        'Lav inntekt',
        'Viktig prinsipiell sak',
        'God juridisk sak'
      ],
      timeline: 'Avhenger av tilgjengelighet',
      howToApply: 'Kontakt Advokatforeningen',
      precedents: [
        'Flere prinsipielle saker tatt pro bono',
        'Saker om grunnleggende rettigheter'
      ]
    }
  ];
}

/**
 * Lager kryptografisk sikret bevismappe for korrupsjonssak
 */
export async function createCorruptionEvidencePackage(
  corruptionCase: CorruptionCase,
  masterKey: Uint8Array
): Promise<string> {
  // Generer komplett bevismappe
  const evidencePackage = {
    caseId: corruptionCase.id,
    created: Date.now(),
    type: corruptionCase.type,
    
    // Oversikt
    summary: {
      targetPerson: corruptionCase.targetPerson,
      officialsInvolved: corruptionCase.officialInvolved,
      numberOfCases: corruptionCase.cases.length,
      timespan: corruptionCase.pattern.timespan,
      statisticalAnomaly: corruptionCase.pattern.statisticalAnomaly
    },
    
    // Alle saker
    cases: corruptionCase.cases.map(c => ({
      ...c,
      hash: calculateHash(new TextEncoder().encode(JSON.stringify(c)))
    })),
    
    // Mønsteranalyse
    pattern: corruptionCase.pattern,
    
    // Alt bevis
    evidence: corruptionCase.evidence,
    
    // Juridisk analyse
    legalAnalysis: {
      potentialViolations: [
        'Straffeloven § 171 (Grov uforstand i tjenesten)',
        'Straffeloven § 276 (Korrupsjon)',
        'EMK Artikkel 6 (Rett til rettferdig rettergang)',
        'EMK Artikkel 13 (Rett til effektivt rettsmiddel)',
        'Forvaltningsloven §§ (God forvaltningsskikk)'
      ],
      recommendedActions: corruptionCase.escalationPath
    },
    
    // Integritet
    packageHash: '' // Fylles ut etter hashing
  };

  // Beregn hash av hele pakken
  const packageJson = JSON.stringify(evidencePackage);
  const packageHash = await calculateHash(new TextEncoder().encode(packageJson));
  evidencePackage.packageHash = packageHash;

  // Krypter
  const encrypted = await encryptObject(evidencePackage, masterKey);

  return JSON.stringify({
    encrypted,
    metadata: {
      created: evidencePackage.created,
      caseId: evidencePackage.caseId,
      hash: packageHash,
      warning: 'ENCRYPTED CORRUPTION EVIDENCE - HANDLE WITH CARE'
    }
  });
}

/**
 * AI-assistert analyse av korrupsjonsmønstre
 */
export async function analyzeCorruptionWithAI(
  cases: RelatedCase[]
): Promise<{
  pattern: CorruptionPattern | null;
  recommendations: string[];
  evidence_needed: string[];
  legal_basis: string[];
}> {
  const pattern = await analyzeCorruptionPattern(cases);

  const recommendations: string[] = [];
  const evidence_needed: string[] = [];
  const legal_basis: string[] = [];

  if (!pattern) {
    return {
      pattern: null,
      recommendations: ['Trenger flere saker for mønsteranalyse (minimum 2)'],
      evidence_needed: ['Samle dokumentasjon på alle relevante hendelser'],
      legal_basis: []
    };
  }

  // Anbefalinger basert på mønster
  if (pattern.type === 'same_official') {
    recommendations.push(
      'HØYRISIKO: Samme tjenestemann behandler alle sakene - mulig interessekonflikt eller korrupsjon',
      'Klage til Spesialenheten (SEFO) med fokus på denne tjenestemannen',
      'Be om habilitetsvurdering i fremtidige saker'
    );
    evidence_needed.push(
      'Dokumentasjon på alle saker behandlet av denne tjenestemannen',
      'Statistikk over tjenestemannens henleggelsesrate vs. gjennomsnitt',
      'Mulige forbindelser mellom tjenestemann og målperson'
    );
    legal_basis.push(
      'Forvaltningsloven § 6 (Inhabilitet)',
      'Straffeloven § 276 (Korrupsjon)',
      'Straffeloven § 171 (Grov uforstand i tjenesten)'
    );
  }

  if (pattern.type === 'same_target') {
    recommendations.push(
      'ALVORLIG: Samme person slipper systematisk unna - mulig beskyttelse/korrupsjon',
      'Eskalere til Riksadvokaten med fullstendig dokumentasjon',
      'Vurder offentliggjøring gjennom media hvis myndighetene ikke handler',
      'Kontakt Transparency International Norway'
    );
    evidence_needed.push(
      'Dokumentasjon på ALLE saker mot målpersonen',
      'Bevis som ble ignorert i hver sak',
      'Mulige forbindelser mellom målperson og tjenestemenn',
      'Sammenlignbare saker hvor andre ble straffet for mindre'
    );
    legal_basis.push(
      'EMK Artikkel 6 (Rett til rettferdig rettergang)',
      'EMK Artikkel 13 (Rett til effektivt rettsmiddel)',
      'Likhetsprinsippet (alle skal behandles likt for loven)'
    );
  }

  if (pattern.statisticalAnomaly) {
    recommendations.push(
      'STATISTISK BEVIST: Mønseret er statistisk unormalt - sterkt indikasjon på systemsvikt',
      'Dette styrker saken betydelig ved eskalering',
      'Bruk statistikken som bevis i alle klager'
    );
    evidence_needed.push(
      'Sammenlignbare statistikker for andre saksbehandlere/distrikter',
      'Ekspertuttalelse fra statistiker hvis mulig'
    );
  }

  return {
    pattern,
    recommendations,
    evidence_needed,
    legal_basis
  };
}

/**
 * Genererer automatisk klage til SEFO
 */
export function generateSEFOComplaint(corruptionCase: CorruptionCase): string {
  return `
KLAGE TIL SPESIALENHETEN FOR POLITISAKER (SEFO)

Dato: ${new Date().toLocaleDateString('no-NO')}

ANMELDELSE AV MULIG TJENESTEFEIL OG KORRUPSJON

1. SAMMENDRAG
   Det foreligger systematisk henleggelse av ${corruptionCase.cases.length} saker over en periode på 
   ${Math.floor((corruptionCase.pattern.timespan.end - corruptionCase.pattern.timespan.start) / (1000 * 60 * 60 * 24))} dager.
   
   Fellestrekk:
   ${corruptionCase.pattern.commonFactors.map(f => `   - ${f}`).join('\n')}

2. INVOLVERT PERSONELL
   ${corruptionCase.officialInvolved.map(o => `   - ${o}`).join('\n')}

3. DETALJERT SAKSOVERSIKT
${corruptionCase.cases.map((c, i) => `
   Sak ${i + 1}:
   - Dato: ${new Date(c.date).toLocaleDateString('no-NO')}
   - Saksnummer: ${c.caseNumber || 'Ikke tildelt'}
   - Beskrivelse: ${c.description}
   - Behandlet av: ${c.officialWhoHandled}
   - Henlagt med begrunnelse: "${c.dismissalReason}"
   - Bevis innlevert: ${c.evidenceSubmitted.join(', ')}
   - Bevis som "forsvant": ${c.evidenceMissing.join(', ') || 'Ingen'}
   - Mistenkelige omstendigheter: ${c.suspiciousCircumstances.join(', ') || 'Ingen'}
`).join('\n')}

4. MØNSTERANALYSE
   Type mønster: ${corruptionCase.pattern.type}
   Statistisk anomali: ${corruptionCase.pattern.statisticalAnomaly ? 'JA - Statistisk signifikant avvik fra normalen' : 'NEI'}
   Frekvens: ${corruptionCase.pattern.frequency} saker

5. RETTSLIG GRUNNLAG FOR KLAGE
   - Straffeloven § 171: Grov uforstand i tjenesten
   - Straffeloven § 276: Korrupsjon
   - Politiloven § 7: Politiets oppgaver og plikter
   - Forvaltningsloven: God forvaltningsskikk
   - EMK Artikkel 6: Rett til rettferdig rettergang

6. KRAV
   - Etterforskning av navngitte tjenestemenn
   - Gjenopptagelse av alle henlagte saker
   - Habilitetsvurdering av involvert personell
   - Eventuell straffeforfølgelse ved bevist korrupsjon

7. VEDLEGG
   ${corruptionCase.evidence.map(e => `   - ${e.description} (Hash: ${e.hash.substring(0, 16)}...)`).join('\n')}

Med vennlig hilsen,
[Navn]
[Kontaktinformasjon]
`;
}
