/**
 * Master Key Management
 * 
 * Handles derivation, storage, and management of the user's master encryption key.
 * Uses Argon2id for password-based key derivation.
 */

import { hash, argon2id } from 'argon2-browser';

export interface MasterKeyConfig {
  password: string;
  salt?: Uint8Array;
  memory?: number;      // KiB
  iterations?: number;
  parallelism?: number;
  hashLength?: number;  // bytes
}

export interface DerivedKey {
  key: Uint8Array;
  salt: Uint8Array;
  config: {
    memory: number;
    iterations: number;
    parallelism: number;
    hashLength: number;
  };
}

/**
 * Default Argon2id parameters
 * Balanced for security and performance on modern devices
 */
const DEFAULT_CONFIG = {
  memory: 65536,      // 64 MB
  iterations: 3,      // 3 iterations
  parallelism: 4,     // 4 threads
  hashLength: 32      // 256 bits
};

/**
 * Derives a master key from password using Argon2id
 */
export async function deriveMasterKey(config: MasterKeyConfig): Promise<DerivedKey> {
  const {
    password,
    salt = crypto.getRandomValues(new Uint8Array(32)),
    memory = DEFAULT_CONFIG.memory,
    iterations = DEFAULT_CONFIG.iterations,
    parallelism = DEFAULT_CONFIG.parallelism,
    hashLength = DEFAULT_CONFIG.hashLength
  } = config;

  try {
    const result = await hash({
      pass: password,
      salt: salt,
      type: argon2id,
      time: iterations,
      mem: memory,
      parallelism: parallelism,
      hashLen: hashLength
    });

    return {
      key: result.hash,
      salt: salt,
      config: {
        memory,
        iterations,
        parallelism,
        hashLength
      }
    };
  } catch (error) {
    console.error('Failed to derive master key:', error);
    throw new Error('Master key derivation failed');
  }
}

/**
 * Re-derives a master key from password and stored salt
 * Used during login to reconstruct the master key
 */
export async function reDeriveMasterKey(
  password: string,
  salt: Uint8Array,
  config: DerivedKey['config']
): Promise<Uint8Array> {
  const result = await hash({
    pass: password,
    salt: salt,
    type: argon2id,
    time: config.iterations,
    mem: config.memory,
    parallelism: config.parallelism,
    hashLen: config.hashLength
  });

  return result.hash;
}

/**
 * Stores master key configuration (NOT the key itself) in localStorage
 * Only stores salt and derivation parameters
 */
export function storeMasterKeyConfig(userId: string, derivedKey: DerivedKey): void {
  const config = {
    salt: Array.from(derivedKey.salt),
    ...derivedKey.config
  };

  localStorage.setItem(`mk_config_${userId}`, JSON.stringify(config));
}

/**
 * Retrieves master key configuration from localStorage
 */
export function getMasterKeyConfig(userId: string): DerivedKey['config'] & { salt: Uint8Array } | null {
  const configStr = localStorage.getItem(`mk_config_${userId}`);
  if (!configStr) return null;

  const config = JSON.parse(configStr);
  return {
    ...config,
    salt: new Uint8Array(config.salt)
  };
}

/**
 * Securely wipes a key from memory
 * Overwrites the array with random data, then zeros
 */
export function secureWipeKey(key: Uint8Array): void {
  // Overwrite with random data
  crypto.getRandomValues(key);
  
  // Overwrite with zeros
  key.fill(0);
}

/**
 * Derives a sub-key for specific purposes (e.g., authentication, encryption)
 * Uses HKDF (HMAC-based Key Derivation Function)
 */
export async function deriveSubKey(
  masterKey: Uint8Array,
  purpose: string,
  length: number = 32
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const info = encoder.encode(purpose);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    masterKey,
    { name: 'HKDF' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(32), // Static salt for deterministic sub-keys
      info: info
    },
    cryptoKey,
    length * 8
  );

  return new Uint8Array(derivedBits);
}

/**
 * Checks if password meets minimum security requirements
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push('Passord må være minst 12 tegn');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Passord må inneholde små bokstaver');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Passord må inneholde store bokstaver');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Passord må inneholde tall');
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Passord må inneholde spesialtegn');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * In-memory key storage (cleared on page refresh for security)
 * Never persists to disk
 */
class MasterKeyStore {
  private key: Uint8Array | null = null;
  private timeout: NodeJS.Timeout | null = null;

  /**
   * Store master key in memory
   * Auto-clears after timeout (default 30 minutes)
   */
  set(key: Uint8Array, timeoutMs: number = 30 * 60 * 1000): void {
    this.clear();
    this.key = new Uint8Array(key);

    this.timeout = setTimeout(() => {
      this.clear();
    }, timeoutMs);
  }

  /**
   * Get master key from memory
   */
  get(): Uint8Array | null {
    return this.key;
  }

  /**
   * Check if key is stored
   */
  has(): boolean {
    return this.key !== null;
  }

  /**
   * Clear master key from memory
   */
  clear(): void {
    if (this.key) {
      secureWipeKey(this.key);
      this.key = null;
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

export const masterKeyStore = new MasterKeyStore();
