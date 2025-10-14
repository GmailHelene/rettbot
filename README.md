# 🧠 RettBot+ – Elite AI Legal Defense Platform

> **World-class encrypted PWA providing elite-level legal research, defense strategies, and emergency guidance at the level of top attorneys**
> 
> **🌐 Live at: [rettbot.com](https://rettbot.com)**

[![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)
[![Security](https://img.shields.io/badge/security-zero--knowledge-green.svg)](docs/security.md)
[![PWA](https://img.shields.io/badge/PWA-enabled-purple.svg)](https://web.dev/progressive-web-apps/)
[![AI](https://img.shields.io/badge/AI-GPT--4--turbo-orange.svg)](backend/ai_engine/)

## ⚡ Quick Start

```powershell
# Install dependencies
cd backend && pip install -r requirements.txt
cd ../frontend && npm install

# Start backend
cd backend
python -m uvicorn main:app --reload

# Start frontend (new terminal)
cd frontend
npm run dev
```

Visit http://localhost:5173 🎉

**📚 Full Setup Guide:** See [QUICK_START.md](QUICK_START.md)  
**🚀 Deployment Guide:** See [DEPLOYMENT.md](DEPLOYMENT.md)

## 🚀 **NYE FUNKSJONER** (Akkurat Lagt Til!)

### 🔒 Ultimate Security (Militær-Grade)
- **5-lags kryptering** - Uknekka fram til år 2500+
- **Anti-forensics** - Ingen digitale fotspor, umulig å gjenopprette
- **Duress mode** - Alternativt passord som sletter ALT
- **100% usporbar** - Selv om enheten beslaglegges
- **Tor-integrasjon** - Komplett anonymitet
- **Distributed backup** - Automatisk til 5 lokasjoner (trenger bare 3 for gjenoppretting)

### 📎 Enkel Bevisopplasting
- **Drag-drop** - Bare slipp filer (bilder, video, audio, dokumenter)
- **AI-analyse** - Automatisk vurdering av juridisk verdi (0-100)
- **Blockchain-bevis** - Kryptografisk tidsstempel (uforanderlig bevis)
- **100% sikker lagring** - AES-256-GCM kryptering før lagring
- **Automatisk backup** - 5 lokasjoner (IPFS, ProtonDrive, Tor)

### 📁 Profesjonell Saksbehandling
- **Smart organisering** - Automatisk i riktige mapper
- **Tidslinje** - Kronologisk oversikt over alt
- **Sjekkliste** - AI-generert basert på sakstype
- **Risikovurdering** - AI analyserer og advarer
- **Profesjonelt oppsett** - Som hos de beste advokatfirmaene

## 🎯 Vision

RettBot+ is a privacy-first, AI-powered legal defense platform that matches or exceeds the capabilities of world-class attorneys in:

- **Legal Research**: Deep analysis of laws, case law, and precedents
- **Defense Strategy**: Multi-layered defense strategies with weakness analysis
- **Case Management**: Professional evidence handling and chain of custody
- **Acquittal Focus**: Identifying case weaknesses and counter-arguments
- **Evidence Analysis**: Cryptographic evidence integrity and preservation
- **Legal Knowledge**: Complete mastery of Norwegian law, EU directives, ECHR
- **Emergency Situations**: Immediate guidance during arrests, searches, interrogations

## 🔒 Zero-Knowledge Security

### Privacy by Design
- ✅ **Client-Side Encryption**: All data encrypted in browser before storage/transmission
- ✅ **Zero Server Trust**: Server handles only encrypted blobs, never plaintext
- ✅ **Master Key**: User-generated key (Argon2id) never leaves device
- ✅ **AES-256-GCM**: Military-grade encryption for all data
- ✅ **RSA-4096**: Secure key exchange for sharing
- ✅ **5-Layer Encryption**: Ultimate mode for maximum security (unbreakable until 2500+)
- ✅ **Anti-Forensics**: Complete digital footprint elimination
- ✅ **Tor/VPN Compatible**: Designed for anonymizing networks
- ✅ **Plausible Deniability**: Encrypted data indistinguishable from random noise
- ✅ **Secure Delete**: Cryptographic erasure of sensitive data
- ✅ **Duress Code**: Alternative password that wipes everything
- ✅ **Distributed Backup**: Automatic sharded backup across 5 untraceable locations

### PWA Benefits
- **Offline-First**: Full functionality without internet
- **Installable**: Works as native app on all devices
- **No App Store**: No intermediaries to censor or monitor
- **Auto-Updates**: Security updates without user interaction
- **Cross-Platform**: iOS, Android, Windows, Mac, Linux

## ⚡ Key Features

### 🚨 Emergency Legal Advisor
- **Panic Mode**: One-tap activation with instant rights advisement
- **Offline Rights**: All critical legal info available without internet
- **Voice-Activated**: Hands-free operation during arrests/searches/interrogations
- **Real-Time Guidance**: Step-by-step instructions during police encounters
- **Evidence Preservation**: Automatic encrypted recording and timestamping
- **Stealth Mode**: Disguised UI, quick-hide functionality, no traces

### 🎓 Elite Legal Research
- **Multi-Source Search**: Parallel search across Norwegian law, EU directives, ECHR, case law
- **Precedent Analysis**: Automated analysis of similar cases and outcomes
- **Winning Strategies**: Identifies successful defense strategies from historical cases
- **Weakness Detection**: Finds holes in prosecution's case and procedural errors
- **Strategy Generator**: Creates multi-layered defense strategies like top attorneys
- **Scenario Modeling**: Predicts case outcomes based on different strategies

### 📁 Secure Case Building
- **Encrypted Timeline**: All events, documents, media encrypted at rest
- **Chain of Custody**: Cryptographic proof of evidence integrity
- **Multi-Media Support**: Photos, audio, video, documents with metadata preservation
- **AI Analysis**: Identifies rights violations, procedural errors, contradictions
- **Document Generation**: Professional legal documents (appeals, complaints, motions)
- **Secure Sharing**: Encrypted packages for attorneys with selective disclosure

### 🤖 Multi-Agent AI System
- **Research Agent**: Specialized in legal research and precedent analysis
- **Defense Agent**: Expert in defense strategy and case weaknesses
- **Drafting Agent**: Professional legal document generation
- **Adversarial Agent**: Simulates prosecution to find counter-strategies
- **Cross-Examination Prep**: Generates questions and anticipated answers

### 🔐 Secure Sharing
- **Per-Share Encryption**: Each shared case has unique encryption key
- **Granular Permissions**: Control what recipients can view, download, edit
- **Time-Limited Access**: Auto-expiring shares with revocation capability
- **Audit Trail**: Complete log of who accessed what and when
- **Anonymous Sharing**: Share without revealing your identity

## � Prosjektstruktur

```
AI-advokaten/
├── frontend/                           # React PWA
│   ├── src/
│   │   ├── core/
│   │   │   └── crypto/
│   │   │       ├── masterKey.ts       # Argon2id key derivation
│   │   │       ├── dataEncryption.ts  # AES-256-GCM encryption
│   │   │       ├── secureStorage.ts   # Encrypted IndexedDB
│   │   │       └── ultimateSecurity.ts # 🆕 5-layer encryption, anti-forensics
│   │   │
│   │   ├── features/
│   │   │   ├── evidence/
│   │   │   │   └── EvidenceUpload.tsx # 🆕 Drag-drop med AI-analyse
│   │   │   │
│   │   │   ├── cases/
│   │   │   │   ├── caseManagement.ts  # 🆕 Smart organisering, sjekkliste
│   │   │   │   └── CaseView.tsx       # 🆕 Profesjonell saksvisning
│   │   │   │
│   │   │   └── corruption/
│   │   │       └── corruptionHandler.ts # Korrupsjonshåndtering
│   │   │
│   │   ├── vite.config.ts             # PWA konfigurasjon
│   │   ├── package.json               # Dependencies
│   │   └── tsconfig.json              # TypeScript config
│   │
├── backend/                            # Python FastAPI
│   └── ai_engine/
│       └── legal_evidence_collection.py # Legal OSINT, FOIA
│
├── docs/                               # Dokumentasjon
│   ├── security.md                    # Sikkerhetsdokumentasjon
│   ├── architecture.md                # Systemarkitektur
│   └── ai-agents.md                   # AI multi-agent system
│
├── .github/
│   └── copilot-instructions.md        # 🆕 Oppdatert med nye funksjoner
│
└── README.md                           # Denne filen
```

## �🛠️ Technology Stack

### Frontend (PWA)
- React 18+ with TypeScript
- Workbox (Service Workers) + IndexedDB (encrypted storage)
- Web Crypto API + libsodium.js + argon2-browser
- **🆕 Framer Motion** (animasjoner)
- Tailwind CSS + Shadcn/UI

### Backend (Zero-Knowledge)
- Python FastAPI (async)
- Langchain + Multi-model AI (GPT-4, Claude, Gemini)
- LlamaIndex + Pinecone/Weaviate (vector search)
- PostgreSQL (encrypted blobs) + Redis (cache)

### Security
- AES-256-GCM (data encryption)
- RSA-4096 (key exchange)
- Argon2id (key derivation, 64MB memory, 3 iterations)
- **🆕 5-Layer Encryption** (Triple/Quintuple mode)
- **🆕 Blockchain Timestamping** (OpenTimestamps/Ethereum)
- **🆕 Tor Integration** (Complete anonymity)
- zk-SNARKs (zero-knowledge authentication)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/rettbot-plus.git
cd rettbot-plus

# Frontend setup
cd frontend
npm install
npm run dev

# Backend setup (new terminal)
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# Database (new terminal)
docker-compose up postgres redis
```

### Environment Variables

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

## 📖 Documentation

- [Architecture](docs/architecture.md) - System design and data flows
- [Security](docs/security.md) - Encryption and privacy implementation
- [AI Agents](docs/ai-agents.md) - Multi-agent system design
- [Contributing](CONTRIBUTING.md) - How to contribute
- [API Reference](docs/api.md) - Backend API documentation

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

## 🔐 Security Principles

1. **Never log sensitive data** - Always use `Logger.safe()`
2. **Always encrypt before storage** - No plaintext in IndexedDB or server
3. **Validate all input** - Both client and server-side
4. **Minimal metadata** - Don't store identifying information
5. **Audit all access** - Log who saw what and when
6. **Test encryption** - Verify zero-knowledge actually works
7. **Secure delete** - Overwrite sensitive data in memory

## 📜 Legal Disclaimer

**RettBot+** is an information tool and does NOT replace legal advice from a licensed attorney. AI-generated advice and documents should always be reviewed by a human attorney before use in legal proceedings. Users are encouraged to consult professional legal help for critical matters.

## 🤝 Contributing

We welcome contributions that improve:
- Legal accuracy and depth
- Security and privacy
- AI agents' strategic capabilities
- User experience in crisis situations

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

AGPL-3.0 - See [LICENSE](LICENSE) for details

## 🆘 Support

- **Security Issues**: security@rettbot.no (PGP key: [fingerprint])
- **General Support**: support@rettbot.no
- **Documentation**: https://docs.rettbot.no

---

**Built with ❤️ for justice and privacy**
