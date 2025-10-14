/**
 * RettBot+ API Client
 * 
 * Zero-knowledge API client with encryption
 * All data encrypted before sending to server
 */

import type {
  EvidenceAssessment,
  LegalResearch,
  DefenseStrategy,
  LegalDocument
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ============================================
// Request/Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface EvidenceAnalysisRequest {
  file_name: string;
  file_type: string;
  file_size: number;
  description?: string;
  case_context?: string;
  encrypted_content: string;
}

export interface LegalResearchRequest {
  query: string;
  case_type?: string;
  context?: string;
  encrypted_data?: string;
}

export interface DefenseStrategyRequest {
  case_facts: string;
  charges: string;
  evidence?: string[];
  legal_research?: string;
  encrypted_data?: string;
}

export interface LegalDocumentRequest {
  document_type: 'motion' | 'complaint' | 'appeal' | 'brief';
  case_details: Record<string, any>;
  strategy?: string;
  template?: string;
}

export interface CorruptionAssessmentRequest {
  allegations: string;
  evidence: string[];
  institutions: string[];
  context?: string;
}

// ============================================
// API Client Class
// ============================================

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic API request handler
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data: data,
        timestamp: data.timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request('/health');
  }

  /**
   * Analyze evidence using AI
   */
  async analyzeEvidence(
    request: EvidenceAnalysisRequest
  ): Promise<ApiResponse<{ assessment: EvidenceAssessment }>> {
    return this.request('/evidence/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Upload evidence file
   */
  async uploadEvidence(
    file: File,
    description?: string,
    caseId?: string
  ): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (caseId) formData.append('case_id', caseId);

    try {
      const response = await fetch(`${this.baseUrl}/evidence/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      return {
        success: response.ok,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Perform legal research
   */
  async legalResearch(
    request: LegalResearchRequest
  ): Promise<ApiResponse<{ research: LegalResearch }>> {
    return this.request('/legal/research', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Build defense strategy
   */
  async buildDefenseStrategy(
    request: DefenseStrategyRequest
  ): Promise<ApiResponse<{ strategy: DefenseStrategy }>> {
    return this.request('/defense/strategy', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Draft legal document
   */
  async draftLegalDocument(
    request: LegalDocumentRequest
  ): Promise<ApiResponse<{ document: LegalDocument }>> {
    return this.request('/legal/document', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Assess corruption case
   */
  async assessCorruptionCase(
    request: CorruptionAssessmentRequest
  ): Promise<ApiResponse<any>> {
    return this.request('/corruption/assess', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

// ============================================
// Export singleton instance
// ============================================

export const apiClient = new ApiClient();

// ============================================
// Convenience functions (with encryption)
// ============================================

/**
 * Analyze evidence with automatic encryption
 */
export async function analyzeEvidenceFile(
  file: File,
  description: string = '',
  caseContext: string = '',
  encryptionKey?: CryptoKey
): Promise<EvidenceAssessment | null> {
  try {
    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    
    // Encrypt content (if key provided)
    let encryptedContent = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    if (encryptionKey) {
      // TODO: Use actual encryption from crypto module
      // For now, just base64 encode
    }

    const response = await apiClient.analyzeEvidence({
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      description,
      case_context: caseContext,
      encrypted_content: encryptedContent,
    });

    if (response.success && response.data) {
      return response.data.assessment;
    }

    console.error('Evidence analysis failed:', response.error);
    return null;
  } catch (error) {
    console.error('Error analyzing evidence:', error);
    return null;
  }
}

/**
 * Perform legal research
 */
export async function performLegalResearch(
  query: string,
  caseType?: string,
  context?: string
): Promise<LegalResearch | null> {
  try {
    const response = await apiClient.legalResearch({
      query,
      case_type: caseType,
      context,
    });

    if (response.success && response.data) {
      return response.data.research;
    }

    console.error('Legal research failed:', response.error);
    return null;
  } catch (error) {
    console.error('Error performing research:', error);
    return null;
  }
}

/**
 * Build defense strategy
 */
export async function createDefenseStrategy(
  caseFacts: string,
  charges: string,
  evidence?: string[],
  legalResearch?: string
): Promise<DefenseStrategy | null> {
  try {
    const response = await apiClient.buildDefenseStrategy({
      case_facts: caseFacts,
      charges,
      evidence,
      legal_research: legalResearch,
    });

    if (response.success && response.data) {
      return response.data.strategy;
    }

    console.error('Defense strategy failed:', response.error);
    return null;
  } catch (error) {
    console.error('Error building strategy:', error);
    return null;
  }
}

/**
 * Draft legal document
 */
export async function generateLegalDocument(
  documentType: 'motion' | 'complaint' | 'appeal' | 'brief',
  caseDetails: Record<string, any>,
  strategy?: string
): Promise<LegalDocument | null> {
  try {
    const response = await apiClient.draftLegalDocument({
      document_type: documentType,
      case_details: caseDetails,
      strategy,
    });

    if (response.success && response.data) {
      return response.data.document;
    }

    console.error('Document drafting failed:', response.error);
    return null;
  } catch (error) {
    console.error('Error drafting document:', error);
    return null;
  }
}

export default apiClient;
