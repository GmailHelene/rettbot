/**
 * RettBot+ TypeScript Type Definitions
 */

// ============================================
// User & Authentication
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  encryptionFingerprint: string; // Hash of master key for verification
}

export interface AuthCredentials {
  email: string;
  password: string;
}

// ============================================
// Case Management
// ============================================

export interface Case {
  id: string;
  title: string;
  description: string;
  type: CaseType;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
  folders: Folder[];
  timeline: TimelineEvent[];
  checklist: ChecklistItem[];
  riskAssessment?: RiskAssessment;
  encrypted: boolean;
}

export type CaseType =
  | 'criminal'
  | 'civil'
  | 'corruption'
  | 'human_rights'
  | 'administrative'
  | 'other';

export type CaseStatus =
  | 'new'
  | 'investigation'
  | 'filed'
  | 'pending'
  | 'trial'
  | 'appeal'
  | 'closed';

export interface Folder {
  id: string;
  name: string;
  description: string;
  icon: string;
  fileCount: number;
  files: EvidenceFile[];
}

export interface EvidenceFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  encrypted: boolean;
  hash: string;
  blockchainTimestamp?: string;
  category: string;
  tags: string[];
  aiAssessment?: EvidenceAssessment;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'evidence' | 'filing' | 'hearing' | 'decision' | 'other';
  importance: 'low' | 'medium' | 'high' | 'critical';
  relatedFiles: string[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  dueDate?: string;
  dependencies: string[];
  importance: 'low' | 'medium' | 'high';
}

export interface RiskAssessment {
  overall: 'low' | 'medium' | 'high' | 'critical';
  convictionProbability?: number;
  factors: RiskFactor[];
  recommendations: string[];
  lastUpdated: string;
}

export interface RiskFactor {
  factor: string;
  impact: 'positive' | 'negative';
  severity: 'low' | 'medium' | 'high';
  description: string;
}

// ============================================
// AI Analysis
// ============================================

export interface EvidenceAssessment {
  relevance: 'high' | 'medium' | 'low';
  legal_value: number; // 0-100
  evidence_type: string;
  suggested_category: string;
  chain_of_custody: string[];
  potential_issues: string[];
  recommendations: string[];
  auto_tags: string[];
  related_laws: string[];
  summary: string;
  confidence: number; // 0-100
}

export interface LegalResearch {
  answer: string;
  norwegian_laws: LawReference[];
  echr_cases: CourtCase[];
  precedents: CourtCase[];
  citations: string[];
  confidence: number;
  recommendations: string[];
}

export interface LawReference {
  law: string;
  section: string;
  text: string;
  relevance: number;
}

export interface CourtCase {
  name: string;
  court: string;
  date: string;
  summary: string;
  outcome: string;
  relevance: number;
}

export interface DefenseStrategy {
  primary_theory: string;
  weaknesses: Weakness[];
  alternative_defenses: string[];
  procedural_challenges: string[];
  motion_strategy: Motion[];
  risk_assessment: {
    conviction_probability: number;
    recommended_approach: string;
    outcomes: {
      best: string;
      likely: string;
      worst: string;
    };
  };
  next_steps: string[];
}

export interface Weakness {
  description: string;
  exploitability: number; // 1-10
  strategy: string;
}

export interface Motion {
  type: string;
  timing: string;
  success_probability: number;
  description: string;
}

export interface LegalDocument {
  type: string;
  content: string;
  citations: string[];
  metadata: {
    created: string;
    case_number?: string;
    court?: string;
  };
}

// ============================================
// Corruption Handling
// ============================================

export interface CorruptionPattern {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'systemic';
  institutions: string[];
  evidence: string[];
  escalationLevel: number; // 1-8
}

export interface EscalationPath {
  level: number;
  authority: string;
  description: string;
  when: string;
  howTo: string;
}

// ============================================
// Security
// ============================================

export interface EncryptionMetadata {
  algorithm: string;
  layers: number;
  keyFingerprint: string;
  unbreakableUntilYear?: number;
  timestamp: string;
}

export interface BackupShard {
  id: string;
  shardNumber: number;
  totalShards: number;
  requiredForRecovery: number;
  location: string;
  encrypted: boolean;
  timestamp: string;
}

// ============================================
// UI State
// ============================================

export interface AppState {
  user: User | null;
  currentCase: Case | null;
  cases: Case[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UploadProgress {
  file: File;
  status: 'uploading' | 'analyzing' | 'encrypting' | 'backing-up' | 'complete' | 'error';
  progress: number; // 0-100
  error?: string;
  assessment?: EvidenceAssessment;
}
