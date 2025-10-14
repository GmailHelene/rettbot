/**
 * Data Encryption Module
 * 
 * Handles AES-256-GCM encryption and decryption of user data.
 * All encryption happens client-side before data leaves the device.
 */

export interface EncryptedData {
  nonce: Uint8Array;      // 96-bit random nonce
  ciphertext: Uint8Array; // Encrypted data
  tag: Uint8Array;        // 128-bit authentication tag
}

export interface EncryptedBlob {
  nonce: string;          // Base64-encoded nonce
  ciphertext: string;     // Base64-encoded ciphertext
  tag: string;            // Base64-encoded tag
  version: number;        // Schema version
}

/**
 * Encrypts data using AES-256-GCM
 * 
 * @param plaintext - Data to encrypt (string or Uint8Array)
 * @param masterKey - 256-bit encryption key
 * @returns Encrypted data with nonce and tag
 */
export async function encryptData(
  plaintext: string | Uint8Array,
  masterKey: Uint8Array
): Promise<EncryptedData> {
  // Convert string to Uint8Array if needed
  const data = typeof plaintext === 'string' 
    ? new TextEncoder().encode(plaintext)
    : plaintext;

  // Generate random 96-bit nonce (12 bytes)
  const nonce = crypto.getRandomValues(new Uint8Array(12));

  // Import master key for AES-GCM
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    masterKey,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  // Encrypt with authenticated encryption
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
      tagLength: 128 // 128-bit authentication tag
    },
    cryptoKey,
    data
  );

  // AES-GCM output is ciphertext || tag
  const encryptedArray = new Uint8Array(encrypted);
  const ciphertext = encryptedArray.slice(0, -16); // All but last 16 bytes
  const tag = encryptedArray.slice(-16);           // Last 16 bytes

  return {
    nonce,
    ciphertext,
    tag
  };
}

/**
 * Decrypts AES-256-GCM encrypted data
 * 
 * @param encrypted - Encrypted data with nonce and tag
 * @param masterKey - 256-bit encryption key
 * @returns Decrypted plaintext as Uint8Array
 */
export async function decryptData(
  encrypted: EncryptedData,
  masterKey: Uint8Array
): Promise<Uint8Array> {
  // Import master key for AES-GCM
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    masterKey,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  // Concatenate ciphertext and tag
  const combined = new Uint8Array(encrypted.ciphertext.length + encrypted.tag.length);
  combined.set(encrypted.ciphertext);
  combined.set(encrypted.tag, encrypted.ciphertext.length);

  try {
    // Decrypt and verify authentication tag
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: encrypted.nonce,
        tagLength: 128
      },
      cryptoKey,
      combined
    );

    return new Uint8Array(decrypted);
  } catch (error) {
    // Authentication failed or wrong key
    throw new Error('Decryption failed: Invalid key or tampered data');
  }
}

/**
 * Encrypts data and returns as base64-encoded blob for storage/transmission
 */
export async function encryptToBlob(
  plaintext: string | Uint8Array,
  masterKey: Uint8Array
): Promise<EncryptedBlob> {
  const encrypted = await encryptData(plaintext, masterKey);

  return {
    nonce: arrayBufferToBase64(encrypted.nonce),
    ciphertext: arrayBufferToBase64(encrypted.ciphertext),
    tag: arrayBufferToBase64(encrypted.tag),
    version: 1 // Schema version for future compatibility
  };
}

/**
 * Decrypts a base64-encoded blob
 */
export async function decryptFromBlob(
  blob: EncryptedBlob,
  masterKey: Uint8Array
): Promise<string> {
  const encrypted: EncryptedData = {
    nonce: base64ToArrayBuffer(blob.nonce),
    ciphertext: base64ToArrayBuffer(blob.ciphertext),
    tag: base64ToArrayBuffer(blob.tag)
  };

  const decrypted = await decryptData(encrypted, masterKey);
  return new TextDecoder().decode(decrypted);
}

/**
 * Encrypts a JavaScript object as JSON
 */
export async function encryptObject<T>(
  obj: T,
  masterKey: Uint8Array
): Promise<EncryptedBlob> {
  const json = JSON.stringify(obj);
  return encryptToBlob(json, masterKey);
}

/**
 * Decrypts and parses a JSON object
 */
export async function decryptObject<T>(
  blob: EncryptedBlob,
  masterKey: Uint8Array
): Promise<T> {
  const json = await decryptFromBlob(blob, masterKey);
  return JSON.parse(json);
}

/**
 * Encrypts a file (for evidence uploads)
 */
export async function encryptFile(
  file: File,
  masterKey: Uint8Array
): Promise<{ encrypted: EncryptedBlob; metadata: FileMetadata }> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const encrypted = await encryptToBlob(uint8Array, masterKey);

  const metadata: FileMetadata = {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified
  };

  return { encrypted, metadata };
}

/**
 * Decrypts a file
 */
export async function decryptFile(
  encrypted: EncryptedBlob,
  metadata: FileMetadata,
  masterKey: Uint8Array
): Promise<File> {
  const encryptedData: EncryptedData = {
    nonce: base64ToArrayBuffer(encrypted.nonce),
    ciphertext: base64ToArrayBuffer(encrypted.ciphertext),
    tag: base64ToArrayBuffer(encrypted.tag)
  };

  const decrypted = await decryptData(encryptedData, masterKey);

  return new File([decrypted], metadata.name, {
    type: metadata.type,
    lastModified: metadata.lastModified
  });
}

// Helper types
interface FileMetadata {
  name: string;
  type: string;
  size: number;
  lastModified: number;
}

// Helper functions for base64 encoding/decoding
function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  const len = buffer.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generates a cryptographically secure random key
 * Used for per-share encryption keys
 */
export function generateRandomKey(length: number = 32): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Calculates SHA-512 hash of data
 * Used for evidence integrity verification
 */
export async function calculateHash(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Securely wipes data from memory
 */
export function secureWipe(data: Uint8Array): void {
  // Overwrite with random data
  crypto.getRandomValues(data);
  
  // Overwrite with zeros
  data.fill(0);
}
