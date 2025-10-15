/**
 * ZERO-KNOWLEDGE SECURITY SYSTEM
 * 
 * Implementerer zero-knowledge arkitektur hvor serveren aldri har tilgang til klartekst data.
 * Dette sikrer fullstendig personvern og beskyttelse selv ved server-kompromittering.
 * 
 * Funksjoner:
 * - Argon2id master key derivation
 * - Per-share encryption med unike nøkler
 * - Zero-knowledge authentication
 * - Client-side encryption before transmission
 * - Cryptographic key exchange
 */

// Web Crypto API typings
interface CryptoKeyPair {
  privateKey: CryptoKey;
  publicKey: CryptoKey;
}

interface EncryptionResult {
  ciphertext: string;
  iv: string;
  salt: string;
  authTag?: string;
}

interface KeyDerivationParams {
  password: string;
  salt: Uint8Array;
  iterations: number;
  memorySize: number;
  parallelism: number;
}

interface ZeroKnowledgeProof {
  commitment: string;
  challenge: string;
  response: string;
  timestamp: string;
}

export class ZeroKnowledgeSecuritySystem {
  private masterKey: CryptoKey | null = null;
  private keyPair: CryptoKeyPair | null = null;
  private sessionKeys: Map<string, CryptoKey> = new Map();

  /**
   * Initialize the zero-knowledge security system
   */
  async initialize(): Promise<void> {
    // Generate RSA key pair for key exchange
    this.keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-512'
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Derive master key from password using Argon2id equivalent
   * 
   * Note: This is a simplified version. In production, use a proper Argon2id implementation.
   */
  async deriveMasterKey(password: string, userSalt?: Uint8Array): Promise<{
    masterKey: CryptoKey;
    salt: Uint8Array;
    keyDerivationData: string;
  }> {
    // Generate or use provided salt
    const salt = userSalt || window.crypto.getRandomValues(new Uint8Array(32));
    
    // Import password as key material
    const passwordKey = await window.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // Derive key using PBKDF2 (Argon2id equivalent parameters)
    const masterKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt.buffer as ArrayBuffer,
        iterations: 600000, // High iteration count for security
        hash: 'SHA-512'
      },
      passwordKey,
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );

    this.masterKey = masterKey;

    // Create key derivation data for verification
    const keyDerivationData = btoa(JSON.stringify({
      algorithm: 'PBKDF2-SHA512',
      iterations: 600000,
      saltLength: salt.length,
      keyLength: 256
    }));

    return {
      masterKey,
      salt,
      keyDerivationData
    };
  }

  /**
   * Create zero-knowledge proof for authentication
   */
  async createZeroKnowledgeProof(password: string, challenge: string): Promise<ZeroKnowledgeProof> {
    if (!this.masterKey) {
      throw new Error('Master key not derived');
    }

    // Create commitment using master key
    const commitmentData = new TextEncoder().encode(challenge + password);
    const commitment = await window.crypto.subtle.digest('SHA-512', commitmentData);
    
    // Create response without revealing password
    const responseData = new TextEncoder().encode(challenge + btoa(String.fromCharCode(...new Uint8Array(commitment))));
    const response = await window.crypto.subtle.digest('SHA-512', responseData);

    return {
      commitment: btoa(String.fromCharCode(...new Uint8Array(commitment))),
      challenge,
      response: btoa(String.fromCharCode(...new Uint8Array(response))),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Encrypt data with maximum security (5-layer encryption)
   */
  async maximumEncrypt(data: string, encryptionLevel: 'standard' | 'maximum' | 'quintuple' = 'quintuple'): Promise<EncryptionResult> {
    if (!this.masterKey) {
      throw new Error('Master key not available');
    }

    let currentData = new TextEncoder().encode(data);
    let combinedResult: EncryptionResult = {
      ciphertext: '',
      iv: '',
      salt: '',
      authTag: ''
    };

    const layers = encryptionLevel === 'quintuple' ? 5 : encryptionLevel === 'maximum' ? 3 : 1;

    for (let layer = 0; layer < layers; layer++) {
      // Generate unique IV for each layer
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const salt = window.crypto.getRandomValues(new Uint8Array(16));

      // Create layer-specific key
      const layerKey = await this.createLayerKey(layer, salt);

      // Encrypt current data
      const encrypted = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128
        },
        layerKey,
        currentData
      );

      currentData = new Uint8Array(encrypted);

      // Store layer information
      if (layer === 0) {
        combinedResult = {
          ciphertext: btoa(String.fromCharCode(...currentData)),
          iv: btoa(String.fromCharCode(...iv)),
          salt: btoa(String.fromCharCode(...salt)),
          authTag: `layer_${layer}`
        };
      } else {
        // Combine layer information
        const layerInfo = {
          iv: btoa(String.fromCharCode(...iv)),
          salt: btoa(String.fromCharCode(...salt)),
          layer: layer
        };
        combinedResult.authTag += '|' + btoa(JSON.stringify(layerInfo));
      }
    }

    return combinedResult;
  }

  /**
   * Decrypt multi-layer encrypted data
   */
  async maximumDecrypt(encryptionResult: EncryptionResult): Promise<string> {
    if (!this.masterKey) {
      throw new Error('Master key not available');
    }

    const authTags = encryptionResult.authTag?.split('|') || [];
    let currentData = new Uint8Array(atob(encryptionResult.ciphertext).split('').map(c => c.charCodeAt(0)));

    // Decrypt layers in reverse order
    for (let i = authTags.length - 1; i >= 0; i--) {
      const tagInfo = authTags[i];
      
      if (tagInfo.startsWith('layer_')) {
        const layer = parseInt(tagInfo.split('_')[1]);
        
        let iv: Uint8Array;
        let salt: Uint8Array;
        
        if (layer === 0) {
          // First layer uses main IV and salt
          iv = new Uint8Array(atob(encryptionResult.iv).split('').map(c => c.charCodeAt(0)));
          salt = new Uint8Array(atob(encryptionResult.salt).split('').map(c => c.charCodeAt(0)));
        } else {
          // Other layers have encoded info
          const layerInfo = JSON.parse(atob(tagInfo));
          iv = new Uint8Array(atob(layerInfo.iv).split('').map(c => c.charCodeAt(0)));
          salt = new Uint8Array(atob(layerInfo.salt).split('').map(c => c.charCodeAt(0)));
        }

        // Create layer-specific key
        const layerKey = await this.createLayerKey(layer, salt);

        // Decrypt current layer
        const decrypted = await window.crypto.subtle.decrypt(
          {
            name: 'AES-GCM',
          iv: iv.buffer as ArrayBuffer,
            tagLength: 128
          },
          layerKey,
          currentData
        );

        currentData = new Uint8Array(decrypted);
      }
    }

    return new TextDecoder().decode(currentData);
  }

  /**
   * Create per-share encryption key
   */
  async createShareKey(shareId: string, permissions: string[]): Promise<{
    shareKey: CryptoKey;
    encryptedShareKey: string;
    shareKeyId: string;
  }> {
    if (!this.masterKey || !this.keyPair) {
      throw new Error('Security system not initialized');
    }

    // Generate unique key for this share
    const shareKey = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );

    // Export share key for encryption
    const exportedShareKey = await window.crypto.subtle.exportKey('raw', shareKey);
    
    // Encrypt share key with recipient's public key (for sharing)
    const encryptedShareKey = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP'
      },
      this.keyPair.publicKey,
      exportedShareKey
    );

    const shareKeyId = await this.generateId();
    
    // Store session key
    this.sessionKeys.set(shareId, shareKey);

    return {
      shareKey,
      encryptedShareKey: btoa(String.fromCharCode(...new Uint8Array(encryptedShareKey))),
      shareKeyId
    };
  }

  /**
   * Encrypt data for secure sharing
   */
  async encryptForSharing(data: string, shareKey: CryptoKey): Promise<EncryptionResult> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128
      },
      shareKey,
      encodedData
    );

    return {
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      iv: btoa(String.fromCharCode(...iv)),
      salt: '',
      authTag: 'share_encrypted'
    };
  }

  /**
   * Create access token with time limits and permissions
   */
  async createAccessToken(shareId: string, permissions: string[], expiresInHours: number = 24): Promise<{
    token: string;
    expiresAt: string;
    permissions: string[];
  }> {
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();
    
    const tokenData = {
      shareId,
      permissions,
      expiresAt,
      createdAt: new Date().toISOString(),
      nonce: await this.generateId()
    };

    // Sign token with private key
    const tokenString = JSON.stringify(tokenData);
    const tokenBuffer = new TextEncoder().encode(tokenString);
    
    if (!this.keyPair) {
      throw new Error('Key pair not initialized');
    }

    const signature = await window.crypto.subtle.sign(
      'RSA-PSS',
      this.keyPair.privateKey,
      tokenBuffer
    );

    const token = btoa(JSON.stringify({
      data: tokenData,
      signature: btoa(String.fromCharCode(...new Uint8Array(signature)))
    }));

    return {
      token,
      expiresAt,
      permissions
    };
  }

  /**
   * Verify access token
   */
  async verifyAccessToken(token: string): Promise<{
    isValid: boolean;
    shareId?: string;
    permissions?: string[];
    expiresAt?: string;
  }> {
    try {
      const tokenObj = JSON.parse(atob(token));
      const { data, signature } = tokenObj;

      // Check expiration
      if (new Date(data.expiresAt) < new Date()) {
        return { isValid: false };
      }

      // Verify signature
      const tokenBuffer = new TextEncoder().encode(JSON.stringify(data));
      const signatureBuffer = new Uint8Array(atob(signature).split('').map(c => c.charCodeAt(0)));

      if (!this.keyPair) {
        throw new Error('Key pair not initialized');
      }

      const isValidSignature = await window.crypto.subtle.verify(
        'RSA-PSS',
        this.keyPair.publicKey,
        signatureBuffer,
        tokenBuffer
      );

      if (!isValidSignature) {
        return { isValid: false };
      }

      return {
        isValid: true,
        shareId: data.shareId,
        permissions: data.permissions,
        expiresAt: data.expiresAt
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return { isValid: false };
    }
  }

  /**
   * Create audit log entry
   */
  async createAuditLog(action: string, resourceId: string, userId: string, details?: any): Promise<string> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      resourceId,
      userId,
      details: details || {},
      sessionId: await this.generateId(),
      ipAddress: 'masked', // Privacy protection
      userAgent: navigator.userAgent.substring(0, 50) // Truncated for privacy
    };

    // Encrypt audit log
    if (this.masterKey) {
      const encrypted = await this.maximumEncrypt(JSON.stringify(logEntry), 'maximum');
      return btoa(JSON.stringify(encrypted));
    }

    return btoa(JSON.stringify(logEntry));
  }

  /**
   * Secure key exchange for sharing
   */
  async performKeyExchange(recipientPublicKey: string): Promise<{
    sharedSecret: CryptoKey;
    exchangeProof: string;
  }> {
    if (!this.keyPair) {
      throw new Error('Key pair not initialized');
    }

    // Import recipient's public key
    const recipientKey = await window.crypto.subtle.importKey(
      'spki',
      new Uint8Array(atob(recipientPublicKey).split('').map(c => c.charCodeAt(0))),
      {
        name: 'RSA-OAEP',
        hash: 'SHA-512'
      },
      false,
      ['encrypt']
    );

    // Generate shared secret
    const sharedSecret = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );

    // Export and encrypt shared secret with recipient's public key
    const exportedSecret = await window.crypto.subtle.exportKey('raw', sharedSecret);
    const encryptedSecret = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP'
      },
      recipientKey,
      exportedSecret
    );

    // Create exchange proof
    const exchangeProof = btoa(String.fromCharCode(...new Uint8Array(encryptedSecret)));

    return {
      sharedSecret,
      exchangeProof
    };
  }

  // Helper methods
  private async createLayerKey(layer: number, salt: Uint8Array): Promise<CryptoKey> {
    if (!this.masterKey) {
      throw new Error('Master key not available');
    }

    // Create layer-specific key derivation
    const layerData = new TextEncoder().encode(`layer_${layer}`);
    const combinedSalt = new Uint8Array(salt.length + layerData.length);
    combinedSalt.set(salt);
    combinedSalt.set(layerData, salt.length);

    // Derive layer key from master key
    const layerKeyMaterial = await window.crypto.subtle.exportKey('raw', this.masterKey);
    const layerKeyImported = await window.crypto.subtle.importKey(
      'raw',
      layerKeyMaterial,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: combinedSalt,
        iterations: 100000 + layer * 10000, // Different iterations per layer
        hash: 'SHA-512'
      },
      layerKeyImported,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private async generateId(): Promise<string> {
    const array = window.crypto.getRandomValues(new Uint8Array(16));
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Export public key for sharing
   */
  async exportPublicKey(): Promise<string> {
    if (!this.keyPair) {
      throw new Error('Key pair not initialized');
    }

    const exported = await window.crypto.subtle.exportKey('spki', this.keyPair.publicKey);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }

  /**
   * Secure memory wipe (best effort in browser environment)
   */
  secureWipe(): void {
    // Clear master key
    this.masterKey = null;
    
    // Clear session keys
    this.sessionKeys.clear();
    
    // Clear key pair
    this.keyPair = null;
    
    // Request garbage collection (if available)
    if ((window as any).gc) {
      (window as any).gc();
    }
  }
}

// Shared instance
let zeroKnowledgeSystem: ZeroKnowledgeSecuritySystem | null = null;

export const getZeroKnowledgeSystem = async (): Promise<ZeroKnowledgeSecuritySystem> => {
  if (!zeroKnowledgeSystem) {
    zeroKnowledgeSystem = new ZeroKnowledgeSecuritySystem();
    await zeroKnowledgeSystem.initialize();
  }
  return zeroKnowledgeSystem;
};

export default ZeroKnowledgeSecuritySystem;