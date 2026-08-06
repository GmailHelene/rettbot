# Security Architecture

## Overview

> ⚠️ **Implementeringsstatus (viktig):** Dette dokumentet beskriver **mål-arkitekturen** for RettBot+.
> Den nåværende implementasjonen bruker **server-side kryptering** (Fernet), IKKE zero-knowledge
> klient-side kryptering. Serveren *kan* i dag lese saksdata i klartekst. Klient-side zero-knowledge,
> distribuert backup, panic/duress-modus og deling er **ikke implementert ennå**. Ikke behandle ekte,
> sensitive persondata i produksjon før personvern- og krypteringsstatus er endelig avklart.

RettBot+ **aims to implement** a zero-knowledge architecture where the server has no access to user
data in plaintext, with all encryption and decryption happening client-side in the user's browser.
**This target is not yet implemented** — today encryption is performed server-side.

## Threat Model

### Adversaries
1. **Malicious Server Operator**: Server admin tries to access user data
2. **Network Eavesdropper**: Attacker intercepts network traffic
3. **Device Seizure**: Police/adversary gains physical access to user's device
4. **Compromised Recipient**: Shared case data recipient becomes adversarial
5. **State-Level Surveillance**: Mass surveillance programs

### Protection Goals
- **Confidentiality**: Only user can read their data
- **Integrity**: Detect tampering with evidence
- **Availability**: Data accessible offline
- **Deniability**: Encrypted data looks like random noise
- **Untraceability**: Connections cannot be linked to identity

## Encryption Architecture

### Key Hierarchy

```
User Password
    │
    ├─> [Argon2id] ───> Master Key (256-bit)
    │                        │
    │                        ├─> Data Encryption Key (DEK) - AES-256
    │                        ├─> Sharing Key Pair (RSA-4096)
    │                        └─> Authentication Key
    │
    └─> [Duress Password] ──> Wipe Trigger (destroys all keys)
```

### Master Key Derivation

```typescript
// Argon2id parameters
const masterKey = argon2id.hash({
  password: userPassword,
  salt: deviceUniqueSalt, // Generated once, stored in localStorage
  memory: 64 * 1024,      // 64 MB
  iterations: 3,
  parallelism: 4,
  hashLength: 32          // 256 bits
});
```

### Data Encryption (AES-256-GCM)

```typescript
async function encryptData(plaintext: Uint8Array, masterKey: Uint8Array) {
  // Generate random 96-bit nonce
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  
  // Import master key
  const key = await crypto.subtle.importKey(
    'raw',
    masterKey,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  // Encrypt with authenticated encryption
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
      tagLength: 128 // 128-bit authentication tag
    },
    key,
    plaintext
  );
  
  // Return nonce || ciphertext || tag
  return concatenate(nonce, ciphertext);
}
```

### Secure Sharing (RSA-4096)

When sharing a case with someone:

1. **Generate Per-Share Key**: Random 256-bit AES key
2. **Re-encrypt Case**: Encrypt case data with share key
3. **Encrypt Share Key**: Encrypt share key with recipient's RSA public key
4. **Send Package**: `{encryptedCase, encryptedShareKey, permissions, expiry}`

```typescript
async function createSecureShare(caseData, recipientPublicKey, permissions) {
  // Generate random share key
  const shareKey = crypto.getRandomValues(new Uint8Array(32));
  
  // Encrypt case data with share key
  const encryptedCase = await encryptData(caseData, shareKey);
  
  // Encrypt share key with recipient's public key
  const encryptedShareKey = await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256'
    },
    recipientPublicKey,
    shareKey
  );
  
  return {
    encryptedCase,
    encryptedShareKey,
    permissions,
    expiry: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    shareId: generateRandomId()
  };
}
```

## Zero-Knowledge Authentication

Users authenticate without the server ever knowing their password.

### Registration

```typescript
// Client-side
const password = userInput;
const authSalt = crypto.getRandomValues(new Uint8Array(32));
const masterKey = await argon2id(password, authSalt);

// Derive authentication key
const authKey = await hkdf(masterKey, 'authentication-key', 32);

// Create verifier (server stores this, not password)
const verifier = await hash(authKey + serverChallenge);

// Send to server: { userId, authSalt, verifier }
```

### Login

```typescript
// Client receives challenge from server
const serverChallenge = await api.getChallenge(userId);

// Client derives auth key from password
const password = userInput;
const authSalt = await api.getAuthSalt(userId);
const masterKey = await argon2id(password, authSalt);
const authKey = await hkdf(masterKey, 'authentication-key', 32);

// Generate proof
const proof = await hash(authKey + serverChallenge);

// Send proof to server (doesn't reveal password or key)
const session = await api.login(userId, proof);
```

## Offline Security

### IndexedDB Encryption

All data in IndexedDB is encrypted before storage:

```typescript
interface EncryptedRecord {
  id: string;                  // Unencrypted ID for indexing
  nonce: Uint8Array;          // Random nonce (96 bits)
  ciphertext: Uint8Array;     // Encrypted data
  tag: Uint8Array;            // Authentication tag (128 bits)
  metadata: {                 // Minimal unencrypted metadata
    type: 'case' | 'evidence' | 'document';
    createdAt: number;        // Timestamp
    version: number;          // Schema version
  };
}
```

### Service Worker Cache

Service worker caches legal information (laws, rights) in plaintext for offline access. This is public information, not user data.

## Evidence Integrity

### Chain of Custody

Each piece of evidence has cryptographic proof:

```typescript
interface Evidence {
  id: string;
  type: 'photo' | 'audio' | 'video' | 'document';
  encryptedData: Uint8Array;
  metadata: {
    timestamp: number;           // When captured
    location?: GPSCoordinates;   // Where captured (optional)
    device: string;              // Device fingerprint
    hash: string;                // SHA-512 of original data
    signature: string;           // Digital signature
  };
  chainOfCustody: ChainEntry[]; // Audit trail
}

interface ChainEntry {
  action: 'created' | 'viewed' | 'exported' | 'shared';
  timestamp: number;
  actor: string;               // User ID (encrypted)
  hash: string;                // Hash of evidence at this point
  signature: string;           // Signature proving integrity
}
```

### Tamper Detection

```typescript
async function verifyIntegrity(evidence: Evidence): Promise<boolean> {
  // Decrypt evidence
  const decrypted = await decryptData(evidence.encryptedData, masterKey);
  
  // Calculate hash
  const currentHash = await sha512(decrypted);
  
  // Compare with original hash
  if (currentHash !== evidence.metadata.hash) {
    throw new Error('Evidence has been tampered with!');
  }
  
  // Verify chain of custody signatures
  for (const entry of evidence.chainOfCustody) {
    const valid = await verifySignature(entry);
    if (!valid) {
      throw new Error(`Invalid signature at ${entry.timestamp}`);
    }
  }
  
  return true;
}
```

## Emergency Security Features

### Panic Mode

When activated:
1. **Lock UI**: Require re-authentication
2. **Hide Sensitive**: Switch to benign-looking screen
3. **Disable Notifications**: Stop all push notifications
4. **Record Evidence**: Start encrypted audio/video recording
5. **Alert Contacts**: Send encrypted alert to emergency contacts

### Duress Code

Alternative password that triggers:
1. **Appear Normal**: Log in normally to avoid suspicion
2. **Wipe Keys**: Destroy all encryption keys
3. **Corrupt Data**: Overwrite sensitive data with random bytes
4. **Delete Metadata**: Remove all audit trails
5. **Success Appearance**: Show empty/decoy account

```typescript
async function handleLogin(password: string) {
  const isDuress = await checkDuressCode(password);
  
  if (isDuress) {
    // Appear normal
    await showLoadingScreen();
    
    // Securely wipe everything
    await wipeAllKeys();
    await overwriteIndexedDB();
    await clearServiceWorkerCache();
    await deleteLocalStorage();
    
    // Show decoy empty account
    await showDecoyAccount();
  } else {
    // Normal login
    await normalLogin(password);
  }
}
```

### Secure Delete

```typescript
async function secureDelete(data: Uint8Array) {
  // Overwrite with random data 3 times (DoD 5220.22-M)
  for (let i = 0; i < 3; i++) {
    crypto.getRandomValues(data);
    await forceWrite(data);
  }
  
  // Final overwrite with zeros
  data.fill(0);
  await forceWrite(data);
  
  // Delete reference
  data = null;
  
  // Force garbage collection (if possible)
  if (global.gc) global.gc();
}
```

## Network Security

### Tor/VPN Compatibility

- All API calls work over Tor/VPN
- No DNS leaks (all requests to same domain)
- No WebRTC leaks (disabled in emergency mode)
- No timing attacks (constant-time crypto operations)

### Metadata Minimization

Server logs only:
- Encrypted blob IDs (random UUIDs)
- Approximate timestamps (rounded to hour)
- No IP addresses (proxy through Tor/VPN)
- No user agents
- No referrers

## Audit & Compliance

### Security Audits

- **Quarterly**: External penetration testing
- **Monthly**: Automated security scanning
- **Continuous**: Dependency vulnerability monitoring

### Compliance (faktisk status)

- ⏳ **GDPR**: Delvis. Server-side kryptering finnes, men «rett til å bli glemt», databehandleravtale,
  personvernerklæring og cookie-samtykke gjenstår før reell etterlevelse.
- ⏳ **EMK artikkel 8 (rett til privatliv)**: Målsetting; avhenger av at kryptering/zero-knowledge fullføres.
- ⏳ **Personopplysningsloven**: Ikke oppfylt ennå.
- ❌ **Advokat–klient-privilegium**: Ikke etablert i kode; krever egen juridisk vurdering.

## Known Limitations

1. **Browser Security**: Relies on browser's crypto implementation
2. **Side Channels**: Potential timing attacks on crypto operations
3. **Physical Access**: Device seizure before lock = data exposed
4. **Social Engineering**: Users can be tricked into sharing passwords
5. **Malware**: Keyloggers can capture passwords before encryption

## Mitigation Strategies

1. Use hardware security keys (WebAuthn) for 2FA
2. Constant-time crypto operations where possible
3. Auto-lock after inactivity
4. User security training and warnings
5. Regular security audits and updates
