/**
 * Secure Storage Module
 * 
 * Handles encrypted storage in IndexedDB.
 * All data is encrypted before being stored locally.
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { encryptObject, decryptObject, EncryptedBlob } from './dataEncryption';

// Database schema
interface RettBotDB extends DBSchema {
  cases: {
    key: string;
    value: EncryptedCaseData;
    indexes: { 'by-date': number };
  };
  evidence: {
    key: string;
    value: EncryptedEvidenceData;
    indexes: { 'by-case': string; 'by-date': number };
  };
  documents: {
    key: string;
    value: EncryptedDocumentData;
    indexes: { 'by-case': string; 'by-type': string };
  };
  settings: {
    key: string;
    value: EncryptedBlob;
  };
}

interface EncryptedCaseData {
  id: string;
  encrypted: EncryptedBlob;
  metadata: {
    createdAt: number;
    updatedAt: number;
    version: number;
  };
}

interface EncryptedEvidenceData {
  id: string;
  caseId: string;
  encrypted: EncryptedBlob;
  metadata: {
    type: 'photo' | 'audio' | 'video' | 'document';
    createdAt: number;
    size: number;
  };
}

interface EncryptedDocumentData {
  id: string;
  caseId: string;
  type: string;
  encrypted: EncryptedBlob;
  metadata: {
    createdAt: number;
    version: number;
  };
}

const DB_NAME = 'rettbot-plus';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<RettBotDB> | null = null;

/**
 * Initialize the IndexedDB database
 */
export async function initDatabase(): Promise<IDBPDatabase<RettBotDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<RettBotDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Cases store
      const caseStore = db.createObjectStore('cases', { keyPath: 'id' });
      caseStore.createIndex('by-date', 'metadata.createdAt');

      // Evidence store
      const evidenceStore = db.createObjectStore('evidence', { keyPath: 'id' });
      evidenceStore.createIndex('by-case', 'caseId');
      evidenceStore.createIndex('by-date', 'metadata.createdAt');

      // Documents store
      const docStore = db.createObjectStore('documents', { keyPath: 'id' });
      docStore.createIndex('by-case', 'caseId');
      docStore.createIndex('by-type', 'type');

      // Settings store
      db.createObjectStore('settings');
    }
  });

  return dbInstance;
}

/**
 * Store a case (encrypted)
 */
export async function storeCase<T>(
  caseId: string,
  caseData: T,
  masterKey: Uint8Array
): Promise<void> {
  const db = await initDatabase();
  
  const encrypted = await encryptObject(caseData, masterKey);
  
  const record: EncryptedCaseData = {
    id: caseId,
    encrypted,
    metadata: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1
    }
  };

  await db.put('cases', record);
}

/**
 * Retrieve a case (decrypt)
 */
export async function getCase<T>(
  caseId: string,
  masterKey: Uint8Array
): Promise<T | null> {
  const db = await initDatabase();
  const record = await db.get('cases', caseId);
  
  if (!record) return null;

  return await decryptObject<T>(record.encrypted, masterKey);
}

/**
 * List all cases (metadata only, no decryption)
 */
export async function listCases(): Promise<Array<{ id: string; createdAt: number }>> {
  const db = await initDatabase();
  const allCases = await db.getAll('cases');
  
  return allCases.map(c => ({
    id: c.id,
    createdAt: c.metadata.createdAt
  }));
}

/**
 * Delete a case
 */
export async function deleteCase(caseId: string): Promise<void> {
  const db = await initDatabase();
  await db.delete('cases', caseId);
  
  // Also delete associated evidence and documents
  const evidence = await db.getAllFromIndex('evidence', 'by-case', caseId);
  for (const ev of evidence) {
    await db.delete('evidence', ev.id);
  }
  
  const docs = await db.getAllFromIndex('documents', 'by-case', caseId);
  for (const doc of docs) {
    await db.delete('documents', doc.id);
  }
}

/**
 * Store evidence (encrypted)
 */
export async function storeEvidence<T>(
  evidenceId: string,
  caseId: string,
  evidenceData: T,
  type: EncryptedEvidenceData['metadata']['type'],
  masterKey: Uint8Array
): Promise<void> {
  const db = await initDatabase();
  
  const encrypted = await encryptObject(evidenceData, masterKey);
  
  const record: EncryptedEvidenceData = {
    id: evidenceId,
    caseId,
    encrypted,
    metadata: {
      type,
      createdAt: Date.now(),
      size: JSON.stringify(evidenceData).length
    }
  };

  await db.put('evidence', record);
}

/**
 * Get evidence by case
 */
export async function getEvidenceByCase<T>(
  caseId: string,
  masterKey: Uint8Array
): Promise<T[]> {
  const db = await initDatabase();
  const evidence = await db.getAllFromIndex('evidence', 'by-case', caseId);
  
  const decrypted = await Promise.all(
    evidence.map(ev => decryptObject<T>(ev.encrypted, masterKey))
  );
  
  return decrypted;
}

/**
 * Store document (encrypted)
 */
export async function storeDocument<T>(
  documentId: string,
  caseId: string,
  documentType: string,
  documentData: T,
  masterKey: Uint8Array
): Promise<void> {
  const db = await initDatabase();
  
  const encrypted = await encryptObject(documentData, masterKey);
  
  const record: EncryptedDocumentData = {
    id: documentId,
    caseId,
    type: documentType,
    encrypted,
    metadata: {
      createdAt: Date.now(),
      version: 1
    }
  };

  await db.put('documents', record);
}

/**
 * Get documents by case
 */
export async function getDocumentsByCase<T>(
  caseId: string,
  masterKey: Uint8Array
): Promise<T[]> {
  const db = await initDatabase();
  const docs = await db.getAllFromIndex('documents', 'by-case', caseId);
  
  const decrypted = await Promise.all(
    docs.map(doc => decryptObject<T>(doc.encrypted, masterKey))
  );
  
  return decrypted;
}

/**
 * Store user settings (encrypted)
 */
export async function storeSettings<T>(
  key: string,
  settings: T,
  masterKey: Uint8Array
): Promise<void> {
  const db = await initDatabase();
  const encrypted = await encryptObject(settings, masterKey);
  await db.put('settings', encrypted, key);
}

/**
 * Get user settings (decrypt)
 */
export async function getSettings<T>(
  key: string,
  masterKey: Uint8Array
): Promise<T | null> {
  const db = await initDatabase();
  const encrypted = await db.get('settings', key);
  
  if (!encrypted) return null;

  return await decryptObject<T>(encrypted, masterKey);
}

/**
 * Clear all data (nuclear option / duress code)
 */
export async function clearAllData(): Promise<void> {
  const db = await initDatabase();
  
  // Clear all object stores
  await db.clear('cases');
  await db.clear('evidence');
  await db.clear('documents');
  await db.clear('settings');
  
  // Also clear localStorage
  localStorage.clear();
  
  // Close and delete database
  db.close();
  await indexedDB.deleteDatabase(DB_NAME);
  
  dbInstance = null;
}

/**
 * Export all data (for backup)
 */
export async function exportAllData(masterKey: Uint8Array): Promise<string> {
  const db = await initDatabase();
  
  const cases = await db.getAll('cases');
  const evidence = await db.getAll('evidence');
  const documents = await db.getAll('documents');
  
  const backup = {
    version: DB_VERSION,
    timestamp: Date.now(),
    cases,
    evidence,
    documents
  };
  
  // Encrypt entire backup
  const encrypted = await encryptObject(backup, masterKey);
  
  return JSON.stringify(encrypted);
}

/**
 * Import data from backup
 */
export async function importData(
  backupJson: string,
  masterKey: Uint8Array
): Promise<void> {
  const encrypted = JSON.parse(backupJson);
  const backup = await decryptObject<any>(encrypted, masterKey);
  
  const db = await initDatabase();
  
  // Restore cases
  for (const caseData of backup.cases) {
    await db.put('cases', caseData);
  }
  
  // Restore evidence
  for (const evidenceData of backup.evidence) {
    await db.put('evidence', evidenceData);
  }
  
  // Restore documents
  for (const documentData of backup.documents) {
    await db.put('documents', documentData);
  }
}
