# Contributing to RettBot+

Thank you for your interest in contributing to RettBot+! This project aims to provide world-class legal defense capabilities while maintaining the highest standards of privacy and security.

## Code of Conduct

### Our Commitment
- **Privacy First**: Never compromise user privacy
- **Legal Accuracy**: Verify all legal information
- **Open Source**: Share improvements with the community
- **Ethical Use**: Designed for legitimate legal defense only

## How to Contribute

### Areas We Need Help

1. **Legal Knowledge**
   - Norwegian law updates and corrections
   - ECHR case law integration
   - Legal document templates
   - Precedent analysis

2. **Security & Privacy**
   - Cryptography improvements
   - Security audits
   - Privacy enhancements
   - Penetration testing

3. **AI & ML**
   - Prompt engineering for better legal analysis
   - Model fine-tuning on Norwegian legal corpus
   - RAG system improvements
   - Citation verification

4. **Frontend Development**
   - PWA enhancements
   - Offline capabilities
   - Emergency mode UX
   - Accessibility improvements

5. **Backend Development**
   - API performance
   - Database optimization
   - AI orchestration
   - Zero-knowledge architecture

6. **Documentation**
   - User guides
   - Developer documentation
   - Legal accuracy verification
   - Translation (Norwegian Bokmål/Nynorsk)

## Getting Started

### 1. Fork and Clone

```bash
git clone https://github.com/your-username/rettbot-plus.git
cd rettbot-plus
```

### 2. Set Up Development Environment

**Frontend**:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

**Backend**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Development dependencies
cp .env.example .env
uvicorn main:app --reload
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

## Development Guidelines

### Code Style

**Python**:
- Follow PEP 8
- Use type hints
- Docstrings for all public functions
- Run `black` and `isort` before committing

```bash
black .
isort .
pylint backend/
```

**TypeScript/React**:
- Follow Airbnb style guide
- Use functional components with hooks
- Prefer const over let
- Run Prettier and ESLint

```bash
npm run format
npm run lint
```

### Security Guidelines

#### Never Log Sensitive Data

```python
# ❌ BAD
logger.info(f"User {user_id} searched for: {query}")

# ✅ GOOD
logger.info(f"User performed search", extra={"user_id": hash(user_id)})
```

#### Always Encrypt Before Storage

```typescript
// ❌ BAD
await indexedDB.put('cases', caseData);

// ✅ GOOD
const encrypted = await CryptoService.encrypt(caseData, masterKey);
await indexedDB.put('cases', encrypted);
```

#### Validate All Input

```python
# ❌ BAD
def search_law(query: str):
    results = db.execute(f"SELECT * FROM laws WHERE text LIKE '{query}'")

# ✅ GOOD
def search_law(query: str):
    validate_input(query)  # Check for SQL injection, XSS, etc.
    results = db.execute("SELECT * FROM laws WHERE text LIKE ?", (query,))
```

### Legal Accuracy Requirements

#### Always Verify Citations

```python
# When adding legal content, verify citations
async def add_legal_precedent(case: LegalCase):
    # Verify case actually exists
    verified = await legal_db.verify_case(
        court=case.court,
        case_number=case.case_number,
        date=case.date
    )
    
    if not verified:
        raise ValueError(f"Cannot verify case: {case}")
    
    await db.add_precedent(case)
```

#### Never Invent Laws

```python
# ❌ BAD - Making up section numbers
"Under Straffeprosessloven § 999, you have the right to..."

# ✅ GOOD - Real, verified sections
"Under Straffeprosessloven § 197 (Search of persons and premises), you have..."
```

#### Cite Sources

```python
# When generating AI responses, always include sources
response = await llm.generate(prompt)

# Verify and add citations
response_with_citations = await add_verified_citations(response)

# Include confidence score
return LegalResponse(
    answer=response_with_citations,
    sources=[...],
    confidence=calculate_confidence(response),
    disclaimer="This is legal information, not legal advice."
)
```

### Testing Requirements

#### All Code Must Have Tests

**Python**:
```python
# test_research_agent.py
import pytest
from agents.research_agent import ResearchAgent

@pytest.mark.asyncio
async def test_research_agent_citations():
    """Verify research agent only cites real laws"""
    agent = ResearchAgent()
    
    result = await agent.research("Can police search my phone?")
    
    # Verify all citations are real
    for citation in result.citations:
        assert await legal_db.verify_citation(citation)

@pytest.mark.asyncio
async def test_research_agent_confidence():
    """Verify confidence scoring is accurate"""
    agent = ResearchAgent()
    
    # Strong precedent case
    result1 = await agent.research("Well-established law question")
    assert result1.confidence > 0.8
    
    # Ambiguous case
    result2 = await agent.research("Novel legal question")
    assert result2.confidence < 0.6
```

**TypeScript**:
```typescript
// CryptoService.test.ts
import { CryptoService } from './CryptoService';

describe('CryptoService', () => {
  it('should encrypt and decrypt correctly', async () => {
    const plaintext = 'sensitive case data';
    const key = await CryptoService.generateKey();
    
    const encrypted = await CryptoService.encrypt(plaintext, key);
    const decrypted = await CryptoService.decrypt(encrypted, key);
    
    expect(decrypted).toBe(plaintext);
  });
  
  it('should fail with wrong key', async () => {
    const plaintext = 'sensitive case data';
    const key1 = await CryptoService.generateKey();
    const key2 = await CryptoService.generateKey();
    
    const encrypted = await CryptoService.encrypt(plaintext, key1);
    
    await expect(
      CryptoService.decrypt(encrypted, key2)
    ).rejects.toThrow();
  });
});
```

#### Run Tests Before Committing

```bash
# Frontend
npm run test
npm run test:e2e

# Backend
pytest tests/
pytest tests/security/  # Security tests must pass
pytest tests/legal/     # Legal accuracy tests must pass
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add emergency mode voice activation
fix: Resolve encryption key rotation bug
docs: Update security architecture documentation
test: Add tests for chain of custody verification
security: Patch XSS vulnerability in search
legal: Update Straffeprosessloven § 197 interpretation
```

## Pull Request Process

### 1. Update Documentation

If your change affects:
- **Architecture**: Update `docs/architecture.md`
- **Security**: Update `docs/security.md`
- **AI Agents**: Update `docs/ai-agents.md`
- **User-facing features**: Update `README.md`

### 2. Write Tests

- Unit tests for all new functions
- Integration tests for new features
- Security tests for security-related changes
- Legal accuracy tests for legal content

### 3. Run Security Checks

```bash
# Frontend
npm audit
npm run security-scan

# Backend
safety check
bandit -r backend/
```

### 4. Submit Pull Request

**Title**: Clear, concise description

**Description**:
```markdown
## What does this PR do?
Brief description of the change

## Why is this change needed?
Explain the problem being solved

## How was this tested?
Describe your testing process

## Legal Accuracy Verification
If applicable, how did you verify legal accuracy?

## Security Considerations
Any security implications?

## Screenshots
If UI change, include screenshots

## Checklist
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] Security review completed
- [ ] Legal accuracy verified (if applicable)
- [ ] No sensitive data logged
- [ ] Encryption used for all sensitive data
```

### 5. Code Review

- At least one maintainer must approve
- All CI checks must pass
- Security review required for security changes
- Legal review required for legal content changes

## Legal Content Contributions

### Sources We Accept

✅ **Accepted Sources**:
- Official Norwegian law texts (Lovdata)
- Published court decisions (Høyesterett, Lagmannsrett, Tingrett)
- ECHR case law
- EU directives and regulations
- Legal scholarship from recognized sources

❌ **Not Accepted**:
- Unverified internet sources
- Personal legal opinions without citations
- Outdated legal information
- Legal advice (we provide information, not advice)

### Legal Content Format

```json
{
  "law": {
    "name": "Straffeprosessloven",
    "section": "197",
    "title": "Ransaking av person og rom",
    "text": "Official Norwegian text...",
    "source": "https://lovdata.no/...",
    "last_updated": "2024-01-15",
    "verified_by": "contributor_name",
    "verification_date": "2024-10-14"
  }
}
```

## Security Contributions

### Responsible Disclosure

If you find a security vulnerability:

1. **DO NOT** open a public issue
2. Email security@rettbot.no with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

3. We will respond within 48 hours
4. We will credit you in security advisories (if desired)

### Security Bounty

We appreciate security research! While we don't currently have a formal bug bounty program, we will:
- Credit security researchers
- Fast-track security fixes
- Consider sponsorship/donations for significant findings

## Community

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas, general discussion
- **Email**: support@rettbot.no (general), security@rettbot.no (security)

### Getting Help

- Check existing issues and discussions first
- Provide detailed information when asking questions
- Be respectful and professional

## Recognition

Contributors will be:
- Listed in `CONTRIBUTORS.md`
- Credited in release notes
- Acknowledged in the application (if desired)

## License

By contributing, you agree that your contributions will be licensed under the AGPL-3.0 license.

---

**Thank you for helping make legal defense accessible to everyone!** 🙏
