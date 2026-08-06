# Architecture Overview

## System Architecture

RettBot+ is built as a **Progressive Web App (PWA)** with a **zero-knowledge backend**. The system is designed for maximum privacy, offline capability, and elite-level legal intelligence.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser (PWA)                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              React Frontend (TypeScript)                  │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │  Emergency  │  │   Research   │  │  Case Building  │  │  │
│  │  │    Mode     │  │   & Strategy │  │   & Evidence    │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │ AI Assistant│  │    Secure    │  │   Legal DB UI   │  │  │
│  │  │   (Chat)    │  │   Sharing    │  │   (Search)      │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                 Crypto Layer (Client-Side)                │  │
│  │   • AES-256-GCM Encryption/Decryption                    │  │
│  │   • Argon2id Key Derivation                              │  │
│  │   • RSA-4096 Key Exchange                                │  │
│  │   • Secure Memory Management                             │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │            Local Storage (Encrypted)                      │  │
│  │   • IndexedDB (encrypted case data, evidence)            │  │
│  │   • Service Worker Cache (public legal info)             │  │
│  │   • LocalStorage (keys, preferences - encrypted)         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    HTTPS (TLS 1.3)
                    Tor/VPN Compatible
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Server (Python)                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  FastAPI REST API                         │  │
│  │   • /auth/* - Zero-knowledge authentication              │  │
│  │   • /storage/* - Encrypted blob storage/retrieval        │  │
│  │   • /sharing/* - Secure share management                 │  │
│  │   • /ai/* - AI orchestration endpoints                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              AI Engine (Multi-Agent System)               │  │
│  │   ┌────────────┐  ┌────────────┐  ┌────────────────┐     │  │
│  │   │  Research  │  │  Defense   │  │   Drafting     │     │  │
│  │   │   Agent    │  │   Agent    │  │    Agent       │     │  │
│  │   │ (GPT-4)    │  │ (Claude)   │  │  (Gemini)      │     │  │
│  │   └────────────┘  └────────────┘  └────────────────┘     │  │
│  │   ┌────────────────────────────────────────────────┐     │  │
│  │   │       Adversarial Agent (Simulation)           │     │  │
│  │   └────────────────────────────────────────────────┘     │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │            Legal Knowledge Base (RAG System)              │  │
│  │   ┌──────────────────────────────────────────────┐        │  │
│  │   │  LlamaIndex + Pinecone (Vector Search)       │        │  │
│  │   │   • Norwegian Law (Straffeprosessloven, etc) │        │  │
│  │   │   • ECHR Case Law                            │        │  │
│  │   │   • EU Directives                            │        │  │
│  │   │   • Legal Precedents (HR, LB, TR)            │        │  │
│  │   └──────────────────────────────────────────────┘        │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Data Storage                           │  │
│  │   • PostgreSQL (encrypted blobs, metadata)               │  │
│  │   • Redis (cache, session management)                    │  │
│  │   • S3/Minio (optional: large file storage)              │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend (PWA)

**Technology**: React 18+ with TypeScript, Vite build tool

**Key Modules**:
- **Crypto Layer**: All encryption/decryption happens here
- **Offline Manager**: Service worker + IndexedDB for offline-first
- **Feature Modules**: Emergency, Research, Case, AI, Sharing, Legal DB
- **State Management**: Zustand + React Query for server state

**Data Flow**:
```
User Input → Encrypt → IndexedDB (local)
                    ↓
                Send to Server (encrypted blob)
                    ↓
            Server stores (no decryption)
```

### 2. Backend (Zero-Knowledge)

**Technology**: Python 3.11+, FastAPI, async/await

**Key Principles**:
- Server **never** decrypts user data
- All user data stored as encrypted blobs
- Server only handles: auth, blob storage, AI orchestration, sharing coordination

**API Endpoints**:
```
POST   /auth/register         - Register new user (zero-knowledge)
POST   /auth/login            - Login (zero-knowledge proof)
POST   /auth/refresh          - Refresh session token

POST   /storage/upload        - Upload encrypted blob
GET    /storage/download/:id  - Download encrypted blob
DELETE /storage/delete/:id    - Delete blob

POST   /sharing/create        - Create secure share
GET    /sharing/access/:id    - Access shared case (if permitted)
POST   /sharing/revoke/:id    - Revoke share access

POST   /ai/research           - Legal research query
POST   /ai/strategy           - Defense strategy generation
POST   /ai/analyze            - Document analysis
POST   /ai/draft              - Legal document drafting
POST   /ai/chat               - Conversational AI
```

### 3. AI Engine (Multi-Agent)

**Architecture**: Specialized AI agents for different legal tasks

**Agents**:

1. **Research Agent** (GPT-4-turbo)
   - Deep legal research
   - Precedent analysis
   - Multi-source search coordination
   - Citation generation

2. **Defense Agent** (Claude 3 Opus)
   - Defense strategy formulation
   - Weakness analysis
   - Counter-argument generation
   - Risk assessment

3. **Drafting Agent** (Gemini Pro)
   - Legal document generation
   - Professional formatting
   - Citation integration
   - Template customization

4. **Adversarial Agent** (GPT-4)
   - Simulates prosecution arguments
   - Identifies case weaknesses
   - Prepares counter-strategies
   - Cross-examination simulation

**Agent Coordination**:
```python
# Multi-agent workflow example
async def analyze_case(case_data: str) -> CaseAnalysis:
    # Research Agent: Find relevant laws and precedents
    research = await research_agent.analyze(case_data)
    
    # Adversarial Agent: Simulate prosecution
    prosecution_args = await adversarial_agent.build_case(case_data)
    
    # Defense Agent: Build defense strategy
    defense_strategy = await defense_agent.counter(
        case_data, research, prosecution_args
    )
    
    # Drafting Agent: Generate documents
    documents = await drafting_agent.create_documents(
        defense_strategy, research
    )
    
    return CaseAnalysis(
        research=research,
        prosecution=prosecution_args,
        defense=defense_strategy,
        documents=documents
    )
```

### 4. Legal Knowledge Base (RAG)

**Technology**: LlamaIndex + Pinecone/Weaviate

**Content**:
- Norwegian Laws (Straffeprosessloven, Politiloven, Straffeloven, etc.)
- ECHR Case Law (European Court of Human Rights)
- EU Directives (GDPR, etc.)
- Norwegian Case Law (Høyesterett, Lagmannsrett, Tingrett)
- Legal Templates and Forms

**RAG Pipeline**:
```python
# Retrieval-Augmented Generation flow
async def legal_research(query: str) -> ResearchResult:
    # 1. Embed query
    query_embedding = await embed_text(query)
    
    # 2. Vector search for relevant laws/cases
    relevant_docs = await vector_db.search(
        query_embedding,
        top_k=20,
        filters={'source': ['norwegian_law', 'echr', 'case_law']}
    )
    
    # 3. Re-rank by relevance
    reranked = await reranker.rerank(query, relevant_docs)
    
    # 4. Generate response with citations
    response = await llm.generate(
        prompt=f"Based on these laws: {reranked}\n\nAnswer: {query}",
        model="gpt-4-turbo"
    )
    
    return ResearchResult(
        answer=response,
        sources=reranked,
        confidence=calculate_confidence(reranked)
    )
```

## Data Flow Diagrams

### Emergency Mode Activation

```
User presses panic button
    ↓
1. Lock UI (require re-auth)
2. Switch to stealth mode (disguised screen)
3. Start encrypted audio/video recording
4. Load offline legal rights info from cache
5. Display step-by-step instructions
6. (Optional) Send encrypted alert to emergency contacts
```

### Case Building & Evidence Upload

```
User uploads photo/video/document
    ↓
1. Client: Extract metadata (timestamp, location, device)
2. Client: Calculate SHA-512 hash (proof of original)
3. Client: Encrypt file with AES-256-GCM
4. Client: Create chain-of-custody entry
5. Client: Store in IndexedDB (offline-first)
6. Background: Sync to server when online
    ↓
7. Server: Store encrypted blob
8. Server: Return storage confirmation
    ↓
9. Client: Update UI with upload success
10. Client: Add to case timeline
```

### Secure Sharing Flow

```
User initiates share with attorney
    ↓
1. Client: Generate random share key (AES-256)
2. Client: Re-encrypt case data with share key
3. Client: Fetch recipient's public key (RSA-4096)
4. Client: Encrypt share key with recipient's public key
5. Client: Set permissions (view, download, edit)
6. Client: Set expiry (e.g., 7 days)
7. Client: Send package to server
    ↓
8. Server: Store encrypted share package
9. Server: Generate share link
10. Server: (Optional) Send notification to recipient
    ↓
11. Recipient: Access share link
12. Server: Verify recipient identity
13. Server: Check permissions and expiry
14. Server: Send encrypted package
    ↓
15. Recipient Client: Decrypt share key with private key
16. Recipient Client: Decrypt case data with share key
17. Recipient Client: Display case (read-only or editable)
```

### AI Legal Research Flow

```
User asks legal question
    ↓
1. Client: Encrypt query
2. Client: Send to /ai/research endpoint
    ↓
3. Server: Receive encrypted query
4. Server: Decrypt with AI processing key (ephemeral)
5. Server: Embed query (vector representation)
6. Server: Search legal knowledge base (RAG)
    ↓
7. Vector DB: Return top 20 relevant law sections
8. Server: Re-rank by relevance
9. Server: Build prompt with context
10. Server: Call Research Agent (GPT-4)
    ↓
11. GPT-4: Generate answer with citations
12. Server: Validate citations (ensure real laws)
13. Server: Calculate confidence score
14. Server: Encrypt response
    ↓
15. Client: Decrypt response
16. Client: Display answer with sources
17. Client: Save to encrypted chat history
```

## Scalability Considerations

### Horizontal Scaling

- **Stateless Backend**: All session data in Redis, allows multiple servers
- **Load Balancing**: Nginx/Cloudflare in front of FastAPI servers
- **Database**: PostgreSQL with read replicas for scalability
- **AI**: Queue-based system for expensive AI operations (Celery + Redis)

### Caching Strategy

- **CDN**: Static PWA assets (React bundle, images)
- **Redis**: Session tokens, frequent queries, AI responses
- **Client**: Service Worker cache for offline capability

### Performance Targets

- **PWA Load**: < 2s on 3G, < 1s on 4G/WiFi
- **Encryption**: < 100ms for typical case data
- **API Response**: < 200ms for simple queries
- **AI Response**: < 5s for research, < 10s for strategy
- **Offline Sync**: Background, non-blocking

## Deployment Architecture

### Production Environment

```
Cloudflare (CDN + DDoS Protection)
    ↓
Nginx (Load Balancer, TLS Termination)
    ↓
    ├─ FastAPI Server 1 (Docker)
    ├─ FastAPI Server 2 (Docker)
    └─ FastAPI Server N (Docker)
         ↓
    ├─ PostgreSQL (Primary + Replicas)
    ├─ Redis (Cluster)
    └─ Pinecone/Weaviate (Vector DB)
```

### CI/CD Pipeline

```
GitHub Repo
    ↓
GitHub Actions (CI)
    ├─ Run tests (unit, integration, security)
    ├─ Build Docker images
    ├─ Scan for vulnerabilities
    └─ Push to registry
         ↓
ArgoCD / Kubernetes (CD)
    ├─ Rolling updates (zero downtime)
    ├─ Health checks
    └─ Rollback on failure
```

## Monitoring & Observability

### Metrics
- **Performance**: Response times, error rates, throughput
- **Security**: Failed auth attempts, unusual access patterns
- **Usage**: Feature adoption, AI query patterns (anonymized)
- **Infrastructure**: CPU, memory, disk, network

### Alerting
- High error rate → Page on-call engineer
- Security anomaly → Immediate investigation
- Service down → Auto-restart + alert

### Privacy-Preserving Analytics
- No user identification
- No query content logging
- Aggregate metrics only
- Differential privacy where applicable

## Disaster Recovery

### Backup Strategy
- **User Data**: Encrypted client-side backups (user-controlled)
- **Server Metadata**: Daily PostgreSQL backups (encrypted)
- **Legal Database**: Weekly full backups, daily incrementals

### Recovery Scenarios
1. **Server Compromise**: Users unaffected (zero-knowledge)
2. **Database Loss**: Restore from backup + user local copies
3. **Key Loss**: User must re-enter password (no recovery possible by design)

## Future Enhancements

1. **Decentralized Storage**: IPFS/Arweave for censorship resistance
2. **Blockchain Evidence**: Immutable evidence timestamping
3. **P2P Sharing**: Direct encrypted sharing without server
4. **Hardware Security**: WebAuthn, Yubikey support
5. **Multi-Party Computation**: Shared case analysis without revealing data
