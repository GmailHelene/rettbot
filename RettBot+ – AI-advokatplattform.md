# 🧠 RettBot+ – Elite AI-Advokatplattform

**RettBot+** er en verdensledende, kryptert PWA (Progressive Web App) som fungerer som en elite AI-advokat. Plattformen kombinerer research-kapasitet, defensive strategier, saksbehandling og juridisk kunnskap på nivå med verdens beste advokater. Systemet er designet for 100% sikker, usporbar personlig bruk med valgfri kryptert deling.

## 🎯 Visjon
En AI-drevet juridisk forsvarsplattform som matcher eller overtrffer toppadvokater som Elden i:
- **Juridisk Research**: Dyp analyse av lover, rettspraksis og presedens
- **Forsvarsstrategi**: Flerlags forsvarsstrategier med svakhetsanalyse
- **Saksbehandling**: Profesjonell dokumenthåndtering og bevisføring
- **Frikjenning**: Identifisering av sakssvakheter og motargumenter
- **Bevisføring**: Kryptografisk bevisinnegradering og kjede-av-forvaring
- **Lovkunnskap**: Komplett kjennskap til norsk lov, EU-direktiver, EMK
- **Akutte Situasjoner**: Umiddelbar veiledning ved pågripelse, ransaking, avhør

## 🔒 Sikkerhet & Personvern

### Zero-Knowledge Arkitektur
- **Klient-side Kryptering**: All data krypteres i nettleseren før lagring/sending
- **Master Key**: Brukergenerert nøkkel (Argon2id) som aldri forlater enheten
- **AES-256-GCM**: Militær-grade kryptering for all data
- **RSA-4096**: Sikker nøkkelutveksling for deling
- **Ingen Server-tilgang**: Server ser kun krypterte blobs, aldri klartekst

### PWA-Fordeler
- **Offline-First**: Full funksjonalitet uten internett
- **Installerbar**: Fungerer som native app på alle enheter
- **Ingen App Store**: Ingen mellommenn som kan sensurere eller overvåke
- **Auto-Oppdatering**: Sikkerhetsoppdateringer uten brukerinteraksjon
- **Cross-Platform**: iOS, Android, Windows, Mac, Linux

### Usporbarhet
- **Tor/VPN-Kompatibel**: Designet for anonymiserende nettverk
- **Minimal Metadata**: Ingen identifiserende informasjon lagres
- **Plausible Deniability**: Kryptert data ser ut som tilfeldig støy
- **Secure Delete**: Kryptografisk sletting av sensitiv data
- **Duress Code**: Alternativt passord som sletter alt

---

## ⚙️ Funksjoner

### 1. Elite Juridisk Research & Analyse
- **Multi-Source Research**: Parallellsøk i norsk lov, EU-direktiver, EMK, rettspraksis
- **Presedensanalyse**: Automatisk analyse av lignende saker og utfall
- **Vinnerstrategier**: Identifiserer vellykkede forsvarsstrategier fra historiske saker
- **Svakhetsanalyse**: Finner hull i påtalemyndighetens sak og prosedyrefeil
- **Juridisk Strategi-Generator**: Skaper flerlags forsvarsstrategier som toppadvokater
- **Scenariomodellering**: Predikerer saksutfall basert på ulike strategier
- **Kryssforhør-Prep**: Genererer spørsmål og forventede svar

### 2. Akutt Juridisk Veileder (Nødsituasjoner)
- **Panic Mode**: Ett-trykk aktivering med umiddelbare rettighetsinstruksjoner
- **Offline Rettigheter**: All kritisk juridisk info tilgjengelig uten internett
- **Taleaktivering**: Håndfri operasjon under pågripelse/ransaking/avhør
- **Sanntidsveiledning**: Trinn-for-trinn instruksjoner under politikontakt
- **Bevispreservering**: Automatisk kryptert opptak og tidsstempling
- **Stealth Mode**: Kamuflert UI, quick-hide funksjon, ingen spor
- **Push-varsler**: Kontekstbaserte varslinger ved kritiske hendelser

### 3. Sikker Saksbehandling & Bevisføring
- **Kryptert Tidslinje**: Alle hendelser, dokumenter og media kryptert
- **Chain of Custody**: Kryptografisk bevis på bevisintegritet
- **Multi-Media**: Bilder, lyd, video, dokumenter med metadata-bevaring
- **Automatisk Analyse**: AI identifiserer rettighetsbrudd, prosedyrefeil, motsetninger
- **Dokumentgenerering**: Profesjonelle juridiske dokumenter (anker, klager, begjæringer)
- **Eksport & Deling**: Krypterte pakker til advokater med selektiv disclosure

### 4. Sikker Deling & Samarbeid
- **Per-Share Kryptering**: Hver delt sak har unik krypteringsnøkkel
- **Granulære Tillatelser**: Kontroller hva mottakere kan se, laste ned eller redigere
- **Tidsberenset Tilgang**: Auto-utløpende delinger med tilbakekallingsmulighet
- **Audit Trail**: Komplett logg over hvem som så hva og når
- **Anonym Deling**: Del uten å avsløre din identitet
- **Advokat-Handoff**: Sikker overføring til juridisk representasjon

### 5. Avansert AI Juridisk Assistent
- **Multi-Agent System**: Spesialiserte AI-agenter for research, strategi, skriving, kryssforhør
- **Adversarial Analyse**: Simulerer påtalemyndighetens argumenter for å finne motstrategier
- **Scenariomodellering**: Predikerer saksutfall basert på ulike strategier
- **Presedensmatching**: Finner relevante saker med lignende faktum
- **Dokumentgjennomgang**: Analyserer politirapporter, siktelser, bevis for svakheter
- **Kryssforhør-Prep**: Genererer spørsmål og forventede svar
- **Juridisk Strategi-AI**: Multi-lags forsvarsstrategier som toppadvokater

---

## 🧰 Teknologi-stack

### Frontend (PWA)
- **Framework**: React 18+ med TypeScript
- **PWA Tools**: Workbox (Service Workers), IndexedDB (lokal lagring)
- **Kryptering**: Web Crypto API + libsodium.js
- **UI/UX**: Tailwind CSS, Shadcn/UI, Framer Motion
- **Offline**: Service Worker med cache-first strategi
- **Installasjon**: Full PWA support for iOS, Android, Desktop

### Backend (Zero-Knowledge)
- **API**: Python FastAPI (async)
- **AI Orkester**: Langchain + Multi-model (GPT-4, Claude, Gemini)
- **Juridisk Søk**: LlamaIndex + Pinecone/Weaviate (vektor-DB)
- **Database**: PostgreSQL (krypterte blobs) + Redis (cache)
- **Kryptering**: Server-side: kun nøkkelutveksling (RSA-4096)
- **Autentisering**: Zero-knowledge proofs (zk-SNARKs)

### AI & Legal Intelligence
- **LLM-er**: GPT-4-turbo (strategi), Claude 3 (dokumentanalyse), Gemini (research)
- **RAG System**: LlamaIndex for retrieval-augmented generation
- **Vektor-DB**: Pinecone/Weaviate for lovbase og rettspraksis
- **Embeddings**: Norwegian legal text embeddings (custom-trained)
- **Multi-Agent**: Specialized agents for research, defense, drafting, cross-examination

### Security & Privacy
- **Kryptering**: AES-256-GCM (data), RSA-4096 (key exchange), Argon2id (key derivation)
- **Zero-Knowledge**: Server ser kun krypterte blobs
- **Tor/VPN**: Kompatibel med anonymiserende nettverk
- **Secure Delete**: Kryptografisk sletting av sensitiv data
- **No Tracking**: Ingen analytics, minimal metadata

### Juridisk Database
- **Norsk Lov**: Straffeprosessloven, Politiloven, Straffeloven, Tvisteloven
- **Internasjonalt**: EMK (European Convention on Human Rights), EU-direktiver
- **Rettspraksis**: HR (Høyesterett), LB (Lagmannsrett), TR (Tingrett)
- **GDPR**: Full GDPR-base for personvernssaker
- **Oppdatering**: Automatisk synkronisering med Lovdata API

### Dokumentgenerering
- **Templates**: Jinja2 for juridiske dokumenter
- **PDF**: PDFKit + digital signatur
- **Formatering**: Overholder rettens formatkrav
- **Metadata**: Kryptert metadata for chain of custody

### Media & Speech
- **Tale-til-tekst**: Whisper (local) + Vosk (offline backup)
- **Tekst-til-tale**: ElevenLabs (emergency instructions)
- **Media Lagring**: Kryptert med metadata-bevaring
- **Kompresjon**: Lossless for bevis, lossy for backup

---

## 📁 Filstruktur

```
rettbot-plus/
├── frontend/                          # PWA Frontend
│   ├── public/
│   │   ├── manifest.json             # PWA manifest
│   │   ├── service-worker.js         # Offline functionality
│   │   └── icons/                    # App icons
│   ├── src/
│   │   ├── core/
│   │   │   ├── crypto/               # Client-side encryption
│   │   │   │   ├── masterKey.ts      # Master key derivation (Argon2id)
│   │   │   │   ├── dataEncryption.ts # AES-256-GCM encryption
│   │   │   │   ├── keyExchange.ts    # RSA-4096 for sharing
│   │   │   │   └── secureStorage.ts  # Encrypted IndexedDB
│   │   │   ├── offline/              # Offline-first architecture
│   │   │   │   ├── syncManager.ts    # Background sync
│   │   │   │   ├── cacheStrategy.ts  # Cache-first logic
│   │   │   │   └── queueManager.ts   # Request queue
│   │   │   └── auth/                 # Zero-knowledge auth
│   │   │       ├── zkAuth.ts         # zk-SNARK authentication
│   │   │       └── sessionManager.ts # Secure session handling
│   │   ├── features/
│   │   │   ├── emergency/            # Panic mode & emergency advisor
│   │   │   │   ├── PanicMode.tsx     # One-tap emergency activation
│   │   │   │   ├── RightsAdvisor.tsx # Real-time legal guidance
│   │   │   │   ├── StealthMode.tsx   # Disguised UI
│   │   │   │   └── QuickExit.tsx     # Instant close + optional wipe
│   │   │   ├── research/             # Elite legal research
│   │   │   │   ├── MultiSourceSearch.tsx  # Parallel law search
│   │   │   │   ├── PrecedentAnalysis.tsx  # Case law analysis
│   │   │   │   ├── StrategyGenerator.tsx  # Defense strategy AI
│   │   │   │   └── WeaknessAnalysis.tsx   # Find prosecution holes
│   │   │   ├── case-management/      # Case building & evidence
│   │   │   │   ├── Timeline.tsx      # Encrypted event timeline
│   │   │   │   ├── EvidenceUpload.tsx # Multi-media evidence
│   │   │   │   ├── ChainOfCustody.tsx # Cryptographic proof
│   │   │   │   └── DocumentGen.tsx    # Legal document generator
│   │   │   ├── ai-assistant/         # Multi-agent AI system
│   │   │   │   ├── ChatInterface.tsx # Main chat UI
│   │   │   │   ├── ResearchAgent.ts  # Legal research specialist
│   │   │   │   ├── DefenseAgent.ts   # Defense strategy specialist
│   │   │   │   ├── DraftingAgent.ts  # Document drafting specialist
│   │   │   │   └── AdversarialAgent.ts # Prosecution simulation
│   │   │   ├── sharing/              # Secure sharing system
│   │   │   │   ├── ShareManager.tsx  # Create/manage shares
│   │   │   │   ├── PermissionControl.tsx # Granular permissions
│   │   │   │   ├── AccessAudit.tsx   # Audit trail viewer
│   │   │   │   └── Revocation.tsx    # Revoke access
│   │   │   └── legal-db/             # Legal database UI
│   │   │       ├── LawSearch.tsx     # Natural language search
│   │   │       ├── LegalDictionary.tsx # Plain-language explanations
│   │   │       └── PrecedentBrowser.tsx # Browse case law
│   │   └── utils/
│   │       ├── speech/               # Speech recognition
│   │       │   ├── whisper.ts        # Whisper integration
│   │       │   └── vosk.ts           # Offline speech recognition
│   │       └── security/
│   │           ├── secureWipe.ts     # Secure memory clearing
│   │           └── duressCode.ts     # Emergency data wipe
│   └── package.json
├── backend/                           # Zero-Knowledge Backend
│   ├── api/
│   │   ├── auth/                     # Authentication endpoints
│   │   │   ├── zkauth.py             # Zero-knowledge auth
│   │   │   └── session.py            # Session management
│   │   ├── storage/                  # Encrypted blob storage
│   │   │   ├── upload.py             # Receive encrypted data
│   │   │   └── retrieve.py           # Serve encrypted data
│   │   ├── sharing/                  # Secure sharing endpoints
│   │   │   ├── create_share.py       # Create encrypted share
│   │   │   ├── access_control.py     # Permission management
│   │   │   └── revoke.py             # Revoke access
│   │   └── ai/                       # AI orchestration
│   │       ├── research.py           # Legal research endpoint
│   │       ├── strategy.py           # Defense strategy endpoint
│   │       ├── analysis.py           # Document analysis endpoint
│   │       └── chat.py               # Chat interface endpoint
│   ├── ai_engine/
│   │   ├── orchestrator.py           # Multi-model orchestration
│   │   ├── agents/
│   │   │   ├── research_agent.py     # Legal research specialist
│   │   │   ├── defense_agent.py      # Defense strategy specialist
│   │   │   ├── drafting_agent.py     # Document drafting specialist
│   │   │   └── adversarial_agent.py  # Prosecution simulation
│   │   ├── models/
│   │   │   ├── gpt4.py               # GPT-4 integration
│   │   │   ├── claude.py             # Claude integration
│   │   │   └── gemini.py             # Gemini integration
│   │   └── prompts/
│   │       ├── research_prompts.py   # Research prompt templates
│   │       ├── strategy_prompts.py   # Strategy prompt templates
│   │       └── drafting_prompts.py   # Drafting prompt templates
│   ├── legal_db/
│   │   ├── indexer/
│   │   │   ├── law_parser.py         # Parse Norwegian laws
│   │   │   ├── case_parser.py        # Parse case law
│   │   │   └── embeddings.py         # Generate legal embeddings
│   │   ├── search/
│   │   │   ├── vector_search.py      # LlamaIndex + Pinecone
│   │   │   ├── hybrid_search.py      # Keyword + semantic
│   │   │   └── precedent_matcher.py  # Find similar cases
│   │   └── data/
│   │       ├── norwegian_law/        # Straffeprosessloven, Politiloven, etc.
│   │       ├── echr/                 # European Convention on Human Rights
│   │       ├── eu_directives/        # EU directives
│   │       └── case_law/             # HR, LB, TR decisions
│   ├── crypto/
│   │   ├── key_exchange.py           # RSA-4096 key exchange
│   │   └── zk_proofs.py              # Zero-knowledge proof generation
│   ├── document_gen/
│   │   ├── templates/                # Jinja2 legal templates
│   │   │   ├── appeal.j2             # Appeal template
│   │   │   ├── complaint.j2          # Complaint template
│   │   │   └── motion.j2             # Motion template
│   │   ├── generator.py              # Document generation logic
│   │   └── pdf_signer.py             # Digital signature
│   └── requirements.txt
├── legal-data/                        # Legal knowledge base
│   ├── laws/
│   │   ├── straffeprosessloven.json  # Criminal Procedure Act
│   │   ├── politiloven.json          # Police Act
│   │   ├── straffeloven.json         # Penal Code
│   │   └── tvisteloven.json          # Dispute Act
│   ├── case-law/
│   │   ├── høyesterett/              # Supreme Court decisions
│   │   ├── lagmannsrett/             # Appeals Court decisions
│   │   └── tingrett/                 # District Court decisions
│   ├── echr/                         # ECHR case law
│   └── gdpr/                         # GDPR documentation
├── docs/
│   ├── architecture.md               # System architecture
│   ├── security.md                   # Security implementation
│   ├── encryption.md                 # Encryption details
│   └── ai-agents.md                  # AI agent design
├── .github/
│   └── copilot-instructions.md       # AI coding agent instructions
├── docker-compose.yml                # Local development setup
└── README.md                         # Project overview
```

---

## 🚀 Kom i gang

### Forutsetninger
- Node.js 18+ (frontend)
- Python 3.11+ (backend)
- PostgreSQL 15+ (database)
- Redis (cache)
- API-nøkler: OpenAI, Anthropic, Google AI

### Installasjon

```bash
# Clone repository
git clone https://github.com/your-org/rettbot-plus.git
cd rettbot-plus

# Frontend setup
cd frontend
npm install
npm run dev

# Backend setup (i ny terminal)
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# Start database (i ny terminal)
docker-compose up postgres redis
```

### Miljøvariabler

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:8000
VITE_ENABLE_DEBUG=false
```

**Backend (.env)**
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/rettbot
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key
PINECONE_API_KEY=your_pinecone_key
```

---

## 🔐 Sikkerhetsprinsipper

### For Utviklere
1. **Aldri logg sensitiv data** - Bruk alltid `Logger.safe()`
2. **Alltid krypter før lagring** - Ingen klartekst i IndexedDB eller server
3. **Valider all input** - Både klient og server-side
4. **Minimal metadata** - Ikke lagre identifiserende informasjon
5. **Audit all tilgang** - Logg hvem som så hva og når
6. **Test kryptering** - Verifiser at zero-knowledge faktisk fungerer
7. **Secure delete** - Overskrive sensitiv data i minnet

### Kryptografi-regler
- Master Key: Argon2id (memory=64MB, iterations=3, parallelism=4)
- Data Encryption: AES-256-GCM (96-bit nonce, 128-bit tag)
- Key Exchange: RSA-4096 (OAEP padding, SHA-256)
- Hashing: SHA-512 for integrity checks
- Random: Crypto.getRandomValues() for all random data

---

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm run test              # Unit tests
npm run test:e2e          # E2E tests (Playwright)
npm run test:security     # Security tests

# Backend tests
cd backend
pytest tests/             # All tests
pytest tests/security/    # Security tests
pytest tests/ai/          # AI accuracy tests
pytest tests/legal/       # Legal citation validation
```

---

## 📜 Juridisk Ansvarsfraskrivelse

**RettBot+** er et informasjonsverktøy og erstatter IKKE juridisk rådgivning fra en autorisert advokat. AI-genererte råd og dokumenter skal alltid gjennomgås av en menneskelig advokat før bruk i rettslige sammenhenger. Brukere oppmuntres til å konsultere profesjonell juridisk hjelp for kritiske saker.

---

## 📄 Lisens

[Velg lisens - forslag: AGPL-3.0 for å sikre at forbedringer forblir open source]

---

## 🤝 Bidra

Vi ønsker bidrag som forbedrer:
- Juridisk nøyaktighet og dybde
- Sikkerhet og personvern
- AI-agentenes strategiske kapasitet
- Brukervennlighet i krisesituasjoner

Se [CONTRIBUTING.md](CONTRIBUTING.md) for detaljer.

---

## 🆘 Support

- **Sikkerhetsproblemer**: security@rettbot.no (PGP-nøkkel: [fingerprint])
- **Generell support**: support@rettbot.no
- **Dokumentasjon**: https://docs.rettbot.no

---

**Bygget med ❤️ for rettferdighet og personvern**