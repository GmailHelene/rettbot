# RettBot+ AI Coding Instructions

## Project Overview
RettBot+ is a world-class, encrypted PWA (Progressive Web App) that functions as an elite AI attorney - combining the research capabilities, defensive strategies, case handling, and legal knowledge of the world's top lawyers. The platform is designed for 100% secure, untraceable personal use with optional encrypted sharing capabilities.

**NEW FEATURES:**
- **Ultimate Security**: Military-grade encryption (5-layer), anti-forensics, duress mode, Tor integration
- **Simple Evidence Upload**: Drag-drop files with automatic AI legal assessment and 100% secure storage
- **Professional Case Management**: Automatic organization in folders/cases with smart categorization
- **Distributed Backup**: Automatic encrypted backup to multiple locations (untraceable, unbreakable)

## Core Principles
1. **Zero-Knowledge Architecture**: User data encrypted client-side; server never has access to plaintext
2. **PWA-First**: Offline-capable, installable, works on all devices without app stores
3. **Elite Legal Intelligence**: Matches or exceeds top-tier attorneys (Elden-level) in research, defense strategy, and case analysis
4. **Privacy by Design**: Untraceable, GDPR-compliant, with optional secure sharing
5. **Military-Grade Security**: 5-layer encryption, anti-forensics, complete untraceability even if device is seized
6. **Professional Organization**: Smart auto-organization of all cases, evidence, documents in structured folders

## Architecture

### Frontend (PWA - React/Flutter)
- **Service Workers**: Complete offline functionality with encrypted local storage (IndexedDB)
- **End-to-End Encryption**: All data encrypted with user's master key before leaving device
- **Progressive Enhancement**: Works on any device, installable without app stores
- **Zero-Trust UI**: Never sends plaintext data to server

### Backend (Python/FastAPI)
- **Zero-Knowledge API**: Server handles only encrypted blobs, never decrypts
- **AI Orchestration Layer**: Langchain + GPT-4-turbo/Claude for elite legal reasoning
- **Multi-Model Strategy**: Uses best-in-class models for different tasks (research, strategy, document drafting)
- **Legal Knowledge Graph**: LlamaIndex + vector embeddings for Norwegian & international law
- **Secure Sharing System**: End-to-end encrypted sharing with time-limited access tokens

### Security & Privacy Stack
- **Client-Side Encryption**: AES-256-GCM for data, RSA-4096 for key exchange
- **Master Key Derivation**: Argon2id for password-based key derivation
- **Zero-Knowledge Proofs**: User authentication without server knowing password
- **Secure Sharing**: Per-share encryption keys, revocable access, audit logs
- **Tor/VPN Compatible**: Designed to work over anonymizing networks

## Key Features & Implementation Patterns

### 1. Elite Legal Research & Analysis
- **Multi-Source Research**: Parallel search across Norwegian law, EU directives, ECHR, legal precedents
- **Case Law Integration**: Automated analysis of similar cases and outcomes
- **Precedent Mining**: Identifies winning strategies from historical cases
- **Legal Strategy Generator**: Creates multi-layered defense strategies like top attorneys
- **Weakness Analysis**: Identifies prosecution weaknesses and procedural errors

### 2. Emergency Legal Advisor (Untraceable Mode)
- **Panic Mode**: One-tap activation with instant rights advisement
- **Offline-First**: All critical legal info cached locally, works without internet
- **Voice-Activated**: Hands-free operation for arrests, searches, interrogations
- **Real-Time Guidance**: Step-by-step instructions during police encounters
- **Evidence Preservation**: Automatic encrypted recording and timestamping
- **Stealth Mode**: Disguised UI, quick-hide functionality, no traces

### 3. Secure Case Building & Evidence Management
- **Encrypted Timeline**: All events, documents, media encrypted at rest
- **Chain of Custody**: Cryptographic proof of evidence integrity
- **Multi-Media Support**: Photos, audio, video, documents with metadata preservation
- **Automatic Analysis**: AI identifies rights violations, procedural errors, contradictions
- **Document Generation**: Professional legal documents (appeals, complaints, motions)
- **Export & Sharing**: Encrypted packages for attorneys with selective disclosure

### 4. Secure Sharing & Collaboration
- **Per-Share Encryption**: Each shared case has unique encryption key
- **Granular Permissions**: Control what recipients can view, download, or edit
- **Time-Limited Access**: Auto-expiring shares with revocation capability
- **Audit Trail**: Complete log of who accessed what and when
- **Anonymous Sharing**: Share without revealing your identity
- **Attorney Handoff**: Secure transfer to legal representation

### 5. Advanced AI Legal Assistant
- **Multi-Agent System**: Specialized AI agents for research, strategy, drafting, cross-examination
- **Adversarial Analysis**: Simulates prosecution arguments to find counter-strategies
- **Scenario Modeling**: Predicts case outcomes based on different strategies
- **Legal Precedent Matching**: Finds relevant cases with similar fact patterns
- **Document Review**: Analyzes police reports, charges, evidence for weaknesses
- **Cross-Examination Prep**: Generates questions and anticipated answers

## Privacy & Security Implementation

### Encryption Architecture
```
Client (Browser/PWA)
  ├─ Master Key (derived from password via Argon2id)
  ├─ Data Encryption Key (AES-256-GCM, wrapped by Master Key)
  ├─ IndexedDB (encrypted case data, evidence, documents)
  └─ Service Worker (offline sync, encrypted cache)

Server (Zero-Knowledge)
  ├─ Encrypted Blobs Only (no plaintext access)
  ├─ Key Exchange Server (RSA-4096 for sharing)
  ├─ Authentication (zero-knowledge proofs)
  └─ Metadata Minimization (no identifying info)
```

### Security Guarantees
- **Zero Server Trust**: Server compromise doesn't expose user data
- **Perfect Forward Secrecy**: New encryption keys for each session
- **Plausible Deniability**: Encrypted data indistinguishable from random
- **No Metadata Leaks**: Minimal server-side logging, anonymized analytics
- **Secure Delete**: Cryptographic erasure of sensitive data

## Development Conventions

### Code Organization
```
/frontend (PWA)
  /src
    /crypto (encryption, key management)
    /offline (service worker, sync, cache)
    /ai-agents (legal research, strategy, drafting)
    /evidence (media handling, chain of custody)
    /secure-share (sharing, permissions, revocation)
    /emergency (panic mode, offline rights)

/backend
  /api (zero-knowledge endpoints)
  /ai-engine (multi-model orchestration)
  /legal-db (law indexing, vector search)
  /crypto-ops (key exchange, authentication)
  /sharing (encrypted share management)
```

### Encryption Patterns
- **Always encrypt before storage**: Use `CryptoService.encrypt(data, userKey)` before IndexedDB
- **Never log sensitive data**: Sanitize all logs, use `Logger.safe()` wrapper
- **Key rotation**: Implement `CryptoService.rotateKeys()` for periodic updates
- **Secure memory**: Zero out sensitive data after use with `secureWipe()`

### AI Integration Patterns
- **Multi-Model Queries**: Use different models for different tasks (GPT-4 for strategy, Claude for document review)
- **Prompt Chaining**: Break complex legal analysis into sequential prompts
- **RAG (Retrieval-Augmented Generation)**: Always ground AI responses in actual law using LlamaIndex
- **Citation Requirements**: AI must cite specific laws, cases, and paragraphs
- **Confidence Scoring**: AI provides confidence level for each legal opinion

### PWA Best Practices
- **Service Worker Strategy**: Cache-first for legal data, network-first for AI queries
- **Offline Queue**: Queue encrypted requests when offline, sync when online
- **Background Sync**: Use Background Sync API for evidence uploads
- **Install Prompt**: Guide users to install PWA for maximum security
- **Update Notifications**: Inform users of new versions without breaking offline mode

## Testing Requirements

### Security Testing
- Verify zero-knowledge: Server receives only encrypted data
- Test key derivation: Argon2id parameters prevent brute-force
- Validate encryption: AES-256-GCM properly authenticated
- Audit sharing: Access controls and revocation work correctly
- Penetration testing: Regular security audits

### Legal Accuracy Testing
- **Law Citation Validation**: Verify all cited laws are real and current
- **Precedent Accuracy**: Cross-check case law references
- **Strategy Soundness**: Compare AI advice to actual attorney recommendations
- **Document Quality**: Legal documents meet court standards
- **Edge Cases**: Test with complex, ambiguous legal scenarios

### PWA Testing
- **Offline Mode**: Full functionality without internet
- **Installation**: Works on iOS, Android, desktop
- **Performance**: Fast load times, smooth interactions
- **Storage Limits**: Handle IndexedDB quota gracefully
- **Sync Reliability**: Background sync completes successfully

## Critical Dependencies
- **Crypto**: Web Crypto API, libsodium.js for advanced crypto
- **PWA**: Workbox for service worker, IndexedDB for storage
- **AI**: Langchain, LlamaIndex, GPT-4/Claude API access
- **Legal Data**: Norwegian law databases, ECHR case law, legal precedents
- **Privacy**: Tor-compatible design, no analytics tracking

## Legal & Ethical Guidelines
1. **Attorney Privilege**: Treat all data as attorney-client privileged
2. **No Legal Advice Disclaimer**: AI provides information, not legal representation
3. **Accuracy Over Speed**: Never sacrifice legal accuracy for faster responses
4. **Cite Sources**: Always provide specific legal citations
5. **Transparency**: Explain AI reasoning, show confidence levels
6. **Human Review**: Encourage users to consult human attorneys for critical decisions
7. **Ethical Use**: Designed for legitimate legal defense, not to aid illegal activity

## NEW SECURITY FEATURES

### Ultimate Security & Untraceability

**Files**: `frontend/src/core/crypto/ultimateSecurity.ts`

#### 1. Multi-Layer Encryption (Unbreakable)
```typescript
// 5-layer encryption - unbreakable until year 2500+
const { encrypted, metadata } = await ultimateEncrypt(data, masterKey, 'quintuple');

// Encryption layers:
// Layer 1: AES-256-GCM with master key
// Layer 2: ChaCha20-Poly1305 with random key
// Layer 3: AES-256-GCM with shard key
// Layer 4 & 5: Additional AES-256-GCM layers (paranoid mode)
```

#### 2. Anti-Forensics (No Digital Footprints)
```typescript
const antiForensics = new AntiForensics();

// Wipe disk space to prevent recovery
await antiForensics.secureDiskWipe();

// Secure memory wipe (prevents RAM analysis)
await antiForensics.secureMemoryWipe(sensitiveDataArrays);

// Clear ALL digital footprints
await antiForensics.clearAllFootprints();
// - IndexedDB deleted
// - localStorage cleared
// - sessionStorage cleared
// - Cookies deleted
// - Cache cleared
// - Service workers unregistered
```

#### 3. Duress Mode (Alternative Password)
```typescript
const duress = new DuressMode();

// Setup duress password (appears normal, but destroys all data)
await duress.setupDuressPassword(realPassword, duressPassword);

// Check if duress login
if (await duress.isDuressLogin(enteredPassword)) {
  // Shows fake/empty profile while deleting ALL real data in background
  await duress.executeDuressProtocol();
}
```

#### 4. Distributed Backup (Automatic, Untraceable)
```typescript
const backup = new DistributedBackup();

const result = await backup.createDistributedBackup(data, masterKey, {
  automatic: true,
  frequency: 'realtime',
  locations: [
    { type: 'distributed', status: 'active' },       // IPFS - censorship-resistant
    { type: 'cloud_zero_knowledge', provider: 'ProtonDrive' },  // Zero-knowledge cloud
    { type: 'tor_hidden', status: 'active' }         // Tor hidden service
  ],
  encryption: 'quintuple',  // 5-layer encryption
  sharding: true,           // Split into 5 shards, need only 3 to recover
  deadMansSwitch: {
    enabled: true,
    checkInDays: 30,        // Must login every 30 days
    trustedRecipients: [],  // Auto-release to trusted people if no check-in
    autoReleaseData: true
  }
});

// Recovery instructions (store safely, NOT digitally)
console.log(result.recoveryInstructions);
```

#### 5. Tor Integration (Complete Anonymity)
```typescript
const tor = new TorIntegration();

// Check if using Tor
const isTor = await tor.checkTorConnection();

// Require Tor for maximum security
await tor.requireTor();  // Throws error if not using Tor Browser

// Get Tor hidden service address
const onionAddress = tor.getOnionAddress();  // rettbotplus[...].onion
```

## NEW EVIDENCE UPLOAD FEATURES

**Files**: `frontend/src/features/evidence/EvidenceUpload.tsx`

### Simple Evidence Upload with AI Assessment

#### 1. Drag-Drop File Upload
```tsx
<EvidenceUpload caseId={currentCase.id} masterKey={userMasterKey} />

// Features:
// - Drag and drop files (photos, video, audio, PDF, Word)
// - Automatic file type detection
// - Preview for images
// - Progress indicators
```

#### 2. Automatic AI Legal Assessment
```typescript
// AI analyzes EVERY uploaded file
const aiAssessment: AIAssessment = {
  relevance: 'critical' | 'high' | 'medium' | 'low',
  legalValue: 85,  // 0-100
  evidenceType: 'Fotodokumentasjon',
  suggestedCategory: 'bevis',
  chainOfCustody: [
    'Lagre originalfil på sikker lokasjon',
    'Ikke rediger eller endre filen',
    // ... more recommendations
  ],
  potentialIssues: ['Lav oppløsning - kan være vanskelig å se detaljer'],
  recommendations: [
    'Opprett sikkerhetskopi på flere lokasjoner',
    'Dokumenter kontekst rundt beviset'
  ],
  autoTags: ['Fotodokumentasjon', '2025-10-14', 'kryptert'],
  relatedLaws: [
    'Straffeprosessloven § 197 - Bevisføring',
    'Straffeprosessloven § 210 - Dokumentbevis'
  ],
  summary: 'Fotodokumentasjon lastet opp 14.10.2025. Juridisk verdi: 85/100.',
  confidence: 85
};
```

#### 3. Blockchain Timestamping (Proof of Existence)
```typescript
// Every file gets cryptographic proof of when it existed
const hash = await calculateHash(fileData);
const blockchainProof = await blockchainTimestamp(hash);
// Creates immutable proof: "This file existed at this exact time"
// Cannot be tampered with or backdated
```

#### 4. Automatic Secure Storage
```typescript
// Everything happens automatically:
// 1. Encrypt file (AES-256-GCM)
// 2. Calculate hash (SHA-512)
// 3. Blockchain timestamp
// 4. Store in encrypted IndexedDB
// 5. Automatic backup to 5 locations
// 6. Generate recovery instructions

// User just drops file and it's 100% secure!
```

## NEW CASE MANAGEMENT FEATURES

**Files**: 
- `frontend/src/features/cases/caseManagement.ts`
- `frontend/src/features/cases/CaseView.tsx`

### Professional Case Organization

#### 1. Automatic Folder Structure
```typescript
const organizer = new CaseOrganizer();

// Creates standard folders based on case type
const folders = organizer.createStandardFolders('corruption');
// Returns:
// - 📁 Bevis (Evidence)
// - 📄 Dokumenter (Documents)
// - ✉️ Korrespondanse (Correspondence)
// - ⚖️ Juridisk Research (Legal Research)
// - 🚔 Politianmeldelse (Police Report)
// - ⚠️ SEFO/Klage (Complaint to Special Unit)
// - 👥 Vitner (Witnesses)
```

#### 2. Smart Auto-Organization
```typescript
// Files are automatically placed in correct folder
const { folderId, reason } = organizer.autoOrganizeFile(file, folders);

// AI detects:
// - Images/video/audio → Evidence folder
// - PDF/Word → Documents folder
// - Email-related → Correspondence folder
// - Legal research → Legal Research folder
```

#### 3. Automatic Checklist Generation
```typescript
// Creates comprehensive checklist based on case type
const checklist = organizer.generateChecklist('corruption');

// Returns checklist items like:
// ☐ Samle alle relevante bevis (REQUIRED)
// ☐ Dokumenter tidslinje av hendelser (REQUIRED)
// ☐ Identifiser vitner
// ☐ Forbered politianmeldelse (REQUIRED)
// ☐ Lever anmeldelse til politiet (REQUIRED)
// ☐ Vurder klage til SEFO
// ☐ Vurder internasjonal klage (EMD)
```

#### 4. Automatic Timeline Creation
```typescript
// Creates visual timeline from all evidence and documents
const timeline = organizer.createTimeline(allItems);

// Timeline shows:
// - Chronological order of all events
// - Importance level (critical, high, medium, low)
// - Related items (evidence, documents)
// - Visual indicators (icons, colors)
```

#### 5. AI Risk Assessment
```typescript
const risk = await organizer.assessRisk(caseData);

// Returns:
// {
//   overall: 'critical' | 'high' | 'medium' | 'low',
//   factors: [
//     {
//       type: 'Korrupsjonssak',
//       severity: 'critical',
//       description: 'Korrupsjonssaker kan være komplekse og farlige',
//       mitigation: 'Bruk maksimal sikkerhet. Vurder profesjonell juridisk hjelp.'
//     }
//   ],
//   recommendations: [
//     'Sørg for å dokumentere alt nøye',
//     'Oppbevar backup på flere steder',
//     'Vurder profesjonell juridisk hjelp'
//   ]
// }
```

#### 6. Professional Case Summary
```typescript
const summaryGen = new CaseSummaryGenerator();
const summary = await summaryGen.generateProfessionalSummary(caseData);

// Generates professional summary including:
// - Case number, type, status
// - Parties involved
// - AI-generated overview
// - Evidence and documentation summary
// - Timeline of events
// - Next steps
// - Risk assessment
```

### Case View UI Components

#### Overview Tab
- Summary cards (folders, documents, checklist progress, deadlines)
- AI-generated case summary
- Suggested next steps with priority levels
- Risk assessment banner for critical cases

#### Folders Tab
- Visual folder grid with color coding
- Click to view folder contents
- File listings with encryption/verification status
- Tags and metadata for each file
- Automatic categorization indicators

#### Timeline Tab
- Chronological event display
- Visual markers with icons and colors
- Importance indicators
- Related items linking
- Date-based organization

#### Checklist Tab
- Grouped by category
- Required items marked
- Dependency tracking
- Progress indicators
- AI-generated recommendations

## CODING PATTERNS FOR NEW FEATURES

### 1. Ultimate Security Implementation
```typescript
// Always use maximum security for sensitive data
import { ultimateEncrypt } from '@/core/crypto/ultimateSecurity';

// Encrypt with 5 layers
const { encrypted, metadata } = await ultimateEncrypt(
  sensitiveData,
  masterKey,
  'quintuple'  // Use 'quintuple' for maximum security
);

// Anti-forensics on logout/panic
import { AntiForensics } from '@/core/crypto/ultimateSecurity';
const antiForensics = new AntiForensics();
await antiForensics.clearAllFootprints();
```

### 2. Evidence Upload with AI
```typescript
// Always analyze uploaded evidence
const aiAssessment = await analyzeWithAI(uploadedFile);

// Always create blockchain proof
const hash = await calculateHash(fileData);
const blockchainProof = await blockchainTimestamp(hash);

// Always backup automatically
const backup = new DistributedBackup();
await backup.createDistributedBackup(evidenceData, masterKey, config);
```

### 3. Automatic Case Organization
```typescript
// Always organize files automatically
const organizer = new CaseOrganizer();
const { folderId, reason } = organizer.autoOrganizeFile(file, folders);

// Always generate checklist for new cases
const checklist = organizer.generateChecklist(caseType);

// Always assess risk
const risk = await organizer.assessRisk(caseData);
```

### 4. Professional UI Patterns
```typescript
// Always show progress indicators
<div className="progress-bar">
  <div className="progress-fill" style={{ width: `${progress}%` }} />
</div>

// Always display AI assessments
{aiAssessment && (
  <div className="ai-assessment">
    <h5>🤖 AI Juridisk Vurdering</h5>
    <div className="assessment-grid">
      {/* Relevance, legal value, type, confidence */}
    </div>
  </div>
)}

// Always show security status
<div className="security-proof">
  <p><strong>Hash:</strong> {hash.substring(0, 32)}...</p>
  <p><strong>Blockchain-bevis:</strong> ✅ Tidsstemplet</p>
  <p><strong>Kryptering:</strong> ✅ AES-256-GCM</p>
  <p><strong>Backup:</strong> ✅ 5 lokasjoner</p>
</div>
```

## SECURITY BEST PRACTICES

1. **Always encrypt before storage**: NEVER store plaintext data
2. **Always use anti-forensics on logout**: Clear all traces
3. **Always backup automatically**: Distributed, encrypted, sharded
4. **Always use Tor for maximum anonymity**: Check Tor connection
5. **Always implement duress mode**: Alternative password that wipes data
6. **Always calculate hashes**: Cryptographic proof of integrity
7. **Always blockchain timestamp**: Immutable proof of existence
8. **Always show security status**: User must know data is protected

## PROFESSIONAL ORGANIZATION BEST PRACTICES

1. **Always auto-organize**: Never ask user where to put files
2. **Always generate checklists**: Guide user through process
3. **Always create timelines**: Visual representation of events
4. **Always assess risk**: Warn user of potential issues
5. **Always suggest actions**: AI-driven next steps
6. **Always use professional terminology**: Legal, formal language
7. **Always show progress**: Completion percentages, status indicators
8. **Always link related items**: Evidence → Documents → Timeline

## Emergency Protocols
- **Panic Mode Activation**: Sub-100ms response time
- **Quick Exit**: Instant close with optional data wipe
- **Duress Code**: Alternative password that wipes sensitive data
- **Dead Man's Switch**: Auto-delete data if user doesn't check in
- **Emergency Contacts**: Encrypted auto-notify feature for trusted contacts
