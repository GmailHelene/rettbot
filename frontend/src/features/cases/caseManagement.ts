/**
 * PROFESSIONAL CASE MANAGEMENT SYSTEM
 * 
 * Profesjonell, ryddig og strukturert saksføring og saksbehandling
 * 
 * Funksjoner:
 * 1. Automatisk organisering i mapper/saker
 * 2. Smart kategorisering av dokumenter og bevis
 * 3. Tidslinje-visning av saksutviklingen
 * 4. Automatisk generering av saksdokumenter
 * 5. Profesjonell filhåndtering med tags og søk
 * 6. Juridisk checkliste og progress tracking
 * 7. Deadline tracking og varslinger
 */

export interface Case {
  id: string;
  title: string;
  caseNumber?: string;              // Saksnummer fra domstol/politi
  type: CaseType;
  status: CaseStatus;
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  // Parter
  client: Person;
  opponent?: Person;
  lawyer?: Person;
  otherParties: Person[];
  
  // Organisering
  folders: Folder[];
  timeline: TimelineEvent[];
  deadlines: Deadline[];
  checklist: ChecklistItem[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  tags: string[];
  relatedCases: string[];          // IDs til relaterte saker
  
  // Automatisk generert
  aiSummary: string;
  riskAssessment: RiskAssessment;
  suggestedActions: SuggestedAction[];
}

export type CaseType = 
  | 'criminal'                    // Straffesak
  | 'civil'                       // Sivil sak
  | 'administrative'              // Forvaltningssak
  | 'corruption'                  // Korrupsjonssak
  | 'human_rights'                // Menneskerettighetssak
  | 'labor'                       // Arbeidstvister
  | 'family'                      // Familierett
  | 'other';

export type CaseStatus =
  | 'investigation'               // Under etterforskning
  | 'police_report'               // Anmeldelse innlevert
  | 'prosecution'                 // Under påtale
  | 'court_pending'               // Venter på rettssak
  | 'trial'                       // Under rettssak
  | 'appeal'                      // Under anke
  | 'settled'                     // Avgjort
  | 'closed';                     // Lukket

export interface Person {
  name: string;
  role: 'client' | 'opponent' | 'lawyer' | 'witness' | 'other';
  contact?: ContactInfo;
  notes?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
}

export interface Folder {
  id: string;
  name: string;
  icon: string;
  type: FolderType;
  parent?: string;                // Parent folder ID
  items: FolderItem[];
  color?: string;
  sortOrder: number;
}

export type FolderType =
  | 'evidence'                    // Bevis
  | 'documents'                   // Dokumenter
  | 'correspondence'              // Korrespondanse
  | 'legal_research'              // Juridisk research
  | 'court_filings'               // Innleveringer til retten
  | 'expert_opinions'             // Sakkyndige uttalelser
  | 'witness_statements'          // Vitneforklaringer
  | 'photos'                      // Bilder
  | 'audio'                       // Lydopptak
  | 'video'                       // Videoer
  | 'other';

export interface FolderItem {
  id: string;
  name: string;
  type: 'file' | 'evidence' | 'document' | 'note';
  fileType?: string;              // MIME type
  size?: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  category: string;
  
  // Encryption & security
  encrypted: boolean;
  hash?: string;
  blockchainProof?: string;
  
  // AI metadata
  aiDescription?: string;
  aiTags?: string[];
  legalRelevance?: number;        // 0-100
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: 'evidence' | 'document' | 'meeting' | 'deadline' | 'court' | 'other';
  title: string;
  description: string;
  relatedItems: string[];         // IDs til relaterte dokumenter/bevis
  importance: 'critical' | 'high' | 'medium' | 'low';
  icon: string;
  color: string;
}

export interface Deadline {
  id: string;
  title: string;
  date: string;
  type: 'court' | 'filing' | 'response' | 'payment' | 'other';
  status: 'upcoming' | 'due_soon' | 'overdue' | 'completed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description?: string;
  notificationDays: number[];     // Varsle X dager før
  completed: boolean;
}

export interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  order: number;
  dependencies?: string[];        // IDs til andre checklist items som må gjøres først
  aiGenerated: boolean;
}

export interface RiskAssessment {
  overall: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  aiConfidence: number;           // 0-100
  recommendations: string[];
}

export interface RiskFactor {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation: string;
}

export interface SuggestedAction {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  action: string;
  reason: string;
  deadline?: string;
  completed: boolean;
}

/**
 * AUTOMATIC CASE ORGANIZATION
 * 
 * Organiserer automatisk saker basert på type, bevis, dokumenter, etc.
 */
export class CaseOrganizer {
  
  /**
   * Opprett standard mappestruktur for ny sak
   */
  createStandardFolders(caseType: CaseType): Folder[] {
    const baseFolders: Folder[] = [
      {
        id: '1',
        name: 'Bevis',
        icon: '🔍',
        type: 'evidence',
        items: [],
        color: '#ff6b35',
        sortOrder: 1
      },
      {
        id: '2',
        name: 'Dokumenter',
        icon: '📄',
        type: 'documents',
        items: [],
        color: '#4ecdc4',
        sortOrder: 2
      },
      {
        id: '3',
        name: 'Korrespondanse',
        icon: '✉️',
        type: 'correspondence',
        items: [],
        color: '#95e1d3',
        sortOrder: 3
      },
      {
        id: '4',
        name: 'Juridisk Research',
        icon: '⚖️',
        type: 'legal_research',
        items: [],
        color: '#f38181',
        sortOrder: 4
      }
    ];

    // Legg til spesifikke mapper basert på sakstype
    if (caseType === 'criminal' || caseType === 'corruption') {
      baseFolders.push({
        id: '5',
        name: 'Politianmeldelse',
        icon: '🚔',
        type: 'court_filings',
        items: [],
        color: '#aa96da',
        sortOrder: 5
      });
    }

    if (caseType === 'corruption') {
      baseFolders.push({
        id: '6',
        name: 'SEFO/Klage',
        icon: '⚠️',
        type: 'court_filings',
        items: [],
        color: '#fcbad3',
        sortOrder: 6
      });
    }

    baseFolders.push({
      id: '7',
      name: 'Vitner',
      icon: '👥',
      type: 'witness_statements',
      items: [],
      color: '#ffffd2',
      sortOrder: 7
    });

    return baseFolders;
  }

  /**
   * Organiser fil automatisk i riktig mappe
   */
  autoOrganizeFile(
    file: FolderItem,
    folders: Folder[]
  ): { folderId: string; reason: string } {
    const fileName = file.name.toLowerCase();
    const fileType = file.fileType?.toLowerCase() || '';
    const tags = file.tags.map(t => t.toLowerCase());

    // Bevis (bilder, video, audio)
    if (
      fileType.startsWith('image/') ||
      fileType.startsWith('video/') ||
      fileType.startsWith('audio/') ||
      tags.some(t => t.includes('bevis') || t.includes('evidence'))
    ) {
      const evidenceFolder = folders.find(f => f.type === 'evidence');
      if (evidenceFolder) {
        return {
          folderId: evidenceFolder.id,
          reason: 'Automatisk kategorisert som bevis basert på filtype'
        };
      }
    }

    // Dokumenter (PDF, Word, etc.)
    if (
      fileType === 'application/pdf' ||
      fileType.includes('word') ||
      fileType.includes('document') ||
      fileName.includes('dokument')
    ) {
      const docsFolder = folders.find(f => f.type === 'documents');
      if (docsFolder) {
        return {
          folderId: docsFolder.id,
          reason: 'Automatisk kategorisert som dokument'
        };
      }
    }

    // Korrespondanse (email-relatert)
    if (
      fileName.includes('email') ||
      fileName.includes('epost') ||
      fileName.includes('brev') ||
      tags.some(t => t.includes('korrespondanse') || t.includes('email'))
    ) {
      const corrFolder = folders.find(f => f.type === 'correspondence');
      if (corrFolder) {
        return {
          folderId: corrFolder.id,
          reason: 'Automatisk kategorisert som korrespondanse'
        };
      }
    }

    // Juridisk research
    if (
      fileName.includes('lov') ||
      fileName.includes('dom') ||
      fileName.includes('juridisk') ||
      tags.some(t => t.includes('research') || t.includes('lov'))
    ) {
      const researchFolder = folders.find(f => f.type === 'legal_research');
      if (researchFolder) {
        return {
          folderId: researchFolder.id,
          reason: 'Automatisk kategorisert som juridisk research'
        };
      }
    }

    // Default: Dokumenter
    const defaultFolder = folders.find(f => f.type === 'documents');
    return {
      folderId: defaultFolder?.id || folders[0].id,
      reason: 'Plassert i standard dokumentmappe'
    };
  }

  /**
   * Generer standard sjekkliste for sakstype
   */
  generateChecklist(caseType: CaseType): ChecklistItem[] {
    const baseChecklist: ChecklistItem[] = [
      {
        id: '1',
        category: 'Forberedelse',
        title: 'Samle alle relevante bevis',
        description: 'Last opp alle bilder, video, dokumenter, etc.',
        completed: false,
        required: true,
        order: 1,
        aiGenerated: true
      },
      {
        id: '2',
        category: 'Forberedelse',
        title: 'Dokumenter tidslinje av hendelser',
        description: 'Lag kronologisk oversikt over hva som skjedde når',
        completed: false,
        required: true,
        order: 2,
        dependencies: ['1'],
        aiGenerated: true
      },
      {
        id: '3',
        category: 'Forberedelse',
        title: 'Identifiser vitner',
        description: 'Liste over personer som kan bekrefte dine påstander',
        completed: false,
        required: false,
        order: 3,
        aiGenerated: true
      }
    ];

    if (caseType === 'criminal' || caseType === 'corruption') {
      baseChecklist.push(
        {
          id: '4',
          category: 'Anmeldelse',
          title: 'Forbered politianmeldelse',
          description: 'AI vil hjelpe deg å skrive profesjonell anmeldelse',
          completed: false,
          required: true,
          order: 4,
          dependencies: ['1', '2'],
          aiGenerated: true
        },
        {
          id: '5',
          category: 'Anmeldelse',
          title: 'Lever anmeldelse til politiet',
          description: 'Send inn eller lever personlig',
          completed: false,
          required: true,
          order: 5,
          dependencies: ['4'],
          aiGenerated: true
        },
        {
          id: '6',
          category: 'Oppfølging',
          title: 'Få saksnummer fra politiet',
          description: 'Be om skriftlig bekreftelse på mottatt anmeldelse',
          completed: false,
          required: true,
          order: 6,
          dependencies: ['5'],
          aiGenerated: true
        }
      );
    }

    if (caseType === 'corruption') {
      baseChecklist.push(
        {
          id: '7',
          category: 'Eskalering',
          title: 'Vurder klage til SEFO',
          description: 'Hvis politiet ikke følger opp, klage til Spesialenheten',
          completed: false,
          required: false,
          order: 7,
          dependencies: ['6'],
          aiGenerated: true
        },
        {
          id: '8',
          category: 'Eskalering',
          title: 'Vurder internasjonal klage (EMD)',
          description: 'Hvis norske myndigheter svikter, klage til Europadomstolen',
          completed: false,
          required: false,
          order: 8,
          dependencies: ['7'],
          aiGenerated: true
        }
      );
    }

    baseChecklist.push(
      {
        id: '9',
        category: 'Juridisk',
        title: 'Konsulter advokat',
        description: 'Få profesjonell juridisk vurdering',
        completed: false,
        required: false,
        order: 9,
        aiGenerated: true
      },
      {
        id: '10',
        category: 'Sikkerhet',
        title: 'Sikre backup av alle data',
        description: 'Automatisk kryptert backup er aktivert',
        completed: true, // Auto-completed
        required: true,
        order: 10,
        aiGenerated: true
      }
    );

    return baseChecklist;
  }

  /**
   * Opprett tidslinje fra bevis og dokumenter
   */
  createTimeline(
    items: FolderItem[]
  ): TimelineEvent[] {
    const events: TimelineEvent[] = [];

    for (const item of items) {
      events.push({
        id: item.id,
        date: item.createdAt,
        type: this.getEventType(item),
        title: item.name,
        description: item.aiDescription || 'Dokumentasjon lastet opp',
        relatedItems: [item.id],
        importance: this.calculateImportance(item),
        icon: this.getEventIcon(item),
        color: this.getEventColor(item)
      });
    }

    // Sorter kronologisk
    return events.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  private getEventType(item: FolderItem): TimelineEvent['type'] {
    if (item.type === 'evidence') return 'evidence';
    if (item.type === 'document') return 'document';
    return 'other';
  }

  private calculateImportance(item: FolderItem): TimelineEvent['importance'] {
    const relevance = item.legalRelevance || 50;
    
    if (relevance >= 90) return 'critical';
    if (relevance >= 70) return 'high';
    if (relevance >= 40) return 'medium';
    return 'low';
  }

  private getEventIcon(item: FolderItem): string {
    if (item.fileType?.startsWith('image/')) return '📷';
    if (item.fileType?.startsWith('video/')) return '🎥';
    if (item.fileType?.startsWith('audio/')) return '🎙️';
    if (item.fileType === 'application/pdf') return '📄';
    return '📎';
  }

  private getEventColor(item: FolderItem): string {
    const importance = this.calculateImportance(item);
    
    switch (importance) {
      case 'critical': return '#dc3545';
      case 'high': return '#ff6b35';
      case 'medium': return '#ffc107';
      default: return '#6c757d';
    }
  }

  /**
   * AI Risk Assessment
   */
  async assessRisk(caseData: Partial<Case>): Promise<RiskAssessment> {
    // TODO: Connect to actual AI backend
    
    // For now, basic assessment
    const factors: RiskFactor[] = [];

    if (!caseData.folders || caseData.folders.length === 0) {
      factors.push({
        type: 'Manglende bevis',
        severity: 'high',
        description: 'Ingen bevis eller dokumenter lastet opp ennå',
        mitigation: 'Last opp alle relevante bevis så snart som mulig'
      });
    }

    if (caseData.type === 'corruption') {
      factors.push({
        type: 'Korrupsjonssak',
        severity: 'critical',
        description: 'Korrupsjonssaker kan være komplekse og farlige',
        mitigation: 'Bruk maksimal sikkerhet. Vurder profesjonell juridisk hjelp.'
      });
    }

    const overall = factors.some(f => f.severity === 'critical')
      ? 'critical'
      : factors.some(f => f.severity === 'high')
      ? 'high'
      : factors.length > 0
      ? 'medium'
      : 'low';

    return {
      overall,
      factors,
      aiConfidence: 75,
      recommendations: [
        'Sørg for å dokumentere alt nøye',
        'Oppbevar backup på flere steder',
        'Vurder profesjonell juridisk hjelp',
        'Bruk RettBot+ sine sikkerhetsfunksjoner'
      ]
    };
  }

  /**
   * Generate suggested actions based on case data
   */
  generateSuggestedActions(caseData: Partial<Case>): SuggestedAction[] {
    const actions: SuggestedAction[] = [];

    // Check if case has evidence
    const evidenceFolder = caseData.folders?.find(f => f.type === 'evidence');
    if (!evidenceFolder || evidenceFolder.items.length === 0) {
      actions.push({
        id: '1',
        priority: 'critical',
        action: 'Last opp bevis',
        reason: 'Saken mangler bevis. Last opp alle relevante bilder, video, dokumenter.',
        completed: false
      });
    }

    // Check if timeline is documented
    if (!caseData.timeline || caseData.timeline.length < 2) {
      actions.push({
        id: '2',
        priority: 'high',
        action: 'Dokumenter tidslinje',
        reason: 'Lag kronologisk oversikt over hendelsene',
        completed: false
      });
    }

    // Check for deadlines
    const upcomingDeadlines = caseData.deadlines?.filter(d => !d.completed);
    if (upcomingDeadlines && upcomingDeadlines.length > 0) {
      actions.push({
        id: '3',
        priority: 'critical',
        action: 'Følg opp frister',
        reason: `Du har ${upcomingDeadlines.length} kommende frist(er)`,
        deadline: upcomingDeadlines[0].date,
        completed: false
      });
    }

    return actions;
  }
}

/**
 * PROFESSIONAL CASE SUMMARY GENERATOR
 */
export class CaseSummaryGenerator {
  
  async generateProfessionalSummary(caseData: Case): Promise<string> {
    // TODO: Connect to actual AI backend for professional summary
    
    return `
SAKSSAMMENDRAG
==============

Saksnr: ${caseData.caseNumber || 'Ikke tildelt ennå'}
Type: ${this.translateCaseType(caseData.type)}
Status: ${this.translateStatus(caseData.status)}
Opprettet: ${new Date(caseData.createdAt).toLocaleDateString('no')}

PARTER:
- Klient: ${caseData.client.name}
${caseData.opponent ? `- Motpart: ${caseData.opponent.name}` : ''}
${caseData.lawyer ? `- Advokat: ${caseData.lawyer.name}` : ''}

SAKSOVERSIKT:
${caseData.aiSummary || 'AI-generert sammendrag kommer her...'}

BEVIS OG DOKUMENTASJON:
${this.summarizeFolders(caseData.folders)}

TIDSLINJE:
${this.summarizeTimeline(caseData.timeline)}

NESTE STEG:
${this.summarizeNextSteps(caseData.checklist, caseData.suggestedActions)}

RISIKOVURDERING:
${this.summarizeRisk(caseData.riskAssessment)}
    `.trim();
  }

  private translateCaseType(type: CaseType): string {
    const translations: Record<CaseType, string> = {
      criminal: 'Straffesak',
      civil: 'Sivil sak',
      administrative: 'Forvaltningssak',
      corruption: 'Korrupsjonssak',
      human_rights: 'Menneskerettighetssak',
      labor: 'Arbeidstvist',
      family: 'Familierett',
      other: 'Annet'
    };
    return translations[type];
  }

  private translateStatus(status: CaseStatus): string {
    const translations: Record<CaseStatus, string> = {
      investigation: 'Under etterforskning',
      police_report: 'Anmeldelse innlevert',
      prosecution: 'Under påtale',
      court_pending: 'Venter på rettssak',
      trial: 'Under rettssak',
      appeal: 'Under anke',
      settled: 'Avgjort',
      closed: 'Lukket'
    };
    return translations[status];
  }

  private summarizeFolders(folders: Folder[]): string {
    return folders.map(folder => 
      `- ${folder.name}: ${folder.items.length} element(er)`
    ).join('\n');
  }

  private summarizeTimeline(timeline: TimelineEvent[]): string {
    const recentEvents = timeline.slice(-5);
    return recentEvents.map(event =>
      `${new Date(event.date).toLocaleDateString('no')}: ${event.title}`
    ).join('\n');
  }

  private summarizeNextSteps(
    checklist: ChecklistItem[],
    actions: SuggestedAction[]
  ): string {
    const incomplete = checklist.filter(item => !item.completed && item.required);
    const priorityActions = actions.filter(a => !a.completed && a.priority === 'critical');
    
    const steps = [
      ...incomplete.slice(0, 3).map(item => `- ${item.title}`),
      ...priorityActions.slice(0, 2).map(action => `- ${action.action}`)
    ];

    return steps.length > 0 
      ? steps.join('\n')
      : '- Alle kritiske oppgaver er fullført!';
  }

  private summarizeRisk(risk: RiskAssessment): string {
    return `
Overordnet risiko: ${risk.overall.toUpperCase()}
AI Konfidans: ${risk.aiConfidence}%

Risikofaktorer:
${risk.factors.map(f => `- ${f.description}`).join('\n')}

Anbefalinger:
${risk.recommendations.map(r => `- ${r}`).join('\n')}
    `.trim();
  }
}
